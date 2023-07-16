import { Component, createSignal, JSX, onCleanup, onMount } from "solid-js";
import frag from '../shaders/hero.frag';
import vert from '../shaders/hero.vert';
import { scroll } from "motion";
import {
  drawScene,
  getProgramInfo,
  ShaderFloat,
  ShaderVec3,
} from "../util/webgl.ts";
import { bindRenderTexture } from "../util/webgl";

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
    const gl = canvas?.getContext("webgl");
    if (!gl) {
      throw new Error("No WebGl support on device");
    }
    const programInfo = getProgramInfo(
      gl,
      frag,
      vert,
      floatNames.concat(vec3Names).concat(textureNames),
    );

    bindRenderTexture(gl, gl.canvas.width, gl.canvas.height);
    // TODO: bind and unbind at correct points
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    const main = (time: number) => {
      const vec3s: ShaderVec3[] = [
        { name: "resolution", value: [gl.canvas.width, gl.canvas.height, 1.0] },
      ];
      const floats: ShaderFloat[] = [
        { name: "rotation", value: rotation() },
        { name: "time", value: time },
      ];
      drawScene(gl, programInfo, vec3s, floats);
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
