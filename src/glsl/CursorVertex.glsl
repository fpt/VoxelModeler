varying vec3 vNormal;
varying vec4 vColor;
uniform int uIndex;

void main() { 
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  vNormal = normal;

  if (normal.x < -.1 && abs(normal.y) < .1 && abs(normal.z) < .1 && uIndex == 1) {
    vColor = vec4(1.0, 0, 0, 1.0);
  } else if (normal.x > .1 && abs(normal.y) < .1 && abs(normal.z) < .1 && uIndex == 2) {
    vColor = vec4(1.0, 0, 0, 1.0);
  } else if (abs(normal.x) < .1 && normal.y < -.1 && abs(normal.z) < .1 && uIndex == 3) {
    vColor = vec4(1.0, 0, 0, 1.0);
  } else if (abs(normal.x) < .1 && normal.y > .1 && abs(normal.z) < .1 && uIndex == 4) {
    vColor = vec4(1.0, 0, 0, 1.0);
  } else if (abs(normal.x) < .1 && abs(normal.y) < .1 && normal.z < -.1 && uIndex == 5) {
    vColor = vec4(1.0, 0, 0, 1.0);
  } else if (abs(normal.x) < .1 && abs(normal.y) < .1 && normal.z > .1 && uIndex == 6) {
    vColor = vec4(1.0, 0, 0, 1.0);
  } else {
    vColor = vec4(0, 0, 0, 0);
  }
}