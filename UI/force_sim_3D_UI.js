// Set up the UI
function setupUI_shape() {
    // Create container for coordinate inputs
    const container = document.createElement('div');
    container.id = 'shapeUI';
    container.style.position = 'fixed';
    container.style.top = '1vh';
    container.style.left = '20px';
    container.style.backgroundColor = '#032632';
    container.style.padding = '15px';
    container.style.borderRadius = '8px';
    container.style.color = '#b2c2c2';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.zIndex = '100';
    container.style.width = '450px';
    container.style.boxSizing = 'border-box';
    container.style.height = '100vh';
    container.style.overflowY = 'auto';
    document.body.appendChild(container);

    // Create title
    const title = document.createElement('h3');
    title.textContent = 'Simulation settings';
    title.style.margin = '0 0 15px 0';
    container.appendChild(title);

    // Random seed input (kept outside the Study area box, directly in container)
    const seedRow = document.createElement('div');
    seedRow.style.display = 'flex';
    seedRow.style.alignItems = 'center';
    seedRow.style.marginBottom = '10px';
    container.appendChild(seedRow);

    const seedLabel = document.createElement('label');
    seedLabel.htmlFor = 'randomSeed';
    seedLabel.textContent = 'Random seed (numeric):';
    seedLabel.style.marginRight = '10px';
    seedRow.appendChild(seedLabel);

    const seedInput = document.createElement('input');
    seedInput.type = 'number';
    seedInput.id = 'randomSeed';
    seedInput.placeholder = 'Optional';
    seedInput.style.width = '80px';
    seedInput.style.padding = '5px';
    seedInput.style.marginRight = '10px';
    seedRow.appendChild(seedInput);

    const setSeedBtn = document.createElement('button');
    setSeedBtn.textContent = 'Set';
    setSeedBtn.type = 'button';
    setSeedBtn.style.padding = '5px 10px';
    setSeedBtn.style.backgroundColor = '#2aa0f2';
    setSeedBtn.style.color = '#ffffff';
    setSeedBtn.style.border = 'none';
    setSeedBtn.style.borderRadius = '4px';
    setSeedBtn.style.cursor = 'pointer';
    seedRow.appendChild(setSeedBtn);

    setSeedBtn.addEventListener('click', () => {
        seedValue = seedInput.value;
        if (seedValue && !isNaN(seedValue)) {
            setFishRandomSeed(parseInt(seedValue));
            setReceiverRandomSeed(parseInt(seedValue));
            alert('Random seed set to ' + seedValue);
        } else {
            alert('Please enter a valid seed value.');
        }
    });

    // Study area box
    const studyAreaSection = document.createElement('div');
    studyAreaSection.style.marginTop = '10px';
    studyAreaSection.style.border = '1px solid #0a6277';
    studyAreaSection.style.backgroundColor = '#1c364c';
    studyAreaSection.style.borderRadius = '6px';
    studyAreaSection.style.padding = '15px';
    studyAreaSection.style.boxSizing = 'border-box';
    container.appendChild(studyAreaSection);

    // Study area section title
    const studyAreaTitle = document.createElement('h3');
    studyAreaTitle.textContent = 'Study area';
    studyAreaTitle.style.margin = '0 0 15px 0';
    studyAreaSection.appendChild(studyAreaTitle);

    // Create input form — now correctly nested inside studyAreaSection
    const form = document.createElement('form');
    form.style.display = 'flex';
    form.style.flexDirection = 'column';
    form.style.gap = '10px';
    studyAreaSection.appendChild(form);

    // Instructions
    const instructions = document.createElement('p');
    instructions.textContent = 'Set X, Y and Z extend in meters';
    instructions.style.margin = '0 0 10px 0';
    instructions.style.fontSize = '14px';
    instructions.style.fontStyle = 'italic';
    form.appendChild(instructions);

    // Max X and Max Y coordinate inputs in the same row
    const coordinateRow = document.createElement('div');
    coordinateRow.style.display = 'flex';
    coordinateRow.style.gap = '10px';
    form.appendChild(coordinateRow);

    // Max X coordinate input
    const maxXLabel = document.createElement('label');
    maxXLabel.htmlFor = 'maxX';
    maxXLabel.textContent = 'X:';
    maxXLabel.style.display = 'flex';
    maxXLabel.style.alignItems = 'center';
    coordinateRow.appendChild(maxXLabel);
    const maxXInput = document.createElement('input');
    maxXInput.type = 'number';
    maxXInput.id = 'maxX';
    maxXInput.value = '10000';
    maxXInput.min = '10';
    maxXInput.step = '10';
    maxXInput.style.width = '60px';
    maxXInput.style.padding = '5px';
    coordinateRow.appendChild(maxXInput);

    // Max Y coordinate input
    const maxYLabel = document.createElement('label');
    maxYLabel.htmlFor = 'maxY';
    maxYLabel.textContent = 'Y:';
    maxYLabel.style.display = 'flex';
    maxYLabel.style.alignItems = 'center';
    coordinateRow.appendChild(maxYLabel);
    const maxYInput = document.createElement('input');
    maxYInput.type = 'number';
    maxYInput.id = 'maxY';
    maxYInput.value = '10000';
    maxYInput.min = '10';
    maxYInput.step = '10';
    maxYInput.style.width = '60px';
    maxYInput.style.padding = '5px';
    coordinateRow.appendChild(maxYInput);

    // Max Z (depth)
    const maxZLabel = document.createElement('label');
    maxZLabel.htmlFor = 'maxZ';
    maxZLabel.textContent = 'Z (Depth):';
    maxZLabel.style.display = 'flex';
    maxZLabel.style.alignItems = 'center';
    coordinateRow.appendChild(maxZLabel);
    const maxZInput = document.createElement('input');
    maxZInput.type = 'number';
    maxZInput.id = 'maxZ';
    maxZInput.value = '30';
    maxZInput.min = '1';
    maxZInput.step = '1';
    maxZInput.style.width = '60px';
    maxZInput.style.padding = '5px';
    coordinateRow.appendChild(maxZInput);

    // Create shape button
    const setBtn = document.createElement('button');
    setBtn.textContent = 'Create Shape';
    setBtn.style.marginTop = '10px';
    setBtn.style.padding = '5px';
    setBtn.style.backgroundColor = '#2aa0f2';
    setBtn.style.color = '#ffffff';
    setBtn.style.border = 'none';
    setBtn.style.borderRadius = '4px';
    setBtn.style.cursor = 'pointer';
    form.appendChild(setBtn);

    // Current rectangle info — now correctly nested inside studyAreaSection
    const rectInfo = document.createElement('div');
    rectInfo.id = 'rectInfo';
    rectInfo.style.marginTop = '15px';
    rectInfo.style.border = '1px solid #0a6277';
    rectInfo.style.padding = '5px';
    rectInfo.style.borderRadius = '4px';
    rectInfo.innerHTML = '<strong>Current shape dimensions (in m):</strong>';
    studyAreaSection.appendChild(rectInfo);

    // Button event handlers
    setBtn.addEventListener('click', (e) => {
        e.preventDefault();
        shape_setRectangle();
    });
}

