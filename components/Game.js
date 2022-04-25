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
  const [message, setMessage] = useState("");
  const [boardIsSet, setBoardIsSet] =useState(props.boardIsSet);
  
  
  const boardSize = +props.boardSize + 1;
  
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
  
  function placeHorizontal(i,j){
    if (j + shipSelected.length <= boardSize) {
      //check can position horizontal
      for (let k = 0; k < shipSelected.length; k++) {
      if (userBoard[i*boardSize+j+k] != "0") {
        return;
      }
    }
      let m = j;
      let newUserBoard = userBoard.slice();
      for (let k = 0; k < shipSelected.length; k++) {
        newUserBoard[(i*boardSize+m+k)] = "x";
      }
      setUserBoard(newUserBoard);
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
      if (userBoard[(i+k)*boardSize+j] != "0") {
        return;
      }
    }
      let m = j;
      let newUserBoard = userBoard.slice();
      for (let k = 0; k < shipSelected.length; k++) {
        newUserBoard[((i+k)*boardSize+m)] = "x";
      }
      setUserBoard(newUserBoard);
      setShipSelected({
        name: "",
        value: "",
        length: "",
      })
    }
  }

  function checkHitOrMiss(i,j){
    let newEnemyBoard = enemyBoard.slice();
    newEnemyBoard[(i*boardSize +j)] = "x";
    setEnemyBoard(newEnemyBoard);

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
        console.log(boardType)

      
    } else if(boardType == "enemyBoard"){
      if(availableShips.length == 0){

      checkHitOrMiss(i,j)
     console.log(i,j)
      }
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
     <h1>Waterbound Fighting Vessels</h1>
      <hr />
      <br />
      <div className="hold-boards">
        <div className="left-side">
          {gameState == 'placement' && <><h2>Place your ships!
          <button className= "rotate-bttn ship" onClick={rotateShips}>Rotate ships</button></h2></>}
          {gameState == "start-game" && <h2>My board!</h2>}
          <div className="flex-container">
            <Board
        onClick={(boardType, i, j) =>
          handleClick(boardType,i, j)
        }
        gameState={gameState}
        boardSize={boardSize}
        boardState={userBoard}
        rotateShips={rotateShips}
        boardType={"userBoard"}

      /></div>
         {gameState == "placement" &&
        availableShips.map((ship) => {
          return (
            <div className="shipsAvailable" key={ship.name}>
              <button
                key={ship.name}
                className="ship-center ship"
                onClick={handleClickShip}
                name={ship.name}
              >
                {ship.name} length: {ship.length} rotation: {rotation}
              </button>
            </div>
          );
        })}
        </div>

        {<div className="right-side">
          <h2>Guess enemy's ship's placements!</h2>
      <div className="flex-container">
        <Board
        onClick={(boardType,i, j) =>
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