export interface State {
  x: number;
  y: number;
  yaw: number;
  v: number;
}

export interface PredictionPoint {
  x: number;
  y: number;
  timestamp: number;
}

/**
 * CO2: Calculus - Kinematic Bicycle Model
 * Uses derivatives to calculate the next state based on steering angle and acceleration.
 */
export function updateState(
  state: State,
  steeringAngle: number,
  acceleration: number,
  dt: number,
  L: number = 2.5 // Wheelbase
): State {
  const { x, y, yaw, v } = state;

  // Differential equations for motion
  const dx = v * Math.cos(yaw);
  const dy = v * Math.sin(yaw);
  const dyaw = (v / L) * Math.tan(steeringAngle);
  const dv = acceleration;

  return {
    x: x + dx * dt,
    y: y + dy * dt,
    yaw: yaw + dyaw * dt,
    v: Math.max(0, v + dv * dt), // Velocity cannot be negative
  };
}

/**
 * CO4: Numerical Methods - Predicting future path
 * Uses Euler integration to project the vehicle's trajectory.
 */
export function predictPath(
  initialState: State,
  steeringAngle: number,
  acceleration: number,
  horizon: number,
  dt: number
): PredictionPoint[] {
  const path: PredictionPoint[] = [];
  let currentState = { ...initialState };

  for (let t = 0; t <= horizon; t += dt) {
    path.push({ x: currentState.x, y: currentState.y, timestamp: t });
    currentState = updateState(currentState, steeringAngle, acceleration, dt);
  }

  return path;
}

/**
 * CO5: Optimization - Simple Pure Pursuit Controller
 * Calculates the steering angle needed to reach a target point.
 */
export function calculateSteeringToTarget(
  state: State,
  target: { x: number; y: number },
  L: number = 2.5
): number {
  const dx = target.x - state.x;
  const dy = target.y - state.y;
  
  // Transform target to vehicle local frame
  const localX = dx * Math.cos(-state.yaw) - dy * Math.sin(-state.yaw);
  const localY = dx * Math.sin(-state.yaw) + dy * Math.cos(-state.yaw);
  
  const distanceSquared = localX * localX + localY * localY;
  if (distanceSquared < 1) return 0;

  // Pure pursuit formula: delta = atan(2 * L * sin(alpha) / ld)
  // alpha is the angle between vehicle heading and target
  const alpha = Math.atan2(localY, localX);
  const steering = Math.atan2(2 * L * Math.sin(alpha), Math.sqrt(distanceSquared));
  
  // Clamp steering to [-45, 45] degrees
  return Math.max(-Math.PI / 4, Math.min(Math.PI / 4, steering));
}

export interface Obstacle {
  x: number;
  y: number;
  radius: number;
}

/**
 * CO5: Curve Fitting - Dynamic Obstacle Avoidance
 * Uses Quadratic Bezier curves to fit a smooth, collision-free path 
 * around obstacles towards the target.
 */
export function generateAvoidanceCurve(
  state: State,
  target: { x: number; y: number },
  obstacles: Obstacle[]
) {
  // 1. Base control point is halfway to the target
  let cp = {
    x: (state.x + target.x) / 2,
    y: (state.y + target.y) / 2
  };

  // 2. Check for obstacles near the direct path and push the control point away
  for (const obs of obstacles) {
    const dx = target.x - state.x;
    const dy = target.y - state.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length === 0) continue;

    const ox = obs.x - state.x;
    const oy = obs.y - state.y;

    // Project obstacle onto the path
    const tProj = Math.max(0, Math.min(1, (ox * dx + oy * dy) / (length * length)));
    const projX = state.x + tProj * dx;
    const projY = state.y + tProj * dy;

    // Distance from obstacle to the direct path
    const distToPath = Math.sqrt(Math.pow(obs.x - projX, 2) + Math.pow(obs.y - projY, 2));

    // If obstacle is dangerously close to the path, push the control point
    const safeDistance = obs.radius + 60; // Safety margin
    if (distToPath < safeDistance) {
      // Determine which side of the path the obstacle is on using cross product
      const crossProduct = dx * oy - dy * ox;
      const pushDir = crossProduct > 0 ? -1 : 1; // Push left or right

      // Perpendicular vector to the path
      const perpX = -dy / length;
      const perpY = dx / length;

      // Push the control point to bend the curve around the obstacle
      const pushAmount = safeDistance - distToPath + 80;
      cp.x += perpX * pushAmount * pushDir;
      cp.y += perpY * pushAmount * pushDir;
    }
  }

  // 3. Evaluate quadratic Bezier curve at t = 0.15 for the lookahead point
  // B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
  const t = 0.15;
  const invT = 1 - t;
  const lookahead = {
    x: invT * invT * state.x + 2 * invT * t * cp.x + t * t * target.x,
    y: invT * invT * state.y + 2 * invT * t * cp.y + t * t * target.y
  };

  return { lookahead, cp };
}

/**
 * CO3: Probability - Simple Collision Check
 */
export interface LidarPoint {
  x: number;
  y: number;
  distance: number;
}

/**
 * Simulates a 2D LIDAR sensor using raycasting against obstacles.
 */
export function simulateLidar(state: State, obstacles: Obstacle[], numRays: number = 30, maxRange: number = 200): LidarPoint[] {
  const points: LidarPoint[] = [];
  const startAngle = -Math.PI / 2; // -90 deg
  const endAngle = Math.PI / 2;    // +90 deg
  
  for (let i = 0; i < numRays; i++) {
    const angle = startAngle + (endAngle - startAngle) * (i / (numRays - 1));
    const rayYaw = state.yaw + angle;
    const dx = Math.cos(rayYaw);
    const dy = Math.sin(rayYaw);
    
    let hitDistance = maxRange;
    
    for (const obs of obstacles) {
      const ox = obs.x - state.x;
      const oy = obs.y - state.y;
      const proj = ox * dx + oy * dy;
      
      if (proj > 0 && proj < maxRange) {
        const px = state.x + proj * dx;
        const py = state.y + proj * dy;
        const distToRay = Math.sqrt(Math.pow(obs.x - px, 2) + Math.pow(obs.y - py, 2));
        
        if (distToRay < obs.radius) {
          const hitDist = proj - Math.sqrt(obs.radius * obs.radius - distToRay * distToRay);
          if (hitDist < hitDistance) {
            hitDistance = hitDist;
          }
        }
      }
    }
    
    points.push({
      x: state.x + hitDistance * dx,
      y: state.y + hitDistance * dy,
      distance: hitDistance
    });
  }
  
  return points;
}

export function checkCollision(state: State, obstacles: Obstacle[]): boolean {
  for (const obs of obstacles) {
    const dx = state.x - obs.x;
    const dy = state.y - obs.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < obs.radius + 15) return true; // 15 is car half-length approx
  }
  return false;
}
