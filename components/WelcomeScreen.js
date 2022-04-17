import React, { useState } from "react";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import Game from "./Game";

export const WelcomeScreen = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [userInput, setUserInput] = useState("");
  const [boardSize, setBoardSize] = useState("");

  const onChangeHandler = (e) => {
    setUserInput(e.target.value);
  };
  function showBoardComponent() {
    if (userInput < 10 || userInput > 15) {
      alert("Board size must be 10 and above.");
      setBoardSize("");
    } else {
      setBoardSize(userInput);
      setShowWelcome(false);
    }
  }

  return (
    <>
      {showWelcome && (
        <main className="center">
          <h1>Welcome to Battleship!</h1>
          <p>
            You and your opponent are competing navy commanders. Your fleets are
            positioned at secret coordinates, and you take turns firing
            torpedoes at each other. The first to sink the other person’s whole
            fleet wins!
          </p>
          <div>
            <label>
              Choose the board size:{" "}
              <input
                onChange={onChangeHandler}
                value={userInput}
                type="number"
                min={10}
                max={15}
                placeholder="10-15"
              />
            </label>
            <Button onClick={showBoardComponent} endIcon={<SendIcon />}>
              Done
            </Button>
          </div>
        </main>
      )}
      <div>{!showWelcome && <Game boardSize={boardSize} />}</div>
    </>
  );
};