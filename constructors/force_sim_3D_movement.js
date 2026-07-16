// Vector class (required for force calculations)
class Vector extends Array {
    add(other) { return this.map((e, i) => e + other[i]); }
    sub(other) { return this.map((e, i) => e - other[i]); }
    mul(other) { return this.map((e, i) => e * other[i]); }
    div(other) { return this.map((e, i) => e / other[i]); }
    dot(other) { return this.reduce((total, current, i) => total + current * other[i], 0); }
    add_scalar(scalar) { return this.map(e => e + scalar); }
    mul_scalar(scalar) { return this.map(e => e * scalar); }
    div_scalar(scalar) { return this.map(e => e / scalar); }
    sum() { return this.reduce((total, current) => total + current, 0); }
    norm() { const sumOfSquares = this.reduce((total, current) => total + current ** 2, 0); return Math.sqrt(sumOfSquares); }
    normXY() { return Math.sqrt(this[0] ** 2 + this[1] ** 2); }
    phi() { return Math.atan2(this[1], this[0]); }
    theta() { return Math.atan2(this.normXY(), this[2]); }
    u_v() { return this.div_scalar(this.norm()); }
    u_phi() { const phi = this.phi(); const sin_theta = Math.sin(this.theta()); return [-Math.sin(phi) * sin_theta, Math.cos(phi) * sin_theta, 0]; }
    u_theta() { const phi = this.phi(); const theta = this.theta(); return [Math.cos(phi) * Math.cos(theta), Math.sin(phi) * Math.cos(theta), - Math.cos(theta)]; }
}

// --- Social force implementation ---
function socialForce(fish, fishes) {
    const ALIGN_STRENGTH_REST = 2.0;
    const ALIGN_STRENGTH_ACTIVE = 0.0;
    const MIN_SEP = 1.0;   // soft minimum separation (meters) to avoid overlapping
    const SEP_K = 2.0;     // strength of separation

    let alignForce = new Vector(0, 0, 0);
    let attractForce = new Vector(0, 0, 0);
    let separationForce = new Vector(0, 0, 0);
    let weightSum = 0;

    fishes.forEach(other => {
        if (other === fish) return;

        const dx = fish.position[0] - other.position[0];
        const dy = fish.position[1] - other.position[1];
        const dz = fish.position[2] - other.position[2];
        const dist = Math.hypot(dx, dy, dz);
        if (dist <= 1e-8) return; // guard exact overlap

        // Soft separation if too close
        if (dist < MIN_SEP) {
            const inv = 1 / dist;
            const dirFromOther = new Vector(dx * inv, dy * inv, dz * inv);
            const mag = SEP_K * (MIN_SEP - dist) / MIN_SEP;
            separationForce = separationForce.add(dirFromOther.mul_scalar(mag));
            return; // skip align/attract for this neighbor
        }

        if (dist < fish.socialRadius && other.state === "resting") {
            const sameSubpop = (other.subpopulationId === fish.subpopulationId);
            const weight = sameSubpop ? socialAffinitySame : socialAffinityDifferent;

            // Robust heading for neighbors at (near) zero speed
            const otherSpeed = other.velocity ? other.velocity.norm() : 0;
            const heading = (Number.isFinite(otherSpeed) && otherSpeed > 1e-12)
                ? other.velocity.u_v()
                : new Vector(
                    Math.cos(other.phi) * Math.sin(other.theta),
                    Math.sin(other.phi) * Math.sin(other.theta),
                    Math.cos(other.theta)
                );

            alignForce = alignForce.add(heading.mul_scalar(weight));

            const inv = 1 / dist;
            const dirToOther = new Vector(-dx * inv, -dy * inv, -dz * inv);
            attractForce = attractForce.add(dirToOther.mul_scalar(weight));
            weightSum += weight;
        }
    });

    let social = new Vector(0, 0, 0);
    if (weightSum > 0) {
        alignForce = alignForce.div_scalar(weightSum);
        attractForce = attractForce.div_scalar(weightSum);
        const alignStrength = fish.state === "resting" ? ALIGN_STRENGTH_REST : ALIGN_STRENGTH_ACTIVE;
        const attractStrength = fish.state === "resting"
            ? fish.socialAttractStrengthRest
            : fish.socialAttractStrengthActive;
        social = alignForce.mul_scalar(alignStrength).add(attractForce.mul_scalar(attractStrength));
    }
    return social.add(separationForce);
}


