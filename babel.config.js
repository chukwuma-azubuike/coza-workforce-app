module.exports = {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
        ["module-resolver", {
            "alias": {
                "@assets": "./src/assets",
                "@components": "./src/components",
                "@config": "./src/config",
                "@constants": "./src/constants",
                "@hooks": "./src/hooks",
                "@providers": "./src/providers",
                "@routes": "./src/routes",
                "@store": "./src/store",
                "@utils": "./src/utils",
                "@views": "./src/views",
                "@types": "./types"
            }
        }],
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
