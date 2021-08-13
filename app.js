const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`);
})

let connectedPeers = [];

io.on('connection', (socket) => {
  connectedPeers.push(socket.id)
  console.log(connectedPeers)

  socket.on('pre-offer', data => {
    const {
      calleePersonalCode
    } = data;
    const connectedPeer = connectedPeers.find(peerSokectId => peerSokectId === calleePersonalCode)
    if (connectedPeer) {
      console.log('connectedPeer', connectedPeers)
      const data = {
        callerSocketId: socket.id,
      }
      io.to(calleePersonalCode).emit('pre-offer', data)
    }
  })

  socket.on('pre-offer-answer', data => {
    console.log('pre offer answer came')
    console.log(data);

    //check id exist
    const {
      callerSocketId
    } = data;
    const connectedPeer = connectedPeers.find(peerSokectId => peerSokectId === callerSocketId)
    if (connectedPeer) {
      io.to(data.callerSocketId).emit('pre-offer-answer', data);
    }
  })

  socket.on('webRTC-signaling', (data) => {
    const {
      connectedUserSocketId
    } = data;
    const connectedPeer = connectedPeers.find(peerSokectId => peerSokectId === connectedUserSocketId)
    if (connectedPeer) {
      io.to(connectedUserSocketId).emit('webRTC-signaling', data);
    }
  })

  socket.on('disconnect', () => {
    console.log('disconnect')
    const tempConnectedPeer = connectedPeers.filter(peerSokectId =>
      peerSokectId !== socket.id
    )
    connectedPeers = tempConnectedPeer;
  })
  socket.on("user-hanged-up", (data) => {
    const {
      connectedUserSocketId
    } = data;

    const connectedPeer = connectedPeers.find(
      (peerSocketId) => peerSocketId === connectedUserSocketId
    );

    if (connectedPeer) {
      io.to(connectedUserSocketId).emit("user-hanged-up");
    }
  });

})

server.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
})