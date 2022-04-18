import React, { useEffect } from "react";

export default function Square(props) {
  let sizeInRow = 100 / props.boardSize;
  let iPoint = props.position[0];
  let jPoint = props.position[1];
  let squareValue = iPoint*props.boardSize+jPoint;
  const handleClick = () => {
    props.onClick();
  };

  if (jPoint == 0 && iPoint != 0) {
    return (
      <button
        className="square-item place-center"
        style={{ flex: `1 0 ${sizeInRow}%` }}
      >
        {iPoint}
      </button>
    );
  } else if (jPoint != 0 && iPoint == 0) {
    return (
      <button
        className="square-item place-center"
        style={{ flex: `1 0 ${sizeInRow}%` }}
      >
        {(jPoint + 9).toString(36).toUpperCase()}
      </button>
    );
  }else if (jPoint == 0 && iPoint == 0) {
    return (
      <button
        className="square-item place-center"
        style={{ flex: `1 0 ${sizeInRow}%` }}
      >
      </button>
    );
  } else {
    if(props.boardType == "userBoard"){
      return (
        <button
          className={`square-item ${props.board[squareValue] == '0' ? '' : 'square-item-clicked'}`}
          style={{ flex: `1 0 ${sizeInRow}%`}}
          value={props.board[squareValue]}
          onClick={handleClick}
        >
        </button>
      );
    }
    else{
      return (
        <button
          className={`square-item`}
          style={{ flex: `1 0 ${sizeInRow}%`}}
          value={0}
          onClick={handleClick}
        >
        </button>
      );
    }
   
  }
}