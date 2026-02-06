const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable minification for production builds
config.transformer = {
  ...config.transformer,
  minifierPath: 'metro-minify-terser',
  minifierConfig: {
    // Terser options for better obfuscation
    compress: {
      // Remove console logs in production
      drop_console: !__DEV__,
      // Remove debugger statements
      drop_debugger: true,
      // Additional compression
      passes: 2,
    },
    mangle: {
      // Mangle variable names
      toplevel: true,
      // Keep class names for error reporting
      keep_classnames: false,
      // Keep function names for error reporting (can be disabled for more obfuscation)
      keep_fnames: false,
    },
    output: {
      // Remove comments
      comments: false,
    },
  },
};

module.exports = config;
