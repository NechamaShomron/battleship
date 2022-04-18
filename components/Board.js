import React, { useState } from "react";
import Square from "./Square";


export default function Board(props) {
  const size = +props.boardSize;
   //return each square
   function renderSquare([i, j, boardType]) {
    return (
      <Square
        value={props.value}
        boardSize={size}
        key={Math.random()}
        position={[i, j]}
        boardType={boardType}
        onClick={() => props.onClick(boardType, i, j)}
        board={props.boardState}
      />
    );
  }

  //board of all the squares
  function createBoard(boardType) {
    let board = [];
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        board.push(renderSquare([i, j, boardType]));
      }
    }
    return board;
  }

  let enemyBoard = createBoard("enemyBoard");
  let userBoard = createBoard("userBoard");
  return (
    <>
      <h1>Waterbound Fighting Vessels</h1>
      <hr />
      <br />
      <div className="hold-boards">
        <div className="left-side">
          {props.gameState == 'placement' &&  <><h2>Place your ships!
          <button className= "rotate-bttn ship" onClick={props.rotateShips}>Rotate ships</button></h2></>}
          {props.gameState == "start-game" && <h2>My board!</h2>}
          <div className="flex-container">{userBoard}</div>
        </div>

        <div className="right-side">
          <h2>Guess enemy's ship's placements!</h2>
          <div className="flex-container">{enemyBoard}</div>
        </div>
      </div>
    </>
  );
}