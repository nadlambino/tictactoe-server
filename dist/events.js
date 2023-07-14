"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onConnect = void 0;
let rooms = [];
const onConnect = (io) => {
    io.on('connection', (socket) => {
        console.log(`User connected with ID: ${socket.id}`);
        removeEmptyRoom();
        socket.on('join', ({ username, room }) => {
            playerJoined(socket, username, room);
            socket.on('move', (data) => socket.to(room).emit('move', data));
            socket.on('change_player', (data) => socket.to(room).emit('change_player', data));
            socket.on('draw', (data) => socket.to(room).emit('draw', data));
            socket.on('reset', () => socket.to(room).emit('reset'));
            playerDisconnected(socket, room);
        });
    });
};
exports.onConnect = onConnect;
const removeEmptyRoom = () => {
    rooms = rooms.filter(r => r.users.length > 0);
};
const playerJoined = (socket, username, room) => __awaiter(void 0, void 0, void 0, function* () {
    const r = rooms.find(r => r.room_id === room);
    let hasJoined = false;
    let users = [];
    if (r === undefined) {
        users = [{ id: socket.id, username }];
        hasJoined = true;
    }
    else if (r && r.users.length < 2) {
        const u = r.users;
        u.push({ id: socket.id, username });
        users = u;
        hasJoined = true;
    }
    else {
        hasJoined = false;
    }
    if (hasJoined) {
        yield socket.join(room);
        console.log(room);
        socket.emit('joined', true, username);
        const roomIndex = rooms.findIndex(r => r.room_id === room);
        if (roomIndex > -1) {
            rooms[roomIndex] = {
                room_id: room,
                users
            };
        }
        else {
            rooms.push({
                room_id: room,
                users
            });
        }
    }
    else {
        socket.emit('joined', false);
    }
});
const playerDisconnected = (socket, room) => {
    socket.on('disconnect', () => {
        var _a;
        const userRoom = rooms.find(r => r.users.find(u => u.id === socket.id));
        const disconnnectedUser = userRoom === null || userRoom === void 0 ? void 0 : userRoom.users.find(u => u.id === socket.id);
        if (userRoom && (userRoom === null || userRoom === void 0 ? void 0 : userRoom.users.length) <= 1) {
            rooms = rooms.filter(r => r.room_id !== (userRoom === null || userRoom === void 0 ? void 0 : userRoom.room_id));
        }
        else {
            const index = rooms.findIndex(r => r.users.find(u => u.id === socket.id));
            if (index > -1) {
                const users = (_a = userRoom === null || userRoom === void 0 ? void 0 : userRoom.users.filter(u => u.id !== socket.id)) !== null && _a !== void 0 ? _a : [];
                rooms[index] = Object.assign(Object.assign({}, rooms[index]), { users });
            }
            socket.to(room).emit('player_disconnected', disconnnectedUser === null || disconnnectedUser === void 0 ? void 0 : disconnnectedUser.username);
        }
    });
};
