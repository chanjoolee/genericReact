const path = require('path');
const cracoAlias = require('craco-alias');

module.exports = {
    devServer: {
        port: process.env.PORT || 5000, // Specify your desired port number here
    },
    webpack: {
        alias: {
            // '@pages': path.resolve(__dirname, 'src/pages/'),
            '@generic': path.resolve(__dirname, 'src/generic'),
            '@tabs': path.resolve(__dirname, 'src/tabs'),
            '@lib': path.resolve(__dirname, 'src/common/lib'),
            '@hooks': path.resolve(__dirname, 'src/hooks'),
            '@': path.resolve(__dirname, 'src'),
        },
        configure: (webpackConfig, { env, paths }) => {
            webpackConfig.devtool = 'source-map';
            return webpackConfig;
        }
    },
    plugins: [
        {
            plugin: cracoAlias,
            options: {
                source: "jsconfig",
                baseUrl: "."
            }
        }
    ],
    eslint: {
        configure: (eslintConfig = '.eslintrc.js') => eslintConfig
    }
}