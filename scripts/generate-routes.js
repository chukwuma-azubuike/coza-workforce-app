const fs = require('fs').promises;
const path = require('path');

const AppRoutes = [
    {
        name: 'Home',
        href: '/',
        options: { title: 'Home' },
        submenus: [],
        users: [],
        inMenuBar: true,
        inMore: false,
        icon: { name: 'home', type: 'antdesign' },
    },
    {
        name: 'Attendance',
        options: { title: 'Attendance' },
        submenus: [],
        users: [],
        inMenuBar: true,
        inMore: false,
        icon: { name: 'checklist', type: 'octicon' },
        href: '/(tabs)/attendance',
    },
    {
        name: 'Permissions',
        options: { title: 'Permissions' },
        submenus: [
            {
                name: 'Request permission',
                options: { title: 'Request permission' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'hand-left-outline', type: 'ionicon' },
                href: '/(stack)/permissions/request-permission',
            },
            {
                name: 'Permission Details',
                options: { title: 'Permission Details' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'hand-left-outline', type: 'ionicon' },
                href: '/(stack)/permissions/permission-details',
            },
        ],
        users: [],
        inMenuBar: true,
        inMore: false,
        icon: { name: 'hand-left-outline', type: 'ionicon' },
        href: '/(tabs)/permissions',
    },
    {
        name: 'Tickets',
        options: { title: 'Tickets' },
        submenus: [
            {
                name: 'Ticket Details',
                options: { title: 'Ticket Details' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'ticket-confirmation-outline', type: 'material-community' },
                href: '/(stack)/tickets/ticket-details',
            },
            {
                name: 'Issue Ticket',
                options: { title: 'Issue Ticket' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'ticket-confirmation-outline', type: 'material-community' },
                href: '/(stack)/tickets/issue-ticket',
            },
        ],
        users: [],
        inMenuBar: true,
        inMore: false,
        icon: { name: 'ticket-confirmation-outline', type: 'material-community' },
        href: '/(tabs)/tickets',
    },
    {
        name: 'Notifications',
        options: { title: 'Notifications' },
        submenus: [],
        users: [],
        inMenuBar: false,
        inMore: false,
        icon: { name: 'notifications-outline', type: 'ionicon' },
        href: '/(tabs)/notifications',
    },
    {
        name: 'Profile',
        options: { title: 'Profile' },
        submenus: [
            {
                name: 'Edit Profile',
                options: { title: 'Edit Profile' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person-outline', type: 'ionicon' },
                href: '/(stack)/profile/edit-profile',
            },
        ],
        users: [],
        inMenuBar: false,
        inMore: false,
        icon: { name: 'person-outline', type: 'ionicon' },
        href: '/(tabs)/profile',
    },
    {
        name: 'Reports',
        options: { title: 'Reports' },
        submenus: [
            {
                name: 'Childcare Report',
                options: { title: 'Childcare Report' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'graph', type: 'octicon' },
                href: '/(stack)/reports/childcare-report',
            },
            {
                name: 'Incident Report',
                options: { title: 'Incident Report' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'graph', type: 'octicon' },
                href: '/(stack)/reports/incident-report',
            },
            {
                name: 'Attendance Report',
                options: { title: 'Attendance Report' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'graph', type: 'octicon' },
                href: '/(stack)/reports/attendance-report',
            },
            {
                name: 'Guest Report',
                options: { title: 'Guest Report' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'graph', type: 'octicon' },
                href: '/(stack)/reports/guest-report',
            },
            {
                name: 'Service Report',
                options: { title: 'Service Report' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'graph', type: 'octicon' },
                href: '/(stack)/reports/service-report',
            },
            {
                name: 'Security Report',
                options: { title: 'Security Report' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'graph', type: 'octicon' },
                href: '/(stack)/reports/security-report',
            },
            {
                name: 'Transfer Report',
                options: { title: 'Transfer Report' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'graph', type: 'octicon' },
                href: '/(stack)/reports/transfer-report',
            },
            {
                name: 'Campus Report',
                options: { title: 'Campus Report' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'graph', type: 'octicon' },
                href: '/(stack)/reports/campus-report',
            },
        ],
        inMenuBar: false,
        inMore: true,
        icon: { name: 'graph', type: 'octicon' },
        href: '/(stack)/reports',
    },
    {
        name: 'Service management',
        options: { title: 'Service management' },
        submenus: [
            {
                name: 'Create service',
                options: { title: 'Create service' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'church', type: 'material-community' },
                href: '/(stack)/service-management/create-service',
            },
            {
                name: 'Create Congress session',
                options: { title: 'Create Congress Session' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'church', type: 'material-community' },
                href: '/(stack)/service-management/create-congress-session',
            },
        ],
        inMenuBar: false,
        inMore: true,
        icon: { name: 'church', type: 'material-community' },
        href: '/(stack)/service-management',
    },
    {
        name: 'Assign Group Head',
        options: { title: 'Assign Group Head' },
        submenus: [],
        inMenuBar: false,
        inMore: true,
        icon: { name: 'account-group-outline', type: 'material-community' },
        href: '/(stack)/assign-group-head',
    },
    {
        name: 'Group Head Campus',
        options: { title: 'Group Head Campus' },
        submenus: [
            {
                name: 'Group Head Campuses',
                options: { title: 'Group Head Campuses' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person', type: 'octicon' },
                href: '/(stack)/group-head-campus/group-head-campuses',
            },
            {
                name: 'Group Head Departments',
                options: { title: 'Group Head Departments' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person', type: 'octicon' },
                href: '/(stack)/group-head-campus/group-head-departments',
            },
            {
                name: 'Group Head Department Activities',
                options: { title: 'Group Head Department Activities' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person', type: 'octicon' },
                href: '/(stack)/group-head-campus/group-head-department-activities',
            },
        ],
        inMenuBar: false,
        inMore: true,
        icon: { name: 'home-group', type: 'material-community' },
        href: '/(stack)/group-head-campus',
    },
    {
        name: 'GH Reports History',
        options: { title: 'GH Reports History' },
        submenus: [],
        inMenuBar: false,
        inMore: true,
        icon: { name: 'graph', type: 'octicon' },
        href: '/(stack)/gh-reports-history',
    },
    {
        name: 'Group Head Service Report',
        options: { title: 'Group Head Service Report' },
        submenus: [
            {
                name: 'Group Head Service Summary',
                options: { title: 'Group Head Service Summary' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person', type: 'octicon' },
                href: '/(stack)/group-head-service-report/group-head-service-summary',
            },
            {
                name: 'Submit report summary',
                options: { title: 'Submit report summary' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person', type: 'octicon' },
                href: '/(stack)/group-head-service-report/submit-report-summary',
            },
        ],
        inMenuBar: false,
        inMore: false,
        icon: { name: 'graph', type: 'octicon' },
        href: '/(tabs)/group-head-service-report',
    },
    {
        name: 'Workforce summary',
        options: { title: 'Workforce management' },
        submenus: [
            {
                name: 'Workforce management',
                options: { title: 'Workforce management' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person', type: 'octicon' },
                href: '/(stack)/workforce-summary/workforce-management',
            },
            {
                name: 'User Profile',
                options: { title: 'User profile' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person', type: 'octicon' },
                href: '/(stack)/workforce-summary/user-profile',
            },
            {
                name: 'User Report',
                options: { title: 'User report' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person', type: 'octicon' },
                href: '/(stack)/workforce-summary/user-report',
            },
            {
                name: 'User Report Details',
                options: { title: 'User report' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person', type: 'octicon' },
                href: '/(stack)/workforce-summary/user-report-details',
            },
            {
                name: 'Create User',
                options: { title: 'Create user' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person', type: 'octicon' },
                href: '/(stack)/workforce-summary/create-user',
            },
            {
                name: 'Create Department',
                options: { title: 'Create department' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person', type: 'octicon' },
                href: '/(stack)/workforce-summary/create-department',
            },
            {
                name: 'Create Campus',
                options: { title: 'Create campus' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person', type: 'octicon' },
                href: '/(stack)/workforce-summary/create-campus',
            },
            {
                name: 'Campus workforce',
                options: { title: 'Campus workforce' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person', type: 'octicon' },
                href: '/(stack)/workforce-summary/campus-workforce',
            },
            {
                name: 'Global workforce',
                options: { title: 'Global workforce' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person', type: 'octicon' },
                href: '/(stack)/workforce-summary/global-workforce',
            },
        ],
        inMenuBar: false,
        inMore: true,
        icon: { name: 'database-cog-outline', type: 'material-community' },
        href: '/(stack)/workforce-summary',
    },
    {
        name: 'Manual clock in',
        options: { title: 'Manual clock in' },
        submenus: [],
        inMenuBar: false,
        inMore: true,
        icon: { name: 'timer-outline', type: 'material-community' },
        href: '/(stack)/manual-clock-in',
    },
    {
        name: 'Export Data',
        options: { title: 'Export Data' },
        submenus: [],

        inMenuBar: false,
        inMore: true,
        icon: { name: 'download-outline', type: 'ionicon' },
        href: '/(stack)/export-data',
    },
    {
        name: 'Congress',
        options: { title: 'Congress' },
        submenus: [
            {
                name: 'Create Congress',
                options: { title: 'Create Congress' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'crown', type: 'foundation' },
                href: '/(stack)/congress/create-congress',
            },
            {
                name: 'Congress Details',
                options: { title: 'Congress Details' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                hideHeader: true,
                icon: { name: 'crown', type: 'foundation' },
                href: '/(stack)/congress/congress-details',
            },
            {
                name: 'Create Instant Message',
                options: { title: 'Create Instant Message' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'new-message', type: 'entypo' },
                href: '/(stack)/congress/create-instant-message',
            },
            {
                name: 'Congress Report',
                options: { title: 'Congress Report' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'crown', type: 'foundation' },
                href: '/(stack)/congress/congress-report',
            },
            {
                name: 'Congress Attendance',
                options: { title: 'Congress Attendance' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person', type: 'ionicon' },
                href: '/(stack)/congress/congress-attendance',
            },
            {
                name: 'Congress Resources',
                options: { title: 'Congress Resources' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person', type: 'ionicon' },
                href: '/(stack)/congress/congress-resources',
            },
            {
                name: 'Congress Feedback',
                options: { title: 'Congress Feedback' },
                submenus: [],
                users: [],
                inMenuBar: false,
                inMore: false,
                icon: { name: 'person', type: 'ionicon' },
                href: '/(stack)/congress/congress-feedback',
            },
        ],
        users: [],
        inMenuBar: false,
        inMore: true,
        icon: { name: 'crown', type: 'foundation' },
        href: '/(stack)/congress',
    },
    {
        name: 'More',
        options: { title: 'More' },
        submenus: [],
        users: [],
        inMenuBar: true,
        inMore: false,
        icon: { name: 'menu-outline', type: 'ionicon' },
        href: '/(tabs)/more',
    },
];

/**
 * Ensure a directory exists (creating it recursively if necessary).
 */
async function ensureDir(dirPath) {
    try {
        await fs.mkdir(dirPath, { recursive: true });
        // console.log(`Directory ensured: ${dirPath}`);
    } catch (e) {
        console.error(`Error creating directory ${dirPath}:`, e);
    }
}

/**
 * Check if a file exists.
 */
async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

/**
 * Returns the last non-empty segment from a given href.
 * For example, "/(stack)/permissions/request-permission" returns "request-permission"
 */
function getLastSegment(href) {
    const parts = href.split('/').filter(Boolean);
    return parts.length > 0 ? parts[parts.length - 1] : '';
}

/**
 * Create an index.tsx file inside a directory if it does not already exist.
 * The file contents use the provided componentName (e.g. "HomeScreen").
 */
async function createIndexFile(dirPath, componentName) {
    const filePath = path.join(dirPath, 'index.tsx');
    if (!(await fileExists(filePath))) {
        const content = `import React from 'react';
  
  const ${componentName}Screen: React.FC = () => {
      return <></>;
  };
  
  export default ${componentName}Screen;
  `;
        await fs.writeFile(filePath, content, 'utf8');
        console.log(`Created ${filePath}`);
    }
}

/**
 * Create a file (e.g. request-permission.tsx) in the given directory if it does not exist.
 */
async function createFile(filePath, componentName) {
    if (!(await fileExists(filePath))) {
        const content = `import React from 'react';
  
  const ${componentName}Screen: React.FC = () => {
      return <></>;
  };
  
  export default ${componentName}Screen;
  `;
        await fs.writeFile(filePath, content, 'utf8');
        console.log(`Created ${filePath}`);
    }
}

/**
 * Recursively process the routes.
 * - For first-level routes and any route with submenus, create a directory (with an index.tsx).
 * - For submenu routes without further submenus (leaf routes), create a file in the parent directory.
 *
 * @param {IAppRoute[]} routes - the array of route objects
 * @param {string} parentDir - the directory under which to create files/directories
 * @param {boolean} isFirstLevel - flag indicating if we are processing first-level routes
 */
async function processRoutes(routes, parentDir, isFirstLevel = false) {
    for (const route of routes) {
        // Determine if the current route should be a directory.
        // Create a directory if it's a first-level route or if it has submenus.
        const isDirectory = isFirstLevel || (route.submenus && route.submenus.length > 0);

        if (isDirectory) {
            // Determine directory name.
            let dirName = '';
            if (isFirstLevel) {
                // For first-level routes, if href is "/" use the lowercase route name; otherwise use the last segment.
                dirName =
                    route.href === '/' || route.href === ''
                        ? route.name.toLowerCase()
                        : getLastSegment(route.href) || route.name.toLowerCase();
            } else {
                // For submenu directory routes, use the last segment (or fallback to lowercased name).
                dirName = getLastSegment(route.href) || route.name.toLowerCase();
            }

            const currentDir = path.join(parentDir, dirName);
            await ensureDir(currentDir);

            // Create an index.tsx file if it does not exist.
            // Remove any spaces from the component name for a valid identifier.
            const componentName = route.name.replace(/\s+/g, '');
            await createIndexFile(currentDir, componentName);

            // If the route has submenus, process them recursively.
            if (route.submenus && route.submenus.length > 0) {
                await processRoutes(route.submenus, currentDir, false);
            }
        } else {
            // For a leaf submenu route (no further submenus), create a file in the current parent directory.
            const fileName = getLastSegment(route.href) || route.name.toLowerCase();
            const filePath = path.join(parentDir, `${fileName}.tsx`);
            const componentName = route.name.replace(/\s+/g, '');
            await createFile(filePath, componentName);
        }
    }
}

// --- Main Execution ---
(async function main() {
    const appDir = path.join(__dirname, '../app');
    await ensureDir(appDir);
    await processRoutes(AppRoutes, appDir, true);
})();
