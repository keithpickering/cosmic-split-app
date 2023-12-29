/* eslint-disable no-undef */
/**
 * @file Custom config file for Metro bundler to add support for MJS extension.
 * @see {@link https://github.com/expo/expo/issues/23180#issuecomment-1612970642 Source of solution}
 */
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = (async () => {
  const {
     resolver: { sourceExts },
  } = config;

  return {
     ...config,
     resolver: {
        ...config.resolver,
        sourceExts: [...sourceExts, 'mjs'],
     },
  };
})();
