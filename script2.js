const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// States
let isDrawing = false;
let tool = 'pen'; // Default tool is pen
let undoStack = [];
let redoStack = [];
let penColor = '#000000'; // Default pen color
let toolSize = 5; // Size for both pen and eraser

// Save the current state of the canvas in the undo stack
function saveState() {
    undoStack.push(canvas.toDataURL());
    redoStack = []; // Clear redo stack whenever a new action is performed
}

// Restore the canvas state from a given data URL
function restoreState(url) {
    const img = new Image();
    img.src = url;
    img.onload = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
}

// Start drawing on the canvas
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    saveState();
    ctx.beginPath();
    ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
});

// Draw or erase based on the selected tool
canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        if (tool === 'pen') {
            ctx.strokeStyle = penColor;
            ctx.lineWidth = toolSize;
        } else if (tool === 'eraser') {
            ctx.strokeStyle = 'white'; // Assuming canvas background is white
            ctx.lineWidth = toolSize;
        }
        ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        ctx.stroke();
    }
});

// Stop drawing
canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    ctx.closePath();
});

// Undo the last action
function undo() {
    if (undoStack.length > 0) {
        redoStack.push(undoStack.pop());
        if (undoStack.length > 0) {
            restoreState(undoStack[undoStack.length - 1]);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas if no more undos
        }
    }
}

// Redo the last undone action
function redo() {
    if (redoStack.length > 0) {
        const state = redoStack.pop();
        restoreState(state);
        undoStack.push(state); // Move the state back to the undo stack
    }
}

// Delete all drawings
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    undoStack = []; // Clear the undo stack
    redoStack = []; // Clear the redo stack
}

// Set the tool (pen or eraser)
function setTool(selectedTool) {
    tool = selectedTool;
}

// Set pen color
function setPenColor(color) {
    penColor = color;
}

// Set tool size (for both pen and eraser)
function setToolSize(size) {
    toolSize = size;
}

// Bind to the buttons
document.getElementById('undoBtn').addEventListener('click', undo);
document.getElementById('redoBtn').addEventListener('click', redo);
document.getElementById('penBtn').addEventListener('click', () => setTool('pen'));
document.getElementById('eraserBtn').addEventListener('click', () => setTool('eraser'));
document.getElementById('deleteBtn').addEventListener('click', clearCanvas);

// Pen color change
document.getElementById('penColorPicker').addEventListener('input', (e) => {
    setPenColor(e.target.value);
});

// Tool size change
document.getElementById('sizeSlider').addEventListener('input', (e) => {
    setToolSize(e.target.value);
    updateSliderDisplay(e.target.value);
});

// Update the slider display to show a circle with the current tool size
function updateSliderDisplay(size) {
    const slider = document.getElementById('sizeSlider');
    slider.style.backgroundSize = `${size / 2}px ${size / 2}px`;
}

// Initialize the slider display
updateSliderDisplay(toolSize);

//color palatte
// Function to set the pen color
function setPenColor(color) {
    penColor = color;
}

// Event listeners for color buttons
document.querySelectorAll('.color-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        setPenColor(e.target.dataset.color);
    });
});

// Drawing on canvas
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
});

canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        ctx.strokeStyle = penColor; // Apply the pen color
        ctx.lineWidth = penSize; // Apply the pen size
        ctx.stroke();
    }
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    ctx.closePath();
});