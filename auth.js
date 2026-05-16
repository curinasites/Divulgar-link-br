let usuarioAtual = null;

auth.onAuthStateChanged(async (user) => {
    usuarioAtual = user;
    const path = window.location.pathname;
    
    if (window.isLiberandoUsuario) return;
    
    if (user) {
        try {
            const userDoc = await db.collection('usuarios').doc(user.uid).get();
            if (userDoc.exists && userDoc.data().status === 'bloqueado') {
                alert('⛔ Sua conta foi bloqueada.');
                await auth.signOut();
                window.location.href = 'index.html';
                return;
            }
        } catch(e) {}
        
        const SUPER_ADMIN_EMAIL = "Franciscodemelocurina9@gmail.com";
        const isSuperAdmin = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
        
        if (isSuperAdmin && !path.includes('super-admin.html')) {
            window.location.href = 'super-admin.html';
            return;
        }
        
        if (isSuperAdmin && path.includes('super-admin.html')) {
            return;
        }
        
        // Admin normal - não faz nada, deixa o admin.html gerenciar
        if (path.includes('admin.html')) {
            return;
        }
        
        if (path.includes('index.html') || path === '/' || path.includes('Divulgar-link-br')) {
            if (typeof carregarPaginaPublica === 'function') carregarPaginaPublica();
        }
    } else {
        if (path.includes('admin.html') || path.includes('super-admin.html')) {
            window.location.href = 'index.html';
            return;
        }
        if (typeof carregarPaginaPublica === 'function') carregarPaginaPublica();
    }
});

function loginGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then(() => {
        const user = auth.currentUser;
        window.location.href = user?.email?.toLowerCase() === 'franciscodemelocurina9@gmail.com' ? 'super-admin.html' : 'admin.html';
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
    const limites = { gratis: { links: 5, midia: 2 }, pro: { links: 20, midia: 10 }, premium: { links: 999, midia: 999 } };
    return limites[plano] || limites.gratis;
}
