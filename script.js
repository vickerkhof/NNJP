// 1. PDF.js Setup
const pdfjsLib = window['pdfjs-dist/build/pdf'];
// This link is vital; without the worker, the PDF won't render
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null;

const scale = 1.5, 
    canvas = document.getElementById('pdf-canvas'),
    ctx = canvas.getContext('2d');

// 2. The Rendering Engine
const renderPage = num => {
    pageIsRendering = true;
    pdfDoc.getPage(num).then(page => {
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderCtx = { canvasContext: ctx, viewport: viewport };

        page.render(renderCtx).promise.then(() => {
            pageIsRendering = false;
            if (pageNumIsPending !== null) {
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        });

        // Update UI
        document.getElementById('page-num').textContent = num;
        document.getElementById('prev-page').disabled = (num <= 1);
        document.getElementById('next-page').disabled = (num >= pdfDoc.numPages);
    });
};

const queueRenderPage = num => {
    if (pageIsRendering) {
        pageNumIsPending = num;
    } else {
        renderPage(num);
    }
};

// 3. The Loading Logic (Connecting to your /articles/ folder)
function loadEdition(fileName) {
    const filePath = `articles/${fileName}`; // Pointing to your repo folder
    
    pdfjsLib.getDocument(filePath).promise.then(pdfDoc_ => {
        pdfDoc = pdfDoc_;
        document.getElementById('page-count').textContent = pdfDoc.numPages;
        document.getElementById('active-title').textContent = fileName.replace('.pdf', '').replace(/-/g, ' ');
        
        pageNum = 1;
        renderPage(pageNum);
    }).catch(err => {
        console.error("Error loading PDF:", err);
        alert("The PDF file could not be found in the articles folder.");
    });
}

// 4. Navigation Events
document.getElementById('prev-page').addEventListener('click', () => {
    if (pageNum <= 1) return;
    pageNum--;
    queueRenderPage(pageNum);
});

document.getElementById('next-page').addEventListener('click', () => {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    queueRenderPage(pageNum);
});

// 5. Automatic Sidebar Setup
// REPLACE THESE STRINGS with the actual filenames in your /articles folder
const editions = [
    "edition-01.pdf",
    "edition-02.pdf"
];

const articleList = document.getElementById('article-list');

editions.forEach(file => {
    const btn = document.createElement('button');
    btn.textContent = file.replace('.pdf', '').replace(/-/g, ' ');
    btn.onclick = () => loadEdition(file);
    articleList.appendChild(btn);
});

// Load the first edition by default on startup
if (editions.length > 0) {
    loadEdition(editions[0]);
}

// 6. Date Display
document.getElementById('current-date-display').textContent = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});
