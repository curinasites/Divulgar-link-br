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
    backgroundImage: '', overlayColor: 'rgba(13,17,23,0.85)',
    estiloParticulas: 'padrao'
};

// ========== TEMAS ESPECIAIS (PARTÍCULAS ANIMADAS) ==========
const TEMAS_ESPECIAIS = {
    matrix: {
        nome: 'Matrix', bg: '#000000', bgCard: '#0a0a0a', border: '#00ff4133',
        text: '#00ff41', textSecondary: '#00cc33', primary: '#00ff41', primaryLight: '#33ff66',
        fontMain: "'JetBrains Mono', monospace", fontMono: "'JetBrains Mono', monospace",
        borderRadius: '8px', cardRadius: '12px',
        estiloHeader: 'console', logo: '',
        backgroundImage: '', overlayColor: 'rgba(0,0,0,0.9)',
        estiloParticulas: 'matrix'
    },
    dragonball: {
        nome: 'Dragon Ball', bg: '#1a0a00', bgCard: '#2d1800', border: '#f9731633',
        text: '#ffd700', textSecondary: '#ff8c00', primary: '#f97316', primaryLight: '#fb923c',
        fontMain: "'Poppins', sans-serif", fontMono: "'JetBrains Mono', monospace",
        borderRadius: '16px', cardRadius: '20px',
        estiloHeader: 'console', logo: '',
        backgroundImage: '', overlayColor: 'rgba(26,10,0,0.85)',
        estiloParticulas: 'dragonball'
    },
    naruto: {
        nome: 'Naruto', bg: '#0a0a1a', bgCard: '#1a1a2d', border: '#ff6b3533',
        text: '#ffd700', textSecondary: '#ff8c00', primary: '#ff6b35', primaryLight: '#ff8c5a',
        fontMain: "'Nunito', sans-serif", fontMono: "'JetBrains Mono', monospace",
        borderRadius: '14px', cardRadius: '18px',
        estiloHeader: 'console', logo: '',
        backgroundImage: '', overlayColor: 'rgba(10,10,26,0.85)',
        estiloParticulas: 'naruto'
    },
    harrypotter: {
        nome: 'Harry Potter', bg: '#0a0a1a', bgCard: '#1a1a35', border: '#d4a57433',
        text: '#d4a574', textSecondary: '#c4956a', primary: '#d4a574', primaryLight: '#e0c0a0',
        fontMain: "'Cinzel', serif", fontMono: "'JetBrains Mono', monospace",
        borderRadius: '12px', cardRadius: '16px',
        estiloHeader: 'console', logo: '',
        backgroundImage: '', overlayColor: 'rgba(10,10,26,0.9)',
        estiloParticulas: 'harrypotter'
    },
    gamer: {
        nome: 'Gamer', bg: '#0d0020', bgCard: '#1a0035', border: '#00ffff33',
        text: '#00ffff', textSecondary: '#00cccc', primary: '#00ffff', primaryLight: '#33ffff',
        fontMain: "'Press Start 2P', cursive", fontMono: "'JetBrains Mono', monospace",
        borderRadius: '8px', cardRadius: '12px',
        estiloHeader: 'console', logo: '',
        backgroundImage: '', overlayColor: 'rgba(13,0,32,0.9)',
        estiloParticulas: 'gamer'
    }
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
let particulasAtivas = null; // Referência para o loop de partículas

// ========== APLICAR FUNDO (imagem + overlay) ==========
function aplicarFundo(config) {
    if (config.backgroundImage && bgCustom) {
        bgCustom.style.backgroundImage = `url(${config.backgroundImage})`;
        bgCustom.classList.add('visible');
    } else if (bgCustom) {
        bgCustom.style.backgroundImage = '';
        bgCustom.classList.remove('visible');
    }
    if (bgOverlay) {
        bgOverlay.style.background = config.overlayColor || 'rgba(13,17,23,0.85)';
    }
}

// ========== APLICAR CORES PERSONALIZADAS ==========
function aplicarCoresPersonalizadas(config) {
    if (!config) return;
    const root = document.documentElement;
    if (config.corParticulas) {
        root.style.setProperty('--particula-cor', config.corParticulas);
    }
    if (config.corCards) {
        root.style.setProperty('--link-card-bg', config.corCards);
    }
    if (config.overlayColor) {
        root.style.setProperty('--overlay-cor', config.overlayColor);
    }
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
    aplicarFundo(t);
    // 🆕 Iniciar partículas do tema
    iniciarParticulasTema(t.estiloParticulas || 'padrao', t.primary || '#8b5cf6');
}

// ========== CARREGAR CONFIG GLOBAL ==========
async function carregarConfigGlobal() {
    try {
        const configSnap = await db.collection('config').doc('geral').get();
        if (configSnap.exists) {
            const config = configSnap.data();
            if (config.logo && headerLt) {
                const consoleLine = headerLt.querySelector('.console-line');
                if (consoleLine) {
                    consoleLine.innerHTML = `<img src="${config.logo}" alt="Logo" style="width:22px;height:22px;border-radius:50%;object-fit:cover;"><span class="console-text"> Divulga Link BR</span>`;
                }
            }
            aplicarCoresPersonalizadas(config);
            return config;
        }
    } catch (error) {}
    return null;
}

// ========== VERIFICA SE É URL DE IMAGEM ==========
function isImageUrl(texto) {
    if (!texto) return false;
    const urlPattern = /^https?:\/\//i;
    const imageExtPattern = /\.(png|jpg|jpeg|gif|webp|svg|bmp|ico)(\?.*)?$/i;
    const imageHostPattern = /(imgur|ibb\.co|cloudinary|images\.unsplash|firebasestorage|googleapis\.com\/.*\/o\/)/i;
    return urlPattern.test(texto) && (imageExtPattern.test(texto) || imageHostPattern.test(texto));
}

// ========== RENDERIZAR ÍCONE (emoji ou imagem) ==========
function renderizarIcone(icone) {
    if (!icone) return '🔗';
    if (isImageUrl(icone)) {
        return `<img src="${icone}" alt="ícone" style="width:28px;height:28px;border-radius:50%;object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='inline';">`;
    }
    return icone;
}

// ========== CONTADOR DE CLIQUES ==========
async function contarClique(linkId, uid) {
    if (!uid || !linkId) return;
    try {
        const ref = db.collection('usuarios').doc(uid).collection('links').doc(linkId);
        const doc = await ref.get();
        if (doc.exists) {
            await ref.update({ cliques: (doc.data().cliques || 0) + 1 });
        }
    } catch(e) {}
}

// ========== RENDERIZAR PÁGINA PRINCIPAL ==========
async function renderizarPaginaPrincipal() {
    try {
        const snap = await db.collection('config').doc('paginaPrincipal').get();
        if (snap.exists) {
            const data = snap.data();
            aplicarTema(data.tema || TEMA_PADRAO);
            const configGlobal = await carregarConfigGlobal();
            if (configGlobal) {
                aplicarFundo(configGlobal);
                aplicarCoresPersonalizadas(configGlobal);
            }
            if (data.perfil && profileSection) renderizarPerfil(data.perfil);
            else if (profileSection) profileSection.innerHTML = `<div class="profile-avatar-fallback" style="display:flex; background:linear-gradient(135deg, #6366f1, #a78bfa);">D</div><h1 class="profile-name">Divulga Link BR</h1><p class="profile-bio">// A plataforma definitiva para divulgar seus links</p>`;
            if (data.links && data.links.length > 0 && linksSection) renderizarLinks(data.links);
            else if (linksSection) linksSection.innerHTML = `<a href="cadastro.html" class="link-btn" style="background:linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1)); border:1px solid rgba(139,92,246,0.2);"><span class="link-icon">🚀</span><span>Criar Minha Conta Gratuita</span><span class="link-arrow">→</span></a><a href="admin.html" class="link-btn"><span class="link-icon">🔐</span><span>Acessar Painel Admin</span><span class="link-arrow">→</span></a>`;
            if (data.midias && data.midias.length > 0 && mediaSection) renderizarMidia(data.midias);
            else if (mediaSection) mediaSection.innerHTML = '';
            return;
        }
    } catch(e) {}
    
    const configGlobal = await carregarConfigGlobal();
    aplicarTema(TEMA_PADRAO);
    if (configGlobal) aplicarCoresPersonalizadas(configGlobal);
    if (profileSection) profileSection.innerHTML = `<div class="profile-avatar-fallback" style="display:flex; background:linear-gradient(135deg, #6366f1, #a78bfa);">D</div><h1 class="profile-name">Divulga Link BR</h1><p class="profile-bio">// A plataforma definitiva para divulgar seus links</p>`;
    if (linksSection) linksSection.innerHTML = `<a href="cadastro.html" class="link-btn" style="background:linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1)); border:1px solid rgba(139,92,246,0.2);"><span class="link-icon">🚀</span><span>Criar Minha Conta Gratuita</span><span class="link-arrow">→</span></a><a href="admin.html" class="link-btn"><span class="link-icon">🔐</span><span>Acessar Painel Admin</span><span class="link-arrow">→</span></a>`;
    if (mediaSection) mediaSection.innerHTML = '';
    if (botoesAdminDiv) botoesAdminDiv.style.display = 'none';
    if (meuLinkDiv) meuLinkDiv.innerHTML = '';
}

// ========== RENDERIZAR PÁGINA DO USUÁRIO ==========
async function renderizarPaginaUsuario(uid, userData) {
    if (bgCustom) { bgCustom.style.backgroundImage = ''; bgCustom.classList.remove('visible'); }
    try {
        const temaSnap = await db.collection('usuarios').doc(uid).collection('config').doc('tema').get();
        aplicarTema(temaSnap.exists ? temaSnap.data() : TEMA_PADRAO);
        aplicarFundo(temaSnap.exists ? temaSnap.data() : TEMA_PADRAO);
    } catch (error) { aplicarTema(TEMA_PADRAO); }
    
    const perfil = userData?.perfil || { nome: '@dev', bio: '', foto: '' };
    renderizarPerfil(perfil);
    
    try {
        const linksSnap = await db.collection('usuarios').doc(uid).collection('links').orderBy('ordem', 'asc').get();
        const links = []; linksSnap.forEach(doc => links.push({ id: doc.id, ...doc.data() }));
        renderizarLinks(links, uid);
    } catch (error) { renderizarLinks([]); }
    
    try {
        const midiaSnap = await db.collection('usuarios').doc(uid).collection('midia').orderBy('ordem', 'asc').get();
        const midias = []; midiaSnap.forEach(doc => midias.push({ id: doc.id, ...doc.data() }));
        renderizarMidia(midias);
    } catch (error) { renderizarMidia([]); }
    
    try {
        const userRef = db.collection('usuarios').doc(uid);
        const userDoc = await userRef.get();
        if (userDoc.exists) {
            await userRef.update({ views: (userDoc.data().views || 0) + 1 });
        }
    } catch(e) {}
    
    document.title = `${perfil.nome || 'Perfil'} | Divulga Link BR`;
    
    if (botoesAdminDiv && usuarioAtual && usuarioAtual.uid === uid) {
        botoesAdminDiv.style.display = 'flex';
        botoesAdminDiv.innerHTML = `<a href="admin.html" class="btn-admin-link" style="background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.3);color:#a78bfa;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:12px;">⚙️ Meu Painel</a>${usuarioAtual.email?.toLowerCase() === 'franciscodemelocurina9@gmail.com' ? `<a href="super-admin.html" class="btn-admin-link" style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);color:#f59e0b;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:12px;">👑 Super Admin</a>` : ''}`;
    } else if (botoesAdminDiv) { botoesAdminDiv.style.display = 'none'; }
    
    if (meuLinkDiv && usuarioAtual && usuarioAtual.uid === uid && userData?.username) {
        const baseURL = window.location.origin + window.location.pathname;
        meuLinkDiv.innerHTML = `<p style="font-size:12px;color:#8b949e;font-family:'JetBrains Mono',monospace;">🔗 Seu link curto:</p><div style="display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap;"><code style="background:#161b22;padding:8px 14px;border-radius:8px;font-size:12px;color:#a78bfa;">${baseURL}?u=${userData.username}</code><button onclick="copiarLink('${baseURL}?u=${userData.username}')" style="background:#8b5cf6;color:#fff;border:none;padding:8px 14px;border-radius:8px;cursor:pointer;font-size:11px;">📋 Copiar</button></div>`;
    } else if (meuLinkDiv) { meuLinkDiv.innerHTML = ''; }
}

