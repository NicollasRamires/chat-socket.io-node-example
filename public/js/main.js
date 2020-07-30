const chatForm = document.getElementById('chat-form'); 
const chatMessages = document.querySelector('.chat-messages');
//const socket = io.connect('http://localhost:3000');
const socket = io.connect();
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//Pegar o nome e sala pela URL
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

// Entrar na Sala
socket.emit('joinRoom', {username, room});

// Pegar sala e usuários
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

// Mensagem do server
socket.on('message', message => {
    outputMessage(message);

    //Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Envio de Mensagem
chatForm.addEventListener('submit', e => {
    e.preventDefault();

    // Pega texto
    const msg = e.target.elements.msg.value;
    
    // Envia mensagem para o server
    socket.emit('chatMessage', msg);

    //limpa o input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// Printa msg na View (HTML)
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta"> ${message.username} <span> ${message.time} </span></p>
    <p class="text"> 
        ${message.text}
    </p>`;

    document.querySelector('.chat-messages').appendChild(div);
}

// Adiciona o nome da Sala
function outputRoomName(room){
    roomName.innerText = room;
}

// Mosta lista de usuários conectados
function outputUsers(users){
    userList.innerHTML = ` ${users.map(user => `<li>${user.username}</li>`).join('')} `;
}