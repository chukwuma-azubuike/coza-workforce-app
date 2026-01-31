import { ViewRef } from '@rn-primitives/types';
import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '~/lib/utils';

const Card = React.forwardRef<ViewRef, ViewProps>(({ className, ...props }, ref) => (
    <View ref={ref} className={cn('gap-4 rounded-2xl bg-card shadow-sm p-5 ', className)} {...props} />
));
Card.displayName = 'Card';

export { Card };
