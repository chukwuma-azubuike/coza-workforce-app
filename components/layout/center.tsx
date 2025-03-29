import { View, ViewProps } from 'react-native';

interface ICenterProps extends ViewProps {}

const CenterComponent: React.FC<ICenterProps> = ({ children, ...props }) => {
    return (
        <View
            {...props}
            style={{
                flex: 1,
                alignItems: 'center',
                flexDirection: 'column',
                justifyContent: 'center',
                ...(props.style as {}),
            }}
        >
            <View style={{ justifyContent: 'center', flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                {children}
            </View>
        </View>
    );
};

export default CenterComponent;
