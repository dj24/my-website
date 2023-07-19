import createShader from "gl-shader";
import triangle from "a-big-triangle";
import vert from '../shaders/hero.vert';
import frag from '../shaders/hero.frag';
import fxaa from '../shaders/fxaa.frag';
import lowry from '../assets/lowry.jpg';

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

const loadTexture = async (gl: WebGL2RenderingContext, src: string): Promise<WebGLTexture> => {
  const res = await fetch(src, {mode: 'cors'});
  const blob = await res.blob();
  const bitmap = await createImageBitmap(blob, {
    premultiplyAlpha: 'none',
    colorSpaceConversion: 'none',
  });
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_S);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.TEXTURE_WRAP_T);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);

  if(!texture){
    throw new Error('Error creating texture');
  }
  return texture;
}

const handleAnimate = async ({ rotation, width, height }: ShaderAnimatePayload) => {
  if (!gl) {
    throw new Error("WebGl2 context not setup");
  }
  // const texture = createTexture(gl, [width, height]);
  const texture = await loadTexture(gl, lowry);
  // texture.bind();
  fxaaShader.bind();
  fxaaShader.uniforms.resolution = [width, height];
  fxaaShader.uniforms.image = texture;
  // shader.uniforms.rotation = rotation;
  gl.canvas.width = width;
  gl.canvas.height = height;
  gl.viewport(0, 0, width, height);

  const render = (time: number) => {
    if (!gl) {
      return;
    }
    fxaaShader.uniforms.time = time;
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
