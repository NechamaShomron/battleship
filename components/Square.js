import * as React from "react";

export default function Square(props) {
  let sizeInRow = 100 /props.boardSize;
  return (

    <button className="flex-item" style={{flex: `1 0 ${sizeInRow}%`
    }} onClick={props.onClick}>
    </button>
  );}