function setupUI_fish() {
    // Calculate position based on shape UI height
    const container = document.querySelector('div[style*="position: fixed"]');    

    // Create fish controls section
    const fishSection = document.createElement('div');
    fishSection.style.marginTop = '20px';
    fishSection.style.border = '1px solid #0a6277';
    fishSection.style.backgroundColor = '#1c364c';
    fishSection.style.borderRadius = '6px';
    fishSection.style.padding = '15px';
    fishSection.style.boxSizing = 'border-box';
    container.appendChild(fishSection);
  
    // Fish section title
    const fishTitle = document.createElement('h3');
    fishTitle.textContent = 'Fish';
    fishTitle.style.margin = '0 0 15px 0';
    fishSection.appendChild(fishTitle);

    // Create a container for fish count and label control
    const fishControlContainer = document.createElement('div');
    fishControlContainer.style.display = 'flex';
    fishControlContainer.style.alignItems = 'center';
    fishControlContainer.style.gap = '20px'; // Add spacing between elements
    fishSection.appendChild(fishControlContainer);

    // Fish count input
    const fishCountInput = document.createElement('input');
    fishCountInput.type = 'number';
    fishCountInput.id = 'fishCount';
    fishCountInput.value = '5';
    fishCountInput.min = '0';
    fishCountInput.max = '100';
    fishCountInput.style.width = '50px';
    fishCountInput.style.padding = '5px';
    fishCountInput.style.marginBottom = '10px';
    fishControlContainer.appendChild(fishCountInput);

    // Add a label for fish count input
    const fishCountLabel = document.createElement('label');
    fishCountLabel.htmlFor = 'fishCount';
    fishCountLabel.textContent = 'Number of fish:';
    fishCountLabel.style.marginRight = '10px';
    fishCountLabel.style.paddingTop = '0px'; // Less/no padding on top
    fishControlContainer.insertBefore(fishCountLabel, fishCountInput);

    // Add a checkbox for toggling fish ID labels
    const labelToggleContainer = document.createElement('div');
    labelToggleContainer.style.display = 'flex';
    labelToggleContainer.style.alignItems = 'center';
    fishControlContainer.appendChild(labelToggleContainer);

    const labelToggle = document.createElement('input');
    labelToggle.type = 'checkbox';
    labelToggle.id = 'showFishLabels';
    labelToggle.checked = showFishLabels;
    labelToggle.style.marginRight = '8px';
    labelToggleContainer.appendChild(labelToggle);

    const labelToggleLabel = document.createElement('label');
    labelToggleLabel.htmlFor = 'showFishLabels';
    labelToggleLabel.textContent = 'ID labels';
    labelToggleContainer.appendChild(labelToggleLabel);

    // Add event listener for the toggle
    labelToggle.addEventListener('change', function() {
      showFishLabels = this.checked;
      // Redraw if simulation is running
      if (fishCreated && animationId) {
      // No need to restart simulation, just let the next frame use the new setting
      }
    });
    
    
    // Add line break for better layout
    fishSection.appendChild(document.createElement('br'));
    // Fish speed control
    const speedControlDiv = document.createElement('div');
    speedControlDiv.style.margin = '0px 0px';
    fishSection.appendChild(speedControlDiv);

    
    // Add tracking section title
    const trackingTitle = document.createElement('h4');
    trackingTitle.textContent = 'Exact fish position tracking';
    trackingTitle.style.margin = '0 0 10px 0';
    fishSection.appendChild(trackingTitle);

    // Tracking interval input
    const trackingIntervalLabel = document.createElement('label');
    trackingIntervalLabel.textContent = 'Tracking interval (seconds):';
    trackingIntervalLabel.style.display = 'block';
    trackingIntervalLabel.style.marginBottom = '10px';
    fishSection.appendChild(trackingIntervalLabel);

    const trackingIntervalInput = document.createElement('input');
    trackingIntervalInput.type = 'number';
    trackingIntervalInput.id = 'trackingInterval';
    trackingIntervalInput.value = '10';
    trackingIntervalInput.min = '1';
    trackingIntervalInput.max = '60';
    trackingIntervalInput.style.width = '50px';
    trackingIntervalInput.style.padding = '5px';
    trackingIntervalInput.style.marginLeft = '10px';
    trackingIntervalLabel.appendChild(trackingIntervalInput);

    // Status indicator
    const trackingStatus = document.createElement('div');
    trackingStatus.id = 'trackingStatus';
    trackingStatus.textContent = 'Tracking: Off';
    trackingStatus.style.marginBottom = '10px';
    trackingStatus.style.fontStyle = 'italic';
    fishSection.appendChild(trackingStatus);

    

    
// Movement Parameters Section as a dropdown
const movementParamsDropdown = document.createElement('details');
movementParamsDropdown.style.margin = '15px 0';
movementParamsDropdown.style.border = '1px solid #0a6277';
movementParamsDropdown.style.borderRadius = '4px';
movementParamsDropdown.style.padding = '8px'; // Optional: reduce padding for compact look
movementParamsDropdown.style.width = '100%'; // Fill parent width
movementParamsDropdown.style.boxSizing = 'border-box'; // Ensure border/padding included
fishSection.appendChild(movementParamsDropdown);

const summary = document.createElement('summary');
summary.textContent = 'Fish Movement Parameters';
summary.style.fontWeight = 'bold';
summary.style.fontSize = '16px';
summary.style.cursor = 'pointer';
movementParamsDropdown.appendChild(summary);

const movementParamsSection = document.createElement('div');
movementParamsSection.style.width = '100%'; // Fill parent width
movementParamsSection.style.boxSizing = 'border-box';
movementParamsDropdown.appendChild(movementParamsSection);

const socialRadiusDiv = document.createElement('div');
socialRadiusDiv.style.margin = '15px 0';
fishSection.appendChild(socialRadiusDiv);

const socialRadiusLabel = document.createElement('label');
socialRadiusLabel.htmlFor = 'socialRadiusMean';
socialRadiusLabel.textContent = 'Mean social radius (m):';
socialRadiusLabel.style.marginRight = '10px';
socialRadiusDiv.appendChild(socialRadiusLabel);

const socialRadiusInput = document.createElement('input');
socialRadiusInput.type = 'number';
socialRadiusInput.id = 'socialRadiusMean';
socialRadiusInput.value = '30';
socialRadiusInput.min = '1';
socialRadiusInput.max = '1000';
socialRadiusInput.step = '1';
socialRadiusInput.style.width = '60px';
socialRadiusInput.style.padding = '5px';
socialRadiusDiv.appendChild(socialRadiusInput);
socialRadiusDiv.appendChild(document.createElement('br'));


const socialRadiusStdLabel = document.createElement('label');
socialRadiusStdLabel.htmlFor = 'socialRadiusStd';
socialRadiusStdLabel.textContent = 'Std dev:';
socialRadiusStdLabel.style.marginRight = '10px';
socialRadiusDiv.appendChild(socialRadiusStdLabel);

const socialRadiusStdInput = document.createElement('input');
socialRadiusStdInput.type = 'number';
socialRadiusStdInput.id = 'socialRadiusStd';
socialRadiusStdInput.value = '10';
socialRadiusStdInput.min = '0';
socialRadiusStdInput.max = '500';
socialRadiusStdInput.step = '1';
socialRadiusStdInput.style.width = '60px';
socialRadiusStdInput.style.padding = '5px';
socialRadiusDiv.appendChild(socialRadiusStdInput);



const homeRangeDiv = document.createElement('div');
homeRangeDiv.style.margin = '15px 0';
fishSection.appendChild(homeRangeDiv);

const homeAreaLabel = document.createElement('label');
homeAreaLabel.htmlFor = 'homeAreaMean';
homeAreaLabel.textContent = 'Mean home range area (km²)';
homeAreaLabel.style.marginRight = '10px';
homeRangeDiv.appendChild(homeAreaLabel);

const homeAreaInput = document.createElement('input');
homeAreaInput.type = 'number';
homeAreaInput.id = 'homeAreaMean';
homeAreaInput.value = 10;
homeAreaInput.min = 1;
homeAreaInput.max = 1000;
homeAreaInput.step = 0.1;
homeAreaInput.style.width = '80px';
homeAreaInput.style.padding = '5px';
homeRangeDiv.appendChild(homeAreaInput);

homeRangeDiv.appendChild(document.createElement('br'));

const homeAreaStdLabel = document.createElement('label');
homeAreaStdLabel.htmlFor = 'homeAreaStdPercent';
homeAreaStdLabel.textContent = 'Std dev (% of area)';
homeAreaStdLabel.style.marginRight = '10px';
homeRangeDiv.appendChild(homeAreaStdLabel);

const homeAreaStdInput = document.createElement('input');
homeAreaStdInput.type = 'number';
homeAreaStdInput.id = 'homeAreaStdPercent';
homeAreaStdInput.value = 10;
homeAreaStdInput.min = 0;
homeAreaStdInput.max = 100;
homeAreaStdInput.step = 1;
homeAreaStdInput.style.width = '60px';
homeAreaStdInput.style.padding = '5px';
homeRangeDiv.appendChild(homeAreaStdInput);



// Create tabs for Active and Resting states
const tabContainer = document.createElement('div');
tabContainer.style.display = 'flex';
tabContainer.style.marginTop = '10px';
tabContainer.style.marginBottom = '10px';
movementParamsSection.appendChild(tabContainer);

const activeTab = document.createElement('div');
activeTab.textContent = 'Active State';
activeTab.className = 'param-tab active-tab';
activeTab.style.padding = '5px 10px';
activeTab.style.backgroundColor = '#2aa0f2';
activeTab.style.color = 'white';
activeTab.style.borderRadius = '4px 0 0 4px';
activeTab.style.cursor = 'pointer';
tabContainer.appendChild(activeTab);

const restingTab = document.createElement('div');
restingTab.textContent = 'Resting State';
restingTab.className = 'param-tab';
restingTab.style.padding = '5px 10px';
restingTab.style.backgroundColor = '#666';
restingTab.style.color = 'white';
restingTab.style.borderRadius = '0 4px 4px 0';
restingTab.style.cursor = 'pointer';
tabContainer.appendChild(restingTab);

// Create parameter panels
const activePanel = document.createElement('div');
activePanel.id = 'activePanel';
activePanel.style.display = 'block';
movementParamsSection.appendChild(activePanel);

const restingPanel = document.createElement('div');
restingPanel.id = 'restingPanel';
restingPanel.style.display = 'none';
movementParamsSection.appendChild(restingPanel);

// --- Add state duration controls ---
const stateDurationDiv = document.createElement('div');
stateDurationDiv.style.margin = '15px 0 10px 0';
stateDurationDiv.style.display = 'grid';
stateDurationDiv.style.gridTemplateColumns = 'auto 80px'; // label column, input column
stateDurationDiv.style.rowGap = '8px';
stateDurationDiv.style.columnGap = '10px';
stateDurationDiv.style.alignItems = 'center';
movementParamsSection.appendChild(stateDurationDiv);

const restingDurationLabel = document.createElement('label');
restingDurationLabel.textContent = 'Resting state duration (seconds):';
restingDurationLabel.style.marginRight = '10px';
stateDurationDiv.appendChild(restingDurationLabel);

const restingDurationInput = document.createElement('input');
restingDurationInput.type = 'number';
restingDurationInput.id = 'restingDuration';
restingDurationInput.value = '170';
restingDurationInput.min = '1';
restingDurationInput.style.width = '60px';
restingDurationInput.style.marginRight = '60px';
stateDurationDiv.appendChild(restingDurationInput);

const activeDurationLabel = document.createElement('label');
activeDurationLabel.textContent = 'Active state duration (seconds):';
activeDurationLabel.style.marginRight = '10px';
stateDurationDiv.appendChild(activeDurationLabel);

const activeDurationInput = document.createElement('input');
activeDurationInput.type = 'number';
activeDurationInput.id = 'activeDuration';
activeDurationInput.value = '30';
activeDurationInput.min = '1';
activeDurationInput.style.width = '60px';
stateDurationDiv.appendChild(activeDurationInput);

// --- Add state transition probability controls ---
const probDiv = document.createElement('div');
probDiv.style.margin = '10px 0';
movementParamsSection.appendChild(probDiv);

probDiv.innerHTML = `
  <label><strong>State transition probabilities (%):</strong></label><br>
  <label>Resting → Resting: <input type="number" id="probRestRest" value="80" min="0" max="100" style="width:60px;"></label><br>
  <label>Resting → Active: <input type="number" id="probRestActive" value="20" min="0" max="100" style="width:60px; margin-left:10px;"></label><br>
  <label>Active → Active: <input type="number" id="probActiveActive" value="20" min="0" max="100" style="width:60px;"></label><br>
  <label>Active → Resting: <input type="number" id="probActiveRest" value="80" min="0" max="100" style="width:60px; margin-left:10px;"></label>
`;

// Store config globally
window.fishStateConfig = {
  restingDuration: parseInt(restingDurationInput.value),
  activeDuration: parseInt(activeDurationInput.value),
  probRestRest: parseInt(document.getElementById('probRestRest').value),
  probRestActive: parseInt(document.getElementById('probRestActive').value),
  probActiveActive: parseInt(document.getElementById('probActiveActive').value),
  probActiveRest: parseInt(document.getElementById('probActiveRest').value)
};

// Update config on change
restingDurationInput.addEventListener('input', () => {
  window.fishStateConfig.restingDuration = parseInt(restingDurationInput.value);
});
activeDurationInput.addEventListener('input', () => {
  window.fishStateConfig.activeDuration = parseInt(activeDurationInput.value);
});
document.getElementById('probRestRest').addEventListener('input', e => {
  window.fishStateConfig.probRestRest = parseInt(e.target.value);
});
document.getElementById('probRestActive').addEventListener('input', e => {
  window.fishStateConfig.probRestActive = parseInt(e.target.value);
});
document.getElementById('probActiveActive').addEventListener('input', e => {
  window.fishStateConfig.probActiveActive = parseInt(e.target.value);
});
document.getElementById('probActiveRest').addEventListener('input', e => {
  window.fishStateConfig.probActiveRest = parseInt(e.target.value);
});

// Tab switching functionality
activeTab.addEventListener('click', () => {
  activeTab.style.backgroundColor = '#2aa0f2';
  restingTab.style.backgroundColor = '#666';
  activePanel.style.display = 'block';
  restingPanel.style.display = 'none';
});

restingTab.addEventListener('click', () => {
  activeTab.style.backgroundColor = '#666';
  restingTab.style.backgroundColor = '#2aa0f2';
  activePanel.style.display = 'none';
  restingPanel.style.display = 'block';
});

// Helper function to create parameter controls
function createParameterControl(panel, paramName, displayName, min, max, step, defaultValue, description) {
  const controlDiv = document.createElement('div');
  controlDiv.style.margin = '10px 0';
  panel.appendChild(controlDiv);

  const label = document.createElement('label');
  label.htmlFor = `${panel.id}_${paramName}`;
  label.innerHTML = `${displayName}:`;
  label.style.display = 'block';
  label.style.marginBottom = '5px';
  controlDiv.appendChild(label);

  const valueDisplay = document.createElement('span');
  valueDisplay.id = `${panel.id}_${paramName}_value`;
  valueDisplay.textContent = defaultValue;
  valueDisplay.style.marginLeft = '5px';
  label.appendChild(valueDisplay);

  // Add tooltip with description
  if (description) {
    const tooltip = document.createElement('span');
    tooltip.textContent = ' ℹ️';
    tooltip.title = description;
    tooltip.style.cursor = 'help';
    label.appendChild(tooltip);
  }

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.id = `${panel.id}_${paramName}`;
  slider.min = min;
  slider.max = max;
  slider.step = step;
  slider.value = defaultValue;
  slider.style.width = '100%';
  controlDiv.appendChild(slider);

  // Update value display and apply changes when slider is moved
  slider.addEventListener('input', function() {
    valueDisplay.textContent = this.value;
    updateMovementParams();
  });

  return slider;
}

// Add speed slider directly to the active parameters panel
    createParameterControl(
      activePanel, 'v0', 'Active swimming speed (m/s) (v0)', 0.0, 20, 0.1, 3.6,
      'Target swimming speed when in active state'
    );
    

// Add parameter controls for Active state
createParameterControl(
  activePanel, 'beta', 'Relaxation rate (β)', 0.0, 1, 0.05, 0.8,
  'Controls how quickly fish adjust to target speed (higher = faster adjustment)'
);
createParameterControl(
  activePanel, 'D_phi', 'Horizontal noise (D_φ)', 0.0, 1, 0.05, 0.5,
  'Noise in horizontal direction changes (higher = more erratic turns)'
);
createParameterControl(
  activePanel, 'D_theta', 'Vertical noise (D_θ)', 0.0, 1, 0.05, 0.5,
  'Noise in vertical direction changes (higher = more vertical movement)'
);
createParameterControl(
  activePanel, 'D_v', 'Speed noise (D_v)', 0.0, 1, 0.05, 0.5,
  'Variation in swimming speed (higher = more speed fluctuation)'
);


createParameterControl(
  restingPanel, 'v0', 'Resting swimming speed (m/s) (v0)', 0.0, 20, 0.1, 0.5,
  'Target movement speed when resting'
);

// Add parameter controls for Resting state
createParameterControl(
  restingPanel, 'beta', 'Relaxation rate (β)', 0.0, 1, 0.05, 0.5,
  'Controls how quickly fish adjust to target speed (higher = faster adjustment)'
);

createParameterControl(
  restingPanel, 'D_phi', 'Horizontal noise (D_φ)', 0.0, 1, 0.05, 0.2,
  'Noise in horizontal direction changes (higher = more erratic turns)'
);
createParameterControl(
  restingPanel, 'D_theta', 'Vertical noise (D_θ)', 0.0, 1, 0.05, 0.2,
  'Noise in vertical direction changes (higher = more vertical movement)'
);
createParameterControl(
  restingPanel, 'D_v', 'Speed noise (D_v)', 0.0, 1, 0.05, 0.2,
  'Variation in swimming speed (higher = more speed fluctuation)'
);


    

    // Add fish button
    const addFishBtn = document.createElement('button');
    addFishBtn.textContent = 'Add Fish';
    addFishBtn.style.marginTop = '5px';
    addFishBtn.style.padding = '5px';
    addFishBtn.style.backgroundColor = '#2aa0f2';
    addFishBtn.style.color = '#ffffff';
    addFishBtn.style.border = 'none';
    addFishBtn.style.borderRadius = '4px';
    addFishBtn.style.cursor = 'pointer';
    addFishBtn.style.marginRight = '10px';
    fishSection.appendChild(addFishBtn);
  
    // Clear fish button
    const clearFishBtn = document.createElement('button');
    clearFishBtn.textContent = 'Clear Fish';
    clearFishBtn.style.marginTop = '10px';
    clearFishBtn.style.padding = '5px';
    clearFishBtn.style.backgroundColor = '#ff4040';
    clearFishBtn.style.color = '#ffffff';
    clearFishBtn.style.border = 'none';
    clearFishBtn.style.borderRadius = '4px';
    clearFishBtn.style.cursor = 'pointer';
    fishSection.appendChild(clearFishBtn);
  
    // Button event handlers for fish
    addFishBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!currentShape) {
        alert('Please create a shape first!');
        return;
      }
      
      // Get the value and validate it's a valid number
      const fishCountInput = document.getElementById('fishCount');
      const inputValue = fishCountInput?.value;
      
      if (!inputValue || inputValue.trim() === '') {
        alert('Please enter a number of fish to create');
        return;
      }
      
      const count = parseInt(inputValue);
      
      if (isNaN(count) || count <= 0) {
        alert('Please enter a valid number of fish (greater than 0)');
        return;
      }
      
      
      fish_createFish(count);
    });
      
    clearFishBtn.addEventListener('click', (e) => {
      e.preventDefault();
      fishes = [];
      fishCreated = false;
      Fish.idCounter = 1;
      stopSimulation();
      tracking_stopTracking();
      trackingData = [];
      
      // If receivers exist, redraw them with the shape
      if (receiversCreated && receivers.length > 0) {
        receiver_drawShapeWithReceivers();
      } else {
        // No receivers, just redraw the shape
        shape_drawShape();
      }

    });
    
    // Add a divider
    const trackingDivider = document.createElement('div');
    trackingDivider.style.margin = '15px 0 15px 0';
    fishSection.appendChild(trackingDivider);

    // // Download CSV button
    // const downloadBtn = document.createElement('button');
    // downloadBtn.textContent = 'Download exact fish positions (.csv)';
    // downloadBtn.type = 'button';
    // downloadBtn.style.padding = '5px';
    // downloadBtn.style.backgroundColor = '#2196F3';
    // downloadBtn.style.color = '#ffffff';
    // downloadBtn.style.border = 'none';
    // downloadBtn.style.borderRadius = '4px';
    // downloadBtn.style.cursor = 'pointer';
    // fishSection.appendChild(downloadBtn);

    // // Button event handler for downloading CSV
    // downloadBtn.addEventListener('click', (e) => {
    //   e.preventDefault();
    //   tracking_downloadCSV();
    // });
    
}


