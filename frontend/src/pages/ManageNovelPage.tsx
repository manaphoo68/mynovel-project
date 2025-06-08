// === frontend/src/pages/ManageNovelPage.tsx ===
import React from 'react';
import { useParams } from 'react-router-dom';

const ManageNovelPage = () => {
  const { novelId } = useParams<{ novelId: string }>();

  return (
    <div style={{ marginTop: '80px', padding: '20px' }}>
      <h1>จัดการนิยาย ID: {novelId}</h1>
      <p>หน้านี้จะเป็นที่สำหรับแก้ไขข้อมูลนิยาย และจัดการตอนทั้งหมดของนิยายเรื่องนี้ครับ</p>
    </div>
  );
};

export default ManageNovelPage;