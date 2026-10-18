/**
 * Rover steering: pick the free direction in the lidar fan that is closest to
 * the goal, then turn and drive toward it. Pure functions so the behavior can
 * be tested without a renderer.
 */

export const WHEEL_RADIUS = 0.055;
export const HALF_TRACK = 0.095;
export const RAY_CUTOFF = 0.9;
/** Lidar fan from 105° left to 105° right, in the robot frame. */
export const RAY_ANGLES = Array.from({ length: 15 }, (_, i) => ((105 - i * 15) * Math.PI) / 180);

export interface Pose {
  x: number;
  y: number;
  yaw: number;
}

export interface Command {
  left: number;
  right: number;
  /** Chosen steering direction in the robot frame. */
  heading: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

/**
 * `ranges`: free distance along each ray of `RAY_ANGLES` (cutoff when nothing is hit).
 * `previous`: last chosen heading, so the rover commits to one side of an obstacle.
 */
export function drive(pose: Pose, goal: { x: number; y: number }, ranges: ArrayLike<number>, previous = 0): Command {
  const dist = Math.hypot(goal.x - pose.x, goal.y - pose.y);
  const toGoal = wrap(Math.atan2(goal.y - pose.y, goal.x - pose.x) - pose.yaw);
  const n = RAY_ANGLES.length;

  // A direction is only as free as its neighbours: the rover is wider than a ray.
  const free = (i: number) => Math.min(ranges[i], ranges[Math.max(0, i - 1)], ranges[Math.min(n - 1, i + 1)]);

  let best = toGoal;
  let bestCost = Infinity;
  let goalBlocked = false;
  for (let i = 0; i < n; i++) {
    const a = RAY_ANGLES[i];
    const f = free(i);
    if (Math.abs(wrap(a - toGoal)) < 0.2 && f < Math.min(dist, RAY_CUTOFF) - 0.05) goalBlocked = true;
    const crowding = (1 - f / RAY_CUTOFF) ** 2;
    const cost = Math.abs(wrap(a - toGoal)) + 4 * crowding + 0.3 * Math.abs(wrap(a - previous));
    if (cost < bestCost) {
      bestCost = cost;
      best = a;
    }
  }
  // Head straight for the goal unless something sits between us and it (or it is behind us).
  const heading = goalBlocked || Math.abs(toGoal) > RAY_ANGLES[0] ? best : toGoal;

  const ahead = free(Math.floor(n / 2));
  const arrive = clamp(dist / 0.35, 0.25, 1);
  const caution = clamp((ahead - 0.1) / 0.35, 0.2, 1);
  const v = 0.42 * arrive * caution * Math.max(0, Math.cos(heading)) ** 2;
  const w = clamp(3 * heading, -3.2, 3.2);

  return {
    left: (v - w * HALF_TRACK) / WHEEL_RADIUS,
    right: (v + w * HALF_TRACK) / WHEEL_RADIUS,
    heading,
  };
}

/** Yaw from a MuJoCo quaternion (w, x, y, z). */
export const yawOf = (w: number, x: number, y: number, z: number) =>
  Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z));
