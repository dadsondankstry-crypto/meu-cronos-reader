# 📕 Cronos Manga Reader

O **Cronos** é um leitor de mangás e webtoons moderno, desenvolvido como um Progressive Web App (PWA). Ele permite a leitura de arquivos locais e a integração direta com a API do MangaDex para acesso a milhares de títulos online.

> **Status do Projeto:** 🚀 Finalizado & Funcional

---

## 📱 Funcionalidades Principais

* **Híbrido:** Leia arquivos `.zip` ou pastas de imagens do seu dispositivo ou busque títulos online.
* **Modo Webtoon & Clássico:** Alterne entre leitura vertical contínua ou página por página.
* **Sistema de Favoritos:** Salve seus mangás preferidos na biblioteca local usando `LocalStorage`.
* **Download Offline:** Baixe capítulos inteiros como arquivos `.zip` usando a biblioteca `JSZip`.
* **Ergonomia Mobile:** Controles flutuantes ajustáveis para uso com uma mão (Modo Canhoto/Destro).
* **Modo Noturno Avançado:** Filtros de brilho e contraste nas imagens para leitura confortável no escuro.
* **Performance:** Carregamento inteligente de imagens com `Intersection Observer` (Lazy Loading).

## 🛠️ Tecnologias Utilizadas

* **HTML5 / CSS3:** Estrutura e estilização com variáveis CSS para temas.
* **JavaScript (ES6+):** Lógica de manipulação de DOM e integração com APIs.
* **MangaDex API:** Consumo de dados reais de mangás e capítulos.
* **JSZip:** Geração de arquivos compactados no lado do cliente.
* **Service Workers:** Para suporte a PWA e funcionamento offline.

## 🚀 Como testar

1. Acesse o link do projeto: `https://seu-usuario.github.io/seu-repositorio/`
2. No Android (Chrome), vá em **"Adicionar à tela de início"**.
3. No iOS (Safari), vá em **"Compartilhar"** > **"Adicionar à Tela de Início"**.

## ⚙️ Configurações Técnicas

Para rodar este projeto localmente:
1. Clone o repositório: 
   ```bash
   git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/seu-usuario/seu-repositorio.git)