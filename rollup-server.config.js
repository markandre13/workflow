import typescript from 'rollup-plugin-typescript2'

export default {
    input: 'src/server/server.ts',
    output: {
      file: 'js/server.js',
      name: 'workflow-server',
      format: 'commonjs', // umd, es, 
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
    ]
}