// Function to add receiver UI controls
function setupUI_receiver() {
  // Get the main container from the setupUI function
  const container = document.querySelector('div[style*="position: fixed"]');
  
  if (!container) return;
  
  // Create receiver controls section
  const receiverSection = document.createElement('div');
  receiverSection.style.marginTop = '20px';
  receiverSection.style.border = '1px solid #0a6277';
  receiverSection.style.backgroundColor = '#1c364c';
  receiverSection.style.borderRadius = '6px';
  receiverSection.style.padding = '15px';
  receiverSection.style.boxSizing = 'border-box';
  container.appendChild(receiverSection);

  // Receiver section title
  const receiverTitle = document.createElement('h3');
  receiverTitle.textContent = 'Receiver array';
  receiverTitle.style.margin = '0 0 15px 0';
  receiverSection.appendChild(receiverTitle);

  // Create a container for receiver count and label toggle in the same row
  const receiverControlRow = document.createElement('div');
  receiverControlRow.style.display = 'flex';
  receiverControlRow.style.alignItems = 'center';
  receiverControlRow.style.gap = '10px'; // Add spacing between elements
  receiverSection.appendChild(receiverControlRow);

  // Receiver count input
  const receiverCountLabel = document.createElement('label');
  receiverCountLabel.htmlFor = 'receiverCount';
  receiverCountLabel.textContent = 'Number of receivers:';
  receiverControlRow.appendChild(receiverCountLabel);

  const receiverCountInput = document.createElement('input');
  receiverCountInput.type = 'number';
  receiverCountInput.id = 'receiverCount';
  receiverCountInput.value = '12';
  receiverCountInput.min = '1';
  receiverCountInput.max = '50';
  receiverCountInput.style.width = '50px';
  receiverCountInput.style.padding = '5px';
  receiverControlRow.appendChild(receiverCountInput);








  // Add a checkbox for toggling receiver ID labels
  const receiverLabelToggle = document.createElement('input');
  receiverLabelToggle.type = 'checkbox';
  receiverLabelToggle.id = 'showReceiverLabels';
  receiverLabelToggle.checked = showReceiverLabels;
  receiverLabelToggle.style.marginLeft = '10px';
  receiverControlRow.appendChild(receiverLabelToggle);

  const receiverLabelToggleLabel = document.createElement('label');
  receiverLabelToggleLabel.htmlFor = 'showReceiverLabels';
  receiverLabelToggleLabel.textContent = 'ID labels';
  receiverControlRow.appendChild(receiverLabelToggleLabel);

  // Add event listener for the toggle
  receiverLabelToggle.addEventListener('change', function() {
    showReceiverLabels = this.checked;

    // Redraw if receivers are already placed
    if (receivers.length > 0) {
      if (fishCreated && animationId) {
        // Let the next animation frame apply the change
      } else {
        // Just redraw the shape and receivers
        receiver_drawShapeWithReceivers();
      }
    }
  });


  const placingErrorDiv = document.createElement('div');
  placingErrorDiv.style.margin = '-5px 0';
  receiverSection.appendChild(placingErrorDiv);

  const placingErrorLabel = document.createElement('label');
  placingErrorLabel.htmlFor = 'placingError';
  placingErrorLabel.innerHTML = 'Placing error (%) (Equidistant=0 ; Random=100):';
  placingErrorLabel.style.display = 'block';
  placingErrorLabel.style.marginBottom = '5px';
  placingErrorLabel.style.marginTop = '10px';
  placingErrorDiv.appendChild(placingErrorLabel);

  const placingErrorValueDisplay = document.createElement('span');
  placingErrorValueDisplay.id = 'placingErrorValue';
  placingErrorValueDisplay.textContent = '0';
  placingErrorValueDisplay.style.marginLeft = '5px';
  placingErrorLabel.appendChild(placingErrorValueDisplay);

  const placingErrorSlider = document.createElement('input');
  placingErrorSlider.type = 'range';
  placingErrorSlider.id = 'placingError';
  placingErrorSlider.min = '0';
  placingErrorSlider.max = '100';
  placingErrorSlider.step = '1';
  placingErrorSlider.value = '0';
  placingErrorSlider.style.width = '100%';
  placingErrorSlider.style.marginBottom = '15px';
  placingErrorDiv.appendChild(placingErrorSlider);

  placingErrorSlider.addEventListener('input', function() {
  placingErrorValueDisplay.textContent = this.value;
  placingError = parseInt(this.value);
  });
  
 

  // Detection range control
  const rangeControlDiv = document.createElement('div');
  rangeControlDiv.style.margin = '10px 0';
  receiverSection.appendChild(rangeControlDiv);

  const rangeLabel = document.createElement('label');
  rangeLabel.htmlFor = 'detectionRange';
  rangeLabel.innerHTML = '80% detection probability (logistic regression) (m):';
  rangeLabel.style.display = 'block';
  rangeLabel.style.marginBottom = '5px';
  rangeControlDiv.appendChild(rangeLabel);

  const rangeValueDisplay = document.createElement('span');
  rangeValueDisplay.id = 'rangeValue';
  rangeValueDisplay.textContent = detectionRange;
  rangeValueDisplay.style.marginLeft = '5px';
  rangeLabel.appendChild(rangeValueDisplay);

  const rangeSlider = document.createElement('input');
  rangeSlider.type = 'range';
  rangeSlider.id = 'detectionRange';
  rangeSlider.min = '10';
  rangeSlider.max = '1500';
  rangeSlider.step = '10';
  rangeSlider.value = detectionRange;
  rangeSlider.style.width = '100%';
  rangeSlider.style.marginBottom = '15px';
  rangeControlDiv.appendChild(rangeSlider);

  // Update range value display when slider changes
  rangeSlider.addEventListener('input', function() {
    rangeValueDisplay.textContent = this.value;
    detectionRange = parseInt(this.value);
    receiver_updateReceiversRange(detectionRange);
  });

  

  // Add receivers button
  const addReceiversBtn = document.createElement('button');
  addReceiversBtn.textContent = 'Add Receivers';
  addReceiversBtn.style.marginTop = '10px';
  addReceiversBtn.style.padding = '5px';
  addReceiversBtn.style.backgroundColor = '#2aa0f2';
  addReceiversBtn.style.color = '#ffffff';
  addReceiversBtn.style.border = 'none';
  addReceiversBtn.style.borderRadius = '4px';
  addReceiversBtn.style.cursor = 'pointer';
  addReceiversBtn.style.marginRight = '10px';
  receiverSection.appendChild(addReceiversBtn);

  // Clear receivers button
  const clearReceiversBtn = document.createElement('button');
  clearReceiversBtn.textContent = 'Clear Receivers';
  clearReceiversBtn.style.marginTop = '10px';
  clearReceiversBtn.style.padding = '5px';
  clearReceiversBtn.style.backgroundColor = '#ff4040';
  clearReceiversBtn.style.color = '#ffffff';
  clearReceiversBtn.style.border = 'none';
  clearReceiversBtn.style.borderRadius = '4px';
  clearReceiversBtn.style.cursor = 'pointer';
  receiverSection.appendChild(clearReceiversBtn);

  // Toggle detection visibility button
  const toggleDetectionBtn = document.createElement('button');
  toggleDetectionBtn.textContent = 'Show Detection Ranges';
  toggleDetectionBtn.id = 'toggleDetection';
  toggleDetectionBtn.style.marginTop = '10px';
  toggleDetectionBtn.style.marginLeft = '10px'; // Add margin to the right for spacing
  toggleDetectionBtn.style.padding = '5px';
  toggleDetectionBtn.style.backgroundColor = '#9e42f5';
  toggleDetectionBtn.style.color = '#ffffff';
  toggleDetectionBtn.style.border = 'none';
  toggleDetectionBtn.style.borderRadius = '4px';
  toggleDetectionBtn.style.cursor = 'pointer';
  receiverSection.appendChild(toggleDetectionBtn);


// Button event handlers for receivers
// Update addReceiversBtn event handler to use VPS if checked
addReceiversBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!currentShape) {
        alert('Please create a shape first!');
        return;
    }
    
    receivers = [];
    Receiver.idCounter = 1;

    const count = parseInt(receiverCountInput.value) || 5;
    if (vpsCheckbox.checked && placingError < 11) {
      receiver_createReceiversVPS(count);
    } else {
      receiver_createReceiversEquidistant(count);
    }
    
    receiversCreated = true;
    receiver_updateReceiverInfo();
});

  clearReceiversBtn.addEventListener('click', (e) => {
    e.preventDefault();
    receivers = [];
    Receiver.idCounter = 1;
    receiversCreated = false;

    receiver_updateReceiverInfo();
    receiver_detecting_updateDetectionsCount();
    if (fishCreated) {
      startSimulation(); // Redraw without receivers
    } else {
      shape_drawShape(); // Just redraw the shape
    }
  });

 //VPS option
  const vpsDiv = document.createElement('div');
