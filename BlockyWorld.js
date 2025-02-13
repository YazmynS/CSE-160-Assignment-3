// Vertex shader program
var VSHADER_SOURCE =`
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    }`

// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
varying vec2 v_UV;
uniform vec4 u_FragColor;
uniform float u_Brightness;
uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1;
uniform int u_whichTexture;

void main() {
    vec4 color;

    if (u_whichTexture == -2) {
        color = u_FragColor;     // Use solid color
    } else if (u_whichTexture == 0) {
        color = texture2D(u_Sampler0, v_UV);   // Use texture 0
    } else if (u_whichTexture == 1) {
        color = texture2D(u_Sampler1, v_UV);   // Use texture 1
    } else {
        color = vec4(1.0, 1.0, 1.0, 1.0); // Default white
    }

    // Convert to grayscale intensity
    float intensity = dot(color.rgb, vec3(0.299, 0.587, 0.114));

    // Apply brightness effect (0 = grayscale, 1 = full color)
    color.rgb = mix(vec3(intensity), color.rgb, u_Brightness);

    gl_FragColor = color;
}`

  // Global Variables
  let canvas;
  let gl;
  let a_Position;
  let a_UV;
  let u_FragColor;
  let u_ModelMatrix;
  let u_ProjectionMatrix;
  let u_ViewMatrix;
  let u_GlobalRotateMatrix;
  let u_Sampler0;
  let u_Sampler1;
  let u_whichTexture;
  let u_Brightness;

  var g_map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 1, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 0, 1, 0, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
  ]

  function setUpGL(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
    if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return;
    }
    // Enable the depth test
    gl.enable(gl.DEPTH_TEST);
  }

  function connectVariablesToGLSL(){
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
      console.log('Failed to intialize shaders.');
      return;
    }

    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
      console.log('Failed to get the storage location of a_Position');
      return;
    }

    // Get the storage location of a_UV
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
      console.log('Failed to get the storage location of a_UV');
      return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
      console.log('Failed to get the storage location of u_FragColor');
      return;
    }

    // Get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
      console.log('Failed to get the storage location of u_ModelMatrix');
      return;
    }

    //Set an initial valu for this matrix to identity
    let modelMatrix = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  
    // Get the storage location of u_GlobalRotateMatrix
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
      console.log('Failed to get the storage location of u_GlobalRotateMatrix');
      return;
    }

    //Set an initial val for this matrix to identity
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, identityM.elements);
  
    // Get the storage location of u_ViewMatrix
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
      console.log('Failed to get the storage location of u_ViewMatrix');
      return;
    }

    // Get the storage location of u_ProjectionMatrix
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
      console.log('Failed to get the storage location of u_ProjectionMatrix');
      return;
    }

    // Get the storage location of u_Samplers
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
      console.log('Failed to get the storage location of u_Sampler0');
      return;
    }

    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
      console.log('Failed to get the storage location of u_Sampler1');
      return;
    }

    // Get the storage location of u_whichTexture
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
      console.log('Failed to get the storage location of u_whichTexture');
      return;
    }

    u_Brightness = gl.getUniformLocation(gl.program, 'u_Brightness');
    if (!u_Brightness) {
        console.log('Failed to get the storage location of u_Brightness');
        return;
    }
    gl.uniform1f(u_Brightness, 1.0); // Default brightness
  }

  //Global Variables related to UI Elements
  let g_sliderAngle = 0;
  let g_mouseAngle = 0;
  let lastMouseX = 0;
  let g_speed = 0.2;
  let g_goalPosition = RanGoalPos();
  let g_hint = false;
  
  // Camera Variables 
  var g_camera = new Camera();
  var g_eye = [0,0,3];
  var g_at = [0,0,-100];
  var g_up = [0,1,0];

  // Performance Variables 
  var g_StartTime = performance.now()/1000.0;
  var g_seconds = performance.now()/1000.0 - g_StartTime;
  let startTime = Date.now();
  let isDrawing = true;
  var g_shapesList = [];

  // Set up actions for HTML UI elements
  function addActionsForHtmlUI(){
    // Slider Events
    document.getElementById('speedSlide').addEventListener('change', function() {
      g_speed = parseFloat(this.value); // Scale down if needed
    });    
      document.getElementById('volumeSlide').addEventListener('change', function(){
      let music = document.getElementById('music');
      let volumeValue = parseFloat(this.value) / 100; // Convert to 0.0 - 1.0
      music.volume = volumeValue;    
    });
    document.getElementById('brightnessSlide').addEventListener('change', function() { 
      let brightnessValue = parseFloat(this.value); // No need to divide
      gl.uniform1f(u_Brightness, brightnessValue);
      renderAllShapes();
  });
  
    //Hint Event
    document.getElementById("hintAniOnButton").addEventListener("click", function(){
      let prevHint = g_hint;
      g_hint = !g_hint;
      if (prevHint !== g_hint) { renderAllShapes(); }
    })
  }

  function initTextures() {
    //Create Texture0
    var floorImage = new Image();  // Create the image object
    if (!floorImage) {
      console.log('Failed to create the image object');
      return false;
    }
    // Register the event handler to be called on loading an image
    floorImage.onload = function(){ 
      console.log("Floor texture Loaded", floorImage);
      sendImageToTEXTURE0(floorImage); 
    };
    // Tell the browser to load an image
    floorImage.src = './textures/floor.jpg';

    //Create Texture1
    var wallImage = new Image();  // Create the image object
    if (!wallImage) {
      console.log('Failed to create the image object');
      return false;
    }
    // Register the event handler to be called on loading an image
    wallImage.onload = function(){ 
      sendImageToTEXTURE1(wallImage); 
    };

    // Tell the browser to load an image
    wallImage.src = './textures/grass.jpg';
    return true;
  }
  let texture, texture1;
  function sendImageToTEXTURE0(floorImage) {
    texture = gl.createTexture();   // Create a texture object
    if (!texture) { 
      console.log("Failed to get texture object.");
      return false; 
    }
    
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE0);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, floorImage);
    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler0, 0);
  }

    //Create Texture1
    function sendImageToTEXTURE1(wallImage){
      
      texture1 = gl.createTexture();   // Create a texture object
      if (!texture1) {
        console.log("Failed to get texture object");
        return false;
      }
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, texture1);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, wallImage);
      gl.uniform1i(u_Sampler1, 1);
  }

function main() {  
  // Set up canvas and gl varaibles 
  setUpGL();
  // Set up GLSL shader program and connect GLSL variables
  connectVariablesToGLSL();
  document.onkeydown = keydown;
  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();
  // Set up textures
  initTextures();
  //Set up mouse rotation
  mouseControl(); 
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // Auto-play background music
  setTimeout(playMusic, 1000); 
}

function tick(){
  g_seconds = performance.now()/1000.0 - g_StartTime;
  renderAllShapes();
}

function convertCoordinatesEventTOGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return ([x,y]);
}

function renderScene(){ 
  //Draw Sky
  var skyMatrix = new Matrix4();
  skyMatrix.scale(50, 50, 50);
  skyMatrix.translate(-0.5, -0.5, -0.5);
  var sky = new Cube(skyMatrix, [0.6, 0.8, 1.0, 1.0], -2);
  gl.uniform1i(u_whichTexture, sky.textureNum);
  sky.render();
  
  //Draw Floor
  var floorMatrix = new Matrix4();
  floorMatrix.translate(0, -0.75, 0);
  floorMatrix.scale(10, 0, 10);
  var floor = new Cube(floorMatrix, [0.0, 1.0, 0.0, 1.0], 0);
  floor.matrix.translate(-0.5, 0.1, -0.5);
  floor.render();

  //Draw Walls
  drawMap();
  
  //Draw goal cube 
  if(g_goalPosition){
    let goalHeight = g_hint ? 2.0 : 0.5;
    var goalMatrix = new Matrix4();
    goalMatrix.translate(g_goalPosition.x, g_goalPosition.y, g_goalPosition.z);
    goalMatrix.scale(0.5, goalHeight, 0.5);
    var goal = new Cube(goalMatrix, [1.0, 1.0, 0.0, 1.0], -2);
    goal.render();
  }
}

function drawMap(){
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture1);
  gl.uniform1i(u_Sampler1, 1);
  
  for (x=0; x<8; x++){
    for (y=0; y<8; y++){
      if (g_map[x][y] == 1){
        var map = new Cube(new Matrix4(), [1.0, 1.0, 1.0, 1.0], 1);
        map.color = [1.0, 1.0, 1.0, 1.0];
        map.matrix.translate(x-4, -0.75, y-4);  
        map.render();
      }
    }
  }
}

function keydown(ev) {
  let speed = g_speed;
  let rotationSpeed = 5;
  let walkSound = document.getElementById("walk");
  let punchSound = document.getElementById("punch");
  let goalSound = document.getElementById("goal");
  // Store previous position before moving
  let prevEye = [...g_camera.eye];

  //W Key
  if (ev.keyCode == 87) { 
    g_camera.forward(speed); 
    renderAllShapes();
  }
  //S Key
  else if (ev.keyCode == 83) {
    g_camera.back(speed);
    renderAllShapes();
  }
  //A Key
  else if (ev.keyCode == 65) {
    g_camera.left(speed); 
    renderAllShapes();
  }
  //D Key
  else if (ev.keyCode == 68) {
    g_camera.right(speed);
    renderAllShapes();
  }
  //Q Key
  else if (ev.keyCode == 81) { 
    g_camera.rotate(-rotationSpeed);
    renderAllShapes();
  }
  //E Key
  else if (ev.keyCode == 69) { 
    g_camera.rotate(rotationSpeed);
    renderAllShapes();
  } 
  // SPACE Key
  else if (ev.keyCode == 32) { // 'Space' key (Punch)
      destroyGrass();
      playSound(punchSound);
  }
  //Play sound if player moves
  if (!aEqual(prevEye, g_camera.eye)) { playSound(walkSound); }
  function aEqual(a,b){ return a.length === b.length && a.every((v,i)=> v === b[i]); }

  // **Collision Check**
  if (checkCollision(g_camera.eye[0], g_camera.eye[2])) {
      g_camera.eye = prevEye; // Reset to previous position if collision detected
  }else if (checkGoalCollision()) { // 🎯 If player reaches goal
      let goalSound = document.getElementById("goal");
      if (!goalSound) { console.error("Goal sound not found!"); }
      else { playSound(goalSound); }
  renderAllShapes();
}
}

function renderAllShapes(){
  // Check the time at the start of this function
  var startTime = performance.now();

  // Pass the projection matrix
  var projMat = new Matrix4();
  projMat.setPerspective(60, canvas.width/canvas.height, .1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // Pass the view matrix
  var viewMat = new Matrix4();  
  viewMat.setLookAt(
    g_camera.eye[0], g_camera.eye[1], g_camera.eye[2],
    g_camera.at[0], g_camera.at[1], g_camera.at[2],
    g_camera.up[0], g_camera.up[1], g_camera.up[2]); //(eye, looking at,up)
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  let totalRotation = g_mouseAngle + g_sliderAngle;
  var globalRotMat = new Matrix4();
  globalRotMat.setRotate(totalRotation, 0, 1, 0); // Apply combined rotation
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
    
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  renderScene();

  // Calculate Performance
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: "+ Math.floor(duration) + " fps: " + Math.floor(10000/duration), "numdot");
  sendTextToHTML("AWSD to walk\n QE to Turn\n SPACE to Punch. You only get 1 shot", "numdot2");
}
//Display Performance
function sendTextToHTML(text, htmlID){
let formattedText = text.replace(/\n/g, "<br>");

  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm){
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = formattedText;
}

function mouseControl() {
  let sensitivity = 0.02; // Adjust rotation speed
  let isMouseDown = false;

  canvas.onmousedown = function () { isMouseDown = true; };
  canvas.onmouseup = function () { isMouseDown = false; };

  document.onmousemove = function (ev) {
      if (!isMouseDown) return; // Stop rotating if mouse button is not held
      let deltaX = ev.movementX * sensitivity;
      let deltaY = ev.movementY * sensitivity;

      // Rotate left/right
      g_camera.rotate(deltaX * (180 / Math.PI)); // Convert radians to degrees

      // Tilt up/down (limit vertical movement)
      let pitchLimit = Math.PI / 3; // Limit vertical rotation
      let pitchAngle = Math.asin(g_camera.at[1] - g_camera.eye[1]); // Current vertical angle
      let newPitchAngle = pitchAngle - deltaY;

      if (newPitchAngle > -pitchLimit && newPitchAngle < pitchLimit) { g_camera.at[1] -= deltaY; }
      renderAllShapes(); // Update the scene
  };
}

function checkCollision(nextX, nextZ) {
  // Convert world coordinates to grid indices
  let gridX = Math.floor(nextX + 4);  // Offset since map starts from -4
  let gridZ = Math.floor(nextZ + 4);

  // Check bounds to prevent out-of-bounds errors
  if (gridX < 0 || gridX >= g_map.length || gridZ < 0 || gridZ >= g_map[0].length) { return true; }

  // Return true if there is a wall at the next position
  return g_map[gridX][gridZ] === 1;
}

function rotateView(angleRadians) {
  let dx = g_at[0] - g_eye[0];
  let dz = g_at[2] - g_eye[2];
  let newDx = dx * Math.cos(angleRadians) - dz * Math.sin(angleRadians);
  let newDz = dx * Math.sin(angleRadians) + dz * Math.cos(angleRadians);

  g_at[0] = g_eye[0] + newDx;
  g_at[2] = g_eye[2] + newDz;
}

function playMusic() {
  let music = document.getElementById('music');
  music.volume = 0.5;
  let autoPlay = music.play();

  if (autoPlay !== undefined) {
      autoPlay.catch(error => {
          document.body.addEventListener('click', () => {
              music.play();
          }, { once: true });
      });
  }
}

function playSound(audioElement, duration = 2000) { // Default to 2 seconds
  if (!audioElement) {
      console.log("Audio element not found.");
      return; // Prevent errors
  }
  audioElement.play().catch(error => console.log("Audio play was blocked by the browser:", error));

  // Stop the sound after `duration` milliseconds (2 sec = 2000 ms)
  setTimeout(() => {
      audioElement.pause();
  }, duration);
}

let punchUsed = false; // Can only punch once
function destroyGrass() {
    if (punchUsed) {
        console.log("You have already used your punch!");
        return; // Exit function if already used
    }

    // Get the direction the player is facing
    let forwardX = g_camera.at[0] - g_camera.eye[0];
    let forwardZ = g_camera.at[2] - g_camera.eye[2];

    // Normalize the direction vector (for stability)
    let length = Math.sqrt(forwardX * forwardX + forwardZ * forwardZ);
    forwardX /= length;
    forwardZ /= length;

    // Get the block in front of the player
    let targetX = Math.floor(g_camera.eye[0] + forwardX + 4); // Offset to match g_map
    let targetZ = Math.floor(g_camera.eye[2] + forwardZ + 4);

    // Ensure within bounds
    if (targetX >= 0 && targetX < g_map.length && targetZ >= 0 && targetZ < g_map[0].length) {
        if (g_map[targetX][targetZ] === 1) { // If there is grass
            console.log("Grass destroyed at:", targetX - 4, targetZ - 4);
            g_map[targetX][targetZ] = 0; // Remove the grass
            punchUsed = true; // Disable punching forever
            renderAllShapes(); // Redraw scene without the removed grass
        }
    }
}

function RanGoalPos() {
  let emptyTiles = [];

  for (let x = 0; x < g_map.length; x++) {
      for (let z = 0; z < g_map[0].length; z++) {
          if (g_map[x][z] === 0) {
              emptyTiles.push({ x, z }); // Store valid positions
          }
      }
  }

  if (emptyTiles.length === 0) {
      console.log("No empty tiles available!");
      return { x: 0, y: -0.5, z: 0 }; // Default safe position if needed
  }

  let randomIndex = Math.floor(Math.random() * emptyTiles.length);
  let newGoal = emptyTiles[randomIndex];

  console.log(`🆕 New Goal Position: X=${newGoal.x - 4}, Z=${newGoal.z - 4}`);
  return { x: newGoal.x - 4, y: -0.5, z: newGoal.z - 4 };
}


function checkGoalCollision() {
  if (!g_goalPosition) return false; // No goal exists

  let dx = Math.abs(g_camera.eye[0] - g_goalPosition.x);
  let dz = Math.abs(g_camera.eye[2] - g_goalPosition.z);

  if (dx <= 0.5 && dz <= 0.5) {
      console.log("Goal reached! Respawning...");
      g_goalPosition = RanGoalPos(); // Generate a new goal position
      return true;
  }
  return false;
}
