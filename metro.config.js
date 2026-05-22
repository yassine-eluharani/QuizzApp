const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

let config = getDefaultConfig(__dirname);

// Enable minification for production builds
config.transformer = {
  ...config.transformer,
  minifierPath: 'metro-minify-terser',
  minifierConfig: {
    compress: {
      drop_console: process.env.NODE_ENV === 'production',
      drop_debugger: true,
      passes: 2,
    },
    mangle: {
      toplevel: true,
      keep_classnames: false,
      keep_fnames: false,
    },
    output: {
      comments: false,
    },
  },
};

module.exports = withNativeWind(config, { input: './global.css' });
