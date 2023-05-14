import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
// import AuthHome from '../views/auth/welcome';
import Attendance from '../views/app/attendance';
import Home from '../views/app/home';
import Login from '../views/auth/login';
// import Compliance from '../views/app/compliance';
import Notifications from '../views/app/notifications';
import Permissions from '../views/app/permissions';
import Profile from '../views/app/profile';
import Reports from '../views/app/reports';
// import Settings from '../views/app/settings';
import { IIconTypes } from '../utils/types';
import More from '../views/app/more';
import Tickets from '../views/app/tickets';
import IssueTicket from '../views/app/tickets/issue-ticket';
import TicketDetails from '../views/app/tickets/ticket-details';
// import ServiceManagement from '../views/app/service-management';
import CreateUser from '../views/app/Workforce-management/create-user';
import UserDetails from '../views/app/Workforce-management/user-details';
import ManualClockin from '../views/app/manual-clockin';
import PermissionDetails from '../views/app/permissions/permission-details';
import RequestPermission from '../views/app/permissions/request-permission';
import EditProfile from '../views/app/profile/edit-profile';
import CampusReport from '../views/app/reports/campus-report/reportDetails';
import AttendanceReport from '../views/app/reports/forms/attendance-report';
import ChildcareReport from '../views/app/reports/forms/childcare-report';
import GuestReport from '../views/app/reports/forms/guest-report';
import IncidentReport from '../views/app/reports/forms/incident-report';
import SecurityReport from '../views/app/reports/forms/security-report';
import ServiceReport from '../views/app/reports/forms/service-report';
import TransferReport from '../views/app/reports/forms/transfer-report';
import ForgotPassword from '../views/auth/forgot-password';
import Register from '../views/auth/register';
import ResetPassword from '../views/auth/reset-password';
import VerifyEmail from '../views/auth/welcome';
import Welcome from '../views/auth/welcome/welcome';
import WorkforceManagement from '../views/app/Workforce-management/workforce-management';
import GlobalWorkforceSummary from '../views/app/Workforce-management/global-workforce';
import WorkforceSummary from '../views/app/Workforce-management';
import CampusWorkforceSummary from '../views/app/Workforce-management/campus-workforce';
import UserReport from '../views/app/Workforce-management/user-reports';

// import UserReport from '../views/app/workforce-management/user-reports';
export interface IAppRoute {
    name: string;
    component: React.FC<NativeStackScreenProps<ParamListBase, string, undefined>> | React.FC<any>;
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
        submenus: [
            {
                name: 'Edit Profile',
                component: EditProfile,
                options: { title: 'Edit Profile' },
                submenus: [],
                users: [],
                inMenuBar: false,
                icon: { name: 'person-outline', type: 'ionicon' },
            },
        ],
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
            {
                name: 'Campus Report',
                component: CampusReport,
                options: { title: 'Campus Report' },
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
    //     name: 'Service management',
    //     component: ServiceManagement,
    //     options: { title: 'Service management' },
    //     submenus: [],
    //     users: ['QC', 'programs'],
    //     inMenuBar: false,
    //     icon: { name: 'church', type: 'material-community' },
    // },
    {
        name: 'Workforce summary',
        component: WorkforceSummary,
        options: { title: 'Workforce management' },
        submenus: [
            {
                name: 'Workforce management',
                component: WorkforceManagement,
                options: { title: 'Workforce management' },
                submenus: [],
                users: [],
                inMenuBar: false,
                icon: { name: 'person', type: 'octicon' },
            },
            {
                name: 'User Profile',
                component: UserDetails,
                options: { title: 'User Profile' },
                submenus: [],
                users: [],
                inMenuBar: false,
                icon: { name: 'person', type: 'octicon' },
            },
            {
                name: 'User Report',
                component: UserReport,
                options: { title: 'User Report' },
                submenus: [],
                users: [],
                inMenuBar: false,
                icon: { name: 'person', type: 'octicon' },
            },
            {
                name: 'Create User',
                component: CreateUser,
                options: { title: 'Create User' },
                submenus: [],
                users: [],
                inMenuBar: false,
                icon: { name: 'person', type: 'octicon' },
            },
            {
                name: 'Campus workforce',
                component: CampusWorkforceSummary,
                options: { title: 'Campus management' },
                submenus: [],
                users: [],
                inMenuBar: false,
                icon: { name: 'person', type: 'octicon' },
            },
            {
                name: 'Global workforce',
                component: GlobalWorkforceSummary,
                options: { title: 'Global workforce' },
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
    {
        name: 'Manual clock in',
        component: ManualClockin,
        options: { title: 'Manual clock in' },
        submenus: [],
        users: ['admin', 'HOD', 'AHOD', 'QC'],
        inMenuBar: false,
        icon: { name: 'timer-outline', type: 'material-community' },
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
    {
        name: 'Forgot Password',
        component: ForgotPassword,
        options: { title: 'Forgot Password' },
        submenus: [],
        users: [],
        inMenuBar: false,
    },
    {
        name: 'Reset Password',
        component: ResetPassword,
        options: { title: 'Reset Password' },
        submenus: [],
        users: [],
        inMenuBar: false,
    },
];

export { AppRoutes, AuthRoutes };
