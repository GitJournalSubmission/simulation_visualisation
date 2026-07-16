// Receiver class
class Receiver {
  static idCounter = 1;

  constructor(x, y) {
    this.id = Receiver.idCounter++;
    this.x = x;
    this.y = y;
    this.z = currentShape.bounds.maxZ/2; // Always at half depth
    this.size = 8; // Size of receiver icon
    this.color = '#32CD32'; // Lime green for receivers
    this.detectionRange = detectionRange; // Detection range in meters
    this.detections = []; // Array to store fish detections
    
  }
}


// Create receivers in an equidistant grid layout
function receiver_createReceiversEquidistant(count) {
  if (!currentShape) return;

  // Calculate the number of rows and columns for a roughly square grid
  const aspectRatio = (currentShape.bounds.maxX - currentShape.bounds.minX) /
                     (currentShape.bounds.maxY - currentShape.bounds.minY);

  let cols = Math.round(Math.sqrt(count * aspectRatio));
  let rows = Math.round(count / cols);

  // Adjust if we have too few or too many slots
  while (rows * cols < count) {
    cols++;
  }

  // Calculate spacing
  const spacingX = (currentShape.bounds.maxX - currentShape.bounds.minX) / (cols + 1);
  const spacingY = (currentShape.bounds.maxY - currentShape.bounds.minY) / (rows + 1);

  // Place receivers in grid
  let placedCount = 0;

  for (let row = 1; row <= rows && placedCount < count; row++) {
    for (let col = 1; col <= cols && placedCount < count; col++) {
      // Calculate base position
      let x = currentShape.bounds.minX + spacingX * col;
      let y = currentShape.bounds.minY + spacingY * row;

      // Apply placing error as a random offset
      if (typeof placingError !== 'undefined' && placingError > 0) {
        // Error is a percentage of spacing
        const maxOffsetX = spacingX * (placingError / 100);
        const maxOffsetY = spacingY * (placingError / 100);
        x += (receiverRandom() - 0.5) * 2 * maxOffsetX;
        y += (receiverRandom() - 0.5) * 2 * maxOffsetY;
      }

      if (fish_isPointInShape(x, y, currentShape)) {
        receivers.push(new Receiver(x, y));
        placedCount++;
      }
    }
  }

  // If the simulation is already running, it will include receivers
  // Otherwise just draw them on the canvas
  if (fishCreated) {
    startSimulation();
  } else {
    receiver_drawShapeWithReceivers();
  }
}

function receiver_createReceiversVPS(count) {
  if (!currentShape) return;

  // Use detection range for VPS spacing
  const spacingX = detectionRange;
  const spacingY = detectionRange;
  const minX = currentShape.bounds.minX;
  const maxX = currentShape.bounds.maxX;
  const minY = currentShape.bounds.minY;
  const maxY = currentShape.bounds.maxY;

  // Calculate number of columns and rows for a roughly square grid
  const aspectRatio = (maxX - minX) / (maxY - minY);
  let cols = Math.round(Math.sqrt(count * aspectRatio));
  let rows = Math.round(count / cols);

  // Adjust if we have too few or too many slots
  while (rows * cols < count) {
    cols++;
  }

  // Center the grid: same logic as equidistant, but with VPS spacing
  const offsetX = (maxX - minX - spacingX * (cols - 1)) / 2 + minX;
  const offsetY = (maxY - minY - spacingY * (rows - 1)) / 2 + minY;

  let placedCount = 0;
  receivers = [];
  Receiver.idCounter = 1;

  // Try grid positions, only add if inside shape
  for (let row = 0; row < rows && placedCount < count; row++) {
    for (let col = 0; col < cols && placedCount < count; col++) {
      let x = offsetX + spacingX * col;
      let y = offsetY + spacingY * row;

      // Apply placing error as a random offset (if below 5%)
      if (typeof placingError !== 'undefined' && placingError > 0 && placingError < 11) {
        const maxOffsetX = spacingX * (placingError / 100);
        const maxOffsetY = spacingY * (placingError / 100);
        x += (receiverRandom() - 0.5) * 2 * maxOffsetX;
        y += (receiverRandom() - 0.5) * 2 * maxOffsetY;
      }

      if (fish_isPointInShape(x, y, currentShape)) {
        receivers.push(new Receiver(x, y));
        placedCount++;
      }
    }
  }

  // If not enough receivers, fill remaining in center (inside shape)
  while (placedCount < count) {
    let x = (minX + maxX) / 2;
    let y = (minY + maxY) / 2;
    if (fish_isPointInShape(x, y, currentShape)) {
      receivers.push(new Receiver(x, y));
      placedCount++;
    } else {
      // Find a random point inside the shape
      let found = false;
      for (let tries = 0; tries < 100 && !found; tries++) {
        let rx = minX + Math.random() * (maxX - minX);
        let ry = minY + Math.random() * (maxY - minY);
        if (fish_isPointInShape(rx, ry, currentShape)) {
          receivers.push(new Receiver(rx, ry));
          placedCount++;
          found = true;
        }
      }
      if (!found) break; // Give up if can't find a spot
    }
  }

  if (fishCreated) {
    startSimulation();
  } else {
    receiver_drawShapeWithReceivers();
  }
}





