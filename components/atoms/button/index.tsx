import React, { ReactNode } from 'react';
import { THEME_CONFIG } from '@config/appConfig';
import { Icon } from '@rneui/themed';
import { PermissionsAndroid, TouchableOpacity, useColorScheme } from 'react-native';
import { generateExcelFile } from '@utils/generateFile';
import useAppColorMode from '@hooks/theme/colorMode';
import { View } from 'react-native';
import { Text } from 'react-native';
import Loading from '../loading';
import { Button, ButtonProps } from '~/components/ui/button';
import { cn } from '~/lib/utils';
interface IButtonComponent extends ButtonProps {
    secondary?: boolean;
}

export enum BUTTON_SIZE {
    sm = 12,
    md = 16,
    lg = 22,
    xl = 24,
}

const ButtonComponent: React.FC<IButtonComponent> = props => {
    const { loadingText, isLoading, children, secondary, icon } = props;
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
                opacity: isLoading || props?.disabled ? 0.5 : 1,
            }}
            disabled={(isLoading || props?.disabled) as boolean}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {isLoading && (
                    <View style={{ width: 10 }}>
                        <Loading />
                    </View>
                )}
                {icon}
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
                            {isLoading ? loadingText || 'Loading...' : children}
                        </Text>
                    ) : (
                        children
                    )) as ReactNode
                }
                {icon}
            </View>
        </TouchableOpacity>
    );
};

export const AddButtonComponent: React.FC<IButtonComponent> = React.memo(props => {
    return (
        <Button
            {...props}
            className={cn(
                'shadow-md justify-center items-center !rounded-full !p-0 !w-[4.4rem] !h-[4.4rem]',
                props.className
            )}
            style={{
                right: 20,
                bottom: 32,
                position: 'absolute',
            }}
        >
            <Icon name="plus" type="entypo" size={28} color="white" />
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

export const NavigationBackButton: React.FC = React.memo(props => {
    const { isDarkMode } = useAppColorMode();

    return (
        <Button
            icon={
                <Icon
                    size={24}
                    name="keyboard-backspace"
                    type="material-community"
                    color={isDarkMode ? THEME_CONFIG.lightGray : 'black'}
                />
            }
            style={{ marginLeft: 6, padding: 6 }}
            className="active:dark:bg-gray-800 active:bg-gray-100"
            {...props}
        />
    );
});

export const FloatButton: React.FC<
    ButtonProps & { iconName?: string; iconType?: string; className?: string; iconClassname?: string }
> = React.memo(({ iconName, iconClassname, iconType, className, children, ...props }) => {
    return (
        <Button
            style={{
                right: 10,
                bottom: 15,
                zIndex: 10,
                position: 'absolute',
            }}
            className={cn('!h-[3rem] gap-0.5 flex-row items-center !rounded-full', className)}
            {...props}
        >
            {iconName && iconType && (
                <Icon name={iconName} type={iconType} size={14} color="white" className={iconClassname} />
            )}

            {typeof children === 'string' && <Text className="text-white font-bold">{children}</Text>}
        </Button>
    );
});

export default React.memo(ButtonComponent);
