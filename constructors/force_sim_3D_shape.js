// Set canvas dimensions
function shape_resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  shape_drawShape(); // Redraw shape if it exists
}

// Initialize single shape object
let currentShape = null;

// Set the rectangle
function shape_setRectangle() {
  const maxX = parseFloat(document.getElementById('maxX').value);
  const maxY = parseFloat(document.getElementById('maxY').value);
  const maxZ = parseFloat(document.getElementById('maxZ').value); 
  
if (maxX === '' || maxY === '' || maxZ === '' || isNaN(maxX) || isNaN(maxY) || isNaN(maxZ)) {
    alert('Please enter valid numeric coordinates');
    return;
  }
  
  if (maxX <= 0 || maxY <= 0 || maxZ <= 0) {
    alert('Max values must be greater than 0');
    return;
  }
  
  const minPoint = [0, 0, 0]; // Fixed at origin, including depth
  const maxPoint = [maxX, maxY, maxZ];
  
  // Create rectangle coordinates (same as before for x,y)
  const rectangleCoords = [
    [minPoint[0], minPoint[1]], // bottom-left
    [maxPoint[0], minPoint[1]], // bottom-right
    [maxPoint[0], maxPoint[1]], // top-right
    [minPoint[0], maxPoint[1]], // top-left
    [minPoint[0], minPoint[1]]  // back to bottom-left to close
  ];
  
  // Set the current shape with depth information
  currentShape = {
    type: 'rectangle',
    coordinates: rectangleCoords,
    color: 'rgba(101, 150, 223, 0.6)',
    bounds: {
      minX: minPoint[0],
      minY: minPoint[1],
      minZ: minPoint[2],
      maxX: maxPoint[0],
      maxY: maxPoint[1],
      maxZ: maxPoint[2]
    }
  };
  
  // Update UI
  shape_updateRectangleInfo();
  shape_drawShape();
}

// Update the rectangle info display
function shape_updateRectangleInfo() {
  const info = document.getElementById('rectInfo');
  if (currentShape) {
    const bounds = currentShape.bounds;
    info.innerHTML = `<strong>Current shape dimensions (in m):</strong><br>
                     X: (0 to ${bounds.maxX}), 
                     Y: (0 to ${bounds.maxY}), 
                     Z: (0 to ${bounds.maxZ})`;
  } else {
    info.innerHTML = '<strong>Current shape dimensions (in m):</strong><br> None';
  }
}

// Draw the shape
function shape_drawShape() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!currentShape) return;
    
    const scaledCoords = shape_scaleCoordinatesToCanvas(currentShape.coordinates);
    
    // Calculate the shape's center
    const shapeCenterX = (Math.min(...scaledCoords.map(c => c[0])) + Math.max(...scaledCoords.map(c => c[0]))) / 2;
    const shapeCenterY = (Math.min(...scaledCoords.map(c => c[1])) + Math.max(...scaledCoords.map(c => c[1]))) / 2;
    
    // Calculate the canvas center
    const canvasCenterX = canvas.width / 2;
    const canvasCenterY = canvas.height / 2;
    
    // Calculate the offset to center the shape
    const offsetX = canvasCenterX - shapeCenterX;
    const offsetY = canvasCenterY - shapeCenterY;
    
    // Apply the offset to the scaled coordinates
    const centeredCoords = scaledCoords.map(coord => [
        coord[0] + offsetX,
        coord[1] + offsetY
    ]);
    
    // Fill rectangle
    ctx.fillStyle = currentShape.color;
    ctx.beginPath();
    ctx.moveTo(centeredCoords[0][0], centeredCoords[0][1]);
    for (let i = 1; i < centeredCoords.length; i++) {
        ctx.lineTo(centeredCoords[i][0], centeredCoords[i][1]);
    }
    ctx.closePath();
    ctx.fill();
    
    // Stroke rectangle
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Scale coordinates to fit canvas
function shape_scaleCoordinatesToCanvas(coords) {
    if (!coords || coords.length === 0) return [];
    
    let minX = Math.min(...coords.map(c => c[0]));
    let maxX = Math.max(...coords.map(c => c[0]));
    let minY = Math.min(...coords.map(c => c[1]));
    let maxY = Math.max(...coords.map(c => c[1]));
    
    // Add padding
    const padding = 50;
    
    // Calculate scale factors
    const scaleX = (canvas.width - padding * 2) / Math.max(1, maxX - minX);
    const scaleY = (canvas.height - padding * 2) / Math.max(1, maxY - minY);
    const scale = Math.min(scaleX, scaleY);
    
    return coords.map(coord => [
        padding + (coord[0] - minX) * scale,
        canvas.height - padding - (coord[1] - minY) * scale
    ]);
}

// Convert world coordinates to canvas coordinates
function shape_worldToCanvasCoordinates(worldX, worldY) {
  if (!currentShape) return { x: 0, y: 0 };
  
  // Get the bounds of the shape in world space
  const bounds = currentShape.bounds;
  const worldWidth = bounds.maxX - bounds.minX;
  const worldHeight = bounds.maxY - bounds.minY;
  
  // Calculate the scale and padding for canvas
  const padding = 50;
  const availableWidth = canvas.width - padding * 2;
  const availableHeight = canvas.height - padding * 2;
  const scaleX = availableWidth / worldWidth;
  const scaleY = availableHeight / worldHeight;
  const scale = Math.min(scaleX, scaleY);
  
  // Calculate shape center on canvas
  const scaledShape = shape_scaleCoordinatesToCanvas(currentShape.coordinates);
  const shapeCenterX = (Math.min(...scaledShape.map(c => c[0])) + Math.max(...scaledShape.map(c => c[0]))) / 2;
  const shapeCenterY = (Math.min(...scaledShape.map(c => c[1])) + Math.max(...scaledShape.map(c => c[1]))) / 2;
  const canvasCenterX = canvas.width / 2;
  const canvasCenterY = canvas.height / 2;
  const offsetX = canvasCenterX - shapeCenterX;
  const offsetY = canvasCenterY - shapeCenterY;
  
  // Convert the coordinates
  return {
    x: padding + (worldX - bounds.minX) * scale + offsetX,
    y: canvas.height - padding - (worldY - bounds.minY) * scale
  };
}



