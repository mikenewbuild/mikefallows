import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'js/main.js',
  output: {
    file: '_site/js/main.js',
    format: 'iife',
  },
  plugins: [nodeResolve()]
};
