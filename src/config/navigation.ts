import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import Attendance from '@views/app/attendance';
import Home from '@views/app/home';
import Login from '@views/auth/login';
import Notifications from '@views/app/notifications';
import Permissions from '@views/app/permissions';
import Profile from '@views/app/profile';
import Reports from '@views/app/reports';
import { IIconTypes } from '@utils/types';
import More from '@views/app/more';
import Tickets from '@views/app/tickets';
import IssueTicket from '@views/app/tickets/issue-ticket';
import RequestPermission from '@views/app/permissions/request-permission';
import Register from '@views/auth/register';
import TicketDetails from '@views/app/tickets/ticket-details';
import CreateUser from '@views/app/workforce-management/create-user';
import UserDetails from '@views/app/workforce-management/user-details';
import ManualClockin from '@views/app/manual-clockin';
import PermissionDetails from '@views/app/permissions/permission-details';
import EditProfile from '@views/app/profile/edit-profile';
import CampusReport from '@views/app/reports/campus-report/reportDetails';
import AttendanceReport from '@views/app/reports/forms/attendance-report';
import ChildcareReport from '@views/app/reports/forms/childcare-report';
import GuestReport from '@views/app/reports/forms/guest-report';
import IncidentReport from '@views/app/reports/forms/incident-report';
import SecurityReport from '@views/app/reports/forms/security-report';
import ServiceReport from '@views/app/reports/forms/service-report';
import TransferReport from '@views/app/reports/forms/transfer-report';
import ForgotPassword from '@views/auth/forgot-password';
import ResetPassword from '@views/auth/reset-password';
import ServiceManagement from '@views/app/service-management';
import CreateServiceManagement from '@views/app/service-management/create-service';
import VerifyEmail from '@views/auth/welcome';
import Welcome from '@views/auth/welcome/welcome';
import WorkforceManagement from '@views/app/workforce-management/workforce-management';
import GlobalWorkforceSummary from '@views/app/workforce-management/global-workforce';
import WorkforceSummary from '@views/app/workforce-management';
import CampusWorkforceSummary from '@views/app/workforce-management/campus-workforce';
// import UserReport from '@views/app/workforce-management/user-reports';
import UserReport from '@views/app/workforce-management/user-reports';
import UserReportDetailsPage from '@views/app/workforce-management/user-reports/UserReportDetailsPage';
import CampusGroupHeads from '@views/app/group-head-summary';
import AssignRole from '@views/app/leaders/assign-roles';
import GroupHeadCampuses from '@views/app/group-head-summary/group-head-campuses';
import GroupHeadDepartments from '@views/app/group-head-summary/group-head-departments';
import GroupHeadDepartmentActivies from '@views/app/group-head-summary/group-head-tabs';
import Export from '@views/app/export';
import CreateCampus from '@views/app/workforce-management/create-campus';
import CreateDepartment from '@views/app/workforce-management/create-department';
import { DEPARTMENTS, ROLES } from '@hooks/role';
import CGWC from '@views/app/cgwc';
import CGWCDetails from '@views/app/cgwc/cgwc-details';
import CreateCGWC from '@views/app/cgwc/create-cgwc';
import CreateCGWGSession from '@views/app/service-management/create-cgwc-session';
import CreateCGWCInstantMessage from '@views/app/cgwc/create-instant-message';
import CGWCGroupAttendance from '@views/app/cgwc/group-attendance';
import CGWCResources from '@views/app/cgwc/cgwc-resources';
import CGWCFeedback from '@views/app/cgwc/feedback';
import CGWCReport from '@views/app/cgwc/cgwc-report';
import TopNav from '@views/app/home/top-nav';

