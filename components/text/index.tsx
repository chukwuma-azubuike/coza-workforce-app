import { Text } from "~/components/ui/text";
import useAppColorMode from '@hooks/theme/colorMode';
import { TextProps } from 'react-native';

interface ITextComponent extends TextProps {
    bold?: boolean;
}

export enum TEXT_SIZE {
    xs = 12,
    sm = 14,
    md = 16,
    lg = 18,
    xl = 24,
    '2xl' = 28,
}

const TextComponent: React.FC<ITextComponent> = ({ bold, ...props }) => {
    const { textColor } = useAppColorMode();

    return (<Text numberOfLines={1} lineBreakMode="tail" ellipsizeMode="tail" {...props} />);
};

export default TextComponent;
