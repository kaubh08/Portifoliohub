/**
 * PortfolioHUB - Lógica Principal de Integração com API GitHub
 * Princípios de Clean Code: Responsabilidade Única e Funções Claras
 */

document.getElementById('search-btn').addEventListener('click', handleSearch);
document.getElementById('username-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

/**
 * Coordena o fluxo de busca e renderização
 */
async function handleSearch() {
    const usernameInput = document.getElementById('username-input');
    const username = usernameInput.value.trim();

    if (!username) {
        showError("Por favor, digite um nome de usuário válido.");
        return;
    }

    toggleLoading(true);
    clearError();

    try {
        const repositories = await fetchRepositories(username);
        renderProjects(repositories);
    } catch (error) {
        showError(error.message);
        clearGrid();
    } finally {
        toggleLoading(false);
    }
}

/**
 * Consome a API REST pública do GitHub
 * @param {string} username 
 * @returns {Promise<Array>}
 */
async function fetchRepositories(username) {
    const url = `https://api.github.com/users/${username}/repos?sort=updated&per_page=6`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("Usuário não encontrado no GitHub.");
        }
        throw new Error("Falha ao conectar com a API do GitHub.");
    }
    
    return response.json();
}

/**
 * Renderiza os repositórios dinamicamente no DOM
 * @param {Array} repos 
 */
function renderProjects(repos) {
    const grid = document.getElementById('projects-grid');
    grid.innerHTML = '';

    if (repos.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-8 text-gray-500">Este usuário não possui repositórios públicos.</div>`;
        return;
    }

    repos.forEach(repo => {
        const card = document.createElement('div');
        card.className = "bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col justify-between";
        
        card.innerHTML = `
            <div>
                <h4 class="text-lg font-bold text-gray-900 truncate mb-1" title="${repo.name}">${repo.name}</h4>
                <p class="text-gray-500 text-sm line-clamp-2 mb-4">${repo.description || 'Sem descrição informada.'}</p>
            </div>
            <div class="flex justify-between items-center mt-4 pt-3 border-t border-gray-50.">
                <span class="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-medium">
                    ⭐ ${repo.stargazers_count} stars
                </span>
                <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition">
                    Ver no GitHub →
                </a>
            </div>
        `;
        grid.appendChild(card);
    });
}

function toggleLoading(isLoading) {
    document.getElementById('loading-spinner').classList.toggle('hidden', !isLoading);
    document.getElementById('projects-grid').classList.toggle('hidden', isLoading);
}

function showError(message) {
    const errorEl = document.getElementById('error-msg');
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
}

function clearError() {
    document.getElementById('error-msg').classList.add('hidden');
}

function clearGrid() {
    document.getElementById('projects-grid').innerHTML = `
        <div class="col-span-full text-center py-12 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
            Nenhum projeto carregado.
        </div>`;
}
