// 1. DATA - Set IDs and PDF Paths
const articles = [
    { id: "ed-01", date: "Jan 17, 2026", title: "Vlaamse Wiskunde Olympiade", file: "articles/jwo1_2023.pdf" }
];

let activeId = articles[0].id;

// 2. Toggle Sidebar Forum
function toggleComments() {
    document.getElementById('comment-sidebar').classList.toggle('sidebar-hidden');
}

// 3. Load Article & Specific Forum
function loadArticle(index) {
    const art = articles[index];
    activeId = art.id;
    
    // The "#view=FitH" tells the PDF to fit to the width, allowing continuous vertical scroll
    document.getElementById('pdf-viewer').src = art.file + "#view=FitH&toolbar=0&navpanes=0";
    document.getElementById('active-title').innerText = art.title;
    
    loadCommentsForArticle();
}

async function loadCommentsForArticle() {
    try {
        const res = await fetch('comments.json');
        const data = await res.json();
        const filtered = data.filter(c => c.articleId === activeId);
        
        const area = document.getElementById('comment-display-area');
        area.innerHTML = filtered.map(c => `
            <div class="comment">
                <small><b>GUEST</b> — ${c.date}</small>
                <p>${c.text}</p>
            </div>
        `).join('') || "<p>No comments for this edition.</p>";
    } catch (e) { console.error("JSON fetch failed."); }
}

// 4. Initialize Site
const list = document.getElementById('article-list');
articles.forEach((art, i) => {
    let li = document.createElement('li');
    li.innerHTML = `<button onclick="loadArticle(${i})"><strong>${art.date}</strong><br>${art.title}</button>`;
    list.appendChild(li);
});

document.getElementById('comment-form').onsubmit = (e) => {
    e.preventDefault();
    alert("Comment submitted for " + activeId + ". This triggers your GitHub Action.");
    e.target.reset();
};

window.onload = () => {
    loadArticle(0);
    document.getElementById('date-label').innerText = new Date().toDateString();
};
