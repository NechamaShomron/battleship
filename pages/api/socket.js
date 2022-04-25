import { Server } from 'Socket.IO'

let boardSet = "";

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    let roomNum = 1;
    let rooms = {};

    io.on('connection', (socket) => {
      console.log("server connected");

      rooms = io.sockets.adapter.rooms;
      if (rooms.get(roomNum) && rooms.get(roomNum).size > 1) {
        if (rooms.get(roomNum).size === 2) {
          for (let i = 1; i <= roomNum; i++) {
            //there is room in a room from start to end of rooms array
            if (rooms.get(i).size < 2) {
              roomNum = i;
              break;
              //there isn't room
            } else {
              roomNum++;
              break;
            }
          }
        }
      }
      socket.join(roomNum);
      console.log(`player id: ${socket.id} is in room ${roomNum}`)

      socket.on('board-size-change', msg => {
        socket.broadcast.to(roomNum).emit('board-size', msg)
        boardSet = msg;
      })
      socket.on('board-size-req', msg => {
        socket.broadcast.emit('board-size-update', boardSet)
      })
      socket.on('disconnect', () => {
        console.log(`player ${socket.id} disconnected.`);
     });

    })

   
  }
  res.end()
}

export default SocketHandler;