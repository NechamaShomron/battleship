import React, { useState } from "react";

import Square from "./Square";

export default function Board(props) {
const size = +(props.boardSize) +1;

 
      //return each square
  function renderSquare([i,j]){
    return (
      <Square
      boardSize={size}
      key={[i,j]}
        value={[i,j]}
        onClick={() => this.props.onClick([i,j])}
      />
     )}

  //board of all the squares
  function createBoard(){
    let isFirstLine = false
    let squaresInRow= [];
    for(let i=0; i<size; i++){
      for(let j=0; j<size; j++){
       squaresInRow.push(renderSquare([i,j]));         
       }
    }
    return squaresInRow;
    }

    let enemyBoard = createBoard();
    let userBoard = createBoard();

    return (
    <>
    <h1>Waterbound Fighting Vessels</h1>
    <hr />
    <br />
    <div className="hold-boards">
    <div className="left-side">
    <h2>Drag to move your ships {"&"} press to rotate!</h2>
    <div className="flex-container" >
    {userBoard}
    </div>
    </div>

    <div className="right-side">
    <h2>Guess enemy's ship's placements!</h2>
    <div className="flex-container" >
    {enemyBoard}
    </div>
    </div>
    </div>
   
    </>
  );
}
