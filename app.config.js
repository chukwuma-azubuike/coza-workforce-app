const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';
// Production is the default/fallback if APP_VARIANT is not 'development' or 'preview'

// Helper function to get the base bundle ID for the platform
// It uses the original bundle IDs from your app.json (via the passed 'config' object) as the default for production
const getBaseBundleIdentifier = (platform, originalConfig) => {
    if (platform === 'ios') {
        // Use the bundleIdentifier from the original config, or a sensible default if somehow missing
        return originalConfig.ios?.bundleIdentifier || 'com.cozaworkforceapp';
    }
    if (platform === 'android') {
        // Use the package from the original config, or a sensible default if somehow missing
        return originalConfig.android?.package || 'com.cozaglobalworkforceapp';
    }
    // This case should ideally not be reached if platform is always 'ios' or 'android'
    return `com.${(originalConfig.slug || 'defaultapp').replace(/-/g, '')}.${platform}`;
};

// Updated to use the actual app identifiers and names from the base config
const getDynamicUniqueIdentifier = (platform, baseConfig) => {
    const baseIdentifier = getBaseBundleIdentifier(platform, baseConfig);
    if (IS_DEV) {
        // TODO: Add a development identifier with a .development suffix after generating google services file for development
        return `${baseIdentifier}`;
    }
    if (IS_PREVIEW) {
        return `${baseIdentifier}.staging`;
    }
    return baseIdentifier; // Production uses the base identifier
};

const getDynamicAppName = (baseConfig) => {
    const baseName = baseConfig.name || "COZA Workforce"; // Use original name or fallback
    if (IS_DEV) {
        return `${baseName} Dev`;
    }
    if (IS_PREVIEW) {
        return `${baseName} Staging`;
    }
    return baseName; // Production uses the base name
};

// Get version code for Android
const getAndroidVersionCode = (baseConfig) => {
    const baseVersionCode = baseConfig.android?.versionCode || 1;
    return baseVersionCode;
};

// Get build number for iOS
const getIOSBuildNumber = (baseConfig) => {
    const baseBuildNumber = parseInt(baseConfig.ios?.buildNumber || "1", 10);
    
    if (IS_DEV) {
        return `${baseBuildNumber}.0`;
    }
    if (IS_PREVIEW) {
        return `${baseBuildNumber}.1`;
    }
    return `${baseBuildNumber}`;
};

export default ({ config }) => {
    // 'config' is the base configuration object, containing all settings
    // from your original app.json's "expo" field.

    // Dynamically set the name by modifying the incoming config object
    config.name = getDynamicAppName(config);

    // Dynamically set bundle identifier for iOS
    if (config.ios) {
        config.ios.bundleIdentifier = getDynamicUniqueIdentifier('ios', config);
        config.ios.buildNumber = getIOSBuildNumber(config);
    } else {
        config.ios = {
            bundleIdentifier: getDynamicUniqueIdentifier('ios', config),
            buildNumber: getIOSBuildNumber(config)
        };
    }

    // Dynamically set package for Android
    if (config.android) {
        config.android.package = getDynamicUniqueIdentifier('android', config);
        config.android.versionCode = getAndroidVersionCode(config);
    } else {
        config.android = {
            package: getDynamicUniqueIdentifier('android', config),
            versionCode: getAndroidVersionCode(config)
        };
    }

    // Make sure APP_VARIANT is added to extra
    config.extra = {
        ...(config.extra || {}),
        APP_VARIANT: process.env.APP_VARIANT || 'production'
    };

    // The 'config' object has now been modified with your dynamic values.
    // Return the modified config object for Expo to use.
    return config;
};