// ========== FUNÇÕES DE RENDERIZAÇÃO ==========
function renderizarPerfil(perfil) {
    if (!profileSection) return;
    const inicial = (perfil.nome || 'D').charAt(0).toUpperCase();
    profileSection.innerHTML = `${perfil.foto ? `<img src="${perfil.foto}" class="profile-avatar" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">` : ''}<div class="profile-avatar-fallback" style="display:${perfil.foto ? 'none' : 'flex'};">${inicial}</div><h1 class="profile-name">${escapeHtml(perfil.nome || '@dev')}</h1><p class="profile-bio">${escapeHtml(perfil.bio || '')}</p>`;
}

function renderizarLinks(links, uid) {
    if (!linksSection) return;
    if (links.length === 0) { linksSection.innerHTML = '<p style="text-align:center;color:#8b949e;font-size:13px;padding:20px;">Nenhum link ainda.</p>'; return; }
    linksSection.innerHTML = links.map((link, i) => {
        const iconHtml = renderizarIcone(link.icone);
        return `
        <a href="${link.url || '#'}" class="link-btn" target="_blank" rel="noopener" style="animation-delay:${i*0.05}s;" onclick="contarClique('${link.id}', '${uid || currentUserId}')">
            <span class="link-icon">${iconHtml}</span>
            <span>${escapeHtml(link.titulo || 'Link')}</span>
            <span class="link-arrow">→</span>
        </a>
    `}).join('');
}

