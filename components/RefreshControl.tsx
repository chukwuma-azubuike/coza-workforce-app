import Loading from './atoms/loading';

const RefreshControl: React.FC<{ refreshing: boolean }> = ({ refreshing }) => {
    return refreshing ? <Loading className="mb-4" spinnerProps={{ size: 'large' }} /> : undefined;
};

export default RefreshControl;
