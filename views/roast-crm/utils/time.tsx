import { ContactChannel } from '~/store/types';
import { Clock, Phone, MessageCircle, MapPin, MessageSquare } from 'lucide-react-native';
import { Icon } from '@rneui/base';
import { THEME_CONFIG } from '~/config/appConfig';

export const formatTimelineDate = (date: string | Date) => {
    const now = new Date();
    const eventDate = new Date(date);
    const diffMs = now.getTime() - eventDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return eventDate.toLocaleDateString();
};

export const getTimelineIcon = (type: string) => {
    switch (type) {
        case ContactChannel.CALL:
            return <Icon name="phone" type="feather" size={18} color={THEME_CONFIG.blue} />;
        case ContactChannel.WHATSAPP:
            return <Icon type="ionicon" name="logo-whatsapp" size={18} color={THEME_CONFIG.blue} />;
        case ContactChannel.VISIT:
            return <Icon type="ionicon" name="location-outline" size={18} color={THEME_CONFIG.blue} />;
        case ContactChannel.SMS:
            return <Icon type="material-community" name="message-text-outline" size={18} color={THEME_CONFIG.blue} />;
        default:
            return <Icon type="material-community" name="message-text-outline" size={18} color={THEME_CONFIG.blue} />;
    }
};
