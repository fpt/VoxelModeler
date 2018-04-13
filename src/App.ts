import * as THREE from 'three';

import { Logger } from './Utils';
import { createCube } from './Cube';
import { Model } from './Model';
import { OverlayScene } from './OverlayScene';
import { PickScene } from './PickScene';
import { decodePixel } from './PickScene';


const overlay = new OverlayScene();
const picks = new PickScene();
const axis = new THREE.AxesHelper(1000);
const light = new THREE.PointLight(0xb4e7f2, 1.5);

const offWidth = window.innerWidth, offHeight = window.innerHeight - 200;
const CAMERA_NEAREST = 2;
const RADIAN = Math.PI / 180;

interface IPick {
  x: number;
  y: number;
  z: number;
  face: number;
}

interface IState {
  cameraRotX: number;
  cameraRotY: number;
  cameraDist: number;
  renderer?: THREE.WebGLRenderer;
  canvas?: HTMLCanvasElement;
  camera: any;
  selection?: IPick;
  selectionCube: any;
  model?: Model;
}

const state: IState = {
  cameraRotX: 10 * Math.PI / 180,
  cameraRotY: -15 * Math.PI / 180,
  cameraDist: 10,
  camera: undefined,
  renderer: undefined,
  canvas: undefined,
  selection: undefined,
  selectionCube: undefined,
};

const render = () => {
  const { renderer, camera } = state;
  if (!renderer || !camera) {
    return;
  }

  renderer.setClearColor(0x444444, 1.0);

  light.visible = true;
  axis.visible = true;

  state.selectionCube.visible = !!state.selection;
  if (state.selection) {
    state.selectionCube.material.uniforms.uIndex.value = state.selection.face;
  }

  picks.render(renderer, camera);

  //if (!renderTarget) {
    overlay.render(renderer);
  //}
};

const renderToTexture = () => {
  const { renderer, camera } = state;
  if (!renderer || !camera) {
    return;
  }

  renderer.setClearColor(0x444444, 1.0);

  light.visible = false;
  axis.visible = false;
  state.selectionCube.visible = false;

  picks.renderToTexture(renderer, camera);

  //if (!renderTarget) {
    overlay.render(renderer);
  //}
};

const init = () => {
  const { renderer } = state;
  if (!renderer) {
    return;
  }

  renderer.setSize(offWidth, offHeight);

  renderToTexture();

  render();
};

let isMouseDown: boolean = false;
let prevX: number | undefined = undefined;
let prevY: number | undefined = undefined;

const setCameraPosition = (state: any) => {
  const camera = state.camera;
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

// event handlers

const keyDown = (event: KeyboardEvent) => {
  if (event.keyCode === 68) { // d
    const { selection } = state;
    if (!selection) {
      return;
    }
    removeCube(selection.x, selection.y, selection.z);
    state.selection = undefined;
    render();
  }
};

const mouseWheel = (event: MouseWheelEvent) => {
  state.cameraDist -= event.wheelDelta / 2;
  if (state.cameraDist < CAMERA_NEAREST) {
    state.cameraDist = CAMERA_NEAREST;
  }

  setCameraPosition(state);
  render();
};

const mouseMove = (event: MouseEvent) => {
  if (isMouseDown) {
    if (!(prevX && prevY)) {
      return; // can't happen
    }
    const deltaX = prevX - event.clientX;
    const deltaY = prevY - event.clientY;
    prevX = event.clientX;
    prevY = event.clientY;

    state.cameraRotX += deltaX * RADIAN / 4;
    state.cameraRotY += deltaY * RADIAN / 4;

    setCameraPosition(state);
  } else {
    const { renderer, canvas } = state;
    if (!renderer || !canvas ) {
      return;
    }

    const p = picks.readRenderedPixel(event, renderer, canvas);
    state.selection = p;
    if (p) {
      state.selectionCube.position.set(p.x, p.y, p.z);
    }
  }

  render();
};

const mouseDown = (event: MouseEvent) => {
  isMouseDown = true;
  prevX = event.clientX;
  prevY = event.clientY;

  const { selection, renderer, canvas } = state;
  if (!selection || !renderer || !canvas) {
    return;
  }

  extend(selection);

  render();
};

const mouseUp = (event: MouseEvent) => {
  isMouseDown = false;

  const { renderer } = state;
  if (!renderer) {
    return;
  }

  // Update texture for furthur mouse move
  renderToTexture();

  render();
}

// operation

const extend = ({ x, y, z, face }: IPick) => {
  switch (face) {
  case 1:
    addCube(x - 1, y, z);
    break;
  case 2:
    addCube(x + 1, y, z);
    break;
  case 3:
    addCube(x, y - 1, z);
    break;
  case 4:
    addCube(x, y + 1, z);
    break;
  case 5:
    addCube(x, y, z - 1);
    break;
  case 6:
    addCube(x, y, z + 1);
    break;
  }
};

const MAX_CUBE_DIST = 8;

const addCube = (x: number, y: number, z: number) => {
  if (!state.model) {
    return;
  }

  if (Math.abs(x) > MAX_CUBE_DIST || Math.abs(y) > MAX_CUBE_DIST || Math.abs(z) > MAX_CUBE_DIST) {
    Logger.log('Out of region!');
    return;
  }

  const m = state.model.add(x, y, z, null);

  const cube = createCube(x, y, z);
  picks.addCube(cube);

  m.obj = cube;
};

const removeCube = (x: number, y: number, z: number) => {
  if (!state.model) {
    return;
  }

  const m = state.model.remove(x, y, z);
  if (!m) {
    return;
  }

  picks.scene.remove(m.obj);
  state.selection = undefined;
  render();
};

// main

document.addEventListener("DOMContentLoaded", function() {
  const canvas = document.querySelector('#renderCanvas') as HTMLCanvasElement | undefined;
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.autoClear = false;
  if (!canvas) {
    console.error("No canvas found!");
  }

  (canvas as any).addEventListener('mousemove', mouseMove);
  (canvas as any).addEventListener('mousewheel', mouseWheel);
  (canvas as any).addEventListener('mousedown', mouseDown);
  (canvas as any).addEventListener('mouseup', mouseUp);
  (window as any).addEventListener('keydown', keyDown);

  const model = new Model();

  const aspect = offWidth / offHeight;
  const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);

  state.canvas = canvas;
  state.renderer = renderer;
  state.model = model;
  state.camera = camera;

  setCameraPosition(state);

  // scene
  picks.init(offWidth, offHeight);
  light.position.set(100,100,100);
  picks.scene.add(light);
  picks.scene.add(axis);
  addCube(0, 0, 0);

  const geometry = new THREE.BoxGeometry(1.1, 1.1, 1.1);
  const material = new THREE.ShaderMaterial({
    vertexShader: (document.querySelector('#vsPick') as any).textContent,
    fragmentShader: (document.querySelector('#fsPick') as any).textContent,
    uniforms: {
      uIndex: { type: 'i', value: 1 }
    },
  });
  state.selectionCube = new THREE.Mesh( geometry, material );
  state.selectionCube.position.set(0, 0, 0);
  picks.scene.add(state.selectionCube);

  const tgt = picks.getTarget();
  if (!tgt) {
    return;
  }
  overlay.init(tgt, offWidth, offHeight);

  init();
});
