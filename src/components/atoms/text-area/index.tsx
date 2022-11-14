import React from 'react';
import { ITextAreaProps, TextArea } from 'native-base';

interface ITextAreaComponent extends ITextAreaProps {}

const TextAreaComponent = (props: ITextAreaComponent) => {
    return (
        <TextArea
            w="100%"
            _light={{
                bg: 'coolGray.100',
            }}
            _dark={{
                bg: 'coolGray.800',
            }}
            {...props}
        />
    );
};

export default TextAreaComponent;
