import React, { useState, useEffect } from 'react';
import ScheduleTable from './components/ScheduleTable';
import BookingModal from './components/BookingModal';
import AdminLogin from './components/AdminLogin';
import DateTabs from './components/DateTabs';
import FileUpload from './components/FileUpload';
import { parseExcelFile, transformExcelData } from './utils/excelParser';
import { db } from './firebase';
import { collection, onSnapshot, doc, setDoc, writeBatch } from 'firebase/firestore';

const DATES = [
  '01st December',
  '02nd December',
  '03rd December',
  '04th December',
  '05th December',
  '06th December',
  '07th December',
];

function App() {
  const [selectedDate, setSelectedDate] = useState(DATES[0]);
  const [bookings, setBookings] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentSlot, setCurrentSlot] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      const newBookings = {};
      snapshot.forEach((doc) => {
        newBookings[doc.id] = doc.data();
      });
      setBookings(newBookings);
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentSlot(null);
  };

  const handleFileUpload = async (file) => {
    try {
      const jsonData = await parseExcelFile(file);
      const newBookings = transformExcelData(jsonData);

      // Batch write to Firestore
      const batch = writeBatch(db);
      Object.entries(newBookings).forEach(([key, data]) => {
        const docRef = doc(db, 'bookings', key);
        batch.set(docRef, data);
      });

      await batch.commit();
      alert('Bookings imported successfully!');
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      alert('Failed to parse Excel file.');
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
      <DateTabs
        dates={DATES}
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
