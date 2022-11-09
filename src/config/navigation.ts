import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Home from '../views/app/home';
import AuthHome from '../views/auth/welcome';
import Login from '../views/auth/login';
import RegisterStepOne from '../views/auth/register/register-step-one';
import RegisterStepTwo from '../views/auth/register/register-step-two';
import RegisterStepThree from '../views/auth/register/register-step-three';
import RegisterStepFour from '../views/auth/register/register-step-four';

export interface IAppRoute {
    name: string;
    icon: string;
    component: React.FC<
        NativeStackScreenProps<ParamListBase, string, undefined>
    >;
    options: any;
    submenus: IAppRoute | [];
    users: string | string[];
}

const AppRoutes: IAppRoute[] = [
    {
        name: 'Dashboard',
        icon: '',
        component: Home,
        options: { title: 'Dashboard' },
        submenus: [],
        users: 'admin,tenant,user',
    },
    // {
    //     name: 'Profile',
    //     icon: '',
    //     component: require('../views/app/profile'),
    //     options: { title: 'Profile' },
    //     submenus: [],
    //     users: 'admin,tenant,user',
    // },
    // {
    //     name: 'Compliance',
    //     icon: '',
    //     component: require('../views/app/compliance'),
    //     options: { title: 'compliance' },
    //     submenus: [],
    //     users: 'tenant,user',
    // },
    // {
    //     name: 'Permissions',
    //     icon: '',
    //     component: require('../views/app/permissions'),
    //     options: { title: 'Permissions' },
    //     submenus: [],
    //     users: 'tenant,user',
    // },
    // {
    //     name: 'Service report',
    //     icon: '',
    //     component: require('../views/app/service-report'),
    //     options: { title: 'Service report' },
    //     submenus: [],
    //     users: 'tenant,user',
    // },
    // {
    //     name: 'Settings',
    //     icon: '',
    //     component: require('../views/app/settings'),
    //     options: { title: 'Settings' },
    //     submenus: [],
    //     users: 'tenant,user',
    // },
    // {
    //     name: 'Workforce management',
    //     icon: '',
    //     component: require('../views/app/workforce-management'),
    //     options: { title: 'Workforce management' },
    //     submenus: [],
    //     users: 'admin,user',
    // },
];

const AuthRoutes: IAppRoute[] = [
    {
        name: 'Welcome',
        icon: '',
        component: AuthHome,
        options: { title: 'Welcome' },
        submenus: [],
        users: 'all',
    },
    {
        name: 'Login',
        icon: '',
        component: Login,
        options: { title: 'Login' },
        submenus: [],
        users: 'all',
    },
    {
        name: 'RegisterStepOne',
        icon: '',
        component: RegisterStepOne,
        options: { title: 'Register' },
        submenus: [],
        users: 'all',
    },
    {
        name: 'RegisterStepTwo',
        icon: '',
        component: RegisterStepTwo,
        options: { title: 'Register' },
        submenus: [],
        users: 'all',
    },
    {
        name: 'RegisterStepThree',
        icon: '',
        component: RegisterStepThree,
        options: { title: 'Register' },
        submenus: [],
        users: 'all',
    },
    {
        name: 'RegisterStepFour',
        icon: '',
        component: RegisterStepFour,
        options: { title: 'Register' },
        submenus: [],
        users: 'all',
    },
    // {
    //     name: 'Verify account',
    //     icon: '',
    //     component: require('../views/auth/verify-account'),
    //     options: { title: 'Verify account' },
    //     submenus: [],
    //     users: 'all',
    // },
    // {
    //     name: 'Forgot password',
    //     icon: '',
    //     component: require('../views/auth/forgot-password'),
    //     options: { title: 'Forgot password' },
    //     submenus: [],
    //     users: 'all',
    // },
];

export { AppRoutes, AuthRoutes };
