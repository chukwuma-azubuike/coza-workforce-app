import React from 'react';
import { Button, IButtonProps } from 'native-base';
import { THEME_CONFIG } from '@config/appConfig';
import { Icon } from '@rneui/themed';
import { ResponsiveValue, ThemeComponentSizeType } from 'native-base/lib/typescript/components/types';
import { PermissionsAndroid } from 'react-native';
import { generateExcelFile } from '@utils/generateFile';
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

const ButtonComponent: React.FC<IButtonComponent> = props => {
    const { borderRadius, secondary, shadow, size, width, isLoadingText } = props;
    return (
        <Button
            {...props}
            size={size ? size : 'lg'}
            padding={props.padding ? props.padding : size ? 2 : 3}
            width={width ? width : 'full'}
            isLoadingText={isLoadingText ? isLoadingText : 'Loading...'}
            borderRadius={borderRadius ? borderRadius : THEME_CONFIG.borderRadius}
            _dark={{
                _text: {
                    fontSize: size ? undefined : 'xl',
                    color: secondary ? 'primary.500' : 'white',
                },
            }}
            _light={{
                _text: {
                    fontSize: size ? undefined : 'xl',
                    color: secondary ? 'primary.600' : 'white',
                },
            }}
            shadow={shadow ? shadow : secondary ? 'none' : 2}
            variant={props.variant ? props.variant : secondary ? 'outline' : 'solid'}
        >
            {props.children}
        </Button>
    );
};

export const AddButtonComponent: React.FC<IButtonComponent> = props => {
    return (
        <ButtonComponent
            {...props}
            right={6}
            bottom={6}
            width={60}
            height={60}
            shadow={6}
            borderRadius="full"
            position="absolute"
            justifyContent="center"
            alignItems="center"
            size="md"
        >
            <Icon name="plus" type="entypo" size={36} color="white" />
        </ButtonComponent>
    );
};

interface IDownloadButton extends IButtonComponent {
    type: 'excel' | 'pdf' | 'csv';
    fileName: string;
    data: any[];
}

export const DownloadButton: React.FC<IDownloadButton> = ({ data, type, fileName, ...props }) => {
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
        <ButtonComponent
            size="md"
            right={6}
            bottom={6}
            shadow={6}
            width={60}
            height={60}
            borderRadius="full"
            position="absolute"
            alignItems="center"
            justifyContent="center"
            {...props}
            onPress={handleDownload}
        >
            <Icon name="download-outline" type="ionicon" size={36} color="white" />
        </ButtonComponent>
    );
};

export default ButtonComponent;
