import React, { useState,useContext,useEffect } from "react";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import Game from "./Game";

import {SocketContext} from '../context/socketcontext';

export const WelcomeScreen = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [userInput, setUserInput] = useState("");
  const [boardSize, setBoardSize] = useState("");
  const [boardIsSet,setBoardIsSet] = useState(false);
  const socketContext = useContext(SocketContext);
  let socket = socketContext.client_socket;

function unsetBoard(){
  setBoardIsSet(false);
}
  const onChangeHandler = (e) => {
    setUserInput(e.target.value);
  };

  function showBoardComponent() {
    if (userInput < 10 || userInput > 15) {
      alert("Board size must be 10 and above.");
      setBoardSize("");
    } else {
      setBoardSize(userInput);
      if(socket){
     socket.emit('add player');
     socket.emit("board-size-change", userInput);

     socket.on('start game', (isFirstPlayer) => {
       console.log('start')
       if (!isFirstPlayer) {
        //  this.setState({turn: !this.state.turn});
       }
      //  this.setState({isGame: !this.state.isGame});
     });
 
      }
      setShowWelcome(false);
    }
  }
  if(socketContext.loading)
  {
    return (<><p>loading now</p></>);
  }


  else
  {
    socket.on("board-size-update", msg => {
      if(msg != "")
      {
        setBoardIsSet(true);
        setBoardSize(msg);
        setShowWelcome(false);
      }
      else{
        setBoardIsSet(false);
        setBoardSize("");
        setShowWelcome(true);
      }
  });

  socket.emit("board-size-req", "");
    console.log(socket);
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
            {!boardIsSet && <label>
              Choose the board size:{" "}
              <input
                onChange={onChangeHandler}
                value={userInput}
                type="number"
                min={10}
                max={15}
                placeholder="10-15"
              />
            </label> }
            <Button onClick={showBoardComponent} endIcon={<SendIcon />}>
              Start
            </Button>
          </div>
        </main>
      )}
      <div>{!showWelcome && <Game boardSize={boardSize} boardIsSet={boardIsSet} />}</div>
    </>
  );
};
}