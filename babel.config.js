module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['expo-router/babel', '@babel/plugin-proposal-unicode-property-regex', ["@babel/plugin-transform-private-methods", { "loose": true }]],
  };
};