vpsDiv.style.margin = '10px 0';
receiverSection.appendChild(vpsDiv);

const vpsCheckbox = document.createElement('input');
vpsCheckbox.type = 'checkbox';
vpsCheckbox.id = 'vpsMode';
vpsCheckbox.disabled = placingError > 11;
vpsDiv.appendChild(vpsCheckbox);

const vpsLabel = document.createElement('label');
vpsLabel.htmlFor = 'vpsMode';
vpsLabel.textContent = 'Fine-scale array layout (detection range overlap)';
vpsLabel.style.marginLeft = '8px';
vpsDiv.appendChild(vpsLabel);

// Enable/disable VPS checkbox when placingError changes
placingErrorSlider.addEventListener('input', function() {
  placingErrorValueDisplay.textContent = this.value;
  placingError = parseInt(this.value);
  vpsCheckbox.disabled = placingError > 11;
  if (placingError >= 5) vpsCheckbox.checked = false;
});

// Update receiver placement when detection range changes and VPS is enabled
rangeSlider.addEventListener('input', function() {
  rangeValueDisplay.textContent = this.value;
  detectionRange = parseInt(this.value);
  receiver_updateReceiversRange(detectionRange);

  // If VPS is enabled, re-place receivers
  if (vpsCheckbox.checked && placingError < 11 && receivers.length > 0) {
    receiver_createReceiversVPS(receivers.length);
  }
});





