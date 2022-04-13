import React, { useState } from "react";

import Square from "./Square";

export default function Board(props) {
 
      //return each square
  function renderSquare([i,j]){
    return (
      <Square
        value={[i,j]}
        onClick={() => this.props.onClick([i,j])}
      />
     )}

  //board of all the squares
  function createBoard(){
    let squaresInRow= [];
    for(let i=0; i<props.boardSize; i++){
      for(let j=0; j<props.boardSize; j++){
       squaresInRow.push(renderSquare([i,j]));         
       }
    }
    return squaresInRow;
    }

  return (
    <>
    <h1>Waterbound Fighting Vessels</h1>
    <hr />
    <br />
    <h2>Press to rotate and drag to move your ships!</h2>
    <div style={{width:`${props.boardSize*40}px`}}>
    {createBoard()}
    </div>

        
    </>
  );
}
