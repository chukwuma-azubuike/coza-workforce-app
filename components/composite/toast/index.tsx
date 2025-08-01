import { Text } from '~/components/ui/text';
import { View } from 'react-native';
import React from 'react';
import { Alert, CloseIcon, IconButton, useToast } from 'native-base';
import { ResponsiveValue } from 'native-base/lib/typescript/components/types';

interface IToastProps {
    id?: string;
    status: 'error' | 'success' | 'warning' | 'info' | undefined;
    variant?: ResponsiveValue<
        'outline' | 'subtle' | 'solid' | 'left-accent' | 'top-accent' | 'outline-light' | (string & {})
    >;
    title: string;
    description: string;
    isClosable?: boolean;
}

const ToastUI = ({ id, status, variant, title, description, isClosable, ...rest }: IToastProps) => {
    const toast = useToast();

    const handlePress = () => toast.close(id);

    return (
        <Alert
            maxWidth="100%"
            alignSelf="center"
            flexDirection="row"
            status={status ? status : 'info'}
            variant={variant}
            {...rest}
        >
            <View space={1} flexShrink={1} w="100%">
                <View flexShrink={1} alignItems="center" justifyContent="space-between">
                    <View space={2} flexShrink={1} alignItems="center">
                        <Alert.Icon />
                        <Text
                            fontSize="md"
                            fontWeight="medium"
                            flexShrink={1}
                            color={variant === 'solid' ? 'lightText' : variant !== 'outline' ? 'darkText' : null}
                        >
                            {title}
                        </Text>
                    </View>
                    {isClosable ? (
                        <IconButton
                            variant="unstyled"
                            icon={<CloseIcon size="3" />}
                            _icon={{
                                color: variant === 'solid' ? 'lightText' : 'darkText',
                            }}
                            onPress={handlePress}
                        />
                    ) : null}
                </View>
                <Text color={variant === 'solid' ? 'lightText' : variant !== 'outline' ? 'darkText' : null}>
                    {description}
                </Text>
            </View>
        </Alert>
    );
};

export default React.memo(ToastUI);
