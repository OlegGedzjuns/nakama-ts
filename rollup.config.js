import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import commonJS from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';

const extensions = ['.mjs', '.js', '.ts', '.json'];

export default {
  input: './src/main.ts',
  output: {
    file: 'build/index.js',
  },
  external: ['nakama-runtime'],
  plugins: [
    // Allows node_modules resolution
    resolve({ extensions }),

    // Compile TypeScript
    typescript(),

    json(),

    // Resolve CommonJS modules
    commonJS({ extensions }),

    // Transpile to ES5
    babel({
      extensions,
      babelHelpers: 'bundled',
    }),
  ],
};
