import * as THREE from 'three';

import { IPick, IState, state } from './State';
import { Logger } from './Utils';
import { createCube, createColorCube } from './Cube';


const MAX_CUBE_DIST = 100;

export const addCube = (state: IState, x: number, y: number, z: number, color: number) => {
  if (!state.model) {
    return;
  }

  if (Math.abs(x) > MAX_CUBE_DIST || Math.abs(y) > MAX_CUBE_DIST || Math.abs(z) > MAX_CUBE_DIST) {
    Logger.log('Out of region!');
    return;
  }

  const m = state.model.add(x, y, z);

  const cube = createCube(x, y, z);
  state.picks.addCube(cube);

  const block = createColorCube(x, y, z, color);
  state.blocks.addCube(block);

  m.objs = [cube, block];
};

export const removeCube = (state: IState, x: number, y: number, z: number) => {
  if (!state.model) {
    return;
  }

  const m = state.model.remove(x, y, z);
  if (!m) {
    return;
  }

  if (m.objs) {
    state.picks.scene.remove(m.objs[0]);
    state.blocks.scene.remove(m.objs[1]);
  }

  state.selection = undefined;
};

// operation

export const extend = (state: IState, { x, y, z, face }: IPick, color: number) => {
  switch (face) {
  case 1:
    addCube(state, x - 1, y, z, color);
    break;
  case 2:
    addCube(state, x + 1, y, z, color);
    break;
  case 3:
    addCube(state, x, y - 1, z, color);
    break;
  case 4:
    addCube(state, x, y + 1, z, color);
    break;
  case 5:
    addCube(state, x, y, z - 1, color);
    break;
  case 6:
    addCube(state, x, y, z + 1, color);
    break;
  }
};

export const setCameraPosition = (state: IState) => {
  const { camera } = state;
  if (!camera) {
    return;
  }

  const rotX = state.cameraRotX;
  const rotY = state.cameraRotY;
  const dist = state.cameraDist;

  camera.position.set(0, 0, dist);

  camera.position.applyQuaternion(
    new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3( 1, 0, 0 ), // The positive x-axis
      rotY,
  ));
  camera.position.applyQuaternion(
    new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3( 0, 1, 0 ), // The positive y-axis
      rotX,
  ));
  camera.lookAt(new THREE.Vector3(0, 0, 0));
};
