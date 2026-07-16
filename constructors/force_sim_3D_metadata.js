// Create metata
let simulationMetadata = null; // Declare globally but initialize as null
function create_metadata() {
    // Create metadata only when called (before download)
    simulationMetadata = {
        // Simulation parameters
        simulation_date: new Date().toISOString(),
        simulation_duration_days: simulationEndTime/24/3600, // Convert seconds to days
        
        //shapefile extend
        shapefile_extend_x: parseInt(document.getElementById('maxX')?.value),
        shapefile_extend_y: parseInt(document.getElementById('maxY')?.value),
        shapefile_extend_z: parseInt(document.getElementById('maxZ')?.value),

        // Random seed
        random_seed: seedValue || 'not_set',

        // Fish parameters
        fish_count: parseInt(document.getElementById('fishCount')?.value),
        fish_tracking_interval_seconds: parseInt(document.getElementById('trackingInterval')?.value),
        
        //movement parameters
        fish_active_v0: parseFloat(document.getElementById('activePanel_v0')?.value),
        fish_resting_v0: parseFloat(document.getElementById('restingPanel_v0')?.value),

        fish_active_beta: parseFloat(document.getElementById('activePanel_beta')?.value),
        fish_resting_beta: parseFloat(document.getElementById('restingPanel_beta')?.value),

        fish_active_D_phi: parseFloat(document.getElementById('activePanel_D_phi')?.value),
        fish_resting_D_phi: parseFloat(document.getElementById('restingPanel_D_phi')?.value),

        fish_active_D_theta: parseFloat(document.getElementById('activePanel_D_theta')?.value),
        fish_resting_D_theta: parseFloat(document.getElementById('restingPanel_D_theta')?.value),

        fish_active_D_v: parseFloat(document.getElementById('activePanel_D_v')?.value),
        fish_resting_D_v: parseFloat(document.getElementById('restingPanel_D_v')?.value),

        // Fish states
        active_state_duration: parseInt(document.getElementById('activeDuration')?.value),
        resting_state_duration: parseInt(document.getElementById('restingDuration')?.value),

        prob_state_change_Rest_Rest: parseInt(document.getElementById('probRestRest')?.value),
        prob_state_change_Rest_Active: parseInt(document.getElementById('probRestActive')?.value),

        prob_state_change_Active_Active: parseInt(document.getElementById('probActiveActive')?.value),
        prob_state_change_Active_Rest: parseInt(document.getElementById('probActiveRest')?.value),


        // Fish social parameters
        mean_social_radius: parseFloat(document.getElementById('socialRadiusMean')?.value),
        std_dev_social_radius:parseFloat(document.getElementById('socialRadiusStd')?.value),

        // Receiver parameters
        receiver_count: parseInt(document.getElementById('receiverCount')?.value),
        receiver_range_meters: detectionRange,
        receiver_layout_error_percentage: placingError,
        fine_scale_layout: document.getElementById('vpsMode')?.checked === true,        
        
    };
}

// Function to create CSV (now outside create_metadata)
function metadata_createCSV() {
    if (!simulationMetadata) {
        return null; // Return null if metadata hasn't been created
    }
    
    const headers = [];
    const values = [];
    
    Object.keys(simulationMetadata).forEach(key => {
        if (simulationMetadata[key] !== null && simulationMetadata[key] !== undefined) {
            headers.push(key);
            let value = String(simulationMetadata[key]);
            if (value.includes(',') || value.includes('"')) {
                value = '"' + value.replace(/"/g, '""') + '"';
            }
            values.push(value);
        }
    });
    
    return headers.join(',') + '\n' + values.join(',');
}
