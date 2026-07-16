// Check if a fish is within detection range and record the detection
function receiver_detecting_detectFish(receiver, fish, isFastSim = false, simTime = null) {
    // Only detect fish if they are in detectable state
    if (!fish.isDetectable) return false;

    // Use simulation time or real time
    const currentTime = isFastSim && simTime !== null ? simTime * 1000 : Date.now();

    // Initialize detectionTimes if it doesn't exist
    if (!fish.detectionTimes) {
        fish.detectionTimes = new Map();
    }

    // Check if this receiver has already attempted detection for this fish
    if (fish.detectionTimes.has(receiver.id)) {
        // Skip further calculations if already processed
        return false;
    }

    // Calculate 3D distance
    const distance = Math.sqrt(
        Math.pow(receiver.x - fish.x, 2) +
        Math.pow(receiver.y - fish.y, 2) +
        Math.pow(receiver.z - fish.z, 2)
    );

    // Calculate detection probability using logistic regression
    const rangeRadius = receiver.detectionRange;
    const p1 = 0.999;
    const d1 = 1; // 1 meter
    const p2 = 0.8;
    const d2 = rangeRadius;

    const eq1 = -Math.log((1 / p1) - 1);
    const eq2 = -Math.log((1 / p2) - 1);

    const b = (eq1 - eq2) / (d1 - d2);
    const a = eq1 - b * d1;

    const logitP = a + b * distance;
    const detectionProbability = 1 / (1 + Math.exp(-logitP));

    // Determine if detected based on probability
    const isDetected = receiverRandom() <= detectionProbability;

    // Record the detection attempt (regardless of outcome)
    fish.detectionTimes.set(receiver.id, currentTime);

    if (isDetected) {
        const travelTime = distance / 1500; // speed of sound in seawater ~1500 m/s

        // Use simTime for timestamp if in fast sim, else use real time
        const timestamp = isFastSim && simTime !== null
            ? (simTime + travelTime).toFixed(2)
            : (trackingStartTime
                ? ((currentTime - trackingStartTime) / 1000 + travelTime).toFixed(2)
                : currentTime + travelTime * 1000);

        receiver.detections.push({
            timestamp: timestamp,
            fishId: fish.id,
            x: receiver.x.toFixed(3),
            y: receiver.y.toFixed(3),
            z: receiver.z.toFixed(3),
            fishdepth:fish.z.toFixed(3)
        });

        receiver_detecting_updateDetectionsCount();
    }

    return isDetected;
}


// Function to update the detection count display
function receiver_detecting_updateDetectionsCount() {
  const detectionsCountDiv = document.getElementById('detectionsCount');
  if (!detectionsCountDiv) return;
  
  // Count total detections across all receivers
  let totalDetections = 0;
  receivers.forEach(receiver => {
    totalDetections += receiver.detections.length;
  });
  
  detectionsCountDiv.innerHTML = `<strong>Total fish detections:</strong> ${totalDetections}`;
}


// Function to create detection CSV content (for use by download system)
function receiver_detecting_createDetectionCSV() {
  let allDetections = [];
  
  // Collect detections from all receivers
  receivers.forEach(receiver => {
    // Add receiver ID to each detection
    const receiverDetections = receiver.detections.map(detection => ({
      ...detection,
      receiverId: receiver.id
    }));
    
    allDetections = allDetections.concat(receiverDetections);
  });
  
  // Sort detections by timestamp (numeric, ascending)
  allDetections.sort((a, b) => parseFloat(a.timestamp) - parseFloat(b.timestamp));

  // Create CSV header with z-coordinates
  let csv = 'timestamp,individual_id,receiver_id,receiver_x,receiver_y,receiver_z,fish_depth_sensor\n';
  
   // Add data rows - convert seconds to ISO date string
  allDetections.forEach(detection => {
    // Convert seconds timestamp to ISO string
    const customStartTime = new Date('2025-01-01T00:00:00.000Z').getTime();
    const timestampMs = customStartTime + (parseFloat(detection.timestamp) * 1000);
    const isoTimestamp = new Date(timestampMs).toISOString();
    csv += `${isoTimestamp},${detection.fishId},${detection.receiverId},${detection.x},${detection.y},${detection.z},${detection.fishdepth}\n`;
  });
  
  return csv;
}

// Function to create CSV content with receiver positions
function receivers_createCSV() {
  // Create CSV header
  let csv = 'receiver_id,x,y,z\n';
  
  // Add data for each receiver
  receivers.forEach(receiver => {
    csv += `${receiver.id},${receiver.x.toFixed(3)},${receiver.y.toFixed(3)},${receiver.z.toFixed(3)}\n`;
  });
  
  return csv;
}





















