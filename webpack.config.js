// modules we need
const fs = require("fs");const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const FoundryVTTSymlinkPlugin = require("./dev-utils/foundryvtt-symlink");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MergeJsonWebpackPlugin = require("merge-jsons-webpack-plugin");

const config = JSON.parse(fs.readFileSync('./foundryvtt.config.json'));
const system = JSON.parse(fs.readFileSync("./system.json"));

const distPath = path.resolve(__dirname, "dist");
const publicPath = `/${(system.type)}s/${(system.id)}/`;

module.exports = (env, argv) => {
    return {
        mode: "development",
        entry: "./src/index.js",
        output: {
            path: distPath,
            filename: `${(system.id)}.js`,
            clean: {
                keep: /packs/
            },
            publicPath: publicPath,
        },
        devtool: 'inline-source-map',
        optimization: {
            minimize: argv.mode !== "development",
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        keep_classnames: true,
                    },
                })],
        },
        module: {
            rules: [
                {
                    test: /\.html$|\.handlebars$|\.hbs$/,
                    use: {
                        loader: path.resolve("dev-utils", "templates-loader.js"),
                        options: {
                            name: system.id
                        }
                    }
                },
                {
                    test: /\.js$/,
                    use: 'webpack-import-glob-loader'
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        // Creates `style` nodes from JS strings
                        "style-loader", // Translates CSS into CommonJS
                        "css-loader", // Compiles Sass to CSS
                        "sass-loader"],
                }, {
                    test: /\.(woff|woff2|eot|ttf|otf)$/i,
                    type: "asset/resource",
                }],
        },
        plugins: [
            new MergeJsonWebpackPlugin({
                space: 4,
                output: {
                    groupBy: [
                        {
                            pattern: "src/**/template.json",
                            fileName: "template.json",
                        }
                    ],
                }
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: 'static',
                        to: ''
                    },
                    {
                        from: 'system.json',
                        to: ''
                    },
                ],
            }),
            argv.mode === "development" ? new FoundryVTTSymlinkPlugin(system.id, system.type, distPath, config.foundryvttPath) : ''
        ],
    }}