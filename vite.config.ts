import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import { glslify } from 'vite-plugin-glslify';

export default defineConfig({
  plugins: [solid(), vanillaExtractPlugin(), glslify()],
  base: "/my-website/",
  define: {
    global: {},
  },
});
