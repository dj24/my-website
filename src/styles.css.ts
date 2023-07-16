import { style } from "@vanilla-extract/css";
import theme from "./theme.css";
import { lilitaOne } from "./text.css";

const { spacing, colours } = theme;

export const box = style({
  display: "flex",
});

export const grid = style({
  display: "grid",
});

export const card = style([
  box,
  {
    padding: spacing["2"],
  },
]);

export const itemsCenter = style({
  alignItems: "center",
});

export const justifyBetween = style({
  justifyContent: "space-between",
});

export const hStack = style([
  box,
  {
    gap: spacing["4"],
  },
]);

export const vStack = style([
  hStack,
  {
    flexDirection: "column",
  },
]);

export const nav = style([
  card,
  itemsCenter,
  justifyBetween,
  {
    paddingLeft: spacing["3"],
    paddingRight: spacing["3"],
  },
]);

export const navContainer = style({
  position: "sticky",
  left: 0,
  right: 0,
  top: 0,
  background: colours.background,
  zIndex: 2,
});

export const divider = style({
  height: 1,
  width: "100%",
  background: colours.accent,
  margin: 0,
  border: 0,
});

export const navLogo = style({
  selectors: {
    [`${nav} &`]: {
      width: spacing["3"],
      height: spacing["3"],
    },
  },
});

export const reactLogo = style({
  width: "3.5rem",
  height: "3.5rem",
});

export const navHeading = style({
  fontSize: "1.5rem",
  fontWeight: 500,
  color: colours.accent,
  overflow: "hidden",
});

export const navLink = style({
  fontSize: "1rem",
  fontWeight: 500,
  letterSpacing: "0.025rem",
  color: colours.accent,
  overflow: "hidden",
  textTransform: "uppercase",
  cursor: "pointer",
});
export const navSectionIndicator = style({
  fontSize: "0.75rem",
  position: "absolute",
  textTransform: "uppercase",
  fontStyle: "italic",
});

export const displayText = style({
  fontSize: "5rem",
  fontWeight: 500,
  overflow: "hidden",
  color: colours.accent,
});

export const displayTextSecondary = style({
  fontSize: "4rem",
  fontFamily: lilitaOne,
  letterSpacing: "-0.0625rem",
});

export const displayTextLarge = style([
  displayText,
  {
    fontSize: "8rem",
  },
]);

export const content = style([
  {
    paddingTop: spacing["2"],
    paddingBottom: spacing["2"],
    paddingLeft: spacing["4"],
    paddingRight: spacing["4"],
  },
]);

export const spanThree = style([
  hStack,
  justifyBetween,
  {
    gridColumn: "1 / span 3",
  },
]);

export const accentText = style([
  displayText,
  {
    color: colours.accent,
  },
]);

export const reactSection = style([
  hStack,
  itemsCenter,
  {
    gap: spacing["2"],
  },
]);

export const gridImage = style({
  backgroundSize: "cover",
  width: "100%",
  height: "100%",
  gridColumn: "span 2",
  borderRadius: "0.5rem",
  backgroundPosition: "center",
});

export const textAccent = style({
  color: colours.accent,
});

export const textTight = style({
  letterSpacing: "-0.75rem",
});

export const heroHeading = style([
  displayText,
  {
    zIndex: 1,
    position: "relative",
  },
]);

export const heroImage = style({
  objectFit: "cover",
  position: "absolute",
  right: 0,
  bottom: 0,
});

export const animatedLetter = style({
  willChange: "transform",
  display: "inline-block",
  whiteSpace: "pre",
});
