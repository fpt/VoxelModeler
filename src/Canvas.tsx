import * as THREE from 'three';
import * as React from "react";
import { withStateHandlers, StateHandlerMap, compose, lifecycle } from "recompose";
import styled from 'styled-components'

import { IPick, IState, state } from './State';
import { Logger } from './Utils';
import { Model } from './Model';
import { createSelectionCube } from './Cube';
import { addCube, removeCube, extend, setCameraPosition } from './Actions';


const CAMERA_NEAREST = 2;
const RADIAN = Math.PI / 180;

const render = () => {
  const { renderer, camera } = state;
  if (!renderer || !camera) {
    return;
  }

  renderer.setClearColor(0x444444, 1.0);

  if (state.lights) {
    state.lights[0].visible = true;
    state.lights[1].visible = true;
    state.lights[2].visible = true;
  }

  state.selectionCube.visible = !!state.selection;
  if (state.selection) {
    state.selectionCube.material.uniforms.uIndex.value = state.selection[0].face;
  }

  //picks.render(renderer, camera);
  state.blocks.render(renderer, camera);

  //if (!renderTarget) {
    state.overlay.render(renderer);
  //}
};

const renderToTexture = () => {
  const { renderer, camera } = state;
  if (!renderer || !camera) {
    return;
  }

  renderer.setClearColor(0x444444, 1.0);

  state.picks.renderToTexture(renderer, camera);

  //if (!renderTarget) {
    state.overlay.render(renderer);
  //}
};

const initCanvas = (canvas: HTMLCanvasElement) => {
  const { renderer } = state;
  if (!renderer) {
    return;
  }

  const offWidth = canvas.clientWidth, offHeight = canvas.clientHeight;
  const pixelRatio = window.devicePixelRatio;
  renderer.setPixelRatio( pixelRatio );
  renderer.setSize(offWidth, offHeight, false);
  console.log(`init ${offWidth} / ${offHeight}`);

  renderToTexture();

  render();
};


// main

export const initState = (state: IState, canvas: HTMLCanvasElement) => {
  if (!canvas) {
    console.error("No canvas found!");
    return;
  }

  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.autoClear = false;

  const model = new Model();

  const offWidth = canvas.clientWidth, offHeight = canvas.clientHeight;
  const aspect = offWidth / offHeight;
  const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);

  state.renderer = renderer;
  state.model = model;
  state.camera = camera;

  setCameraPosition(state);

  // scene
  state.picks.init(offWidth, offHeight);
  state.blocks.init(offWidth, offHeight);

  // lights
  state.lights = [
    new THREE.PointLight(0xffffe0, 1),
    new THREE.PointLight(0xffe0ff, 1),
    new THREE.PointLight(0xe0ffff, 1),
  ];

  state.lights[0].position.set(0, 200, 0);
  state.lights[1].position.set(100, 200, 100);
  state.lights[2].position.set(-100, -200, -100);

  state.blocks.scene.add(state.lights[0]);
  state.blocks.scene.add(state.lights[1]);
  state.blocks.scene.add(state.lights[2]);
  state.blocks.scene.add(state.axis);
  addCube(state, 0, 0, 0, 0xD0D0D0);

  state.selectionCube = createSelectionCube();
  state.selectionCube.position.set(0, 0, 0);
  state.blocks.scene.add(state.selectionCube);

  const tex = state.picks.getTargetTexture();
  if (!tex) {
    return;
  }
  state.overlay.init(tex, offWidth, offHeight);
};

interface OuterProps {
  className?: string;
  colorCode: number;
}

interface CanvasState {
  canvasRef: React.RefObject<any>;
  isMouseDown: boolean;
  prevX?: number;
  prevY?: number;
}

interface CanvasHandlers extends StateHandlerMap<CanvasState> {
  onMouseMove: (event: React.MouseEvent<any>) => CanvasState,
  onMouseWheel: (event: React.WheelEvent<any>) => CanvasState,
  onMouseDown: (event: React.MouseEvent<any>) => CanvasState,
  onMouseUp: (event: React.MouseEvent<any>) => CanvasState,
  onKeyDown: (event: React.KeyboardEvent<any>) => CanvasState,
  onResize: () => CanvasState,
}

const VoxmoCanvasBase: React.StatelessComponent<OuterProps & CanvasState & CanvasHandlers> =
  ({ className, canvasRef, onMouseMove, onMouseWheel, onMouseDown, onMouseUp }) => (
    <canvas
      className={className}
      ref={canvasRef}
      onMouseMove={onMouseMove}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onWheel={onMouseWheel}
    />
  );

