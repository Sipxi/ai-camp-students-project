import { getCameraCheckbox, getMicCheckbox } from './dom.js';

let cameraStream = null;
let micStream = null;

function setupPermissionListeners() {
  const cameraCheckbox = getCameraCheckbox();
  const micCheckbox = getMicCheckbox();
  if (cameraCheckbox) {
    cameraCheckbox.addEventListener('change', async function() {
      if (this.checked) {
        try {
          cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (err) {
          this.checked = false;
          alert('Přístup ke kameře byl odepřen nebo není dostupný.');
        }
      } else {
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
          cameraStream = null;
        }
      }
    });
  }
  if (micCheckbox) {
    micCheckbox.addEventListener('change', async function() {
      if (this.checked) {
        try {
          micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (err) {
          this.checked = false;
          alert('Přístup k mikrofonu byl odepřen nebo není dostupný.');
        }
      } else {
        if (micStream) {
          micStream.getTracks().forEach(track => track.stop());
          micStream = null;
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', setupPermissionListeners); 