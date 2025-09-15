import React, { useRef, useEffect } from 'react';
import { ScrollView, View, findNodeHandle, UIManager } from 'react-native';
import { KanbanColumn } from './KanbanColumn';
import { AssimilationStage, Guest } from '~/store/types';
import { router } from 'expo-router';

export interface KanbanBoardProps {
    guests: Guest[];
    stages: AssimilationStage[];
}

type LayoutRect = { x: number; y: number; width: number; height: number };

const KanbanBoard: React.FC<KanbanBoardProps> = ({ guests: initialGuests, stages }) => {
    const [guests, setGuests] = React.useState<Guest[]>(initialGuests);

    // refs for column nodes and measured layouts
    const columnRefs = useRef<Record<string, View | null>>({});
    const columnLayouts = useRef<Record<string, LayoutRect>>({});

    // when a guest moves (update local state)
    const handleMoveGuest = (guestId: string, newStage: Guest['assimilationStage']) => {
        setGuests(prev => prev.map(g => (g._id === guestId ? { ...g, assimilationStage: newStage } : g)));
    };

    const handleViewGuest = (guestId: string) => {
        router.push({ pathname: '/(roast-crm)/guests/profile', params: { guestId } });
    };

    useEffect(() => {
        if (initialGuests?.length > 0) setGuests(initialGuests);
    }, [initialGuests]);

    // register column refs from columns
    const registerColumnRef = (stage: string, ref: View | null) => {
        columnRefs.current[stage] = ref;
        // measure immediately when registered
        measureColumn(stage);
    };

    const measureColumn = (stage: string) => {
        const node = findNodeHandle(columnRefs.current[stage] as any);
        if (!node) return;
        // measureInWindow gives absolute coords (x,y)
        UIManager.measureInWindow(node, (x: number, y: number, width: number, height: number) => {
            columnLayouts.current[stage] = { x, y, width, height };
        });
    };

    const measureAll = () => {
        stages.forEach(stage => measureColumn(stage));
    };

    // called by cards when drag starts
    const handleDragStart = () => {
        // re-measure all columns to account for scrolling/layout shifts
        measureAll();
    };

    // central drop handler
    const handleDrop = (guestId: string, x: number, y: number) => {
        for (const stage of stages) {
            const l = columnLayouts.current[stage];
            if (l && x >= l.x && x <= l.x + l.width && y >= l.y && y <= l.y + l.height) {
                handleMoveGuest(guestId, stage);
                return;
            }
        }
        // no column matched — you may want to handle "snap back" or similar
    };

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} onMomentumScrollEnd={measureAll}>
            <View style={{ flexDirection: 'row', gap: 16 }}>
                {stages.map(stage => (
                    <KanbanColumn
                        key={stage}
                        title={stage}
                        stage={stage}
                        onViewGuest={handleViewGuest}
                        guests={guests.filter(g => g.assimilationStage.toLowerCase() === stage.toLowerCase())}
                        // register this column's view ref so board can measure it
                        registerColumnRef={ref => registerColumnRef(stage, ref)}
                        // global drag/drop handlers
                        onDropGlobal={handleDrop}
                        onDragStartGlobal={handleDragStart}
                    />
                ))}
            </View>
        </ScrollView>
    );
};

export default KanbanBoard;
