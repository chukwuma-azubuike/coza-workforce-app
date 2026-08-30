import React from 'react';
import { Redirect } from 'expo-router';

/**
 * `/roast-crm` — where a mode switch and a bare deep link both arrive.
 *
 * Today, not My Guests. Roast's question is "what do I do now", and the Task Feed is the
 * only screen that answers it; My Guests answers "who do I have", which is something a
 * worker goes looking for rather than something they should land on.
 *
 * This lives in the stack rather than in `(tabs)/index.tsx`, where it was before. The tab
 * group is an `expo-router/ui` navigator whose state is built from its `TabTrigger`s, so a
 * route in that group with no trigger behind it has nothing to render it — and the old
 * file had a second problem besides: it rendered `MyGuestsDashboard` inline, giving that
 * screen a live duplicate outside its own tab, with no tab showing as focused.
 *
 * `roast-crm/_layout.tsx` already declared `<Stack.Screen name="index" />` for a file that
 * did not exist. This is it.
 */
const RoastCRMIndex: React.FC = () => {
    return <Redirect href="/roast-crm/notifications" />;
};

export default RoastCRMIndex;
