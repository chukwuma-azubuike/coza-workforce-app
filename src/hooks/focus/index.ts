import React from 'react';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';

interface IUseScreenFocusProps {
    onFocus?: () => void;
    onFocusExit?: () => void;
}

const useScreenFocus = (props: IUseScreenFocusProps) => {
    const { onFocus, onFocusExit } = props;

    const isScreenFocused = useIsFocused();
    const isScreenNotFocused = !isScreenFocused;

    useFocusEffect(
        React.useCallback(() => {
            if (isScreenFocused && onFocus) onFocus();

            return () => {};
        }, [isScreenFocused])
    );

    useFocusEffect(
        React.useCallback(() => {
            if (isScreenNotFocused && onFocusExit) onFocusExit();

            return () => {};
        }, [isScreenNotFocused])
    );
};

export default useScreenFocus;
