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
        onClick={() => props.onClick(userBoard, boardType, [i, j])}
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
          <h2>Drag to move your ships {"&"} press to rotate!</h2>
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