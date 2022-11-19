# Getting Started with COZAGLOBALWORKFORCEAPP

## Available Scripts

In the project directory, you can run:

### `yarn install`

To download and install all dependencies

## `npx pod-install`

Install all dependencies for IOS with pod

### `yarn start`

Runs the app in the emulator or connected phone on (http://localhost:8081)

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn lint`

Runs eslint to catch and fix linting errors.

### `yarn storybook`

Launches the storybook UI to view component documentation. Follow the URL generated in the terminal if the UI isn't launched automatically.

### `yarn android`

Reinstalls the app for android

### `yarn ios`

Reinstalls the app for ios

### `format`

formats the code to prettier configuration

### FIX DEPENDENCY ISSUES

If you get an error pointing to the DatePicker library - react-native-community_datetimepicker, do this:

Go to: CozaGlobalWorkforceApp/node_modules/@react-native-community/datetimepicker/android/src/main/java/com/reactcommunity/rndatetimepicker/Common.java:76:

-   Add "final" just before the "@NonNull Context activityContext" to define the Class methods properly.
-   Run `yarn android` and it should work this time.

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**
