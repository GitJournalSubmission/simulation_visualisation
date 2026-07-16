////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////Set global variables//////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let trackingData = []; // Array to store position data over time
let trackingInterval = null; // Interval reference for position tracking
let isTracking = false; // Flag to check if tracking is active
let trackingStartTime = null; // To track elapsed time
let fishes = []; // Array to store fish objects
let animationId = null; // Varibale to store the animation frame ID
let fishCreated = false; // Flag to check if fish have been created
let receiversCreated = false; // Flag to check if receivers have been created
let showFishLabels = true; // Default to showing fish labels
let receivers = []; // Array to store receiver objects
let detectionRange = 100; // Default detection range in meters
let showReceiverLabels = true;  // Default to showing receiver labels
let placingError = 0; // Default placing error percentage
let seedValue = null; // Seed value for random number generation

// Get the canvas and its context
const canvas = document.getElementById('trailCanvas');
const ctx = canvas.getContext('2d');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////Set the random seed//////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////


let fishRandomSeed = null;
let receiverRandomSeed = null;
let fishRandom = function() { return Math.random(); };
let receiverRandom = function() { return Math.random(); };
let initialFishRandomSeed = null;
let initialReceiverRandomSeed = null;

function setFishRandomSeed(seed) {
    fishRandomSeed = seed;
    initialFishRandomSeed = seed;
    let t = seed;
    fishRandom = function() {
        t += 0x6D2B79F5;
        let r = Math.imul(t ^ t >>> 15, 1 | t);
        r ^= r + Math.imul(r ^ r >>> 7, 61 | r);
        return ((r ^ r >>> 14) >>> 0) / 4294967296;
    };
}

function setReceiverRandomSeed(seed) {
    receiverRandomSeed = seed;
    initialReceiverRandomSeed = seed;
    let t = seed;
    receiverRandom = function() {
        t += 0x6D2B79F5;
        let r = Math.imul(t ^ t >>> 15, 1 | t);
        r ^= r + Math.imul(r ^ r >>> 7, 61 | r);
        return ((r ^ r >>> 14) >>> 0) / 4294967296;
    };
}

function resetFishRandomSeedForFastSim() {
    if (initialFishRandomSeed !== null) {
        setFishRandomSeed(initialFishRandomSeed);
    }
}

function resetReceiverRandomSeedForFastSim() {
    if (initialReceiverRandomSeed !== null) {
        setReceiverRandomSeed(initialReceiverRandomSeed);
    }
}

//updated function to generate normal distribution used for the social radius creation in the fish class
function fishRandomNormal(mean, std) {
    let u = 0, v = 0;
    while(u === 0) u = fishRandom(); // Avoid 0
    while(v === 0) v = fishRandom();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return num * std + mean;
}

// Export functions for Node.js/cluster use
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = {
        setFishRandomSeed,
        setReceiverRandomSeed,
        resetFishRandomSeedForFastSim,
        resetReceiverRandomSeedForFastSim,
        fishRandomNormal,
        // add any other functions you want to use in Node.js
    };
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////Load UI script ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Load UI script dynamically
function load_UIScript() {
  const script = document.createElement('script');
  script.src = './UI/force_sim_3D_UI.js';
  script.onload = function() {
    setupUI_shape();
    setupUI_fish();
    setupUI_receiver();
    setupUI_simulation();
    setupUI_download_button();
    setupUI_clear_button();
    setupUI_collapseToggle();
  };
  
  script.onerror = function() {
    console.error('Failed to load UI script. Make sure sim_3D_UI.js exists in the correct location.');
  };
  document.head.appendChild(script);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////Load Shape constructor///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Load shape script dynamically
function load_shape_constructor() {
  const script = document.createElement('script');
  script.src = './constructors/force_sim_3D_shape.js';
  script.onload = function() {
    shape_resizeCanvas();
    //shape_setRectangle();
    shape_updateRectangleInfo();
    shape_drawShape();
    shape_scaleCoordinatesToCanvas();
    shape_worldToCanvasCoordinates();
    shape_clearRectangle();

  };
  
  script.onerror = function() {
    console.error('Failed to load shape script.');
  };
  document.head.appendChild(script);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////Fish movement//////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Load fish class script dynamically
function load_fish_movement() {
  const script = document.createElement('script');
  script.src = './constructors/force_sim_3D_movement.js';
  
  script.onerror = function() {
    console.error('Failed to load fish movement script.');
  };
  document.head.appendChild(script);
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////Fish creator//////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Load fish class script dynamically
function load_fish_class_constructor() {
  const script = document.createElement('script');
  script.src = './constructors/force_sim_3D_fish_class.js';
  
  script.onerror = function() {
    console.error('Failed to load fish class script.');
  };
  document.head.appendChild(script);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////Fish tracking//////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Load fish tracking script dynamically
function load_tracking_constructor() {
  const script = document.createElement('script');
  script.src = './constructors/force_sim_3D_fish_tracking.js';
    
  script.onerror = function() {
    console.error('Failed to load fish tracking script.');
  };
  document.head.appendChild(script);
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////Receiver creator//////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Load fish class script dynamically
function load_receiver_class_constructor() {
  const script = document.createElement('script');
  script.src = './constructors/force_sim_3D_receiver_class.js';
  
  script.onerror = function() {
    console.error('Failed to load receiver class script.');
  };
  document.head.appendChild(script);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////Receiver tracking//////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Load fish class script dynamically
function load_receiver_detecting_constructor() {
  const script = document.createElement('script');
  script.src = './constructors/force_sim_3D_receiver_detecting.js';
  
  script.onerror = function() {
    console.error('Failed to load receiver detecting script.');
  };
  document.head.appendChild(script);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////Timeseries simulation  //////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Load fish class script dynamically
function load_timeseries_simulation_constructor() {
  const script = document.createElement('script');
  script.src = './constructors/force_sim_3D_fast_sim.js';
  
  script.onerror = function() {
    console.error('Failed to timeseries simulation script.');
  };
  document.head.appendChild(script);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////Metadata preparation //////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Load fish class script dynamically
function load_metadata_preparation() {
  const script = document.createElement('script');
  script.src = './constructors/force_sim_3D_metadata.js';
  
  script.onerror = function() {
    console.error('Failed to timeseries simulation script.');
  };
  document.head.appendChild(script);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////Download data  //////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Load fish class script dynamically
function load_download_data_script() {
  const script = document.createElement('script');
  script.src = './constructors/force_sim_3D_download_data.js';
  
  script.onerror = function() {
    console.error('Failed to timeseries simulation script.');
  };
  document.head.appendChild(script);
}






////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////Main simulation start //////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Start the simulation
function startSimulation() {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  animationId = requestAnimationFrame(update_fish_and_receiver);
}

// Stop the simulation
function stopSimulation() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

// Only run this in a browser environment
window.onload = function() {
      load_UIScript();
      load_shape_constructor();
      load_fish_movement();
      load_fish_class_constructor();
      load_tracking_constructor();
      load_receiver_class_constructor();
      load_receiver_detecting_constructor();
      load_timeseries_simulation_constructor();
      load_metadata_preparation();
      load_download_data_script();
      
      // Handle window resize
      window.addEventListener('resize', () => {
        shape_resizeCanvas();
        if (fishCreated) {
          startSimulation();
        }
      });
    };





