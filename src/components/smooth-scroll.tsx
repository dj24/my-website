// import { createSignal, onMount } from "solid-js";
// import { Motion } from "@motionone/solid";

import { ParentComponent } from "solid-js";

const SmoothScroll: ParentComponent = (props) => {
  // let scrollRef: HTMLDivElement;
  // let paddingRef: HTMLDivElement;

  // page scrollable height based on content length
  // const [pageHeight, setPageHeight] = createSignal(0);

  // update scrollable height when browser is resizing
  // const resizePageHeight = (entries) => {
  //   for (const entry of entries) {
  //     setPageHeight(entry.contentRect.height);
  //   }
  // };

  // observe when browser is resizing
  // onMount(() => {
  //   const resizeObserver = new ResizeObserver((entries) =>
  //     resizePageHeight(entries),
  //   );
  //   scrollRef && resizeObserver.observe(scrollRef);
  //   return () => resizeObserver.disconnect();
  // });

  // measures how many pixels user has scrolled vertically
  // as scrollY changes between 0px and the scrollable height, create a negative scroll value...
  // ... based on current scroll position to translateY the document in a natural way
  // const transform = transform(scrollY, [0, pageHeight], [0, -pageHeight]);

  // scroll(({ y }) => {
  //   console.log({ y });
  // });

  return (
    <div>
      {props.children}
      {/*<Motion.div ref={scrollRef} className="scroll-container">*/}
      {/*  {children}*/}
      {/*</Motion.div>*/}
      {/*<div ref={paddingRef} />*/}
    </div>
  );
};

export default SmoothScroll;
