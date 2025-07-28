const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 3000;

const PASSWORD = '8T0$D.bw?4II!$mRg29L.h?L$2X9!CYI.?rZhVD!TQGGDFQ$7.g??!yv?SmeI.Su!d$W6Ml';
const SESSION_SECRET = 'TiTYUb6r3E3O9aP8R8tTop93Lqq9ljL1RKAfo1j9ohz3VZYtfM';

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.get('/', (req, res) => {
    if (req.session.authenticated) {
        res.sendFile(path.join(__dirname, 'protected', 'index.html'));
    } else {
        res.redirect('/login');
    }
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/login', (req, res) => {
    const { password } = req.body;
    if (password === PASSWORD) {
        req.session.authenticated = true;
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

app.use('/static', express.static(path.join(__dirname, 'protected')));

app.listen(PORT, () => {
    console.log(`Running at http://localhost:${PORT}`);
});
