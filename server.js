/* Socket Chat */
const express       = require('express');
const chat          = express();
const path          = require('path');
const server        = require('http').createServer(chat);
const io            = require('socket.io')(server);
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

// Ao acessar o endpoint localhost:3000 redireciona para a pasta chat 
chat.use(express.static(path.join(__dirname, 'public')));

const botName = 'Chat Bot'

// Conectando no socket
io.on('connection', socket => {

    //Entrar na sala
    socket.on('joinRoom', ({ username, room }) => {
        
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        // Boas vindas
        socket.emit('message', formatMessage(botName, 'Welcome to My Chat!'));
        // Notificação entrada
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`));    
    
        // Notiifica informações da sala
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });    
    });
   
    // Ao executar evendo no front emite mensagem
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, msg));
    })

    //Notificação Disconectar
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if(user){
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));
        
            // Notiifica informações da sala
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            }); 
        }
        
    });

})

server.listen(3000);