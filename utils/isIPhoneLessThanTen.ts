import { Platform } from 'react-native';
import hasNumberBelow from './hasNumberBelow';
import DeviceInfo from 'react-native-device-info';

const isIphoneLessThanTen = () => {
    if (Platform.OS === 'ios' && hasNumberBelow(DeviceInfo.getModel(), 10)) {
        return true;
    }

    return false;
};

export default isIphoneLessThanTen;
