// Function to track fish positions including depth
function tracking_trackFishPositions(isFastSim = false, simTime = null) {
    let timestamp;
    if (isFastSim && simTime !== null) {
        timestamp = simTime.toFixed(1); // Use simulation time
    } else {
        if (!trackingStartTime) {
            trackingStartTime = Date.now();
        }
        timestamp = ((Date.now() - trackingStartTime) / 1000).toFixed(1);
    }

    fishes.forEach(fish => {
        trackingData.push({
            timestamp: timestamp,
            fishId: fish.id,
            x: fish.x.toFixed(3),
            y: fish.y.toFixed(3),
            z: fish.z.toFixed(3),
            fish_state: fish.state,
            speed: fish.velocity.norm().toFixed(4)
        });
    });
}

function tracking_startTracking() {
    const fishCount = parseInt(document.getElementById('fishCount')?.value || 10);
    const trackingIntervalSeconds = parseInt(document.getElementById('trackingInterval')?.value || 10);
    const intervalMs = trackingIntervalSeconds * 1000;

    // Only clear data and reset timer if not already tracking
    if (!isTracking) {
        trackingData = [];
        trackingStartTime = null;
    }

    // If already tracking, don't start another interval
    if (isTracking && trackingInterval) return;

    trackingInterval = setInterval(() => {
        tracking_trackFishPositions();

        const trackingStatus = document.getElementById('trackingStatus');
        if (trackingStatus) {
            const dataPointsPerFish = trackingData.length / fishCount;
            trackingStatus.innerHTML = `Tracking: <u><strong>Active</strong></u> (Data points per individual: ${dataPointsPerFish})`;
        }
    }, intervalMs);

    isTracking = true;

    // Initial UI update
    const trackingStatus = document.getElementById('trackingStatus');
    if (trackingStatus) {
        trackingStatus.innerHTML = `Tracking: <u><strong>Active</strong></u> (Data points per individual: 0)`;
    }
}

// Function to stop tracking
function tracking_stopTracking() {
if (trackingInterval) {
    clearInterval(trackingInterval);
    trackingInterval = null;
}
isTracking = false;

// Update UI if it exists
const trackingStatus = document.getElementById('trackingStatus');
if (trackingStatus) {
    trackingStatus.textContent = 'Tracking: Off';
}
}

// // Function to generate and download CSV including depth
// function tracking_downloadCSV() {
//     console.log("tracking_downloadCSV called at:", new Date().toISOString());
//     console.trace(); // This will show the call stack
    
//     if (trackingData.length === 0) {
//         alert('No tracking data available. Start the simulation first.');
//         return;
//     }

//     // Create CSV header including Z
//     let csv = 'timestamp,fishId,x,y,z,random_seed\n';

//     // Add data rows
//     trackingData.forEach(record => {
//         csv += `${record.timestamp},${record.fishId},${record.x},${record.y},${record.z || '0'}, ${randomSeed}\n`;
//     });

//     // Create a Blob and download link
//     const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.setAttribute('href', url);
//     link.setAttribute('download', `fish_tracking_3D_${new Date().toISOString().slice(0,19).replace(/[T:]/g, '-')}.csv`);
//     link.style.visibility = 'hidden';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
// }




// Function to create tracking CSV 
function tracking_createTrackingCSV() {
  // Create CSV header
  let csv = 'timestamp,individual_id,fish_x,fish_y,fish_z,random_seed,fish_state,fish_speed\n';
  
  // Add data rows - convert seconds to ISO date string
  trackingData.forEach(record => {

    // Convert seconds timestamp to ISO string
    const customStartTime = new Date('2025-01-01T00:00:00.000Z').getTime();
    const timestampMs = customStartTime + (parseFloat(record.timestamp) * 1000);
    const isoTimestamp = new Date(timestampMs).toISOString();
    csv += `${isoTimestamp},${record.fishId},${record.x},${record.y},${record.z},${seedValue},${record.fish_state},${record.speed}\n`;
  });
  
  return csv;
}

