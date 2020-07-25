const express = require('express');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Configurações do front na pasta public e view em html
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Response http da index.html
app.use('', (req, res) => {
    res.render('index.html');
});

let messages = [];

// Conectando no socket
io.on('connection', socket => {
    console.log(`Socket connected: ${socket.id}`)

    // Emite mensagens antigas da variavel
    socket.emit('previousMessages', messages);

    // Ao executar evendo no front
    socket.on('sendMessage', data => {
        // Armazena dados na variavel
        messages.push(data);

        // Emite para todos conectados ao socket a mensagem recebida
        socket.broadcast.emit('receivedMessage', data);
    })
})

server.listen(3000);