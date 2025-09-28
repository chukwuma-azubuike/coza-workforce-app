import { Linking } from 'react-native';
import { Guest } from '~/store/types';

export const handleCall = (guest: Guest) => () => {
    Linking.openURL(`tel:${guest.phoneNumber}`);
};

export const handleWhatsApp = (guest: Guest) => () => {
    Linking.openURL(`https://wa.me/${guest.phoneNumber.replace(/\D/g, '')}`);
};
