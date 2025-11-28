import * as XLSX from 'xlsx';

const data = [
    {
        "ID": 245,
        "Name": "Padma Gunaratne",
        "Email": "pagunara@gmail.com",
        "Phone": "773170789",
        "Age Category": "60+",
        "Gender": "Female",
        "Sector": "Private Sector",
        "Date": "2025-12-04",
        "Time Slot": "10:45 am - 11:45 am",
        "Slot Number(s)": 3,
        "Slot Count": 1
    },
    {
        "ID": 244,
        "Name": "Dr Padma Gunaratne",
        "Email": "pagunara@gmail.com",
        "Phone": "773170789",
        "Age Category": "60+",
        "Gender": "Female",
        "Sector": "Private Sector",
        "Date": "2025-12-01",
        "Time Slot": "11:30 am - 12:30 pm",
        "Slot Number(s)": 9,
        "Slot Count": 1
    }
];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(data);
XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
XLSX.writeFile(wb, "mock_data.xlsx");
console.log("Mock Excel file created: mock_data.xlsx");
