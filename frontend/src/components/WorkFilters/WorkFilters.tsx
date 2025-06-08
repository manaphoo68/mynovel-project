// === frontend/src/components/WorkFilters/WorkFilters.tsx ===
import React from 'react';
import './WorkFilters.css';

const WorkFilters = () => {
  return (
    <div className="filters-container">
      <input type="text" placeholder="ค้นหา..." className="filter-search" />
      <select className="filter-select">
        <option value="">ทั้งหมด (หมวดหมู่)</option>
      </select>
      <select className="filter-select">
        <option value="">ทั้งหมด (การเผยแพร่)</option>
      </select>
      <select className="filter-select">
        <option value="">ทั้งหมด (สถานะ)</option>
      </select>
      <button className="filter-button clear">ล้างค่าการค้นหา</button>
    </div>
  );
};

export default WorkFilters;