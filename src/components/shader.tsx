import { Component, createSignal, JSX, onCleanup, onMount } from "solid-js";
import { scroll } from "motion";

const operations = `
  vec2 opSmoothUnion( vec2 d1, vec2 d2, float k ) {
    float h = clamp( 0.5 + 0.5*(d2.x-d1.x)/k, 0.0, 1.0 );
    float t = mix( d2.x, d1.x, h ) - k*h*(1.0-h);
    float m = mix( d2.y, d1.y, h );
    return vec2(t,m);
  }
  
  vec2 opSmoothSubtraction( vec2 d1, vec2 d2, float k ) {
      float h = clamp( 0.5 - 0.5*(d2.x+d1.x)/k, 0.0, 1.0 );
      float t = mix( d2.x, -d1.x, h ) + k*h*(1.0-h); 
      float m = d2.y;
      return vec2(t,m);
  }
  
  float opUnion( float d1, float d2 ) { return (d1<d2) ? d1 : d2; }
  vec2 opUnion( vec2 d1, vec2 d2 ) { return (d1.x<d2.x) ? d1 : d2; }
  
  vec2 opSubtraction( vec2 d1, vec2 d2 ) {
    float t = max(-d1.x, d2.x);
    return vec2(t,d2.y);
  }
  float opIntersection( float d1, float d2 ) { return max(d1,d2); }
`;

const distanceFunctions = `
  float sdTriPrism( vec3 p, vec2 h )
  {
    vec3 q = abs(p);
    return max(q.z-h.y,max(q.x*0.866025+p.y*0.5,-p.y)-h.x*0.5);
  }
  
  float sdBox( vec3 p, vec3 b )
  {
    vec3 q = abs(p) - b;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
  }
  
  float sdSphere( vec3 p, float s )
  {
    return length(p)-s;
  }
  
  float sdCappedCylinder( vec3 p, float h, float r )
  {
    vec2 d = abs(vec2(length(p.yz),p.x)) - vec2(r,h);
    return min(max(d.x,d.y),0.0) + length(max(d,0.0));
  }
  
  float sdArch ( vec3 p, vec3 size )
  {
    float cylinder = sdCappedCylinder(p, size.x, size.z);
    float box = sdBox(p + vec3(0.0, size.y, 0.0), size);
    return opUnion(box, cylinder);
  }
  
`;

const fragmentShaderSource = `
    precision mediump float;
    uniform float time;
    uniform float uRotation;
    uniform vec3 uResolution;
    uniform sampler2D noise;
    
    ${operations}
    
    ${distanceFunctions}
    
    vec2 map(vec3 pos)
    {
      vec3 spherePos = pos + vec3(0.0, (sin(time * 0.001) - 1.0) * 10.0, 0.0);
      vec2 outerBox = vec2(sdBox(pos + vec3(0.0,90.0,0.0), vec3(20.0, 100.0, 95.0)),0.3);
      
      float archY = 22.0;
      vec3 archSize = vec3(21.0, 100.0, 22.0);
      
      vec2 arch1 = vec2(sdArch(pos + vec3(0.0,archY,0.0), archSize), 0.0);
      vec2 arch2 = vec2(sdArch(pos + vec3(0.0,archY,60.0), archSize), 0.0);
      vec2 arch3 = vec2(sdArch(pos + vec3(0.0,archY,-60.0), archSize), 0.0);
        
      vec2 res = outerBox;
      res = opSubtraction(arch1,res);
      res = opSubtraction(arch2,res);
      res = opSubtraction(arch3,res);
      return res;
    } 
    
    vec3 rgb2hsv(vec3 c)
    {
        vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
        vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
        vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    
        float d = q.x - min(q.w, q.y);
        float e = 1.0e-10;
        return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
    }
    
    vec3 hsv2rgb(vec3 c)
    {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }
    
    vec3 getColour(float hue){
      return hsv2rgb(vec3(hue, 1.0, 1.0));
    }
    
    vec3 calcNormal(vec3 p )
    {
        const float h = 0.0001;
        const vec2 k = vec2(1.0,-1.0);
        return normalize( k.xyy*map( p + k.xyy*h ).x + 
                          k.yyx*map( p + k.yyx*h ).x + 
                          k.yxy*map( p + k.yxy*h ).x + 
                          k.xxx*map( p + k.xxx*h ).x );
    }
    
    #define BACKGROUND_COLOUR vec3(0.98, 0.929, 0.804)
    #define MAX_RAY_DISTANCE 200
    #define AA 2
    #define ORTHO_SIZE 150.0

    vec4 rayMarch(vec3 ro, vec3 rd, vec2 p){
      vec2 res = vec2(-1.0,-1.0);
      int j = 0;
      float t = 0.0;
      for(int i = 0; i < MAX_RAY_DISTANCE; i++)
      {
        vec2 h = map( ro+rd*t );
        if( abs(h.x)<(0.0001*t) )
        { 
            res = vec2(t,h.y); 
            break;
        }
        t += h.x;
        j++;
        if(j == MAX_RAY_DISTANCE){
          return vec4(0.0);
        }
      }
      t = res.x;
      float m = res.y;
      vec3 col = getColour(m);
      vec3 pos = ro + t*rd;
      vec3 nor = calcNormal( pos );
      
      vec3 lightDir = normalize(vec3(0.33,0.66,1.0));
      float diff = max(0.0, dot(nor, lightDir));
      col = col*diff;
      // return vec4(p.x > 0.0 ? col : nor,1.0);
      return vec4(col, 1.0);
    }
    
    void main(){
      vec4 tot = vec4(0.0);
      for( int m=0; m<AA; m++ )
      for( int n=0; n<AA; n++ )
      {
          vec2 o = vec2(float(m),float(n)) / float(AA) - 0.5;
          vec2 s_pos = (2.0*(gl_FragCoord.xy + o)-uResolution.xy)/uResolution.y;
          vec3 up = vec3(0.0, 1.0, 0.0);
          vec3 c_pos = vec3(ORTHO_SIZE);
          vec3 c_targ = vec3(0.0, 0.0, 0.0);
          vec3 c_dir = normalize(c_targ - c_pos);
          vec3 c_right = cross(c_dir, up);
          vec3 c_up = cross(c_right, c_dir);
          vec3 rd = normalize(c_dir);
          vec3 ro = c_pos + c_right * ORTHO_SIZE * s_pos.x + c_up * ORTHO_SIZE * s_pos.y;
          vec4 col = rayMarch(ro, rd, s_pos);
          tot += col;
      }
      tot /= float(AA*AA);
      gl_FragColor = tot;
    }
`;

