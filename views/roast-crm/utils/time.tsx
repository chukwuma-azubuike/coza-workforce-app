import { ContactChannel } from '~/store/types';
import { Clock, Phone, MessageCircle, MapPin, MessageSquare } from 'lucide-react-native';

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
            return <Phone className="w-4 h-4" />;
        case ContactChannel.WHATSAPP:
            return <MessageCircle className="w-4 h-4" />;
        case ContactChannel.VISIT:
            return <MapPin className="w-4 h-4" />;
        case 'milestone':
            return <Clock className="w-4 h-4" />;
        default:
            return <MessageSquare className="w-4 h-4" />;
    }
};
