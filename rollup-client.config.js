import typescript from '@rollup/plugin-typescript';
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
            include: [
                "src/client/**/*.ts",
                "src/shared/**/*.ts"
            ]
        }),
        nodeResolve(),
        commonjs()
    ]
}
