const API_URL = "https://api.mangadex.org";
const viewer = document.getElementById('viewer');
const libraryView = document.getElementById('library-view');
const onlineResults = document.getElementById('online-results');
let library = JSON.parse(localStorage.getItem('manga_library')) || [];

// LAZY LOADING
const imageObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.add('fade-in');
            obs.unobserve(img);
        }
    });
}, { rootMargin: '500px' });

// BUSCA API
async function searchManga(query) {
    onlineResults.innerHTML = "Buscando...";
    try {
        const res = await fetch(`${API_URL}/manga?title=${query}&limit=10&includes[]=cover_art`);
        const data = await res.json();
        onlineResults.innerHTML = "";
        data.data.forEach(manga => {
            const id = manga.id;
            const title = manga.attributes.title.en || manga.attributes.title.ja;
            const cover = manga.relationships.find(r => r.type === 'cover_art')?.attributes?.fileName;
            const card = document.createElement('div');
            card.className = 'manga-card';
            card.onclick = () => showChapters(id, title);
            card.innerHTML = `<img src="https://uploads.mangadex.org/covers/${id}/${cover}.256.jpg"><p>${title}</p>`;
            onlineResults.appendChild(card);
        });
    } catch (e) { onlineResults.innerHTML = "Erro na busca."; }
}

async function showChapters(id, title) {
    onlineResults.innerHTML = `<h3>${title}</h3><p>Carregando capítulos...</p>`;
    const res = await fetch(`${API_URL}/manga/${id}/feed?translatedLanguage[]=pt-br&translatedLanguage[]=en&limit=50&order[chapter]=desc`);
    const data = await res.json();
    onlineResults.innerHTML = `<h3>${title}</h3>`;
    data.data.forEach(ch => {
        const item = document.createElement('div');
        item.className = 'manga-item';
        item.innerHTML = `<span>Cap. ${ch.attributes.chapter}</span> ➔`;
        item.onclick = () => loadOnlineChapter(ch.id);
        onlineResults.appendChild(item);
    });
}

async function loadOnlineChapter(chId) {
    const res = await fetch(`${API_URL}/at-home/server/${chId}`);
    const data = await res.json();
    const urls = data.chapter.data.map(f => `${data.baseUrl}/data/${data.chapter.hash}/${f}`);
    renderImages(urls);
}

function renderImages(urls) {
    onlineResults.style.display = 'none';
    libraryView.style.display = 'none';
    viewer.style.display = 'block';
    viewer.innerHTML = '';
    urls.forEach(url => {
        const img = document.createElement('img');
        img.dataset.src = url;
        img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
        viewer.appendChild(img);
        imageObserver.observe(img);
    });
}

function showLibrary() {
    viewer.style.display = 'none';
    onlineResults.style.display = 'block';
    libraryView.style.display = 'block';
}

function toggleNightMode() {
    document.body.classList.toggle('night-mode');
}

function toggleReadMode() {
    viewer.classList.toggle('classic-mode');
    document.getElementById('read-mode-btn').innerText = viewer.classList.contains('classic-mode') ? '📖' : '📱';
}

document.getElementById('zoom-slider').oninput = (e) => {
    viewer.style.width = (e.target.value * 100) + "%";
};