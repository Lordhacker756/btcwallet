const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
    transformer: {
        getTransformOptions: async () => ({
            transform: {
                experimentalImportSupport: false,
                inlineRequires: true,
            },
        }),
    },
    resolver: {
        assetExts,
        sourceExts,
        extraNodeModules: {
            crypto: require.resolve('react-native-crypto'),
            stream: require.resolve('stream-browserify'),
            buffer: require.resolve('buffer'),
            events: require.resolve('events'),
            process: require.resolve('process/browser'),
            assert: require.resolve('assert'),
            '@noble/curves': path.resolve(__dirname, 'node_modules/@noble/curves'),
            'bitcoinjs-lib': path.resolve(__dirname, 'node_modules/bitcoinjs-lib'),
            '@noble/curves': path.resolve(__dirname, 'node_modules/@noble/curves'),
        }
    }
};

module.exports = mergeConfig(defaultConfig, config);