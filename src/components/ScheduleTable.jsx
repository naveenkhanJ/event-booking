import React from 'react';

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

const ROWS = Array.from({ length: 15 }, (_, i) => i + 1);

const ScheduleTable = ({ bookings, onSlotClick, selectedDate }) => {
    const getBooking = (rowId, slotId) => {
        const key = `${selectedDate}-${slotId}-${rowId}`;
        return bookings[key];
    };

    return (
        <table className="schedule-table">
            <thead>
                <tr className="header-row-1">
                    <th colSpan={SLOTS.length + 1}>{selectedDate} - Monday</th>
                </tr>
                <tr className="header-row-2">
                    <th>Slot No</th>
                    {SLOTS.map((slot) => (
                        <th key={slot.id}>Slot {slot.id}</th>
                    ))}
                </tr>
                <tr className="header-row-3">
                    <th>Time</th>
                    {SLOTS.map((slot) => (
                        <th key={slot.id}>{slot.time}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {ROWS.map((rowId) => (
                    <tr key={rowId}>
                        <td style={{ fontWeight: 'bold' }}>{rowId}</td>
                        {SLOTS.map((slot) => {
                            const booking = getBooking(rowId, slot.id);
                            return (
                                <td
                                    key={slot.id}
                                    className={`slot-cell ${booking ? 'booked' : ''}`}
                                    onClick={() => onSlotClick(rowId, slot.id)}
                                >
                                    {booking && (
                                        <>
                                            <span className="participant-name">{booking.name}</span>
                                            <span className="participant-mobile">{booking.mobile}</span>
                                        </>
                                    )}
                                </td>
                            );
                        })}
                    </tr>
                ))}
                <tr>
                    <td style={{ fontWeight: 'bold' }}>Total Registered</td>
                    {SLOTS.map((slot) => {
                        const count = ROWS.reduce((acc, rowId) => {
                            return acc + (getBooking(rowId, slot.id) ? 1 : 0);
                        }, 0);
                        return <td key={slot.id} style={{ fontWeight: 'bold' }}>{count}</td>
                    })}
                </tr>
            </tbody>
        </table>
    );
};

export default ScheduleTable;