function renderizarMidia(midias) {
    if (!mediaSection) return;
    if (midias.length === 0) { mediaSection.innerHTML = ''; return; }
    mediaSection.innerHTML = midias.map((midia, i) => {
        let conteudo = '';
        if (midia.tipo === 'imagem') conteudo = `<img src="${midia.url}" alt="Mídia" loading="lazy" style="width:100%;display:block;">`;
        else if (midia.tipo === 'youtube') {
            const vid = (midia.url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/) || [])[1] || midia.url;
            conteudo = `<div class="video-wrapper"><iframe src="https://www.youtube.com/embed/${vid}?rel=0" allowfullscreen></iframe></div>`;
        } else if (midia.tipo === 'mp4') conteudo = `<video controls style="width:100%;"><source src="${midia.url}" type="video/mp4"></video>`;
        return `<div class="media-card" style="animation-delay:${i*0.08}s;">${conteudo}</div>`;
    }).join('');
}

// ========== PARTÍCULAS ANIMADAS POR TEMA ==========
const particulasCanvas = document.getElementById('particles-canvas');
const particulasCtx = particulasCanvas?.getContext('2d');

function iniciarParticulasTema(estilo, corPrimaria) {
    if (!particulasCanvas || !particulasCtx) return;
    
    // Cancela animação anterior
    if (particulasAtivas) {
        cancelAnimationFrame(particulasAtivas);
        particulasAtivas = null;
    }
    
    const ctx = particulasCtx;
    const canvas = particulasCanvas;
    let particulas = [];
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();
    
    const cor = corPrimaria || '#8b5cf6';
    
    // ═══════════════════════════════════════
    // 🟢 MATRIX - Chuva de caracteres verdes
    // ═══════════════════════════════════════
    if (estilo === 'matrix') {
        const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const fontSize = 14;
        let colunas;
        let drops;
        
        function initMatrix() {
            colunas = Math.floor(canvas.width / fontSize);
            drops = Array(colunas).fill(1);
        }
        initMatrix();
        window.addEventListener('resize', initMatrix);
        
        function drawMatrix() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#00ff41';
            ctx.font = fontSize + 'px monospace';
            
            for (let i = 0; i < drops.length; i++) {
                const char = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(char, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }
        
        function animarMatrix() {
            drawMatrix();
            particulasAtivas = requestAnimationFrame(animarMatrix);
        }
        animarMatrix();
    }
    
    // ═══════════════════════════════════════
    // 🟠 DRAGON BALL - Esferas laranja
    // ═══════════════════════════════════════
    else if (estilo === 'dragonball') {
        for (let i = 0; i < 30; i++) {
            particulas.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 6 + 4,
                speed: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.6 + 0.2,
                estrelas: Math.floor(Math.random() * 4) + 1
            });
        }
        
        function drawBola(particula) {
            ctx.save();
            ctx.globalAlpha = particula.opacity;
            
            // Esfera laranja
            const grad = ctx.createRadialGradient(particula.x, particula.y, 0, particula.x, particula.y, particula.r);
            grad.addColorStop(0, cor);
            grad.addColorStop(0.6, '#ff8c00');
            grad.addColorStop(1, '#cc4400');
            ctx.beginPath();
            ctx.arc(particula.x, particula.y, particula.r, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
            
            // Estrelinhas dentro
            ctx.fillStyle = '#ffd700';
            ctx.font = (particula.r * 1.5) + 'px sans-serif';
            ctx.fillText('⭐', particula.x - particula.r * 0.7, particula.y + particula.r * 0.5);
            
            ctx.restore();
        }
        
        function animarDBZ() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particulas.forEach(p => {
                p.y += p.speed;
                if (p.y > canvas.height + p.r) {
                    p.y = -p.r;
                    p.x = Math.random() * canvas.width;
                }
                drawBola(p);
            });
            particulasAtivas = requestAnimationFrame(animarDBZ);
        }
        animarDBZ();
    }
    
    // ═══════════════════════════════════════
    // 🍥 NARUTO - Folhas caindo
    // ═══════════════════════════════════════
    else if (estilo === 'naruto') {
        for (let i = 0; i < 25; i++) {
            particulas.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 12 + 6,
                speedX: (Math.random() - 0.5) * 1.5,
                speedY: Math.random() * 1.5 + 0.8,
                rotacao: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.05,
                cor: ['#ff6b35', '#ff8c00', '#ff4500', '#228b22', '#ffd700'][Math.floor(Math.random() * 5)]
            });
        }
        
        function drawFolha(p) {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotacao);
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = p.cor;
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(-p.size, 0);
            ctx.lineTo(p.size, 0);
            ctx.stroke();
            ctx.restore();
        }
        
        function animarNaruto() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particulas.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                p.rotacao += p.rotSpeed;
                if (p.y > canvas.height + p.size) {
                    p.y = -p.size;
                    p.x = Math.random() * canvas.width;
                }
                if (p.x > canvas.width + p.size) p.x = -p.size;
                if (p.x < -p.size) p.x = canvas.width + p.size;
                drawFolha(p);
            });
            particulasAtivas = requestAnimationFrame(animarNaruto);
        }
        animarNaruto();
    }
    
    // ═══════════════════════════════════════
    // ⚡ HARRY POTTER - Faíscas douradas
    // ═══════════════════════════════════════
    else if (estilo === 'harrypotter') {
        for (let i = 0; i < 40; i++) {
            particulas.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 2.5 + 1,
                speedX: (Math.random() - 0.5) * 0.8,
                speedY: (Math.random() - 0.5) * 0.8,
                opacity: Math.random(),
                fadeSpeed: Math.random() * 0.02 + 0.005
            });
        }
        
        function animarHP() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particulas.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                p.opacity += p.fadeSpeed;
                if (p.opacity >= 1 || p.opacity <= 0) p.fadeSpeed *= -1;
                if (p.x > canvas.width) p.x = 0;
                if (p.x < 0) p.x = canvas.width;
                if (p.y > canvas.height) p.y = 0;
                if (p.y < 0) p.y = canvas.height;
                
                ctx.save();
                ctx.globalAlpha = Math.abs(p.opacity);
                const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
                grad.addColorStop(0, cor);
                grad.addColorStop(0.5, '#ffd700');
                grad.addColorStop(1, 'transparent');
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();
                ctx.restore();
            });
            particulasAtivas = requestAnimationFrame(animarHP);
        }
        animarHP();
    }
    
    // ═══════════════════════════════════════
    // 🎮 GAMER - Ícones de games
    // ═══════════════════════════════════════
    else if (estilo === 'gamer') {
        const icones = ['🎮', '🕹️', '👾', '💾', '🖥️', '🎯', '🏆', '⚡'];
        for (let i = 0; i < 20; i++) {
            particulas.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                icone: icones[Math.floor(Math.random() * icones.length)],
                size: Math.random() * 16 + 12,
                speed: Math.random() * 1.2 + 0.4,
                opacity: Math.random() * 0.5 + 0.3
            });
        }
        
        function animarGamer() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particulas.forEach(p => {
                p.y += p.speed;
                if (p.y > canvas.height + 30) {
                    p.y = -30;
                    p.x = Math.random() * canvas.width;
                }
                ctx.save();
                ctx.globalAlpha = p.opacity;
                ctx.font = p.size + 'px sans-serif';
                ctx.fillText(p.icone, p.x, p.y);
                ctx.restore();
            });
            particulasAtivas = requestAnimationFrame(animarGamer);
        }
        animarGamer();
    }
    
    // ═══════════════════════════════════════
    // 🔮 PADRÃO - Partículas circulares
    // ═══════════════════════════════════════
    else {
        for (let i = 0; i < 50; i++) {
            particulas.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.5 + 0.1
            });
        }
        
        function animarPadrao() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particulas.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
                if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = cor.replace(/[\d.]+\)$/, `${p.opacity})`);
                ctx.fill();
            });
            particulasAtivas = requestAnimationFrame(animarPadrao);
        }
        animarPadrao();
    }
}

