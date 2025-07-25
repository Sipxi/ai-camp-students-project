import {
  photoCheckbox, photoControls, photoInput, startPhotoBtn, photoResult,
  currentNote, noteImage, recognitionHistory,
  webcamToggleBtn, webcamArea, photoWebcam, webcamCaptureBtn
} from './dom.js';
import { history, updateHistory } from './toneRecognition.js';

const IMAGE_MODEL_URL = "https://teachablemachine.withgoogle.com/models/IhJravwGl/";
const NOTE_LABELS = ['a','b','c','d','e','f','g'];
let imageModel = null;
let imageClassLabels = [];
let webcamStream = null;

async function loadImageModel() {
  if (imageModel) return;
  const modelURL = IMAGE_MODEL_URL + "model.json";
  const metadataURL = IMAGE_MODEL_URL + "metadata.json";
  imageModel = await window.tmImage.load(modelURL, metadataURL);
  imageClassLabels = imageModel.getClassLabels ? imageModel.getClassLabels() : [];
}

function getNoteImageSrc(label) {
  return `notes/${label.toLowerCase()}.png`;
}

photoCheckbox.addEventListener('change', function() {
  if (this.checked) {
    photoControls.classList.remove('hidden');
  } else {
    photoControls.classList.add('hidden');
    photoResult.textContent = '';
    // Stop webcam if open
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      webcamStream = null;
    }
    photoWebcam.srcObject = null;
    webcamArea.style.display = 'none';
    webcamToggleBtn.textContent = 'Použít webkameru';
  }
});

startPhotoBtn.addEventListener('click', async () => {
  if (!photoInput.files || !photoInput.files[0]) {
    photoResult.textContent = 'Vyberte obrázek!';
    return;
  }
  await loadImageModel();
  const img = new window.Image();
  img.onload = async () => {
    photoResult.textContent = 'Rozpoznávám...';
    const prediction = await imageModel.predict(img);
    let best = prediction[0];
    for (let i = 1; i < prediction.length; i++) {
      if (prediction[i].probability > best.probability) best = prediction[i];
    }
    if (NOTE_LABELS.includes(best.className.toLowerCase())) {
      photoResult.innerHTML = `<span class='detected-label'>${best.className}</span> <span class='score'>(spolehlivost: ${(best.probability*100).toFixed(1)}%)</span>`;
      currentNote.textContent = best.className;
      noteImage.src = getNoteImageSrc(best.className);
      noteImage.style.display = '';
      noteImage.alt = `Note ${best.className}`;
      if (history.length === 0 || history[history.length-1].label !== best.className) {
        history.push({ label: best.className, score: best.probability, time: new Date() });
        updateHistory();
      }
    } else {
      photoResult.textContent = 'Nebylo rozpoznáno.';
      noteImage.style.display = 'none';
      noteImage.src = '';
      noteImage.alt = '';
    }
  };
  img.src = URL.createObjectURL(photoInput.files[0]);
});

webcamToggleBtn.addEventListener('click', async () => {
  if (webcamArea.style.display === 'none') {
    // Start webcam
    try {
      webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
      photoWebcam.srcObject = webcamStream;
      webcamArea.style.display = 'flex';
      webcamToggleBtn.textContent = 'Zavřít webkameru';
    } catch (err) {
      alert('Nelze spustit webkameru.');
    }
  } else {
    // Stop webcam
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      webcamStream = null;
    }
    photoWebcam.srcObject = null;
    webcamArea.style.display = 'none';
    webcamToggleBtn.textContent = 'Použít webkameru';
  }
});

webcamCaptureBtn.addEventListener('click', async () => {
  if (!webcamStream) return;
  await loadImageModel();
  // Capture frame from video
  const canvas = document.createElement('canvas');
  canvas.width = photoWebcam.videoWidth || 200;
  canvas.height = photoWebcam.videoHeight || 200;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(photoWebcam, 0, 0, canvas.width, canvas.height);
  const img = new window.Image();
  img.onload = async () => {
    photoResult.textContent = 'Rozpoznávám...';
    const prediction = await imageModel.predict(img);
    let best = prediction[0];
    for (let i = 1; i < prediction.length; i++) {
      if (prediction[i].probability > best.probability) best = prediction[i];
    }
    if (NOTE_LABELS.includes(best.className.toLowerCase())) {
      photoResult.innerHTML = `<span class='detected-label'>${best.className}</span> <span class='score'>(spolehlivost: ${(best.probability*100).toFixed(1)}%)</span>`;
      currentNote.textContent = best.className;
      noteImage.src = getNoteImageSrc(best.className);
      noteImage.style.display = '';
      noteImage.alt = `Note ${best.className}`;
      if (history.length === 0 || history[history.length-1].label !== best.className) {
        history.push({ label: best.className, score: best.probability, time: new Date() });
        updateHistory();
      }
    } else {
      photoResult.textContent = 'Nebylo rozpoznáno.';
      noteImage.style.display = 'none';
      noteImage.src = '';
      noteImage.alt = '';
    }
  };
  img.src = canvas.toDataURL('image/png');
}); 