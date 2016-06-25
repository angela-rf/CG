if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (function() {
    return window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback, element) {
      window.setTimeout(callback, 1000 / 60);
    };
  })();
}

var YADJ = {};

YADJ.init = function() {
  // scene size
  var WIDTH = window.innerWidth,
      HEIGHT = window.innerHeight;

  // camera attributes
  var VIEW_ANGLE = 40,
      ASPECT = WIDTH / HEIGHT,
      NEAR = 0.1,
      FAR = 1000;

  // WebGL renderer, camera and scene
  YADJ.renderer = new THREE.WebGLRenderer();
  YADJ.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  YADJ.scene = new THREE.Scene();

  // Set camera position
  YADJ.camera.position.z = 80;
  YADJ.camera.position.y = 25;
  YADJ.scene.add(YADJ.camera);

  // Load KeyboardState
  YADJ.keyboard = new KeyboardState();
  YADJ.clock = new THREE.Clock();

  // start renderer
  YADJ.renderer.setSize(WIDTH, HEIGHT);
  YADJ.renderer.setClearColor(0xDEFBFF, 1);
  // Little hack so canvas is not black on Menu
  YADJ.renderer.render(YADJ.scene, YADJ.camera);

  document.body.appendChild(YADJ.renderer.domElement);

  YADJ.stats = new Stats();
  YADJ.stats.domElement.style.position = 'absolute';
  YADJ.stats.domElement.style.top = '10px';
  YADJ.stats.domElement.style.left = '10px';
  document.body.appendChild(YADJ.stats.domElement);

  var ambientLight = new THREE.AmbientLight(0xDCDCDC);
  YADJ.scene.add(ambientLight);

  var textureLoader = new THREE.TextureLoader();
  var jsonLoader = new THREE.JSONLoader();

  var playerGeometry = new THREE.SphereGeometry(4, 20, 20);
  var enemyGeometry = new THREE.BoxGeometry(4, 4, 4);
  var platformGeometry = new THREE.BoxGeometry(10, 1, 1);

  var playerMaterial = new THREE.MeshLambertMaterial({color: 0x0F014A});
  var enemyMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
  var platformMaterial = new THREE.MeshPhongMaterial( {
      color: 0xffffff,
      morphTargets: true,
      morphNormals: true,
      vertexColors: THREE.FaceColors,
      shading: THREE.SmoothShading
   });

  YADJ.player = new THREE.Mesh(playerGeometry, playerMaterial);
  YADJ.enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
  YADJ.platform = new THREE.Mesh(platformGeometry, platformMaterial);


  YADJ.player.position.x = 0;
  YADJ.player.position.y = 5;
  YADJ.player.position.z = 0;

  YADJ.enemy.position.x = 27;
  YADJ.enemy.position.y = 30;
  YADJ.enemy.position.z = 0;

  YADJ.platform.position.set(27, 27, 0);
  YADJ.platform.scale.set(2,1,1);

  YADJ.light = new THREE.SpotLight(0xffffff);
  YADJ.light.position.set(200, 250, 200);

  YADJ.scene.add(YADJ.player);
  YADJ.scene.add(YADJ.enemy);
  YADJ.scene.add(YADJ.light);
  YADJ.scene.add(YADJ.platform);

  jsonLoader.load('obj/coin.json', function (coinGeometry) {
    var coinMaterial = new THREE.MeshPhongMaterial( {
        color: 0xB2A41B,
        morphTargets: true,
        morphNormals: true,
        vertexColors: THREE.FaceColors,
        shading: THREE.FlatShading
     });
    YADJ.coin = new THREE.Mesh(coinGeometry, coinMaterial);
    YADJ.coin.position.set(-15, 45, -1);
    YADJ.coin.scale.set(2.2, 2.2, 2.2);
    YADJ.coin.rotation.x = -80;

    YADJ.scene.add(YADJ.coin);
  });

  document.getElementById("play_button").addEventListener('click', function(event) {
    event.preventDefault();
    YADJ.start();
  });
};

YADJ.start = function() {
  document.getElementById("menu").style.display = "none";
  document.querySelector("footer").style.display = "none";
  YADJ.scoreDOM = document.getElementById("score");
  YADJ.scoreDOM.style.display = "block";

  YADJ.animate();
};

YADJ.animate = function() {
  var time = Date.now();
  YADJ.frameTime = time - YADJ._lastFrameTime;
  YADJ._lastFrameTime = time;
  YADJ.cumulatedFrameTime += YADJ.frameTime;

  while(YADJ.cumulatedFrameTime > YADJ.gameStepTime) {
    // block movement will go here
    YADJ.cumulatedFrameTime -= YADJ.gameStepTime;
  }

  YADJ.enemy.rotation.y += 0.03;
  YADJ.coin.rotation.z += 0.04;
  YADJ.coin.rotation.y += 0.04;

  YADJ.renderer.render(YADJ.scene, YADJ.camera);

  YADJ.stats.update();

  if(!YADJ.gameOver) window.requestAnimationFrame(YADJ.animate);
  // YADJ.render();
  YADJ.update();
};

YADJ.update = function() {
  YADJ.keyboard.update();

  var moveDistance = 50 * YADJ.clock.getDelta();

  if (YADJ.keyboard.pressed("A"))
    YADJ.player.translateX(-moveDistance);

  if (YADJ.keyboard.pressed("D"))
    YADJ.player.translateX(moveDistance);
};

YADJ.render = function() {
  YADJ.renderer.clear();
  YADJ.renderer.render(YADJ.scene, YADJ.camera);
};

window.addEventListener("load", YADJ.init);
