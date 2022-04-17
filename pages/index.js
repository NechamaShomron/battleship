import { useEffect, useState } from "react";
import Head from "next/head";
import io from "Socket.IO-client";
import { WelcomeScreen } from "../components/WelcomeScreen";

let socket;

const Home = () => {
  useEffect(() => {
    socketInitializer(), [];
  });

  const socketInitializer = async () => {
    await fetch("/api/socket");
    socket = io();

    socket.on("connect", () => {
      console.log("connected client");
    });

    socket.on("update-input", (msg) => {
      setBoardSize(msg);
    });
    socket.emit("create", "room1");
  };

  return (
    <>
      <Head>
        <title>Battleship</title>
        <meta name="description" content="battleship game" />
        <link rel="icon" href="/battleship.png" />
      </Head>
      <WelcomeScreen />
    </>
  );
};

export default Home;