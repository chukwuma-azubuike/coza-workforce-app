import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Pressable, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { Text, TextClassContext } from '~/components/ui/text';
import { cn } from '~/lib/utils';
import Loading from '../atoms/loading';

const buttonVariants = cva(
    'group flex items-center justify-center !rounded-xl web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
    {
        variants: {
            variant: {
                default: 'bg-primary web:hover:opacity-90 active:opacity-90',
                destructive: 'bg-destructive web:hover:opacity-90 active:opacity-90',
                outline:
                    'border border-input bg-background web:hover:bg-accent web:hover:text-accent-foreground active:bg-accent/50',
                secondary: 'bg-secondary web:hover:opacity-80 active:opacity-80',
                ghost: 'web:hover:bg-accent web:hover:text-accent-foreground active:bg-accent',
                link: 'web:underline-offset-4 web:hover:underline web:focus:underline ',
            },
            size: {
                default: '!h-16 px-4 py-2 native:h-12 native:px-5 native:py-3',
                sm: '!h-12 rounded-md px-3',
                lg: 'h-11 rounded-md px-8 native:h-14',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

const buttonTextVariants = cva(
    'web:whitespace-nowrap text-sm native:text-base font-medium text-foreground web:transition-colors',
    {
        variants: {
            variant: {
                default: 'text-primary-foreground dark:text-white',
                destructive: 'text-destructive-foreground',
                outline: 'group-active:text-accent-foreground',
                secondary: 'text-secondary-foreground group-active:text-secondary-foreground',
                ghost: 'group-active:text-accent-foreground',
                link: 'text-primary group-active:underline',
            },
            size: {
                default: '',
                sm: 'native:text-sm',
                lg: 'native:text-lg',
                icon: '',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

type ButtonProps = React.ComponentPropsWithoutRef<typeof Pressable> &
    VariantProps<typeof buttonVariants> & {
        isLoading?: boolean;
        loadingText?: string;
        startIcon?: React.ReactNode;
        icon?: React.ReactNode;
    };

const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
    ({ className, variant, size, isLoading, loadingText = 'Loading...', startIcon, icon, children, ...props }, ref) => {
        return (
            <TextClassContext.Provider
                value={cn(props.disabled && 'web:pointer-events-none', buttonTextVariants({ variant, size }))}
            >
                <TouchableOpacity
                    className={cn(
                        props.disabled && 'opacity-50 web:pointer-events-none',
                        buttonVariants({ variant, size, className })
                    )}
                    ref={ref}
                    role="button"
                    activeOpacity={0.6}
                    disabled={(isLoading || props.disabled) as any}
                    {...(props as TouchableOpacityProps)}
                >
                    {isLoading ? (
                        <View className="flex flex-row items-center justify-center gap-2">
                            <Loading spinnerProps={{ className: 'text-white' }} />
                            <Text className={cn('!text-xl', buttonTextVariants({ variant, size }))}>{loadingText}</Text>
                        </View>
                    ) : typeof children === 'string' ? (
                        <View className="flex-1 w-full items-center flex-row gap-2 justify-center">
                            <View className="flex-1 justify-end flex-row">{startIcon || icon}</View>
                            <Text className={cn('!text-xl mx-auto', buttonTextVariants({ variant, size }))}>
                                {children}
                            </Text>
                            <View className="flex-1" />
                        </View>
                    ) : (
                        (children as any)
                    )}
                </TouchableOpacity>
            </TextClassContext.Provider>
        );
    }
);
Button.displayName = 'Button';

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
