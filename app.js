// app.js - camera + watermark + save + reset
"use strict";

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const videoOverlay = document.getElementById('videoOverlay');
const snapBtn = document.getElementById('snapBtn');
const dlBtn = document.getElementById('dlBtn');
const resetBtn = document.getElementById('resetBtn');
const inputName = document.getElementById('productName');
const inputED = document.getElementById('edInput');
const statusMsg = document.getElementById('statusMsg');

let streamMedia = null;

function showStatus(text, visible = true) {
  statusMsg.textContent = text || '';
  statusMsg.style.display = visible ? 'block' : 'none';
}

// Format waktu
function getFormattedDate() {
  const now = new Date();
  const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Ags","Sep","Okt","Nov","Des"];
  return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
}

// Start camera with fallback
async function startCamera() {
  videoOverlay.style.display = 'flex';
  videoOverlay.textContent = 'Meminta akses kamera...';
  try {
    streamMedia = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false
    });
    video.srcObject = streamMedia;

    // hide overlay when video ready
    video.addEventListener('loadeddata', () => {
      videoOverlay.style.display = 'none';
    }, {once:true});

    showStatus('', false);
  } catch (err) {
    console.error('Camera start error:', err);
    videoOverlay.textContent = 'Kamera tidak tersedia. Pastikan permission diberikan dan device mendukung kamera.';
    showStatus('Kamera tidak aktif', true);
  }
}

// Capture photo and watermark
function takePhoto() {
  if (!inputName.value.trim()) {
    alert('Mohon isi Nama Produk dulu!');
    inputName.focus();
    return;
  }

  const ctx = canvas.getContext('2d');
  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 720;

  // Draw current frame
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Setup watermark font
  const fontSize = Math.max(16, Math.floor(canvas.width * 0.04));
  ctx.font = `bold ${fontSize}px Arial`;
  const lineHeight = Math.floor(fontSize * 1.25);

  // Timestamp - right top
  const timeString = getFormattedDate();
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#FFD700';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = Math.max(1, Math.floor(fontSize / 12));
  ctx.strokeText(timeString, canvas.width - 20, 20);
  ctx.fillText(timeString, canvas.width - 20, 20);

  // Product & ED - left bottom
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  let currentY = canvas.height - 20;
  const leftX = 20;

  if (inputED.value.trim()) {
    ctx.fillStyle = '#ffcccc';
    ctx.strokeText(inputED.value.trim(), leftX, currentY);
    ctx.fillText(inputED.value.trim(), leftX, currentY);
    currentY -= lineHeight;
  }

  ctx.fillStyle = 'white';
  ctx.strokeText(inputName.value.trim(), leftX, currentY);
  ctx.fillText(inputName.value.trim(), leftX, currentY);

  // swap UI
  video.style.display = 'none';
  canvas.style.display = 'block';
  snapBtn.style.display = 'none';
  dlBtn.style.display = 'inline-block';
  resetBtn.style.display = 'inline-block';
  showStatus('✅ Foto Siap Disimpan!', true);
}

// Save file and auto reset
function downloadAndReset() {
  const name = (inputName.value || 'gudang').replace(/[^a-z0-9_-]/gi,'_').toLowerCase();
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${name}_${Date.now()}.jpg`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  dlBtn.textContent = 'MENYIMPAN...';
  setTimeout(()=> {
    dlBtn.textContent = 'SIMPAN & RESET';
    resetCamera();
  }, 1000);
}

function resetCamera() {
  video.style.display = 'block';
  canvas.style.display = 'none';
  snapBtn.style.display = 'inline-block';
  dlBtn.style.display = 'none';
  resetBtn.style.display = 'none';
  showStatus('', false);
  inputName.value = '';
  inputED.value = '';
  inputName.focus();
}

// Attach listeners
snapBtn.addEventListener('click', takePhoto);
dlBtn.addEventListener('click', downloadAndReset);
resetBtn.addEventListener('click', resetCamera);

// Start on load
window.addEventListener('load', () => {
  startCamera();

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => {
        console.log('ServiceWorker registered:', reg.scope);
      })
      .catch(err => {
        console.warn('ServiceWorker registration failed:', err);
      });
  } else {
    console.log('ServiceWorker not supported in this browser');
  }
});
