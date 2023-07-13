import { render } from "solid-js/web";
import App from "./App";
import "./theme.css.ts";
import "./app.css.ts";

const root = document.getElementById("root");

render(() => <App />, root!);
