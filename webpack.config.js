// modules we need
const path = require('path');
const config = require('./foundryvtt.config.js');
const TerserPlugin = require('terser-webpack-plugin');

// auto calculated values
const {
    type,
    id
} = config;

const distPath = path.resolve(__dirname, 'dist');
const publicPath = `/${type}s/${id}/`;

module.exports = (env, argv) => {
    return {
        mode: 'development',
        entry: './src/index.js',
        output: {
            path: distPath,
            filename: `${id}.js`,
            clean: true,
            publicPath: publicPath,
        },
        optimization: {
            minimize: true,
            minimizer: [new TerserPlugin({
                terserOptions: {
                    keep_classnames: true
                }
            })],
        },
        module: {
            rules: [{
                    test: /\.html$|\.handlebars$|\.hbs$/,
                    use: {
                        loader: path.resolve('dev-utils', 'templates-loader.js'),
                        options: {
                            name: id
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
                        "style-loader",
                        // Translates CSS into CommonJS
                        "css-loader",
                        // Compiles Sass to CSS
                        "sass-loader",
                    ],
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/i,
                    type: 'asset/resource',
                },
            ],
        },
        devServer: {
            contentBase: distPath,
            hot: true,
            proxy: {
                target: 'http://localhost:30000',
                context: function (path) {
                    return !path.match(/^\/sockjs/);
                },
                ws: true
            },
            publicPath: publicPath,
            writeToDisk: true
        },
    }
};