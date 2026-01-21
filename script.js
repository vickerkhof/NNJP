const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null;

const canvas = document.getElementById('pdf-viewer'),
    ctx = canvas.getContext('2d');

// Load PDF function for multiple articles
function loadPDF(fileName) {
    const url = `articles/${fileName}`;
    document.getElementById('active-title').textContent = fileName.replace('.pdf', '').replace(/_/g, ' ');

    pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
        pdfDoc = pdfDoc_;
        document.getElementById('page-count').textContent = pdfDoc.numPages;
        pageNum = 1;
        renderPage(pageNum);
    }).catch(err => {
        console.error("Error loading PDF: ", err);
    });
}

const renderPage = num => {
    pageIsRendering = true;
    pdfDoc.getPage(num).then(page => {
        const viewport = page.getViewport({ scale: 1.5 });
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
        document.getElementById('page-num').textContent = num;
    });
};

const queueRenderPage = num => {
    if (pageIsRendering) { pageNumIsPending = num; } else { renderPage(num); }
};

// Controls
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

// Initial Load
window.addEventListener('load', () => {
    loadPDF('jwo1_2023.pdf');
    document.getElementById('current-date-display').textContent = new Date().toLocaleDateString('en-GB', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
});
