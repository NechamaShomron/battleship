import React, { useState } from "react";
import Square from "./Square";


export default function Board(props) {
  const size = +props.boardSize;
   //return each square
   function renderSquare([i, j]) {
    return (
      <Square
        value={props.value}
        boardSize={size}
        key={Math.random()}
        position={[i, j]}
        onClick={() => props.onClick(props.boardType, i, j)}
        board={props.boardState}
        boardType ={props.boardType}
      />
    );
  }

  //board of all the squares
  function createBoard() {
    let board = [];
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        board.push(renderSquare([i, j]));
      }
    }
    return board;
  }
  return (
    <>
      {createBoard()}
    </>
  );
}