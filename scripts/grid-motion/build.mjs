import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { compileScript, compileStyle, parse } from '@vue/compiler-sfc';

const directory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(directory, '../..');

await build({
  absWorkingDir: directory,
  entryPoints: ['mengshou-logo-wall.ts'],
  outfile: path.join(root, 'assets/mengshou-logo-wall.js'),
  bundle: true,
  minify: true,
  format: 'esm',
  target: ['es2020'],
  legalComments: 'eof',
  define: {
    'process.env.NODE_ENV': '"production"',
    __VUE_OPTIONS_API__: 'false',
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
  },
  plugins: [{
    name: 'vue-single-file-component',
    setup(builder) {
      builder.onResolve({ filter: /\.vue\?css$/ }, (args) => ({
        path: args.path.slice(0, -4),
        namespace: 'vue-style'
      }));
      builder.onLoad({ filter: /.*/, namespace: 'vue-style' }, async (args) => {
        const source = await readFile(args.path, 'utf8');
        const { descriptor, errors } = parse(source, { filename: args.path });
        if (errors.length) throw errors[0];
        const styles = descriptor.styles.map((style) => {
          const compiled = compileStyle({
            source: style.content,
            filename: args.path,
            id: 'grid-motion',
            scoped: false
          });
          if (compiled.errors.length) throw compiled.errors[0];
          return compiled.code;
        });
        return { contents: styles.join('\n'), loader: 'css' };
      });
      builder.onLoad({ filter: /\.vue$/ }, async (args) => {
        const source = await readFile(args.path, 'utf8');
        const { descriptor, errors } = parse(source, { filename: args.path });
        if (errors.length) throw errors[0];
        const compiled = compileScript(descriptor, {
          id: 'grid-motion',
          inlineTemplate: true
        });
        return {
          contents: 'import ' + JSON.stringify(args.path + '?css') + ';\n' + compiled.content,
          loader: 'ts',
          resolveDir: path.dirname(args.path)
        };
      });
    }
  }],
  logLevel: 'info'
});
