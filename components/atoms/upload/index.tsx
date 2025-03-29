import React from 'react';
import ButtonComponent from '../button';
import { Icon } from '@rneui/themed';
import { Center, IButtonProps, Text } from 'native-base';
import { IUploadResponseImgBB } from '@hooks/upload';
import { THEME_CONFIG } from '@config/appConfig';

interface IUploadButton extends IButtonProps {
    error: string;
    isError: boolean;
    isSuccess: boolean;
    data: IUploadResponseImgBB['data'];
}

const UploadButton: React.FC<IUploadButton> = props => {
    const { isError, isSuccess, data, error } = props;

    return (
        <ButtonComponent
            _loading={{ color: 'primary.600' }}
            isLoadingText="Uploading..."
            secondary
            w="full"
            style={{ minHeight: 90, paddingVertical: 10 }}
            pb={0}
            {...props}
        >
            {!props?.isLoading && (
                <Center p={0}>
                    <Icon
                        size={40}
                        type={isError ? 'MaterialIcons' : 'feather'}
                        name={isSuccess ? 'check-circle' : isError ? 'error-outline' : 'upload'}
                        color={isSuccess ? THEME_CONFIG.success : isError ? THEME_CONFIG.error : THEME_CONFIG.primary}
                    />
                    {!isSuccess && (
                        <Text mt={3} color="gray.400">
                            {props.children}
                        </Text>
                    )}
                    <Text mt={3}>{isSuccess ? data?.image.filename : ''}</Text>
                    {error && (
                        <Text color="error.500" mt={3}>
                            {JSON.stringify(error)}
                        </Text>
                    )}
                </Center>
            )}
        </ButtonComponent>
    );
};

export default React.memo(UploadButton);
