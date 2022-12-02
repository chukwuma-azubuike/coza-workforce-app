import React from 'react';

interface IIfProps {
    condition: boolean;
}

const If: React.FC<IIfProps> = props => {
    return <>{props.condition ? props.children : null}</>;
};

export default If;
