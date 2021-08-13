import * as webrtc from './webrtc.js'
import * as store from './store.js'
import * as element from './element.js'
let socketIO = null;

export const registerSocketEvents = (socket) => {
  socketIO = socket;

  socket.on("connect", () => {
    console.log('successfully connected to socket.io server')
    store.setSocketId(socket.id)
    element.updatePersonalCode(socket.id)


    socket.on('pre-offer', (data) => {
      console.log('wss pre-offer', data)
      webrtc.handlePreOffer(data)
    })

    socket.on('pre-offer-answer', (data) => {
      console.log('emmiting to server pre offer event', data);
      webrtc.handlePreOfferAnswer(data);
    })

    socket.on("user-hanged-up", () => {
      webrtc.handleConnectedUserHangedUp();
    });

    socket.on('webRTC-signaling', (data) => {
      switch (data.type) {
        case 'offer':
          webrtc.handleWebRTCOffer(data);
          break;
        case 'answer':
          webrtc.handleWebRTCAnswer(data);
          break;
        case 'ice_candidate':
          webrtc.handleWebRTCCandidate(data);
          break;
        default:
          return;
      }
    })
  });
}
export const sendPreOffer = (data) => {
  socketIO.emit('pre-offer', data);
}
export const sendPreOfferAnswer = (data) => {
  socketIO.emit('pre-offer-answer', data)
}

export const sendDataToSignaling = (data) => {
  socketIO.emit('webRTC-signaling', data)
}

export const sendUserHangedUp = (data) => {
  socketIO.emit("user-hanged-up", data);
};