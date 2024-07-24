const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(express.urlencoded({ extended: true }));

// Configurar Sequelize para se conectar ao SQL Server
const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'server',
    dialect: 'mssql',
    dialectOptions: {
        options: {
            encrypt: true,
        }
    }
});

// Definir o modelo User
const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    recovery_key: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

// Sincronizar o modelo com o banco de dados
sequelize.sync();

// Rota para exibir o formulário de registro
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/register.html');
});

// Rota para processar o formulário de registro
app.post('/register', [
    body('username').notEmpty().withMessage('Username é obrigatório'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
    body('confirm_password').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Confirmação de senha não coincide com a senha');
        }
        return true;
    }),
    body('captcha').equals('12AB34').withMessage('CAPTCHA incorreto')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, recovery_key } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            recovery_key
        });
        res.redirect('/success');
    } catch (error) {
        res.status(500).json({ error: 'Erro ao registrar o usuário' });
    }
});

// Rota de sucesso
app.get('/success', (req, res) => {
    res.send('Registro bem-sucedido!');
});

// Iniciar o servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});


const axios = require('axios');

// Rota para processar o formulário de registro
app.post('/register', [
    body('username').notEmpty().withMessage('Username é obrigatório'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
    body('confirm_password').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Confirmação de senha não coincide com a senha');
        }
        return true;
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, recovery_key, 'g-recaptcha-response': recaptchaResponse } = req.body;

    // Verificar reCAPTCHA
    const recaptchaSecret = 'your_secret_key';
    const recaptchaVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaResponse}`;

    try {
        const recaptchaResponse = await axios.post(recaptchaVerifyUrl);
        if (!recaptchaResponse.data.success) {
            return res.status(400).json({ error: 'Falha na verificação do reCAPTCHA' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            recovery_key
        });
        res.redirect('/success');
    } catch (error) {
        res.status(500).json({ error: 'Erro ao registrar o usuário' });
    }
});
