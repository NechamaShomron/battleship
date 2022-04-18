import Board from "./Board";
import React, { useState } from "react";
import { AVAILABLE_SHIPS } from "./Ships";

function Game(props) {
  const [gameState, setGameState] = useState("placement");
  const [shipSelected, setShipSelected] = useState({
    name: "",
    value: "",
    length: "",
  });
  const [rotation,setRotation] = useState("horizontal");
  const [availableShips, setAvailableShips] = useState(AVAILABLE_SHIPS);
  
  const boardSize = +props.boardSize + 1;
  
  let startingBoard = [];
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      startingBoard.push("0");
    }
  }
  //board maintains the state of all squares
  const [board, setBoard] = useState(
    startingBoard);
  
  function placeHorizontal(i,j){
    if (j + shipSelected.length <= boardSize) {
      //check can position horizontal
      for (let k = 0; k < shipSelected.length; k++) {
      if (board[i*boardSize+j+k] != "0") {
        return;
      }
    }
      let m = j;
      let newBoard = board.slice();
      for (let k = 0; k < shipSelected.length; k++) {
        newBoard[(i*boardSize+m+k)] = "x";
      }
      setBoard(newBoard);
      setShipSelected({
        name: "",
        value: "",
        length: "",
      })
    }
  }
  function placeVertical(i,j){
    if (i + shipSelected.length <= boardSize) {
      //check can position vertical
      for (let k = 0; k < shipSelected.length; k++) {
      if (board[(i+k)*boardSize+j] != "0") {
        return;
      }
    }
      let m = j;
      let newBoard = board.slice();
      for (let k = 0; k < shipSelected.length; k++) {
        newBoard[((i+k)*boardSize+m)] = "x";
      }
      setBoard(newBoard);
      setShipSelected({
        name: "",
        value: "",
        length: "",
      })
    }
  }
  const handleClick = (boardType, i, j) => {
    if (boardType == "userBoard") {
          if(rotation == "horizontal")
          placeHorizontal(i,j);
        else{
          placeVertical(i,j);
        }
        if(availableShips.length == 0){
          setGameState('start-game')
    //socket io add start
        }
      
    } else if(boardType == "enemyBoard"){
     
    }
  };
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
    setAvailableShips((prevValue) =>(
      prevValue.filter(ship => {
        return ship.name!=event.target.name;
      })
    ))
    event.preventDefault();
  };
const rotateShips = () =>{
  if(rotation=="horizontal") {
    setRotation("vertical"); }
   else {
     setRotation("horizontal"); 
    }
  }
  return (
    <>
      <Board
        onClick={(boardType, i, j) =>
          handleClick(boardType, i, j)
        }
        gameState={gameState}
        boardSize={boardSize}
        boardState={board}
        rotateShips={rotateShips}
      />
      {gameState == "placement" &&
        availableShips.map((ship) => {
          return (
            <div className="shipsAvailable" key={ship.name}>
              <button
                key={ship.name}
                className="place-center ship"
                onClick={handleClickShip}
                name={ship.name}
              >
                {ship.name} length: {ship.length} rotation: {rotation}
              </button>
            </div>
          );
        })}
    </>
  );
}
export default Game;