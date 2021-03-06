const express = require('express');
const socket = require('socket.io');
const http = require('http');
const router = require('./router');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socket(server);
const { addUser, removeUser, getUsers, getUsersInRoom } = require('./users');

const PORT = process.env.PORT || 5000;
app.use(cors);
app.use(router);

io.on('connection', (socket) => {

    console.log('New user joined')
    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room });

        if (error) return callback(error);

        socket.emit('message', { user: 'admin', text: `${user.name} welcome to the room ${user.room}` });
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });
        socket.join(user.room);

        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUsers(socket.id);
        if (user) {
            io.to(user.room).emit('message', { user: user.name, text: message });
            io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
        }
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user)
            io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left the conversation` });
    });
});

server.listen(PORT, () => {
    console.log(`Server has started on port : ${PORT}`);
});