
module.exports = (ctx) => {


    const env = ctx.env ?? 'development';

    return {
        map: ctx.options.map,
        parser: ctx.options.parser,
        plugins: {
            'postcss-combine-media-query': env === 'development' ? {} : false,
            'postcss-preset-env': {
                autoprefixer: {
                    cascade: false,
                },
                features: {
                    'custom-properties': true,
                },
            },
            cssnano: env === 'development' ? false : { preset: 'default' },
        }
    };
};