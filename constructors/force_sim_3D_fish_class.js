// Fish constructor with 3D support
class Fish {
    static idCounter = 1

    constructor(x, y) {
        this.id = Fish.idCounter++;
        this.x = x;
        this.y = y;
        this.z = (typeof currentShape !== 'undefined' && currentShape && currentShape.bounds && typeof currentShape.bounds.maxZ === 'number')
            ? fishRandom() * currentShape.bounds.maxZ
            : 0; // Default to 0 if shape or bounds not defined
        this.size = 25;
        this.color = this.getRandomColor();

         // Assign a unique social radius to each fish
        const meanRadius = parseFloat(document.getElementById('socialRadiusMean')?.value || 100);
        const stdRadius = parseFloat(document.getElementById('socialRadiusStd')?.value || 10);
        this.socialRadius = Math.max(1, fishRandomNormal(meanRadius, stdRadius));

        // Assign random social attraction strengths for this fish
        this.socialAttractStrengthRest = 0.5 + fishRandom() * 1.5;   // Range: 1 to 2 
        this.socialAttractStrengthActive = 0; // always no attraction when active

        // Home range center and radius, 
        const homeRangeSample = fish_sampleHomeRangeFromAreaKm2();
        this.homeAreaKm2 = homeRangeSample.areaKm2;
        this.homeRadius = homeRangeSample.radiusM;

        // Home range center defaults to the fish's own starting position
        this.homeCenter = new Vector(this.x, this.y, this.z);

        // Per-fish pull strength toward home range center
        this.homeBiasK = parseFloat(document.getElementById('homeBiasStrength')?.value || 0.25);

        // Initial movement state 
        this.state = fishRandom() < 0.5 ? "active" : "resting"; // random initial state

        // Movement parameters for both states - get default values from UI if available
        const getUIValue = (id, defaultVal) => {
            const element = document.getElementById(id);
            return element ? parseFloat(element.value) : defaultVal;
        };

        // Sample the input for the movement parameters from normal distribution with 10% stddev
        const sampleParam = (mean) => fishRandomNormal(mean, Math.abs(mean) * 0.1);

        // Sample movement parameters for this fish
        this.movementParams = {
            active: {
                beta: sampleParam(getUIValue('activePanel_beta', 0.5)),
                v0: sampleParam(getUIValue('activePanel_v0', 0.5)),
                D_phi: sampleParam(getUIValue('activePanel_D_phi', 0.8)),
                D_theta: sampleParam(getUIValue('activePanel_D_theta', 0.3)),
                D_v: sampleParam(getUIValue('activePanel_D_v', 0.3))
            },
            resting: {
                beta: sampleParam(getUIValue('restingPanel_beta', 0.5)),
                v0: sampleParam(getUIValue('restingPanel_v0', 0.1)),
                D_phi: sampleParam(getUIValue('restingPanel_D_phi', 0.1)),
                D_theta: sampleParam(getUIValue('restingPanel_D_theta', 0.1)),
                D_v: sampleParam(getUIValue('restingPanel_D_v', 0.1))
            }
        };


        // Orientation (3D)
        this.phi = fishRandom() * Math.PI * 2;
        this.theta = Math.PI / 2;

        

        // Initial speed is 0 if resting, maxSpeed if active
        this.speedMPS = this.state === "active" ? this.movementParams.active.v0 : this.movementParams.resting.v0;

        const config = window.fishStateConfig || { activeDuration: 20, restingDuration: 20 };
        const duration = this.state === "active" ? config.activeDuration : config.restingDuration;
        const randomOffset = fishRandom() * duration * 1000;
        this.nextStateSwitch = randomOffset;


        this.position = new Vector(this.x, this.y, this.z);
        this.velocity = new Vector(
            Math.cos(this.phi) * Math.sin(this.theta),
            Math.sin(this.phi) * Math.sin(this.theta),
            Math.cos(this.theta)
        ).mul_scalar(this.speedMPS);

        // Detection state variables
        this.isDetectable = false;
        this.lastDetectableTime = 0;
        this.nextDetectableTime = this.getRandomNonDetectableInterval(); // Start at 0 for fast sim
        this.lastFrameTime = 0; // Start at 0 for fast sim
        this.alreadyDetected = new Set();

        // For movement
        this.frameCount = 0;
        this.depthFrameCount = 0;

        // Apply initial movement params
        this.applyMovementParams();

        
    }

    applyMovementParams() {
        // Always update v0 from current maxSpeed for active state
        // this.movementParams.active.v0 = this.maxSpeed;
        const p = this.movementParams[this.state];
        this.beta = p.beta;
        this.v0 = p.v0;
        this.D_phi = p.D_phi;
        this.D_theta = p.D_theta;
        this.D_v = p.D_v;
        // Do NOT set speedMPS here; let forceBasedMove3D handle speed relaxation
       
    }

