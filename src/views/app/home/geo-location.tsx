import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Button,
    Linking,
    PermissionsAndroid,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    ToastAndroid,
    View,
} from 'react-native';
import Geolocation, { GeoPosition } from 'react-native-geolocation-service';

export default function GeoLocation() {
    const [forceLocation, setForceLocation] = useState(true);
    const [highAccuracy, setHighAccuracy] = useState(true);
    const [locationDialog, setLocationDialog] = useState(true);
    const [significantChanges, setSignificantChanges] = useState(false);
    const [observing, setObserving] = useState(false);
    const [foregroundService, setForegroundService] = useState(false);
    const [useLocationManager, setUseLocationManager] = useState(false);
    const [location, setLocation] = useState<GeoPosition | null>(null);

    const watchId = useRef<number | null>(null);

    useEffect(() => {
        const requestPermissions = async () => {
            try {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.CALL_PHONE,
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATION,
                    PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS,
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
                    PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
                ]);
                if (granted === PermissionsAndroid.RESULTS) {
                } else {
                }
            } catch (err) {
                Alert.alert('Error', 'Permissions request failed');
            }
        };

        requestPermissions();
    }, []);

    const hasPermissionIOS = async () => {
        const openSetting = () => {
            Linking.openSettings().catch(() => {
                Alert.alert('Unable to open settings');
            });
        };
        const status = await Geolocation.requestAuthorization('whenInUse');

        if (status === 'granted') {
            return true;
        }

        if (status === 'denied') {
            Alert.alert('Location permission denied');
        }

        if (status === 'disabled') {
            Alert.alert(
                `Turn on Location Services to allow COZA Global App to determine your location.`,
                '',
                [
                    { text: 'Go to Settings', onPress: openSetting },
                    { text: "Don't Use Location", onPress: () => {} },
                ]
            );
        }

        return false;
    };

    const hasLocationPermission = async () => {
        if (Platform.OS === 'ios') {
            const hasPermission = await hasPermissionIOS();
            return hasPermission;
        }

        if (Platform.OS === 'android' && Platform.Version < 23) {
            return true;
        }

        const hasPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        if (hasPermission) {
            return true;
        }

        const status = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        if (status === PermissionsAndroid.RESULTS.GRANTED) {
            return true;
        }

        if (status === PermissionsAndroid.RESULTS.DENIED) {
            ToastAndroid.show(
                'Location permission denied by user.',
                ToastAndroid.LONG
            );
        } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            ToastAndroid.show(
                'Location permission revoked by user.',
                ToastAndroid.LONG
            );
        }

        return false;
    };

    const getLocation = async () => {
        const hasPermission = await hasLocationPermission();

        if (!hasPermission) {
            return;
        }

        Geolocation.getCurrentPosition(
            position => {
                setLocation(position);
            },
            error => {
                Alert.alert(`Code ${error.code}`, error.message);
                setLocation(null);
            },
            {
                accuracy: {
                    android: 'high',
                    ios: 'best',
                },
                enableHighAccuracy: highAccuracy,
                timeout: 15000,
                maximumAge: 10000,
                distanceFilter: 0,
                forceRequestLocation: forceLocation,
                forceLocationManager: useLocationManager,
                showLocationDialog: locationDialog,
            }
        );
    };

    const getLocationUpdates = async () => {
        const hasPermission = await hasLocationPermission();

        if (!hasPermission) {
            return;
        }

        // if (Platform.OS === 'android' && foregroundService) {
        //     await startForegroundService();
        // }

        setObserving(true);

        watchId.current = Geolocation.watchPosition(
            position => {
                setLocation(position);
            },
            error => {
                setLocation(null);
            },
            {
                accuracy: {
                    android: 'high',
                    ios: 'best',
                },
                enableHighAccuracy: highAccuracy,
                distanceFilter: 0,
                interval: 5000,
                fastestInterval: 2000,
                forceRequestLocation: forceLocation,
                forceLocationManager: useLocationManager,
                showLocationDialog: locationDialog,
                useSignificantChanges: significantChanges,
            }
        );
    };

    return (
        <View style={styles.mainContainer}>
            {/* <MapView coords={location?.coords || null} /> */}

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
            >
                <View>
                    <View style={styles.option}>
                        <Text>Enable High Accuracy</Text>
                        <Switch
                            onValueChange={setHighAccuracy}
                            value={highAccuracy}
                        />
                    </View>

                    {Platform.OS === 'ios' && (
                        <View style={styles.option}>
                            <Text>Use Significant Changes</Text>
                            <Switch
                                onValueChange={setSignificantChanges}
                                value={significantChanges}
                            />
                        </View>
                    )}

                    {Platform.OS === 'android' && (
                        <>
                            <View style={styles.option}>
                                <Text>Show Location Dialog</Text>
                                <Switch
                                    onValueChange={setLocationDialog}
                                    value={locationDialog}
                                />
                            </View>
                            <View style={styles.option}>
                                <Text>Force Location Request</Text>
                                <Switch
                                    onValueChange={setForceLocation}
                                    value={forceLocation}
                                />
                            </View>
                            <View style={styles.option}>
                                <Text>Use Location Manager</Text>
                                <Switch
                                    onValueChange={setUseLocationManager}
                                    value={useLocationManager}
                                />
                            </View>
                            <View style={styles.option}>
                                <Text>Enable Foreground Service</Text>
                                <Switch
                                    onValueChange={setForegroundService}
                                    value={foregroundService}
                                />
                            </View>
                        </>
                    )}
                </View>
                <View style={styles.buttonContainer}>
                    <Button title="Get Location" onPress={getLocation} />
                    <View style={styles.buttons}>
                        <Button
                            title="Start Observing"
                            onPress={getLocationUpdates}
                            disabled={observing}
                        />
                        {/* <Button
                            title="Stop Observing"
                            onPress={stopLocationUpdates}
                            disabled={!observing}
                        /> */}
                    </View>
                </View>
                <View style={styles.result}>
                    <Text>Latitude: {location?.coords?.latitude || ''}</Text>
                    <Text>Longitude: {location?.coords?.longitude || ''}</Text>
                    <Text>Heading: {location?.coords?.heading}</Text>
                    <Text>Accuracy: {location?.coords?.accuracy}</Text>
                    <Text>Altitude: {location?.coords?.altitude}</Text>
                    <Text>
                        Altitude Accuracy: {location?.coords?.altitudeAccuracy}
                    </Text>
                    <Text>Speed: {location?.coords?.speed}</Text>
                    <Text>Provider: {location?.provider || ''}</Text>
                    <Text>
                        Timestamp:{' '}
                        {location?.timestamp
                            ? new Date(location.timestamp).toLocaleString()
                            : ''}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
    },
    contentContainer: {
        padding: 12,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 12,
    },
    result: {
        borderWidth: 1,
        borderColor: '#666',
        width: '100%',
        padding: 10,
    },
    buttonContainer: {
        alignItems: 'center',
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginVertical: 12,
        width: '100%',
    },
});