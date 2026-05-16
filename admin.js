let userUID = null;
let temaAtual = 'dev';

const TEMAS = {
    dev: { nome: 'Dev Terminal', bg: '#0d1117', bgCard: '#161b22', border: '#30363d', text: '#c9d1d9', textSecondary: '#8b949e', primary: '#8b5cf6', primaryLight: '#a78bfa', fontMain: "'Inter','JetBrains Mono',monospace", fontMono: "'JetBrains Mono',monospace", borderRadius: '12px', cardRadius: '16px', estiloHeader: 'console', logo: '' },
    clean: { nome: 'Clean Blue', bg: '#0a0a1a', bgCard: '#1a1a35', border: '#2a2a50', text: '#e0e0f0', textSecondary: '#9090b0', primary: '#3b82f6', primaryLight: '#60a5fa', fontMain: "'Poppins','Inter',sans-serif", fontMono: "'JetBrains Mono',monospace", borderRadius: '14px', cardRadius: '18px', estiloHeader: 'clean', logo: '' },
    dark: { nome: 'Dark Green', bg: '#0a0f0a', bgCard: '#1a2a1a', border: '#2a3a2a', text: '#d0e0d0', textSecondary: '#809080', primary: '#10b981', primaryLight: '#34d399', fontMain: "'Inter',sans-serif", fontMono: "'JetBrains Mono',monospace", borderRadius: '10px', cardRadius: '14px', estiloHeader: 'console', logo: '' },
    rosa: { nome: 'Rose Pink', bg: '#1a0a14', bgCard: '#2d1a24', border: '#3d2a34', text: '#f0d0e0', textSecondary: '#b090a0', primary: '#ec4899', primaryLight: '#f472b6', fontMain: "'Nunito','Inter',sans-serif", fontMono: "'JetBrains Mono',monospace", borderRadius: '16px', cardRadius: '20px', estiloHeader: 'clean', logo: '' },
    minimal: { nome: 'Minimal', bg: '#0a0a0a', bgCard: '#1a1a1a', border: '#2a2a2a', text: '#d0d0d0', textSecondary: '#808080', primary: '#6b7280', primaryLight: '#9ca3af', fontMain: "'Inter',sans-serif", fontMono: "'JetBrains Mono',monospace", borderRadius: '8px', cardRadius: '12px', estiloHeader: 'minimal', logo: '' },
    warm: { nome: 'Warm Orange', bg: '#1a0f0a', bgCard: '#2d1f1a', border: '#3d2f2a', text: '#f0e0d0', textSecondary: '#b0a090', primary: '#f59e0b', primaryLight: '#fbbf24', fontMain: "'Poppins','Inter',sans-serif", fontMono: "'JetBrains Mono',monospace", borderRadius: '12px', cardRadius: '16px', estiloHeader: 'console', logo: '' },
    cyber: { nome: 'Cyber Neon', bg: '#0a0a0a', bgCard: '#1a0a2d', border: '#3d1a6e', text: '#e0d0ff', textSecondary: '#9070c0', primary: '#a855f7', primaryLight: '#c084fc', fontMain: "'Inter',sans-serif", fontMono: "'JetBrains Mono',monospace", borderRadius: '12px', cardRadius: '16px', estiloHeader: 'console', logo: '' },
    ocean: { nome: 'Ocean Blue', bg: '#0a1a2a', bgCard: '#1a2a3d', border: '#2a3a50', text: '#d0e8ff', textSecondary: '#80a8c0', primary: '#06b6d4', primaryLight: '#22d3ee', fontMain: "'Poppins','Inter',sans-serif", fontMono: "'JetBrains Mono',monospace", borderRadius: '14px', cardRadius: '18px', estiloHeader: 'clean', logo: '' },
    sunset: { nome: 'Sunset', bg: '#1a0a0a', bgCard: '#2d1a1a', border: '#3d2a2a', text: '#ffe0d0', textSecondary: '#c0a090', primary: '#f97316', primaryLight: '#fb923c', fontMain: "'Nunito','Inter',sans-serif", fontMono: "'JetBrains Mono',monospace", borderRadius: '14px', cardRadius: '18px', estiloHeader: 'console', logo: '' },
    forest: { nome: 'Forest', bg: '#0a1a0a', bgCard: '#1a2d1a', border: '#2a3d2a', text: '#d0f0d0', textSecondary: '#80b080', primary: '#22c55e', primaryLight: '#4ade80', fontMain: "'Inter',sans-serif", fontMono: "'JetBrains Mono',monospace", borderRadius: '10px', cardRadius: '14px', estiloHeader: 'minimal', logo: '' },
    galaxy: { nome: 'Galaxy', bg: '#0d0d1a', bgCard: '#1a1a35', border: '#2a2a50', text: '#e0d0ff', textSecondary: '#9080c0', primary: '#7c3aed', primaryLight: '#8b5cf6', fontMain: "'Poppins','Inter',sans-serif", fontMono: "'JetBrains Mono',monospace", borderRadius: '16px', cardRadius: '20px', estiloHeader: 'console', logo: '' },
    coffee: { nome: 'Coffee', bg: '#1a0f0a', bgCard: '#2d1f1a', border: '#3d2f2a', text: '#f0e0d0', textSecondary: '#b0a090', primary: '#92400e', primaryLight: '#b45309', fontMain: "'Nunito','Inter',sans-serif", fontMono: "'JetBrains Mono',monospace", borderRadius: '10px', cardRadius: '14px', estiloHeader: 'clean', logo: '' }
};

