import React, { useRef } from 'react';

const FileUpload = ({ onFileUpload }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onFileUpload(file);
        }
    };

    return (
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                ref={fileInputRef}
            />
            <button
                className="btn btn-primary"
                onClick={() => fileInputRef.current.click()}
                style={{ backgroundColor: '#28a745', borderColor: '#28a745' }}
            >
                Upload Excel
            </button>
            <span style={{ fontSize: '12px', color: '#666' }}>
                Supports .xlsx, .xls
            </span>
        </div>
    );
};

export default FileUpload;
