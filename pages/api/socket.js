import { Server } from "Socket.IO";

let boardSet = "";
let players = [];


const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    let roomNumber = 1;
    let rooms = {};
    let room;
    io.on("connection", (socket) => {
      console.log("server connected");
      rooms = io.sockets.adapter.rooms;
      room = rooms.get(roomNumber);
      if (room && room.size > 1) {
        if (room.size === 2) {
          boardSet = "";
          for (let i = 1; i <= roomNumber; i++) {
            //there is room in a room from start to end of rooms array
            if (rooms.get(i) && rooms.get(i).size < 2) {
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
        players.push({
          playerId: socket.id,
          roomNumber,
          ready: false,
          playerNumber: 1,
          boardsize: boardSet,
          playerOneBoard: [],
          playerOneShips: [],
          rematch: false

        });
      } else {
        players.push({
          playerId: socket.id,
          roomNumber,
          ready: false,
          playerNumber: 2,
          boardsize: boardSet,
          playerTwoBoard: [],
          playerTwoShips: [],
          rematch: false
        });
      }

      //getting board size
      socket.on("board-size-update", (boardsize) => {
        boardSet = boardsize;
      });

      //setting board size for both users
      if (boardSet) {
        io.to(roomNumber).emit("board-set", boardSet);
      }
      //setting player info
      socket.on("player-in-game", () => {
        // give the socket id and player id to client
        let currentPlayer = players.find((player) => {
          return player.playerId == socket.id;
        });

        socket.emit(
          "set-player",
          currentPlayer.playerId,
          currentPlayer.roomNumber,
          currentPlayer.playerNumber
        );
      });

      function addBoardAndShips(userBoard, userShips, board, ships) {
        //add board
        for (let i = 0; i < board.length; i++) {
          for (let j = 0; j < board.length; j++) {
            userBoard.push(board[(i, j)]);
          }
        }
        //add ship
        for (let i = 0; i < ships.length; i++) {
          userShips.push(ships[i]);
        }
      }
      //set boards
      socket.on("player-board", (player, board, ships) => {
        let currPlayer = players.find(obj => {
          return obj.playerId == player.id;
        })
        //player number 1
        if (currPlayer.playerNumber == 1) {
          addBoardAndShips(currPlayer.playerOneBoard, currPlayer.playerOneShips, board, ships);
        } else {
          addBoardAndShips(currPlayer.playerTwoBoard, currPlayer.playerTwoShips, board, ships);
        }
      });

      function hitOrMiss(
        opponentBoard,
        OpponentShips,
        iCoord,
        jCoord,
        boardLength,
        player
      ) {
        let value;
        //ship hit
        if (opponentBoard[iCoord * boardLength + jCoord] != 0) {
          value = opponentBoard[iCoord * boardLength + jCoord];
          for (let i = 0; i < OpponentShips.length; i++) {
            if (OpponentShips[i].value == value) {

              if (OpponentShips[i].length > 1) {
                OpponentShips[i].length = OpponentShips[i].length - 1;
              } else {
                // sunk ship  
                io.to(player.id).emit("sunk-ship");
                OpponentShips.splice(i, 1);
                if (OpponentShips.length == 0) {
                  io.to(player.roomNumber).emit("game-over", player.playerNumber);
                }
              }
              io.to(player.id).emit("hit-ship");
              socket.to(player.roomNumber).emit("user-ship-hit", iCoord, jCoord);
            }
          }
        } else {
          //ship missed
          io.to(player.id).emit("missed-ship");
        }
      }

      socket.on("check-hit", (iCoord, jCoord, boardLength, player) => {
        let currPlayer = players.find(obj => {
          return obj.playerId == player.id;
        });
        let opponentPlayer = players.find(obj => {
          return obj.roomNumber == player.roomNumber && obj.playerId != player.id;
        });
        if (currPlayer.playerNumber == 1) {
          hitOrMiss(
            opponentPlayer.playerTwoBoard,
            opponentPlayer.playerTwoShips,
            iCoord,
            jCoord,
            boardLength,
            player
          );
        } else {
          hitOrMiss(
            opponentPlayer.playerOneBoard,
            opponentPlayer.playerOneShips,
            iCoord,
            jCoord,
            boardLength,
            player
          );
        }
      });

      //set player ready to start game & check if other player ready too
      socket.on("player-ready", (player) => {
        let currPlayer = players.find((obj) => {
          return obj.playerId == player.id;
        });
        currPlayer.ready = true;
        currPlayer.rematch = false;
        let findOtherPlayerInRoom = players.find((obj) => {
          return (
            obj.roomNumber == player.roomNumber && obj.playerId != player.id
          );
        });
        if (findOtherPlayerInRoom) {
          if (findOtherPlayerInRoom.ready == true) {
            findOtherPlayerInRoom.rematch = false;
            io.to(findOtherPlayerInRoom.roomNumber).emit("both-players-ready");
          }
        }
      });
      //swap turns
      socket.on("exchange-turns", (currPlayer) => {
        socket.to(currPlayer.roomNumber).emit("swap-turns");
      });

      //rematch
      socket.on("rematch", player => {
        let currPlayer = players.find(obj => {
          return obj.playerId == player.id;
        })
        currPlayer.rematch = true;
        currPlayer.ready = false;
        if (currPlayer.playerNumber == 1) {
          currPlayer.playerOneBoard = [];
          currPlayer.playerOneShips = [];
        } else {
          currPlayer.playerTwoBoard = [];
          currPlayer.playerTwoShips = [];
        }

        let otherPlayerInRoom = players.find((obj) => {
          return (
            obj.roomNumber == player.roomNumber && obj.playerId != player.id
          );
        });
        if (otherPlayerInRoom) {
          if (otherPlayerInRoom.rematch == true) {
            otherPlayerInRoom.ready = false;
            if (otherPlayerInRoom.playerNumber == 1) {
              otherPlayerInRoom.playerOneBoard = [];
              otherPlayerInRoom.playerOneShips = [];
            }else{
              otherPlayerInRoom.playerTwoBoard = [];
              otherPlayerInRoom.playerTwoShips = [];
            }
            io.to(otherPlayerInRoom.roomNumber).emit("both-players-rematch");
          }
        }
      })

      //disconnect - and tell player that remains that other player disconnected
      socket.on("disconnect", () => {
        let currentPlayer = players.find((player) => {
          return player.playerId == socket.id;
        });
        socket.leave(room);
        players.filter((player) => {
          return player.playerId != currentPlayer.playerId;
        });
        socket.to(currentPlayer.roomNumber).emit("other-player-disconnected");
        console.log(`player ${socket.id} disconnected.`);
      });
    });
  }
  res.end();
};

export default SocketHandler;