const LIMITES = {
    gratis: { links: 3, midia: 1, temas: 3, youtube: false, mp4: false, logo: false },
    pro: { links: 10, midia: 5, temas: 7, youtube: true, mp4: false, logo: true },
    premium: { links: 999, midia: 999, temas: 12, youtube: true, mp4: true, logo: true }
};

// ========== UPGRADE - LINKS DE PAGAMENTO ==========
let linksPagamentoUpgrade = { pro: '', premium: '' };

async function carregarLinksPagamentoUpgrade() {
    try {
        const snap = await db.collection('config').doc('planos').get();
        if (snap.exists) {
            const d = snap.data();
            if (d.pro) {
                linksPagamentoUpgrade.pro = d.pro.link || '';
                const precoEl = document.getElementById('preco-upgrade-pro');
                if (precoEl && d.pro.preco) precoEl.textContent = 'R$' + d.pro.preco;
            }
            if (d.premium) {
                linksPagamentoUpgrade.premium = d.premium.link || '';
                const precoEl = document.getElementById('preco-upgrade-premium');
                if (precoEl && d.premium.preco) precoEl.textContent = 'R$' + d.premium.preco;
            }
        }
    } catch(e) { console.error("Erro ao carregar links de pagamento:", e); }
}

function abrirModalUpgrade() {
    const modal = document.getElementById('modal-upgrade');
    if (modal) modal.classList.add('ativo');
}

function fecharModalUpgrade() {
    const modal = document.getElementById('modal-upgrade');
    if (modal) modal.classList.remove('ativo');
}

function escolherPlanoUpgrade(plano) {
    const link = linksPagamentoUpgrade[plano];
    if (link && link !== '') {
        window.open(link, '_blank');
        alert(`✅ Você será redirecionado para o pagamento do plano ${plano.toUpperCase()}\n\nApós o pagamento, entre em contato com o Super Admin para ativação.`);
        fecharModalUpgrade();
    } else {
        alert('⚠️ Link de pagamento não configurado. Entre em contato com o Super Admin.');
        fecharModalUpgrade();
    }
}

// ========== VER PERFIL PÚBLICO ==========
function verPerfilPublico() {
    const username = document.getElementById('perfil-username')?.value;
    if (username) {
        const baseURL = window.location.origin + window.location.pathname.replace('admin.html', 'index.html');
        window.open(baseURL + '?u=' + username, '_blank');
    }
}

function copiarLinkPerfil() {
    const linkEl = document.getElementById('perfil-link-preview');
    if (linkEl && linkEl.textContent) {
        navigator.clipboard.writeText(linkEl.textContent).then(() => {
            alert('✅ Link copiado! Compartilhe com seus seguidores.');
        });
    }
}

// ========== FUNÇÕES EXISTENTES ==========
function getTemasDisponiveis(plano) {
    const todosTemas = ['dev', 'clean', 'dark', 'rosa', 'minimal', 'warm', 'cyber', 'ocean', 'sunset', 'forest', 'galaxy', 'coffee'];
    return todosTemas.slice(0, LIMITES[plano]?.temas || 3);
}

function aplicarPreset(nome) {
    temaAtual = nome;
    document.querySelectorAll('.tema-preset').forEach(el => el.classList.remove('ativo'));
    const el = document.querySelector(`[data-tema="${nome}"]`);
    if (el) el.classList.add('ativo');
}

async function getPlanoAtual() {
    const userDoc = await db.collection('usuarios').doc(userUID).get();
    return userDoc.exists ? (userDoc.data().plano || 'gratis') : 'gratis';
}

