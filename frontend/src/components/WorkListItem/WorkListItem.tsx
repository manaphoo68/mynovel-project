// === frontend/src/components/WorkListItem/WorkListItem.tsx ===
import React from 'react';
import './WorkListItem.css';
import { FaEllipsisV } from 'react-icons/fa';

interface Novel { 
    novel_id: number; 
    title: string; 
    status: string; 
    view_count: number; 
    chapter_count: number; 
    cover_image_url: string | null; 
}
interface WorkListItemProps { 
    novel: Novel; 
}

const WorkListItem: React.FC<WorkListItemProps> = ({ novel }) => {
    const displayStatus = (status: string) => { 
        return status === 'draft' ? 'แบบร่าง' : 'เผยแพร่แล้ว'; 
    };

    return (
        <div className="work-list-item">
            <div className="work-cover">
                {novel.cover_image_url ? <img src={novel.cover_image_url} alt={novel.title} /> : <div className="no-cover">NO COVER</div>}
            </div>
            <div className="work-title-desc">
                <div className="work-title">{novel.title}</div>
                <div className="work-category">นิยาย</div> {/* Placeholder */}
            </div>
            <div className="work-views">{novel.view_count.toLocaleString()}</div>
            <div className="work-chapters">{novel.chapter_count}</div>
            <div className={`work-status-text status--${novel.status}`}>{displayStatus(novel.status)}</div>
            <div className="work-completion-status">ยังไม่จบ</div> {/* Placeholder */}
            <div className="work-actions">
                <button className="more-options-btn"><FaEllipsisV /></button>
            </div>
        </div>
    );
};

export default WorkListItem;