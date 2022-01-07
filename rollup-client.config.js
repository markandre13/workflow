import typescript from 'rollup-plugin-typescript2'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from "rollup-plugin-terser"

export default {
    input: 'src/client/workflow.ts',
    external: ['websocket'],
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
                "src/client/views/**/*.tsx",
                "src/shared/**/*.ts",
            ],
            exclude: [
                "node_modules"
            ]
        }),
        nodeResolve(),
        commonjs(),
        // terser()
    ]
}
