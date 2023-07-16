import { Component, createSignal, JSX, onCleanup, onMount } from "solid-js";
import frag from '../shaders/hero.frag';
import vert from '../shaders/hero.vert';
import { scroll } from "motion";
import {
  createTexture,
  draw,
  getProgramInfo,
  ShaderFloat,
  ShaderVec3,
} from "../util/webgl.ts";

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
      frag,
      vert,
      floatNames.concat(vec3Names).concat(textureNames),
    );

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
