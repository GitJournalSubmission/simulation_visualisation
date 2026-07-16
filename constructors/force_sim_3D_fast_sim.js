// --- Add simulation time controls ---
let simulationTime = 0; // in seconds
let simulationEndTime = 24 * 3600; // default: 1 day in seconds
let simulationStep = 1; // Simulate 1 second per loop iteration

function fast_sim_runFastSimulation() {
    // --- Ensure reproducibility ---
        resetFishRandomSeedForFastSim();
        resetReceiverRandomSeedForFastSim();

    if (!currentShape || fishes.length === 0 || receivers.length === 0) {
        alert('Please create a shape, add fish, and add receivers first!');
        return;
    }
    
    // Reset simulation time and data
    simulationTime = 0;
    trackingData = [];

    // --- Re-initialize receiver positions if placingError is used ---
    receivers.forEach((receiver, idx) => {
        // Recalculate grid position
        const aspectRatio = (currentShape.bounds.maxX - currentShape.bounds.minX) /
                            (currentShape.bounds.maxY - currentShape.bounds.minY);
        const totalReceivers = receivers.length;
        let cols = Math.round(Math.sqrt(totalReceivers * aspectRatio));
        let rows = Math.round(totalReceivers / cols);
        while (rows * cols < totalReceivers) cols++;
        const spacingX = (currentShape.bounds.maxX - currentShape.bounds.minX) / (cols + 1);
        const spacingY = (currentShape.bounds.maxY - currentShape.bounds.minY) / (rows + 1);
        const row = Math.floor(idx / cols) + 1;
        const col = (idx % cols) + 1;
        let x = currentShape.bounds.minX + spacingX * col;
        let y = currentShape.bounds.minY + spacingY * row;
        if (typeof placingError !== 'undefined' && placingError > 0) {
            const maxOffsetX = spacingX * (placingError / 100);
            const maxOffsetY = spacingY * (placingError / 100);
            x += (receiverRandom() - 0.5) * 2 * maxOffsetX;
            y += (receiverRandom() - 0.5) * 2 * maxOffsetY;
        }
        receiver.x = x;
        receiver.y = y;
        receiver.z = currentShape.bounds.maxZ / 2;
        receiver.detections = [];
    });

    // --- Re-initialize all fish properties ---
    fishes.forEach(fish => {
        fish.x = currentShape.bounds.minX + fishRandom() * (currentShape.bounds.maxX - currentShape.bounds.minX);
        fish.y = currentShape.bounds.minY + fishRandom() * (currentShape.bounds.maxY - currentShape.bounds.minY);
        fish.z = fishRandom() * currentShape.bounds.maxZ;
        fish.direction = fishRandom() * Math.PI * 2;
        fish.state = fishRandom() < 0.5 ? "active" : "resting";
        fish.color = fish.getRandomColor();
        fish.phi = fish.direction;
        fish.theta = Math.PI / 2;
        fish.speedMPS = fish.state === "active" ? fish.movementParams.active.v0 : fish.movementParams.resting.v0;
        fish.position = new Vector(fish.x, fish.y, fish.z);
        fish.homeCenter = new Vector(fish.x, fish.y, fish.z);
        const homeRangeSample = fish_sampleHomeRangeFromAreaKm2();
        fish.homeAreaKm2 = homeRangeSample.areaKm2;
        fish.homeRadius = homeRangeSample.radiusM;
        fish.homeBiasK = parseFloat(document.getElementById('homeBiasStrength')?.value || 0.25);
        fish.velocity = new Vector(
            Math.cos(fish.phi) * Math.sin(fish.theta),
            Math.sin(fish.phi) * Math.sin(fish.theta),
            Math.cos(fish.theta)
        ).mul_scalar(fish.speedMPS);

        // Reset time-dependent state for fast sim
        fish.isDetectable = false;
        fish.lastDetectableTime = 0;
        fish.nextDetectableTime = fish.getRandomNonDetectableInterval();
        fish.lastFrameTime = 0;
        fish.frameCount = 0;
        fish.depthFrameCount = 0;
        fish.alreadyDetected = new Set();
        if (fish.detectionTimes) fish.detectionTimes.clear();
        fish.nextStateSwitch = fish.state === "active"
            ? fish.getRandomNonDetectableInterval() + (window.fishStateConfig?.activeDuration || 20) * 1000
            : fish.getRandomNonDetectableInterval() + (window.fishStateConfig?.restingDuration || 20) * 1000;
        fish.applyMovementParams();
    });

    const statusDiv = document.getElementById('fastSimStatus');
    statusDiv.textContent = 'Running fast simulation...';

    // Tracking interval
    const trackingIntervalSeconds = parseInt(document.getElementById('trackingInterval')?.value || 10);
    let nextTrackingTime = 0;

    // Main simulation loop
    while (simulationTime < simulationEndTime) {
        fishes.forEach(fish => {
            fish.move(simulationStep, true, simulationTime);
        });
        receivers.forEach(receiver => {
            fishes.forEach(fish => {
                receiver_detecting_detectFish(receiver, fish, true, simulationTime);
            });
        });
        if (simulationTime >= nextTrackingTime) {
            tracking_trackFishPositions(true, simulationTime);
            nextTrackingTime += trackingIntervalSeconds;
        }
        simulationTime += simulationStep;
    }

    statusDiv.textContent = `Fast simulation complete! Simulated ${(simulationEndTime/3600/24).toFixed(2)} days.`;
    receiver_detecting_updateDetectionsCount();
    create_metadata();

    if (trackingInterval) {
        clearInterval(trackingInterval);
        trackingInterval = null;
    }
    isTracking = false;
    if (trackingStatus) {
        trackingStatus.innerHTML = `Tracking: <u><strong>Simulation finished</strong></u> (Data points: ${trackingData.length})`;
    }

    stopSimulation();
}