    maybeSwitchState(now) {
        // Use durations from config
        const config = window.fishStateConfig || {
      restingDuration: 20,
      activeDuration: 20,
      probRestRest: 80,
      probRestActive: 20,
      probActiveActive: 20,
      probActiveRest: 80
    };

    // Check if it's time to switch state
    // Use random() for state transitions
    if (now >= this.nextStateSwitch) {
            let nextState;
            if (this.state === "resting") {
                const rand = fishRandom() * 100;
                if (rand < config.probRestRest) {
                    nextState = "resting";
                } else {
                    nextState = "active";
                }
                this.nextStateSwitch = now + config.restingDuration * 1000;
            } else {
                const rand = fishRandom() * 100;
                if (rand < config.probActiveActive) {
                    nextState = "active";
                } else {
                    nextState = "resting";
                }
                this.nextStateSwitch = now + config.activeDuration * 1000;
            }
            this.state = nextState;
            this.applyMovementParams();
        }
    }

    getRandomColor() {
      const colors = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', 
                      '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D'];
      return colors[Math.floor(fishRandom() * colors.length)];
    }
    
    // New method to get a random non-detectable interval (30-90 seconds)
    getRandomNonDetectableInterval() {
      return (30 + fishRandom() * 60) * 1000; // Convert to milliseconds
    }

   
    getRandomColor() {
      const colors = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', 
                      '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D'];
      return colors[Math.floor(fishRandom() * colors.length)];
    }
    
    // New method to get a random non-detectable interval (30-90 seconds)
    getRandomNonDetectableInterval() {
      return (30 + fishRandom() * 60) * 1000; // Convert to milliseconds
    }
    
    updateDetectableState(simTimeMs = null) {
        // Use either simulation time or real clock time
        const currentTime = simTimeMs !== null ? simTimeMs : Date.now();        
        
        if (this.isDetectable) {
            // If detectable for more than 1 second, make non-detectable
            if (currentTime - this.lastDetectableTime > 1000) {
                this.isDetectable = false;
                this.nextDetectableTime = currentTime + this.getRandomNonDetectableInterval();
                this.alreadyDetected.clear();
                
                // Reset detection times when becoming non-detectable
                if (this.detectionTimes) {
                    this.detectionTimes.clear();
                }
            }
        } else {
            // Check if it's time to make fish detectable again
            if (currentTime >= this.nextDetectableTime) {
                this.isDetectable = true;
                this.lastDetectableTime = currentTime;
                this.alreadyDetected.clear(); // Clear the detection list when becoming detectable
                // Reset detection times when becoming detectable again
                if (this.detectionTimes) {
                    this.detectionTimes.clear();
                }
            }
        }
    }

    move(deltaTime, isFastSim = false, simTime = null) {
        // If not in fast sim mode, calculate deltaTime normally
        if (!isFastSim) {
            const now = performance.now();
            deltaTime = (now - this.lastFrameTime) / 1000;
            this.lastFrameTime = now;
        }

        const now = isFastSim ? simTime * 1000 : performance.now();
        this.maybeSwitchState(now);
        this.updateDetectableState(now);

        this.frameCount += 1; // Increment by 1 per update regardless of time step
        this.depthFrameCount += 1;

        // Force based movement logic
        forceBasedMove3D(this, {
            polygon: currentShape ? currentShape.coordinates : null, 
            dt: deltaTime,
            maxDepth: currentShape.bounds.maxZ,
            boundary_strength: 50,        // Add boundary strength
            repulsion_percentage: 0.01,   // Add repulsion percentage (1%)
            response_time: 10              // Add response time
        });
    }
}

// Check if point is inside shape
function fish_isPointInShape(x, y, shape) {
  if (!shape || !shape.bounds) return false;
  
  // For rectangle, simple bounds check
  if (shape.type === 'rectangle') {
    return (
      x >= shape.bounds.minX && 
      x <= shape.bounds.maxX && 
      y >= shape.bounds.minY && 
      y <= shape.bounds.maxY
    );
  }
  
  return false;
}

// Create fish at random positions inside shape
function fish_createFish(count) {
  if (!currentShape) return;
  
  for (let i = 0; i < count; i++) {
    let x, y;
    let attempts = 0;
    const maxAttempts = 1000;
    
    // Find a valid position inside the shape
    do {
      x = currentShape.bounds.minX + fishRandom() * (currentShape.bounds.maxX - currentShape.bounds.minX);
      y = currentShape.bounds.minY + fishRandom() * (currentShape.bounds.maxY - currentShape.bounds.minY);
      attempts++;
    } while (!fish_isPointInShape(x, y, currentShape) && attempts < maxAttempts);
    
    if (attempts < maxAttempts) {
      fishes.push(new Fish(x, y));
    }
  }
  
  fishCreated = true;

  // Only start tracking if not already tracking
  if (!isTracking) {
    tracking_startTracking();
  }

  startSimulation();
}

// Converts a home-range area in km^2 (with % std dev) to a sampled radius in meters,
// assuming a circular home range: area = pi * r^2
function fish_sampleHomeRangeFromAreaKm2() {
    const meanAreaKm2 = parseFloat(document.getElementById('homeAreaMean')?.value || 0.01);
    const stdPercent = parseFloat(document.getElementById('homeAreaStdPercent')?.value || 10);
    const stdAreaKm2 = meanAreaKm2 * (stdPercent / 100);

    const sampledAreaKm2 = Math.max(1e-6, fishRandomNormal(meanAreaKm2, stdAreaKm2));
    const sampledAreaM2 = sampledAreaKm2 * 1_000_000;
    const radiusM = Math.sqrt(sampledAreaM2 / Math.PI);

    return { areaKm2: sampledAreaKm2, radiusM };
}

