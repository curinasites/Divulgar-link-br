let usuarioAtual = null;

auth.onAuthStateChanged(async (user) => {
    usuarioAtual = user;
    const path = window.location.pathname;
    
    if (user) {
        // Verifica se está bloqueado
        const userDoc = await db.collection('usuarios').doc(user.uid).get();
        if (userDoc.exists && userDoc.data().status === 'bloqueado') {
            alert('⛔ Sua conta foi bloqueada. Entre em contato com o suporte.');
            auth.signOut();
            window.location.href = 'index.html';
            return;
        }
        
        // Admin normal
        if (path.includes('admin.html')) {
            if (typeof carregarDadosAdmin === 'function') carregarDadosAdmin();
        }
        
        // Página pública
        if (path.includes('index.html') || path === '/' || path.includes('Divulgar-link-br')) {
            if (typeof carregarPaginaPublica === 'function') carregarPaginaPublica();
        }
    } else {
        // Se não estiver logado e tentar acessar admin, redireciona para cadastro
        if (path.includes('admin.html')) {
            window.location.href = 'cadastro.html';
            return;
        }
        // Página pública carrega normal
        if (typeof carregarPaginaPublica === 'function') carregarPaginaPublica();
    }
});

function loginGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then(() => {
        window.location.href = 'admin.html';
    }).catch(() => alert('Erro ao fazer login com Google'));
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
