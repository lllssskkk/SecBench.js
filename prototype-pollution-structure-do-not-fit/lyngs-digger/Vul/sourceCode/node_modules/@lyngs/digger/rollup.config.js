import resolve from '@rollup/plugin-node-resolve';
import commonJs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';

export default {
  input: 'src/index.js',
  output: {
    name: 'digger',
    file: 'dist/index.js',
    format: 'umd',
  },
  plugins: [
    resolve(),
    babel({
      babelHelpers: 'bundled',
      exclude: /node_modules/,
      presets: [
        [
          '@babel/preset-env',
          {
            useBuiltIns: 'usage',
            corejs: '3',
          }
        ],
      ],
    }),
    commonJs(),
  ],
};