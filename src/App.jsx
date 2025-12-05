import React, { useState, useEffect } from 'react';
import ScheduleTable from './components/ScheduleTable';
import BookingModal from './components/BookingModal';
import AdminLogin from './components/AdminLogin';
import DateTabs from './components/DateTabs';
import FileUpload from './components/FileUpload';
import { parseExcelFile, transformExcelData } from './utils/excelParser';
import { db } from './firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';


function App() {
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [bookings, setBookings] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentSlot, setCurrentSlot] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      const newBookings = {};
      const datesSet = new Set();

      snapshot.forEach((doc) => {
        const data = doc.data();
        newBookings[doc.id] = data;
        // Key format: "01st December-1-1"
        const datePart = doc.id.split('-')[0];
        datesSet.add(datePart);
      });

      setBookings(newBookings);

      // Sort dates chronologically
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      const sortedDates = Array.from(datesSet).sort((a, b) => {
        const parseDate = (str) => {
          // str e.g. "01st December"
          const [dayStr, monthStr] = str.split(' ');
          const day = parseInt(dayStr, 10);
          const monthIndex = months.indexOf(monthStr);
          return { day, monthIndex };
        };

        const dA = parseDate(a);
        const dB = parseDate(b);

        if (dA.monthIndex !== dB.monthIndex) {
          return dA.monthIndex - dB.monthIndex;
        }
        return dA.day - dB.day;
      });

      setAvailableDates(sortedDates);

      // Select first date if none selected or current selection is invalid
      if (sortedDates.length > 0) {
        setSelectedDate(prev => sortedDates.includes(prev) ? prev : sortedDates[0]);
      }

      console.log('Loaded bookings from Firestore:', Object.keys(newBookings).length);
    });

    return () => unsubscribe();
  }, []);

  const handleSlotClick = (rowId, slotId) => {
    if (!isAdmin) {
      alert("Only admins can edit bookings. Please log in.");
      return;
    }
    setCurrentSlot({ rowId, slotId });
    setIsModalOpen(true);
  };

  const handleSaveBooking = async (data) => {
    if (currentSlot) {
      const key = `${selectedDate}-${currentSlot.slotId}-${currentSlot.rowId}`;
      try {
        await setDoc(doc(db, 'bookings', key), data);
      } catch (error) {
        console.error("Error saving document: ", error);
        alert("Failed to save booking. Please try again.");
      }
    }
    setIsModalOpen(false);
    setCurrentSlot(null);
  };

  const handleDeleteBooking = async () => {
    if (currentSlot) {
      const key = `${selectedDate}-${currentSlot.slotId}-${currentSlot.rowId}`;
      try {
        await deleteDoc(doc(db, 'bookings', key));
      } catch (error) {
        console.error("Error deleting document: ", error);
        alert("Failed to delete booking. Please try again.");
      }
    }
    setIsModalOpen(false);
    setCurrentSlot(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentSlot(null);
  };

  const handleFileUpload = async (file) => {
    try {
      const jsonData = await parseExcelFile(file);
      const newBookings = transformExcelData(jsonData);
      const validBookings = newBookings; // All parsed bookings are considered valid now

      if (Object.keys(validBookings).length === 0) {
        // Create a debug report
        const debugReport = Object.entries(newBookings).slice(0, 5).map(([key, val]) =>
          `${key}: ${val.name} (${val.mobile})`
        ).join('\n');

        alert(`No valid bookings found.\n\nDebug Info (First 5 parsed items):\n${debugReport || 'No items parsed'}\n\nExpected Date Format: DD-MM-YYYY (e.g., 01-12-2025)`);
        return;
      }

      // Batch write to Firestore
      const batch = writeBatch(db);
      Object.entries(validBookings).forEach(([key, data]) => {
        const docRef = doc(db, 'bookings', key);
        batch.set(docRef, data);
      });

      await batch.commit();
      alert(`Successfully imported ${Object.keys(validBookings).length} bookings!`);
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      alert(`Failed to parse Excel file. Error: ${error.message}`);
    }
  };

  const getInitialModalData = () => {
    if (currentSlot) {
      const key = `${selectedDate}-${currentSlot.slotId}-${currentSlot.rowId}`;
      return bookings[key];
    }
    return null;
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Event Booking</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isAdmin && <FileUpload onFileUpload={handleFileUpload} />}
          <button
            onClick={() => isAdmin ? setIsAdmin(false) : setIsAdminLoginOpen(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: isAdmin ? '#ff4444' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {isAdmin ? 'Logout' : 'Admin Login'}
          </button>
        </div>
      </div>

      {isAdmin && (
        <div style={{ padding: '10px', background: '#f0f0f0', marginBottom: '10px', fontSize: '12px' }}>
          <strong>Debug Info:</strong><br />
          Total Bookings: {Object.keys(bookings).length}<br />
          Row 11 Bookings: {Object.keys(bookings).filter(k => k.endsWith('-11')).length}<br />
          Row 12 Bookings: {Object.keys(bookings).filter(k => k.endsWith('-12')).length}<br />
          Row 13 Bookings: {Object.keys(bookings).filter(k => k.endsWith('-13')).length}<br />
          Row 14 Bookings: {Object.keys(bookings).filter(k => k.endsWith('-14')).length}<br />
          Row 15 Bookings: {Object.keys(bookings).filter(k => k.endsWith('-15')).length}
        </div>
      )}

      <DateTabs
        dates={availableDates}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
      <ScheduleTable
        bookings={bookings}
        onSlotClick={handleSlotClick}
        selectedDate={selectedDate}
      />
      <BookingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveBooking}
        onDelete={handleDeleteBooking}
        initialData={getInitialModalData()}
      />
      <AdminLogin
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLogin={() => setIsAdmin(true)}
      />
    </div>
  );
}

export default App;
