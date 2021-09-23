import * as element from './element.js';
import * as wss from './wss.js';
import * as store from './store.js';

let connectedUserInfo;
let peerConnection;
let localStream = null;

const defaultConstraints = {
  audio: true,
  video: true
}

const configuration = {
  iceServer: [{
    urls: 'stun:stun.1.google.com:13902'
  }]
}

export const getLocalPreview = async () => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia(defaultConstraints)
    element.updateLocalVideo(localStream)
    store.setLocalStream(localStream);

  } catch (err) {
    console.error(err)
  }
}

export const sendPreOffer = (calleePersonalCode) => {
  console.log('sendPreOffer', calleePersonalCode)
  connectedUserInfo = {
    socketId: calleePersonalCode
  }
  const data = {
    calleePersonalCode: calleePersonalCode
  }
  wss.sendPreOffer(data)
}

export const handlePreOffer = (data) => {
  console.log('pre offer came', data)
  const {
    callerSocketId
  } = data;
  connectedUserInfo = {
    socketId: callerSocketId,
  }
  createPeerConnection()
  console.log('call accepted', connectedUserInfo)
  sendPreOfferAnswer()
}

const sendPreOfferAnswer = () =>{
  const data = {
    callerSocketId: connectedUserInfo.socketId
  }
  console.log('give caller feedback', data)
  wss.sendPreOfferAnswer(data)
}

const createPeerConnection = () => {
  peerConnection = new RTCPeerConnection(configuration)

  //find match peer and switch ice candidate
  peerConnection.onicecandidate = (event) => {
    console.log('get ice candidates from stun server');
    if (event.candidate) {
      wss.sendDataToSignaling({
        connectedUserSocketId: connectedUserInfo.socketId,
        type: 'ice_candidate',
        candidate: event.candidate
      })
    }
  }

  peerConnection.onconnectionstatechange = (event) => {
    console.log(event);
    if (peerConnection.connectionState === 'connected') {
      console.log('successfully connected with other peer')
      element.toggleFunctionalElement(true)
    }
  }

  //receiving tracks
  const remoteStream = new MediaStream();
  store.setRemoteStream(remoteStream);
  element.updateRemoteVideo(remoteStream)

  peerConnection.ontrack = (event) => {
    remoteStream.addTrack(event.track)
  }

  // add our stream to peer connection
  const localStream = store.getState().localStream;

  for (const track of localStream.getTracks()) {
    peerConnection.addTrack(track, localStream)
  }
}

export const handlePreOfferAnswer = (data) => {
  console.log('pre offer answer came', data);
  createPeerConnection();
  sendWebRTCOffer();
}

//caller create offer
const sendWebRTCOffer = async () => {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  wss.sendDataToSignaling({
    connectedUserSocketId: connectedUserInfo.socketId,
    type: 'offer',
    offer
  })
}

export const handleWebRTCOffer = async (data) => {
  console.log('webRTC offer came', data);
  try {
    await peerConnection.setRemoteDescription(data.offer);
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)
    wss.sendDataToSignaling({
      connectedUserSocketId: connectedUserInfo.socketId,
      type: 'answer',
      answer
    })
  } catch (err) {
    console.log(err)
  }

}
export const handleWebRTCAnswer = async (data) => {
  console.log('handling webRTC Answer')
  await peerConnection.setRemoteDescription(data.answer)
}

export const handleWebRTCCandidate = async (data) => {
  try {
    await peerConnection.addIceCandidate(data.candidate)
  } catch (err) {
    console.error('error occured when trying to add reveived ice candidate', err)
  }
}

export const handleHangUp = () => {
  const data = {
    connectedUserSocketId: connectedUserInfo.socketId,
  };

  wss.sendUserHangedUp(data);
  closePeerConnectionAndResetState();
};

export const handleConnectedUserHangedUp = () => {
  closePeerConnectionAndResetState();
};

const closePeerConnectionAndResetState = () => {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  // active mic and camera
  store.getState().localStream.getVideoTracks()[0].enabled = true;
  store.getState().localStream.getAudioTracks()[0].enabled = true;

  connectedUserInfo = null;
  element.toggleFunctionalElement(false)
};

export const muted = ()=>{
  store.getState().localStream.getAudioTracks()[0].enabled = !store.getState().localStream.getAudioTracks()[0].enabled;
}