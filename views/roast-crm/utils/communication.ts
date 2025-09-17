import { Linking } from 'react-native';
import { Guest } from '~/store/types';

export const handleCall = (guest: Guest) => () => {
    Linking.openURL(`tel:${guest.phone}`);
};

export const handleWhatsApp = (guest: Guest) => () => {
    Linking.openURL(`https://wa.me/${guest.phone.replace(/\D/g, '')}`);
};
