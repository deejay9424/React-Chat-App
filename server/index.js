const express = require('express');
const socket = require('socket.io');
const http = require('http');
const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socket(server);

const PORT = process.env.PORT || 5000;

app.use(router);

io.on('connection', (socket) => {
    console.log(`We have a new connection!!`);

    socket.on('disconnect', () => {
        console.log(`User left`);
    });
})

server.listen(PORT, () => {
    console.log(`Server has started on port : ${PORT}`);
});