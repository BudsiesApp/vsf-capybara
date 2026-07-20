// You can extend default webpack build here.
// Read more in docs: https://github.com/DivanteLtd/vue-storefront/blob/master/docs/guide/core-themes/webpack.md
const { merge } = require('webpack-merge');
const themeRoot = require('@vue-storefront/core/build/theme-path');

module.exports = function (config, { isClient }) {
  const clientConfig = isClient ? {
    optimization: {
      splitChunks: {
        chunks: 'all'
      }
    }
  } : {}
  return merge(
    // alias for 'src/modules/client' has to be the first one, because it has to be
    // handled earlier than already existing aliases in VSF (like general 'src' path)
    { resolve: { alias: { 'src/modules/client': `${themeRoot}/config/modules` } } },
    config, // default vsf config
    clientConfig
  );
};
