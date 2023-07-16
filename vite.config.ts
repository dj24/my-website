import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [solid(), vanillaExtractPlugin(), glsl()],
  base: "/my-website/",
});
