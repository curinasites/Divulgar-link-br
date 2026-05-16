// ========== APP.JS - PÁGINA PÚBLICA DINÂMICA ==========

// Pega o username da URL (ex: ?u=fulano)
const urlParams = new URLSearchParams(window.location.search);
const userParam = urlParams.get('u') || urlParams.get('user');

// ========== TEMA PADRÃO ==========
const TEMA_PADRAO = {
    nome: 'Dev Terminal',
    bg: '#0d1117', bgCard: '#161b22', border: '#30363d',
    text: '#c9d1d9', textSecondary: '#8b949e',
    primary: '#8b5cf6', primaryLight: '#a78bfa',
    fontMain: "'Inter', 'JetBrains Mono', monospace",
    fontMono: "'JetBrains Mono', monospace",
    borderRadius: '12px', cardRadius: '16px',
    estiloHeader: 'console', logo: ''
};

// Elementos DOM
const profileSection = document.getElementById('profile-section');
const linksSection = document.getElementById('links-section');
const mediaSection = document.getElementById('media-section');
const headerLt = document.getElementById('header-lt');
const previaBadge = document.getElementById('previa-badge');
const meuLinkDiv = document.getElementById('meu-link');
const botoesAdminDiv = document.getElementById('botoes-admin');

// Variáveis globais
let currentUserId = null;
let currentUserData = null;

// ========== FUNÇÃO PARA CARREGAR LOGO GLOBAL ==========
async function carregarLogoGlobal() {
    try {
        const configSnap = await db.collection('config').doc('geral').get();
        if (configSnap.exists && configSnap.data().logo) {
            const logoUrl = configSnap.data().logo;
            if (headerLt) {
                const consoleLine = headerLt.querySelector('.console-line');
                if (consoleLine) {
                    consoleLine.innerHTML = `
                        <img src="${logoUrl}" alt="Logo" style="width:22px;height:22px;border-radius:4px;object-fit:cover;">
                        <span class="console-text">> Divulga Link BR | online</span>
                    `;
                }
            }
            console.log("✅ Logo global carregada:", logoUrl);
            return logoUrl;
        }
    } catch (error) {
        console.error("❌ Erro ao carregar logo:", error);
    }
    return null;
}

// ========== APLICAR TEMA ==========
function aplicarTema(tema) {
    const t = tema || TEMA_PADRAO;
    const root = document.documentElement;
    root.style.setProperty('--bg', t.bg);
    root.style.setProperty('--bg-card', t.bgCard);
    root.style.setProperty('--border', t.border);
    root.style.setProperty('--text', t.text);
    root.style.setProperty('--text-secondary', t.textSecondary);
    root.style.setProperty('--primary', t.primary);
    root.style.setProperty('--primary-light', t.primaryLight);
    root.style.setProperty('--font-main', t.fontMain);
    root.style.setProperty('--font-mono', t.fontMono);
    root.style.setProperty('--border-radius', t.borderRadius);
    root.style.setProperty('--card-radius', t.cardRadius);
}

// ========== RENDERIZAR PRÉVIA (PÁGINA PRINCIPAL) ==========
function renderizarPrevia() {
    console.log("🎨 Renderizando prévia da página principal");
    
    // Esconde o badge de prévia
    if (previaBadge) previaBadge.style.display = 'block';
    
    // Aplica tema padrão
    aplicarTema(TEMA_PADRAO);
    
    // Perfil de exemplo
    if (profileSection) {
        profileSection.innerHTML = `
            <div class="profile-avatar-fallback" style="display:flex; background:linear-gradient(135deg, #6366f1, #a78bfa);">D</div>
            <h1 class="profile-name">@seunome</h1>
            <p class="profile-bio">// sua bio personalizada aqui ✨</p>
        `;
    }
    
    // Links de exemplo
    if (linksSection) {
        linksSection.innerHTML = `
            <a href="#" class="link-btn" onclick="return false;">
                <span class="link-icon">💻</span><span>Meu GitHub</span><span class="link-arrow">→</span>
            </a>
            <a href="#" class="link-btn" onclick="return false;">
                <span class="link-icon">📱</span><span>Instagram</span><span class="link-arrow">→</span>
            </a>
            <a href="#" class="link-btn" onclick="return false;">
                <span class="link-icon">🌐</span><span>Meu Portfólio</span><span class="link-arrow">→</span>
            </a>
            <a href="#" class="link-btn" onclick="return false;">
                <span class="link-icon">📺</span><span>Canal do YouTube</span><span class="link-arrow">→</span>
            </a>
        `;
    }
    
    // Mídia de exemplo
    if (mediaSection) {
        mediaSection.innerHTML = `
            <div class="media-card">
                <div class="video-wrapper">
                    <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0" allowfullscreen></iframe>
                </div>
            </div>
        `;
    }
    
    // Esconde botões admin e link de divulgação na prévia
    if (botoesAdminDiv) botoesAdminDiv.style.display = 'none';
    if (meuLinkDiv) meuLinkDiv.innerHTML = '';
}

