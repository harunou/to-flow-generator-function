// @ts-check

/**
 * @typedef { import('eslint').Linter.Config } EslintConfig
 * @type { EslintConfig }
 */
const config = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: ['./tsconfig.json'],
    },
    extends: [
        'eslint:recommended',
        'plugin:eslint-comments/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
    ],
    rules: {
        // NOTE(harunou): general rules
        'no-console': 'error',
        'no-unused-expressions': 'error',
        'no-duplicate-imports': 'error',
        'prefer-template': 'error',
        'default-case': 'error',
        'default-case-last': 'error',
        'eslint-comments/require-description': 'error',

        // NOTE(harunou): style rules, that Prettier does not support
        'spaced-comment': ['error', 'always', { exceptions: ['////'] }],

        // NOTE(harunou): typescript specific rules
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-non-null-assertion': 'error',
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/no-unnecessary-condition': 'error',
        '@typescript-eslint/prefer-readonly': 'error',
        '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
        '@typescript-eslint/explicit-function-return-type': 'error',
        '@typescript-eslint/explicit-member-accessibility': [
            'error',
            {
                accessibility: 'no-public',
            },
        ],
        '@typescript-eslint/member-ordering': [
            'error',
            {
                default: [
                    'static-field',
                    'public-static-method',
                    'public-instance-field',
                    'protected-instance-field',
                    'private-instance-field',
                    'public-constructor',
                    'public-instance-method',
                    'protected-instance-method',
                    'private-instance-method',
                ],
            },
        ],
        '@typescript-eslint/naming-convention': [
            'error',
            {
                selector: ['class', 'interface', 'typeAlias', 'enum', 'typeParameter'],
                format: ['PascalCase'],
                leadingUnderscore: 'forbid',
                trailingUnderscore: 'forbid',
            },
            { selector: 'enumMember', format: ['PascalCase', 'UPPER_CASE'] },
            {
                selector: 'classProperty',
                format: ['camelCase'],
                leadingUnderscore: 'forbid',
                trailingUnderscore: 'forbid',
            },
            {
                selector: 'classProperty',
                modifiers: ['private'],
                format: ['camelCase'],
                leadingUnderscore: 'allow',
            },
            {
                selector: 'classProperty',
                modifiers: ['protected'],
                format: ['camelCase'],
                leadingUnderscore: 'allow',
            },
        ],
    },
    overrides: [
        {
            env: {
                jest: true,
            },
            plugins: ['jest', 'jest-dom', 'testing-library'],
            files: ['**/*.{test,spec}.{ts,tsx}'],
            extends: [
                'plugin:jest/recommended',
                'plugin:jest-dom/recommended',
                'plugin:testing-library/react',
            ],
        },
    ],
};

module.exports = config;