// Toggle detection range visibility
let showDetectionRanges = true; // Set to true by default
toggleDetectionBtn.textContent = 'Hide Detection Ranges'; // Update button text
toggleDetectionBtn.style.backgroundColor = '#7b25d1'; // Update button color

toggleDetectionBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showDetectionRanges = !showDetectionRanges; // Toggle visibility
    toggleDetectionBtn.textContent = showDetectionRanges 
        ? 'Hide Detection Ranges' 
        : 'Show Detection Ranges';
    toggleDetectionBtn.style.backgroundColor = showDetectionRanges 
        ? '#7b25d1' 
        : '#9e42f5';
    
    // Redraw to show/hide detection ranges
    if (fishCreated) {
        startSimulation();
    } else if (receivers.length > 0) {
        receiver_drawShapeWithReceivers();
    }
});

// Ensure detection ranges are drawn initially
if (receivers.length > 0) {
    receiver_drawShapeWithReceivers();
  }

  // animation function 
update_fish_and_receiver = function() {
  if (!currentShape) return;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw shape
  shape_drawShape();
  
  // Move and draw fish
  fishes.forEach(fish => {
    fish.move();
    fish_drawFish(fish);
  });
  
  // Draw receivers and detection ranges if needed
  const toggleBtn = document.getElementById('toggleDetection');
  const showRanges = toggleBtn && toggleBtn.textContent.includes('Hide');
  
  receivers.forEach(receiver => {
    receiver_drawReceiver(receiver, showRanges);
    
    // Check for fish detections
    if (fishCreated) {
      fishes.forEach(fish => {
        // detectFish now records detections internally
        receiver_detecting_detectFish(receiver, fish);
      });
    }
  });
  
  // Continue animation
  animationId = requestAnimationFrame(update_fish_and_receiver);
};

