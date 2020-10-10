import typescript from '@rollup/plugin-typescript';
import multi from '@rollup/plugin-multi-entry';
 
export default {
    input: './test/visual/**/*.spec.ts',
    output: {
      file: './test/visual/test.js',
      format: 'iife', // umd, es, 
      sourcemap: true
    },
    plugins: [
        typescript({
            tsconfig: false,
            include: "test/visual/**/*.spec.ts",
            lib: ["es6", "es2017.object", "dom"],
            target: "es6",
            strict: true,
            allowJs: false,
            noImplicitAny: true,
            sourceMap: true 
        }),
        multi()
    ]
}
