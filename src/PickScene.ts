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

  getTargetTexture() {
    if (!this._target) {
      return;
    }
    return this._target.texture;
  }

  resize(width: number, height: number) {
    if (!this._target) {
      return;
    }
    const target = this._target;
    target.setSize(width, height)
  }

  readRenderedPixel(clientX: number, clientY: number, renderer: THREE.WebGLRenderer, canvas: HTMLCanvasElement) {
    const point = pixelInputToCanvasCoord(clientX, clientY, canvas);
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
  255.0 - v;

const decodeIndex = (v: number) =>
  Math.round(v - 128.0);

export const decodePixel = (r: number, g: number, b: number, a: number) => {
  //console.log(`${r},${g},${b},${a}`)
  if (a === 255) {
    return;
  }
  let face = decodeFace(a);
  face = Math.round(face)

  const n = normalFromFace(face);
  if (!n) {
    return;
  }

  const x = decodeIndex(r);
  const y = decodeIndex(g);
  const z = decodeIndex(b);
  // Logger.log([x, y, z, face]);

  return { x, y, z, face };
};
