import { Component, createSignal, JSX, onCleanup, onMount } from "solid-js";
import { scroll } from "motion";
import {
  createTexture,
  draw,
  getProgramInfo,
  ShaderFloat,
  ShaderVec3,
} from "../util/webgl.ts";
import {
  distanceFunctions,
  operations,
  vertexShaderSource,
} from "../util/shader.ts";

const fragmentShaderSource = (
  floatNames: string[],
  vec3Names: string[],
  textureNames: string[],
) => `
    precision mediump float;
    ${floatNames.reduce((acc, name) => `${acc} \n uniform float ${name};`, "")}
    ${vec3Names.reduce((acc, name) => `${acc} \n uniform vec3 ${name};`, "")}
    ${textureNames.reduce(
      (acc, name) => `${acc} \n uniform sampler2D ${name};`,
      "",
    )}
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
    #define MAX_RAY_DISTANCE 250
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
          vec2 s_pos = (2.0*(gl_FragCoord.xy + o)-resolution.xy)/resolution.y;
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

export const Shader: Component<{ style: JSX.CSSProperties }> = (props) => {
  let canvas: HTMLCanvasElement | undefined;
  let animationFrame: number;
  const [isDragging] = createSignal(false);
  const [rotation, setRotation] = createSignal(0);
  const floatNames = ["time", "rotation"];
  const vec3Names = ["resolution"];
  const textureNames = ["noise"];
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

    const programInfo = getProgramInfo(
      gl,
      fragmentShaderSource(floatNames, vec3Names, textureNames),
      vertexShaderSource,
      floatNames.concat(vec3Names).concat(textureNames),
    );

    createTexture(gl, `/img/noiseTexture.png`);

    const main = (time: number) => {
      if (!canvas) {
        return;
      }
      const vec3s: ShaderVec3[] = [
        { name: "resolution", value: [canvas.width, canvas.height, 1.0] },
      ];
      const floats: ShaderFloat[] = [
        { name: "rotation", value: rotation() },
        { name: "time", value: time },
      ];
      draw(gl, programInfo, canvas, vec3s, floats);
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