const initBuffers = (gl: WebGLRenderingContext) => {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  return {
    position: positionBuffer,
  };
};

const loadShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) => {
  const shader = gl.createShader(type);

  if (!shader) {
    return;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      "An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader),
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
};

const initShaderProgram = (
  gl: WebGLRenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string,
) => {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  if (!vertexShader) {
    return;
  }
  const fragmentShader = loadShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource,
  );
  if (!fragmentShader) {
    return;
  }
  const shaderProgram = gl.createProgram();
  if (!shaderProgram) {
    return;
  }
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      "Unable to initialize the shader program: " +
        gl.getProgramInfoLog(shaderProgram),
    );
    return;
  }

  return shaderProgram;
};

const createTexture = (gl: WebGLRenderingContext, src: string) => {
  const image = new Image();
  image.src = src;
  image.onload = () => {
    // Create a texture.
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_S);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.TEXTURE_WRAP_T);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  };
};

const vertexShaderSource = `
  attribute vec4 aVertexPosition;
  
  void main() {
    gl_Position = aVertexPosition;
  }
`;

export const Shader: Component<{ style: JSX.CSSProperties }> = (props) => {
  let canvas: HTMLCanvasElement | undefined;
  let animationFrame: number;
  const [isDragging] = createSignal(false);
  const [rotation, setRotation] = createSignal(0);
  const handleDrag = () => {
    if (!isDragging()) {
      return;
    }
    // setRotation((prev) => prev + event.movementX);
  };

  scroll(
    ({ y }) => {
      setRotation(y.progress);
    },
    {
      smooth: 100,
    },
  );

  onMount(() => {
    if (!canvas) {
      return;
    }
    const gl = canvas.getContext("webgl");
    if (!gl) {
      throw new Error("No WebGl support on device");
    }
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const shaderProgram = initShaderProgram(
      gl,
      vertexShaderSource,
      fragmentShaderSource,
    );
    if (!shaderProgram) {
      return;
    }
    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      },
      uniformLocations: {
        resolution: gl.getUniformLocation(shaderProgram, "uResolution"),
        time: gl.getUniformLocation(shaderProgram, "time"),
        rotation: gl.getUniformLocation(shaderProgram, "uRotation"),
        backgroundColour: gl.getUniformLocation(shaderProgram, "uBackground"),
      },
    };

    createTexture(gl, `/img/noiseTexture.png`);

    const main = (time: number) => {
      if (!canvas) {
        return;
      }
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      const buffers = initBuffers(gl);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
      gl.clearDepth(1.0); // Clear everything
      gl.depthFunc(gl.LEQUAL); // Near things obscure far things
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      const numComponents = 2;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset,
      );
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
      gl.useProgram(programInfo.program);
      gl.uniform1f(programInfo.uniformLocations.rotation, rotation());
      gl.uniform1f(programInfo.uniformLocations.time, time);
      gl.uniform3f(
        programInfo.uniformLocations.resolution,
        canvas.width,
        canvas.height,
        1.0,
      );
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrame = window.requestAnimationFrame(main);
    };
    animationFrame = window.requestAnimationFrame(main);
    onCleanup(() => cancelAnimationFrame(animationFrame));
  });

  return (
    <canvas
      // onMouseDown={() => setIsDragging(true)}
      // onMouseUp={() => setIsDragging(false)}
      // onMouseLeave={() => setIsDragging(false)}
      onMouseMove={handleDrag}
      ref={canvas}
      {...props}
    />
  );
};