// ========== RENDERIZAR PÁGINA DO USUÁRIO ==========
async function renderizarPaginaUsuario(uid, userData) {
    console.log("👤 Renderizando página do usuário:", uid);
    
    // Esconde o badge de prévia
    if (previaBadge) previaBadge.style.display = 'none';
    
    // Carrega o tema do usuário
    try {
        const temaSnap = await db.collection('usuarios').doc(uid).collection('config').doc('tema').get();
        aplicarTema(temaSnap.exists ? temaSnap.data() : TEMA_PADRAO);
    } catch (error) {
        console.error("Erro ao carregar tema:", error);
        aplicarTema(TEMA_PADRAO);
    }
    
    // Renderiza perfil
    const perfil = userData?.perfil || { nome: '@dev', bio: '', foto: '' };
    renderizarPerfil(perfil);
    
    // Renderiza links
    try {
        const linksSnap = await db.collection('usuarios').doc(uid).collection('links').orderBy('ordem', 'asc').get();
        const links = [];
        linksSnap.forEach(doc => links.push({ id: doc.id, ...doc.data() }));
        renderizarLinks(links);
    } catch (error) {
        console.error("Erro ao carregar links:", error);
        renderizarLinks([]);
    }
    
    // Renderiza mídias
    try {
        const midiaSnap = await db.collection('usuarios').doc(uid).collection('midia').orderBy('ordem', 'asc').get();
        const midias = [];
        midiaSnap.forEach(doc => midias.push({ id: doc.id, ...doc.data() }));
        renderizarMidia(midias);
    } catch (error) {
        console.error("Erro ao carregar mídias:", error);
        renderizarMidia([]);
    }
    
    // Atualiza título da página
    document.title = `${perfil.nome || 'Perfil'} | Divulga Link BR`;
    
    // Mostra botões admin para o dono da página
    if (botoesAdminDiv && usuarioAtual && usuarioAtual.uid === uid) {
        botoesAdminDiv.style.display = 'flex';
        botoesAdminDiv.innerHTML = `
            <a href="admin.html" class="btn-admin-link" style="background:rgba(139,92,246,0.1); border:1px solid rgba(139,92,246,0.3); color:#a78bfa; padding:8px 16px; border-radius:8px; text-decoration:none; font-size:12px;">⚙️ Meu Painel</a>
            ${usuarioAtual.email?.toLowerCase() === 'franciscodemelocurina9@gmail.com' ? 
                `<a href="super-admin.html" class="btn-admin-link" style="background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3); color:#f59e0b; padding:8px 16px; border-radius:8px; text-decoration:none; font-size:12px;">👑 Super Admin</a>` : ''}
        `;
    } else if (botoesAdminDiv) {
        botoesAdminDiv.style.display = 'none';
    }
    
    // Mostra link de divulgação para o dono
    if (meuLinkDiv && usuarioAtual && usuarioAtual.uid === uid && userData?.username) {
        const baseURL = window.location.origin + window.location.pathname;
        meuLinkDiv.innerHTML = `
            <p style="font-size:12px;color:#8b949e;font-family:'JetBrains Mono',monospace;">🔗 Seu link de divulgação:</p>
            <div style="display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap;">
                <code style="background:#161b22;padding:8px 14px;border-radius:8px;font-size:12px;color:#a78bfa;">${baseURL}?u=${userData.username}</code>
                <button onclick="copiarLink('${baseURL}?u=${userData.username}')" style="background:#8b5cf6;color:#fff;border:none;padding:8px 14px;border-radius:8px;cursor:pointer;font-size:11px;">📋 Copiar</button>
            </div>
        `;
    } else if (meuLinkDiv) {
        meuLinkDiv.innerHTML = '';
    }
}

