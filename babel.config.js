var postcssPresetEnv = require('postcss-preset-env')

module.exports = {
  presets: [
    '@babel/preset-env',
  ],
  plugins: [
    '@babel/plugin-proposal-optional-chaining',
    [
      "@babel/plugin-proposal-decorators",
      {
        "legacy": true
      }
    ],
    [
      'import-postcss', {
        plugins: [
          postcssPresetEnv({ stage: 0 })
        ],
        map: { inline: true }
      }
    ]
  ]
}