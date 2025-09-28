module.exports = {
    root: true,
    extends: [
        '@react-native-community',
        'plugin:react-hooks/recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    plugins: [
        'react',
        'react-hooks',
        '@typescript-eslint',
        'react-native',
    ],
    rules: {
        // React Hooks rules
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',

        // React specific rules
        'react/jsx-uses-react': 'error',
        'react/jsx-uses-vars': 'error',
        'react/no-unstable-nested-components': [
            'error',
            { allowAsProps: true }
        ],
        'react/jsx-key': ['error', { checkFragmentShorthand: true }],

        // TypeScript specific rules
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-non-null-assertion': 'warn',
        '@typescript-eslint/no-unused-vars': ['error', {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
        }],

        // React Native specific rules
        'react-native/no-unused-styles': 'error',
        'react-native/no-inline-styles': 'warn',
        'react-native/no-raw-text': ['error', {
            skip: ['Text.Link', 'CustomText']
        }],
        'react-native/no-single-element-style-arrays': 'error',

        // General rules for hooks and effects
        'react/hook-use-state': 'error',
        'react/no-array-index-key': 'warn',

        // Custom rules for dependency arrays
        'react/jsx-no-constructed-context-values': 'error',
        'react/jsx-no-useless-fragment': 'warn',

        // Performance related rules
        'react/no-inline-function-definition-in-props': 'warn',
        'react/jsx-no-bind': ['warn', {
            allowArrowFunctions: true,
            allowFunctions: false,
            allowBind: false,
        }],
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
    overrides: [
        {
            files: ['*.ts', '*.tsx'],
            rules: {
                '@typescript-eslint/explicit-function-return-type': ['warn', {
                    allowExpressions: true,
                    allowTypedFunctionExpressions: true,
                }],
            },
        },
    ],
};
