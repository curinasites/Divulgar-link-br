// ========== SUPER ADMIN ==========
const SUPER_ADMIN_EMAIL = "Franciscodemelocurina9@gmail.com"; // ⚠️ ALTERE PARA SEU EMAIL!

// Esconde tudo até verificar login
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.container').style.display = 'none';
});

// Verifica autenticação
auth.onAuthStateChanged(async (user) => {
    if (user && user.email === SUPER_ADMIN_EMAIL) {
        document.querySelector('.container').style.display = 'block';
        carregarSuperAdmin();
    } else if (user) {
        alert('⛔ Acesso negado! Apenas Super Admin.');
        auth.signOut();
        window.location.href = 'index.html';
    } else {
        // Não logado - mostra tela de aviso
        document.querySelector('.container').innerHTML = `
            <div style="max-width:400px;margin:80px auto;background:#161b22;border:1px solid #30363d;border-radius:20px;padding:36px;text-align:center;">
                <span style="font-size:48px;">👑</span>
                <h2 style="color:#f59e0b;margin-top:10px;">Super Admin</h2>
                <p style="color:#8b949e;font-size:12px;font-family:'JetBrains Mono',monospace;margin:8px 0 20px;">> acesso restrito</p>
                <p style="color:#8b949e;font-size:13px;">Faça login com o email autorizado para acessar o painel.</p>
                <a href="admin.html" style="display:inline-block;margin-top:16px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);color:#f59e0b;padding:10px 24px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;">🔐 Fazer Login</a>
                <br>
                <a href="index.html" style="color:#8b949e;font-size:12px;display:inline-block;margin-top:14px;text-decoration:none;">← Voltar ao site</a>
            </div>
        `;
        document.querySelector('.container').style.display = 'block';
    }
});

function logout() {
    auth.signOut();
    window.location.href = 'index.html';
}

async function carregarSuperAdmin() {
    const snap = await db.collection('usuarios').get();
    const usuarios = [];
    snap.forEach(doc => usuarios.push({ id: doc.id, ...doc.data() }));
    
    // Filtra apenas usuários ativos para estatísticas
    const ativos = usuarios.filter(u => u.status !== 'excluido');
    
    document.getElementById('stat-total').textContent = ativos.length;
    document.getElementById('stat-gratis').textContent = ativos.filter(u => u.plano === 'gratis').length;
    document.getElementById('stat-pro').textContent = ativos.filter(u => u.plano === 'pro').length;
    document.getElementById('stat-premium').textContent = ativos.filter(u => u.plano === 'premium').length;
    
    const tabela = document.getElementById('tabela-usuarios');
    tabela.innerHTML = usuarios.map(u => {
        const planoClass = u.plano === 'premium' ? 'badge-premium' : u.plano === 'pro' ? 'badge-pro' : 'badge-gratis';
        const status = u.status || 'ativo';
        const statusClass = status === 'bloqueado' ? 'badge-bloqueado' : 'badge-gratis';
        const isBloqueado = status === 'bloqueado';
        
        return `
            <tr style="${isBloqueado ? 'opacity:0.6;' : ''}">
                <td>${u.perfil?.nome || u.nome || '--'}</td>
                <td style="font-size:12px;color:#8b949e;">${u.email || '--'}</td>
                <td><span class="badge-plano ${planoClass}">${u.plano || 'gratis'}</span></td>
                <td><span class="badge-plano ${statusClass}">${status}</span></td>
                <td>
                    <select onchange="alterarPlano('${u.id}', this.value)" ${isBloqueado ? 'disabled' : ''}>
                        <option value="gratis" ${u.plano === 'gratis' ? 'selected' : ''}>🌱 Grátis</option>
                        <option value="pro" ${u.plano === 'pro' ? 'selected' : ''}>⭐ Pro</option>
                        <option value="premium" ${u.plano === 'premium' ? 'selected' : ''}>💎 Premium</option>
                    </select>
                </td>
                <td>
                    ${isBloqueado ? 
                        `<button class="btn-unblock" onclick="toggleBloqueio('${u.id}', 'bloqueado')">🔓 Desbloquear</button>` :
                        `<button class="btn-block" onclick="toggleBloqueio('${u.id}', 'ativo')">🔒 Bloquear</button>`
                    }
                </td>
            </tr>
        `;
    }).join('');
    
    carregarConfigPlanos();
}

async function alterarPlano(uid, novoPlano) {
    await db.collection('usuarios').doc(uid).update({ plano: novoPlano });
    mostrarSucesso('msg-sucesso');
    carregarSuperAdmin();
}

async function toggleBloqueio(uid, statusAtual) {
    const novoStatus = statusAtual === 'bloqueado' ? 'ativo' : 'bloqueado';
    const acao = novoStatus === 'bloqueado' ? 'BLOQUEAR' : 'DESBLOQUEAR';
    
    if (!confirm(`⚠️ Tem certeza que deseja ${acao} este usuário?`)) return;
    
    await db.collection('usuarios').doc(uid).update({ status: novoStatus });
    mostrarSucesso('msg-sucesso');
    carregarSuperAdmin();
}

function verDetalhes(uid) {
    alert('UID: ' + uid + '\nAcesse o Firebase Console para mais detalhes.');
}

// ========== CONFIG PLANOS ==========
async function carregarConfigPlanos() {
    const snap = await db.collection('config').doc('planos').get();
    if (snap.exists) {
        const d = snap.data();
        document.getElementById('config-preco-pro').value = d.pro?.preco || '10';
        document.getElementById('config-link-pro').value = d.pro?.link || '';
        document.getElementById('config-preco-premium').value = d.premium?.preco || '25';
        document.getElementById('config-link-premium').value = d.premium?.link || '';
    }
}

async function salvarConfigPlanos() {
    await db.collection('config').doc('planos').set({
        pro: {
            preco: document.getElementById('config-preco-pro').value.trim(),
            link: document.getElementById('config-link-pro').value.trim()
        },
        premium: {
            preco: document.getElementById('config-preco-premium').value.trim(),
            link: document.getElementById('config-link-premium').value.trim()
        }
    });
    mostrarSucesso('msg-planos-sucesso');
}

function mostrarSucesso(id) {
    const el = document.getElementById(id);
    if (el) { el.style.display = 'block'; setTimeout(() => el.style.display = 'none', 2000); }
}
