const radarCanvas = document.getElementById('radarCanvas');
const radarCtx = radarCanvas.getContext('2d');

const entryCanvas = document.getElementById('entryCanvas');
const entryCtx = entryCanvas.getContext('2d');

const radarCenterX = radarCanvas.width / 2;
const radarCenterY = radarCanvas.height / 2;
const radarRadius = (radarCanvas.width / 2) - 50;

const unitDistance = radarRadius / 5; // Divide the circle into 5 units
const numDirections = 12; // Number of directions to mark (e.g., 12 for every 30 degrees)

let rotationAngle = 0;
const tracePositions = [];

let isMouseInEntryCanvas = false;
let entryX = 0;
let entryY = 0;
let isDotBright = false;

function drawRadar() {
  // Clear the radar canvas with black background
  radarCtx.fillStyle = 'black';
  radarCtx.fillRect(0, 0, radarCanvas.width, radarCanvas.height);

  // Draw the radar circle (transparent bright green)
  radarCtx.beginPath();
  radarCtx.arc(radarCenterX, radarCenterY, radarRadius, 0, 2 * Math.PI);
  radarCtx.fillStyle = 'rgba(19, 136, 8, 0.6)';
  radarCtx.fill();

  // Draw the rotating beam (pine green)
  radarCtx.beginPath();
  radarCtx.moveTo(radarCenterX, radarCenterY);
  const beamEndX = radarCenterX + radarRadius * Math.cos(rotationAngle);
  const beamEndY = radarCenterY + radarRadius * Math.sin(rotationAngle);
  radarCtx.lineTo(beamEndX, beamEndY);
  radarCtx.strokeStyle = 'rgba(76, 197, 23)';
  radarCtx.lineWidth = 2;
  radarCtx.stroke();

  // Draw the circle units
  for (let i = 1; i <= 5; i++) {
    const radius = i * unitDistance;
    radarCtx.beginPath();
    radarCtx.arc(radarCenterX, radarCenterY, radius, 0, 2 * Math.PI);
    radarCtx.strokeStyle = 'rgba(76, 197, 23, 0.5)';
    radarCtx.lineWidth = 1;
    radarCtx.stroke();
  }

  // Draw the direction lines and labels
  radarCtx.font = '12px Arial';
  for (let i = 0; i < numDirections; i++) {
    const directionAngle = (Math.PI * 2 * i) / numDirections;
    const directionX = radarCenterX + radarRadius * Math.cos(directionAngle);
    const directionY = radarCenterY + radarRadius * Math.sin(directionAngle);
    
    radarCtx.beginPath();
    radarCtx.moveTo(radarCenterX, radarCenterY);
    radarCtx.lineTo(directionX, directionY);
    radarCtx.strokeStyle = 'rgba(76, 197, 23, 0.5)';
    radarCtx.lineWidth = 1;
    radarCtx.stroke();
    
    const labelX = directionX + (Math.cos(directionAngle) * 20);
    const labelY = directionY + (Math.sin(directionAngle) * 20);
    radarCtx.fillStyle = 'rgba(76, 197, 23, 0.8)';
    radarCtx.fillText(`${360 / numDirections * i}°`, labelX, labelY);
  }

  // Update trace positions
  tracePositions.push({ x: beamEndX, y: beamEndY });

  // Draw traces
  radarCtx.strokeStyle = 'rgba(0, 128, 0, 0.5)';
  for (let i = 0; i < tracePositions.length; i++) {
    radarCtx.beginPath();
    radarCtx.moveTo(radarCenterX, radarCenterY);
    radarCtx.lineTo(tracePositions[i].x, tracePositions[i].y);
    radarCtx.stroke();
  }

  // Remove old traces
  if (tracePositions.length > 50) {
    tracePositions.shift();
  }

  // Update rotation angle for the next frame
  rotationAngle += 0.01;
  requestAnimationFrame(drawRadar);

  // If the mouse is in the entry canvas, draw the entry dot on the radar
  if (isMouseInEntryCanvas) {
    drawEntryDotOnRadar();
  }
}

function drawEntryDotOnRadar() {
  // Clear the entry canvas
  entryCtx.clearRect(0, 0, entryCanvas.width, entryCanvas.height);

  // Calculate the corresponding coordinates on the radar for the entry point
  const dx = entryX - radarCenterX;
  const dy = entryY - radarCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);
  const normalizedDistance = distance / radarRadius;

  // Draw a point on the radar canvas based on the distance from radar center
  radarCtx.beginPath();
  const radarEntryX = radarCenterX + normalizedDistance * radarRadius * Math.cos(angle);
  const radarEntryY = radarCenterY + normalizedDistance * radarRadius * Math.sin(angle);

  // Calculate the angle between the rotating beam and the mouse position on the radar
  const mouseAngle = Math.atan2(entryY - radarCenterY, entryX - radarCenterX);
  const beamMouseAngleDiff = Math.abs(mouseAngle - rotationAngle);
  
  // Determine if the dot should be bright
  isDotBright = beamMouseAngleDiff < (10 * Math.PI / 180);

  // Adjust the dot color based on whether it's bright or normal
  if (isDotBright) {
    radarCtx.fillStyle = 'lime';
  } else {
    radarCtx.fillStyle = 'green';
  }

  radarCtx.arc(radarEntryX, radarEntryY, 5, 0, 2 * Math.PI);
  radarCtx.fill();

  // Draw a line connecting radar center to the entry point
  radarCtx.beginPath();
  radarCtx.moveTo(radarCenterX, radarCenterY);
  radarCtx.lineTo(radarEntryX, radarEntryY);
  radarCtx.strokeStyle = 'green';
  radarCtx.lineWidth = 2;
  radarCtx.stroke();
}

// Mousemove event listener for the entry canvas
entryCanvas.addEventListener('mousemove', function(event) {
  isMouseInEntryCanvas = true;
  const rect = entryCanvas.getBoundingClientRect();
  entryX = event.clientX - rect.left;
  entryY = event.clientY - rect.top;
});

// Mouseout event listener for the entry canvas
entryCanvas.addEventListener('mouseout', function() {
  isMouseInEntryCanvas = false;
});

drawRadar();
