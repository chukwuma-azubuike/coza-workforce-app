import * as React from 'react';
import * as Haptics from 'expo-haptics';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { Icon } from '@rneui/base';
import useAppColorMode from '~/hooks/theme/colorMode';
import { THEME_CONFIG } from '~/config/appConfig';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { appActions, appSelectors } from '~/store/actions/app';

const ModeToggle: React.FC = () => {
    const { isLightMode } = useAppColorMode();
    const dispatch = useAppDispatch();

    const mode = useAppSelector(store => appSelectors.selectMode(store));

    function onValueChange(value: 'crm' | 'ops') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (value) {
            dispatch(appActions.toggleMode(value));
        }
    }

    return (
        <ToggleGroup
            value={mode}
            onValueChange={onValueChange as any}
            variant="outline"
            type="single"
            className="w-max"
        >
            <ToggleGroupItem isFirst value="crm" aria-label="Toggle Roast CRM">
                <Icon
                    size={22}
                    name="fire"
                    type="material-community"
                    color={isLightMode ? THEME_CONFIG.rose : THEME_CONFIG.rose}
                />
            </ToggleGroupItem>
            <ToggleGroupItem isLast value="ops" aria-label="Toggle Workforce Operations">
                <Icon
                    size={22}
                    name="th-large"
                    type="font-awesome"
                    color={isLightMode ? THEME_CONFIG.gray : THEME_CONFIG.lightGray}
                />
            </ToggleGroupItem>
        </ToggleGroup>
    );
};

export default ModeToggle;
