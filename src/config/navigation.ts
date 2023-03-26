import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
// import AuthHome from '../views/auth/welcome';
import Login from '../views/auth/login';
import Home from '../views/app/home';
import Attendance from '../views/app/attendance';
// import Compliance from '../views/app/compliance';
import Permissions from '../views/app/permissions';
import Notifications from '../views/app/notifications';
import Profile from '../views/app/profile';
import Reports from '../views/app/reports';
// import Settings from '../views/app/settings';
// import WorkforcePermissions from '../views/app/workforce-permission';
import More from '../views/app/more';
import Tickets from '../views/app/tickets';
import TicketDetails from '../views/app/tickets/ticket-details';
import IssueTicket from '../views/app/tickets/issue-ticket';
import { IIconTypes } from '../utils/types';
// import ServiceManagement from '../views/app/service-management';
import RequestPermission from '../views/app/permissions/request-permission';
import Register from '../views/auth/register';
import PermissionDetails from '../views/app/permissions/permission-details';
import ChildcareReport from '../views/app/reports/forms/childcare-report';
import IncidentReport from '../views/app/reports/forms/incident-report';
import AttendanceReport from '../views/app/reports/forms/attendance-report';
import GuestReport from '../views/app/reports/forms/guest-report';
import ServiceReport from '../views/app/reports/forms/service-report';
import SecurityReport from '../views/app/reports/forms/security-report';
import TransferReport from '../views/app/reports/forms/transfer-report';
import VerifyEmail from '../views/auth/welcome';
import Welcome from '../views/auth/welcome/welcome';
import WorkforceManagement from '../views/app/Workforce-management';
import UserDetails from '../views/app/Workforce-management/user-details';
export interface IAppRoute {
    name: string;
    component: React.FC<NativeStackScreenProps<ParamListBase, string, undefined>>;
    options: any;
    submenus: IAppRoute[] | [];
    users: string[] | [];
    inMenuBar: boolean;
    icon: { name: string; type: IIconTypes };
}