// Create and download shapefile
function shape_createShapefile() {
  if (!currentShape) {
    alert('Please create a shape first');
    return;
  }
  
  // Create shapefile content
  const shapefileData = {
    type: "FeatureCollection",
    features: [{
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [currentShape.coordinates]
      },
      properties: {
        id: 1,
        type: currentShape.type,
        minX: currentShape.bounds.minX,
        minY: currentShape.bounds.minY,
        minZ: currentShape.bounds.minZ,
        maxX: currentShape.bounds.maxX,
        maxY: currentShape.bounds.maxY,
        maxZ: currentShape.bounds.maxZ,
        width: currentShape.bounds.maxX - currentShape.bounds.minX,
        height: currentShape.bounds.maxY - currentShape.bounds.minY,
        depth: currentShape.bounds.maxZ - currentShape.bounds.minZ,
        area: (currentShape.bounds.maxX - currentShape.bounds.minX) * (currentShape.bounds.maxY - currentShape.bounds.minY),
        volume: (currentShape.bounds.maxX - currentShape.bounds.minX) * (currentShape.bounds.maxY - currentShape.bounds.minY) * (currentShape.bounds.maxZ - currentShape.bounds.minZ)
      }
    }]
  };
  
  // Convert to JSON string
  const jsonString = JSON.stringify(shapefileData, null, 2);
  
  // Create blob and download
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `simulation_shape_${Date.now()}.geojson`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log('Shapefile created and downloaded successfully');
}

// Create SpatRaster compatible raster file
function shape_createSpatRaster() {
  if (!currentShape) {
    alert('Please create a shape first');
    return;
  }
  
  // Get raster parameters
  const resolution = parseFloat(prompt('Enter raster resolution (meters per pixel):', '1')) || 1;
  const bounds = currentShape.bounds;
  
  // Calculate raster dimensions
  const width = Math.ceil((bounds.maxX - bounds.minX) / resolution);
  const height = Math.ceil((bounds.maxY - bounds.minY) / resolution);
  
  // Create raster data (1 inside shape, 0 outside)
  const rasterData = [];
  for (let row = 0; row < height; row++) {
    const rowData = [];
    for (let col = 0; col < width; col++) {
      const x = bounds.minX + col * resolution;
      const y = bounds.maxY - row * resolution; // Flip Y axis for raster
      
      // Check if point is inside rectangle
      const inside = (x >= bounds.minX && x <= bounds.maxX && 
                     y >= bounds.minY && y <= bounds.maxY) ? 1 : 0;
      rowData.push(inside);
    }
    rasterData.push(rowData);
  }
  
  // Create raster metadata
  const rasterMetadata = {
    type: "raster",
    dimensions: {
      width: width,
      height: height,
      layers: 1
    },
    extent: {
      xmin: bounds.minX,
      xmax: bounds.maxX,
      ymin: bounds.minY,
      ymax: bounds.maxY
    },
    resolution: {
      x: resolution,
      y: resolution
    },
    crs: "EPSG:4326", // WGS84, adjust as needed
    noDataValue: -9999,
    data: rasterData,
    properties: {
      minZ: bounds.minZ,
      maxZ: bounds.maxZ,
      depth: bounds.maxZ - bounds.minZ,
      created: new Date().toISOString(),
      source: "3D Shape Simulation"
    }
  };
  
  // Convert to JSON string
  const jsonString = JSON.stringify(rasterMetadata, null, 2);
  
  // Create blob and download
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `simulation_raster_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log('SpatRaster-compatible file created and downloaded successfully');
}


// Function to create GeoJSON data from currentShape
function download_data_createShapefileData() {
    if (!currentShape) {
        return JSON.stringify({
            type: "FeatureCollection",
            features: []
        });
    }
    
    // Use the same structure as shape_createShapefile() for consistency
    const shapefileData = {
        type: "FeatureCollection",
        features: [{
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [currentShape.coordinates]
            },
            properties: {
                id: 1,
                type: currentShape.type,
                name: currentShape.name || "Simulation Area",
                description: currentShape.description || "Fish simulation boundary",
                minX: currentShape.bounds.minX,
                minY: currentShape.bounds.minY,
                minZ: currentShape.bounds.minZ,
                maxX: currentShape.bounds.maxX,
                maxY: currentShape.bounds.maxY,
                maxZ: currentShape.bounds.maxZ,
                width: currentShape.bounds.maxX - currentShape.bounds.minX,
                height: currentShape.bounds.maxY - currentShape.bounds.minY,
                depth: currentShape.bounds.maxZ - currentShape.bounds.minZ,
                area: (currentShape.bounds.maxX - currentShape.bounds.minX) * (currentShape.bounds.maxY - currentShape.bounds.minY),
                volume: (currentShape.bounds.maxX - currentShape.bounds.minX) * (currentShape.bounds.maxY - currentShape.bounds.minY) * (currentShape.bounds.maxZ - currentShape.bounds.minZ),
                created: new Date().toISOString()
            }
        }]
    };
    
    return JSON.stringify(shapefileData, null, 2);
}




// Clear the rectangle
function shape_clearRectangle() {
  currentShape = null;
  shape_updateRectangleInfo();
  shape_drawShape();
}








