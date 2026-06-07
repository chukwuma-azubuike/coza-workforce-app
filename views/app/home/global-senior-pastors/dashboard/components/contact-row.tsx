import React from 'react';
import { Linking, TouchableOpacity, View } from 'react-native';
import { Mail, MessageCircle, Phone } from 'lucide-react-native';
import { Text } from '~/components/ui/text';
import { THEME_CONFIG } from '@config/appConfig';
import { IGspContact } from '@store/services/gsp-dashboard';

interface ContactRowProps {
    contact: IGspContact;
}

interface ContactAction {
    key: keyof IGspContact;
    label: string;
    icon: React.ReactNode;
    bg: string;
    iconColor: string;
}

const open = async (uri: string) => {
    try {
        const can = await Linking.canOpenURL(uri);
        if (can) await Linking.openURL(uri);
    } catch {
        // silently ignore — device may not support the scheme
    }
};

// WhatsApp icon as simple text since lucide doesn't ship it
const WhatsAppIcon: React.FC<{ color: string }> = ({ color }) => (
    <Text style={{ color, fontSize: 15, fontWeight: '700', lineHeight: 18 }}>W</Text>
);

/** Horizontal row of Call / SMS / WhatsApp / Email deeplink buttons.
 *  Each button only renders when the corresponding URI is present. */
const ContactRow: React.FC<ContactRowProps> = ({ contact }) => {
    const actions: ContactAction[] = [
        {
            key: 'tel',
            label: 'Call',
            icon: <Phone size={18} color={THEME_CONFIG.success} />,
            bg: 'bg-green-100 dark:bg-green-900/40',
            iconColor: THEME_CONFIG.success,
        },
        {
            key: 'sms',
            label: 'SMS',
            icon: <MessageCircle size={18} color={THEME_CONFIG.info} />,
            bg: 'bg-blue-100 dark:bg-blue-900/40',
            iconColor: THEME_CONFIG.info,
        },
        {
            key: 'whatsapp',
            label: 'WhatsApp',
            icon: <WhatsAppIcon color="#25D366" />,
            bg: 'bg-[#dcfce7] dark:bg-[#14532d]/40',
            iconColor: '#25D366',
        },
        {
            key: 'email',
            label: 'Email',
            icon: <Mail size={18} color={THEME_CONFIG.warning} />,
            bg: 'bg-amber-100 dark:bg-amber-900/40',
            iconColor: THEME_CONFIG.warning,
        },
    ];

    const available = actions.filter(a => !!contact[a.key]);
    if (!available.length) return null;

    return (
        <View className="flex-row gap-3">
            {available.map(a => (
                <TouchableOpacity
                    key={a.key}
                    activeOpacity={0.7}
                    onPress={() => open(contact[a.key]!)}
                    className={`flex-1 items-center justify-center gap-1.5 py-3 rounded-2xl ${a.bg}`}
                >
                    {a.icon}
                    <Text className="!text-[11px] font-semibold text-foreground">{a.label}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

export default React.memo(ContactRow);