export interface IAppRoute {
    name: string;
    component: React.FC<NativeStackScreenProps<ParamListBase, string, undefined>> | React.FC<any>;
    options: any;
    submenus: IAppRoute[] | [];
    users: (ROLES | DEPARTMENTS)[];
    inMenuBar: boolean;
    inMore: boolean;
    customHeader?: React.FC<any>;
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
        inMore: false,
        customHeader: TopNav,
        icon: { name: 'home', type: 'antdesign' },
    },
    {
        name: 'Attendance',
        component: Attendance,
        options: { title: 'Attendance' },
        submenus: [],
        users: [],
        inMenuBar: true,
        inMore: false,
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
                inMore: false,
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
                inMore: false,
                icon: { name: 'hand-left-outline', type: 'ionicon' },
            },
        ],
        users: [],
        inMenuBar: true,
        inMore: false,
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
                inMore: false,
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
                inMore: false,
                icon: {
                    name: 'ticket-confirmation-outline',
                    type: 'material-community',
                },
            },
        ],
        users: [],
        inMenuBar: true,
        inMore: false,
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
        inMore: false,
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
                inMore: false,
                icon: { name: 'person-outline', type: 'ionicon' },
            },
        ],
        users: [],
        inMenuBar: false,
        inMore: false,
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
                inMore: false,
                icon: { name: 'graph', type: 'octicon' },
            },
            {
                name: 'Incident Report',
                component: IncidentReport,
                options: { title: 'Incident Report' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'graph', type: 'octicon' },
            },
            {
                name: 'Attendance Report',
                component: AttendanceReport,
                options: { title: 'Attendance Report' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'graph', type: 'octicon' },
            },
            {
                name: 'Guest Report',
                component: GuestReport,
                options: { title: 'Guest Report' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'graph', type: 'octicon' },
            },
            {
                name: 'Service Report',
                component: ServiceReport,
                options: { title: 'Service Report' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'graph', type: 'octicon' },
            },
            {
                name: 'Security Report',
                component: SecurityReport,
                options: { title: 'Security Report' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'graph', type: 'octicon' },
            },
            {
                name: 'Transfer Report',
                component: TransferReport,
                options: { title: 'Transfer Report' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'graph', type: 'octicon' },
            },
            {
                name: 'Campus Report',
                component: CampusReport,
                options: { title: 'Campus Report' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'graph', type: 'octicon' },
            },
        ],
        users: [
            ROLES.HOD,
            ROLES.AHOD,
            ROLES.groupHead,
            ROLES.campusPastor,
            ROLES.globalPastor,
            ROLES.campusCoordinator,
        ],
        inMenuBar: false,
        inMore: true,
        icon: { name: 'graph', type: 'octicon' },
    },
    {
        name: 'Service management',
        component: ServiceManagement,
        options: { title: 'Service management' },
        submenus: [
            {
                name: 'Create service',
                component: CreateServiceManagement,
                options: { title: 'Create service' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'church', type: 'material-community' },
            },
            {
                name: 'Create CGWC session',
                component: CreateCGWGSession,
                options: { title: 'Create CGWC Session' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'church', type: 'material-community' },
            },
        ],
        users: [ROLES.superAdmin],
        inMenuBar: false,
        inMore: true,
        icon: { name: 'church', type: 'material-community' },
    },
    {
        name: 'Assign group head',
        component: AssignRole,
        options: { title: 'Assign group head' },
        submenus: [],
        users: [ROLES.superAdmin, ROLES.globalPastor],
        inMenuBar: false,
        inMore: true,
        icon: { name: 'account-group-outline', type: 'material-community' },
    },
    {
        name: 'Group head campus',
        component: CampusGroupHeads,
        options: { title: 'Group head campus' },
        submenus: [
            {
                name: 'Group head campuses',
                component: GroupHeadCampuses,
                options: { title: 'Group head campuses' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person', type: 'octicon' },
            },
            {
                name: 'Group head departments',
                component: GroupHeadDepartments,
                options: { title: 'Group head departments' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person', type: 'octicon' },
            },
            {
                name: 'Group head department activies',
                component: GroupHeadDepartmentActivies,
                options: { title: 'Group head department activies' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person', type: 'octicon' },
            },
        ],
        users: [ROLES.groupHead],
        inMenuBar: false,
        inMore: true,
        icon: { name: 'home-group', type: 'material-community' },
    },
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
                inMore: false,
                icon: { name: 'person', type: 'octicon' },
            },
            {
                name: 'User Profile',
                component: UserDetails,
                options: { title: 'User profile' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person', type: 'octicon' },
            },
            {
                name: 'User Report',
                component: UserReport,
                options: { title: 'User report' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person', type: 'octicon' },
            },
            {
                name: 'User Report Details',
                component: UserReportDetailsPage,
                options: { title: 'User report' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person', type: 'octicon' },
            },
            {
                name: 'Create User',
                component: CreateUser,
                options: { title: 'Create user' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person', type: 'octicon' },
            },
            {
                name: 'Create Department',
                component: CreateDepartment,
                options: { title: 'Create department' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person', type: 'octicon' },
            },
            {
                name: 'Create Campus',
                component: CreateCampus,
                options: { title: 'Create campus' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person', type: 'octicon' },
            },
            {
                name: 'Campus workforce',
                component: CampusWorkforceSummary,
                options: { title: 'Campus workforce' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person', type: 'octicon' },
            },
            {
                name: 'Global workforce',
                component: GlobalWorkforceSummary,
                options: { title: 'Global workforce' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person', type: 'octicon' },
            },
        ],
        users: [
            ROLES.HOD,
            ROLES.AHOD,
            ROLES.groupHead,
            ROLES.superAdmin,
            ROLES.globalAdmin,
            ROLES.campusPastor,
            ROLES.globalPastor,
            ROLES.campusCoordinator,
        ],
        inMenuBar: false,
        inMore: true,
        icon: { name: 'database-cog-outline', type: 'material-community' },
    },
    {
        name: 'Manual clock in',
        component: ManualClockin,
        options: { title: 'Manual clock in' },
        submenus: [],
        users: [ROLES.superAdmin, ROLES.campusPastor, DEPARTMENTS.QC, DEPARTMENTS.ME, ROLES.campusCoordinator],
        inMenuBar: false,
        inMore: true,
        icon: { name: 'timer-outline', type: 'material-community' },
    },
    {
        name: 'Export Data',
        component: Export,
        options: { title: 'Export Data' },
        submenus: [],
        users: [
            DEPARTMENTS.QC,
            DEPARTMENTS.ME,
            ROLES.groupHead,
            ROLES.superAdmin,
            ROLES.globalAdmin,
            ROLES.campusPastor,
            ROLES.globalPastor,
            ROLES.campusCoordinator,
        ],
        inMenuBar: false,
        inMore: true,
        icon: { name: 'download-outline', type: 'ionicon' },
    },
    // TODO: CGWC on hold until Android is ready
    {
        name: 'CGWC',
        component: CGWC,
        options: { title: 'CGWC' },
        submenus: [
            {
                name: 'Create CGWC',
                component: CreateCGWC,
                options: { title: 'Create CGWC' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'crown', type: 'foundation' },
            },
            {
                name: 'CGWC Details',
                component: CGWCDetails,
                options: { title: 'CGWC Details' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'crown', type: 'foundation' },
            },
            {
                name: 'Create Instant Message',
                component: CreateCGWCInstantMessage,
                options: { title: 'Create Instant Message' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'new-message', type: 'entypo' },
            },
            {
                name: 'CGWC Report',
                component: CGWCReport,
                options: { title: 'CGWC Report' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'crown', type: 'foundation' },
            },
            {
                name: 'CGWC Attendance',
                component: CGWCGroupAttendance,
                options: { title: 'CGWC Attendance' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person', type: 'ionicon' },
            },
            {
                name: 'CGWC Resources',
                component: CGWCResources,
                options: { title: 'CGWC Resources' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person', type: 'ionicon' },
            },
            {
                name: 'CGWC Feedback',
                component: CGWCFeedback,
                options: { title: 'CGWC Feedback' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person', type: 'ionicon' },
            },
        ],
        users: [],
        inMenuBar: false,
        inMore: true,
        icon: { name: 'crown', type: 'foundation' },
    },

    {
        name: 'More',
        component: More,
        options: { title: 'More' },
        submenus: [],
        users: [],
        inMenuBar: true,
        inMore: false,
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
        inMore: false,
        inMenuBar: false,
    },
    {
        name: 'Verify Email',
        component: VerifyEmail,
        options: { title: 'Verify Email' },
        submenus: [],
        users: [],
        inMore: false,
        inMenuBar: false,
    },
    {
        name: 'Login',
        component: Login,
        options: { title: 'Login' },
        submenus: [],
        users: [],
        inMore: false,
        inMenuBar: false,
    },
    {
        name: 'Register',
        component: Register,
        options: { title: 'Register' },
        submenus: [],
        users: [],
        inMore: false,
        inMenuBar: false,
    },
    {
        name: 'Forgot Password',
        component: ForgotPassword,
        options: { title: 'Forgot Password' },
        submenus: [],
        users: [],
        inMore: false,
        inMenuBar: false,
    },
    {
        name: 'Reset Password',
        component: ResetPassword,
        options: { title: 'Reset Password' },
        submenus: [],
        users: [],
        inMore: false,
        inMenuBar: false,
    },
];

export { AppRoutes, AuthRoutes };
