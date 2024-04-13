import React, { ReactNode } from 'react';

interface IIfProps {
    condition?: boolean;
    children?: ReactNode;
}

const If: React.FC<IIfProps> = props => {
    return <>{props.condition ? props.children : null}</>;
};

export default React.memo(If);
