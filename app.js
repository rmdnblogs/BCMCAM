const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const snapBtn = document.getElementById('snapBtn');
const dlBtn = document.getElementById('dlBtn');
const resetBtn = document.getElementById('resetBtn');
const inputName = document.getElementById('productName');
const inputED = document.getElementById('edInput');
const statusMsg = document.getElementById('statusMsg');

let streamMedia;

// Inisialisasi Kamera
async function startCamera() {
    try {
        streamMedia = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { exact: "environment" } }
        });
    } catch (err) {
        streamMedia = await navigator.mediaDevices.getUserMedia({ video: true });
    }
    video.srcObject = streamMedia;
}

// Waktu realtime
function getFormattedDate() {
    const now = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
}

// Ambil Foto + Watermark
function takePhoto() {
    if (!inputName.value) {
        alert("Mohon isi Nama Produk dulu!");
        return;
    }

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const productName = inputName.value;
    const edText = inputED.value;
    const timeString = getFormattedDate();

    const fontSize = canvas.width * 0.04;
    context.font = `bold ${fontSize}px Arial`;
    const lineHeight = fontSize * 1.3;

    // TIMESTAMP kanan atas
    context.textAlign = "right";
    context.textBaseline = "top";
    context.fillStyle = "#FFD700";
    context.strokeStyle = "black";
    context.lineWidth = fontSize / 10;
    context.strokeText(timeString, canvas.width - 20, 20);
    context.fillText(timeString, canvas.width - 20, 20);

    // PRODUK & ED kiri bawah
    context.textAlign = "left";
    context.textBaseline = "bottom";

    let currentY = canvas.height - 20;
    const leftX = 20;

    if (edText) {
        context.fillStyle = "#ffcccc";
        context.strokeText(edText, leftX, currentY);
        context.fillText(edText, leftX, currentY);
        currentY -= lineHeight;
    }

    context.fillStyle = "white";
    context.strokeText(productName, leftX, currentY);
    context.fillText(productName, leftX, currentY);

    video.style.display = 'none';
    canvas.style.display = 'block';
    snapBtn.style.display = 'none';
    dlBtn.style.display = 'block';
    resetBtn.style.display = 'block';
    statusMsg.style.display = 'block';
}

// Simpan + Reset
function downloadAndReset() {
    let fileName = inputName.value.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const link = document.createElement('a');
    link.download = `${fileName}_${Date.now()}.jpg`;
    link.href = canvas.toDataURL("image/jpeg", 0.85);
    link.click();

    dlBtn.innerText = "MENYIMPAN...";

    setTimeout(() => {
        resetCamera();
        dlBtn.innerText = "SIMPAN & RESET";
    }, 1200);
}

function resetCamera() {
    video.style.display = 'block';
    canvas.style.display = 'none';

    snapBtn.style.display = 'block';
    dlBtn.style.display = 'none';
    resetBtn.style.display = 'none';
    statusMsg.style.display = 'none';

    inputName.value = '';
    inputED.value = '';
    inputName.focus();
}

snapBtn.onclick = takePhoto;
dlBtn.onclick = downloadAndReset;
resetBtn.onclick = resetCamera;

startCamera();