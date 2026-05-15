let usuarioAtual = null;
const SUPER_ADMIN_EMAIL = "curina@gmail.com"; // 👈 TROQUE PELO SEU EMAIL

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
        
        if (path.includes('super-admin.html')) {
            if (user.email === SUPER_ADMIN_EMAIL) {
                carregarSuperAdmin();
            } else {
                alert('Acesso restrito ao Super Admin');
                window.location.href = 'index.html';
            }
        } else if (path.includes('admin.html')) {
            carregarDadosAdmin();
        } else if (path.includes('index.html') || path === '/') {
            carregarPaginaPublica();
        }
    } else {
        if (path.includes('admin.html') || path.includes('super-admin.html')) {
            window.location.href = 'cadastro.html';
        }
    }
});

function loginGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(() => alert('Erro ao fazer login com Google'));
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