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
const game_controller_1 = require("./controllers/game.controller");
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000"
    },
});
app.use(cors());
app.use(express_1.default.json());
app.use(parser.urlencoded({ extended: false }));
app.use(parser.json());
app.get('/', (_, res) => res.json('Welcome to tictactoe API'));
io.on('connection', (socket) => {
    socket.on('join_game', (data) => (0, game_controller_1.gameLoaded)(Object.assign(Object.assign({}, data), { socket })));
    socket.on('disconnect', () => {
        console.log('Player disconnected');
    });
});
server.listen(process.env.PORT, () => {
    console.log(`Server started. Listening at port ${process.env.PORT}`);
});
