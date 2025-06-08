// === frontend/src/pages/MyWorksPage.tsx ===
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WorkListItem from '../components/WorkListItem/WorkListItem';
import WorkFilters from '../components/WorkFilters/WorkFilters'; 
import './MyWorksPage.css'; 

interface Novel { 
    novel_id: number; 
    title: string; 
    status: string; 
    view_count: number; 
    chapter_count: number; 
    cover_image_url: string | null; 
}

const MyWorksPage = () => {
    const [novels, setNovels] = useState<Novel[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { 
        const fetchMyNovels = async () => { 
            try { 
                const response = await fetch('http://localhost:3000/api/novels/my-works', { credentials: 'include' }); 
                if (!response.ok) { throw new Error('ไม่สามารถดึงข้อมูลได้ หรือยังไม่ได้ล็อกอิน'); } 
                const data = await response.json(); 
                setNovels(data); 
            } catch (error) { 
                console.error(error); 
            } finally { 
                setIsLoading(false); 
            } 
        };
        fetchMyNovels();
    }, []);

    if (isLoading) return <div style={{marginTop: '80px', padding: '20px'}}>กำลังโหลดข้อมูล...</div>;

    return (
        <div style={{padding: '20px'}}>
            <WorkFilters />
            
            <div className="works-header">
                <h1>ผลงานของฉัน</h1>
                <Link to="/create-novel" className="add-work-link">+ เพิ่มผลงาน</Link>
            </div>

            <div className="works-list-container">
                <div className="works-list-header">
                    <span>ปก</span>
                    <span>ชื่อเรื่อง</span>
                    <span>ยอดวิว</span>
                    <span>จำนวนตอน</span>
                    <span>การเผยแพร่</span>
                    <span>สถานะ</span>
                    <span></span>
                </div>
                
                {novels.length === 0 ? (
                    <div style={{textAlign: 'center', padding: '30px', backgroundColor: '#fff', borderRadius: '8px'}}>คุณยังไม่มีผลงานเลย!</div>
                ) : (
                    novels.map(novel => (
                        <WorkListItem key={novel.novel_id} novel={novel} />
                    ))
                )}
            </div>
        </div>
    );
};
export default MyWorksPage;