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
    if (!header) return;
    
    // Busca logo global do Super Admin
    let logoURL = t.logo || '';
    if (!logoURL) {
        db.collection('config').doc('geral').get().then(snap => {
            if (snap.exists && snap.data().logo) {
                const img = header.querySelector('img');
                if (!img) {
                    header.querySelector('.console-line').insertAdjacentHTML('afterbegin', 
                        `<img src="${snap.data().logo}" alt="Logo" style="width:22px;height:22px;border-radius:4px;object-fit:cover;">`
                    );
                }
            }
        }).catch(() => {});
    }
    
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
    
    // Tenta carregar pelo username da URL
    if (userParam) {
        try {
            const snap = await db.collection('usuarios').where('username', '==', userParam).get();
            if (!snap.empty) uid = snap.docs[0].id;
        } catch(e) {}
    }
    
    // Se não tem username, tenta o usuário logado
    if (!uid && usuarioAtual) {
        uid = usuarioAtual.uid;
    }
    
    // Se não tem UID, mostra a prévia (já está no HTML)
    if (!uid) {
        aplicarTema(TEMA_PADRAO);
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
        
        // Mostra botões admin para o dono
        const botoesAdmin = document.getElementById('botoes-admin');
        if (botoesAdmin) {
            botoesAdmin.style.display = (usuarioAtual && usuarioAtual.uid === uid) ? 'flex' : 'none';
        }
        
        // Mostra link de divulgação
        if (usuarioAtual && usuarioAtual.uid === uid && userData?.username) {
            const linkDiv = document.getElementById('meu-link');
            if (linkDiv) {
                const baseURL = window.location.origin + window.location.pathname;
                linkDiv.innerHTML = `
                    <p style="font-size:12px;color:#8b949e;font-family:'JetBrains Mono',monospace;">🔗 Seu link de divulgação:</p>
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
        alert('✅ Link copiado! Compartilhe com seus seguidores.');
    }).catch(() => {
        prompt('Copie seu link:', link);
    });
}

function renderizarPerfil(perfil) {
    const section = document.getElementById('profile-section');
    if (!section) return;
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
    if (!section) return;
    if (links.length === 0) { section.innerHTML = '<p style="text-align:center;color:#8b949e;font-size:13px;padding:20px;">Nenhum link ainda.</p>'; return; }
    section.innerHTML = links.map((link, i) => `
        <a href="${link.url || '#'}" class="link-btn" target="_blank" rel="noopener" style="animation-delay:${i*0.05}s;">
            <span class="link-icon">${link.icone || '🔗'}</span>
            <span>${link.titulo || 'Link'}</span>
            <span class="link-arrow">→</span>
        </a>
    `).join('');
}

function renderizarMidia(midias) {
    const section = document.getElementById('media-section');
    if (!section) return;
    if (midias.length === 0) { section.innerHTML = ''; return; }
    section.innerHTML = midias.map((midia, i) => {
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
