const THREE = require('three')
const OrbitControls = require('three-orbit-controls')(THREE)

const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
const renderer = new THREE.WebGLRenderer({
  antialias: true
})
renderer.setSize(WIDTH, HEIGHT)
document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, WIDTH/HEIGHT, 1, 10000)
camera.position.z = 14;

const vertexShader = `
  varying vec2 vUv;

  void main() {
    gl_Position = vec4(position, 1.0);
    vUv = uv;
  }
`

const fragmentShader = `
  varying vec2 vUv;

  uniform sampler2D imgTexture;
  uniform sampler2D displacmentMap;
  uniform sampler2D perlinX;
  uniform sampler2D perlinY;
  uniform vec2 perlinParam;

  uniform float width;
  uniform float height;  

  void main() {
    float galssDepth = 0.16;
    float glassScale = 16.0;

    vec2 uv = gl_FragCoord.xy / vec2(width, height);
    vec2 dn = texture2D(perlinX, uv + perlinParam).xy * texture2D(perlinY, uv + perlinParam).xy;
      

    vec4 distP = texture2D(displacmentMap, vUv * glassScale);
    vec2 d = (vec2(distP.r, distP.g) * 2.0 - 1.0) * -galssDepth;

    uv.y = uv.y + perlinParam.y * 0.64;
    uv = uv + dn * 0.064;


    vec4 distColor = texture2D(imgTexture, uv + d);
    gl_FragColor = distColor;
  }
`

const material = new THREE.ShaderMaterial({
  uniforms: {
    imgTexture: {
      type: 't', value: new THREE.TextureLoader().load('img/sample1.jpg' )
    },
    displacmentMap: {
      type: 't', value: new THREE.TextureLoader().load('img/normal1.jpg' )
    },
    perlinX: {
      type: 't', value: new THREE.TextureLoader().load('img/perlin1.jpg' )
    },
    perlinY: {
      type: 't', value: new THREE.TextureLoader().load('img/perlin2.jpg' )
    },
    perlinParam: {
      type: 'v2', value: new THREE.Vector2(0.0, 0.0)
    },
    width: {
      type: 'f', value: window.innerWidth
    },
    height: {
      type: 'f', value: window.innerHeight
    },
  },
  vertexShader,    
  fragmentShader,
})

const imgTexture = material.uniforms.imgTexture.value
imgTexture.wrapS = imgTexture.wrapT = THREE.RepeatWrapping
material.uniforms.imgTexture.needsUpdate = true


const displacmentMap = material.uniforms.displacmentMap.value
displacmentMap.wrapS = displacmentMap.wrapT = THREE.RepeatWrapping
material.uniforms.displacmentMap.needsUpdate = true

const perlinX = material.uniforms.perlinX.value
perlinX.wrapS = perlinX.wrapT = THREE.RepeatWrapping
material.uniforms.perlinX.needsUpdate = true

const perlinY = material.uniforms.perlinY.value
perlinY.wrapS = perlinY.wrapT = THREE.RepeatWrapping
material.uniforms.perlinY.needsUpdate = true

const r = 1920 / 1080
const w = 20
const h = w * r
const geometry = new THREE.PlaneGeometry(h, w) 

const mesh = new THREE.Mesh(geometry, material)
mesh.position.z = 0
scene.add(mesh)

let prevTime = 0
let duration = 5000 * Math.random()
let va = {
  x: 0.01,
  y: 0.01,
}
function render(t) {
  renderer.render(scene, camera)
  requestAnimationFrame(render)
  
  material.uniforms.perlinParam.value.x = (Math.sin(t * 0.0004) * 2 * Math.cos(t * 0.0008))* 0.064
  material.uniforms.perlinParam.value.y = t * 0.00003

  material.uniforms.perlinParam.needsUpdate = true
}

requestAnimationFrame(render)

const control = new OrbitControls(camera, renderer.domElement)