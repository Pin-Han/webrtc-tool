import * as main from './index.js';

export const updatePersonalCode = (socketId) => {
  const localId = document.getElementById('local_id')
  localId.innerHTML = socketId
}

export const updateLocalVideo = (stream) => {
  document.getElementById('local_video').srcObject = stream;
}

export const updateRemoteVideo = (stream) => {
  document.getElementById('remote_video').srcObject = stream;
}

export const toggleFunctionalElement = (show)=>{
  if(show){
    document.getElementById('functional').classList.add('show-functional')
    document.getElementById('other').style.cssText='transform:translateY(0)'

  }else{
    document.getElementById('functional').classList.remove('show-functional')
    document.getElementById('other').style.cssText='transform:translateY(80px)'
  }
}