import { Component, createSignal, onCleanup, onMount } from "solid-js";
import { scroll } from "motion";

const initBuffers = (gl) => {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  return {
    position: positionBuffer,
  };
};

const loadShader = (gl, type, source) => {
  const shader = gl.createShader(type);

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

const initShaderProgram = (gl, vertexShaderSource, fragmentShaderSource) => {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = loadShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource,
  );

  // Create the shader program
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      "Unable to initialize the shader program: " +
        gl.getProgramInfoLog(shaderProgram),
    );
    return null;
  }

  return shaderProgram;
};

const createTexture = (gl, src) => {
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

const fragmentShaderSource = `
    precision mediump float;
    uniform float time;
    uniform float uRotation;
    uniform vec3 uResolution;
    uniform sampler2D noise;
      
    mat3 lookAt(in vec3 eye, in vec3 tar, in float r){
        vec3 cw = normalize(tar - eye);// camera w
        vec3 cp = vec3(sin(r), cos(r), 0.);// camera up
        vec3 cu = normalize(cross(cw, cp));// camera u
        vec3 cv = normalize(cross(cu, cw));// camera v
        return mat3(cu, cv, cw);
    }
    
    float sdTriPrism( vec3 p, vec2 h )
    {
      vec3 q = abs(p);
      return max(q.z-h.y,max(q.x*0.866025+p.y*0.5,-p.y)-h.x*0.5);
    }
    
    float map(vec3 pos)
    {
        // float sinTime = sin(time * 0.00025);
        // float height = 6.0;
        // return pos.y - sin(pos.x * 0.1) * height * sinTime  - sin(pos.z * 0.1) * height * sinTime;
        return sdTriPrism(pos, vec2(20.0, 10.0));
    }
    
    #define CAM_DISTANCE 50.0
    #define BACKGROUND_COLOUR vec3(0.98, 0.929, 0.804)
    #define MAX_RAY_DISTANCE 300
    
    vec4 rayMarch(vec2 p){
        float rotate = time * 0.0005; 
        vec3 cam = vec3(sin(rotate) * CAM_DISTANCE, CAM_DISTANCE * (uRotation + 0.5) * 0.5,cos(rotate) * CAM_DISTANCE);
        vec3 pos = cam;              
        vec3 ray = lookAt(cam, vec3(0.0), 0.)*normalize(vec3(p, 1.0));
        vec3 cell = vec3(0.0);
        vec3 normal = vec3(0.0);
        
        int j = 0;
        
        for(int i = 0; i < MAX_RAY_DISTANCE; i++)
        {
            vec3 dist = fract(-pos * sign(ray)) + 0.00001,
            leng = dist / abs(ray);
            
            float near = 9999.0;
            if(leng.x < near){
                normal = vec3(1,0,0);
                near = leng.x;
            }
            if(leng.y < near){
                normal = vec3(0,1,0);
                near = leng.y;
            }
            if(leng.z < near){
                normal = vec3(0,0,1);
                near = leng.z;
            }
               
            pos += ray * near;
            cell = ceil(pos) - 0.5;
            if (map(cell) < 0.0) break;
            j++;
        }
        
        float lerpAmount = float(j) / float(MAX_RAY_DISTANCE);
        vec3 localPos = fract(pos) +  max(normal, vec3(0.0));
        vec3 albedo = vec3(0.2, 0.3, 0.8);
        vec3 lightColour = vec3(1.0);
        vec3 lightDirection = vec3(0.5,1.0,0.0);
        float lightIntensity = 1.0;
        float diff = max(dot(normal, lightDirection), 0.0);
        vec3 diffuse = vec3(diff * lightColour * lightIntensity);
        vec3 outputColour = (BACKGROUND_COLOUR + diffuse) * albedo;
        return vec4(mix(outputColour, BACKGROUND_COLOUR, lerpAmount), 1.0);
    }
    
    void main()
    {
       vec2 res = uResolution.xy;   //View resolution
       vec2 p = (gl_FragCoord.xy-0.5*uResolution.xy)/min(uResolution.x, uResolution.y);
       gl_FragColor = rayMarch(p);
    }
`;

export const Shader: Component = (props) => {
  let canvas: HTMLCanvasElement;
  let animationFrame: number;
  const [isDragging, setIsDragging] = createSignal(false);
  const [rotation, setRotation] = createSignal(0);
  const handleDrag = (event) => {
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
      gl.uniform1f(programInfo.uniformLocations.time, parseFloat(time));
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
