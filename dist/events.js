"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playerDisconnected = exports.playerJoined = exports.removeEmptyRoom = void 0;
const removeEmptyRoom = (rooms) => {
    return rooms.filter(r => r.users.length > 0);
};
exports.removeEmptyRoom = removeEmptyRoom;
const playerJoined = (socket, username, room, rooms) => {
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
        socket.join(room);
        socket.emit('joined', true);
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
    return rooms;
};
exports.playerJoined = playerJoined;
const playerDisconnected = (socket, room, rooms) => {
    socket.on('disconnect', () => {
        var _a;
        const userRoom = rooms.find(r => r.users.find(u => u.id === socket.id));
        const disconnnectedUser = userRoom === null || userRoom === void 0 ? void 0 : userRoom.users.find(u => u.id === socket.id);
        if (userRoom && (userRoom === null || userRoom === void 0 ? void 0 : userRoom.users.length) <= 1) {
            rooms = rooms.filter(r => r.room_id === (userRoom === null || userRoom === void 0 ? void 0 : userRoom.room_id));
        }
        else {
            const index = rooms.findIndex(r => r.users.find(u => u.id === socket.id));
            if (index > -1) {
                const users = (_a = userRoom === null || userRoom === void 0 ? void 0 : userRoom.users.filter(u => u.id !== socket.id)) !== null && _a !== void 0 ? _a : [];
                rooms[index] = Object.assign(Object.assign({}, rooms[index]), { users });
            }
            socket.to(room).emit('player_disconnected', disconnnectedUser === null || disconnnectedUser === void 0 ? void 0 : disconnnectedUser.username);
        }
        return rooms;
    });
    return rooms;
};
exports.playerDisconnected = playerDisconnected;
