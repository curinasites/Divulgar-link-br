let usuarioAtual = null;

auth.onAuthStateChanged(async (user) => {
    usuarioAtual = user;
    const path = window.location.pathname;
    
    console.log("🔍 Auth State - Usuário:", user?.email, "Path:", path);
    
    if (user) {
        // Verifica se está bloqueado
        try {
            const userDoc = await db.collection('usuarios').doc(user.uid).get();
            if (userDoc.exists && userDoc.data().status === 'bloqueado') {
                alert('⛔ Sua conta foi bloqueada. Entre em contato com o suporte.');
                await auth.signOut();
                window.location.href = 'index.html';
                return;
            }
        } catch(e) { console.error("Erro ao verificar bloqueio:", e); }
        
        // ========== SUPER ADMIN ==========
        // Verifica se é Super Admin (email específico)
        const SUPER_ADMIN_EMAIL = "Franciscodemelocurina9@gmail.com";
        const isSuperAdmin = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
        
        if (isSuperAdmin && path.includes('admin.html')) {
            // Super Admin tentando acessar admin.html -> redireciona para super-admin.html
            window.location.href = 'super-admin.html';
            return;
        }
        
        // ========== ADMIN NORMAL ==========
        if (path.includes('admin.html')) {
            if (typeof carregarDadosAdmin === 'function') {
                carregarDadosAdmin();
            }
        }
        
        // ========== SUPER ADMIN NO SUPER-ADMIN.HTML ==========
        if (path.includes('super-admin.html')) {
            if (!isSuperAdmin) {
                alert('⛔ Acesso negado! Apenas Super Admin.');
                await auth.signOut();
                window.location.href = 'index.html';
                return;
            }
            // Se chegou aqui, é Super Admin - já carrega no próprio super-admin.html
        }
        
        // ========== PÁGINA PÚBLICA (index.html) ==========
        if (path.includes('index.html') || path === '/' || path.includes('Divulgar-link-br')) {
            if (typeof carregarPaginaPublica === 'function') {
                carregarPaginaPublica();
            }
        }
    } else {
        // ========== USUÁRIO NÃO LOGADO ==========
        console.log("🔴 Usuário não logado");
        
        // Se tentar acessar admin.html ou super-admin.html sem login
        if (path.includes('admin.html')) {
            // Redireciona para index.html (que tem o formulário de login)
            window.location.href = 'index.html';
            return;
        }
        
        if (path.includes('super-admin.html')) {
            window.location.href = 'index.html';
            return;
        }
        
        // Página pública carrega normal (index.html, cadastro.html, etc)
        if (typeof carregarPaginaPublica === 'function' && (path.includes('index.html') || path === '/' || path.includes('Divulgar-link-br'))) {
            carregarPaginaPublica();
        }
    }
});

function loginGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(() => {
            window.location.href = 'admin.html';
        })
        .catch((error) => {
            console.error("Erro Google:", error);
            alert('Erro ao fazer login com Google');
        });
}

function loginEmail(email, senha) {
    return auth.signInWithEmailAndPassword(email, senha);
}

function cadastrarEmail(email, senha) {
    return auth.createUserWithEmailAndPassword(email, senha);
}

function logout() {
    auth.signOut();
    window.location.href = 'index.html';
}

function getLimitesPlano(plano) {
    const limites = {
        gratis: { links: 5, midia: 2 },
        pro: { links: 20, midia: 10 },
        premium: { links: 999, midia: 999 }
    };
    return limites[plano] || limites.gratis;
}