// Enhanced boundary repulsion forces for all sides of the cube
function boundaryRepulsionForce(fish, response_time, strength, repulsion_percentage, currentShape, fishRandom) {
    const p = fish.position;
    const v = fish.velocity;
    const p_after_respTime = p.add(v.mul_scalar(response_time));
    let force = new Vector(0, 0, 0);

    if (!currentShape || !currentShape.bounds) return force;

    const bounds = currentShape.bounds;
    const x = p_after_respTime[0];
    const y = p_after_respTime[1];
    const z = p_after_respTime[2];

    // Calculate repulsion distances as percentage of extent for each dimension
    const xExtent = bounds.maxX - bounds.minX;
    const yExtent = bounds.maxY - bounds.minY;
    const zExtent = bounds.maxZ - bounds.minZ;

    const repulsion_distance_x = xExtent * repulsion_percentage;
    const repulsion_distance_y = yExtent * repulsion_percentage;
    const repulsion_distance_z = zExtent * repulsion_percentage;

    // Track forces for each boundary separately
    let forceComponents = [];

    // X boundaries (left and right walls)
    if (x < bounds.minX + repulsion_distance_x) {
        const distance = x - bounds.minX;
        if (distance < repulsion_distance_x) {
            const forceX = new Vector(0, 0, 0);
            forceX[0] = strength * Math.pow((repulsion_distance_x - distance) / repulsion_distance_x, 2);
            forceComponents.push(forceX);
        }
    }
    if (x > bounds.maxX - repulsion_distance_x) {
        const distance = bounds.maxX - x;
        if (distance < repulsion_distance_x) {
            const forceX = new Vector(0, 0, 0);
            forceX[0] = -strength * Math.pow((repulsion_distance_x - distance) / repulsion_distance_x, 2);
            forceComponents.push(forceX);
        }
    }

    // Y boundaries (top and bottom walls)
    if (y < bounds.minY + repulsion_distance_y) {
        const distance = y - bounds.minY;
        if (distance < repulsion_distance_y) {
            const forceY = new Vector(0, 0, 0);
            forceY[1] = strength * Math.pow((repulsion_distance_y - distance) / repulsion_distance_y, 2);
            forceComponents.push(forceY);
        }
    }
    if (y > bounds.maxY - repulsion_distance_y) {
        const distance = bounds.maxY - y;
        if (distance < repulsion_distance_y) {
            const forceY = new Vector(0, 0, 0);
            forceY[1] = -strength * Math.pow((repulsion_distance_y - distance) / repulsion_distance_y, 2);
            forceComponents.push(forceY);
        }
    }

    // Z boundaries (surface and bottom)
    if (z < bounds.minZ + repulsion_distance_z) {
        const distance = z - bounds.minZ;
        if (distance < repulsion_distance_z) {
            const forceZ = new Vector(0, 0, 0);
            forceZ[2] = strength * Math.pow((repulsion_distance_z - distance) / repulsion_distance_z, 2);
            forceComponents.push(forceZ);
        }
    }
    if (z > bounds.maxZ - repulsion_distance_z) {
        const distance = bounds.maxZ - z;
        if (distance < repulsion_distance_z) {
            const forceZ = new Vector(0, 0, 0);
            forceZ[2] = -strength * Math.pow((repulsion_distance_z - distance) / repulsion_distance_z, 2);
            forceComponents.push(forceZ);
        }
    }

    // If multiple force components, prioritise the strongest one plus a portion of others to help avoid corners
    if (forceComponents.length > 1) {
        // Sort by magnitude (strongest first)
        forceComponents.sort((a, b) => b.norm() - a.norm());

        // Take 100% of strongest force
        force = forceComponents[0];

        // Add 30% of other forces to help with corners
        for (let i = 1; i < forceComponents.length; i++) {
            force = force.add(forceComponents[i].mul_scalar(0.3));
        }
    } else if (forceComponents.length === 1) {
        force = forceComponents[0];
    }

    // Add a small random component to help fish escape corners
    if (force.norm() > 0) {
        const randomComponent = new Vector(
            (fishRandom() - 0.5) * 0.1 * strength,
            (fishRandom() - 0.5) * 0.1 * strength,
            (fishRandom() - 0.5) * 0.1 * strength
        );
        force = force.add(randomComponent);
    }

    return force;
}

