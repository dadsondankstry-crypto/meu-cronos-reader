const API_URL = "https://api.mangadex.org";
const viewer = document.getElementById('viewer');
const onlineResults = document.getElementById('online-results');

// TIMER PARA NÃO TRAVAR A API (DEBOUNCE)
let debounceTimer;
function searchMangaDebounced(query) {
    clearTimeout(debounceTimer);
    if (!query) { onlineResults.innerHTML = ""; return; }
    
    debounceTimer = setTimeout(() => {
        if (query.length >= 3) searchManga(query);
    }, 500);
}

// BUSCA MELHORADA
async function searchManga(query) {
    onlineResults.innerHTML = "<p style='color:white;'>Buscando...</p>";
    try {
        // Adicionamos filtros para a API aceitar melhor a conexão
        const res = await fetch(`${API_URL}/manga?title=${query}&limit=10&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive`);
        const data = await res.json();
        
        onlineResults.innerHTML = "";
        if (data.data.length === 0) {
            onlineResults.innerHTML = "<p style='color:white;'>Nenhum mangá encontrado.</p>";
            return;
        }

        data.data.forEach(manga => {
            const id = manga.id;
            const title = manga.attributes.title.en || manga.attributes.title.ja || "Sem título";
            const coverFile = manga.relationships.find(r => r.type === 'cover_art')?.attributes?.fileName;
            
            const card = document.createElement('div');
            card.className = 'manga-card';
            card.onclick = () => showChapters(id, title);
            
            const coverUrl = coverFile 
                ? `https://uploads.mangadex.org/covers/${id}/${coverFile}.256.jpg`
                : 'https://via.placeholder.com/256x360';

            card.innerHTML = `<img src="${coverUrl}"><p>${title}</p>`;
            onlineResults.appendChild(card);
        });
    } catch (e) {
        onlineResults.innerHTML = "<p style='color:red;'>Erro de conexão. Tente novamente.</p>";
    }
}

// LISTA DE CAPÍTULOS
async function showChapters(id, title) {
    onlineResults.innerHTML = `<h3 style='color:white;'>${title}</h3><p style='color:white;'>Carregando capítulos...</p>`;
    try {
        const res = await fetch(`${API_URL}/manga/${id}/feed?translatedLanguage[]=pt-br&translatedLanguage[]=en&order[chapter]=desc`);
        const data = await res.json();
        onlineResults.innerHTML = `<h3 style='color:white;'>${title}</h3>`;
        
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

async function loadOnlineChapter(chId) {
    const res = await fetch(`${API_URL}/at-home/server/${chId}`);
    const data = await res.json();
    const host = data.baseUrl;
    const hash = data.chapter.hash;
    const urls = data.chapter.data.map(f => `${host}/data/${hash}/${f}`);
    renderImages(urls);
}

function renderImages(urls) {
    onlineResults.style.display = 'none';
    viewer.style.display = 'block';
    viewer.innerHTML = '';
    urls.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        viewer.appendChild(img);
    });
    window.scrollTo(0,0);
}

function showLibrary() {
    viewer.style.display = 'none';
    onlineResults.style.display = 'block';
}

function toggleNightMode() { document.body.classList.toggle('night-mode'); }
function toggleReadMode() { viewer.classList.toggle('classic-mode'); }
