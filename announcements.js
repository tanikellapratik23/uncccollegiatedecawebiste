// Announcements data and functionality
function getAnnouncements() {
    const stored = localStorage.getItem('announcements');
    if (stored) {
        return JSON.parse(stored);
    }
    // Default first announcement
    return [{
        id: 'ann_1',
        date: '2026-02-05',
        title: 'Funding Update',
        content: 'We heard back from the Belk College of Business about funding! As far as 22 students will have 3 nights fully covered in terms of housing at the competition. We are communicating with the SGA budget about covering registration dues ($150 per head). Most likely it will be reduced through funding to $41 per head as that is the funding limit, but we will keep you updated!',
        author: 'Leadership Team',
        comments: []
    }];
}

function saveAnnouncements(announcements) {
    localStorage.setItem('announcements', JSON.stringify(announcements));
}

function addComment(announcementId, fullName, comment) {
    const announcements = getAnnouncements();
    const announcement = announcements.find(a => a.id === announcementId);
    if (announcement) {
        announcement.comments.push({
            id: 'cmt_' + Date.now(),
            fullName: fullName,
            comment: comment,
            timestamp: new Date().toISOString()
        });
        saveAnnouncements(announcements);
        return true;
    }
    return false;
}

function addAnnouncement(title, content, author) {
    const announcements = getAnnouncements();
    announcements.unshift({
        id: 'ann_' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        title: title,
        content: content,
        author: author,
        comments: []
    });
    saveAnnouncements(announcements);
}

function renderAnnouncements() {
    const container = document.getElementById('announcementsContainer');
    if (!container) return;

    const announcements = getAnnouncements();
    container.innerHTML = '';

    announcements.forEach(announcement => {
        const announcementEl = document.createElement('div');
        announcementEl.className = 'announcement-card';
        announcementEl.innerHTML = `
            <div class="announcement-header">
                <div class="announcement-pin">📌</div>
                <div class="announcement-meta">
                    <div class="announcement-date">${new Date(announcement.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    <div class="announcement-author">Posted by ${escapeHtml(announcement.author)}</div>
                </div>
            </div>
            <h3 class="announcement-title">${escapeHtml(announcement.title)}</h3>
            <div class="announcement-content">${escapeHtml(announcement.content)}</div>
            
            <div class="comments-section">
                <div class="comments-header">💬 Comments (${announcement.comments.length})</div>
                <div class="comments-list" id="comments-${announcement.id}">
                    ${announcement.comments.map(c => `
                        <div class="comment">
                            <div class="comment-author">${escapeHtml(c.fullName)}</div>
                            <div class="comment-text">${escapeHtml(c.comment)}</div>
                            <div class="comment-time">${new Date(c.timestamp).toLocaleString()}</div>
                        </div>
                    `).join('')}
                </div>
                
                <form class="comment-form" onsubmit="submitComment(event, '${announcement.id}')">
                    <input type="text" placeholder="Your Full Name" required class="comment-input-name" id="name-${announcement.id}">
                    <textarea placeholder="Add a comment..." required class="comment-input-text" id="comment-${announcement.id}"></textarea>
                    <button type="submit" class="comment-btn">Post Comment</button>
                </form>
            </div>
        `;
        container.appendChild(announcementEl);
    });
}

function submitComment(event, announcementId) {
    event.preventDefault();
    const fullName = document.getElementById(`name-${announcementId}`).value.trim();
    const comment = document.getElementById(`comment-${announcementId}`).value.trim();
    
    if (fullName && comment) {
        addComment(announcementId, fullName, comment);
        renderAnnouncements();
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize when DOM loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAnnouncements);
} else {
    renderAnnouncements();
}