async function verificarLimite(tipo) {
    const plano = await getPlanoAtual();
    const limite = LIMITES[plano][tipo];
    const snap = await db.collection('usuarios').doc(userUID).collection(tipo === 'midia' ? 'midia' : 'links').get();
    if (snap.size >= limite) {
        const nomes = { links: 'links', midia: 'mídias' };
        alert(`⚠️ Limite atingido! Seu plano (${plano}) permite até ${limite} ${nomes[tipo] || tipo}.\nFaça upgrade para liberar mais!`);
        return false;
    }
    return true;
}

async function carregarDadosAdmin() {
    if (!usuarioAtual) return;
    userUID = usuarioAtual.uid;
    
    document.getElementById('tela-login').classList.add('hidden');
    document.getElementById('tela-admin').classList.remove('hidden');
    
    // Carrega links de pagamento para upgrade
    await carregarLinksPagamentoUpgrade();
    
    // Configura botão de upgrade
    const btnUpgrade = document.getElementById('btn-upgrade');
    if (btnUpgrade) {
        btnUpgrade.onclick = (e) => {
            e.preventDefault();
            abrirModalUpgrade();
        };
    }
    
    const plano = await getPlanoAtual();
    const limites = LIMITES[plano];
    
    const badge = document.getElementById('plano-badge');
    if (badge) {
        badge.textContent = plano;
        badge.className = 'badge-plano badge-' + plano;
    }
    
    // Mostrar/esconder botão upgrade (só mostra se não for premium)
    if (btnUpgrade) {
        btnUpgrade.style.display = plano !== 'premium' ? 'inline-block' : 'none';
    }
    
    const campoTemaLogo = document.getElementById('tema-logo');
    if (campoTemaLogo) {
        if (!limites.logo) {
            campoTemaLogo.disabled = true;
            campoTemaLogo.placeholder = '🔒 Disponível nos planos Pro/Premium';
        } else {
            campoTemaLogo.disabled = false;
            campoTemaLogo.placeholder = 'https://... ou deixe vazio';
        }
    }
    
    const temasPermitidos = getTemasDisponiveis(plano);
    document.querySelectorAll('.tema-preset').forEach(el => {
        if (!temasPermitidos.includes(el.dataset.tema)) {
            el.style.opacity = '0.3';
            el.style.pointerEvents = 'none';
            el.title = '🔒 Upgrade necessário';
        } else {
            el.style.opacity = '1';
            el.style.pointerEvents = 'auto';
            el.title = '';
        }
    });
    
    const selectMidia = document.getElementById('midia-tipo');
    if (selectMidia) {
        const optYouTube = selectMidia.querySelector('option[value="youtube"]');
        const optMP4 = selectMidia.querySelector('option[value="mp4"]');
        if (optYouTube) optYouTube.disabled = !limites.youtube;
        if (optMP4) optMP4.disabled = !limites.mp4;
    }
    
    const userDoc = await db.collection('usuarios').doc(userUID).get();
    if (userDoc.exists) {
        const d = userDoc.data();
        document.getElementById('perfil-nome').value = d.perfil?.nome || '';
        document.getElementById('perfil-bio').value = d.perfil?.bio || '';
        document.getElementById('perfil-foto').value = d.perfil?.foto || '';
        
        // 🔗 MOSTRAR LINK DE DIVULGAÇÃO
        if (d.username) {
            const baseURL = window.location.origin + window.location.pathname.replace('admin.html', 'index.html');
            const link = baseURL + '?u=' + d.username;
            
            // Atualiza preview do link
            const previewEl = document.getElementById('perfil-link-preview');
            if (previewEl) previewEl.textContent = link;
            
            // Adiciona campo hidden para username usado no ver perfil
            if (!document.getElementById('perfil-username')) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.id = 'perfil-username';
                input.value = d.username;
                document.body.appendChild(input);
            } else {
                document.getElementById('perfil-username').value = d.username;
            }
            
            let divLink = document.getElementById('meu-link-admin');
            if (!divLink) {
                divLink = document.createElement('div');
                divLink.id = 'meu-link-admin';
                divLink.style.cssText = 'text-align:center;margin-bottom:16px;background:#161b22;border:1px solid #30363d;border-radius:12px;padding:14px;';
                const header = document.querySelector('.admin-header');
                if (header) header.insertAdjacentElement('afterend', divLink);
            }
            divLink.innerHTML = `
                <p style="font-size:11px;color:#8b949e;font-family:'JetBrains Mono',monospace;margin-bottom:6px;">🔗 Seu link público (copie e divulgue):</p>
                <div style="display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap;">
                    <code style="background:#0d1117;padding:8px 14px;border-radius:8px;font-size:12px;color:#a78bfa;">${link}</code>
                    <button onclick="copiarLinkPerfil()" style="background:#8b5cf6;color:#fff;border:none;padding:8px 14px;border-radius:8px;cursor:pointer;font-size:11px;">📋 Copiar</button>
                </div>
            `;
        }
    }
    
    const temaSnap = await db.collection('usuarios').doc(userUID).collection('config').doc('tema').get();
    if (temaSnap.exists) {
        const t = temaSnap.data();
        temaAtual = Object.keys(TEMAS).find(k => TEMAS[k].nome === t.nome) || 'dev';
        if (campoTemaLogo) campoTemaLogo.value = t.logo || '';
    }
    aplicarPreset(temaAtual);
    
    carregarListaLinks();
    carregarListaMidias();
}

