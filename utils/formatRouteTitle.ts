import capitalize from 'lodash/capitalize';

const formatRouteTitle = (href: string, pathname: string) => {
    const parts = (href === 'index' ? pathname : href).split('/');
    let formatted = parts[parts.length - 1].replaceAll('-', ' ');

    return capitalize(formatted) as unknown as string;
};

export default formatRouteTitle;