// Hard boundary enforcement (prevents crossing)
function enforceBoundaries(fish, currentShape) {
    if (!currentShape || !currentShape.bounds) return;

    const bounds = currentShape.bounds;
    let positionChanged = false;

    // Clamp position to boundaries
    if (fish.position[0] < bounds.minX) {
        fish.position[0] = bounds.minX;
        positionChanged = true;
    }
    if (fish.position[0] > bounds.maxX) {
        fish.position[0] = bounds.maxX;
        positionChanged = true;
    }

    if (fish.position[1] < bounds.minY) {
        fish.position[1] = bounds.minY;
        positionChanged = true;
    }
    if (fish.position[1] > bounds.maxY) {
        fish.position[1] = bounds.maxY;
        positionChanged = true;
    }

    if (fish.position[2] < bounds.minZ) {
        fish.position[2] = bounds.minZ;
        positionChanged = true;
    }
    if (fish.position[2] > bounds.maxZ) {
        fish.position[2] = bounds.maxZ;
        positionChanged = true;
    }

    // Update x, y, z for compatibility
    if (positionChanged) {
        fish.x = fish.position[0];
        fish.y = fish.position[1];
        fish.z = fish.position[2];

        // Dampen velocity component that's pushing into the boundary
        const dampingFactor = 0.5;
        if (fish.position[0] <= bounds.minX || fish.position[0] >= bounds.maxX) {
            fish.velocity[0] *= dampingFactor;
        }
        if (fish.position[1] <= bounds.minY || fish.position[1] >= bounds.maxY) {
            fish.velocity[1] *= dampingFactor;
        }
        if (fish.position[2] <= bounds.minZ || fish.position[2] >= bounds.maxZ) {
            fish.velocity[2] *= dampingFactor;
        }
    }
}


function homeRangeRepulsionForce(fish, strength) {
    if (!fish.homeCenter || !fish.homeRadius) return new Vector(0, 0, 0);

    const dx = fish.position[0] - fish.homeCenter[0];
    const dy = fish.position[1] - fish.homeCenter[1];
    const r = Math.hypot(dx, dy);
    if (r === 0) return new Vector(0, 0, 0);

    const ux = dx / r, uy = dy / r;
    const R = fish.homeRadius;
    const alpha = 0.8;                 
    const Rin = alpha * R;
    const band = Math.max(1e-6, R - Rin);

    // Per-fish strength 
    const kFish = (typeof fish.homeBiasK === 'number' && fish.homeBiasK > 0) ? fish.homeBiasK : 0.25;
    const k = (strength || 1) * kFish;

    let mag = 0;

    if (r <= Rin) {
        // No bias inside 80% of R
        mag = 0;
    } else if (r <= R) {
        // gentle start, stronger near edge
        const t = (r - Rin) / band;          // 0..1
        const s = t * t * (3 - 2 * t);       // smoothstep
        const ramp = s * s;                  // convex ramp
        mag = k * ramp;
    } else {
        // Slight excursions allowed
        const overshoot = r - R;
        const outNorm = overshoot / band;            // normalize by band width
        const outRamp = outNorm / (1 + outNorm);     // 0..1
        const outGain = 3.0;                         // stronger outside
        mag = k * (1 + outGain * outRamp);
    }

    return new Vector(-ux * mag, -uy * mag, 0);
}


/**
 * Updates the fish's position and velocity using force-based 3D movement.
 * @param {Fish} fish - fish instance.
 * @param {Object} options - { dt, response_time, boundary_strength, repulsion_percentage, currentShape }
 */
