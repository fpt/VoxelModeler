import * as THREE from 'three';


export class OverlayScene {
  private scene2 = new THREE.Scene();
  private camera2: THREE.OrthographicCamera | null = null;

  init(renderTarget: THREE.WebGLRenderTarget, width: number, height: number) {
      // scene2
      this.camera2 = new THREE.OrthographicCamera(-width / 2, width / 2, -height / 2, height / 2, 0.001, 10000);
      this.camera2.position.z = 100;
      //const map = new THREE.TextureLoader().load('/popu.png');
      const map = renderTarget.texture;
      map.flipY = false;
      const rttMaterial = new THREE.MeshBasicMaterial({ map, color: 0xFFFFC0, side: THREE.DoubleSide });
      rttMaterial.depthTest = false;
      //const sprite = new THREE.Sprite(rttMaterial);
      //sprite.position.set(offWidth / 2 - 60, offHeight / 2 - 60, 0);
      //sprite.scale.set(100, 100, 1);
      const spriteGeo = new THREE.PlaneGeometry( 100, -100 );
      const sprite = new THREE.Mesh( spriteGeo, rttMaterial );
      sprite.position.set(width / 2 - 60, height / 2 - 60, 0);
      this.scene2.add(sprite);
  }

  render(renderer: THREE.WebGLRenderer) {
    if (!this.camera2) {
      return;
    }
    renderer.render(this.scene2, this.camera2);
  }
}
