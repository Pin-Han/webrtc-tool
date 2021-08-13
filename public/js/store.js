let state = {
  socketId: null,
  localStream: null,
  remoteStream: null,
}

export const setSocketId = (socketId) => {
  state = {
    ...state,
    socketId
  }
}

export const setLocalStream = (localStream) => {
  state = {
    ...state,
    localStream
  }
}

export const setRemoteStream = (remoteStream) => {
  state = {
    ...state,
    remoteStream
  }
}

export const getState = () => {
  return state
}