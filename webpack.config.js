// modules we need
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const FoundryVTTSymlinkPlugin = require('./dev-utils/foundryvtt-symlink');
const config = require('./foundryvtt.config.js');

// auto calculated values
const {type, name} = config;
const distPath = path.resolve(__dirname, 'dist');
const publicPath = `/${type}s/${name}/`;
const package = require('./package.json');

function transformManifest(content) {
    // Convert string to object
    const manifest = JSON.parse(content);

    // Required 
    manifest.name = config.name;
    manifest.title = config.title;
    manifest.description = config.description;
    manifest.version = config.version;
    manifest.author = config.author;
    manifest.minimumCoreVersion = config.minimumCoreVersion;

    // Optional
    if(manifest.esmodules === undefined) manifest.esmodules = [`${name}.js`];
    if(manifest.compatibleCoreVersion === undefined) manifest.compatibleCoreVersion = config.compatibleCoreVersion;

    const githubRepo = config.githubRepo;
    const githubBranch = config.githubBranch;
    if(githubRepo) {
        if(manifest.url === undefined) manifest.url = `https://github.com/${githubRepo}`;
        if(manifest.manifest === undefined) manifest.manifest = `https://raw.githubusercontent.com/${githubRepo}/${githubBranch}/${type}.json`;
        if(manifest.readme === undefined) manifest.readme = `https://raw.githubusercontent.com/${githubRepo}/${githubBranch}/README.md`;
        if(manifest.download === undefined) manifest.download = `https://github.com/${githubRepo}/archive/refs/tags/${package.version}.zip`;
    }

    // Return as nicely parsed string
    return JSON.stringify(manifest, null, 4);
}

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        path: distPath,
        filename: `${name}.js`,
        clean: true,
        publicPath: publicPath,
    },
    module: {
        rules: [
            {
                test: /\.html$|\.handlebars$|\.hbs$/,
                use: {
                    loader: path.resolve('dev-utils', 'templates-loader.js'),
                    options: {
                        name
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
        new CopyPlugin({
            patterns: [
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
        new FoundryVTTSymlinkPlugin(name, type, distPath, config.foundryvttPath)
    ],
};