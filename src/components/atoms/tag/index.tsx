import { Box, Text } from 'native-base';
import React from 'react';

interface ITagComponentProps {
    status: 'success' | 'info' | 'error' | 'warning' | 'gray';
}
const TagComponent: React.FC<ITagComponentProps> = props => {
    const { status } = props;

    return (
        <Box {...props} bg={`${status}.100`} borderRadius="lg" px={3} py={1}>
            <Text color={`${status}.600`}>{props.children}</Text>
        </Box>
    );
};

export default TagComponent;
