import { Server } from "Socket.IO";

let boardLength = "";
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
          boardLength = "";
          for (let i = 1; i <= roomNumber; i++) {
            //there is room in a room (from start to end of rooms map)
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
          boardsize: boardLength,
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
          boardsize: boardLength,
          playerTwoBoard: [],
          playerTwoShips: [],
          rematch: false
        });
      }

      //getting board size
      socket.on("board-size-update", (boardsize) => {
        boardLength = boardsize;
      });

      //setting board size for both users
      if (boardLength) {
        io.to(roomNumber).emit("board-set", boardLength);
      }

      //giving player info to player client
      socket.on("player-in-game", () => {
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

      //func to add user board and ships
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
      //get player boards and ships and send to func to save them
      socket.on("player-board", (player, board, ships) => {
        let currPlayer = players.find(obj => {
          return obj.playerId == player.id;
        })
        if (currPlayer.playerNumber == 1) {
          addBoardAndShips(currPlayer.playerOneBoard, currPlayer.playerOneShips, board, ships);
        } else {
          addBoardAndShips(currPlayer.playerTwoBoard, currPlayer.playerTwoShips, board, ships);
        }
      });

      //function to check if user hit/missed a ship and to tell opponent accordingly
      function hitOrMiss(
        opponentBoard,
        opponentShips,
        iCoord,
        jCoord,
        boardLength,
        player
      ) {
        let value;
        //ship hit
        if (opponentBoard[iCoord * boardLength + jCoord] != 0) {
          value = opponentBoard[iCoord * boardLength + jCoord];
          for (let i = 0; i < opponentShips.length; i++) {
            if (opponentShips[i].value == value) {

              if (opponentShips[i].length > 1) {
                opponentShips[i].length = opponentShips[i].length - 1;
              } else {
                // sunk ship  
                io.to(player.id).emit("sunk-ship");
                opponentShips.splice(i, 1);
                if (opponentShips.length == 0) {
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

      //get player and opponent and send to func to check hit/miss
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

      //set player ready to start game & check if opponent ready too
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

      //rematch, reset board,ships and ready value of player
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
        //check if other player also wants a rematch
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

      //disconnect - and tell opponent about the disconnection
      socket.on("disconnect", () => {
        let currentPlayer = players.find((player) => {
          return player.playerId == socket.id;
        });
        currentPlayer.ready= false;  
        socket.leave(roomNumber);
        players = players.filter((player) => {
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