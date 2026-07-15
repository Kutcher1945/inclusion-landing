import * as THREE from "three";
import { Effect } from "postprocessing";

const fragment = `
uniform sampler2D uTexture;

void mainUv(inout vec2 uv) {
  vec4 tex = texture2D(uTexture, uv);
  float vx = -(tex.r * 2. - 1.);
  float vy = -(tex.g * 2. - 1.);
  float intensity = tex.b;
  uv.x += vx * 0.2 * intensity;
  uv.y += vy * 0.2 * intensity;
}
`;

/** Postprocessing pass that displaces the rendered scene's UVs using TouchTexture's pointer-velocity map. */
export class WaterEffect extends Effect {
  constructor(options: { texture: THREE.Texture }) {
    super("WaterEffect", fragment, {
      uniforms: new Map([["uTexture", new THREE.Uniform(options.texture)]]),
    });
  }
}
