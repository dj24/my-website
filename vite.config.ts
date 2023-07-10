import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import devtools from 'solid-devtools/vite'

export default defineConfig({
  plugins: [ devtools({
    autoname: true,
  }), solid(), vanillaExtractPlugin()],
})
