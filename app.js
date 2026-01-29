const API_URL = "https://api.mangadex.org";
const viewer = document.getElementById('viewer');
const libraryView = document.getElementById('library-view');
const onlineResults = document.getElementById('online-results');

// --- SISTEMA DE TIMER (DEBOUNCE) ---
// Evita que o app faça buscas a cada letra digitada, esperando o usuário parar de digitar.
let debounceTimer;

function searchMangaDebounced(query) {
    if (!query || query.trim().length === 0) {
        onlineResults.innerHTML = '';
        return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        if (query.trim().length >= 3) {
            searchManga(query);
        }
    }, 500); // Aguarda 500ms (meio segundo)
}

// --- LAZY LOADING (CARREGAMENTO INTELIGENTE) ---
// Carrega as imagens apenas quando elas aparecem no ecrã para poupar dados.
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

// --- BUSCA NA API DO MANGADEX ---
async function searchManga(query) {
    onlineResults.innerHTML = "<p style='color: white; text-align: center;'>A procurar mangás...</p>";
    try {
        const res = await fetch(`${API_URL}/manga?title=${query}&limit=15&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive`);
        
        if (!res.ok) throw new Error("Erro na rede");
        
        const data = await res.json();
        onlineResults.innerHTML = "";
        
        if (!data.data || data.data.length === 0) {
            onlineResults.innerHTML = "<p style='color: white; text-align: center;'>Nenhum mangá encontrado.</p>";
            return;
        }

        data.data.forEach(manga => {
            const id = manga.id;
            const title = manga.attributes.title.en || manga.attributes.title.ja || "Título Indisponível";
            const coverRelationship = manga.relationships.find(r => r.type === 'cover_art');
            const cover = coverRelationship?.attributes?.fileName;
            
            const card = document.createElement('div');
            card.className = 'manga-card';
            card.onclick = () => showChapters(id, title);
            
            const coverUrl = cover 
                ? `https://uploads.mangadex.org/covers/${id}/${cover}.256.jpg`
                : 'https://via.placeholder.com/256x360?text=Sem+Capa';

            card.innerHTML = `
                <img src="${coverUrl}" alt="${title}">
                <p>${title}</p>
            `;
            onlineResults.appendChild(card);
        });
    } catch (e) { 
        console.error("Erro na busca:", e);
        onlineResults.innerHTML = "<p style='color: #ff4444; text-align: center;'>Erro ao ligar à API. Tente novamente.</p>"; 
    }
}

// --- LISTAGEM DE CAPÍTULOS ---
async function showChapters(id, title) {
    onlineResults.innerHTML = `<h3 style='color: white; padding: 10px;'>${title}</h3><p style='color: white; padding: 10px;'>A carregar capítulos...</p>`;
    try {
        // Busca capítulos em Português ou Inglês
        const res = await fetch(`${API_URL}/manga/${id}/feed?translatedLanguage[]=pt-br&translatedLanguage[]=en&limit=100&order[chapter]=desc`);
        const data = await res.json();
        
        onlineResults.innerHTML = `<h3 style='color: white; padding: 10px;'>${title}</h3>`;
        
        if (data.data.length === 0) {
            onlineResults.innerHTML += "<p style='color: white; padding: 10px;'>Nenhum capítulo disponível nestes idiomas.</p>";
            return;
        }

        data.data.forEach(ch => {
            const item = document.createElement('div');
            item.className = 'manga-item';
            const chNum = ch.attributes.chapter || 'Extra';
            const chTitle = ch.attributes.title ? ` - ${ch.attributes.title}` : "";
            
            item.innerHTML = `<span>Capítulo ${chNum}${chTitle}</span> ➔`;
            item.onclick = () => loadOnlineChapter(ch.id);
            onlineResults.appendChild(item);
        });
    } catch (e) {
        onlineResults.innerHTML = "<p style='color: #ff4444; padding: 10px;'>Erro ao carregar capítulos.</p>";
    }
}

// --- CARREGAR IMAGENS DO CAPÍTULO ---
async function loadOnlineChapter(chId) {
    viewer.innerHTML = "<p style='color: white; text-align: center; padding-top: 50px;'>A preparar páginas...</p>";
    try {
        const res = await fetch(`${API_URL}/at-home/server/${chId}`);
        const data = await res.json();
        const host = data.baseUrl;
        const hash = data.chapter.hash;
        const files = data.chapter.data; // Usamos 'data' para alta qualidade ou 'data-saver' para poupar dados

        const urls = files.map(f => `${host}/data/${hash}/${f}`);
        renderImages(urls);
    } catch (e) {
        alert("Erro ao carregar as imagens do capítulo.");
    }
}

// --- RENDERIZAR NO LEITOR ---
function renderImages(urls) {
    onlineResults.style.display = 'none';
    libraryView.style.display = 'none';
    viewer.style.display = 'block';
    viewer.innerHTML = ''; // Limpa o carregando

    urls.forEach(url => {
        const img = document.createElement('img');
        img.dataset.src = url;
        // Placeholder transparente enquanto não carrega
        img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
        viewer.appendChild(img);
        imageObserver.observe(img);
    });

    window.scrollTo(0, 0);
}

// --- FUNÇÕES DE NAVEGAÇÃO E TEMA ---
function showLibrary() {
    viewer.style.display = 'none';
    viewer.innerHTML = '';
    onlineResults.style.display = 'block';
    libraryView.style.display = 'block';
    window.scrollTo(0, 0);
}

function toggleNightMode() {
    document.body.classList.toggle('night-mode');
    const btn = document.getElementById('theme-btn');
    btn.innerText = document.body.classList.contains('night-mode') ? '☀️' : '🌙';
}

function toggleReadMode() {
    viewer.classList.toggle('classic-mode');
    const btn = document.getElementById('read-mode-btn');
    btn.innerText = viewer.classList.contains('classic-mode') ? '📖' : '📱';
}

// Controle de Zoom
document.getElementById('zoom-slider').oninput = (e) => {
    const value = e.target.value;
    viewer.style.width = (value * 100) + "%";
    viewer.style.margin = "0 auto";
};