const detectionsCountDiv = document.createElement('div');
detectionsCountDiv.id = 'detectionsCount';
detectionsCountDiv.style.marginTop = '10px';
detectionsCountDiv.style.border = '1px solid #0a6277';
detectionsCountDiv.style.padding = '5px';
detectionsCountDiv.style.borderRadius = '4px';
detectionsCountDiv.innerHTML = '<strong>Total fish detections:</strong> 0';
receiverSection.appendChild(detectionsCountDiv);


// // Add this to the setupReceiverUI function, after the receiverInfo div
// const downloadDetectionsBtn = document.createElement('button');
// downloadDetectionsBtn.textContent = 'Download Detection Records';
// downloadDetectionsBtn.type = 'button'; 
// downloadDetectionsBtn.style.marginTop = '10px';
// downloadDetectionsBtn.style.padding = '5px';
// downloadDetectionsBtn.style.backgroundColor = '#2196F3';
// downloadDetectionsBtn.style.color = '#ffffff';
// downloadDetectionsBtn.style.border = 'none';
// downloadDetectionsBtn.style.borderRadius = '4px';
// downloadDetectionsBtn.style.cursor = 'pointer';
// downloadDetectionsBtn.style.display = 'block';
// downloadDetectionsBtn.style.marginTop = '15px';
// receiverSection.appendChild(downloadDetectionsBtn);

