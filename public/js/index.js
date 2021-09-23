import * as webrtc from './webrtc.js'
import * as wss from './wss.js'

const socket = io("/");
wss.registerSocketEvents(socket)
webrtc.getLocalPreview()

document.getElementById('copy_btn').addEventListener('click', () =>{
  navigator.clipboard && navigator.clipboard.writeText(document.getElementById('local_id').textContent);
})

document.getElementById('connect_btn').addEventListener('click', () => {
  const calleeId = document.getElementById('remote_id').value
  console.log()
  if (calleeId.trim() !== '') {
    webrtc.sendPreOffer(calleeId)
  }
}) 


document.getElementById('hangup_btn').addEventListener('click',()=>{
  webrtc.handleHangUp()
})

// document.getElementById('share_screen_btn').addEventListener('click' , () =>{

// })

document.getElementById('mute_btn').addEventListener('click', ()=>{
  webrtc.muted()
  document.getElementById('mute_btn').classList.add('display-none');
  document.getElementById('unmute_btn').classList.remove('display-none')
})
document.getElementById('unmute_btn').addEventListener('click', ()=>{
  webrtc.muted()

  document.getElementById('unmute_btn').classList.add('display-none');
  document.getElementById('mute_btn').classList.remove('display-none')
})