async function salvarTema() {
    const plano = await getPlanoAtual();
    const temasPermitidos = getTemasDisponiveis(plano);
    
    if (!temasPermitidos.includes(temaAtual)) {
        alert('⚠️ Este tema não está disponível no seu plano atual.');
        return;
    }
    
    const tema = { ...TEMAS[temaAtual] };
    if (LIMITES[plano].logo) {
        tema.logo = document.getElementById('tema-logo').value.trim();
    } else {
        tema.logo = '';
    }
    
    await db.collection('usuarios').doc(userUID).collection('config').doc('tema').set(tema);
    mostrarSucesso('tema-sucesso');
}

async function salvarPerfil() {
    await db.collection('usuarios').doc(userUID).set({
        perfil: {
            nome: document.getElementById('perfil-nome').value.trim(),
            bio: document.getElementById('perfil-bio').value.trim(),
            foto: document.getElementById('perfil-foto').value.trim()
        }
    }, { merge: true });
    
    // Atualiza o link de perfil se username existir
    const userDoc = await db.collection('usuarios').doc(userUID).get();
    if (userDoc.exists && userDoc.data().username) {
        const baseURL = window.location.origin + window.location.pathname.replace('admin.html', 'index.html');
        const link = baseURL + '?u=' + userDoc.data().username;
        const previewEl = document.getElementById('perfil-link-preview');
        if (previewEl) previewEl.textContent = link;
    }
    
    mostrarSucesso('perfil-sucesso');
}

async function salvarLink() {
    if (!document.getElementById('link-id').value) {
        const pode = await verificarLimite('links');
        if (!pode) return;
    }
    
    const id = document.getElementById('link-id').value;
    const dados = {
        titulo: document.getElementById('link-titulo').value.trim(),
        url: document.getElementById('link-url').value.trim(),
        icone: document.getElementById('link-icone').value.trim() || '🔗',
        ordem: parseInt(document.getElementById('link-ordem').value) || 1
    };
    if (!dados.titulo || !dados.url) { alert('⚠️ Título e URL obrigatórios!'); return; }
    
    const ref = db.collection('usuarios').doc(userUID).collection('links');
    if (id) { await ref.doc(id).update(dados); }
    else { await ref.add(dados); }
    limparFormLink(); carregarListaLinks(); mostrarSucesso('link-sucesso');
}

async function carregarListaLinks() {
    const snap = await db.collection('usuarios').doc(userUID).collection('links').orderBy('ordem', 'asc').get();
    const lista = document.getElementById('lista-links');
    if (snap.empty) { lista.innerHTML = '<p style="color:#8b949e;font-size:12px;">Nenhum link cadastrado.</p>'; return; }
    lista.innerHTML = '';
    snap.forEach(doc => {
        const l = doc.data();
        const div = document.createElement('div'); div.className = 'list-item';
        div.innerHTML = `<div class="info"><strong>${l.icone||'🔗'} ${l.titulo}</strong><small>ordem: ${l.ordem||1} | ${(l.url||'').substring(0,50)}...</small></div><div class="actions"><button class="btn-small-lt" onclick="editarLink('${doc.id}')">✏️</button><button class="btn-danger-lt" onclick="removerLink('${doc.id}')">🗑</button></div>`;
        lista.appendChild(div);
    });
}

async function editarLink(id) {
    const doc = await db.collection('usuarios').doc(userUID).collection('links').doc(id).get();
    if (doc.exists) {
        const l = doc.data();
        document.getElementById('link-id').value = id;
        document.getElementById('link-titulo').value = l.titulo || '';
        document.getElementById('link-url').value = l.url || '';
        document.getElementById('link-icone').value = l.icone || '';
        document.getElementById('link-ordem').value = l.ordem || 1;
    }
}

