import * as THREE from 'three';

import { Logger } from './Utils';


export class BlockScene {
  public scene = new THREE.Scene();
  private _target: THREE.WebGLRenderTarget | null = null; 

  render(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
    renderer.clear(true, true, true);
    renderer.render(this.scene, camera);
  }

  init(width: number, height: number) {
    this._target = new THREE.WebGLRenderTarget(width, height, {
        minFilter: THREE.NearestFilter,
    });
  }

  addCube(cube: any) {
    this.scene.add(cube);
  };
}
