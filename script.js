// 1. DATA - Set IDs and PDF Paths
const articles = [
    { id: "ed-01", date: "Jan 17, 2026", title: "Vlaamse Wiskunde Olympiade", file: "articles/jwo1_2023.pdf" }
];

let currentId = articles[0].id;

function toggleForum() {
    document.getElementById('forum-sidebar').classList.toggle('forum-hidden');
}

function loadArticle(index) {
    const art = articles[index];
    currentId = art.id;
    
    // Update Header and PDF
    document.getElementById('active-title').innerText = art.title;
    const frame = document.getElementById('pdf-frame');
    
    // 1. Force PDF to Fit Width
    // 2. Set height to (Pages * standard A4 height) to remove internal scroll
    frame.src = art.file + "#view=FitH&toolbar=0&navpanes=0";
    frame.style.height = (art.pages * 1140) + "px"; 
    
    window.scrollTo(0, 0); // Scroll main page to top
    loadComments();
}

async function loadComments() {
    try {
        const res = await fetch('comments.json');
        const data = await res.json();
        
        // Filter: only show comments belonging to this article ID
        const filtered = data.filter(c => c.articleId === currentId);
        
        const stream = document.getElementById('comment-stream');
        stream.innerHTML = filtered.map(c => `
            <div class="comment">
                <b>ANONYMOUS — ${c.timestamp}</b>
                <p>${c.text}</p>
            </div>
        `).join('') || "<p>No discussion yet for this edition.</p>";
    } catch (e) { console.error("Could not load comments."); }
}

// Sidebar List Generation
const list = document.getElementById('article-list');
articles.forEach((art, i) => {
    let li = document.createElement('li');
    li.innerHTML = `<button onclick="loadArticle(${i})"><strong>${art.date}</strong><br>${art.title}</button>`;
    list.appendChild(li);
});

// Initialization
window.onload = () => {
    loadArticle(0);
    document.getElementById('header-date').innerText = new Date().toDateString();
};

// Form Post Simulation (Connect to your Back-end / GitHub Action)
document.getElementById('comment-form').onsubmit = (e) => {
    e.preventDefault();
    alert(`Submitting comment to thread: ${currentId}`);
    e.target.reset();
};
