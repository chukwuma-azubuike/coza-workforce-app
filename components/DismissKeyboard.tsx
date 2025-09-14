import { Keyboard, TouchableWithoutFeedback, TouchableWithoutFeedbackProps } from 'react-native';

const DismissKeyboard: React.FC<TouchableWithoutFeedbackProps> = ({ children, ...props }) => (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} {...props}>
        <>{children}</>
    </TouchableWithoutFeedback>
);

export { DismissKeyboard };
