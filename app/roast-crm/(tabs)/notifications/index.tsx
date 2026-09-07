import React from 'react';

import { Today } from '~/views/roast-crm/today';

/**
 * The Roast tab's "Today" screen.
 *
 * The route keeps its `notifications` path on purpose — `01_ARCHITECTURE.md` ADR-006. The
 * *inbox* stays at `/notifications`; this is the Task Feed, and a worker opening Roast
 * wants "what do I do now" rather than "what was I told". Renaming the segment would break
 * `KNOWN_NOTIFICATION_ROUTES` and every deep link already in flight for the sake of a
 * folder name.
 */
const TodayScreen: React.FC = () => {
    return <Today />;
};

export default TodayScreen;
