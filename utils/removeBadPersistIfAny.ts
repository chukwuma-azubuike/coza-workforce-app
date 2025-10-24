import AsyncStorage from '@react-native-async-storage/async-storage';

async function removeBadPersistIfAny() {
    try {
        const raw = await AsyncStorage.getItem('persist:root'); // default persist key
        if (!raw) return;
        // cheap heuristic checks for serialized react element
        if (raw.includes('"$$typeof"') || (raw.includes('"type"') && raw.includes('"props"'))) {
            console.warn('Found suspicious persisted data — clearing persist:root');
            await AsyncStorage.removeItem('persist:root');
        }
    } catch (e) {
        console.warn('Error checking persisted root', e);
    }
}

// call BEFORE persistStore(store) or before App renders
export default removeBadPersistIfAny;