// // Add event listener
// downloadDetectionsBtn.addEventListener('click', (e) => {
//   e.preventDefault();
//   receiver_detecting_downloadDetectionsCSV();
// });
}

function setupUI_simulation() {
    const container = document.querySelector('div[style*="position: fixed"]');
    if (!container) return;

    const simTimeDiv = document.createElement('div');
    simTimeDiv.style.marginTop = '20px';
    simTimeDiv.style.border = '1px solid #0a6277';
    simTimeDiv.style.backgroundColor = '#1c364c';
    simTimeDiv.style.borderRadius = '6px';
    simTimeDiv.style.padding = '15px';
    simTimeDiv.style.boxSizing = 'border-box';
    container.appendChild(simTimeDiv);

    const simTitle = document.createElement('h3');
    simTitle.textContent = 'Fast simulation (timeseries data)';
    simTitle.style.margin = '0 0 15px 0';
    simTimeDiv.appendChild(simTitle);

    const durationRow = document.createElement('div');
    durationRow.style.display = 'flex';
    durationRow.style.alignItems = 'center';
    durationRow.style.marginBottom = '10px';
    simTimeDiv.appendChild(durationRow);

    const durationLabel = document.createElement('label');
    durationLabel.htmlFor = 'simDuration';
    durationLabel.textContent = 'Simulation duration (days, max 3):';
    durationLabel.style.marginRight = '10px';
    durationRow.appendChild(durationLabel);

    // Duration input — capped at 3 days
    const durationInput = document.createElement('input');
    durationInput.type = 'number';
    durationInput.id = 'simDuration';
    durationInput.value = '1';
    durationInput.min = '1';
    durationInput.max = '3';          // changed from 365 to 3
    durationInput.style.width = '60px';
    durationInput.style.padding = '5px';
    durationInput.style.marginRight = '10px';
    durationRow.appendChild(durationInput);

    // Clamp value if user types something out of range and leaves the field
    durationInput.addEventListener('change', () => {
        let val = parseFloat(durationInput.value);
        if (isNaN(val) || val < 0.01) val = 0.01;
        if (val > 3) val = 3;
        durationInput.value = val;
    });

    const runFastSimBtn = document.createElement('button');
    runFastSimBtn.id = 'runFastSim';
    runFastSimBtn.textContent = 'Run';
    runFastSimBtn.style.padding = '5px';
    runFastSimBtn.style.backgroundColor = '#2aa0f2';
    runFastSimBtn.style.color = '#ffffff';
    runFastSimBtn.style.border = 'none';
    runFastSimBtn.style.borderRadius = '4px';
    runFastSimBtn.style.cursor = 'pointer';
    durationRow.appendChild(runFastSimBtn);

    const statusDiv = document.createElement('div');
    statusDiv.id = 'fastSimStatus';
    statusDiv.style.marginTop = '10px';
    statusDiv.style.fontStyle = 'italic';
    simTimeDiv.appendChild(statusDiv);

    runFastSimBtn.addEventListener('click', () => {
        const seedValue = parseInt(document.getElementById('randomSeed').value);
        if (!isNaN(seedValue)) {
            setFishRandomSeed(seedValue);
            setReceiverRandomSeed(seedValue);
        }

        // Enforce max 3 days even if input was manipulated
        let durationDays = parseFloat(document.getElementById('simDuration').value);
        if (isNaN(durationDays) || durationDays <= 0) durationDays = 0.01;
        if (durationDays > 3) {
            durationDays = 3;
            document.getElementById('simDuration').value = 3;
            statusDiv.textContent = 'Duration capped at maximum of 3 days.';
        }

        simulationEndTime = durationDays * 24 * 3600;
        fast_sim_runFastSimulation();
    });
}