const mouseMove = (s: CanvasState, canvas: HTMLCanvasElement, clientX: number, clientY: number) => {
  if (s.isMouseDown) {
    if (!(s.prevX && s.prevY)) {
      return; // can't happen
    }
    const deltaX = s.prevX - clientX;
    const deltaY = s.prevY - clientY;
    s.prevX = clientX;
    s.prevY = clientY;

    state.cameraRotX += deltaX * RADIAN / 4;
    state.cameraRotY += deltaY * RADIAN / 4;

    setCameraPosition(state);
  } else {
    const { renderer } = state;
    if (!renderer || !canvas ) {
      return;
    }

    const p = state.picks.readRenderedPixel(clientX, clientY, renderer, canvas);
    if (p) {
      state.selection = [p];
      state.selectionCube.position.set(p.x, p.y, p.z);
    } else {
      state.selection = undefined;
    }
  }
};

const enhanceWithVoxmo = compose<{}, OuterProps>(
  withStateHandlers<CanvasState, CanvasHandlers>(
    { canvasRef: React.createRef(), isMouseDown: false },
    {
      onMouseMove: (s: CanvasState) => (event: React.MouseEvent<any>) => {
        const canvas = s.canvasRef.current;
        mouseMove(s, canvas, event.clientX, event.clientY);
        render();
        return ({ ...s });
      },
      onMouseWheel: (s: CanvasState) => (event: React.WheelEvent<any>) => {
        state.cameraDist += event.deltaY;
        if (state.cameraDist < CAMERA_NEAREST) {
          state.cameraDist = CAMERA_NEAREST;
        }

        setCameraPosition(state);
        render();
        return ({ ...s });
      },
      onMouseDown: (s: CanvasState, props: OuterProps) => (event: React.MouseEvent<any>) => {
        const { selection } = state;
        if (!selection) {
          return ({ ...s, isMouseDown: true, prevX: event.clientX, prevY: event.clientY });
        }

        extend(state, selection[0], props.colorCode);

        renderToTexture();
        render();
        return ({ ...s, isMouseDown: false });
      },
      onMouseUp: (s: CanvasState) => (event: React.MouseEvent<any>) => {
        const { renderer } = state;
        if (!renderer) {
          return;
        }

        // Update texture for furthur mouse move
        renderToTexture();
        render();

        return ({ ...s, isMouseDown: false });
      },
      onKeyDown: (s: CanvasState, props: OuterProps) => (event: React.KeyboardEvent<any>) => {
        console.log(event);
        if (event.key === 'x') {
          const { selection } = state;
          if (!selection) {
            return;
          }
          removeCube(state, selection[0].x, selection[0].y, selection[0].z);
        } else if (event.key === 'e') {
          const { selection } = state;
          if (!selection) {
            return ({ ...s });
          }
          extend(state, selection[0], props.colorCode);
        }
        renderToTexture();
        render();
        return ({ ...s });
      },
      onResize: (s: CanvasState) => () => {
        const canvas = s.canvasRef.current;
        const { renderer, camera, picks, overlay } = state;
        if (!renderer || !canvas) {
          return;
        }

        const offWidth = canvas.clientWidth, offHeight = canvas.clientHeight;
        renderer.setSize(offWidth, offHeight, false);

        const aspect = offWidth / offHeight;
        camera.aspect = aspect;
        camera.updateProjectionMatrix();

        picks.resize(offWidth, offHeight);
        overlay.resize(offWidth, offHeight);

        renderToTexture();
        render();

        return ({ ...s });
      },
    }),
  lifecycle<CanvasState & CanvasHandlers, {}>({
    componentDidMount() {
      const { canvasRef, onKeyDown, onResize } = this.props;
      if (canvasRef && canvasRef.current) {
        initState(state, canvasRef.current);

        initCanvas(canvasRef.current);
      }

      (window as any).addEventListener('keydown', onKeyDown);
      (window as any).addEventListener('resize', onResize, false);
    },
    componentWillUnmount() {
      const { onKeyDown, onResize } = this.props;

      (window as any).removeEventListener('keydown', onKeyDown);
      (window as any).removeEventListener('resize', onResize);
    },
  }),
);

export const VoxmoCanvas = styled(enhanceWithVoxmo(VoxmoCanvasBase))`
  width: 100%;
  height: 100%;
`;
