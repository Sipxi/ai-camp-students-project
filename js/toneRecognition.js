// Handles Teachable Machine tone recognition and UI controls
import {
  toneCheckbox, toneControls, startToneBtn, stopToneBtn, liveResult, recognitionHistory, historyTitle, currentNote, noteImage
} from './dom.js';
import { MODEL_URL } from './config.js';

let recognizer = null;
let classLabels = [];
let listening = false;
let history = [];

const NOTE_LABELS = ['c','d','e','f','g','a','h','C','D','E','F','G','A','H'];

function getNoteImageSrc(label) {
  // Always use lowercase for file names
  const lower = label.toLowerCase();
  return `notes/${lower}.png`;
}

async function createModel() {
  const checkpointURL = MODEL_URL + "model.json";
  const metadataURL = MODEL_URL + "metadata.json";
  recognizer = speechCommands.create(
    "BROWSER_FFT",
    undefined,
    checkpointURL,
    metadataURL
  );
  await recognizer.ensureModelLoaded();
  classLabels = recognizer.wordLabels();
}

async function startRecognition() {
  if (!recognizer) await createModel();
  listening = true;
  liveResult.textContent = 'Poslouchám...';
  startToneBtn.disabled = true;
  stopToneBtn.disabled = false;
  recognizer.listen(result => {
    const scores = result.scores;
    let maxScore = Math.max(...scores);
    let idx = scores.findIndex(s => s === maxScore);
    let label = classLabels[idx];
    if (maxScore > 0.75 && NOTE_LABELS.includes(label)) {
      liveResult.innerHTML = `<span class='detected-label'>${label}</span> <span class='score'>(spolehlivost: ${(maxScore*100).toFixed(1)}%)</span>`;
      currentNote.textContent = label;
      // Show note image
      noteImage.src = getNoteImageSrc(label);
      noteImage.style.display = '';
      noteImage.alt = `Note ${label}`;
      if (history.length === 0 || history[history.length-1].label !== label) {
        history.push({ label, score: maxScore, time: new Date() });
        updateHistory();
      }
    } else {
      // Hide image if not a valid note
      noteImage.style.display = 'none';
      noteImage.src = '';
      noteImage.alt = '';
    }
  }, {
    includeSpectrogram: false,
    probabilityThreshold: 0.75,
    invokeCallbackOnNoiseAndUnknown: true,
    overlapFactor: 0.50
  });
}

function stopRecognition() {
  if (recognizer && listening) {
    recognizer.stopListening();
    listening = false;
    liveResult.textContent = 'Zastaveno.';
    startToneBtn.disabled = false;
    stopToneBtn.disabled = true;
  }
}

function updateHistory() {
  recognitionHistory.innerHTML = '';
  history.slice(-10).reverse().forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<span class='detected-label'>${item.label}</span> <span class='score'>(spolehlivost: ${(item.score*100).toFixed(1)}%)</span> <span class='time'>${item.time.toLocaleTimeString()}</span>`;
    recognitionHistory.appendChild(li);
  });
}

startToneBtn.addEventListener('click', startRecognition);
stopToneBtn.addEventListener('click', stopRecognition);
stopToneBtn.disabled = true;

toneCheckbox.addEventListener('change', function() {
  if (this.checked) {
    toneControls.classList.remove('hidden');
  } else {
    toneControls.classList.add('hidden');
    stopRecognition();
    liveResult.textContent = '';
    recognitionHistory.innerHTML = '';
    history = [];
    currentNote.textContent = '';
    noteImage.style.display = 'none';
    noteImage.src = '';
    noteImage.alt = '';
  }
}); 