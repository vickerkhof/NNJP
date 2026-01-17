// 1. YOUR DATA - Every article needs a unique ID
const articles = [
    { 
        id: "jan-17-26", 
        date: "Jan 17, 2026", 
        title: "The Shift in Global Energy", 
        file: "articles/energy_report.pdf" 
    },
    { 
        id: "jan-14-26", 
        date: "Jan 14, 2026", 
        title: "Advancements in Robotics", 
        file: "articles/robotics_news.pdf" 
    }
];

let activeArticleId = articles[0].id;
const viewer = document.getElementById('pdf-viewer');
const titleEl = document.getElementById('active-title');
const commentBox = document.getElementById('comment-box');

// 2. Load the Article and its specific comments
function loadArticle(index) {
    const art = articles[index];
    activeArticleId = art.id; // Update the current "Room"
    viewer.src = art.file + "#toolbar=0&navpanes=0&scrollbar=0"; // Cleaner look
    titleEl.innerText = art.title;
    
    // Smooth scroll back to top of article
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    loadComments(); 
}

// 3. Filter comments by activeArticleId
async function loadComments() {
    try {
        const res = await fetch('comments.json');
        const allComments = await res.json();
        
        // Filter: only show comments belonging to the current article
        const filtered = allComments.filter(c => c.articleId === activeArticleId);
        
        commentBox.innerHTML = filtered.length ? filtered.map(c => `
            <div class="comment">
                <small>ANONYMOUS • ${c.timestamp}</small>
                <p>${c.text}</p>
            </div>
        `).join('') : "<p>No discussion yet for this edition. Be the first to comment.</p>";
    } catch (e) {
        commentBox.innerText = "Error loading discussion.";
    }
}

// 4. Navigation Setup
const listEl = document.getElementById('article-list');
articles.forEach((art, index) => {
    let btn = document.createElement('button');
    btn.innerHTML = `<strong>${art.date}</strong><br><small>${art.title}</small>`;
    btn.onclick = () => loadArticle(index);
    listEl.appendChild(btn);
});

// 5. Submit Comment with Article ID
document.getElementById('comment-form').onsubmit = async (e) => {
    e.preventDefault();
    const text = document.getElementById('user-msg').value;
    
    // In your GitHub Action, ensure you save the 'articleId' 
    // so we know which article the comment belongs to.
    console.log("Submitting to article:", activeArticleId);
    
    alert("Comment sent to " + activeArticleId + ". It will appear shortly.");
    e.target.reset();
};

window.onload = () => { if(articles.length > 0) loadArticle(0); };
