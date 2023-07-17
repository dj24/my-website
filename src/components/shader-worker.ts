import {
  bindRenderTexture,
  drawScene,
  getProgramInfo,
  ShaderFloat,
  ShaderVec3,
} from "../util/webgl.ts";
import frag from "../shaders/hero.frag";
import vert from "../shaders/hero.vert";

type ShaderSetupPayload = {
  canvas: OffscreenCanvas;
  container: HTMLDivElement;
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
let container: HTMLDivElement | null;

const handleSetup = (payload: ShaderSetupPayload) => {
  gl = payload.canvas.getContext("webgl2");
  container = payload.container;
  if (!gl) {
    throw new Error("No WebGl2 support on device");
  }
};
const handleAnimate = ({
  floatNames,
  vec3Names,
  textureNames,
  rotation,
  width,
  height,
}: ShaderAnimatePayload) => {
  if (!gl) {
    throw new Error("WebGl2 context not setup");
  }
  if (!container) {
    throw new Error("Container not set");
  }
  gl.canvas.width = container.width;
  gl.canvas.height = container.height;
  cancelAnimationFrame(animationFrame);
  const programInfo = getProgramInfo(
    gl,
    frag,
    vert,
    floatNames.concat(vec3Names).concat(textureNames),
  );
  bindRenderTexture(gl, gl.canvas.width, gl.canvas.height);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  const main = (time: number) => {
    if (!gl) {
      return;
    }
    animationFrame = requestAnimationFrame(main);
    const vec3s: ShaderVec3[] = [
      { name: "resolution", value: [gl.canvas.width, gl.canvas.height, 1.0] },
    ];
    const floats: ShaderFloat[] = [
      { name: "rotation", value: rotation },
      { name: "time", value: time },
    ];
    drawScene(gl, programInfo, vec3s, floats);
  };
  animationFrame = requestAnimationFrame(main);
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
