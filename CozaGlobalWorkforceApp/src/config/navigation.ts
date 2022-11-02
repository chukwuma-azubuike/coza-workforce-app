import Home from '../views/app/home';
import Login from '../views/auth/login';

export type IAppRoutes = typeof AppRoutes[0];

const AppRoutes = [
    {
        name: 'Dashboard',
        icon: '',
        component: Home,
        options: { title: 'Dashboard' },
        submenu: [],
        users: 'admin,tenant,user',
    },
    // {
    //     name: 'Profile',
    //     icon: '',
    //     component: require('../views/app/profile'),
    //     options: { title: 'Profile' },
    //     submenu: [],
    //     users: 'admin,tenant,user',
    // },
    // {
    //     name: 'Compliance',
    //     icon: '',
    //     component: require('../views/app/compliance'),
    //     options: { title: 'compliance' },
    //     submenu: [],
    //     users: 'tenant,user',
    // },
    // {
    //     name: 'Permissions',
    //     icon: '',
    //     component: require('../views/app/permissions'),
    //     options: { title: 'Permissions' },
    //     submenu: [],
    //     users: 'tenant,user',
    // },
    // {
    //     name: 'Service report',
    //     icon: '',
    //     component: require('../views/app/service-report'),
    //     options: { title: 'Service report' },
    //     submenu: [],
    //     users: 'tenant,user',
    // },
    // {
    //     name: 'Settings',
    //     icon: '',
    //     component: require('../views/app/settings'),
    //     options: { title: 'Settings' },
    //     submenu: [],
    //     users: 'tenant,user',
    // },
    // {
    //     name: 'Workforce management',
    //     icon: '',
    //     component: require('../views/app/workforce-management'),
    //     options: { title: 'Workforce management' },
    //     submenu: [],
    //     users: 'admin,user',
    // },
];

const AuthRoutes = [
    {
        name: 'Login',
        icon: '',
        component: Login,
        options: { title: 'Login' },
        submenu: [],
        users: 'all',
    },
    // {
    //     name: 'Verify account',
    //     icon: '',
    //     component: require('../views/auth/verify-account'),
    //     options: { title: 'Verify account' },
    //     submenu: [],
    //     users: 'all',
    // },
    // {
    //     name: 'Create account',
    //     icon: '',
    //     component: require('../views/auth/create-account'),
    //     options: { title: 'Create account' },
    //     submenu: [],
    //     users: 'all',
    // },
    // {
    //     name: 'Forgot password',
    //     icon: '',
    //     component: require('../views/auth/forgot-password'),
    //     options: { title: 'Forgot password' },
    //     submenu: [],
    //     users: 'all',
    // },
];

const IAppRouteNames = Object.fromEntries(
    AppRoutes.map(route => [route.name, route.name])
);

export { AppRoutes, AuthRoutes, IAppRouteNames };
