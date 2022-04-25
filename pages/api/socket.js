import { Server } from 'Socket.IO'

let boardSet = "";

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    let roomNumber = 1;
    let rooms = {};

    io.on('connection', (socket) => {
      console.log("server connected");

      rooms = io.sockets.adapter.rooms;
      if (rooms.get(roomNumber) && rooms.get(roomNumber).size > 1) {
        if (rooms.get(roomNumber).size === 2) {
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

      socket.emit('player-room-number', roomNumber);

      //getting board size
      socket.on('board-size-change', (boardsize, roomNumber) => {
        socket.broadcast.to(roomNumber).emit('board-size', boardsize)
        boardSet = boardsize;
        socket.broadcast.emit("board-set", boardSet);
      })
      
      socket.on('disconnect', () => {
        console.log(`player ${socket.id} disconnected.`);
     });

    })

   
  }
  res.end()
}

export default SocketHandler;