// Departments whose report data has nested arrays/objects that can't survive
// expo-router param serialization — they travel as a JSON `data` string.
export const NESTED_PARAM_DEPTS = new Set([
    'Children Ministry',
    'Witty Inventions',
    'Traffic & Security',
    'Digital Surveillance Security',
    'COZA Transfer Service',
]);
