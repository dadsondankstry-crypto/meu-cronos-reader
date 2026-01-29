const API_URL = "https://api.mangadex.org";
const viewer = document.getElementById('viewer');
const onlineResults = document.getElementById('online-results');
const libraryView = document.getElementById('library-view');

// --- TIMER DE BUSCA (DEBOUNCE) ---
let debounceTimer;
function searchMangaDebounced(query) {
    clearTimeout(debounceTimer);
    if (!query || query.trim().length < 3) {
        onlineResults.innerHTML = "";
        return;
    }
    debounceTimer = setTimeout(() => searchManga(query), 500);
}

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

// BUSCA API "BLINDADA"
async function searchManga(query) {
    onlineResults.innerHTML = "<p style='color:white; text-align:center;'>Buscando...</p>";
    try {
        const res = await fetch(`${API_URL}/manga?title=${query}&limit=15&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        
        onlineResults.innerHTML = "";
        if (!data.data || data.data.length === 0) {
            onlineResults.innerHTML = "<p style='color:white; text-align:center;'>Nada encontrado.</p>";
            return;
        }

        data.data.forEach(manga => {
            const id = manga.id;
            const title = manga.attributes.title.en || manga.attributes.title.ja || Object.values(manga.attributes.title)[0] || "Sem título";
            const coverRel = manga.relationships.find(r => r.type === 'cover_art');
            const cover = coverRel?.attributes?.fileName;
            
            const card = document.createElement('div');
            card.className = 'manga-card';
            card.onclick = () => showChapters(id, title);
            
            const coverUrl = cover ? `https://uploads.mangadex.org/covers/${id}/${cover}.256.jpg` : 'https://via.placeholder.com/256';
            card.innerHTML = `<img src="${coverUrl}"><p>${title}</p>`;
            onlineResults.appendChild(card);
        });
    } catch (e) {
        onlineResults.innerHTML = "<p style='color:#ff4444; text-align:center;'>Erro ao ligar à API. Tente novamente.</p>";
    }
}

async function showChapters(id, title) {
    onlineResults.innerHTML = `<h3 style='color:white;'>${title}</h3><p style='color:white;'>Carregando capítulos...</p>`;
    try {
        const res = await fetch(`${API_URL}/manga/${id}/feed?translatedLanguage[]=pt-br&translatedLanguage[]=en&order[chapter]=desc&limit=50`);
        const data = await res.json();
        onlineResults.innerHTML = `<h3 style='color:white; padding:10px;'>${title}</h3>`;
        data.data.forEach(ch => {
            const item = document.createElement('div');
            item.className = 'manga-item';
            item.innerHTML = `<span>Capítulo ${ch.attributes.chapter || '?'}</span> ➔`;
            item.onclick = () => loadOnlineChapter(ch.id);
            onlineResults.appendChild(item);
        });
    } catch (e) { onlineResults.innerHTML = "Erro nos capítulos."; }
}

async function loadOnlineChapter(chId) {
    const res = await fetch(`${API_URL}/at-home/server/${chId}`);
    const data = await res.json();
    const urls = data.chapter.data.map(f => `${data.baseUrl}/data/${data.chapter.hash}/${f}`);
    renderImages(urls);
}

function renderImages(urls) {
    onlineResults.style.display = 'none';
    viewer.style.display = 'block';
    viewer.innerHTML = '';
    urls.forEach(url => {
        const img = document.createElement('img');
        img.dataset.src = url;
        img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
        viewer.appendChild(img);
        imageObserver.observe(img);
    });
    window.scrollTo(0,0);
}

function showLibrary() { viewer.style.display = 'none'; onlineResults.style.display = 'block'; window.scrollTo(0,0); }
function toggleNightMode() { document.body.classList.toggle('night-mode'); }
function toggleReadMode() { 
    viewer.classList.toggle('classic-mode'); 
    document.getElementById('read-mode-btn').innerText = viewer.classList.contains('classic-mode') ? '📖' : '📱';
}
document.getElementById('zoom-slider').oninput = (e) => { viewer.style.width = (e.target.value * 100) + "%"; };