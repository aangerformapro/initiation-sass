
module.exports = {
    plugins: [
        require('postcss-preset-env')(),
        require('postcss-remove-prefixes')(),
        require('postcss-combine-media-query')(),
        require('autoprefixer')(),
        require('cssnano')({ preset: 'default' }),
    ]
};