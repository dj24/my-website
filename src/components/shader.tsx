import { Component, createSignal, JSX, onCleanup, onMount } from "solid-js";
import { scroll } from "motion";
import ShaderWorker from "./shader-worker?worker";
import { createResizeObserver } from "@solid-primitives/resize-observer";

export const Shader: Component<{ style: JSX.CSSProperties }> = (props) => {
  let canvas!: HTMLCanvasElement;
  const shaderWorker = new ShaderWorker();
  const [rotation, setRotation] = createSignal(0);

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
      shaderWorker.postMessage({
        action: "animate",
        payload: {
          width: width,
          height: height,
          rotation: rotation(),
        },
      });
    });

    onCleanup(() => {
      shaderWorker.postMessage({ action: "cancel" });
    });
  });

  return <canvas ref={canvas} {...props} />;
};
