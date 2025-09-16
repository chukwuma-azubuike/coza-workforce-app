import React, { ElementType, ReactNode, useEffect, useState } from 'react';
import { InteractionManager } from 'react-native';

const useDeferHeavy = () => {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const task = InteractionManager.runAfterInteractions(() => {
            setReady(true); // only mount heavy child after transition
        });
        return () => task.cancel?.();
    }, []);

    return ready;
};

export const useDeferredImport = (loadFn: () => any): ElementType | null => {
    const [Comp, setComp] = useState(null);

    useEffect(() => {
        const task = InteractionManager.runAfterInteractions(async () => {
            try {
                const mod = await loadFn();
                setComp(() => mod?.default ?? mod);
            } catch (e) {
                console.warn('Deferred import failed', e);
            }
        });
        return () => task.cancel?.();
    }, [loadFn]);

    return Comp;
};

export default useDeferHeavy;