function setupUI_download_button() {
    const container = document.querySelector('div[style*="position: fixed"]');
    
    if (!container) return;
    
    // Add separator for download section
    const downloadSection = document.createElement('div');
    downloadSection.style.marginTop = '20px';
    downloadSection.style.border = '1px solid #0a6277';
    downloadSection.style.backgroundColor = '#1c364c';
    downloadSection.style.borderRadius = '6px';
    downloadSection.style.padding = '15px';
    downloadSection.style.boxSizing = 'border-box';
    container.appendChild(downloadSection);
    
    // Download section title
    const downloadTitle = document.createElement('h3');
    downloadTitle.textContent = 'Download Data';
    downloadTitle.style.margin = '0 0 15px 0';
    downloadSection.appendChild(downloadTitle);
    
    // Add the consolidated download button
    const downloadAllBtn = document.createElement('button');
    downloadAllBtn.textContent = 'Download simulation data (.zip)';
    downloadAllBtn.style.padding = '8px 15px';
    downloadAllBtn.style.backgroundColor = '#2196F3';
    downloadAllBtn.style.color = '#ffffff';
    downloadAllBtn.style.border = 'none';
    downloadAllBtn.style.borderRadius = '4px';
    downloadAllBtn.style.cursor = 'pointer';
    downloadAllBtn.style.fontSize = '14px';
    downloadAllBtn.style.fontWeight = 'bold';
    downloadAllBtn.style.width = '100%';
    downloadSection.appendChild(downloadAllBtn);

    // Add event listener for the download all button
    downloadAllBtn.addEventListener('click', (e) => {
        e.preventDefault();
        download_data_downloadZip();
    });
}

function setupUI_clear_button() {
    const container = document.querySelector('div[style*="position: fixed"]');
    
    if (!container) return;
    
    // Add separator
    const clearSection = document.createElement('div');
    clearSection.style.marginTop = '20px';
    clearSection.style.borderTop = '1px solid #0a6277';
    clearSection.style.paddingTop = '15px';
    container.appendChild(clearSection);
    
    // Clear button
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear everything';
    clearBtn.style.padding = '8px 15px';
    clearBtn.style.backgroundColor = '#ff4040';
    clearBtn.style.color = '#ffffff';
    clearBtn.style.border = 'none';
    clearBtn.style.borderRadius = '4px';
    clearBtn.style.cursor = 'pointer';
    clearBtn.style.fontSize = '14px';
    clearBtn.style.fontWeight = 'bold';
    clearBtn.style.width = '100%';
    clearSection.appendChild(clearBtn);

    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      location.reload();
    });
  

}













