import { AnimationOptions, BezierDefinition } from "motion";

export const easings: {
  [key: string]: BezierDefinition;
} = {
  easeOutExpo: [0.16, 1, 0.3, 1],
  easeInOutExpo: [0.87, 0, 0.13, 1],
  easeInOutCirc: [0.85, 0, 0.15, 1],
  easeInOutQuart: [0.76, 0, 0.24, 1],
};
export const defaultAnimation: AnimationOptions = {
  easing: easings.easeOutExpo,
  duration: 1,
};
