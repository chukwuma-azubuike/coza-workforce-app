import { Text } from '~/components/ui/text';
import React, { ReactNode } from 'react';
import { View, ScrollView, StyleSheet, useColorScheme, ColorSchemeName } from 'react-native';
import { BottomSheet, Divider } from '@rneui/base';
import { Button } from '~/components/ui/button';

interface IBottomSheetComponent {
    isVisible: boolean;
    title: string;
    content: ReactNode;
    toggleBottomSheet: () => void;
}

const BottomSheetComponent: React.FC<IBottomSheetComponent> = ({ isVisible, title, content, toggleBottomSheet }) => {
    const colorScheme = useColorScheme(); // Detect current color scheme

    // Dynamic styles based on the current color scheme
    const dynamicStyles = styles(colorScheme);

    return (
        <View style={dynamicStyles.container}>
            <BottomSheet
                isVisible={isVisible}
                onBackdropPress={toggleBottomSheet}
                containerStyle={dynamicStyles.bottomSheetContainer}
            >
                <View style={dynamicStyles.contentContainer}>
                    <ScrollView contentContainerStyle={dynamicStyles.scrollContent}>
                        <Text className="font-bold">{title}</Text>
                        <Text>{content}</Text>
                        <Divider orientation="horizontal" width={100} />
                        <Button className="bg-rose-500" onPress={toggleBottomSheet}>
                            Close
                        </Button>
                    </ScrollView>
                </View>
            </BottomSheet>
        </View>
    );
};

// Stylesheet that adapts to light and dark modes
const styles = (colorScheme: ColorSchemeName) =>
    StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        bottomSheetContainer: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Backdrop transparency remains the same
        },
        contentContainer: {
            backgroundColor: colorScheme === 'dark' ? '#1c1c1c' : 'white',
            padding: 20,
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
        },
        scrollContent: {
            alignItems: 'center',
        },
        title: {
            fontSize: 26,
            marginBottom: 20,
            textAlign: 'left',
        },
        item: {
            fontSize: 20,
            marginBottom: 10,
        },
    });

export default BottomSheetComponent;
