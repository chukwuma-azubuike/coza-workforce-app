import React, { useRef, useState, useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { KanbanColumn } from './KanbanColumn';
import { Guest } from '~/store/types';

interface KanbanBoardProps {
    guests: Guest[];
    stages: Guest['assimilationStage'][];
    onGuestMove?: (guestId: string, newStage: Guest['assimilationStage']) => void;
    onViewGuest?: (guestId: string) => void;
    isLoading?: boolean;
}

interface ColumnMeasurement {
    x: number;
    y: number;
    width: number;
    height: number;
    stage: Guest['assimilationStage'];
}

export default function KanbanBoard({ guests, stages, onGuestMove, onViewGuest, isLoading }: KanbanBoardProps) {
    const columnRefs = useRef<{ [key: string]: View | null }>({});
    const columnMeasurements = useRef<{ [key: string]: ColumnMeasurement }>({});
    const [isDragging, setIsDragging] = useState(false);

    // Register column refs
    const registerColumnRef = useCallback((stage: Guest['assimilationStage']) => {
        return (ref: View | null) => {
            columnRefs.current[stage] = ref;
            // Measure column position when ref is set
            if (ref) {
                setTimeout(() => {
                    ref.measureInWindow((x, y, width, height) => {
                        columnMeasurements.current[stage] = {
                            x,
                            y,
                            width,
                            height,
                            stage,
                        };
                    });
                }, 100);
            }
        };
    }, []);

    // Re-measure all columns when drag starts
    const handleDragStart = useCallback(() => {
        setIsDragging(true);
        // Re-measure all column positions when drag starts
        Object.entries(columnRefs.current).forEach(([stage, ref]) => {
            if (ref) {
                ref.measureInWindow((x, y, width, height) => {
                    columnMeasurements.current[stage] = {
                        x,
                        y,
                        width,
                        height,
                        stage: stage as Guest['assimilationStage'],
                    };
                });
            }
        });
    }, []);

    // Handle drop and determine target column
    const handleDrop = useCallback(
        (guestId: string, dropX: number, dropY: number) => {
            setIsDragging(false);

            // Find which column the drop occurred in
            let targetStage: Guest['assimilationStage'] | null = null;

            Object.values(columnMeasurements.current).forEach(measurement => {
                if (
                    dropX >= measurement.x &&
                    dropX <= measurement.x + measurement.width &&
                    dropY >= measurement.y &&
                    dropY <= measurement.y + measurement.height
                ) {
                    targetStage = measurement.stage;
                }
            });

            // If we found a target column and it's different from current stage
            if (targetStage) {
                const guest = guests.find(g => g._id === guestId);
                if (guest && guest.assimilationStage !== targetStage) {
                    onGuestMove?.(guestId, targetStage);
                }
            }
        },
        [guests, onGuestMove]
    );

    // Group guests by stage
    const guestsByStage = stages.reduce((acc, stage) => {
        acc[stage] = guests.filter(g => g.assimilationStage === stage);
        return acc;
    }, {} as Record<Guest['assimilationStage'], Guest[]>);

    // Get stage display names
    const getStageTitle = (stage: Guest['assimilationStage']) => {
        switch (stage) {
            case 'invited':
                return 'Invited';
            case 'attended':
                return 'Attended';
            case 'discipled':
                return 'Discipled';
            case 'joined':
                return 'Joined Workforce';
            default:
                return stage;
        }
    };

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 16 }}
        >
            <View className="flex-row gap-3">
                {stages.map(stage => (
                    <KanbanColumn
                        key={stage}
                        title={getStageTitle(stage)}
                        stage={stage}
                        guests={guestsByStage[stage]}
                        isLoading={isLoading}
                        onViewGuest={onViewGuest || (() => {})}
                        onGuestMove={onGuestMove}
                        registerColumnRef={registerColumnRef(stage)}
                        onDropGlobal={handleDrop}
                        onDragStartGlobal={handleDragStart}
                    />
                ))}
            </View>
        </ScrollView>
    );
}
