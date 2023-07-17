import createShader from 'gl-shader';
import triangle from 'a-big-triangle';
import frag from "../shaders/hero.frag";
import vert from "../shaders/hero.vert";

type ShaderSetupPayload = {
  canvas: OffscreenCanvas;
};

type ShaderAnimatePayload = {
  floatNames: string[];
  vec3Names: string[];
  textureNames: string[];
  rotation: number;
  width: number;
  height: number;
};

type ShaderMessage =
  | {
      action: "setup";
      payload: ShaderSetupPayload;
    }
  | {
      action: "animate";
      payload: ShaderAnimatePayload;
    }
  | {
      action: "cancel";
    };

let animationFrame: number;
let gl: WebGL2RenderingContext | null;
let shader: any;

const handleSetup = (payload: ShaderSetupPayload) => {
  gl = payload.canvas.getContext("webgl2");
  if (!gl) {
    throw new Error("No WebGl2 support on device");
  }
  shader = createShader(gl, vert, frag);
};



const handleAnimate = ({
  rotation,
  width,
  height,
}: ShaderAnimatePayload) => {
  if (!gl) {
    throw new Error("WebGl2 context not setup");
  }
  gl.viewport(0, 0, width, height);
  shader.bind()
  shader.uniforms.resolution = [ width, height, 1.0 ]
  shader.uniforms.rotation = rotation;
  const render = (time: number) => {
    if(!gl){
      return;
    }
    shader.uniforms.time = time;
    triangle(gl)
    animationFrame = requestAnimationFrame(render);
  }
  animationFrame = requestAnimationFrame(render);
};

const handleCancel = () => {
  cancelAnimationFrame(animationFrame);
};

onmessage = ({ data }: MessageEvent<ShaderMessage>) => {
  switch (data.action) {
    case "setup":
      handleSetup(data.payload);
      break;
    case "animate":
      handleAnimate(data.payload);
      break;
    case "cancel":
      handleCancel();
      break;
    default:
      break;
  }
};
