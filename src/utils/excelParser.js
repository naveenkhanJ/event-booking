import * as XLSX from 'xlsx';

export const parseExcelFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                // Use cellDates: true to get Date objects for date cells
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                // Use raw: false to get formatted strings for other cells, but dateNF ensures dates are handled
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, dateNF: 'yyyy-mm-dd' });
                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};

export const transformExcelData = (data) => {
    const bookings = {};

    data.forEach((row) => {
        // Expected columns: Name, Phone, Date, Time Slot, Slot Number(s)
        const name = row['Name'];
        const mobile = row['Phone'];
        const dateStr = row['Date']; // e.g., "2025-12-04" or Date object
        const timeSlotStr = row['Time Slot']; // e.g., "10:45 am - 11:45 am"
        // const slotNumbersStr = row['Slot Number(s)']; // Moved down for fallback handling

        if (!name || !dateStr) return;

        // 1. Format Date
        let dateObj;
        if (dateStr instanceof Date) {
            dateObj = dateStr;
        } else {
            // Handle DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, DD.MM.YYYY, DD-MM-YY
            const dateString = String(dateStr).trim();

            // Regex for parts: (p1)-(p2)-(p3)
            const parts = dateString.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);

            if (parts) {
                const p1 = parseInt(parts[1], 10);
                const p2 = parseInt(parts[2], 10);
                let p3 = parseInt(parts[3], 10);

                // Handle 2-digit year
                if (p3 < 100) p3 += 2000;

                // Heuristic: The event is in December.
                // If p1 is 12 and p2 is valid day -> MM-DD-YYYY (Dec p2)
                // If p2 is 12 and p1 is valid day -> DD-MM-YYYY (Dec p1)

                if (p1 === 12 && p2 <= 31) {
                    // Assume MM-DD-YYYY (December)
                    dateObj = new Date(p3, p1 - 1, p2);
                } else if (p2 === 12 && p1 <= 31) {
                    // Assume DD-MM-YYYY (December)
                    dateObj = new Date(p3, p2 - 1, p1);
                } else {
                    // Default to DD-MM-YYYY if neither is explicitly December 
                    // or if both are 12 (12th Dec) which works either way
                    dateObj = new Date(p3, p2 - 1, p1);
                }
            } else {
                // Fallback to default parser
                dateObj = new Date(dateStr);
            }
        }

        if (isNaN(dateObj.getTime())) {
            console.warn('Invalid date found:', dateStr);
            return;
        }

        const day = dateObj.getDate();
        const monthIndex = dateObj.getMonth();
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const monthName = months[monthIndex];

        const suffix = (day) => {
            if (day > 3 && day < 21) return 'th';
            switch (day % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        };
        const formattedDate = `${day.toString().padStart(2, '0')}${suffix(day)} ${monthName}`;

        // 2. Parse Slot Numbers (Rows)
        // Try different column names
        const slotNumbersRaw = row['Slot Number(s)'] || row['Slot No'] || row['Slot Number'] || row['Slot Numbers'];

        if (!slotNumbersRaw) {
            console.warn(`No slot number found for ${name}`);
            return;
        }

        // Split by comma, slash, ampersand, plus, or hyphen (if surrounded by spaces to avoid negative numbers, though unlikely here)
        // We'll just split by non-digit characters except for maybe simple connecting punctuation
        const rowIds = String(slotNumbersRaw)
            .split(/[,/&+\-]|\s+and\s+/i) // Split by common separators
            .map(s => parseInt(s.trim(), 10))
            .filter(n => !isNaN(n)); // Filter out invalid numbers

        console.log(`Parsed rowIds for ${name} (raw: "${slotNumbersRaw}"):`, rowIds);

        // 3. Map Time Slot to Column ID
        const slotId = findSlotIdByTime(timeSlotStr);

        if (!slotId) {
            console.warn(`No slot ID found for time "${timeSlotStr}" for ${name}`);
        }

        if (slotId) {
            rowIds.forEach(rowId => {
                if (!isNaN(rowId)) {
                    const key = `${formattedDate}-${slotId}-${rowId}`;
                    bookings[key] = { name, mobile };
                    console.log(`Created booking key: ${key} for ${name}`);
                }
            });
        }
    });

    return bookings;
};

const SLOTS = [
    { id: 1, time: '10:00 am - 11:00 am' },
    { id: 2, time: '10:45 am - 11:45 am' },
    { id: 3, time: '11:30 am - 12:30 pm' },
    { id: 4, time: '1:30 pm - 2:30 pm' },
    { id: 5, time: '2:15 pm - 3:15 pm' },
    { id: 6, time: '3:00 pm - 4:00 pm' },
    { id: 7, time: '3:45 pm - 4:45 pm' },
    { id: 8, time: '5:15 pm - 6:15 pm' },
    { id: 9, time: '6:00 pm - 7:00 pm' },
    { id: 10, time: '6:45 pm - 7:45 pm' },
];

const findSlotIdByTime = (timeStr) => {
    if (!timeStr) return null;
    // Normalize strings for comparison (remove spaces, lowercase, replace dots with colons, remove :00)
    const normalize = (s) => s.toLowerCase().replace(/\s/g, '').replace(/\./g, ':').replace(/:00/g, '');
    const target = normalize(timeStr);

    // 1. Try Exact Match
    let found = SLOTS.find(s => normalize(s.time) === target);
    if (found) return found.id;

    // 2. Try handling "10-11 am" -> "10am-11am"
    // Split by '-'
    const parts = target.split('-');
    if (parts.length === 2) {
        let start = parts[0];
        const end = parts[1];

        // If start doesn't have am/pm but end does
        if (!start.includes('am') && !start.includes('pm')) {
            if (end.includes('am')) start += 'am';
            else if (end.includes('pm')) start += 'pm';

            const reconstructed = `${start}-${end}`;
            found = SLOTS.find(s => normalize(s.time) === reconstructed);
            if (found) return found.id;
        }
    }

    // 3. Fallback: Check if slot string contains the target (or vice versa)
    // This helps if there are minor differences like "10am - 11am" vs "10am-11am" (already handled by normalize)
    // or "10:00am" vs "10am"

    // Try to match just the start time
    // e.g. target "10:45am..." matches slot starting with "10:45am"
    const targetStart = target.split('-')[0];
    found = SLOTS.find(s => {
        const slotStart = normalize(s.time).split('-')[0];
        return slotStart === targetStart;
    });
    if (found) return found.id;

    return null;
};
