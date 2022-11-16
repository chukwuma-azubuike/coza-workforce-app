import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import AuthHome from '../views/auth/welcome';
import Login from '../views/auth/login';
import RegisterStepFour from '../views/auth/register/register-step-four';
import RegisterStepOne from '../views/auth/register/register-step-one';
import RegisterStepThree from '../views/auth/register/register-step-three';
import RegisterStepTwo from '../views/auth/register/register-step-two';
import Home from '../views/app/home';
import Attendance from '../views/app/attendance';
import Compliance from '../views/app/compliance';
import Permissions from '../views/app/permissions';
import Notifications from '../views/app/notifications';
import Profile from '../views/app/profile';
import Reports from '../views/app/reports';
import Settings from '../views/app/settings';
import WorkforceManagement from '../views/app/Workforce-management';
import WorkforcePermissions from '../views/app/workforce-permission';
import More from '../views/app/more';
import Tickets from '../views/app/tickets';

export interface IAppRoute {
    name: string;
    component: React.FC<
        NativeStackScreenProps<ParamListBase, string, undefined>
    >;
    options: any;
    submenus: IAppRoute | [];
    users: string[] | [];
    inMenuBar: boolean;
}

const AppRoutes: IAppRoute[] = [
    {
        name: 'Home',
        component: Home,
        options: { title: 'Home' },
        submenus: [],
        users: [],
        inMenuBar: true,
    },
    {
        name: 'Attendance',
        component: Attendance,
        options: { title: 'Attendance' },
        submenus: [],
        users: [],
        inMenuBar: true,
    },
    {
        name: 'Permissions',
        component: Permissions,
        options: { title: 'Permissions' },
        submenus: [],
        users: [],
        inMenuBar: true,
    },
    {
        name: 'Tickets',
        component: Tickets,
        options: { title: 'Tickets' },
        submenus: [],
        users: [],
        inMenuBar: true,
    },
    {
        name: 'Notifications',
        component: Notifications,
        options: { title: 'Notifications' },
        submenus: [],
        users: [],
        inMenuBar: false,
    },
    {
        name: 'Profile',
        component: Profile,
        options: { title: 'Profile' },
        submenus: [],
        users: ['admin'],
        inMenuBar: false,
    },
    {
        name: 'Report',
        component: Reports,
        options: { title: 'Report' },
        submenus: [],
        users: ['admin', 'HOD', 'AHOD'],
        inMenuBar: false,
    },
    {
        name: 'Compliance',
        component: Compliance,
        options: { title: 'Compliance' },
        submenus: [],
        users: ['admin'],
        inMenuBar: false,
    },
    {
        name: 'Workforce permissions',
        component: WorkforcePermissions,
        options: { title: 'Workforce permissions' },
        submenus: [],
        users: ['admin'],
        inMenuBar: false,
    },
    {
        name: 'Workforce management',
        component: WorkforceManagement,
        options: { title: 'Workforce management' },
        submenus: [],
        users: ['admin', 'HOD', 'AHOD'],
        inMenuBar: false,
    },
    {
        name: 'Settings',
        component: Settings,
        options: { title: 'Settings' },
        submenus: [],
        users: [],
        inMenuBar: false,
    },
    {
        name: 'More',
        component: More,
        options: { title: 'More' },
        submenus: [],
        users: [],
        inMenuBar: true,
    },
];

const AuthRoutes: IAppRoute[] = [
    {
        name: 'Welcome',
        component: AuthHome,
        options: { title: 'Welcome' },
        submenus: [],
        users: [],
        inMenuBar: false,
    },
    {
        name: 'Login',
        component: Login,
        options: { title: 'Login' },
        submenus: [],
        users: [],
        inMenuBar: false,
    },
    {
        name: 'RegisterStepOne',
        component: RegisterStepOne,
        options: { title: 'Register' },
        submenus: [],
        users: [],
        inMenuBar: false,
    },
    {
        name: 'RegisterStepTwo',
        component: RegisterStepTwo,
        options: { title: 'Register' },
        submenus: [],
        users: [],
        inMenuBar: false,
    },
    {
        name: 'RegisterStepThree',
        component: RegisterStepThree,
        options: { title: 'Register' },
        submenus: [],
        users: [],
        inMenuBar: false,
    },
    {
        name: 'RegisterStepFour',
        component: RegisterStepFour,
        options: { title: 'Register' },
        submenus: [],
        users: [],
        inMenuBar: false,
    },
    // {
    //     name: 'Verify account',
    //
    //     component: require('../views/auth/verify-account'),
    //     options: { title: 'Verify account' },
    //     submenus: [],
    //     users: [],
    // },
    // {
    //     name: 'Forgot password',
    //
    //     component: require('../views/auth/forgot-password'),
    //     options: { title: 'Forgot password' },
    //     submenus: [],
    //     users: [],
    // },
];

export { AppRoutes, AuthRoutes };
