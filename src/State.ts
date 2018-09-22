import * as THREE from 'three';

import { BlockScene } from './BlockScene';
import { OverlayScene } from './OverlayScene';
import { PickScene, decodePixel } from './PickScene';
import { Model } from './Model';


export interface IPick {
  x: number;
  y: number;
  z: number;
  face: number;
}

export interface IState {
  // camera
  cameraRotX: number;
  cameraRotY: number;
  cameraDist: number;
  camera: any;
  // renderer
  renderer?: THREE.WebGLRenderer;
  // objects
  selection?: IPick[];
  selectionCube: any;
  model?: Model;
  lights?: THREE.Light[]
  // scenes
  overlay: OverlayScene;
  picks: PickScene;
  blocks: BlockScene;
  axis: THREE.AxesHelper;
}

export const state: IState = {
  cameraRotX: 10 * Math.PI / 180,
  cameraRotY: -15 * Math.PI / 180,
  cameraDist: 10,
  camera: undefined,
  renderer: undefined,
  selection: undefined,
  selectionCube: undefined,
  overlay: new OverlayScene(),
  picks: new PickScene(),
  blocks: new BlockScene(),
  axis: new THREE.AxesHelper(1000),
};