// ========== FUNÇÃO PRINCIPAL ==========
async function carregarPaginaPublica() {
    if (userParam) {
        try {
            const userSnapshot = await db.collection('usuarios').where('username', '==', userParam).get();
            if (userSnapshot.empty) { renderizarUsuarioNaoEncontrado(); return; }
            const userDoc = userSnapshot.docs[0];
            currentUserId = userDoc.id;
            currentUserData = userDoc.data();
            await renderizarPaginaUsuario(currentUserId, currentUserData);
            return;
        } catch (error) { renderizarErro(); return; }
    }
    await renderizarPaginaPrincipal();
}

function renderizarUsuarioNaoEncontrado() {
    aplicarTema(TEMA_PADRAO);
    if (profileSection) profileSection.innerHTML = `<div class="profile-avatar-fallback" style="display:flex; background:linear-gradient(135deg, #f85149, #b91c1c);">!</div><h1 class="profile-name">Usuário não encontrado</h1><p class="profile-bio">O perfil que você procura não existe.</p>`;
    if (linksSection) linksSection.innerHTML = '';
    if (mediaSection) mediaSection.innerHTML = '';
}

function renderizarErro() {
    aplicarTema(TEMA_PADRAO);
    if (profileSection) profileSection.innerHTML = `<div class="profile-avatar-fallback" style="display:flex; background:linear-gradient(135deg, #f85149, #b91c1c);">⚠️</div><h1 class="profile-name">Erro ao carregar</h1><p class="profile-bio">Tente novamente mais tarde.</p>`;
    if (linksSection) linksSection.innerHTML = '';
    if (mediaSection) mediaSection.innerHTML = '';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div'); div.textContent = text; return div.innerHTML;
}

function copiarLink(link) {
    navigator.clipboard.writeText(link).then(() => alert('✅ Link copiado!')).catch(() => prompt('Copie seu link:', link));
}

window.copiarLink = copiarLink;
carregarPaginaPublica();
