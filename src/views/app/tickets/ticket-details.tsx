import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
    Button,
    HStack,
    KeyboardAvoidingView,
    Text,
    TextArea,
    VStack,
} from 'native-base';
import React from 'react';
import { Line } from '../../../components/atoms/line';
// import ModalAlertComponent from '../../../components/composite/modal-alert';
import ViewWrapper from '../../../components/layout/viewWrapper';
// import useModal from '../../../hooks/modal/useModal';

type ItemProp = {
    title: string;
    value: string;
};

const TicketItem: React.FC<ItemProp> = ({ title, value }) => {
    return (
        <HStack justifyContent="flex-start">
            <Text width="1/2" fontSize="15px" fontWeight="semibold">
                {title}
            </Text>
            <Text fontSize="15px" fontWeight="light">
                {value}
            </Text>
        </HStack>
    );
};

type DATA = {
    offender: string;
    image: string;
    ticket_description: string;
    offense: string;
    ticket_type: string;
    department: string;
};

const TicketDetails: React.FC<NativeStackScreenProps<ParamListBase>> = ({
    route,
    // navigation,
}) => {
    const data = route?.params;

    const [dispute, setDispute] = React.useState<boolean>(false);
    const [disputeComment, setDisputeComment] = React.useState<string>('');
    // const [isLoading, setIsLoading] = React.useState<boolean>(false);

    // const { setModalState } = useModal();

    // const handleDisputeSubmit = () => {
    //     if (!isLoading) {
    //         setIsLoading(prev => !prev);
    //         setTimeout(() => {
    //             setIsLoading(false);
    //             setModalState({
    //                 duration: 6,
    //                 render: (
    //                     <ModalAlertComponent
    //                         description={
    //                             disputeComment !== ""
    //                                 ? `You clocked in at ${moment().format(
    //                                       'LT'
    //                                   )}`
    //                                 : 'Please'
    //                         }
    //                         iconType={
    //                             isInRange ? 'material-community' : 'ionicon'
    //                         }
    //                         color={
    //                             isInRange
    //                                 ? THEME_CONFIG.primaryLight
    //                                 : undefined
    //                         }
    //                         iconName={
    //                             isInRange ? 'timer-outline' : 'warning-outline'
    //                         }
    //                         status={isInRange ? 'success' : 'warning'}
    //                     />
    //                 ),
    //             });
    //         }, 2000);
    //     }
    // };

    React.useEffect(() => {
        setDispute(false);

        return () => {
            setDispute(false);
        };
    }, []);

    return (
        <KeyboardAvoidingView>
            <ViewWrapper>
                <VStack
                    space={2}
                    margin={'20px'}
                    padding={'40px 40px'}
                    bgColor={'#F3F2F2'}
                >
                    <TicketItem title="Date" value={data?.date} />
                    <Line
                        color={'#000'}
                        width="full"
                        height="0.3px"
                        marginTop="5px"
                        marginBottom="10px"
                    />
                    <TicketItem title="Department" value={data?.department} />
                    <Line
                        color={'#000'}
                        width="full"
                        height="0.3px"
                        marginTop="5px"
                        marginBottom="10px"
                    />
                    <TicketItem title="Ticket Type" value={data?.ticket_type} />
                    <Line
                        color={'#000'}
                        width="full"
                        height="0.3px"
                        marginTop="5px"
                        marginBottom="10px"
                    />

                    <TicketItem title="Offender" value={data?.offender} />
                    <Line
                        color={'#000'}
                        width="full"
                        height="0.3px"
                        marginTop="5px"
                        marginBottom="10px"
                    />
                    <TicketItem title="Offense" value={data?.offense} />
                    <Line
                        color={'#000'}
                        width="full"
                        height="0.3px"
                        marginTop="5px"
                        marginBottom="10px"
                    />
                    <TicketItem
                        title="Details"
                        value={data?.ticket_description}
                    />

                    {!dispute ? (
                        <HStack
                            key={'ticket-buttons'}
                            space={4}
                            marginTop={'40px'}
                            justifyContent="center"
                        >
                            <Button
                                onPress={() => setDispute(true)}
                                variant="outline"
                                size="lg"
                                borderColor={'#6B079C'}
                                borderRadius="7px"
                                _text={{ fontSize: '17px', fontWeight: '900' }}
                            >
                                Dispute
                            </Button>
                            <Button
                                size="lg"
                                borderRadius="7px"
                                _text={{ fontSize: '17px', fontWeight: '900' }}
                            >
                                Acknowledge
                            </Button>
                        </HStack>
                    ) : (
                        <>
                            <TextArea
                                value={disputeComment}
                                onChangeText={text => setDisputeComment(text)}
                                bgColor={'#fff'}
                                h={'179px'}
                                marginTop={'20px'}
                                placeholder="Share concerns on this ticket."
                                placeholderTextColor={'#D0D0D0'}
                                w="100%"
                                borderColor={'#9F9F9F'}
                                borderWidth={'0.3px'}
                            />

                            <HStack
                                key={'dispute-box-button'}
                                space={4}
                                marginTop={'20px'}
                                justifyContent="center"
                            >
                                <Button
                                    key={'canel-dispute'}
                                    onPress={() => setDispute(false)}
                                    variant="outline"
                                    size="lg"
                                    borderColor={'#6B079C'}
                                    borderRadius="7px"
                                    _text={{
                                        fontSize: '17px',
                                        fontWeight: '900',
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="lg"
                                    borderRadius="7px"
                                    _text={{
                                        fontSize: '17px',
                                        fontWeight: '900',
                                    }}
                                >
                                    Submit
                                </Button>
                            </HStack>
                        </>
                    )}
                </VStack>
            </ViewWrapper>
        </KeyboardAvoidingView>
    );
};

export default TicketDetails;
