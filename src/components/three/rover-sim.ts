/**
 * The rover arena without any rendering: MuJoCo physics, ray sensing and the
 * behavior loop (wander, go to a clicked goal, recover when stuck).
 * Runs the same in the browser and in Node tests.
 */
import type { MainModule, MjData, MjModel, IntBuffer } from '@mujoco/mujoco';
import { drive, yawOf, RAY_ANGLES, RAY_CUTOFF } from './controller.ts';

/** Lidar position in the rover frame. */
const LIDAR = { x: 0.06, z: 0.105 };

/** Walls and pillars are group 0 and block rays; crates and balls are group 1 and get pushed around. */
const RAY_GROUPS = [1, 0, 0, 0, 0, 0];
const ARENA = { x: 1.8, y: 1.3 };

export interface Ray {
  from: [number, number, number];
  to: [number, number, number];
  hit: boolean;
}

export class RoverSim {
  readonly model: MjModel;
  readonly data: MjData;
  rays: Ray[] = [];
  mode: 'wander' | 'goal' | 'escape' = 'wander';

  /** Body id of the rover. */
  readonly rover: number;
  private goalBody: number;
  private geomId: IntBuffer;
  private ranges = new Float64Array(RAY_ANGLES.length);
  private goal = { x: 1.2, y: 0.2 };
  private pauseUntil = 0;
  private stuckFor = 0;
  private escapeUntil = 0;
  private escapeTurn = 1;
  private seed = 7;
  private previousMode: 'wander' | 'goal' = 'wander';
  private heading = 0;
  /** Escapes since the current goal was set; too many and the rover gives up on it. */
  private escapes = 0;

  private mj: MainModule;

  constructor(mj: MainModule, xml: string) {
    this.mj = mj;
    this.model = mj.MjModel.from_xml_string(xml);
    this.data = new mj.MjData(this.model);
    const id = (type: number, name: string) => mj.mj_name2id(this.model, type, name);
    this.rover = id(mj.mjtObj.mjOBJ_BODY.value, 'rover');
    this.goalBody = id(mj.mjtObj.mjOBJ_BODY.value, 'goal');
    this.geomId = new mj.IntBuffer(1);
    mj.mj_forward(this.model, this.data);
    this.setGoal(this.goal.x, this.goal.y, 'wander');
  }

  get time() {
    return this.data.time;
  }

  get pose() {
    const q = this.data.xquat;
    const b = this.rover * 4;
    return {
      x: this.data.xpos[this.rover * 3],
      y: this.data.xpos[this.rover * 3 + 1],
      yaw: yawOf(q[b], q[b + 1], q[b + 2], q[b + 3]),
    };
  }

  /** Send the rover somewhere; clamped to the arena. */
  setGoal(x: number, y: number, mode: 'wander' | 'goal' = 'goal') {
    this.goal = { x: Math.max(-ARENA.x, Math.min(ARENA.x, x)), y: Math.max(-ARENA.y, Math.min(ARENA.y, y)) };
    const m = this.goalBody > -1 ? this.model.body_mocapid[this.goalBody] : -1;
    if (m > -1) {
      this.data.mocap_pos[m * 3] = this.goal.x;
      this.data.mocap_pos[m * 3 + 1] = this.goal.y;
    }
    this.mode = mode;
    this.pauseUntil = 0;
    this.stuckFor = 0;
    this.escapes = 0;
  }

  /** Back to the initial state. */
  reset() {
    this.mj.mj_resetData(this.model, this.data);
    this.mj.mj_forward(this.model, this.data);
    this.seed = 7;
    this.heading = 0;
    this.setGoal(1.2, 0.2, 'wander');
  }

  /** Push a free body (e.g. a clicked crate) with a short horizontal kick. */
  kick(body: number, dir: [number, number], strength = 0.6) {
    const dofadr = this.model.body_dofadr[body];
    if (dofadr < 0) return;
    this.data.qvel[dofadr] += dir[0] * strength * 2;
    this.data.qvel[dofadr + 1] += dir[1] * strength * 2;
    this.data.qvel[dofadr + 2] += strength;
  }

  /** Advance the simulation by `dt` seconds of sim time. */
  step(dt: number) {
    const ts = this.model.opt.timestep;
    const n = Math.max(1, Math.round(dt / ts));
    for (let i = 0; i < n; i++) {
      // The controller runs at 50 Hz, physics at 250 Hz.
      if (i % 5 === 0) this.control(ts * 5);
      this.mj.mj_step(this.model, this.data);
    }
  }

  private random() {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  private wanderSomewhere() {
    this.setGoal((this.random() * 2 - 1) * ARENA.x, (this.random() * 2 - 1) * ARENA.y, 'wander');
  }

  private sense() {
    const { x, y, yaw } = this.pose;
    const from: [number, number, number] = [x + LIDAR.x * Math.cos(yaw), y + LIDAR.x * Math.sin(yaw), LIDAR.z];
    this.rays = RAY_ANGLES.map((a, i) => {
      const dir = [Math.cos(yaw + a), Math.sin(yaw + a), 0];
      const d = this.mj.mj_ray(this.model, this.data, from, dir, RAY_GROUPS, true, this.rover, this.geomId, null);
      const hit = d >= 0 && d < RAY_CUTOFF;
      this.ranges[i] = hit ? d : RAY_CUTOFF;
      const len = this.ranges[i];
      return { from, to: [from[0] + dir[0] * len, from[1] + dir[1] * len, from[2]], hit };
    });
  }

  private control(dt: number) {
    this.sense();
    const pose = this.pose;
    const t = this.data.time;
    const ctrl = this.data.ctrl;

    if (this.mode === 'escape') {
      if (t < this.escapeUntil) {
        ctrl[0] = -5 - 4 * this.escapeTurn;
        ctrl[1] = -5 + 4 * this.escapeTurn;
        return;
      }
      this.mode = this.previousMode;
    }

    const dist = Math.hypot(this.goal.x - pose.x, this.goal.y - pose.y);
    if (dist < 0.12) {
      ctrl[0] = ctrl[1] = 0;
      if (!this.pauseUntil) this.pauseUntil = t + (this.mode === 'goal' ? 3 : 1);
      if (t > this.pauseUntil) {
        this.wanderSomewhere();
      }
      return;
    }

    const cmd = drive(pose, this.goal, this.ranges, this.heading);
    this.heading = cmd.heading;
    ctrl[0] = cmd.left;
    ctrl[1] = cmd.right;

    // Stuck: asking to move forward but barely moving.
    const b = this.rover * 6;
    const speed = Math.hypot(this.data.cvel[b + 3], this.data.cvel[b + 4]);
    const wantsToMove = cmd.left + cmd.right > 3;
    this.stuckFor = wantsToMove && speed < 0.04 ? this.stuckFor + dt : 0;
    if (this.stuckFor > 1) {
      const escapes = this.escapes + 1;
      if (escapes > 3) this.wanderSomewhere();
      else this.escapes = escapes;
      this.previousMode = this.mode === 'goal' ? 'goal' : 'wander';
      this.mode = 'escape';
      this.escapeUntil = t + 0.9;
      this.escapeTurn = cmd.heading >= 0 ? -1 : 1;
      this.stuckFor = 0;
    }
  }

  dispose() {
    this.geomId.delete();
    this.data.delete();
    this.model.delete();
  }
}
