import Board from "./Board";
import React, { useState } from "react";
import { AVAILABLE_SHIPS } from "./Ships";
import Button from "@mui/material/Button";

function Game(props) {
  // const [currentlyPlacing, setCurrentlyPlacing] = useState(null);
  // const [placedShips, setPlacedShips] = useState([]);
  const [gameState, setGameState] = useState("placement");
  const [shipSelected, setShipSelected] = useState({
    name: "",
    value: "",
    length: "",
    placed: null,
  });
  const [availableShips, setAvailableShips] = useState(AVAILABLE_SHIPS);
  const [board, setBoard] = useState({
    board: [],
    i: "",
    j: "",
    value: "0",
  });

  const boardSize = +props.boardSize + 1;

  const setSquareValue = (i, j, value) => {
    board.board[(i, j)] = value;
  };

  const handleClick = (userBoard, boardType, [i, j]) => {
    if (boardType == "userBoard") {
      if (userBoard[(i, j)].props.value == 0) {
        if (shipSelected.placed == null) {
          if (j + shipSelected.length <= boardSize) {
            setBoard((prevValue) => ({
              ...prevValue,
              board: userBoard,
              i: i,
              j: j,
              value: "x",
            }));
            for (let k = 0; k < shipSelected.length; k++) {
              setSquareValue(board.i, board.j, board.value);
              i++, j++;
            }
          }
          console.log(`square ${[i, j]} was clicked`);
        }
      }
    } else {
      console.log(boardType);
      console.log(`square ${[i, j]} was clicked`);
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
        });
      }
    }
    event.preventDefault();
  };

  return (
    <>
      <Board
        onClick={(userBoard, boardType, i, j) =>
          handleClick(userBoard, boardType, i, j)
        }
        boardSize={boardSize}
        value={board.value}
      />
      {gameState == "placement" &&
        availableShips.map((ship) => {
          return (
            <div className="shipsAvailable" key={ship.name}>
              <Button
                key={ship.name}
                className="place-center"
                variant="outlined"
                color="success"
                onClick={handleClickShip}
                name={ship.name}
              >
                {ship.name} length: {ship.length}
              </Button>
            </div>
          );
        })}
    </>
  );
}
export default Game;