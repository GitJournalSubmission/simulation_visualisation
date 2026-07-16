// this script is needed to run the simulation in a cluster

const { download_data } = require('./constructors/force_sim_3D_download_data.js');
const { fast_sim } = require('./constructors/force_sim_3D_fast_sim.js');
const { fish_class } = require('./constructors/force_sim_3D_fish_class.js');
const { fish_tracking} = require('./constructors/force_sim_3D_fish_tracking.js');
const { metadata} = require('./constructors/force_sim_3D_metadata.js');
const { movement} = require('./constructors/force_sim_3D_movement.js');
const { receiver_class } = require('./constructors/force_sim_3D_receiver_class.js');
const { receiver_detecting } = require('./constructors/force_sim_3D_receiver_detecting.js');
const { shape } = require('./constructors/force_sim_3D_shape.js');


// 1. Set shape parameters
const shapeParams = { 
    x: 10000, 
    y: 10000, 
    z: 30 
};



// 2. Fish parameters
const fishParams = {
  count: 5,
  movementParams: {
    socialRadiusMean: 30,
    socialRadiusStd: 10,
    active: {
      v0: 3.6,      // m/s
      beta: 0.8,
      D_phi: 0.5,
      D_theta: 0.5,
      D_v: 0.5
    },
    resting: {
      v0: 0.5,      // m/s
      beta: 0.5,
      D_phi: 0.2,
      D_theta: 0.2,
      D_v: 0.2
    },
    restingDuration: 170,   // seconds
    activeDuration: 30,     // seconds
    probRestRest: 80,       // %
    probRestActive: 20,     // %
    probActiveActive: 20,   // %
    probActiveRest: 80      // %
  },
  tracking: {
    enabled: true,
    interval: 10 // seconds
  }
};

// 3. Receiver parameters
const receiverParams = {
  count: 5,
  detectionRange: 100, // meters (80% detection probability)
  placingError: 0,     // percent (0 = equidistant, 100 = random)
  vpsMode: false       // true = fine-scale array layout (VPS)
};

// 4. Set simulation time
global.simulationEndTime = 1* (24 * 3600); // 10 days in seconds

// 5. Set random seed if needed
const randomSeed = 12345;
require('./force_sim_main_3D.js').setFishRandomSeed(randomSeed);
require('./force_sim_main_3D.js').setReceiverRandomSeed(randomSeed);

// 6. Set up simulation
shape(shapeParams.x, shapeParams.y, shapeParams.z);
fish_class(fishParams.count, fishParams.movementParams);
movement(); 
receiver_class(receiverParams.count, receiverParams.detectionRange, receiverParams.placingError, receiverParams.vpsMode);
receiver_detecting(); 
metadata(); 
download_data();

// 7. Fish tracking (if enabled)
if (fishParams.tracking.enabled) {
  fish_tracking(fishParams.tracking.interval);
}

// 8. Run simulation
fast_sim();

// 9. Save output to file
const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');

// Node-compatible function to zip and save all available data
async function saveAllSimulationDataZip() {
    const zip = new JSZip();

    // Add detection records CSV if available
    if (typeof receiver_detecting_createDetectionCSV === 'function' && receivers && receivers.some(r => r.detections && r.detections.length > 0)) {
        const detectionCSV = receiver_detecting_createDetectionCSV();
        zip.file(`fish_acoustic_detections_3D.csv`, detectionCSV);
    }

    // Add tracking data CSV if available
    if (typeof tracking_createTrackingCSV === 'function' && global.trackingData && global.trackingData.length > 0) {
        const trackingCSV = tracking_createTrackingCSV();
        zip.file(`fish_movement_track_3D.csv`, trackingCSV);
    }

    // Add shape GeoJSON if available
    if (typeof download_data_createShapefileData === 'function' && typeof currentShape !== 'undefined' && currentShape != null) {
        const shapefileData = download_data_createShapefileData();
        zip.file(`simulation_shape.geojson`, shapefileData);
    }

    // Add metadata CSV if available
    if (typeof metadata_createCSV === 'function' && global.simulationMetadata) {
        const metadataCSV = metadata_createCSV();
        zip.file(`metadata.csv`, metadataCSV);
    }

    // Add receivers CSV if available
    if (typeof receivers_createCSV === 'function' && receivers && receivers.length > 0) {
        const receiversCSV = receivers_createCSV();
        zip.file(`receiver_positions.csv`, receiversCSV);
    }

    // Add movement parameters CSV if available
    if (typeof fish_createMovementParamsCSV === 'function' && fishes && fishes.length > 0) {
        const movementParamsCSV = fish_createMovementParamsCSV();
        zip.file(`fish_movement_parameters.csv`, movementParamsCSV);
    }

    // Write the zip file to disk
    const content = await zip.generateAsync({ type: 'nodebuffer' });
    fs.writeFileSync(path.join(__dirname, `sim_output/fish_simulation_data.zip`), content);
}

// 11. Save everything as a zip (like the UI "Download everything" button)
saveAllSimulationDataZip().then(() => {
    console.log('All available simulation data saved as fish_simulation_data.zip');
}).catch(err => {
    console.error('Failed to save simulation data zip:', err);
});



















































