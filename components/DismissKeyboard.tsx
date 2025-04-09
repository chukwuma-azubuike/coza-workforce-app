import { Keyboard, TouchableWithoutFeedback, TouchableWithoutFeedbackProps } from 'react-native';

const DismissKeyboard: React.FC<TouchableWithoutFeedbackProps> = (props) => (
	<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} {...props} />
);

export { DismissKeyboard };
