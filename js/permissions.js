import { cameraCheckbox, micCheckbox } from './dom.js';

let cameraStream = null;
let micStream = null;

cameraCheckbox.addEventListener('change', async function() {
  if (this.checked) {
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
    } catch (err) {
      this.checked = false;
      alert('Přístup ke kameře byl odepřen nebo není dostupný.');
    }
  } else {
    // Stop camera stream if it exists
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      cameraStream = null;
    }
  }
});

micCheckbox.addEventListener('change', async function() {
  if (this.checked) {
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      this.checked = false;
      alert('Přístup k mikrofonu byl odepřen nebo není dostupný.');
    }
  } else {
    // Stop mic stream if it exists
    if (micStream) {
      micStream.getTracks().forEach(track => track.stop());
      micStream = null;
    }
  }
}); 