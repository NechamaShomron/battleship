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
    let turn;
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

      //players array of objects holds all players
      if (io.sockets.adapter.rooms.get(roomNumber).size == 1) {
        players.push({ playerId: socket.id, roomNumber, ready: false, playerNumber: 1 });
      }
      else {
        players.push({ playerId: socket.id, roomNumber, ready: false, playerNumber: 2 });
      }

      //getting board size
      socket.on('board-size-update', (boardsize) => {
        boardSet = boardsize;
      })

      //setting board size for both users
      if (boardSet) {
        socket.emit('board-set', boardSet);
      }
      socket.on("player-in-game", () => {
        // give the socket id and player id to client
        let currentPlayer = players.find(player =>{
          return player.playerId == socket.id;
        })
        socket.emit('set-player', currentPlayer.playerId, currentPlayer.roomNumber, currentPlayer.playerNumber);
      })

      socket.on('player-ready', player => {
        let currPlayer = players.find((obj) => {
          return obj.playerId == player.id;
        })
        currPlayer.ready = true;
        let findOtherPlayerInRoom = players.find(obj => {
          return obj.roomNumber == player.roomNumber && obj.playerId != player.id;
        });
        if (findOtherPlayerInRoom) {
            if(findOtherPlayerInRoom.ready == true){
            io.to(findOtherPlayerInRoom.roomNumber).emit("both-players-ready");
            }
        }

      })

      socket.on('disconnect', () => {
        console.log(`player ${socket.id} disconnected.`);
      });
    })
  }
  res.end()
}

export default SocketHandler;