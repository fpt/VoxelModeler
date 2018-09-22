import * as THREE from 'three';


const calcNormal = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) => {
  const ab = b.clone().sub(a);
  const ac = c.clone().sub(a);
  const cross = new THREE.Vector3();
  cross.crossVectors(ab, ac);
  return cross.normalize();
};

var DEFAULT_VERT = [
  [-.5, -.5, -.5], // 0
  [ .5, -.5, -.5], // 1
  [ .5,  .5, -.5], // 2
  [-.5,  .5, -.5], // 3
  [-.5, -.5,  .5], // 4
  [ .5, -.5,  .5], // 5
  [ .5,  .5,  .5], // 6
  [-.5,  .5,  .5] // 7
];

var DEFAULT_INDICES = [
  [0, 2, 1], [0, 3, 2], // front
  [1, 2, 6], [6, 5, 1], // right
  [4, 5, 6], [6, 7, 4], // up
  [2, 3, 6], [6, 3, 7], // left
  [0, 7, 3], [0, 4, 7], // down
  [0, 1, 5], [0, 5, 4], // back
];

const createCubeGeometry = () => {
  const geom = new THREE.Geometry(); 

  const vecs = DEFAULT_VERT.map(v => new THREE.Vector3(...v));
  vecs.map(v =>
    geom.vertices.push(v)
  );
  DEFAULT_INDICES.map((tri) => {
    const face = new THREE.Face3(tri[0], tri[1], tri[2]);
    face.normal = calcNormal(vecs[tri[0]], vecs[tri[1]], vecs[tri[2]]);
    geom.faces.push(face)
  });

  return geom;
};

export const createCube = (x: number, y: number, z: number) => {

  const geom = createCubeGeometry();
  const material = new THREE.ShaderMaterial({
    vertexShader: require("./glsl/PickVertex.glsl"),
    fragmentShader: require("./glsl/PickFragment.glsl"),
    uniforms: {
      uIndex: { type: '3iv', value: [x, y, z] }
    },
  });

  const mesh = new THREE.Mesh(geom, material);
  mesh.position.set(x, y, z);

  return mesh;
}

export const normalFromFace = (f: number) => {
  switch (f) {
  case 1:
    return [-1, 0, 0];
  case 2:
    return [1, 0, 0];
  case 3:
    return [0, -1, 0];
  case 4:
    return [0, 1, 0];
  case 5:
    return [0, 0, -1];
  case 6:
    return [0, 0, 1];
  }
  return undefined;
};

const divColor = (color: number, div: number) =>
  ((color >> 16) / div << 16) | ((color >> 8 & 0xFF) / div << 8) | ((color & 0xFF) / div)

const addColor = (col1: number, col2: number) =>
  (((col1 >> 16) + (col2 >> 16) & 0xFF) << 16) |
  (((col1 >> 8) + (col2 >> 8) & 0xFF) << 8) |
  ((col1 + col2) & 0xFF)

export const createColorCube = (x: number, y: number, z: number, color: number) => {
  const geometry = new THREE.BoxGeometry( 1, 1, 1 );
  const material = new THREE.MeshPhongMaterial({
    color,
    shininess: 100,
    emissive: divColor(color, 4),
    specular: addColor(color, 0x101010),
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh( geometry, material );
  mesh.position.set(x, y, z);
  return mesh;  
};

export const createSelectionCube = () => {
  const geometry = new THREE.BoxGeometry(1.1, 1.1, 1.1);
  const material = new THREE.ShaderMaterial({
    vertexShader: require("./glsl/CursorVertex.glsl"),
    fragmentShader: require("./glsl/CursorFragment.glsl"),
    uniforms: {
      uIndex: { type: 'i', value: 1 }
    },
  });
  return new THREE.Mesh(geometry, material);
}