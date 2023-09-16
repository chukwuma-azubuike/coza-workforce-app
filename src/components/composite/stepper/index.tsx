/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import StepIndicator from 'react-native-step-indicator';
import { StepIndicatorStyles } from 'react-native-step-indicator/lib/typescript/src/types';
import Swiper from 'react-native-swiper';
import { THEME_CONFIG } from '@config/appConfig';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';

export interface IRegisterPagesProps {
    label: string;
    component: React.FC<any> | string;
}

const firstIndicatorStyles: StepIndicatorStyles = {
    stepIndicatorSize: 30,
    currentStepIndicatorSize: 40,
    separatorStrokeWidth: 3,
    currentStepStrokeWidth: 5,
    separatorFinishedColor: THEME_CONFIG.primaryLight,
    separatorUnFinishedColor: THEME_CONFIG.primaryLight,
    stepIndicatorFinishedColor: THEME_CONFIG.primaryLight,
    stepIndicatorUnFinishedColor: THEME_CONFIG.veryLightGray,
    stepIndicatorCurrentColor: '#ffffff',
    stepIndicatorLabelFontSize: 15,
    currentStepIndicatorLabelFontSize: 15,
    stepIndicatorLabelCurrentColor: '#000000',
    stepIndicatorLabelFinishedColor: '#ffffff',
    stepIndicatorLabelUnFinishedColor: 'white',
    labelColor: '#666666',
    labelSize: 12,
    currentStepLabelColor: THEME_CONFIG.primaryLight,
    stepStrokeCurrentColor: THEME_CONFIG.primaryLight,
    stepStrokeWidth: 3,
    separatorStrokeFinishedWidth: 4,
    stepStrokeFinishedColor: THEME_CONFIG.primaryLight,
    stepStrokeUnFinishedColor: 'white',
};

interface IStepperProps {
    otherProps?: any;
    pages: IRegisterPagesProps[];
    stepIndicator?: boolean;
    disableSwipe?: boolean;
    navigation?: NativeStackNavigationProp<ParamListBase, string, undefined>;
}

const Stepper: React.FC<IStepperProps> = ({ pages, otherProps, navigation, disableSwipe, stepIndicator }) => {
    const LABELS = React.useMemo(() => pages.map(page => page.label), pages);

    const [currentPage, setCurrentPage] = React.useState<number>(0);

    const onStepPress = (position: number) => {
        setCurrentPage(position);
    };

    const renderLabel = ({
        position,
        label,
        currentPosition,
    }: {
        position: number;
        stepStatus: string;
        label: string;
        currentPosition: number;
    }) => {
        return <Text style={position === currentPosition ? styles.stepLabelSelected : styles.stepLabel}>{label}</Text>;
    };

    return (
        <View style={styles.container}>
            {stepIndicator && (
                <View style={styles.stepIndicator}>
                    <StepIndicator
                        labels={LABELS}
                        onPress={onStepPress}
                        renderLabel={renderLabel}
                        currentPosition={currentPage}
                        customStyles={firstIndicatorStyles}
                    />
                </View>
            )}
            <Swiper
                style={{ flexGrow: 1 }}
                scrollEnabled={!disableSwipe}
                loadMinimal
                loop={false}
                dotStyle={{}}
                autoplay={false}
                index={currentPage}
                onIndexChanged={page => {
                    setCurrentPage(page);
                }}
                activeDotColor={THEME_CONFIG.primaryLight}
            >
                {pages.map((page, index) => (
                    <page.component key={index} {...otherProps} navigation={navigation} onStepPress={onStepPress} />
                ))}
            </Swiper>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    stepIndicator: {
        marginTop: 30,
    },
    page: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepLabel: {
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '500',
        color: '#999999',
    },
    stepLabelSelected: {
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '500',
        color: THEME_CONFIG.primaryLight,
    },
});

export default Stepper;