async function removerLink(id) {
    if (confirm('Remover este link?')) {
        await db.collection('usuarios').doc(userUID).collection('links').doc(id).delete();
        carregarListaLinks();
    }
}

function limparFormLink() {
    ['link-id','link-titulo','link-url','link-icone'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('link-ordem').value = '1';
}

async function salvarMidia() {
    if (!document.getElementById('midia-id').value) {
        const pode = await verificarLimite('midia');
        if (!pode) return;
    }
    
    const tipo = document.getElementById('midia-tipo').value;
    const plano = await getPlanoAtual();
    const limites = LIMITES[plano];
    
    if (tipo === 'youtube' && !limites.youtube) { alert('⚠️ Vídeos do YouTube disponíveis apenas nos planos Pro e Premium.'); return; }
    if (tipo === 'mp4' && !limites.mp4) { alert('⚠️ Vídeos MP4 disponíveis apenas no plano Premium.'); return; }
    
    const id = document.getElementById('midia-id').value;
    const dados = { tipo: tipo, url: document.getElementById('midia-url').value.trim(), ordem: parseInt(document.getElementById('midia-ordem').value) || 1 };
    if (!dados.url) { alert('⚠️ URL obrigatória!'); return; }
    
    const ref = db.collection('usuarios').doc(userUID).collection('midia');
    if (id) { await ref.doc(id).update(dados); }
    else { await ref.add(dados); }
    limparFormMidia(); carregarListaMidias(); mostrarSucesso('midia-sucesso');
}

async function carregarListaMidias() {
    const snap = await db.collection('usuarios').doc(userUID).collection('midia').orderBy('ordem', 'asc').get();
    const lista = document.getElementById('lista-midias');
    if (snap.empty) { lista.innerHTML = '<p style="color:#8b949e;font-size:12px;">Nenhuma mídia cadastrada.</p>'; return; }
    lista.innerHTML = '';
    snap.forEach(doc => {
        const m = doc.data();
        const tipoEmoji = { imagem: '🖼️', youtube: '▶️', mp4: '🎥' };
        const div = document.createElement('div'); div.className = 'list-item';
        div.innerHTML = `<div class="info"><strong>${tipoEmoji[m.tipo]||'📁'} ${m.tipo}</strong><small>ordem: ${m.ordem||1} | ${(m.url||'').substring(0,40)}...</small></div><div class="actions"><button class="btn-small-lt" onclick="editarMidia('${doc.id}')">✏️</button><button class="btn-danger-lt" onclick="removerMidia('${doc.id}')">🗑</button></div>`;
        lista.appendChild(div);
    });
}

async function editarMidia(id) {
    const doc = await db.collection('usuarios').doc(userUID).collection('midia').doc(id).get();
    if (doc.exists) {
        const m = doc.data();
        document.getElementById('midia-id').value = id;
        document.getElementById('midia-tipo').value = m.tipo || 'imagem';
        document.getElementById('midia-url').value = m.url || '';
        document.getElementById('midia-ordem').value = m.ordem || 1;
    }
}

async function removerMidia(id) {
    if (confirm('Remover esta mídia?')) {
        await db.collection('usuarios').doc(userUID).collection('midia').doc(id).delete();
        carregarListaMidias();
    }
}

function limparFormMidia() {
    document.getElementById('midia-id').value = '';
    document.getElementById('midia-url').value = '';
    document.getElementById('midia-ordem').value = '1';
}

function mostrarSucesso(id) {
    const el = document.getElementById(id);
    if (el) { el.style.display = 'block'; setTimeout(() => el.style.display = 'none', 2000); }
}

function fazerLogin() {
    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-senha').value;
    const erro = document.getElementById('login-erro');
    if (!email || !senha) { erro.textContent = '⚠️ Preencha email e senha'; erro.style.display = 'block'; return; }
    auth.signInWithEmailAndPassword(email, senha).catch(() => {
        erro.textContent = '❌ Email ou senha incorretos'; erro.style.display = 'block';
    });
}

// ========== BOTÃO VER SITE (ADICIONADO) ==========
document.addEventListener('DOMContentLoaded', () => {
    const btnVerSite = document.getElementById('btn-ver-site');
    if (btnVerSite) {
        btnVerSite.addEventListener('click', () => {
            const linkPreview = document.getElementById('perfil-link-preview');
            if (linkPreview && linkPreview.textContent && linkPreview.textContent !== '') {
                window.open(linkPreview.textContent, '_blank');
            } else {
                alert('⚠️ Salve seu perfil primeiro para gerar o link!');
            }
        });
    }
});
