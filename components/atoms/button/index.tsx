import React, { ReactNode } from 'react';
import { IButtonProps, IconButton } from 'native-base';
import { THEME_CONFIG } from '@config/appConfig';
import { Icon } from '@rneui/themed';
import { ResponsiveValue, ThemeComponentSizeType } from 'native-base/lib/typescript/components/types';
import { PermissionsAndroid, TouchableOpacity, useColorScheme } from 'react-native';
import { generateExcelFile } from '@utils/generateFile';
import useAppColorMode from '@hooks/theme/colorMode';
import { InterfaceIconButtonProps } from 'native-base/lib/typescript/components/composites/IconButton/types';
import { View } from 'react-native';
import { Text } from 'react-native';
import Loading from '../loading';
import { Button, ButtonProps } from '~/components/ui/button';
interface IButtonComponent extends IButtonProps {
    size?: ThemeComponentSizeType<'Button'>;
    secondary?: boolean;
    borderRadius?: ResponsiveValue<
        'lg' | 'md' | 'sm' | 'xs' | 'xl' | '2xl' | (string & {}) | (number & {}) | 'none' | '3xl' | 'full'
    >;
    shadow?: ResponsiveValue<
        (string & {}) | (number & {}) | 'none' | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
    >;
}

export enum BUTTON_SIZE {
    sm = 12,
    md = 16,
    lg = 22,
    xl = 24,
}

const ButtonComponent: React.FC<IButtonComponent> = props => {
    const { isLoadingText, isLoading, children, secondary, leftIcon, rightIcon } = props;
    const scheme = useColorScheme();

    const OUTLINE_THEME = {
        background: scheme === 'dark' ? 'black' : 'white',
        text: scheme === 'dark' ? THEME_CONFIG.primaryLight : THEME_CONFIG.primary,
    };

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={props?.onPress as any}
            style={{
                display: 'flex',
                borderRadius: 8,
                marginVertical: 10,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                borderWidth: secondary ? 0.6 : 0,
                borderColor: secondary ? THEME_CONFIG.lightGray : undefined,
                backgroundColor: secondary ? THEME_CONFIG.transparent : THEME_CONFIG.primary,
                ...(props?.style as {}),
                opacity: isLoading || props?.disabled || props?.isDisabled ? 0.5 : 1,
            }}
            disabled={(isLoading || props?.disabled || props?.isDisabled) as boolean}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {isLoading && (
                    <View style={{ width: 10 }}>
                        <Loading />
                    </View>
                )}
                {leftIcon}
                {
                    (typeof children === 'string' ? (
                        <Text
                            style={
                                {
                                    textAlign: 'center',
                                    color: secondary ? OUTLINE_THEME.text : 'white',
                                    fontSize: BUTTON_SIZE[(props.size || 'lg') as any],
                                    padding: (BUTTON_SIZE[(props.size || 'lg') as any] as any) / 1.4,
                                } as any
                            }
                        >
                            {isLoading ? isLoadingText || 'Loading...' : children}
                        </Text>
                    ) : (
                        children
                    )) as ReactNode
                }
                {rightIcon}
            </View>
        </TouchableOpacity>
    );
};

export const AddButtonComponent: React.FC<IButtonComponent> = React.memo(props => {
    return (
        <Button
            {...props}
            className="shadow-md"
            style={{
                right: 20,
                bottom: 24,
                width: 60,
                height: 60,
                borderRadius: 200,
                position: 'absolute',
            }}
        >
            <Icon name="plus" type="entypo" size={36} color="white" />
        </Button>
    );
});

interface IDownloadButton extends IButtonComponent {
    type: 'excel' | 'pdf' | 'csv';
    fileName: string;
    data: any[];
}

export const DownloadButton: React.FC<IDownloadButton> = React.memo(({ data, type, fileName, ...props }) => {
    const handleDownload = async () => {
        try {
            // Check for Permission (check if permission is already given or not)
            let isPermitedExternalStorage = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
            );

            if (!isPermitedExternalStorage) {
                // Ask for permission
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        buttonPositive: 'OK',
                        buttonNegative: 'Cancel',
                        buttonNeutral: 'Ask Me Later',
                        title: 'Storage permission needed',
                        message: 'We need access to store data on your local drive.',
                    }
                );

                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    // Permission Granted (calling our exportDataToExcel function)
                    generateExcelFile(data, fileName);
                } else {
                    // Permission denied
                }
            } else {
                // Already have Permission (calling our exportDataToExcel function)
                generateExcelFile(data, fileName);
            }
        } catch (e) {
            return;
        }
    };

    return (
        <Button
            size="md"
            className="shadow-md"
            style={{
                right: 6,
                bottom: 6,
                width: 60,
                height: 60,
                borderRadius: 'full',
                position: 'absolute',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            {...props}
            onPress={handleDownload}
        >
            <Icon name="download-outline" type="ionicon" size={36} color="white" />
        </Button>
    );
});

export const NavigationBackButton: React.FC<InterfaceIconButtonProps> = React.memo(props => {
    const { isDarkMode } = useAppColorMode();

    return (
        <IconButton
            icon={
                <Icon
                    size={24}
                    name="keyboard-backspace"
                    type="material-community"
                    color={isDarkMode ? THEME_CONFIG.lightGray : 'black'}
                />
            }
            style={{ marginLeft: 6, padding: 6 }}
            _pressed={{ _dark: { backgroundColor: 'gray.800' }, _light: { backgroundColor: 'gray.100' } }}
            {...props}
        />
    );
});

export const FloatButton: React.FC<ButtonProps & { iconName: string; iconType: string; className: string }> =
    React.memo(({ iconName, iconType, className, ...props }) => {
        return (
            <Button
                style={{
                    right: 20,
                    bottom: 100,
                    width: 60,
                    height: 60,
                    zIndex: 10,
                    borderRadius: 32,
                    position: 'absolute',
                }}
                className={className}
                {...props}
            >
                <Icon name={iconName} type={iconType} size={28} color="white" />
            </Button>
        );
    });

export default React.memo(ButtonComponent);
