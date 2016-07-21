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

  // Phong shader
  YADJ.phongShader = THREE.ShaderLib.phong;
  YADJ.phongUniforms = THREE.UniformsUtils.clone(YADJ.phongShader.uniforms);

  var ambientLight = new THREE.AmbientLight(0x353535);
  YADJ.scene.add(ambientLight);

  YADJ.textureLoader = new THREE.TextureLoader();
  var jsonLoader = new THREE.JSONLoader();

  var playerGeometry = new THREE.SphereGeometry(4, 20, 20);

  // var playerMaterial = new THREE.MeshLambertMaterial({color: 0x0F014A});
  var playerMaterial = new THREE.ShaderMaterial({
      uniforms: YADJ.phongUniforms,
      vertexShader: YADJ.phongShader.vertexShader,
      fragmentShader: YADJ.phongShader.fragmentShader,
      lights:true,
      fog: true,
      // color: 0x0F014A
    });

  // Bezier curve spline
  // YADJ.curve = new THREE.QuadraticBezierCurve(
  //   new THREE.Vector3(-10, 0, 0),
  //   new THREE.Vector3(0, 12, 0),
  //   new THREE.Vector3(10, 0, 0)
  // );
  // var curveMaterial = new THREE.LineBasicMaterial({color: 0xff0000});
  // var path = new THREE.Path(YADJ.curve.getPoints(50));
  // var curveGeometry = path.createPointsGeometry(50);

  // //Create the final Object3d to add to the scene
  // var curveObject = new THREE.Line(curveGeometry, curveMaterial);
  // curveObject.position.set(27, 27.6, 0);
  // YADJ.scene.add(curveObject);

  // Heart Shape created with Bezier Curves
  var heartShape = new THREE.Shape();
  var x = 0, y = 0;
  heartShape.moveTo(x + 25, y + 25);
  heartShape.bezierCurveTo(x + 25, y + 25, x + 20, y, x, y);
  heartShape.bezierCurveTo(x - 30, y, x - 30, y + 35,x - 30,y + 35);
  heartShape.bezierCurveTo(x - 30, y + 55, x - 10, y + 77, x + 25, y + 95);
  heartShape.bezierCurveTo(x + 60, y + 77, x + 80, y + 55, x + 80, y + 35);
  heartShape.bezierCurveTo(x + 80, y + 35, x + 80, y, x + 50, y);
  heartShape.bezierCurveTo(x + 35, y, x + 25, y + 25, x + 25, y + 25);
  var extrudeSettings = {amount: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1};

  var heartGeometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
  YADJ.heartObject = new THREE.Mesh(heartGeometry, new THREE.MeshPhongMaterial({color: 0xf00000}));
  YADJ.heartObject.position.set(-30, 20, 0);
  YADJ.heartObject.rotation.set(0, 0, Math.PI);
  YADJ.heartObject.scale.set(0.05, 0.05, 0.05);
  YADJ.scene.add(YADJ.heartObject);


  // Platforms
  var platformMaterial = new THREE.MeshPhongMaterial( {
      color: 0x2082A3,
      morphTargets: true,
      morphNormals: true,
      vertexColors: THREE.FaceColors,
      shading: THREE.SmoothShading
   });
  var platformGeometry = new THREE.BoxGeometry(10, 1, 1);
  YADJ.platform1 = new THREE.Mesh(platformGeometry, platformMaterial);
  YADJ.platform2 = new THREE.Mesh(platformGeometry, platformMaterial);
  YADJ.platform3 = new THREE.Mesh(platformGeometry, platformMaterial);

  YADJ.platform1.position.set(27, 27, 0);
  YADJ.platform1.scale.set(2,1,1);
  YADJ.platform2.position.set(-15, 40, 0);
  YADJ.platform2.scale.set(2,1,1);
  YADJ.platform3.position.set(-30, 13, 0);
  YADJ.platform3.scale.set(2,1,1);

  YADJ.player = new THREE.Mesh(playerGeometry, playerMaterial);
  YADJ.enemy = YADJ.buildEnemy();

  YADJ.player.position.x = 0;
  YADJ.player.position.y = 5;
  YADJ.player.position.z = 0;

  YADJ.enemy.position.x = 25;
  YADJ.enemy.position.y = 30;
  YADJ.enemy.position.z = 0;
  YADJ.enemy.scale.set(2,2,2);

  YADJ.light = new THREE.SpotLight(0xffffff);
  YADJ.light.position.set(150, 150, 200);

  YADJ.scene.add(YADJ.player);
  YADJ.scene.add(YADJ.enemy);
  YADJ.scene.add(YADJ.light);
  YADJ.scene.add(YADJ.platform1);
  YADJ.scene.add(YADJ.platform2);
  YADJ.scene.add(YADJ.platform3);

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

