import { Animated, SafeAreaView, Text } from 'react-native';
import React from 'react';

import { Cursor, CodeField, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';

import styles, {
    CELL_SIZE,
    CELL_BORDER_RADIUS,
    ACTIVE_CELL_BG_COLOR,
    DEFAULT_CELL_BG_COLOR,
    NOT_EMPTY_CELL_BG_COLOR,
} from './styles';

import { Spinner } from 'native-base';

const { Value, Text: AnimatedText } = Animated;

export const CELL_COUNT = 6;

const animationsColor = [...new Array(CELL_COUNT)].map(() => new Value(0));
const animationsScale = [...new Array(CELL_COUNT)].map(() => new Value(1));
const animateCell = ({ hasValue, index, isFocused }: { hasValue: boolean; index: number; isFocused: boolean }) => {
    Animated.parallel([
        Animated.timing(animationsColor[index], {
            useNativeDriver: false,
            toValue: isFocused ? 1 : 0,
            duration: 250,
        }),
        Animated.spring(animationsScale[index], {
            useNativeDriver: false,
            toValue: hasValue ? 0 : 1,
            duration: hasValue ? 300 : 250,
        }),
    ]).start();
};

const OTPInput = ({
    render,
    value,
    setValue,
    loading,
    done,
}: {
    done: boolean;
    value: string;
    setValue: React.Dispatch<React.SetStateAction<string>>;
    loading: boolean;
    render?: Element | null;
}) => {
    const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });

    const renderCell = ({ index, symbol, isFocused }: { index: number; symbol: boolean; isFocused: boolean }) => {
        const hasValue = Boolean(symbol);
        const animatedCellStyle = {
            backgroundColor: hasValue
                ? animationsScale[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [NOT_EMPTY_CELL_BG_COLOR, ACTIVE_CELL_BG_COLOR],
                  })
                : animationsColor[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [DEFAULT_CELL_BG_COLOR, ACTIVE_CELL_BG_COLOR],
                  }),
            borderRadius: animationsScale[index].interpolate({
                inputRange: [0, 1],
                outputRange: [CELL_SIZE, CELL_BORDER_RADIUS],
            }),
            transform: [
                {
                    scale: animationsScale[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.2, 1],
                    }),
                },
            ],
        };

        // Run animation on next event loop tik
        // Because we need first return new style prop and then animate this value
        setTimeout(() => {
            animateCell({ hasValue, index, isFocused });
        }, 0);

        return (
            <AnimatedText key={index} style={[styles.cell, animatedCellStyle]} onLayout={getCellOnLayoutHandler(index)}>
                {symbol || (isFocused ? <Cursor /> : null)}
            </AnimatedText>
        );
    };

    const handleChange = (e: string) => {
        setValue(e);
        if (e.length === CELL_COUNT) {
            // Api call
        }
    };

    return (
        <SafeAreaView style={styles.root}>
            {loading ? (
                <Spinner size="lg" color="primary.500" />
            ) : done ? (
                render
            ) : (
                <>
                    <Text style={styles.title}>Verification</Text>
                    <Text style={styles.subTitle}>Please enter the OTP code we sent to your email address</Text>

                    <CodeField
                        ref={ref}
                        autoFocus
                        {...props}
                        value={value}
                        cellCount={CELL_COUNT}
                        onChangeText={handleChange}
                        renderCell={renderCell as any}
                        keyboardType="number-pad"
                        textContentType="oneTimeCode"
                        rootStyle={styles.codeFieldRoot}
                    />
                </>
            )}
        </SafeAreaView>
    );
};

export default React.memo(OTPInput);
