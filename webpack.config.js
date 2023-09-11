// modules we need
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const FoundryVTTSymlinkPlugin = require('./dev-utils/foundryvtt-symlink');
const FoundryVTTTemplateMerger = require('./dev-utils/foundryvtt-template-merger');
const FoundryVTTTranslationMerger = require('./dev-utils/foundryvtt-translation-merger');
const FoundryVTTPacker = require('./dev-utils/foundryvtt-packer');
const config = require('./foundryvtt.config.js');
const TerserPlugin = require('terser-webpack-plugin');

// auto calculated values
const { type, id } = config;
const distPath = path.resolve(__dirname, 'dist');
const packDataPath = path.resolve(__dirname, 'pack-data');
const publicPath = `/${type}s/${id}/`;

const packs = [];

function transformManifest(content) {
    // Convert string to object
    const manifest = JSON.parse(content);

    // Required 
    manifest.id = config.id;
    manifest.title = config.title;
    manifest.description = config.description;
    manifest.version = config.version;
    manifest.author = config.author;
    manifest.compatibility = config.compatibility;

    manifest.packs.push(...packs)

    // Optional
    if (manifest.esmodules === undefined) manifest.esmodules = [`${id}.js`];

    const githubRepo = config.githubRepo;
    const githubBranch = config.githubBranch;
    if (githubRepo) {
        if (manifest.url === undefined) manifest.url = `https://github.com/${githubRepo}`;
        if (manifest.manifest === undefined) manifest.manifest = `https://raw.githubusercontent.com/${githubRepo}/${config.version}/${type}.json`;
        if (manifest.readme === undefined) manifest.readme = `https://raw.githubusercontent.com/${githubRepo}/${config.version}/README.md`;
        if (manifest.download === undefined) manifest.download = `https://github.com/${githubRepo}/archive/refs/tags/${config.version}.zip`;
    }

    // Return as nicely parsed string
    return JSON.stringify(manifest, null, 4);
}

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
        rules: [
            {
                test: /\.html$|\.handlebars$|\.hbs$/,
                use: {
                    loader: path.resolve('dev-utils', 'templates-loader.js'),
                    options: {
                        name: id
                    }
                }
            },
            {
                test: /lang\/.*.json/,
                use: {

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
    plugins: [
        new FoundryVTTTranslationMerger(id, distPath),
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'LICENSE'),
                    to: distPath,
                    noErrorOnMissing: true
                },
                {
                    // Copy static folder, ignore it if it's empty
                    from: path.resolve(__dirname, 'static'),
                    to: distPath,
                    noErrorOnMissing: true
                },
                {
                    // Copy manifest.json to module.json/system.json and replace values
                    from: path.resolve(__dirname, 'src', 'manifest.json'),
                    to: function () {
                        return `${type}.json`;
                    },
                    transform: transformManifest
                },
            ],
        }),
    ].concat(argv.mode == "development" ? [
        new FoundryVTTSymlinkPlugin(id, type, distPath, config.foundryvttPath),
    ] : [] ).concat([
        new FoundryVTTPacker(distPath, packDataPath, packs),
        new FoundryVTTTemplateMerger(distPath),
    ]),
}
};