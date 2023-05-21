const {
    override,
    addLessLoader,
    addPostcssPlugins,
    addExternalBabelPlugin,
    babelInclude,
    addWebpackModuleRule,
    addWebpackAlias,
    fixBabelImports,
} = require('customize-cra')
const path = require('path')

module.exports = override(
    addLessLoader({
        strictMath: true,
        noIeCompat: true,
        modifyVars: {
            'brand-primary': '#0051CC',
        },
        cssLoaderOptions: {}, // .less file used css-loader option, not all CSS file.
        cssModules: {
            localIdentName: '[path][name]__[local]--[hash:base64:5]', // if you use CSS Modules, and custom `localIdentName`, default is '[local]--[hash:base64:5]'.
        },
    }),
    addWebpackAlias({
        // 路径别名
        '~': path.resolve(__dirname, './src'),
        'react-native$': 'react-native-web',
    }),
    addPostcssPlugins([require('postcss-px2rem')({remUnit: 50})]),
    fixBabelImports('import', {
        libraryName: 'antd-mobile-v2',
        style: 'css',
    }),
    babelInclude([
        path.resolve('src'), // make sure you link your own source
        path.resolve('node_modules/react-native-vector-icons'),
    ]),
    addExternalBabelPlugin('module-resolver', {
        alias: {
            '^react-native$': 'react-native-web',
        },
    }),
    addWebpackModuleRule({
        test: /\.ttf$/,
        loader: 'file-loader', // or directly file-loader
        include: path.resolve(__dirname, 'node_modules/react-native-vector-icons'),
    }),
)
