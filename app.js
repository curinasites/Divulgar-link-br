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
    estiloHeader: 'console', logo: '',
    backgroundImage: '', overlayColor: 'rgba(13,17,23,0.85)'
};

// Elementos DOM
const profileSection = document.getElementById('profile-section');
const linksSection = document.getElementById('links-section');
const mediaSection = document.getElementById('media-section');
const headerLt = document.getElementById('header-lt');
const meuLinkDiv = document.getElementById('meu-link');
const botoesAdminDiv = document.getElementById('botoes-admin');
const bgCustom = document.getElementById('bg-custom');
const bgOverlay = document.getElementById('bg-overlay');

// Variáveis globais
let currentUserId = null;
let currentUserData = null;

// ========== CARREGAR CONFIG GLOBAL (logo, fundo, overlay) ==========
async function carregarConfigGlobal() {
    try {
        const configSnap = await db.collection('config').doc('geral').get();
        if (configSnap.exists) {
            const config = configSnap.data();
            
            // Logo no header
            if (config.logo && headerLt) {
                const consoleLine = headerLt.querySelector('.console-line');
                if (consoleLine) {
                    consoleLine.innerHTML = `
                        <img src="${config.logo}" alt="Logo" style="width:22px;height:22px;border-radius:4px;object-fit:cover;">
                        <span class="console-text">> Divulga Link BR | online</span>
                    `;
                }
            }
            
            // Fundo personalizado
            if (config.backgroundImage && bgCustom) {
                bgCustom.style.backgroundImage = `url(${config.backgroundImage})`;
                bgCustom.classList.add('visible');
            }
            
            // Overlay
            if (bgOverlay) {
                const overlayColor = config.overlayColor || 'rgba(13,17,23,0.85)';
                bgOverlay.style.background = overlayColor;
            }
            
            return config;
        }
    } catch (error) {
        console.error("❌ Erro ao carregar config global:", error);
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

// ========== RENDERIZAR PÁGINA PRINCIPAL (SUPER ADMIN) ==========
function renderizarPaginaPrincipal() {
    console.log("🎨 Renderizando página principal");
    
    aplicarTema(TEMA_PADRAO);
    
    // Perfil do Super Admin (você)
    if (profileSection) {
        profileSection.innerHTML = `
            <div class="profile-avatar-fallback" style="display:flex; background:linear-gradient(135deg, #6366f1, #a78bfa);">D</div>
            <h1 class="profile-name">Divulga Link BR</h1>
            <p class="profile-bio">// A plataforma definitiva para divulgar seus links</p>
        `;
    }
    
    // Links de exemplo
    if (linksSection) {
        linksSection.innerHTML = `
            <a href="cadastro.html" class="link-btn" style="background:linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1)); border:1px solid rgba(139,92,246,0.2);">
                <span class="link-icon">🚀</span>
                <span>Criar Minha Conta Gratuita</span>
                <span class="link-arrow">→</span>
            </a>
            <a href="admin.html" class="link-btn">
                <span class="link-icon">🔐</span>
                <span>Acessar Painel Admin</span>
                <span class="link-arrow">→</span>
            </a>
            <a href="#" class="link-btn" onclick="abrirModalLogin(); return false;">
                <span class="link-icon">👤</span>
                <span>Fazer Login</span>
                <span class="link-arrow">→</span>
            </a>
        `;
    }
    
    // Mídia vazia na página principal
    if (mediaSection) mediaSection.innerHTML = '';
    
    if (botoesAdminDiv) botoesAdminDiv.style.display = 'none';
    if (meuLinkDiv) meuLinkDiv.innerHTML = '';
}

// ========== RENDERIZAR PÁGINA DO USUÁRIO ==========
async function renderizarPaginaUsuario(uid, userData) {
    console.log("👤 Renderizando página do usuário:", uid);
    
    try {
        const temaSnap = await db.collection('usuarios').doc(uid).collection('config').doc('tema').get();
        aplicarTema(temaSnap.exists ? temaSnap.data() : TEMA_PADRAO);
    } catch (error) {
        aplicarTema(TEMA_PADRAO);
    }
    
    const perfil = userData?.perfil || { nome: '@dev', bio: '', foto: '' };
    renderizarPerfil(perfil);
    
    try {
        const linksSnap = await db.collection('usuarios').doc(uid).collection('links').orderBy('ordem', 'asc').get();
        const links = []; linksSnap.forEach(doc => links.push({ id: doc.id, ...doc.data() }));
        renderizarLinks(links);
    } catch (error) { renderizarLinks([]); }
    
    try {
        const midiaSnap = await db.collection('usuarios').doc(uid).collection('midia').orderBy('ordem', 'asc').get();
        const midias = []; midiaSnap.forEach(doc => midias.push({ id: doc.id, ...doc.data() }));
        renderizarMidia(midias);
    } catch (error) { renderizarMidia([]); }
    
    document.title = `${perfil.nome || 'Perfil'} | Divulga Link BR`;
    
    // Botões admin
    if (botoesAdminDiv && usuarioAtual && usuarioAtual.uid === uid) {
        botoesAdminDiv.style.display = 'flex';
        botoesAdminDiv.innerHTML = `
            <a href="admin.html" class="btn-admin-link" style="background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.3);color:#a78bfa;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:12px;">⚙️ Meu Painel</a>
            ${usuarioAtual.email?.toLowerCase() === 'franciscodemelocurina9@gmail.com' ? 
                `<a href="super-admin.html" class="btn-admin-link" style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);color:#f59e0b;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:12px;">👑 Super Admin</a>` : ''}
        `;
    } else if (botoesAdminDiv) {
        botoesAdminDiv.style.display = 'none';
    }
    
    // Link de divulgação
    if (meuLinkDiv && usuarioAtual && usuarioAtual.uid === uid && userData?.username) {
        const baseURL = window.location.origin + window.location.pathname;
        meuLinkDiv.innerHTML = `
            <p style="font-size:12px;color:#8b949e;font-family:'JetBrains Mono',monospace;">🔗 Seu link:</p>
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
        linksSection.innerHTML = '<p style="text-align:center;color:#8b949e;font-size:13px;padding:20px;">Nenhum link ainda.</p>';
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
    if (midias.length === 0) { mediaSection.innerHTML = ''; return; }
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
    
    // Carrega config global (fundo, overlay, logo)
    await carregarConfigGlobal();
    
    // Se NÃO tem username na URL → página principal da plataforma
    if (!userParam) {
        renderizarPaginaPrincipal();
        return;
    }
    
    // Tem username → carrega página do usuário
    try {
        const userSnapshot = await db.collection('usuarios').where('username', '==', userParam).get();
        
        if (userSnapshot.empty) {
            renderizarUsuarioNaoEncontrado();
            return;
        }
        
        const userDoc = userSnapshot.docs[0];
        currentUserId = userDoc.id;
        currentUserData = userDoc.data();
        
        await renderizarPaginaUsuario(currentUserId, currentUserData);
    } catch (error) {
        console.error("❌ Erro:", error);
        renderizarErro();
    }
}

function renderizarUsuarioNaoEncontrado() {
    aplicarTema(TEMA_PADRAO);
    if (profileSection) {
        profileSection.innerHTML = `
            <div class="profile-avatar-fallback" style="display:flex; background:linear-gradient(135deg, #f85149, #b91c1c);">!</div>
            <h1 class="profile-name">Usuário não encontrado</h1>
            <p class="profile-bio">O perfil que você procura não existe.</p>
        `;
    }
    if (linksSection) linksSection.innerHTML = '';
    if (mediaSection) mediaSection.innerHTML = '';
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

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function copiarLink(link) {
    navigator.clipboard.writeText(link).then(() => {
        alert('✅ Link copiado!');
    }).catch(() => {
        prompt('Copie seu link:', link);
    });
}

window.copiarLink = copiarLink;

document.addEventListener('DOMContentLoaded', () => {
    carregarPaginaPublica();
});
