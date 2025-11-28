import React from 'react';

const DateTabs = ({ dates, selectedDate, onSelectDate }) => {
    return (
        <div className="date-tabs">
            {dates.map((date) => (
                <button
                    key={date}
                    className={`tab-btn ${selectedDate === date ? 'active' : ''}`}
                    onClick={() => onSelectDate(date)}
                >
                    {date}
                </button>
            ))}
        </div>
    );
};

export default DateTabs;
