// ========== PEGA USUÁRIO DA URL ==========
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
    
    const header = document.getElementById('header-lt');
    const logoURL = t.logo || '';
    header.innerHTML = `
        <div class="console-line">
            ${logoURL ? `<img src="${logoURL}" alt="Logo" style="width:22px;height:22px;border-radius:4px;object-fit:cover;">` : ''}
            <span class="console-dot dot-green"></span>
            <span class="console-dot dot-yellow"></span>
            <span class="console-dot dot-red"></span>
            <span class="console-text">> Divulga Link BR | online</span>
        </div>
    `;
}

async function carregarPaginaPublica() {
    let uid = null;
    
    if (userParam) {
        const snap = await db.collection('usuarios').where('username', '==', userParam).get();
        if (!snap.empty) uid = snap.docs[0].id;
    } else if (usuarioAtual) {
        uid = usuarioAtual.uid;
    }
    
    if (!uid) {
        window.location.href = 'cadastro.html';
        return;
    }
    
    try {
        const userDoc = await db.collection('usuarios').doc(uid).get();
        const userData = userDoc.exists ? userDoc.data() : null;
        
        const temaSnap = await db.collection('usuarios').doc(uid).collection('config').doc('tema').get();
        aplicarTema(temaSnap.exists ? temaSnap.data() : TEMA_PADRAO);
        
        const perfil = userData?.perfil || { nome: '@dev', bio: '', foto: '' };
        renderizarPerfil(perfil);
        
        const linksSnap = await db.collection('usuarios').doc(uid).collection('links').orderBy('ordem', 'asc').get();
        const links = []; linksSnap.forEach(doc => links.push({ id: doc.id, ...doc.data() }));
        renderizarLinks(links);
        
        const midiaSnap = await db.collection('usuarios').doc(uid).collection('midia').orderBy('ordem', 'asc').get();
        const midias = []; midiaSnap.forEach(doc => midias.push({ id: doc.id, ...doc.data() }));
        renderizarMidia(midias);
        
        document.title = perfil.nome || 'Divulga Link BR';
        
        // Mostra botões admin só para o dono
        const botoesAdmin = document.getElementById('botoes-admin');
        if (botoesAdmin) {
            botoesAdmin.style.display = (usuarioAtual && usuarioAtual.uid === uid) ? 'flex' : 'none';
        }
        
        // Mostra o link de divulgação para o dono
        if (usuarioAtual && usuarioAtual.uid === uid && userData?.username) {
            const linkDiv = document.getElementById('meu-link');
            if (linkDiv) {
                const baseURL = window.location.origin + window.location.pathname;
                linkDiv.innerHTML = `
                    <p style="font-size:12px;color:#8b949e;font-family:'JetBrains Mono',monospace;">🔗 Seu link:</p>
                    <div style="display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap;">
                        <code style="background:#161b22;padding:8px 14px;border-radius:8px;font-size:12px;color:#a78bfa;">${baseURL}?u=${userData.username}</code>
                        <button onclick="copiarLink('${baseURL}?u=${userData.username}')" style="background:#8b5cf6;color:#fff;border:none;padding:8px 14px;border-radius:8px;cursor:pointer;font-size:11px;">📋 Copiar</button>
                    </div>
                `;
            }
        }
    } catch (e) {
        console.error('Erro:', e);
    }
}

function copiarLink(link) {
    navigator.clipboard.writeText(link).then(() => {
        alert('✅ Link copiado!');
    });
}

function renderizarPerfil(perfil) {
    const section = document.getElementById('profile-section');
    const inicial = (perfil.nome || 'D').charAt(0).toUpperCase();
    section.innerHTML = `
        ${perfil.foto ? `<img src="${perfil.foto}" class="profile-avatar" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">` : ''}
        <div class="profile-avatar-fallback" style="display:${perfil.foto ? 'none' : 'flex'};">${inicial}</div>
        <h1 class="profile-name">${perfil.nome || '@dev'}</h1>
        <p class="profile-bio">${perfil.bio || ''}</p>
    `;
}

function renderizarLinks(links) {
    const section = document.getElementById('links-section');
    if (links.length === 0) { section.innerHTML = ''; return; }
    section.innerHTML = links.map((link, i) => `
        <a href="${link.url || '#'}" class="link-btn" target="_blank" style="animation-delay:${i*0.05}s;">
            <span class="link-icon">${link.icone || '🔗'}</span>
            <span>${link.titulo || 'Link'}</span>
            <span class="link-arrow">→</span>
        </a>
    `).join('');
}

function renderizarMidia(midias) {
    const section = document.getElementById('media-section');
    if (midias.length === 0) { section.innerHTML = ''; return; }
    section.innerHTML = midias.map((midia, i) => {
        let conteudo = '';
        if (midia.tipo === 'imagem') conteudo = `<img src="${midia.url}" loading="lazy">`;
        else if (midia.tipo === 'youtube') {
            const vid = (midia.url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/) || [])[1] || midia.url;
            conteudo = `<div class="video-wrapper"><iframe src="https://www.youtube.com/embed/${vid}?rel=0" allowfullscreen></iframe></div>`;
        } else if (midia.tipo === 'mp4') {
            conteudo = `<video controls><source src="${midia.url}" type="video/mp4"></video>`;
        }
        return `<div class="media-card" style="animation-delay:${i*0.08}s;">${conteudo}</div>`;
    }).join('');
}