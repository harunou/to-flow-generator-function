// @ts-check

/**
 * @typedef { import('prettier').Options } PrettierConfig
 * @typedef { Array<{files: string | string[], options: PrettierConfig}> } PrettierOverrides
 * @type { PrettierConfig & { overrides?: PrettierOverrides } }
 */
const config = {
    trailingComma: 'es5',
    tabWidth: 4,
    printWidth: 100,
    singleQuote: true,
    quoteProps: 'as-needed',
    jsxSingleQuote: true,
    bracketSpacing: true,
    arrowParens: 'avoid',
    endOfLine: 'lf',
    singleAttributePerLine: true,
    overrides: [
        {
            files: '*.{html,json,yml,yaml}',
            options: {
                tabWidth: 2,
                printWidth: 120,
            },
        },
    ],
};

module.exports = config;
