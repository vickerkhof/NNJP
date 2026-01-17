const articles = [
    { date: "Jan 17, 2026", title: "The Future of Digital Sovereignty", file: "articles/jwo1_2023.pdf" }
];

document.getElementById('current-date-display').innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const listEl = document.getElementById('article-list');
const viewer = document.getElementById('pdf-viewer');
const titleEl = document.getElementById('active-title');

function loadArticle(index) {
    const art = articles[index];
    viewer.src = art.file;
    titleEl.innerText = art.title;
}

articles.forEach((art, index) => {
    let btn = document.createElement('button');
    btn.innerHTML = `<strong>${art.date}</strong><br><small>${art.title}</small>`;
    btn.onclick = () => loadArticle(index);
    listEl.appendChild(btn);
});

// Load comments from your JSON file
async function loadComments() {
    try {
        const res = await fetch('comments.json');
        const data = await res.json();
        const box = document.getElementById('comment-box');
        box.innerHTML = data.map(c => `
            <div class="comment">
                <b>ANONYMOUS GUEST — ${c.date}</b>
                <p>${c.text}</p>
            </div>
        `).join('');
    } catch (e) {
        document.getElementById('comment-box').innerText = "No comments yet.";
    }
}

// Initial Load
window.onload = () => {
    if(articles.length > 0) loadArticle(0);
    loadComments();
};