// ========== FUNÇÕES DE RENDERIZAÇÃO ==========
function renderizarPerfil(perfil) {
    if (!profileSection) return;
    const inicial = (perfil.nome || 'D').charAt(0).toUpperCase();
    profileSection.innerHTML = `
        ${perfil.foto ? `<img src="${perfil.foto}" class="profile-avatar" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">` : ''}
        <div class="profile-avatar-fallback" style="display:${perfil.foto ? 'none' : 'flex'};">${inicial}</div>
        <h1 class="profile-name">${escapeHtml(perfil.nome || '@dev')}</h1>
        <p class="profile-bio">${escapeHtml(perfil.bio || '')}</p>
    `;
}

function renderizarLinks(links) {
    if (!linksSection) return;
    if (links.length === 0) {
        linksSection.innerHTML = '<p style="text-align:center;color:#8b949e;font-size:13px;padding:20px;">Nenhum link adicionado ainda.</p>';
        return;
    }
    linksSection.innerHTML = links.map((link, i) => `
        <a href="${link.url || '#'}" class="link-btn" target="_blank" rel="noopener" style="animation-delay:${i*0.05}s;">
            <span class="link-icon">${link.icone || '🔗'}</span>
            <span>${escapeHtml(link.titulo || 'Link')}</span>
            <span class="link-arrow">→</span>
        </a>
    `).join('');
}

function renderizarMidia(midias) {
    if (!mediaSection) return;
    if (midias.length === 0) {
        mediaSection.innerHTML = '';
        return;
    }
    mediaSection.innerHTML = midias.map((midia, i) => {
        let conteudo = '';
        if (midia.tipo === 'imagem') {
            conteudo = `<img src="${midia.url}" alt="Mídia" loading="lazy" style="width:100%;display:block;">`;
        } else if (midia.tipo === 'youtube') {
            const vid = (midia.url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/) || [])[1] || midia.url;
            conteudo = `<div class="video-wrapper"><iframe src="https://www.youtube.com/embed/${vid}?rel=0" allowfullscreen></iframe></div>`;
        } else if (midia.tipo === 'mp4') {
            conteudo = `<video controls style="width:100%;"><source src="${midia.url}" type="video/mp4"></video>`;
        }
        return `<div class="media-card" style="animation-delay:${i*0.08}s;">${conteudo}</div>`;
    }).join('');
}

// ========== FUNÇÃO PRINCIPAL ==========
async function carregarPaginaPublica() {
    console.log("🔍 Carregando página pública, userParam:", userParam);
    
    // Carrega a logo global primeiro
    await carregarLogoGlobal();
    
    // Se não tem username na URL, mostra prévia
    if (!userParam) {
        console.log("⚠️ Nenhum username na URL, mostrando prévia");
        renderizarPrevia();
        return;
    }
    
    try {
        // Busca o usuário pelo username
        const userSnapshot = await db.collection('usuarios').where('username', '==', userParam).get();
        
        if (userSnapshot.empty) {
            console.log("❌ Usuário não encontrado:", userParam);
            renderizarUsuarioNaoEncontrado();
            return;
        }
        
        const userDoc = userSnapshot.docs[0];
        currentUserId = userDoc.id;
        currentUserData = userDoc.data();
        
        console.log("✅ Usuário encontrado:", currentUserData.email);
        
        // Renderiza a página do usuário
        await renderizarPaginaUsuario(currentUserId, currentUserData);
        
    } catch (error) {
        console.error("❌ Erro ao carregar página pública:", error);
        renderizarErro();
    }
}

function renderizarUsuarioNaoEncontrado() {
    aplicarTema(TEMA_PADRAO);
    if (profileSection) {
        profileSection.innerHTML = `
            <div class="profile-avatar-fallback" style="display:flex; background:linear-gradient(135deg, #f85149, #b91c1c);">!</div>
            <h1 class="profile-name">Usuário não encontrado</h1>
            <p class="profile-bio">O perfil que você procura não existe ou foi removido.</p>
        `;
    }
    if (linksSection) linksSection.innerHTML = '';
    if (mediaSection) mediaSection.innerHTML = '';
    if (previaBadge) previaBadge.style.display = 'none';
}

function renderizarErro() {
    aplicarTema(TEMA_PADRAO);
    if (profileSection) {
        profileSection.innerHTML = `
            <div class="profile-avatar-fallback" style="display:flex; background:linear-gradient(135deg, #f85149, #b91c1c);">⚠️</div>
            <h1 class="profile-name">Erro ao carregar</h1>
            <p class="profile-bio">Tente novamente mais tarde.</p>
        `;
    }
    if (linksSection) linksSection.innerHTML = '';
    if (mediaSection) mediaSection.innerHTML = '';
}

// ========== FUNÇÕES UTILITÁRIAS ==========
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function copiarLink(link) {
    navigator.clipboard.writeText(link).then(() => {
        alert('✅ Link copiado! Compartilhe com seus seguidores.');
    }).catch(() => {
        prompt('Copie seu link:', link);
    });
}

// ========== EXPOR FUNÇÕES GLOBAIS ==========
window.copiarLink = copiarLink;

// Inicializa quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log("📄 DOM carregado, inicializando app.js");
    carregarPaginaPublica();
});
