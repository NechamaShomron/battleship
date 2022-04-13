import { useEffect, useState } from 'react'
import Head from "next/head"
import io from 'Socket.IO-client';
import Game from '../components/Game' ;
import Button from '@mui/material/Button';

let socket;

const Home = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [userInput, setUserInput] = useState("");
  const [boardSize, setBoardSize] = useState("");


  useEffect(() =>{ socketInitializer(), []})

  const socketInitializer = async () => {
    await fetch('/api/socket');
    socket = io()

    socket.on('connect', () => {
      console.log('connected')
    })

    socket.on('update-input', msg => {
      setBoardSize(msg)
    })
  }

  const onChangeHandler = (e) => {
    setUserInput(e.target.value);
   
  }
  function showBoardComponent(){
    if(userInput <10 || userInput >15){
      alert("Board size must be 10 and above.");
      setBoardSize("");
    }
    else{
    setBoardSize(userInput);
    setShowWelcome(false);
    socket.emit('input-change',userInput)
    }
  }

    return (
      <>
        <Head>
          <title>Battleship</title>
          <meta name="description" content="battleship game" />
          <link rel="icon" href="/battleship.png" />
        </Head>
        {showWelcome &&
        <main>
          <h1 className="center">Welcome to Battleship!</h1>
          <br />
          <h2 className="center">Choose the board size:{" "}</h2>
          <input  class="center-block"
          onChange={onChangeHandler}
            value={userInput}
            type="number"
            min={10}
            max={15}
            placeholder="10-15" /> 
            
            <br /> <br />
         <Button class="center-block" onClick={showBoardComponent} variant="contained" size="medium">Done</Button>
         </main>
}   
      <br />
      { !showWelcome && <Game boardSize={boardSize} />}
      </>
     )
      }
    
export default Home;