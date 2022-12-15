import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import Empty from '../../../components/atoms/empty';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
// import { VStack } from 'native-base';
// import TicketsByDate from './tickets-by-date';

// type DATA = {
//     date: string;
//     tickets: {
//         offender: string;
//         image: string;
//         ticket_description: string;
//         offense: string;
//         ticket_type: string;
//         department: string;
//         date: string;
//     }[];
// }[];

// type TICKET = {
//     offender: string;
//     image: string;
//     ticket_description: string;
//     offense: string;
//     ticket_type: string;
//     department: string;
// };

// const mockData: DATA = [
//     {
//         date: '27th November, 2022',
//         tickets: [
//             {
//                 offender: 'Deborah Ekene',
//                 image: 'https://bit.ly/3AdGvvM',
//                 ticket_description: 'Not wearing uniform',
//                 offense: 'Dress Code',
//                 ticket_type: 'Individual',
//                 department: 'Media',
//                 date: '27th November, 2022',
//             },
//             {
//                 offender: 'Deborah Ekene',
//                 image: 'https://bit.ly/3AdGvvM',
//                 ticket_description: 'Skirt was above knee',
//                 offense: 'Dress Code',
//                 ticket_type: 'Individual',
//                 department: 'Media',
//                 date: '27th November, 2022',
//             },
//         ],
//     },
//     {
//         date: '20th November, 2022',
//         tickets: [
//             {
//                 offender: 'Deborah Ekene',
//                 image: 'https://bit.ly/3AdGvvM',
//                 ticket_description: 'Suit was unbuttoned',
//                 offense: 'Dress Code',
//                 ticket_type: 'Individual',
//                 department: 'Media',
//                 date: '27th November, 2022',
//             },
//         ],
//     },
//     {
//         date: '13th November, 2022',
//         tickets: [
//             {
//                 offender: 'Deborah Ekene',
//                 image: 'https://bit.ly/3AdGvvM',
//                 ticket_description: 'Suit was unbuttoned',
//                 offense: 'Dress Code',
//                 ticket_type: 'Individual',
//                 department: 'Media',
//                 date: '27th November, 2022',
//             },
//         ],
//     },
// ];

const Tickets: React.FC<NativeStackScreenProps<ParamListBase>> = ({
    navigation,
}) => {
    // const handlePress = (component: string, data: TICKET) => {
    //     navigation.navigate(component, {
    //         ...data,
    //     });
    // };
    return (
        <ViewWrapper>
            <Empty message="Nothing here. Let's keep it that way! 😇" />
            {/* <VStack px={4} space={4}>
                {mockData.map((data, index) => (
                    <TicketsByDate
                        key={`ticket-date-${index}`}
                        data={data}
                        handlePress={handlePress}
                    />
                ))}
            </VStack> */}
        </ViewWrapper>
    );
};

export default Tickets;
