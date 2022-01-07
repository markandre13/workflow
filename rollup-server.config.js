import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'src/server/server.ts',
    external: ['knex', 'crypto', 'bcrypt', 'corba.js'],
    output: {
      name: 'workflow-server',
      format: 'es',
      file: 'js/server.js',
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
                "src/server/**/*.ts",
                "src/shared/**/*.ts"
            ]
        }),
        nodeResolve(),
        commonjs()
    ]
}
