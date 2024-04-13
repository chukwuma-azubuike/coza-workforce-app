import { Box } from 'native-base';
import React from 'react';
import Empty from '../../atoms/empty';

interface IRenderContainer {
    components: any[] | any;
    renderIndex: number;
}
const RenderContainer = (props: IRenderContainer) => {
    const { components, renderIndex } = props;
    return (
        <>
            {components ? (
                components.map((Component: any, index: number) => {
                    if (index === renderIndex) {
                        return (
                            <Box flex={1} key={index}>
                                {Component}
                            </Box>
                        );
                    }
                })
            ) : (
                <Empty />
            )}
        </>
    );
};

export default React.memo(RenderContainer);
