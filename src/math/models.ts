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
 * CO3: Probability - Simple Collision Check
 */
export function checkCollision(state: State, obstacles: Obstacle[]): boolean {
  for (const obs of obstacles) {
    const dx = state.x - obs.x;
    const dy = state.y - obs.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < obs.radius + 15) return true; // 15 is car half-length approx
  }
  return false;
}
