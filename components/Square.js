import React, { useEffect } from "react";

export default function Square(props) {
  let sizeInRow = 100 / props.boardSize;
  let iPoint = props.position[0];
  let jPoint = props.position[1];
  let squareValue = iPoint * props.boardSize + jPoint;
  let boardType = props.boardType;
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
  } else if (jPoint == 0 && iPoint == 0) {
    return (
      <button
        className="square-item place-center"
        style={{ flex: `1 0 ${sizeInRow}%` }}
      ></button>
    );
  } else {
    return (
      <button
        className={`square-item ${
          (boardType == "userBoard" && props.board[squareValue] == "0" && "") ||
          (props.board[squareValue] == "z" &&
            props.board[squareValue] != "0" &&
            "user-ship-hit ship-placed") ||
          (props.board[squareValue] != "0" && "ship-placed")
        }
                    ${
                      (boardType == "enemyBoard" &&
                        props.board[squareValue] == "0" &&
                        "") ||
                      (props.board[squareValue] == "m" && "miss") ||
                      (props.board[squareValue] == "h" && "hit")
                    }`}
        style={{ flex: `1 0 ${sizeInRow}%` }}
        value={props.board[squareValue]}
        onClick={handleClick}
      ></button>
    );
  }
}
