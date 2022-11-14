module.exports = {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
        [
            'module:react-native-dotenv',
            {
                envName: 'APP_ENV',
                moduleName: '@env',
                path: '.env',
                safe: false,
                allowUndefined: true,
                verbose: false,
            },
        ],
        'react-native-reanimated/plugin', // react native reanimated must always be listes last
    ],
};
