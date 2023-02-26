import { Box, Text } from 'native-base';
import React from 'react';

interface ITagComponentProps {
    status: 'success' | 'info' | 'error' | 'warning' | 'gray';
}
const TagComponent: React.FC<ITagComponentProps> = props => {
    const { status } = props;

    return (
        <Box
            {...props}
            _light={{ bg: `${status}.100` }}
            _dark={{ bg: `${status}.800` }}
            borderRadius="lg"
            px={3}
            py={1}
        >
            <Text _light={{ color: `${status}.600` }} _dark={{ color: `${status}.400` }}>
                {props.children}
            </Text>
        </Box>
    );
};

export default TagComponent;
