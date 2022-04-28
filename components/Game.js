import Board from "./Board";
import React, { useState, useContext, useEffect } from "react";
import { AVAILABLE_SHIPS } from "./Ships";
import { SocketContext } from '../context/socketcontext';

let player = { id: "", roomNumber: "", playerNumber: -1, turn:false };

function Game(props) {
  const [gameState, setGameState] = useState("game-init");
  const [shipSelected, setShipSelected] = useState({
    name: "",
    value: "",
    length: "",
  });
  const [rotation, setRotation] = useState("horizontal");
  const [availableShips, setAvailableShips] = useState(AVAILABLE_SHIPS);
  const [countShipsPlaced, setCountShipsPlaced] = useState(0);
  const [status, setStatus] = useState("");
  const [isPlayerOneTurn, setIsPlayerOneTurn] = useState(true)

  const socketContext = useContext(SocketContext);
  let socket = socketContext.client_socket;

  const boardSize = +props.boardSize + 1;

  socket.emit("player-in-game");
  socket.on('set-player', (playerId, playerRoom, playerNumber) => {
    player.id = playerId;
    player.roomNumber = playerRoom;
    player.playerNumber = playerNumber;
  })



  let startingBoard = [];
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      startingBoard.push("0");
    }
  }
  //board maintains the state of all squares
  const [userBoard, setUserBoard] = useState(
    startingBoard);
  const [enemyBoard, setEnemyBoard] = useState(
    startingBoard);

  function placeHorizontal(i, j) {
    if (j + shipSelected.length <= boardSize) {
      //check can position horizontal
      for (let k = 0; k < shipSelected.length; k++) {
        if (userBoard[i * boardSize + j + k] != "0") {
          return;
        }
      }
      let m = j;
      let newUserBoard = userBoard.slice();
      for (let k = 0; k < shipSelected.length; k++) {
        newUserBoard[(i * boardSize + m + k)] = "x";
      }
      setCountShipsPlaced(countShipsPlaced + 1);
      setUserBoard(newUserBoard);
      setShipSelected({
        name: "",
        value: "",
        length: "",
      })
    }
  }
  function placeVertical(i, j) {
    if (i + shipSelected.length <= boardSize) {
      //check can position vertical
      for (let k = 0; k < shipSelected.length; k++) {
        if (userBoard[(i + k) * boardSize + j] != "0") {
          return;
        }
      }
      let m = j;
      let newUserBoard = userBoard.slice();
      for (let k = 0; k < shipSelected.length; k++) {
        newUserBoard[((i + k) * boardSize + m)] = "x";
      }
      setCountShipsPlaced(countShipsPlaced + 1);
      setUserBoard(newUserBoard);
      setShipSelected({
        name: "",
        value: "",
        length: "",
      })
    }
  }

  function checkHitOrMiss(i, j) {
    let previousTurn;
    let newEnemyBoard = enemyBoard.slice();
    newEnemyBoard[(i * boardSize + j)] = "x";
    setEnemyBoard(newEnemyBoard);

    //exchange curr player turn 
    previousTurn = player.turn;
    player.turn = !previousTurn;


  }
  socket.on("swap-turns", ()=>{
  
    //swap other user turn
    let previousTurn;
    previousTurn = player.turn;
    player.turn = !previousTurn;
          setIsPlayerOneTurn(prevVal => (
            !prevVal
    ))
    console.log("other player: " + player.turn)
    
})

  const handleClick = (boardType, i, j) => {
    if (boardType == "userBoard") {
      if (rotation == "horizontal")
        placeHorizontal(i, j);
      else {
        placeVertical(i, j);
      }
      if (countShipsPlaced == 4) {
        setGameState('ready')
      }
    } else if (boardType == "enemyBoard") {
      if (gameState == 'start-game') {
        console.log("player number: " + player.playerNumber + " playe turn: " +player.turn)

        if(player.turn){
          checkHitOrMiss(i, j)
          console.log(i, j)
          socket.emit("exchange-turns", player);;

        
      }
    }
  };
}
  const handleClickShip = (event) => {
    for (let i of availableShips) {
      if (i.name == event.target.name) {
        setShipSelected({
          name: i.name,
          value: i.value,
          length: i.length,
          placed: i.placed,
          horizontal: rotation
        });
      }
    }
    setAvailableShips((prevValue) => (
      prevValue.filter(ship => {
        return ship.name != event.target.name;
      })
    ))
    event.preventDefault();
  };
  const rotateShips = () => {
    if (rotation == "horizontal") {
      setRotation("vertical");
    }
    else {
      setRotation("horizontal");
    }
  }
  const playerReady = () => {
    setGameState("waiting");
    socket.emit("player-ready",player);
    socket.on("both-players-ready", ()=>{
      console.log(player)
      //player 1 starts
      if(player.playerNumber == 1){
        player.turn = true;
        setIsPlayerOneTurn(true);
        console.log("wello")
      }else{
        player.turn = false;
        setIsPlayerOneTurn(false);
      }
      setGameState('start-game');
    })

  }
  return (
    <>
      <h1>Waterbound Fighting Vessels</h1>
      <hr />
      <br />
      <div className="hold-boards">
        <div className="left-side">
          <h2>My board!</h2>
          {gameState == 'game-init' && <><h3>Select ship and place on board!
            <button className="rotate-bttn ship" onClick={rotateShips}>Rotate ships</button></h3></>}
          {gameState == "ready" && <h3>Press when ready<button className="rotate-bttn ship" onClick={playerReady}>Ready</button></h3>}
          {gameState == 'waiting' && <h3>Waiting for opponent ...</h3>}
          {gameState == "start-game" && <h3>{isPlayerOneTurn ? 'your turn!' : 'opponents turn'}</h3>}
          <div className="flex-container">
            <Board
              onClick={(boardType, i, j) =>
                handleClick(boardType, i, j)
              }
              gameState={gameState}
              boardSize={boardSize}
              boardState={userBoard}
              rotateShips={rotateShips}
              boardType={"userBoard"}

            /></div>
          {gameState == "game-init" &&
            availableShips.map((ship) => {
              return (
                <div className="shipsAvailable" key={ship.name}>
                  <button
                    key={ship.name}
                    className="ship-center ship"
                    onClick={handleClickShip}
                    name={ship.name}
                  >
                    {ship.name} length: {ship.length} {rotation}
                  </button>
                </div>
              );
            })}
        </div>

        {<div className="right-side">
          <h2>Guess enemy's ship's placements!</h2>
          <div className="flex-container">
            <Board
              onClick={(boardType, i, j) =>
                handleClick(boardType, i, j)
              }
              gameState={gameState}
              boardSize={boardSize}
              boardState={enemyBoard}
              boardType={"enemyBoard"}
            />
          </div>
        </div>
        }
      </div>
    </>
  );
}
export default Game;