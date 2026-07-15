import * as THREE from "three";
import { EffectComposer, RenderPass, EffectPass } from "postprocessing";
import { TouchTexture } from "./TouchTexture";
import { WaterEffect } from "./WaterEffect";
import { RipplePlanes } from "./RipplePlanes";

/**
 * Container-scoped (not window-scoped) port of the original "water ripple gallery" demo:
 * a row of image planes that distort under the pointer via a postprocessing WaterEffect
 * driven by a TouchTexture trail. Owns its own renderer/canvas and lifecycle — call
 * `mount()` once assets are loaded, `dispose()` on unmount.
 */
export class RippleEngine {
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly raycaster = new THREE.Raycaster();
  containerWidth: number;
  containerHeight: number;

  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;
  private touchTexture: TouchTexture;
  private planes: RipplePlanes;
  private clock = new THREE.Clock();
  private disposed = false;
  private rafId: number | null = null;
  private resizeObserver: ResizeObserver;

  constructor(container: HTMLElement, images: string[]) {
    this.container = container;
    this.containerWidth = container.clientWidth;
    this.containerHeight = container.clientHeight;

    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    this.renderer.setSize(this.containerWidth, this.containerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.camera = new THREE.PerspectiveCamera(45, this.containerWidth / this.containerHeight, 0.1, 10000);
    this.camera.position.z = 50;

    this.composer = new EffectComposer(this.renderer);
    this.touchTexture = new TouchTexture();
    this.planes = new RipplePlanes(this, images);

    this.onPointerMove = this.onPointerMove.bind(this);
    this.tick = this.tick.bind(this);

    this.resizeObserver = new ResizeObserver(() => this.onResize());
  }

  async mount(): Promise<void> {
    await this.planes.load();

    this.planes.init();

    const renderPass = new RenderPass(this.scene, this.camera);
    const waterEffect = new WaterEffect({ texture: this.touchTexture.texture });
    const waterPass = new EffectPass(this.camera, waterEffect);
    waterPass.renderToScreen = true;
    renderPass.renderToScreen = false;
    this.composer.addPass(renderPass);
    this.composer.addPass(waterPass);

    this.container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.position = "absolute";
    this.renderer.domElement.style.inset = "0";

    this.container.addEventListener("pointermove", this.onPointerMove);
    this.resizeObserver.observe(this.container);

    this.tick();
  }

  private onPointerMove(ev: PointerEvent) {
    const rect = this.container.getBoundingClientRect();
    const x = (ev.clientX - rect.left) / rect.width;
    const y = 1 - (ev.clientY - rect.top) / rect.height;

    this.touchTexture.addTouch({ x, y });

    this.raycaster.setFromCamera(new THREE.Vector2(x * 2 - 1, y * 2 - 1), this.camera);
    this.planes.onPointerMove();
  }

  getViewSize() {
    const fovInRadians = (this.camera.fov * Math.PI) / 180;
    const height = Math.abs(this.camera.position.z * Math.tan(fovInRadians / 2) * 2);
    return { width: height * this.camera.aspect, height };
  }

  private update() {
    this.touchTexture.update();
    this.planes.update();
  }

  private render() {
    this.composer.render(this.clock.getDelta());
  }

  private tick() {
    if (this.disposed) return;
    this.render();
    this.update();
    this.rafId = requestAnimationFrame(this.tick);
  }

  private onResize() {
    this.containerWidth = this.container.clientWidth;
    this.containerHeight = this.container.clientHeight;
    if (this.containerWidth === 0 || this.containerHeight === 0) return;

    this.camera.aspect = this.containerWidth / this.containerHeight;
    this.camera.updateProjectionMatrix();
    this.composer.setSize(this.containerWidth, this.containerHeight);
    this.planes.onResize();
  }

  dispose() {
    this.disposed = true;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.resizeObserver.disconnect();
    this.container.removeEventListener("pointermove", this.onPointerMove);

    this.planes.dispose();
    this.touchTexture.dispose();
    this.composer.dispose();
    this.renderer.dispose();

    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
