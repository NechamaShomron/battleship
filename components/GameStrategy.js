import { useState } from "react";
import Board from "./Board";
import Square from "./Square";

function GameStrategy(){
      const [boardSize, setBoardSize] = useState("");
      const [ships,setShips] = useState({
        carrier: 0,
        battleship: 0,
        cruiser: 0,
        submarine: 0,
        destroyer: 0,
      });
  
       function onClick(){

      }
      function value(){

      }
      function createBoard(){
        console.log("done")
        for(let i=0; i<boardSize; i++){
          for(let j=0; j<boardSize; j++){
            <div className="board-row">
              <Square />
</div>
          }
        }
           return 
      }
      return(
        <>
      <h3>
      Choose the board size: {" "}
      <input onChange={(e)=> setBoardSize(e.target.value)} type="number" min={10} placeholder="At least 10"/>
    </h3>
    {boardSize && <button onClick={createBoard}>Done</button>}
     
      </>
      )
}

export default GameStrategy;