const AppRoutes: IAppRoute[] = [
    {
        name: 'Home',
        component: Home,
        options: { title: 'Home' },
        submenus: [],
        users: [],
        inMenuBar: true,
        icon: { name: 'home', type: 'antdesign' },
    },
    {
        name: 'Attendance',
        component: Attendance,
        options: { title: 'Attendance' },
        submenus: [],
        users: [],
        inMenuBar: true,
        icon: { name: 'checklist', type: 'octicon' },
    },
    {
        name: 'Permissions',
        component: Permissions,
        options: { title: 'Permissions' },
        submenus: [
            {
                name: 'Request permission',
                component: RequestPermission,
                options: { title: 'Request permission' },
                submenus: [],
                users: [],
                inMenuBar: false,
                icon: { name: 'hand-left-outline', type: 'ionicon' },
            },
            {
                name: 'Permission Details',
                component: PermissionDetails as any as React.FC<
                    NativeStackScreenProps<ParamListBase, string, undefined>
                >,
                options: { title: 'Permission Details' },
                submenus: [],
                users: [],
                inMenuBar: false,
                icon: { name: 'hand-left-outline', type: 'ionicon' },
            },
        ],
        users: [],
        inMenuBar: true,
        icon: { name: 'hand-left-outline', type: 'ionicon' },
    },
    {
        name: 'Tickets',
        component: Tickets,
        options: { title: 'Tickets' },
        submenus: [
            {
                name: 'Ticket Details',
                component: TicketDetails,
                options: { title: 'Ticket Details' },
                submenus: [],
                users: [],
                inMenuBar: false,
                icon: {
                    name: 'ticket-confirmation-outline',
                    type: 'material-community',
                },
            },
            {
                name: 'Issue Ticket',
                component: IssueTicket,
                options: { title: 'Issue Ticket' },
                submenus: [],
                users: [],
                inMenuBar: false,
                icon: {
                    name: 'ticket-confirmation-outline',
                    type: 'material-community',
                },
            },
        ],
        users: [],
        inMenuBar: true,
        icon: {
            name: 'ticket-confirmation-outline',
            type: 'material-community',
        },
    },
    {
        name: 'Notifications',
        component: Notifications,
        options: { title: 'Notifications' },
        submenus: [],
        users: [],
        inMenuBar: false,
        icon: { name: 'notifications-outline', type: 'ionicon' },
    },
    {
        name: 'Profile',
        component: Profile,
        options: { title: 'Profile' },
        submenus: [],
        users: [],
        inMenuBar: false,
        icon: { name: 'person-outline', type: 'ionicon' },
    },
    {
        name: 'Reports',
        component: Reports,
        options: { title: 'Reports' },
        submenus: [
            {
                name: 'Childcare Report',
                component: ChildcareReport,
                options: { title: 'Childcare Report' },
                submenus: [],
                users: [],
                inMenuBar: false,
                icon: { name: 'graph', type: 'octicon' },
            },
            {
                name: 'Incident Report',
                component: IncidentReport,
                options: { title: 'Incident Report' },
                submenus: [],
                users: [],
                inMenuBar: false,
                icon: { name: 'graph', type: 'octicon' },
            },
            {
                name: 'Attendance Report',
                component: AttendanceReport,
                options: { title: 'Attendance Report' },
                submenus: [],
                users: [],
                inMenuBar: false,
                icon: { name: 'graph', type: 'octicon' },
            },
            {
                name: 'Guest Report',
                component: GuestReport,
                options: { title: 'Guest Report' },
                submenus: [],
                users: [],
                inMenuBar: false,
                icon: { name: 'graph', type: 'octicon' },
            },
            {
                name: 'Service Report',
                component: ServiceReport,
                options: { title: 'Service Report' },
                submenus: [],
                users: [],
                inMenuBar: false,
                icon: { name: 'graph', type: 'octicon' },
            },
            {
                name: 'Security Report',
                component: SecurityReport,
                options: { title: 'Security Report' },
                submenus: [],
                users: [],
                inMenuBar: false,
                icon: { name: 'graph', type: 'octicon' },
            },
            {
                name: 'Transfer Report',
                component: TransferReport,
                options: { title: 'Transfer Report' },
                submenus: [],
                users: [],
                inMenuBar: false,
                icon: { name: 'graph', type: 'octicon' },
            },
        ],
        users: ['admin', 'HOD', 'AHOD', 'QC', 'campus-pastor', 'global-pastor'],
        inMenuBar: false,
        icon: { name: 'graph', type: 'octicon' },
    },
    // {
    //     name: 'Compliance',
    //     component: Compliance,
    //     options: { title: 'Compliance' },
    //     submenus: [],
    //     users: ['QC'],
    //     inMenuBar: false,
    //     icon: { name: 'check-square', type: 'feather' },
    // },
    // {
    //     name: 'Workforce permissions',
    //     component: WorkforcePermissions,
    //     options: { title: 'Workforce permissions' },
    //     submenus: [],
    //     users: ['admin', 'campus-pastor', 'global-pastor', 'QC'],
    //     inMenuBar: false,
    //     icon: { name: 'hand-left-outline', type: 'ionicon' },
    // },
    // {
    //     name: 'Service management',
    //     component: ServiceManagement,
    //     options: { title: 'Service management' },
    //     submenus: [],
    //     users: ['QC', 'programs'],
    //     inMenuBar: false,
    //     icon: { name: 'church', type: 'material-community' },
    // },
    {
        name: 'Workforce management',
        component: WorkforceManagement,
        options: { title: 'Workforce management' },
        submenus: [
            {
                name: 'User Profile',
                component: UserDetails,
                options: { title: 'User Profile' },
                submenus: [],
                users: [],
                inMenuBar: false,
                icon: { name: 'person', type: 'octicon' },
            },
        ],
        users: ['admin', 'HOD', 'AHOD', 'QC'],
        inMenuBar: false,
        icon: { name: 'database-cog-outline', type: 'material-community' },
    },
    // {
    //     name: 'Settings',
    //     component: Settings,
    //     options: { title: 'Settings' },
    //     submenus: [],
    //     users: [],
    //     inMenuBar: false,
    //     icon: { name: 'settings-outline', type: 'ionicon' },
    // },
    {
        name: 'More',
        component: More,
        options: { title: 'More' },
        submenus: [],
        users: [],
        inMenuBar: true,
        icon: { name: 'menu-outline', type: 'ionicon' },
    },
];

const AuthRoutes: Omit<IAppRoute, 'icon'>[] = [
    {
        name: 'Welcome',
        component: Welcome,
        options: { title: 'Welcome' },
        submenus: [],
        users: [],
        inMenuBar: false,
    },
    {
        name: 'Verify Email',
        component: VerifyEmail,
        options: { title: 'Verify Email' },
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
        name: 'Register',
        component: Register,
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
