import * as THREE from "three";

type TrailPoint = { x: number; y: number; age: number; force: number; vx: number; vy: number };

const easeOutSine = (t: number, b: number, c: number, d: number) => c * Math.sin((t / d) * (Math.PI / 2)) + b;

const easeOutQuad = (t: number, b: number, c: number, d: number) => {
  const nt = t / d;
  return -c * nt * (nt - 2) + b;
};

/** Renders a 2D canvas of moving "ink" blobs that encode pointer velocity/intensity into RGB — fed to WaterEffect as the distortion map. */
export class TouchTexture {
  readonly size = 64;
  readonly maxAge = 64;
  readonly radius = 0.1 * this.size;
  readonly speed = 1 / this.maxAge;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private trail: TrailPoint[] = [];
  private last: { x: number; y: number } | null = null;

  readonly texture: THREE.Texture;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.size;
    this.canvas.height = this.size;
    this.ctx = this.canvas.getContext("2d")!;
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.texture = new THREE.Texture(this.canvas);
  }

  update() {
    this.clear();
    const speed = this.speed;
    this.trail.forEach((point) => {
      const f = point.force * speed * (1 - point.age / this.maxAge);
      point.x += point.vx * f;
      point.y += point.vy * f;
      point.age++;
    });
    this.trail = this.trail.filter((point) => point.age <= this.maxAge);
    this.trail.forEach((point) => this.drawPoint(point));
    this.texture.needsUpdate = true;
  }

  private clear() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /** Autonomous raindrop — bypasses movement-based force calc, uses fixed downward velocity. */
  addDrop(point: { x: number; y: number }) {
    const angle = Math.PI + (Math.random() - 0.5) * 0.8; // mostly downward
    this.trail.push({
      x: point.x,
      y: point.y,
      age: 0,
      force: 0.55 + Math.random() * 0.45,
      vx: Math.cos(angle) * 0.4,
      vy: Math.sin(angle) * 0.4,
    });
  }

  addTouch(point: { x: number; y: number }) {
    let force = 0;
    let vx = 0;
    let vy = 0;
    const last = this.last;
    if (last) {
      const dx = point.x - last.x;
      const dy = point.y - last.y;
      if (dx === 0 && dy === 0) return;
      const dd = dx * dx + dy * dy;
      const d = Math.sqrt(dd);
      vx = dx / d;
      vy = dy / d;
      force = Math.min(dd * 10000, 1);
    }
    this.last = { x: point.x, y: point.y };
    this.trail.push({ x: point.x, y: point.y, age: 0, force, vx, vy });
  }

  private drawPoint(point: TrailPoint) {
    const ctx = this.ctx;
    const pos = { x: point.x * this.size, y: (1 - point.y) * this.size };

    let intensity: number;
    if (point.age < this.maxAge * 0.3) {
      intensity = easeOutSine(point.age / (this.maxAge * 0.3), 0, 1, 1);
    } else {
      intensity = easeOutQuad(1 - (point.age - this.maxAge * 0.3) / (this.maxAge * 0.7), 0, 1, 1);
    }
    intensity *= point.force;

    const color = `${((point.vx + 1) / 2) * 255}, ${((point.vy + 1) / 2) * 255}, ${intensity * 255}`;
    const offset = this.size * 5;

    ctx.shadowOffsetX = offset;
    ctx.shadowOffsetY = offset;
    ctx.shadowBlur = this.radius;
    ctx.shadowColor = `rgba(${color},${0.2 * intensity})`;

    ctx.beginPath();
    ctx.fillStyle = "rgba(255,0,0,1)";
    ctx.arc(pos.x - offset, pos.y - offset, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  dispose() {
    this.texture.dispose();
  }
}
