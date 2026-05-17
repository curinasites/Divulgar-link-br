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
    profileSection.innerHTML = `${perfil.foto ? `<img src="${perfil.foto}" class="profile-avatar" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">` : ''}<div class="profile-avatar-fallback" style="display:${perfil.foto ? 'none' : 'flex'}; animation: avatarGlow 3s ease-in-out infinite;">${inicial}</div><h1 class="profile-name">${escapeHtml(perfil.nome || '@dev')}</h1><p class="profile-bio">${escapeHtml(perfil.bio || '')}</p>`;
    
    // 🆕 Aplica brilho pulsante na borda da foto de perfil (todos os temas)
    const avatar = profileSection.querySelector('.profile-avatar');
    if (avatar) {
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#8b5cf6';
        avatar.style.animation = 'avatarGlow 2s ease-in-out infinite';
        avatar.style.boxShadow = `0 0 20px ${primaryColor}, 0 0 40px ${primaryColor}, 0 0 60px ${primaryColor}`;
    }
}

// Adiciona keyframe do brilho pulsante se não existir
if (!document.getElementById('glow-keyframes')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'glow-keyframes';
    styleEl.textContent = `
        @keyframes avatarGlow {
            0%, 100% { box-shadow: 0 0 20px var(--primary), 0 0 40px var(--primary), 0 0 60px var(--primary); }
            50% { box-shadow: 0 0 30px var(--primary), 0 0 60px var(--primary), 0 0 100px var(--primary), 0 0 140px var(--primary); }
        }
    `;
    document.head.appendChild(styleEl);
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
    // 🟢 MATRIX - Chuva densa com glow verde
    // ═══════════════════════════════════════
    if (estilo === 'matrix') {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*{}[]<>/\|?+=_-';
        const fontSize = 16;
        let colunas, drops;
        
        function initMatrix() {
            colunas = Math.floor(canvas.width / fontSize) + 1;
            drops = Array(colunas).fill(Math.random() * -canvas.height / fontSize);
        }
        initMatrix();
        window.addEventListener('resize', initMatrix);
        
        function animarMatrix() {
            // Fundo semi-transparente para rastro
            ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            for (let i = 0; i < drops.length; i++) {
                // Caractere aleatório
                const char = chars[Math.floor(Math.random() * chars.length)];
                const x = i * fontSize;
                const y = drops[i] * fontSize;
                
                // Primeiro caractere (cabeça da chuva) - brilhante
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = '#00ff41';
                ctx.shadowBlur = 10;
                ctx.font = 'bold ' + fontSize + 'px "JetBrains Mono", monospace';
                ctx.fillText(char, x, y);
                
                // Caracteres abaixo (rastro) - mais escuros
                for (let j = 1; j < 5; j++) {
                    const trailY = y - j * fontSize;
                    if (trailY > 0) {
                        const alpha = 1 - (j * 0.2);
                        ctx.fillStyle = `rgba(0, 255, 65, ${alpha})`;
                        ctx.shadowColor = 'transparent';
                        ctx.shadowBlur = 0;
                        ctx.font = fontSize + 'px "JetBrains Mono", monospace';
                        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, trailY);
                    }
                }
                
                // Reinicia a coluna
                if (y > canvas.height && Math.random() > 0.97) {
                    drops[i] = Math.random() * -canvas.height / fontSize;
                }
                drops[i]++;
            }
            
            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            
            particulasAtivas = requestAnimationFrame(animarMatrix);
        }
        animarMatrix();
    }
    
    // ═══════════════════════════════════════
    // 🟠 DRAGON BALL - Esferas do Dragão reais
    // ═══════════════════════════════════════
    else if (estilo === 'dragonball') {
        for (let i = 0; i < 40; i++) {
            particulas.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 10 + 6,
                speed: Math.random() * 1.8 + 0.6,
                opacity: Math.random() * 0.4 + 0.4,
                estrelas: Math.floor(Math.random() * 7) + 1
            });
        }
        
        function drawDragonBall(p) {
            ctx.save();
            ctx.globalAlpha = p.opacity;
            
            const x = p.x;
            const y = p.y;
            const r = p.r;
            
            // Brilho externo (glow laranja)
            const glowGrad = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 2);
            glowGrad.addColorStop(0, 'rgba(249, 115, 22, 0.4)');
            glowGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
            ctx.beginPath();
            ctx.arc(x, y, r * 2, 0, Math.PI * 2);
            ctx.fillStyle = glowGrad;
            ctx.fill();
            
            // Esfera principal (gradiente radial laranja)
            const grad = ctx.createRadialGradient(x - r*0.25, y - r*0.3, r*0.1, x, y, r);
            grad.addColorStop(0, '#ffcc00');
            grad.addColorStop(0.3, '#f97316');
            grad.addColorStop(0.7, '#e65c00');
            grad.addColorStop(1, '#993300');
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
            
            // Borda
            ctx.strokeStyle = 'rgba(255,200,0,0.6)';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Brilho na parte superior
            const shineGrad = ctx.createRadialGradient(x - r*0.3, y - r*0.35, 0, x, y, r);
            shineGrad.addColorStop(0, 'rgba(255,255,255,0.5)');
            shineGrad.addColorStop(0.3, 'rgba(255,255,255,0.1)');
            shineGrad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = shineGrad;
            ctx.fill();
            
            // Estrelas dentro (1 a 7)
            const numEstrelas = p.estrelas;
            const starSize = r * 0.45;
            ctx.fillStyle = '#ff0000';
            ctx.font = `bold ${starSize}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            if (numEstrelas === 1) {
                ctx.fillText('★', x, y);
            } else if (numEstrelas <= 4) {
                const offset = starSize * 0.35;
                const positions = numEstrelas === 2 ? [[0,-offset],[0,offset]] :
                                  numEstrelas === 3 ? [[0,-offset],[-offset,offset],[offset,offset]] :
                                  [[-offset,-offset],[offset,-offset],[-offset,offset],[offset,offset]];
                positions.forEach(([dx, dy]) => ctx.fillText('★', x + dx, y + dy));
            } else {
                const offset = starSize * 0.4;
                [[0,-offset],[-offset,-offset*0.3],[offset,-offset*0.3],[-offset,offset*0.3],[offset,offset*0.3],[0,offset],[0,0]]
                    .slice(0, numEstrelas)
                    .forEach(([dx, dy]) => ctx.fillText('★', x + dx, y + dy));
            }
            
            ctx.restore();
        }
        
        function animarDBZ() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particulas.forEach(p => {
                p.y += p.speed;
                if (p.y > canvas.height + p.r * 2) {
                    p.y = -p.r * 2;
                    p.x = Math.random() * canvas.width;
                    p.estrelas = Math.floor(Math.random() * 7) + 1;
                }
                drawDragonBall(p);
            });
            particulasAtivas = requestAnimationFrame(animarDBZ);
        }
        animarDBZ();
    }
    
    // ═══════════════════════════════════════
    // 🍥 NARUTO - Folhas caindo (mantido)
    // ═══════════════════════════════════════
    else if (estilo === 'naruto') {
        for (let i = 0; i < 30; i++) {
            particulas.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 14 + 8,
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
            ctx.globalAlpha = 0.8;
            ctx.fillStyle = p.cor;
            ctx.shadowColor = p.cor;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
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
        for (let i = 0; i < 50; i++) {
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
                const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.3, cor);
                grad.addColorStop(0.6, '#ffd700');
                grad.addColorStop(1, 'transparent');
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();
                ctx.restore();
            });
            particulasAtivas = requestAnimationFrame(animarHP);
        }
        animarHP();
    }
    
    // ═══════════════════════════════════════
    // 🎮 GAMER - Controles desenhados
    // ═══════════════════════════════════════
    else if (estilo === 'gamer') {
        for (let i = 0; i < 25; i++) {
            particulas.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 14 + 10,
                speed: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.5 + 0.3,
                tipo: Math.floor(Math.random() * 3)
            });
        }
        
        function drawControle(x, y, size, alpha) {
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(x, y);
            
            const s = size;
            
            // Corpo do controle
            ctx.fillStyle = '#333366';
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 10;
            
            // Base arredondada
            ctx.beginPath();
            ctx.roundRect(-s*0.8, -s*0.5, s*1.6, s*1.2, s*0.3);
            ctx.fill();
            ctx.stroke();
            
            // Direcional (esquerda)
            ctx.fillStyle = '#222244';
            ctx.strokeStyle = '#00cccc';
            ctx.lineWidth = 1.5;
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(-s*0.35, -s*0.05, s*0.25, 0, Math.PI*2);
            ctx.fill();
            ctx.stroke();
            // Cruz direcional
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(-s*0.35 - s*0.06, -s*0.05 - s*0.15, s*0.12, s*0.3);
            ctx.fillRect(-s*0.35 - s*0.15, -s*0.05 - s*0.06, s*0.3, s*0.12);
            
            // Botões A/B (direita)
            ctx.fillStyle = '#ff0044';
            ctx.beginPath();
            ctx.arc(s*0.3, -s*0.15, s*0.1, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = '#00ff44';
            ctx.beginPath();
            ctx.arc(s*0.5, s*0.05, s*0.1, 0, Math.PI*2);
            ctx.fill();
            
            // Botões centrais
            ctx.fillStyle = '#888888';
            ctx.fillRect(-s*0.1, -s*0.12, s*0.2, s*0.08);
            ctx.fillRect(-s*0.04, -s*0.2, s*0.08, s*0.24);
            
            ctx.restore();
        }
        
        function drawNave(x, y, size, alpha) {
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(x, y);
            
            const s = size;
            ctx.fillStyle = '#00ff88';
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 1.5;
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 8;
            
            // Corpo da nave
            ctx.beginPath();
            ctx.moveTo(0, -s*0.7);
            ctx.lineTo(s*0.5, s*0.5);
            ctx.lineTo(-s*0.5, s*0.5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Canhão
            ctx.fillStyle = '#ff00ff';
            ctx.fillRect(-s*0.06, s*0.5, s*0.12, s*0.3);
            
            ctx.restore();
        }
        
        function drawPowerUp(x, y, size, alpha) {
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(x, y);
            
            const s = size;
            ctx.fillStyle = '#ffdd00';
            ctx.strokeStyle = '#ff8800';
            ctx.lineWidth = 1.5;
            ctx.shadowColor = '#ffdd00';
            ctx.shadowBlur = 8;
            
            // Diamante
            ctx.beginPath();
            ctx.moveTo(0, -s*0.6);
            ctx.lineTo(s*0.4, 0);
            ctx.lineTo(0, s*0.6);
            ctx.lineTo(-s*0.4, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            ctx.restore();
        }
        
        function animarGamer() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particulas.forEach(p => {
                p.y += p.speed;
                if (p.y > canvas.height + 40) {
                    p.y = -40;
                    p.x = Math.random() * canvas.width;
                    p.tipo = Math.floor(Math.random() * 3);
                }
                
                if (p.tipo === 0) drawControle(p.x, p.y, p.size, p.opacity);
                else if (p.tipo === 1) drawNave(p.x, p.y, p.size, p.opacity);
                else drawPowerUp(p.x, p.y, p.size, p.opacity);
            });
            particulasAtivas = requestAnimationFrame(animarGamer);
        }
        animarGamer();
    }
    
    // ═══════════════════════════════════════
    // 🔮 PADRÃO - Partículas circulares
    // ═══════════════════════════════════════
    else {
        for (let i = 0; i < 60; i++) {
            particulas.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 2.5 + 0.8,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
        
        function animarPadrao() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particulas.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
                if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
                
                // Glow na partícula
                ctx.save();
                const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
                glowGrad.addColorStop(0, cor);
                glowGrad.addColorStop(1, 'transparent');
                ctx.globalAlpha = p.opacity * 0.5;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
                ctx.fillStyle = glowGrad;
                ctx.fill();
                
                // Partícula central
                ctx.globalAlpha = p.opacity;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = cor;
                ctx.fill();
                ctx.restore();
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