// Update fish speed
function fish_updateFishSpeed(activeSpeed, restingSpeed) {
    // Update all existing fish
    fishes.forEach(fish => {
        if (activeSpeed !== undefined) {
            fish.movementParams.active.v0 = activeSpeed;
        }
        if (restingSpeed !== undefined) {
            fish.movementParams.resting.v0 = restingSpeed;
        }
        fish.applyMovementParams(); // This will apply the correct speed based on current state
    });
}

// Function to update movement parameters based on UI values
function updateMovementParams() {
      const newParams = {
        active: {
          beta: parseFloat(document.getElementById('activePanel_beta').value),
          v0: parseFloat(document.getElementById('activePanel_v0').value), // Use active panel speed
          D_phi: parseFloat(document.getElementById('activePanel_D_phi').value),
          D_theta: parseFloat(document.getElementById('activePanel_D_theta').value),
          D_v: parseFloat(document.getElementById('activePanel_D_v').value)
        },
        resting: {
          beta: parseFloat(document.getElementById('restingPanel_beta').value),
          v0: parseFloat(document.getElementById('restingPanel_v0').value), // Use resting panel speed
          D_phi: parseFloat(document.getElementById('restingPanel_D_phi').value),
          D_theta: parseFloat(document.getElementById('restingPanel_D_theta').value),
          D_v: parseFloat(document.getElementById('restingPanel_D_v').value)
        }
      };
    
      // Update all existing fish with new parameters
      fishes.forEach(fish => {
        fish.movementParams = JSON.parse(JSON.stringify(newParams)); // Deep copy
        fish.applyMovementParams(); // Apply current state's params
      });
    }


// Draw a fish with depth visualization
function fish_drawFish(fish) {
    // Convert fish coordinates from world space to canvas space
    const fishCanvasPos = shape_worldToCanvasCoordinates(fish.x, fish.y);
    
    // Calculate size and opacity based on depth
    const maxDepth = currentShape ? currentShape.bounds.maxZ : 50;
    const depthRatio = fish.z / maxDepth;
    const sizeMultiplier = 1 - (depthRatio * 0.7); // Smaller when deeper
    const actualSize = fish.size * sizeMultiplier;
    const opacity = 1 - (depthRatio * 0.7); // More transparent when deeper
    
    // Draw fish body with depth-based appearance
    if (fish.isDetectable) {
        // Add glow effect for detectable fish with depth consideration
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.3})`;
        ctx.beginPath();
        ctx.arc(fishCanvasPos.x, fishCanvasPos.y, actualSize + 4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw fish body with opacity based on depth
    const baseColor = fish.color;
    // Extract RGB components
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    ctx.beginPath();
    ctx.arc(fishCanvasPos.x, fishCanvasPos.y, actualSize, 0, Math.PI * 2);
    ctx.fill();
    
    

    // Only draw the fish ID label if the toggle is enabled
    if (showFishLabels) {
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.font = `${Math.max(20, 10 * sizeMultiplier)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        // Always shows the current state
        ctx.fillText(
            `${fish.id} (${fish.z.toFixed(1)}m, ${fish.state})`,
            fishCanvasPos.x,
            fishCanvasPos.y - actualSize - 5
        );
    }
}

function fish_createMovementParamsCSV() {

    const activeDuration = window.fishStateConfig?.activeDuration ;
    const restingDuration = window.fishStateConfig?.restingDuration;

    let csv ='';
    csv += 'fish_id,state,v0,beta,D_phi,D_theta,D_v,state_duration,social_attraction,social_attraction_radius,home_area_km2,home_center_x,home_center_y\n';
    fishes.forEach(fish => {
        const homeAreaKm2 = fish.homeAreaKm2 ?? '';
        const homeCenterX = fish.homeCenter ? fish.homeCenter[0] : '';
        const homeCenterY = fish.homeCenter ? fish.homeCenter[1] : '';
        // Active state
        csv += `${fish.id},active,${fish.movementParams.active.v0},${fish.movementParams.active.beta},${fish.movementParams.active.D_phi},${fish.movementParams.active.D_theta},${fish.movementParams.active.D_v},${activeDuration},${fish.socialAttractStrengthActive},${fish.socialRadius}, ${homeAreaKm2},${homeCenterX},${homeCenterY}\n`;
        // Resting state
        csv += `${fish.id},resting,${fish.movementParams.resting.v0},${fish.movementParams.resting.beta},${fish.movementParams.resting.D_phi},${fish.movementParams.resting.D_theta},${fish.movementParams.resting.D_v},${restingDuration},${fish.socialAttractStrengthRest},${fish.socialRadius},${homeAreaKm2},${homeCenterX},${homeCenterY}\n`;
    });
    return csv;
}