function forceBasedMove3D(fish, options) {
    // Initialize position/velocity if needed
    if (!fish.position) fish.position = new Vector(fish.x, fish.y, fish.z);
    if (!fish.velocity) fish.velocity = new Vector(
        Math.cos(fish.direction) * (fish.speedMPS),
        Math.sin(fish.direction) * (fish.speedMPS),
        (fish.depthDirection) * (fish.speedMPS)
    );

    // Select shape from options or fallback
    const shapeForBounds = options.currentShape || currentShape;

    // Calculate boundary repulsion force (use options instead of globals)
    const force_boundary = boundaryRepulsionForce(
        fish,
        options.response_time,
        options.boundary_strength,
        options.repulsion_percentage,
        shapeForBounds,
        fishRandom
    );

    // Social force
    const force_social = Array.isArray(fishes) ? socialForce(fish, fishes) : new Vector(0, 0, 0);

    // Home-range inward force (use a softer strength than boundary)
    const homeStrength = (typeof options.home_strength === 'number')
        ? options.home_strength
        : 0.4 * options.boundary_strength; // 40% of boundary strength
    const force_home = homeRangeRepulsionForce(fish, homeStrength);

    // Combine forces
    // For speed: only use social + home-range
    const total_force_for_speed = force_social.add(force_home);
    // For direction: use all (including boundary)
    const total_force_for_direction = force_boundary.add(force_social).add(force_home);

    // Movement parameters (with defaults if not set)
    const beta = fish.beta;
    const v0 = fish.v0;
    const D_phi = fish.D_phi;
    const D_theta = fish.D_theta;
    const D_v = fish.D_v;

    // Get current orientation
    let phi = fish.phi;
    let theta = fish.theta;
    let speed = fish.velocity.norm();

    // Calculate unit vectors
    const cos_phi = Math.cos(phi), sin_phi = Math.sin(phi);
    const cos_theta = Math.cos(theta), sin_theta = Math.sin(theta);
    const u_v = new Vector(cos_phi * sin_theta, sin_phi * sin_theta, cos_theta);
    const u_phi = new Vector(-sin_phi * sin_theta, cos_phi * sin_theta, 0);
    const u_theta = new Vector(cos_phi * cos_theta, sin_phi * cos_theta, -sin_theta);

    // Update speed based on state
    const isResting = (fish.state === "resting");
    const speedForceGain = (typeof fish.forceSpeedGain === 'number')
        ? fish.forceSpeedGain
        : (isResting ? 0.15 : 0.6);

    // Only use social + home-range for speed update
    const force_v = total_force_for_speed.dot(u_v) * speedForceGain;

    // Relaxation toward v0 plus projected force
    speed += (beta * (v0 - speed) + force_v) * options.dt;

    // Add D_v-driven speed noise (no hard caps)
    speed += Math.sqrt(Math.max(0, D_v) * options.dt) * randomNormal(0, 1, fishRandom);

    // prevent negative speeds 
    speed = Math.max(0, speed);

    // Update angles with boundary forces (use total_force_for_direction)
    const force_phi = total_force_for_direction.dot(u_phi);
    const rand_phi = Math.sqrt(D_phi * options.dt) * randomNormal(0, 1, fishRandom);
    phi += (force_phi * options.dt + rand_phi) / (speed + 2);

    const force_theta = total_force_for_direction.dot(u_theta);
    const rand_theta = Math.sqrt(D_theta * options.dt) * randomNormal(0, 1, fishRandom);
    theta += (force_theta * options.dt + rand_theta) / (speed + 5);

    // Clamp theta to valid range
    if (theta < 0) { phi += Math.PI; theta = -theta; }
    if (theta > Math.PI) { phi += Math.PI; theta = 2 * Math.PI - theta; }

    // Update velocity vector
    fish.velocity = new Vector(
        Math.cos(phi) * Math.sin(theta),
        Math.sin(phi) * Math.sin(theta),
        Math.cos(theta)
    ).mul_scalar(speed);

    // Update position
    fish.position = fish.position.add(fish.velocity.mul_scalar(options.dt));

    // Store updated values
    fish.phi = phi;
    fish.theta = theta;
    fish.speedMPS = speed;
    fish.direction = phi; // For compatibility

    // Update x, y, z for compatibility
    fish.x = fish.position[0];
    fish.y = fish.position[1];
    fish.z = fish.position[2];

    // Enforce hard boundaries
    enforceBoundaries(fish, shapeForBounds);
}

function randomNormal(mean = 0, std = 1, fishRandom = Math.random) {
    let u = 1 - fishRandom();
    let v = fishRandom();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * std + mean;
}