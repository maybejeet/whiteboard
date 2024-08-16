let history = [];
let historyIndex = -1;
let isDrawing = false;
let isErasing = false;
let isText = false;
let isRecording = false;
let mediaRecorder;
let recordedChunks = [];
let penColor = '#000000'; // Default pen color
let penWidth = 5; // Default pen width
let eraserWidth = 20; // Eraser width

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('color-picker');
const sizeSlider = document.getElementById('size-slider');
const sizeDisplay = document.getElementById('size-display');
const textInput = document.getElementById('text-input');
const fontSizeSelect = document.getElementById('font-size');
const fontFamilySelect = document.getElementById('font-family');
const textSettings = document.getElementById('text-settings');
const recordButton = document.getElementById('record');
const stopRecordButton = document.getElementById('stop-record');
const downloadLink = document.getElementById('download-link');

// Set canvas background color
const canvasBackgroundColor = '#FFFFFF'; // Default canvas background color
canvas.style.backgroundColor = canvasBackgroundColor;
ctx.fillStyle = canvasBackgroundColor;
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Set cursor styles for tools
const penCursor = 'url("https://example.com/pen-cursor.png") 10 10, auto'; // Replace with your actual pen cursor URL
const eraserCursor = 'url("https://example.com/eraser-cursor.png") 10 10, auto'; // Replace with your actual eraser cursor URL

// Save the current state of the canvas
function saveState() {
    if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
    }
    history.push(canvas.toDataURL());
    historyIndex++;
}

// Restore a specific state from history
function restoreState(index) {
    const img = new Image();
    img.src = history[index];
    img.onload = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
}

// Update tool settings based on the selected tool
function updateToolSettings() {
    if (isErasing) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = canvasBackgroundColor; // Eraser color matches canvas background
        ctx.lineWidth = eraserWidth;
        canvas.style.cursor = eraserCursor; // Set cursor for eraser
    } else if (isText) {
        canvas.style.cursor = 'text'; // Set cursor for text input
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = penColor;
        ctx.lineWidth = penWidth;
        canvas.style.cursor = penCursor; // Set cursor for pen
    }
}

// Start drawing or erasing on mouse down
canvas.addEventListener('mousedown', (e) => {
    if (isText) {
        const text = textInput.value;
        const fontSize = fontSizeSelect.value;
        const fontFamily = fontFamilySelect.value;
        const x = e.offsetX;
        const y = e.offsetY;
        
        if (text) {
            ctx.font = `${fontSize} ${fontFamily}`;
            ctx.fillStyle = penColor;
            ctx.fillText(text, x, y);
            saveState(); // Save the state after adding text
            textInput.value = ''; // Clear the text input
            textSettings.style.display = 'none'; // Hide text settings after adding text
            isText = false; // Deactivate text tool
        }
    } else {
        isDrawing = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    }
});

// End drawing or erasing on mouse up and save the state
canvas.addEventListener('mouseup', () => {
    if (isDrawing) {
        isDrawing = false;
        saveState(); // Save the state after completing an action
    }
});

// Draw or erase on mouse move
canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing || isText) return;

    updateToolSettings(); // Update settings based on the selected tool

    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
});

// Select pen tool
document.getElementById('pen').addEventListener('click', () => {
    isErasing = false;
    isText = false;
    updateToolSettings(); // Update settings for pen
});

// Select eraser tool
document.getElementById('eraser').addEventListener('click', () => {
    isErasing = true;
    isText = false;
    updateToolSettings(); // Update settings for eraser
});

// Select text tool
document.getElementById('text').addEventListener('click', () => {
    isErasing = false;
    isText = true;
    updateToolSettings(); // Update settings for text tool
    textSettings.style.display = 'block'; // Show text settings
});

// Undo the last action
document.getElementById('undo').addEventListener('click', () => {
    if (historyIndex > 0) {
        historyIndex--;
        restoreState(historyIndex);
    }
});

// Redo the last undone action
document.getElementById('redo').addEventListener('click', () => {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        restoreState(historyIndex);
    }
});

// Delete all content on the canvas
document.getElementById('delete').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = canvasBackgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState(); // Save the state after clearing
});

// Update pen color based on color picker input
colorPicker.addEventListener('input', (e) => {
    penColor = e.target.value;
    if (!isErasing && !isText) {
        updateToolSettings(); // Update settings if pen is active
    }
});

// Update size of pen and eraser based on slider input
sizeSlider.addEventListener('input', (e) => {
    const size = e.target.value;
    sizeDisplay.style.width = `${size}px`; // Diameter of the size display circle
    sizeDisplay.style.height = `${size}px`; // Diameter of the size display circle
    sizeDisplay.style.backgroundColor = penColor; // Display circle color as pen color
    sizeDisplay.textContent = ''; // Clear text content

    penWidth = size;
    eraserWidth = size;

    updateToolSettings(); // Update settings if either tool is active
});

// Initialize size display
sizeSlider.dispatchEvent(new Event('input'));

// Start recording
recordButton.addEventListener('click', () => {
    recordedChunks = [];
    const stream = canvas.captureStream(); // Capture canvas stream
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = 'drawing.webm';
        downloadLink.textContent = 'Download Video';
        downloadLink.style.display = 'block'; // Show download link
    };

    mediaRecorder.start();
    recordButton.style.display = 'none';
    stopRecordButton.style.display = 'block';
    isRecording = true;
});

// Stop recording
stopRecordButton.addEventListener('click', () => {
    if (isRecording) {
        mediaRecorder.stop();
        recordButton.style.display = 'block';
        stopRecordButton.style.display = 'none';
        isRecording = false;
    }
});
