import React, { useState } from 'react';

function AdminLogin({ isOpen, onClose, onLogin }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simple hardcoded password for now
        if (password === 'admin123') {
            onLogin();
            onClose();
            setPassword('');
            setError('');
        } else {
            setError('Incorrect password');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Admin Login</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter admin password"
                        />
                        {error && <p style={{ color: 'red', marginTop: '5px' }}>{error}</p>}
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit" className="save-button">Login</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;
