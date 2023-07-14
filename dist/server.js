"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require('dotenv').config();
const app = (0, express_1.default)();
const cors = require('cors');
const parser = require('body-parser');
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const events_1 = require("./events");
const io = new Server(server, {
    cors: {
        origins: [process.env.APP_URL]
    },
});
app.use(cors());
app.use(express_1.default.json());
app.use(parser.urlencoded({ extended: false }));
app.use(parser.json());
app.get('/', (_, res) => res.json('Welcome to tictactoe API'));
let rooms = [];
io.on('connection', (socket) => {
    console.log(`User connected with ID: ${socket.id}`);
    (0, events_1.removeEmptyRoom)(rooms);
    socket.on('join', ({ username, room }) => {
        rooms = (0, events_1.playerJoined)(socket, username, room, rooms);
        rooms = (0, events_1.playerDisconnected)(socket, room, rooms);
        socket.on('move', (data) => socket.to(room).emit('move', data));
        socket.on('change_player', (data) => socket.to(room).emit('change_player', data));
        socket.on('draw', (data) => socket.to(room).emit('draw', data));
        socket.on('reset', () => socket.to(room).emit('reset'));
    });
});
server.listen(process.env.PORT, () => {
    console.log(`Server started. Listening at port ${process.env.PORT}`);
});
