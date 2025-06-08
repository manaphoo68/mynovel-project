// === frontend/src/pages/CreateNovelPage.tsx ===
import React, { useState } from 'react';

const CreateNovelPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/novels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
        credentials: 'include', // สำคัญมาก!
      });
      const result = await response.json();
      alert(result.message);
      if (response.ok) {
        // ถ้าสำเร็จ อาจจะ redirect ไปหน้าจัดการนิยายเรื่องนั้นๆ
        setTitle('');
        setDescription('');
      }
    } catch (error) {
      console.error('Error creating novel:', error);
      alert('เกิดข้อผิดพลาดในการสร้างนิยาย');
    }
  };

  return (
    <div style={{ marginTop: '80px', maxWidth: '600px', margin: '80px auto' }}>
      <h1>สร้างนิยายเรื่องใหม่</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        <label htmlFor="title">ชื่อเรื่อง</label>
        <input 
          type="text" 
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ padding: '10px', marginBottom: '15px', fontSize: '1em' }}
        />

        <label htmlFor="description">คำโปรย</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          style={{ padding: '10px', marginBottom: '15px', fontSize: '1em', fontFamily: 'sans-serif' }}
        ></textarea>

        <button type="submit" style={{ padding: '12px', cursor: 'pointer', fontSize: '1.1em' }}>สร้างนิยาย</button>
      </form>
    </div>
  );
};

export default CreateNovelPage;