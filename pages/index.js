import { useEffect, useState } from "react";
import io from "socket.io-client";
import Head from "next/head";
import { SocketContext } from "../context/socketcontext";
import { WelcomeScreen } from "../components/WelcomeScreen";

const Home = () => {
  const defaultSocketCtx = {
    client_socket: {},
    loading: true,
  };
  let socket;
  const [socketContext, setSocketContext] = useState(defaultSocketCtx);

  const socketInitializer = async () => {
    await fetch("/api/socket");
    socket = io();
    socket.once("connect", () => {
      console.log("connected client");
      setSocketContext({
        client_socket: socket,
        loading: false,
      });
    });
  };

  useEffect(() => {
    socketInitializer();
  }, []);

  return (
    <>
      <Head>
        <title>Battleship</title>
        <meta name="description" content="battleship game" />
        <link rel="icon" href="/battleship.png" />
      </Head>

      <SocketContext.Provider value={socketContext}>
        <WelcomeScreen />
      </SocketContext.Provider>
    </>
  );
};

export default Home;
