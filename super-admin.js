// ========== SUPER ADMIN ==========
const SUPER_ADMIN_EMAIL = "Franciscodemelocurina9@gmail.com"; // ⚠️ ALTERE PARA SEU EMAIL!

// Verifica autenticação
auth.onAuthStateChanged(async (user) => {
    if (user && user.email === SUPER_ADMIN_EMAIL) {
        carregarSuperAdmin();
    } else if (user) {
        alert('⛔ Acesso negado! Apenas Super Admin.');
        auth.signOut();
    }
    // Se não estiver logado, a página mostra o login (se houver)
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