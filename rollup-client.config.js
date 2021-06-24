import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'src/client/workflow.ts',
    output: {
      file: 'js/workflow.js',
      name: 'workflow',
      format: 'iife', // umd, es, 
      sourcemap: true
    },
    plugins: [
        typescript({
            tsconfigOverride: {
                compilerOptions: {
                    module: "esnext"
                },
            },
            include: [
                "src/client/**/*.ts",
                "src/client/**/*.tsx",
                "src/shared/**/*.ts",
                "src/shared/**/*.tsx",
            ]
        }),
        nodeResolve(),
        commonjs()
    ]
}
