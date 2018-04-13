import * as THREE from 'three';

import { Logger, pixelInputToCanvasCoord } from './Utils';
import { normalFromFace } from './Cube';


export class PickScene {
  public scene = new THREE.Scene();
  private _target: THREE.WebGLRenderTarget | null = null; 

  render(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
    renderer.clear(true, true, true);
    renderer.render(this.scene, camera);
  }

  renderToTexture(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
    if (!this._target) {
      return;
    }

    renderer.clearTarget(this._target, true, true, true);
    renderer.render(this.scene, camera, this._target);
  }

  init(width: number, height: number) {
    this._target = new THREE.WebGLRenderTarget(width, height, {
        minFilter: THREE.NearestFilter,
    });
  }

  addCube(cube: any) {
    this.scene.add(cube);
  };

  getTarget() {
    return this._target;
  }

  readRenderedPixel(event: MouseEvent, renderer: THREE.WebGLRenderer, canvas: HTMLCanvasElement) {
    const point = pixelInputToCanvasCoord(event, canvas);
    if (!this._target || !point) {
      return;
    }

    const pixels = new Uint8Array(4);
    renderer.readRenderTargetPixels(this._target, point.x, point.y, 1, 1, pixels);
    // Logger.log(pixels);
    return decodePixel(pixels[0], pixels[1], pixels[2], pixels[3]);
  };
}

// decoders

const decodeFace = (v: number) => 
  (1.0 - (v / 255.0)) * 10.0;

const decodeIndex = (m: number, v: number) =>
  Math.round(((Math.abs(m) / 2.0 + 0.25) - v / 255.0) * 10.0);

export const decodePixel = (r: number, g: number, b: number, a: number) => {
  if (a === 255) {
    return;
  }
  let face = decodeFace(a);
  face = Math.round(face)

  const n = normalFromFace(face);
  if (!n) {
    return;
  }

  const x = decodeIndex(n[0], r);
  const y = decodeIndex(n[1], g);
  const z = decodeIndex(n[2], b);
  // Logger.log([x, y, z, face]);

  return { x, y, z, face };
};
