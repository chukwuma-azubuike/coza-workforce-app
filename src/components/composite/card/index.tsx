import React from 'react';
import { Card, ICardProps } from 'native-base';

interface ICardComponentProps extends ICardProps {}

const CardComponent: React.FC<ICardComponentProps> = props => {
    return (
        <Card
            {...props}
            mt={props.mt ? props.mt : 1}
            bg={props.bg ? props.bg : 'gray.50'}
        >
            {props.children}
        </Card>
    );
};

export default CardComponent;
