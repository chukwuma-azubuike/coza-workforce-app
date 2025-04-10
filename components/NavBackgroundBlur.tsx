import { Ref, forwardRef } from 'react';

import { TabListProps } from 'expo-router/ui';
import { useColorScheme } from '~/lib/useColorScheme';
import { View } from 'react-native';

export type NavTabBackgroundProps = TabListProps & {};

const NavTabBackground = forwardRef(({ children, ...props }: NavTabBackgroundProps, ref: Ref<View>) => {
	const { isDarkColorScheme } = useColorScheme();

	return (
		<View
			ref={ref}
			{...props}
			style={{ backgroundColor: 'transparent' }}
			className={`w-full !bg-transparent flex-row pb-10 !justify-around pt-4 border-t ${
				isDarkColorScheme ? 'border-border/30' : 'border-border/20'
			}`}
		>
			{children}
		</View>
	);
});

export { NavTabBackground };

NavTabBackground.displayName = 'NavTabBackground';
