import * as THREE from "three";
import { lerp } from "./utils";
import type { RippleEngine } from "./RippleEngine";

const fragmentShader = `
uniform float uZoom;
uniform float uZoomDelta;
uniform vec2 uMouse;
uniform vec2 uPlaneSize;
uniform sampler2D uImage;
uniform vec2 uImageSize;
varying vec2 vUv;

vec2 withRatio(vec2 uv, vec2 canvasSize, vec2 textureSize){
  vec2 ratio = vec2(
    min((canvasSize.x / canvasSize.y) / (textureSize.x / textureSize.y), 1.0),
    min((canvasSize.y / canvasSize.x) / (textureSize.y / textureSize.x), 1.0)
  );
  return vec2(
    uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    uv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );
}
vec3 greyScale(vec3 color){
  return vec3(color.r + color.g + color.b) / 3.;
}

// Signed distance to a rounded box, centered at origin, in the same units as size/radius.
float roundedBoxSDF(vec2 p, vec2 size, float radius) {
  vec2 d = abs(p) - (size * 0.5 - radius);
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - radius;
}

void main() {
  vec2 uv = vUv;
  uv -= 0.5;
  uv *= 1. - uZoomDelta * uZoom;
  uv += uZoomDelta * (uMouse - 0.5) * 0.5 * uZoom;
  uv += 0.5;
  uv = withRatio(uv, uPlaneSize, uImageSize);
  vec3 tex = texture2D(uImage, uv).xyz;
  vec3 color = vec3(0.2 + uZoom * 0.5);
  color = mix(greyScale(tex) * 0.5, tex, uZoom);

  float radius = 0.07 * min(uPlaneSize.x, uPlaneSize.y);
  float dist = roundedBoxSDF((vUv - 0.5) * uPlaneSize, uPlaneSize, radius);
  float aa = fwidth(dist);
  float alpha = 1.0 - smoothstep(-aa, aa, dist);

  gl_FragColor = vec4(color, alpha);
}`;

const vertexShader = `
varying vec2 vUv;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
  vUv = uv;
}`;

type PlaneMetrics = { planeWidth: number; planeHeight: number; x: number; space: number };

/** Lays out `images.length` textured planes side by side; each zooms in and goes full color on hover, grey/dimmed otherwise. */
export class RipplePlanes {
  private engine: RippleEngine;
  private images: string[];
  private textures: (THREE.Texture | undefined)[] = [];
  meshes: THREE.Mesh[] = [];
  private hovering = -1;
  private uniforms = { uPlaneSize: new THREE.Uniform(new THREE.Vector2(0, 0)) };

  constructor(engine: RippleEngine, images: string[]) {
    this.engine = engine;
    this.images = images;
  }

  async load(): Promise<void> {
    const loader = new THREE.TextureLoader();
    this.textures = await Promise.all(
      this.images.map((src) => new Promise<THREE.Texture>((resolve) => loader.load(src, resolve))),
    );
  }

  init() {
    const { width, height } = this.engine.getViewSize();
    const metrics = this.getPlaneMetrics(width, height, this.engine.containerWidth);

    const geometry = new THREE.PlaneGeometry(metrics.planeWidth, metrics.planeHeight, 1, 1);
    this.uniforms.uPlaneSize.value.set(metrics.planeWidth, metrics.planeHeight);

    const translateToLeft = -width / 2 + metrics.planeWidth / 2;
    const x = translateToLeft + metrics.x;

    this.images.forEach((_, i) => {
      const texture = this.textures[i];
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uZoom: new THREE.Uniform(0),
          uZoomDelta: new THREE.Uniform(0.2),
          uPlaneSize: this.uniforms.uPlaneSize,
          uImage: new THREE.Uniform(texture ?? null),
          uImageSize: new THREE.Uniform(
            new THREE.Vector2(
              (texture?.image as HTMLImageElement | undefined)?.width ?? 0,
              (texture?.image as HTMLImageElement | undefined)?.height ?? 0,
            ),
          ),
          uMouse: new THREE.Uniform(new THREE.Vector2(0, 0)),
        },
        fragmentShader,
        vertexShader,
        transparent: true,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = x + i * metrics.space;
      mesh.userData.index = i;
      this.meshes.push(mesh);
      this.engine.scene.add(mesh);
    });
  }

  onPointerMove() {
    const intersections = this.engine.raycaster.intersectObjects(this.meshes);
    if (intersections.length > 0) {
      const intersection = intersections[0];
      const index = (intersection.object.userData as { index: number }).index;
      const material = (this.meshes[index] as THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>).material;
      material.uniforms.uMouse.value.set(intersection.uv!.x, intersection.uv!.y);
      this.hovering = index;
    } else {
      this.hovering = -1;
    }
  }

  update() {
    this.meshes.forEach((mesh, i) => {
      const material = (mesh as THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>).material;
      const zoomTarget = this.hovering === i ? 1 : 0;
      const uZoom = material.uniforms.uZoom;
      const zoomChange = lerp(uZoom.value, zoomTarget, 0.1, 0.00001);
      if (zoomChange !== 0) uZoom.value += zoomChange;
    });
  }

  private getPlaneMetrics(viewWidth: number, viewHeight: number, containerWidth: number): PlaneMetrics {
    const count = this.images.length;
    if (containerWidth < 640) {
      const planeWidth = viewWidth / (count + 0.5);
      return { planeWidth, planeHeight: viewHeight * 0.92, x: 0, space: viewWidth / count };
    }
    const planeWidth = viewWidth / (count * 1.5);
    const margin = viewWidth / 5 / 1.5;
    return {
      planeWidth,
      planeHeight: viewHeight * 0.92,
      x: margin,
      space: (viewWidth - margin * 2 - planeWidth) / (count - 1 || 1),
    };
  }

  onResize() {
    const { width, height } = this.engine.getViewSize();
    const metrics = this.getPlaneMetrics(width, height, this.engine.containerWidth);
    const geometry = new THREE.PlaneGeometry(metrics.planeWidth, metrics.planeHeight, 1, 1);

    this.uniforms.uPlaneSize.value.set(metrics.planeWidth, metrics.planeHeight);

    const translateToLeft = -width / 2 + metrics.planeWidth / 2;
    const x = translateToLeft + metrics.x;

    this.meshes.forEach((mesh, i) => {
      mesh.geometry.dispose();
      mesh.geometry = geometry;
      mesh.position.x = x + i * metrics.space;
    });
  }

  dispose() {
    this.meshes.forEach((mesh) => {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    this.textures.forEach((texture) => texture?.dispose());
  }
}
