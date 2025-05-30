import React from 'react';
import { useFocusEffect } from 'expo-router';

interface IUseScreenFocusProps {
    onFocus?: () => void;
    onFocusExit?: () => void;
}

const useScreenFocus = (props: IUseScreenFocusProps) => {
    const { onFocus, onFocusExit } = props;

    useFocusEffect(
        React.useCallback(() => {
            if (onFocus) onFocus();

            return () => {
                if (onFocusExit) onFocusExit();
            };
        }, [])
    );
};

export default useScreenFocus;
