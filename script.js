// 1. PDF.js Setup (Crucial for rendering)
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null;

const scale = 1.5; 
const canvas = document.getElementById('pdf-canvas');
const ctx = canvas.getContext('2d');

// 2. Rendering Engine
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

        // Update the UI page counters
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

// 3. Loading Logic: This pulls from your /articles/ folder
function loadEdition(fileName) {
    const filePath = `articles/${fileName}`; 
    
    // Update title to look clean (remove .pdf and dashes)
    const cleanTitle = fileName.replace('.pdf', '').replace(/-/g, ' ');
    document.getElementById('active-title').textContent = cleanTitle;

    pdfjsLib.getDocument(filePath).promise.then(pdfDoc_ => {
        pdfDoc = pdfDoc_;
        document.getElementById('page-count').textContent = pdfDoc.numPages;
        pageNum = 1;
        renderPage(pageNum);
    }).catch(err => {
        console.error("PDF Load Error:", err);
        alert(`Could not load ${fileName}. Check if it exists in the articles folder.`);
    });
}

// 4. Manual List of your PDFs
// Ensure these match your filenames in the 'articles' folder exactly.
const editions = [
    "NNJP.pdf" 
];

function initializeSidebar() {
    const articleList = document.getElementById('article-list');
    articleList.innerHTML = ''; 

    editions.forEach(file => {
        const btn = document.createElement('button');
        btn.textContent = file.replace('.pdf', '').replace(/-/g, ' ');
        btn.className = "edition-btn";
        btn.onclick = () => loadEdition(file);
        articleList.appendChild(btn);
    });

    // Automatically load the first PDF in the list
    if (editions.length > 0) {
        loadEdition(editions[0]);
    }
}

// 5. Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    initializeSidebar();
    
    // Set Header Date
    document.getElementById('current-date-display').textContent = new Date().toLocaleDateString('en-GB', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
});

// 6. Navigation Events (Left/Right "Page Turns")
document.getElementById('prev-page').addEventListener('click', () => {
    if (pdfDoc && pageNum > 1) {
        pageNum--;
        queueRenderPage(pageNum);
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    if (pdfDoc && pageNum < pdfDoc.numPages) {
        pageNum++;
        queueRenderPage(pageNum);
    }
});
