import { Server } from 'Socket.IO'

let boardSet = "";
let players = [];

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    let roomNumber = 1;
    let rooms = {};
    let room;
    io.on('connection', (socket) => {
      console.log("server connected");
      rooms = io.sockets.adapter.rooms;
      room = rooms.get(roomNumber);
      if (room && room.size > 1) {
        if (room.size === 2) {
          boardSet = '';
          for (let i = 1; i <= roomNumber; i++) {
            //there is room in a room from start to end of rooms array
            if (rooms.get(i).size < 2) {
              roomNumber = i;
              break;
              //there isn't room
            } else {
              roomNumber++;
              break;
            }
          }
        }
      }
      socket.join(roomNumber);
      console.log(`player id: ${socket.id} is in room ${roomNumber}`)
      
      //players array of objects holds all players
      players.push({playerId: socket.id, roomNumber}); 

      //getting board size
      socket.on('board-size-update', (boardsize) => {
        boardSet = boardsize;
      })

      //setting board size for both users
      if (boardSet) {
        socket.emit('board-set', boardSet);
      }

      // give the socket id and player id to client
      socket.emit('player', socket.id, roomNumber);

      socket.on('disconnect', () => {
        console.log(`player ${socket.id} disconnected.`);
      });
    })
  }
  res.end()
}

export default SocketHandler;