import Board from "./Board"
import React from "react"
function Game (props) {
  return <Board boardSize={props.boardSize} />
}
//  class Game extends React.Component {

//     constructor(props) {
//       super(props);
//       this.state = {
//         history: [
//           {
//             squares: Array(props.boardSize).fill(null)
//           }
//         ],
//         stepNumber: 0,
//       };
//     }

//     handleClick(i) {
//     }


//     render(){
//         return (
//         <div className="game">
//         <div className="game-board">
//           <Board
//           boardSize={this.props.boardSize}
//             //squares={squares}
//             onClick={i => this.handleClick(i)}
//           />
//         </div>
//         <div className="game-info">
//         </div>
//       </div>
//     );

//     }
// }
export default Game;
