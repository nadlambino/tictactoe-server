"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameLoaded = void 0;
const gameLoaded = (game) => {
    const { socket } = game;
    socket.join(game.room);
    socket.to(game.room).emit('joined_game', {
        username: game.username,
        state: 'joined'
    });
    console.log(`Player has joined the room ${game.room}`);
};
exports.gameLoaded = gameLoaded;