// Update createReceivers function to use the new dedicated functions
function receiver_createReceivers(count) {
  receiver_createReceiversEquidistant(count);
}

// Update all receivers' detection ranges
function receiver_updateReceiversRange(newRange) {
  receivers.forEach(receiver => {
    receiver.detectionRange = newRange;
  });
  
  // Redraw if needed
  if (fishCreated) {
    startSimulation();
  } else if (receivers.length > 0) {
    receiver_drawShapeWithReceivers();
  }
}

// Update the receiver information display
function receiver_updateReceiverInfo() {
  const info = document.getElementById('receiverInfo');
  if (info) {
    info.innerHTML = `<strong>Receivers placed:</strong> ${receivers.length}`;
  }
}

// Draw shape with receivers
function receiver_drawShapeWithReceivers() {
  shape_drawShape();
  
  // Get show detection ranges state
  const toggleBtn = document.getElementById('toggleDetection');
  const showDetectionRanges = toggleBtn && toggleBtn.textContent.includes('Hide');
  
  // Draw all receivers
  receivers.forEach(receiver => {
    receiver_drawReceiver(receiver, showDetectionRanges);
  });
}

// Draw a receiver on canvas
function receiver_drawReceiver(receiver, showDetectionRange = false) {
  // Convert receiver coordinates from world space to canvas space
  const receiverCanvasPos = shape_worldToCanvasCoordinates(receiver.x, receiver.y);
  
  // Draw detection range if enabled
  if (showDetectionRange) {
    // Calculate detection range radius in canvas coordinates
    const testPoint = shape_worldToCanvasCoordinates(
      receiver.x + receiver.detectionRange, 
      receiver.y
    );
    const rangeRadius = Math.abs(testPoint.x - receiverCanvasPos.x);
    
    // Set a consistent color for all receivers
    const baseColor = '#4287f5'; // Blue color for all receivers
    
   
    
    // Draw the outer stroke for full range
    ctx.strokeStyle = `rgba(66, 135, 245, 0.4)`;
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw the 80% detection probability range (user-specified detection range)
    // Highlighted with a thicker border
    ctx.beginPath();
    ctx.arc(receiverCanvasPos.x, receiverCanvasPos.y, rangeRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(66, 135, 245, 0.9)`;
    ctx.lineWidth = 3; // Thicker line for emphasis
    ctx.stroke();
    
    
  }

  // Only draw the receiver ID label if the toggle is enabled
  if (showReceiverLabels) {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${receiver.id}`, receiverCanvasPos.x, receiverCanvasPos.y);
  }
  
  // Draw receiver body (square)
  ctx.fillStyle = receiver.color;
  ctx.fillRect(
    receiverCanvasPos.x - receiver.size/2, 
    receiverCanvasPos.y - receiver.size/2, 
    receiver.size, 
    receiver.size
  );
  
  // Draw border
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 1;
  ctx.strokeRect(
    receiverCanvasPos.x - receiver.size/2, 
    receiverCanvasPos.y - receiver.size/2, 
    receiver.size, 
    receiver.size
  );
}
