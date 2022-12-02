import { Center, HStack, Pressable, Text } from 'native-base';
import React from 'react';
import { AvatarComponentWithoutBadge } from '../../../components/atoms/avatar';
import { Line } from '../../../components/atoms/line';

type TICKET = {
    offender: string;
    image: string;
    ticket_description: string;
    offense: string;
    ticket_type: string;
    department: string;
};

type Props = {
    data: {
        date: string;
        tickets: {
            offender: string;
            image: string;
            ticket_description: string;
            offense: string;
            ticket_type: string;
            department: string;
            date: string;
        }[];
    };
    handlePress: (component: string, data: TICKET) => void;
};

const TicketsByDate: React.FC<Props> = ({ data, handlePress }) => {
    return (
        <>
            <Text pl="3" fontWeight="semibold">
                {data?.date}
            </Text>
            <Line
                color={'#888787'}
                width="full"
                height="1px"
                marginTop="5px"
                marginBottom="10px"
            />

            {data?.tickets?.map((ticket, index) => (
                <Pressable
                    key={`ticket-item-${index}`}
                    onPress={() => handlePress('Ticket Details', ticket)}
                    marginBottom="10px"
                >
                    <HStack
                        pl={3}
                        pr={6}
                        space={3}
                        justifyContent="space-between"
                    >
                        <HStack space={3} alignItems="center">
                            <AvatarComponentWithoutBadge
                                imageUrl={ticket?.image}
                            />
                            <Text>{ticket?.ticket_description}</Text>
                        </HStack>
                        <Center
                            p={'5px 20px'}
                            bgColor={'#E10101'}
                            borderRadius="7px"
                            borderColor={'#767575'}
                            borderWidth="0.5"
                            minWidth={'65px'}
                        >
                            <Text
                                color={'#fff'}
                                fontSize={'10px'}
                                fontWeight="bold"
                            >
                                {ticket?.offense}
                            </Text>
                        </Center>
                    </HStack>
                </Pressable>
            ))}
        </>
    );
};

export default TicketsByDate;
