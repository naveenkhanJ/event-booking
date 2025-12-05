import { transformExcelData } from './excelParser.js';

const testData = [
    {
        'Name': 'Ambiguous Date 1',
        'Phone': '123',
        'Date': '12-05-2025', // Should be Dec 5th (MM-DD-YYYY) not May 12th
        'Time Slot': '10:00 am - 11:00 am',
        'Slot Number(s)': '1'
    },
    {
        'Name': 'Ambiguous Date 2',
        'Phone': '123',
        'Date': '05-12-2025', // Should be Dec 5th (DD-MM-YYYY)
        'Time Slot': '10:00 am - 11:00 am',
        'Slot Number(s)': '2'
    },
    {
        'Name': 'Clear Date',
        'Phone': '123',
        'Date': '12-07-2025', // Dec 7th
        'Time Slot': '10:00 am - 11:00 am',
        'Slot Number(s)': '3'
    }
];

console.log('Testing transformExcelData...');
const result = transformExcelData(testData);
const keys = Object.keys(result);
console.log('Generated keys:', keys);
// Expected: All should be December dates
