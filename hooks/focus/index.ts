import React from 'react';
import { useFocusEffect } from 'expo-router';

interface IUseScreenFocusProps {
    onFocus?: () => void;
    onFocusExit?: () => void;
}

const useScreenFocus = (props: IUseScreenFocusProps) => {
    const { onFocus } = props;

    useFocusEffect(
        React.useCallback(() => {
            if (onFocus) onFocus();

            return () => {};
        }, [])
    );
};

export default useScreenFocus;
