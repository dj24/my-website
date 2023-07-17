import { Motion } from "@motionone/solid";
import { animate, stagger, timeline } from "motion";
import {
  animatedLetter,
  content,
  displayText,
  divider,
  hStack,
  nav,
  navContainer,
  navHeading,
  navLink,
} from "./styles.css";
import {
  createEffect,
  createSignal,
  createUniqueId,
  For,
  onMount,
} from "solid-js";
import { defaultAnimation, easings } from "./config/animation";
import { Shader } from "./components/shader";
import SmoothScroll from "./components/smooth-scroll";

const AnimatedLetters = (props: { children: string }) => {
  const id = createUniqueId();
  onMount(() => {
    animate(
      `[data-motion-id="${id}"] > span`,
      {
        y: ["100%", "0%"],
        opacity: [0, 1],
        scale: [0.9, 1],
      },
      {
        delay: stagger(0.0375),
        y: defaultAnimation,
      },
    );
  });
  return (
    <span data-motion-id={id}>
      <For each={props.children.split("")}>
        {(char) => <span class={animatedLetter}>{char}</span>}
      </For>
    </span>
  );
};

const Divider = (props: { reverse: boolean }) => {
  return (
    <Motion.hr
      style={{ "transform-origin": props.reverse ? "right" : "left" }}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{
        duration: 1,
        easing: easings.easeInOutQuart,
      }}
      class={divider}
    />
  );
};

const AnimateTextHover = (props: { children: string }) => {
  const id = createUniqueId();
  const [isHovered, setIsHovered] = createSignal(false);
  const delay = stagger(0.01625);
  const duration = 0.3;
  const easing = easings.easeInOutExpo;

  createEffect(() => {
    let sequence: any;
    if (isHovered()) {
      sequence = [
        [
          `#${id} span`,
          { y: 10, opacity: 0 },
          {
            delay,
          },
        ],
        [
          `#${id} span`,
          { y: [-10, 0], opacity: [0, 1] },
          {
            delay,
          },
        ],
      ];
    } else {
      sequence = [
        [
          `#${id} span`,
          { y: -10, opacity: 0 },
          {
            delay,
          },
        ],
        [
          `#${id} span`,
          { y: [10, 0], opacity: [0, 1] },
          {
            delay,
          },
        ],
      ];
    }
    timeline(sequence, {
      defaultOptions: { easing, duration },
    });
  });

  return (
    <span
      onMouseOver={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      id={id}
    >
      <For each={props.children.split("")}>
        {(char) => (
          <span
            style={{
              "will-change": "transform",
              display: "inline-block",
              "white-space": "pre",
            }}
          >
            {char}
          </span>
        )}
      </For>
    </span>
  );
};

const Nav = () => (
  <div class={navContainer}>
    <nav class={nav}>
      <h2 class={navHeading}>
        <AnimatedLetters>Dan Jackson</AnimatedLetters>
      </h2>
      <ul class={hStack}>
        <li class={navLink}>
          <AnimateTextHover>Github</AnimateTextHover>
        </li>
        <li class={navLink}>
          <AnimateTextHover>Twitter</AnimateTextHover>
        </li>
        <li class={navLink}>
          <AnimateTextHover>LinkedIn</AnimateTextHover>
        </li>
      </ul>
    </nav>
    <Divider reverse={false} />
  </div>
);

const App = () => {
  return (
    <SmoothScroll>
      <Nav />
      <main class={content}>
        <h1 class={displayText}>
          <AnimatedLetters>Frontend Developer</AnimatedLetters>
        </h1>
      </main>
      <Divider reverse />
      <Shader
        style={{
          height: "800px",
          "max-height": "75vh",
          width: "100%",
        }}
      />
      <Divider reverse />
      <For each={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}>
        {() => (
          <>
            <main class={content}>
              <h1 class={displayText}>
                <AnimatedLetters>Frontend Developer</AnimatedLetters>
              </h1>
            </main>
            <Divider reverse />
          </>
        )}
      </For>
    </SmoothScroll>
  );
};

export default App;
