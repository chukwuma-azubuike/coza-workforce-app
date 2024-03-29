import React from 'react';
import { ITextAreaProps, TextArea } from 'native-base';
import { THEME_CONFIG } from '@config/appConfig';

interface ITextAreaComponent extends ITextAreaProps {}

const TextAreaComponent = (props: ITextAreaComponent) => {
    return (
        <TextArea
            p={3}
            w="100%"
            size="lg"
            {...props}
            autoCompleteType
            _light={{
                bg: 'gray.100',
            }}
            _dark={{
                bg: 'gray.900',
            }}
            borderRadius={THEME_CONFIG.borderRadius}
        />
    );
};

export default TextAreaComponent;
