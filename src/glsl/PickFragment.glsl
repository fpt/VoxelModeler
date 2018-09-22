varying vec3 vNormal;
uniform ivec3 uIndex;

void main() {
  int fac = 0;
  if (vNormal.x < -.1 && abs(vNormal.y) < .1 && abs(vNormal.z) < .1) {
    fac = 1;
  } else if (vNormal.x > .1 && abs(vNormal.y) < .1 && abs(vNormal.z) < .1) {
    fac = 2;
  } else if (abs(vNormal.x) < .1 && vNormal.y < -.1 && abs(vNormal.z) < .1) {
    fac = 3;
  } else if (abs(vNormal.x) < .1 && vNormal.y > .1 && abs(vNormal.z) < .1) {
    fac = 4;
  } else if (abs(vNormal.x) < .1 && abs(vNormal.y) < .1 && vNormal.z < -.1) {
    fac = 5;
  } else if (abs(vNormal.x) < .1 && abs(vNormal.y) < .1 && vNormal.z > .1) {
    fac = 6;
  }

  gl_FragColor = vec4(
    float(uIndex.x + 128) / 255.0,
    float(uIndex.y + 128) / 255.0,
    float(uIndex.z + 128) / 255.0,
    (255.0 - float(fac)) / 255.0
  );
}
