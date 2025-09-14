import * as React from 'react';

import { StyleSheet } from 'react-native';
import RNPhoneInput, { PhoneInputProps } from 'react-native-international-phone-number';

import { cn } from '~/lib/utils';
import { useColorScheme } from '~/lib/useColorScheme';
import formatToE164 from '~/utils/formatToE164';

const PhoneInput: React.FC<PhoneInputProps & { error?: string; touched?: boolean; callingCode?: string }> = ({
    className,
    selectedCountry,
    placeholderClassName,
    error,
    touched,
    ...props
}) => {
    const { isDarkColorScheme } = useColorScheme();

    const value = React.useMemo(
        () => formatToE164((props.value as string) || '', selectedCountry?.callingCode || '+234'),
        [props.value, selectedCountry?.callingCode]
    );

    return (
        <RNPhoneInput
            className={cn(
                'w-full border border-input rounded-xl web:flex h-10 native:h-16 web:w-full px-3 web:py-2 text-base lg:text-sm native:text-lg native:leading-[1.25] text-foreground placeholder:text-muted-foreground web:ring-offset-background file:border-0 file:bg-transparent file:font-medium web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
                props.editable === false && 'opacity-50 web:cursor-not-allowed',
                error && touched && 'border-destructive',
                className
            )}
            selectedCountry={selectedCountry as any}
            phoneInputStyles={isDarkColorScheme ? PhoneInputStylesDark : PhoneInputStylesLight}
            theme={isDarkColorScheme ? 'dark' : 'light'}
            placeholderClassName={cn('text-muted-foreground', placeholderClassName)}
            value={value as any}
            {...props}
        />
    );
};

PhoneInput.displayName = 'PhoneInput';

export { PhoneInput };

const PhoneInputStylesLight = StyleSheet.create({
    container: {
        height: 56,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#b5b5be66',
        backgroundColor: '#ffffff',
    },
    flagContainer: {
        borderTopLeftRadius: 7,
        borderBottomLeftRadius: 7,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
    },
    flag: {
        backgroundColor: '#ffffff',
    },
    caret: {
        color: '#b5b5be66',
        fontSize: 16,
    },
    divider: {
        backgroundColor: '#b5b5be66',
    },
    callingCode: {
        fontSize: 16,
        fontWeight: 'light',
        color: '#333',
    },
    input: {
        color: '#333',
        borderWidth: 0,
    },
});

const PhoneInputStylesDark = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
        borderWidth: 0.5,
        borderStyle: 'solid',
        borderColor: '#28282B',
        height: 56,
    },
    flagContainer: {
        borderTopLeftRadius: 7,
        borderBottomLeftRadius: 7,
        backgroundColor: 'transparent',
        justifyContent: 'center',
    },
    flag: {
        backgroundColor: 'transparent',
    },
    caret: {
        color: '#F3F3F3',
        fontSize: 16,
    },
    divider: {
        backgroundColor: '#28282B',
    },
    callingCode: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#F3F3F3',
        backgroundColor: 'transparent',
    },
    input: {
        color: '#F3F3F3',
        height: 52,
        borderWidth: 0,
        backgroundColor: 'transparent',
    },
});
