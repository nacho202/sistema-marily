const express = require('express');

const router = express.Router();

function getAuthConfig() {
  const username = process.env.ADMIN_USER || 'vivero';
  const password = process.env.ADMIN_PASS;

  if (process.env.NODE_ENV === 'production' && !password) {
    throw new Error('Falta configurar ADMIN_PASS en producción');
  }

  // En desarrollo permitimos una clave por defecto para facilidad.
  const effectivePassword = password || 'Vivero2026!';
  return { username, password: effectivePassword };
}

router.get('/login', (req, res) => {
  if (req.session?.auth?.loggedIn) return res.redirect('/');
  res.status(200).render('auth/login', { error: null });
});

router.post('/login', (req, res) => {
  const { username, password } = getAuthConfig();
  const inputUser = String(req.body?.username || '');
  const inputPass = String(req.body?.password || '');

  if (inputUser === username && inputPass === password) {
    req.session.auth = { loggedIn: true, username };
    const nextUrl = typeof req.query?.next === 'string' ? req.query.next : '/';
    return res.redirect(nextUrl);
  }

  return res.status(401).render('auth/login', { error: 'Usuario o contraseña incorrectos.' });
});

router.post('/logout', (req, res) => {
  req.session?.destroy(() => {
    res.clearCookie('sistema_marily_sid');
    res.redirect('/login');
  });
});

module.exports = router;

