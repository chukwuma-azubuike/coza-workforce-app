import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { data } from './flatListConfig';
import Empty from '../../../components/atoms/empty';
import ButtonSelector, {
    useButtonSelector,
} from '../../../components/composite/button-selector';
import RenderContainer from '../../../components/composite/render-container';
import { MyAttendance, TeamAttendance } from './lists';

const Attendance: React.FC = () => {
    const { focused, setFocused } = useButtonSelector();

    return (
        <ViewWrapper>
            {data.length ? (
                <>
                    <ButtonSelector
                        focused={focused}
                        setFocused={setFocused}
                        items={[
                            { title: 'My Attendance' },
                            { title: 'Team Attendance' },
                            { title: 'Campus Attendance' },
                        ]}
                    />
                    <RenderContainer
                        renderIndex={focused}
                        components={[<MyAttendance />, <TeamAttendance />]}
                    />
                </>
            ) : (
                <Empty />
            )}
        </ViewWrapper>
    );
};

export default Attendance;
