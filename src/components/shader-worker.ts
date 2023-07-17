import createShader from "gl-shader";
import triangle from "a-big-triangle";
import createTexture from "gl-texture2d";
import frag from "../shaders/hero.frag";
import vert from "../shaders/hero.vert";
import fxaa from "../shaders/fxaa.frag";

type ShaderSetupPayload = {
  canvas: OffscreenCanvas;
};

type ShaderAnimatePayload = {
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
let fxaaShader: any;

const handleSetup = (payload: ShaderSetupPayload) => {
  gl = payload.canvas.getContext("webgl2");
  if (!gl) {
    throw new Error("No WebGl2 support on device");
  }
  shader = createShader(gl, vert, frag);
  fxaaShader = createShader(gl, vert, fxaa);
};

const handleAnimate = ({ rotation, width, height }: ShaderAnimatePayload) => {
  if (!gl) {
    throw new Error("WebGl2 context not setup");
  }
  const texture = createTexture(gl, [width, height]);
  console.log({ fxaaShader, shader, texture });
  texture.bind();
  shader.bind();
  gl.canvas.width = width;
  gl.canvas.height = height;
  gl.viewport(0, 0, width, height);
  shader.uniforms.resolution = [width, height, 0.0];
  shader.uniforms.rotation = rotation;
  // fxaaShader.bind();
  // fxaaShader.uniforms.image = texture;
  // fxaaShader.uniforms.resolution = [width, height];
  const render = (time: number) => {
    if (!gl) {
      return;
    }
    shader.uniforms.time = time;
    triangle(gl);
    animationFrame = requestAnimationFrame(render);
  };
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
