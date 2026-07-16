// Function to download both detection records and fish tracking data as a zip file
function download_data_downloadZip() {


    // Check if JSZip is loaded, if not, load it first
    if (typeof JSZip === 'undefined') {
        download_data_loadJSZip().then(() => {
            download_data_downloadZip(); // Try again after JSZip loads
        }).catch(error => {
            console.error('Failed to load JSZip library:', error);
            alert('Unable to create ZIP file. Please try again or check your internet connection.');
        });
        return;
    }

    // Check if we have any data to download
    let hasDetections = false;
    let hasTracking = false;
    let hasShape = false;
    let hasmetadata = false;
    let hasReceivers = false; 
    
    // Check for detection data
    receivers.forEach(receiver => {
        if (receiver.detections && receiver.detections.length > 0) {
            hasDetections = true;
        }
    });

    // Check for receivers data
    if (receivers && receivers.length > 0) {
        hasReceivers = true;
    }
    
    // Check for tracking data
    if (trackingData && trackingData.length > 0) {
        hasTracking = true;
    }
    
    if (!hasDetections && !hasTracking && !hasShape) {
        alert('No data available to download. Please run a simulation first.');
        return;
    }

    // Check if currentShape is defined and has data
    if (currentShape != null) {
        hasShape = true;
    } 

    // Check if metadata is available
    if (simulationMetadata != null) {
        hasmetadata = true;
    }
    console.log(hasmetadata)
    // Create ZIP file using JSZip
    const zip = new JSZip();
    
    // Add detection records CSV if available - use existing function
    if (hasDetections) {
        const detectionCSV = receiver_detecting_createDetectionCSV();
        zip.file(`fish_acoustic_detections_3D_${new Date().toISOString().slice(0,19).replace(/[T:]/g, '-')}.csv`, detectionCSV);
    }
    
    // Add tracking data CSV if available - use existing function
    if (hasTracking) {
        const trackingCSV = tracking_createTrackingCSV();
        zip.file(`fish_movement_track_3D_${new Date().toISOString().slice(0,19).replace(/[T:]/g, '-')}.csv`, trackingCSV);
    }

 // Add shapefile (GeoJSON) if available
    if (hasShape) {
        const shapefileData = download_data_createShapefileData();
        zip.file(`simulation_shape_${new Date().toISOString().slice(0,19).replace(/[T:]/g, '-')}.geojson`, shapefileData);
    }

    if (hasmetadata) {
        const metadataCSV = metadata_createCSV();
    zip.file(`metadata_${new Date().toISOString().slice(0,19).replace(/[T:]/g, '-')}.csv`, metadataCSV);
    }

    // Add receivers data CSV if available - use new function
    if (hasReceivers) {
        const receiversCSV = receivers_createCSV();
        zip.file(`receiver_positions_${new Date().toISOString().slice(0,19).replace(/[T:]/g, '-')}.csv`, receiversCSV);
    }

     // Add movement parameters CSV if available
    if (fishes && fishes.length > 0 && typeof fish_createMovementParamsCSV === 'function') {
        const movementParamsCSV = fish_createMovementParamsCSV();
        zip.file(`fish_movement_parameters_${new Date().toISOString().slice(0,19).replace(/[T:]/g, '-')}.csv`, movementParamsCSV);
    }

    // Generate and download the ZIP file
    zip.generateAsync({type: "blob"})
        .then(function(content) {
            const url = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `fish_simulation_data_${new Date().toISOString().slice(0,19).replace(/[T:]/g, '-')}.zip`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        });
}


// Function to add JSZip library dynamically
function download_data_loadJSZip() {
    return new Promise((resolve, reject) => {
        // Check if JSZip is already loaded
        if (typeof JSZip !== 'undefined') {
            resolve();
            return;
        }
        
        // Load JSZip from CDN
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Only run this in a browser environment
document.addEventListener('DOMContentLoaded', function() {
        download_data_loadJSZip().catch(function(error) {
            console.error('Failed to load JSZip library:', error);
        });
    });
