import { Socket } from "socket.io"

export interface GameLoad {
  username: string,
  room: string,
  type: 'create' | 'join',
  socket: Socket
}

export const gameLoaded = (game: GameLoad) => {
  const { socket } = game
  socket.join(game.room)

  socket.to(game.room).emit('joined_game', {
    username: game.username,
    state: 'joined'
  })
  
  console.log(`Player has joined the room ${game.room}`)
}
