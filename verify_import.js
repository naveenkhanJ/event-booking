import * as XLSX from 'xlsx';
import { transformExcelData } from './src/utils/excelParser.js';
import fs from 'fs';

// Mock the file reading part since we are in Node
const buffer = fs.readFileSync('mock_data.xlsx');
const workbook = XLSX.read(buffer, { type: 'buffer' });
const firstSheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[firstSheetName];
const jsonData = XLSX.utils.sheet_to_json(worksheet);

console.log('Raw JSON from Excel:', JSON.stringify(jsonData, null, 2));

const bookings = transformExcelData(jsonData);
console.log('Transformed Bookings:', JSON.stringify(bookings, null, 2));

// Assertions
const expectedKey1 = '04th December-2-3'; // 10.45am - 11.45am is Slot 2. Row 3.
const expectedKey2 = '01st December-3-9'; // 11.30am - 12.30pm is Slot 3. Row 9.

if (bookings[expectedKey1] && bookings[expectedKey1].name === 'Padma Gunaratne') {
    console.log('SUCCESS: Found Padma Gunaratne in correct slot.');
} else {
    console.error('FAILURE: Padma Gunaratne not found or in wrong slot.');
}

if (bookings[expectedKey2] && bookings[expectedKey2].name === 'Dr Padma Gunaratne') {
    console.log('SUCCESS: Found Dr Padma Gunaratne in correct slot.');
} else {
    console.error('FAILURE: Dr Padma Gunaratne not found or in wrong slot.');
}
