let usuarioAtual = null;

auth.onAuthStateChanged(async (user) => {
    usuarioAtual = user;
    const path = window.location.pathname;
    
    console.log("🔍 Auth State - Usuário:", user?.email, "Path:", path);
    
    // 🔥 DURANTE LIBERAÇÃO, NÃO FAZ NADA
    if (window.isLiberandoUsuario) {
        console.log("🚀 Processo de liberação ativo, ignorando...");
        return;
    }
    
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
        const SUPER_ADMIN_EMAIL = "Franciscodemelocurina9@gmail.com";
        const isSuperAdmin = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
        
        // Se for Super Admin e estiver tentando acessar admin.html, redireciona
        if (isSuperAdmin && (path.includes('admin.html') || path === '/' || path === '')) {
            console.log("👑 Super Admin detectado, redirecionando para super-admin.html");
            window.location.href = 'super-admin.html';
            return;
        }
        
        // Se for Super Admin e estiver no super-admin.html, deixa o próprio super-admin.html lidar
        if (isSuperAdmin && path.includes('super-admin.html')) {
            console.log("👑 Super Admin no super-admin.html - deixando o script dele agir");
            return;
        }
        
        // ========== ADMIN NORMAL ==========
        // Se estiver no admin.html, apenas recarrega a página (o próprio admin.html gerencia o login)
        if (path.includes('admin.html')) {
            console.log("📦 Admin normal no admin.html - página já está carregada");
            // O admin.html já tem seu próprio observador de autenticação
            // Só precisamos garantir que a página foi carregada
            return;
        }
        
        // ========== PÁGINA PÚBLICA (index.html) ==========
        if (path.includes('index.html') || path === '/' || path.includes('Divulgar-link-br')) {
            if (typeof carregarPaginaPublica === 'function') {
                carregarPaginaPublica();
            }
        }
    } else {
        console.log("🔴 Usuário não logado");
        
        // Se tentar acessar admin.html ou super-admin.html sem login
        if (path.includes('admin.html') || path.includes('super-admin.html')) {
            window.location.href = 'index.html';
            return;
        }
        
        // Página pública carrega normal
        if (typeof carregarPaginaPublica === 'function' && (path.includes('index.html') || path === '/' || path.includes('Divulgar-link-br'))) {
            carregarPaginaPublica();
        }
    }
});

function loginGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(() => {
            // Após login, verifica se é Super Admin
            const user = auth.currentUser;
            const SUPER_ADMIN_EMAIL = "Franciscodemelocurina9@gmail.com";
            if (user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
                window.location.href = 'super-admin.html';
            } else {
                window.location.href = 'admin.html';
            }
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
