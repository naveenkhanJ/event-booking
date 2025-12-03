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
        const slotNumbersStr = row['Slot Number(s)']; // e.g., 3 or "5, 6"

        if (!name || !dateStr || !slotNumbersStr) return;

        // 1. Format Date
        let dateObj;
        if (dateStr instanceof Date) {
            dateObj = dateStr;
        } else {
            dateObj = new Date(dateStr);
        }

        if (isNaN(dateObj.getTime())) {
            console.warn('Invalid date found:', dateStr);
            return;
        }

        const day = dateObj.getDate();
        const suffix = (day) => {
            if (day > 3 && day < 21) return 'th';
            switch (day % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        };
        const formattedDate = `${day.toString().padStart(2, '0')}${suffix(day)} December`;

        // 2. Parse Slot Numbers (Rows)
        const rowIds = String(slotNumbersStr).split(',').map(s => parseInt(s.trim(), 10));
        console.log(`Parsed rowIds for ${name}:`, rowIds);

        // 3. Map Time Slot to Column ID
        const slotId = findSlotIdByTime(timeSlotStr);

        if (slotId) {
            rowIds.forEach(rowId => {
                if (!isNaN(rowId)) {
                    const key = `${formattedDate}-${slotId}-${rowId}`;
                    bookings[key] = { name, mobile };
                }
            });
        }
    });

    return bookings;
};

const SLOTS = [
    { id: 1, time: '10am - 11am' },
    { id: 2, time: '10.45am - 11.45am' },
    { id: 3, time: '11.30am - 12.30pm' },
    { id: 4, time: '1.30pm - 2.30pm' },
    { id: 5, time: '2.15pm - 3.15pm' },
    { id: 6, time: '3pm - 4pm' },
    { id: 7, time: '3.45pm - 4.45pm' },
    { id: 8, time: '5.15pm - 6.15pm' },
    { id: 9, time: '6pm - 7pm' },
    { id: 10, time: '6.45pm - 7.45pm' },
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
