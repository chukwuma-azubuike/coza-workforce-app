import useAppColorMode from '@hooks/theme/colorMode';
import { TextProps } from 'react-native';
import { Text } from '../ui/text';

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

    return (
        <Text
            numberOfLines={1}
            lineBreakMode="tail"
            ellipsizeMode="tail"
            {...props}
            style={
                {
                    color: textColor,
                    fontWeight: bold ? '700' : '400',
                    ...(props.style as {}),
                } as any
            }
        />
    );
};

export default TextComponent;