YADJ.buildEnemy = (function() {
    var _geo = null;

    // Share the same geometry across all planar objects
    function getPlaneGeometry() {
        if(_geo == null) {
            _geo = new THREE.PlaneGeometry(6, 6);
        }

        return _geo;
    };

    return function() {
        var g = getPlaneGeometry();
        var creatureImage = YADJ.textureLoader.load('img/enemy.png');
        creatureImage.magFilter = THREE.NearestFilter;
        var mat = new THREE.ShaderMaterial({
            uniforms: {
                color: {type: 'f', value: 0.0},
                evilCreature: {type: 't', value: creatureImage}
            },
            vertexShader: document.
                          getElementById('vertShader').text,
            fragmentShader: document.
                            getElementById('fragShader').text,
            transparent: true
        });

        var obj = new THREE.Mesh(g, mat);
        return obj;
    }
})();

YADJ.start = function() {
  document.getElementById("menu").style.display = "none";
  document.querySelector("footer").style.display = "none";
  YADJ.scoreDOM = document.getElementById("score");
  YADJ.scoreDOM.style.display = "block";

  YADJ.step = 0

  YADJ.animate();
};

YADJ.animate = function() {
  YADJ.step += 0.03;
  YADJ.enemy.position.x = 27 + (6.8 * (Math.cos(YADJ.step)));
  YADJ.enemy.position.y = 30 + (5 * Math.abs(Math.sin(YADJ.step)));

  YADJ.heartObject.rotation.y += 0.03;
  YADJ.coin.rotation.z += 0.04;
  YADJ.coin.rotation.y += 0.04;

  var c = 0.5+0.5*Math.cos(new Date().getTime()/1000.0 * Math.PI);
  YADJ.enemy.material.uniforms.color.value = c;

  YADJ.renderer.render(YADJ.scene, YADJ.camera);

  YADJ.stats.update();

  if(!YADJ.gameOver) window.requestAnimationFrame(YADJ.animate);
  YADJ.update();
};

YADJ.update = function() {
  YADJ.keyboard.update();

  var moveDistance = 50 * YADJ.clock.getDelta();
  var jump = 13;

  if (YADJ.keyboard.pressed("A") || YADJ.keyboard.pressed("left"))
    YADJ.player.translateX(-moveDistance);

  if (YADJ.keyboard.pressed("D") || YADJ.keyboard.pressed("right"))
    YADJ.player.translateX(moveDistance);

  if(YADJ.keyboard.down("W") || YADJ.keyboard.down("up") || YADJ.keyboard.down("space")){
    YADJ.player.translateY(jump);

    YADJ.camera.position.y = YADJ.player.position.y;
  }
    


  /*
  if (YADJ.keyboard.pressed("W") || YADJ.keyboard.pressed("up") || YADJ.keyboard.pressed("space"))
    YADJ.player.translateY(moveDistance);

  
  if (YADJ.keyboard.pressed("S") || YADJ.keyboard.pressed("down"))
    YADJ.player.translateY(-moveDistance);
  */
};

window.addEventListener("load", YADJ.init);
