import Board from "./Board";
import React, { useState, useContext, useEffect } from "react";
import { AVAILABLE_SHIPS } from "./Ships";
import { SocketContext } from "../context/socketcontext";

let player = { id: "", roomNumber: "", playerNumber: -1, turn: false, score: 0 };
let shipsCounter = 0;
let placedShipValue = "A";
let shipLengthAndVal = [];
let opponentBoardHistory = [];
let stepCounter = 0;



function Game(props) {
  const [gameState, setGameState] = useState("game-init");
  const [shipSelected, setShipSelected] = useState({
    name: "",
    value: "",
    length: "",
  });
  const [rotation, setRotation] = useState("horizontal");
  const [availableShips, setAvailableShips] = useState(AVAILABLE_SHIPS);
  const [isWinner, setIsWinner] = useState();
  const [isPlayerOneTurn, setIsPlayerOneTurn] = useState(true);
  const [stepNum, setStepNum] = useState(0);
  const socketContext = useContext(SocketContext);
  let socket = socketContext.client_socket;

  const boardSize = +props.boardSize + 1;


  //save connected player
  socket.emit("player-in-game");
  socket.on("set-player", (playerId, playerRoom, playerNumber) => {
    player.id = playerId;
    player.roomNumber = playerRoom;
    player.playerNumber = playerNumber;
  });

  //starting board
  let startingBoard = [];
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      startingBoard.push("0");
    }
  }
  //boards maintains the state of all squares
  const [userBoard, setUserBoard] = useState(startingBoard);
  const [opponentBoard, setOpponentBoard] = useState(startingBoard);

  opponentBoardHistory[0] = startingBoard;

  //place ship horizontal
  const placeHorizontal = (i, j) => {
    if (j + shipSelected.length <= boardSize) {
      //check can position horizontal in board
      for (let k = 0; k < shipSelected.length; k++) {
        if (userBoard[i * boardSize + j + k] != "0") {
          return;
        }
      }
      let m = j;
      let newUserBoard = userBoard.slice();
      for (let k = 0; k < shipSelected.length; k++) {
        newUserBoard[i * boardSize + m + k] = placedShipValue;
      }
      setUserBoard(newUserBoard);
      setAvailableShips((prevValue) =>
        prevValue.filter((ship) => {
          return ship.name != shipSelected.name;
        })
      );
      shipsCounter++;
      shipLengthAndVal.push({ value: placedShipValue, length: shipSelected.length });

      setShipSelected({
        name: "",
        value: "",
        length: "",
      });
    }
  }

  //place ship vertical
  const placeVertical = (i, j) => {
    if (i + shipSelected.length <= boardSize) {
      //check can position vertical in board
      for (let k = 0; k < shipSelected.length; k++) {
        if (userBoard[(i + k) * boardSize + j] != "0") {
          return;
        }
      }
      let m = j;
      let newUserBoard = userBoard.slice();
      for (let k = 0; k < shipSelected.length; k++) {
        newUserBoard[(i + k) * boardSize + m] = placedShipValue;
      }
      shipLengthAndVal.push({ value: placedShipValue, length: shipSelected.length });
      setUserBoard(newUserBoard);
      setAvailableShips((prevValue) =>
        prevValue.filter((ship) => {
          return ship.name != shipSelected.name;
        })
      );
      shipsCounter++;
      setShipSelected({
        name: "",
        value: "",
        length: "",
      });
    }
  }
  //listener to user ship hit
  socket.off("user-ship-hit").on("user-ship-hit", (iCoord, jCoord) => {
    let newUserBoard = userBoard.slice();
    newUserBoard[iCoord * boardSize + jCoord] = "z"; //hit
    setUserBoard(newUserBoard);
  })

  //check if user hit or missed opponent's ships
  const checkHitOrMiss = (i, j) => {
    socket.emit("check-hit", i, j, boardSize, player);
    //if hit : h, if miss: m
    socket.off("missed-ship").on("missed-ship", () => {
      let newOpponentBoard = opponentBoard.slice();
      newOpponentBoard[i * boardSize + j] = "m"; //miss
      setOpponentBoard(newOpponentBoard);
      opponentBoardHistory[opponentBoardHistory.length] = newOpponentBoard;
      stepCounter++;
      setStepNum(stepCounter)
    })
    socket.off("hit-ship").on("hit-ship", () => {
      let newOpponentBoard = opponentBoard.slice();
      newOpponentBoard[i * boardSize + j] = "h"; //hit
      setOpponentBoard(newOpponentBoard);
      opponentBoardHistory[opponentBoardHistory.length] = newOpponentBoard;
      stepCounter++;
      setStepNum(stepCounter)
    });


    //sunk ship
    socket.off("sunk-ship").on("sunk-ship", () => {
      alert("Congrats! You have sunk an enemy ship! 🎉");
    })

    //swap user's turn
    let previousTurn;
    previousTurn = player.turn;
    player.turn = !previousTurn;
    setIsPlayerOneTurn((prevVal) => !prevVal);
  }

  useEffect(() => {
    //swap opponent's turn
    socket.on("swap-turns", () => {
      let previousTurn;
      previousTurn = player.turn;
      player.turn = !previousTurn;
      setIsPlayerOneTurn((prevVal) => !prevVal);
    });


    //on disconnection - let other player know.
    socket.once("other-player-disconnected", () => {
      alert("Your opponent has disconnected.\nRefresh game to play again.");
    });

    //game over
    socket.on("game-over", playerNumber => {
      if (player.playerNumber == playerNumber) {
        setGameState("over");
        setIsWinner(true);
        player.score++;
      } else if (player.playerNumber != playerNumber) {
        setGameState("over");
        setIsWinner(false);
      }
    })
  }, []);


  //a board is clicked
  const handleClick = (boardType, i, j) => {
    //board clicked is user's
    if (boardType == "userBoard") {
      //all ships are placed
      if (shipsCounter == 5) {
        return;
      }
      if (shipSelected.name != "") {
        if (rotation == "horizontal") {
          placeHorizontal(i, j);
        } else {
          placeVertical(i, j);
        }
        //increse value of placed ship to the next letter
        placedShipValue = String.fromCharCode(placedShipValue.charCodeAt() + 1);
      }
      //all ships placed
      if (shipsCounter == 5) {
        setGameState("ready");
      }

      //board clicked is opponent's
    } else if (boardType == "opponentBoard") {
      if (gameState == "start-game") {
        //so nothing happens when you press on a board thats not the current one
        if (player.turn) {
          //make sure user is in current board in order to try hit opponent
          if (stepNum == opponentBoardHistory.length - 1) {

            //use case - user clickes a square that he already clicked
            if (opponentBoard[i * boardSize + j] != "0") {
              alert("square has already been hit!");
              return;
            }
            checkHitOrMiss(i, j);
            //exchange turns between user and opponent
            socket.emit("exchange-turns", player);
            //user is in different board

          } else {
            alert("Please return to current step\n in order to continue playing")
          }
        }else{
          alert("Wait for your turn")
        }
      }
    }
  };

  //handle ship clicked
  const handleClickShip = (event) => {
    for (let i of availableShips) {
      if (i.name == event.target.name) {
        setShipSelected({
          name: i.name,
          value: i.value,
          length: i.length,
          placed: i.placed,
          horizontal: rotation,
        });
      }
    }
  };

  //handle rotaion pressed
  const rotateShips = () => {
    if (rotation == "horizontal") {
      setRotation("vertical");
    } else {
      setRotation("horizontal");
    }
  };

  //emit player ready. check if opponent ready too
  const playerReady = () => {
    setGameState("waiting");
    //send player board and ships placed
    socket.emit(
      "player-board",
      player,
      userBoard,
      shipLengthAndVal,
    );
    //send player ready
    socket.emit("player-ready", player);
    //both players ready
    socket.off("both-players-ready").on("both-players-ready", () => {
      //player one starts
      if (player.playerNumber == 1) {
        player.turn = true;
        setIsPlayerOneTurn(true);
      } else {
        setIsPlayerOneTurn(true);
        player.turn = false;
      }
      setGameState("start-game");
    });
  };

  //jump to earlier move
  const jumpTo = (step) => {
    stepCounter = step;
    setStepNum(stepCounter)
  };

  const moves = opponentBoardHistory.map((step, move) => {
    const desc = move ?
      `Show move #${move}` :
      'Show start #0';
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{desc}</button>
      </li>
    );
  });


  //use case- rematch case, reset all values except score 
  const handleRematch = () => {
    socket.emit("rematch", player);
    setGameState("rematch")
    socket.once("both-players-rematch", () => {
      shipsCounter = 0;
      placedShipValue = "A";
      shipLengthAndVal = [];
      setUserBoard(startingBoard);
      setOpponentBoard(startingBoard);
      opponentBoardHistory = [];
      opponentBoardHistory[0] = startingBoard;
      setStepNum(0);
      stepCounter = 0;
      setGameState("game-init");
      setRotation("horizontal");
      setAvailableShips(AVAILABLE_SHIPS);
      setIsWinner(false);
      setShipSelected({
        name: "",
        value: "",
        length: "",
      });
    })
  }
  return (
    <>
      <div className="heading-element">Waterbound Fighting Vessels
        <div className="score">Score: {player.score}
        </div>
      </div>
      <hr />
      <br />
      <div className="view">
        <div className="left-side">
          {gameState == "game-init" && (
            <>
              <h3>
                Select ship and place on board!
                <button className="top-bttn ship" onClick={rotateShips}>
                  Rotate ships
                </button>
              </h3>
            </>
          )}
          {gameState == "ready" && (
            <h3>
              Press when ready
              <button className="top-bttn ship" onClick={playerReady}>
                Ready
              </button>
            </h3>
          )}
          {gameState == "waiting" && <h3>Waiting for opponent ...</h3>}
          {gameState == "over" && (isWinner ? <h2>You win! 🎉🎉 <button className="top-bttn ship" onClick={handleRematch}>Rematch</button></h2> :
            <h2>Better luck next time <button className="top-bttn ship" onClick={handleRematch}>Rematch</button></h2>)}
          {gameState == "rematch" && <h3>Waiting for opponent ...</h3>}
          {gameState == "start-game" && <h3>My board</h3>}
          <div className="board-container">
            <Board
              onClick={(boardType, i, j) => handleClick(boardType, i, j)}
              gameState={gameState}
              boardSize={boardSize}
              boardState={userBoard}
              rotateShips={rotateShips}
              boardType={"userBoard"}
            />
          </div>
          <div className="shipsAvailable">
            {gameState == "game-init" &&
              availableShips.map((ship) => {
                return (
                  <div key={ship.name}>
                    <button
                      key={ship.name}
                      className="ship"
                      onClick={handleClickShip}
                      name={ship.name}
                    >
                      {ship.name} <br /> length:{ship.length} <br /> {rotation}
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
        <div className="middle-side">
          {gameState == "start-game" && player.playerNumber == 1 && (
            <h3 className="message">{isPlayerOneTurn ? "your turn!" : "opponents turn"}</h3>
          )}
          {gameState == "start-game" && player.playerNumber == 2 && (
            <h3 className="message">{!isPlayerOneTurn ? "your turn!" : "opponents turn"}</h3>
          )}
          <br />
          {gameState == "start-game" && <><h3 className="history">
            History</h3>
            <ol>
              {moves}
            </ol>
          </>
          }
        </div>

        <div className="right-side">
          {(gameState == "over" || gameState == "rematch") ? <h3>Opponent's board</h3> : <h3>Guess enemy's ship's placements!</h3>}
          <div className="board-container">
            <Board
              onClick={(boardType, i, j) => handleClick(boardType, i, j)}
              gameState={gameState}
              boardSize={boardSize}
              boardState={opponentBoardHistory[stepNum]}
              boardType={"opponentBoard"}
            />
          </div>
        </div>
      </div>
    </>
  );
}
export default Game;