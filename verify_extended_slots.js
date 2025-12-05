import { transformExcelData } from './src/utils/excelParser.js';

const mockData = [
    {
        'Name': 'Test User 15',
        'Phone': '1234567890',
        'Date': '07-12-2025',
        'Time Slot': '10:00 am - 11:00 am',
        'Slot Number(s)': '13, 14, 15'
    }
];

console.log('--- Testing Extended Slots Parsing ---');
const bookings = transformExcelData(mockData);

const keys = Object.keys(bookings);
keys.forEach(key => {
    console.log(`Generated Key: ${key}`);
});

const expectedKeys = [
    '07th December-1-13',
    '07th December-1-14',
    '07th December-1-15'
];

const missing = expectedKeys.filter(k => !bookings[k]);

if (missing.length === 0) {
    console.log('PASS: All extended slots (13, 14, 15) parsed correctly.');
} else {
    console.error('FAIL: Missing keys:', missing);
}
