import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import './SearchModal.css';
import { FaSearch, FaTimes } from 'react-icons/fa';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const SearchModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // ทำให้ focus ที่ input field ทันทีเมื่อเปิด
      inputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ใช้ Portal เพื่อให้ Modal แสดงผลที่ top-level ของ DOM
  return ReactDOM.createPortal(
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="search-modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        <div className="search-modal-input-wrapper">
          <FaSearch className="search-modal-icon" />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="ค้นหานิยาย, นักเขียน, หรือสำนักพิมพ์..." 
          />
        </div>
        {/* สามารถเพิ่มส่วน "การค้นหายอดนิยม" หรืออื่นๆ ที่นี่ได้ในอนาคต */}
      </div>
    </div>,
    document.body
  );
};

export default SearchModal;