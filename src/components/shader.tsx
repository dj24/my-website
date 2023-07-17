import { Component, createSignal, JSX, onCleanup, onMount } from "solid-js";
import { scroll } from "motion";
import ShaderWorker from "./shader-worker?worker";
import { createResizeObserver } from "@solid-primitives/resize-observer";

export const Shader: Component<{ style: JSX.CSSProperties }> = (props) => {
  let canvas!: HTMLCanvasElement;
  let container!: HTMLDivElement;
  const shaderWorker = new ShaderWorker();
  const [rotation, setRotation] = createSignal(0);
  const floatNames = ["time", "rotation"];
  const vec3Names = ["resolution"];
  const textureNames = ["noise"];

  scroll(
    ({ y }) => {
      setRotation(y.progress);
    },
    {
      smooth: 100,
    },
  );

  onMount(() => {
    const offscreen = canvas.transferControlToOffscreen();
    shaderWorker.postMessage(
      { action: "setup", payload: { canvas: offscreen } },
      [offscreen],
    );
    createResizeObserver(canvas, ({ width, height }) => {
      const workerPayload = {
        width: width,
        height: height,
        rotation: rotation(),
        floatNames,
        vec3Names,
        textureNames,
      };
      shaderWorker.postMessage({ action: "animate", payload: workerPayload });
    });

    onCleanup(() => {
      shaderWorker.postMessage({ action: "cancel" });
    });
  });

  return (
    <div ref={container}>
      <canvas ref={canvas} width={1000} height={1000} {...props} />
    </div>
  );
};
