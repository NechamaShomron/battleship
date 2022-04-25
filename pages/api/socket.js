import { Server } from 'Socket.IO'

let boardSet="";
let queue = [];    // list of sockets waiting for peers
let rooms = {};    // map socket.id => room

function findPeerForLoneSocket(socket) {
  if (queue.length) {
    let peer = queue.pop();
    let room = socket.id + '#' + peer.id;
    let isFirstPlayer = true;
    peer.join(room);
    socket.join(room);
    rooms[peer.id] = room;
    rooms[socket.id] = room;
    peer.emit('start game', isFirstPlayer);
    socket.emit('start game', !isFirstPlayer);
  } else {
    queue.push(socket);
  }
}

function getPeer(room, socket) {
  let peer = room.split('#');
  return peer[0] === socket ? peer[1] : peer[0];
}

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    //handling connection
    // requests and everything within that connection happens in the io.on block
    io.on('connection', socket => {
      const clientID = socket.id;
      console.log(clientID)
      socket.on('add player', () => {
        findPeerForLoneSocket(socket);
      });
      socket.on('board-size-change', msg => {
        socket.broadcast.emit('board-size-update', msg)
        boardSet=msg;
      })

      socket.on('board-size-req', msg => {
        socket.broadcast.emit('board-size-update', boardSet)
      })
      
      console.log("server connected");
    })


  }
  res.end()
}

export default SocketHandler;