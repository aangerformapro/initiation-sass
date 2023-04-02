
module.exports = {
    plugins: [
        require('postcss-remove-prefixes')(),
        require('autoprefixer')(),
        require('postcss-combine-media-query')()
    ]
};