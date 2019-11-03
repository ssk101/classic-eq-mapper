module.exports = {
  presets: [
    '@babel/preset-env',
  ],
  plugins: [
    '@babel/transform-runtime',
    'babel-plugin-stylus-compiler',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-optional-chaining',
    [
      '@babel/plugin-proposal-decorators',
      {
        legacy: true,
      },
    ],
  ],
}
