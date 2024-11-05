const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const packageJson = require("./package.json");

function modify(buffer) {
    const manifest = JSON.parse(buffer.toString());
    manifest.version = packageJson.version;
    return JSON.stringify(manifest, null, 2);
}

module.exports = {
    mode: "production",
    devtool: "inline-source-map",
    entry: path.join(__dirname, "src", "index.ts"),
    output: {
        path: path.join(__dirname, "dist"),
        filename: "redust.js",
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".json", ".vue"],
        alias: {
            'vue': '@vue/runtime-dom'
        }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            appendTsSuffixTo: [/\.vue$/]
                        }
                    }
                ],
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: "./src/manifest.json",
                    to: "manifest.json",
                    transform(content) {
                        return modify(content);
                    },
                },
                {
                    from: "./src/static_resources/",
                    to: "static_resources/",
                },
            ],
        }),
    ],
};