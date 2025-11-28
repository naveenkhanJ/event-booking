import React, { useState, useEffect } from 'react';

const BookingModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');

  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.name || '');
      setMobile(initialData.mobile || '');
    } else {
      setName('');
      setMobile('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !mobile) {
      alert('Please fill in both fields');
      return;
    }
    onSave({ name, mobile });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{initialData?.name ? 'Edit Booking' : 'New Booking'}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Participant Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Mobile Number</label>
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter mobile number"
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
