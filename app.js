const API_URL = "https://api.mangadex.org";
const viewer = document.getElementById('viewer');
const libraryView = document.getElementById('library-view');
const onlineResults = document.getElementById('online-results');

// --- SISTEMA DE TIMER (DEBOUNCE) ---
let debounceTimer;

function searchMangaDebounced(query) {
    if (!query || query.trim().length === 0) {
        onlineResults.innerHTML = '';
        return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        // Só busca se tiver 3 ou mais letras para não travar a API
        if (query.trim().length >= 3) {
            searchManga(query);
        }
    }, 500); 
}

// LAZY LOADING - Carrega imagens conforme o scroll
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

// BUSCA API MANGADEX
async function searchManga(query) {
    onlineResults.innerHTML = "<p style='color: white; text-align: center;'>Buscando...</p>";
    try {
        const res = await fetch(`${API_URL}/manga?title=${query}&limit=15&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive`);
        const data = await res.json();
        onlineResults.innerHTML = "";
        
        if (!data.data || data.data.length === 0) {
            onlineResults.innerHTML = "<p style='color: white; text-align: center;'>Nenhum mangá encontrado.</p>";
            return;
        }

        data.data.forEach(manga => {
            const id = manga.id;
            const title = manga.attributes.title.en || manga.attributes.title.ja || "Sem título";
            const coverRel = manga.relationships.find(r => r.type === 'cover_art');
            const cover = coverRel?.attributes?.fileName;
            
            const card = document.createElement('div');
            card.className = 'manga-card';
            card.onclick = () => showChapters(id, title);
            
            const coverUrl = cover 
                ? `https://uploads.mangadex.org/covers/${id}/${cover}.256.jpg`
                : 'https://via.placeholder.com/256x360?text=Sem+Capa';

            card.innerHTML = `<img src="${coverUrl}"><p>${title}</p>`;
            onlineResults.appendChild(card);
        });
    } catch (e) { 
        console.error(e);
        onlineResults.innerHTML = "<p style='color: #ff4444; text-align: center;'>Erro na conexão. Verifique sua internet.</p>"; 
    }
}

// LISTAR CAPÍTULOS
async function showChapters(id, title) {
    onlineResults.innerHTML = `<h3 style='color:white; padding:10px;'>${title}</h3><p style='color:white; padding:10px;'>Carregando capítulos...</p>`;
    try {
        const res = await fetch(`${API_URL}/manga/${id}/feed?translatedLanguage[]=pt-br&translatedLanguage[]=en&limit=100&order[chapter]=desc`);
        const data = await res.json();
        onlineResults.innerHTML = `<h3 style='color:white; padding:10px;'>${title}</h3>`;
        
        data.data.forEach(ch => {
            const item = document.createElement('div');
            item.className = 'manga-item';
            item.innerHTML = `<span>Capítulo ${ch.attributes.chapter || '?'}</span> ➔`;
            item.onclick = () => loadOnlineChapter(ch.id);
            onlineResults.appendChild(item);
        });
    } catch (e) {
        onlineResults.innerHTML = "<p style='color:red;'>Erro ao carregar capítulos.</p>";
    }
}

// CARREGAR PÁGINAS
async function loadOnlineChapter(chId) {
    viewer.innerHTML = "<p style='color:white; text-align:center; padding-top:50px;'>Carregando páginas...</p>";
    try {
        const res = await fetch(`${API_URL}/at-home/server/${chId}`);
        const data = await res.json();
        const host = data.baseUrl;
        const hash = data.chapter.hash;
        const urls = data.chapter.data.map(f => `${host}/data/${hash}/${f}`);
        renderImages(urls);
    } catch (e) {
        alert("Erro ao abrir capítulo.");
    }
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
    window.scrollTo(0, 0);
}

function showLibrary() {
    viewer.style.display = 'none';
    onlineResults.style.display = 'block';
    window.scrollTo(0, 0);
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
