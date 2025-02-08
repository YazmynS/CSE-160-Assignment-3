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
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  void main() {

    if(u_whichTexture == -2){
      gl_FragColor = u_FragColor;     //use color
  
    }else if (u_whichTexture == 0){
      gl_FragColor = texture2D(u_Sampler0, v_UV);   //use texture0
    
    }else if (u_whichTexture == 1){
      gl_FragColor = texture2D(u_Sampler1, v_UV);   //use texture1
    }
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
  }

  //Global Variables related to UI Elements
  let g_sliderAngle = 0;
  let g_mouseAngle = 0;
  let lastMouseX = 0;

  // Animal Variables
  let g_headAngle = 0;
  let g_bodyAngle = 0;
  let g_buttAngle = 0;
  let g_WingAngle = 0;
  let g_leg1Angle = 0;

  // Animation Variables 
  let g_headAnimation = false;
  let g_bodyAnimation = false;
  let g_buttAnimation = false;
  let g_wingsAnimation = false;
  let g_legsAnimation = false;

  // Set up actions for HTML UI elements
  function addActionsForHtmlUI(){
    // Slider Events
    document.getElementById('speedSlide').addEventListener('mousemove', function() { g_headAngle = this.value; renderAllShapes(); });
    document.getElementById('volumeSlide').addEventListener('mousemove', function() { g_bodyAngle = this.value; renderAllShapes(); });
    document.getElementById('brightnessSlide').addEventListener('mousemove', function() { g_buttAngle = this.value; renderAllShapes(); });
    
    //Animation Events
    document.getElementById("wallAniOnButton").onclick = function() { g_headAnimation = true; };
    document.getElementById("wallAniOffButton").onclick = function() { g_headAnimation = false; };
    document.getElementById("monsterAniOnButton").onclick = function() { g_bodyAnimation = true; };
    document.getElementById("monsterAniOffButton").onclick = function() { g_bodyAnimation = false; };
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
      console.log("Wall texture Loaded", wallImage);
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
      console.log('Failed to create the texture object');
      return false;
    }
    
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    console.log("Applying Floor Texture...");

    gl.activeTexture(gl.TEXTURE0);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, floorImage);
    
    // Set the texture unit 0 to the sampler
    console.log("Binding Floor Texture to Sampler0");
    gl.uniform1i(u_Sampler0, 0);
    console.log('Finished setting texture0');
  }

    //Create Texture1
    function sendImageToTEXTURE1(wallImage){
      
      texture1 = gl.createTexture();   // Create a texture object
      if (!texture1) {
        console.log('Failed to create the texture object');
        return false;
      }
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      console.log("Applying Wall Texture...");

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, texture1);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, wallImage);
      gl.uniform1i(u_Sampler1, 1);
      console.log('Finished setting texture1');
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

  // get animations
  requestAnimationFrame(tick);
}

// performance variables 
var g_StartTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_StartTime;

function tick(){
  g_seconds = performance.now()/1000.0 - g_StartTime;

  updateAnimationAngles();

  renderAllShapes();
  
  requestAnimationFrame(tick);
}

let startTime = Date.now();
let isDrawing = true;
var g_shapesList = [];

function convertCoordinatesEventTOGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x,y]);
}

function updateAnimationAngles(){
  if (g_headAnimation){
    g_headAngle = (30 * Math.sin(g_seconds) - 80);
  }

  if (g_bodyAnimation){
    g_bodyAngle = -(30 * Math.sin(g_seconds) + 30);
  }
  if (g_buttAnimation){
    g_buttAngle = (30 * Math.sin(g_seconds) + 30);
  }
  if (g_wingsAnimation){
    g_WingAngle = (30 * Math.sin(g_seconds) - 80);
  }
  if (g_legsAnimation){
    g_leg1Angle = (30 * Math.sin(g_seconds) - 10);
  }

}
function renderScene(){ 
  // Draw Body
  var bodyMatrix = new Matrix4();
  bodyMatrix.translate(-0.25, 0, 0.02);
  bodyMatrix.rotate(g_bodyAngle, 1, 0, 0);
  var body = new Cube(new Matrix4(bodyMatrix), [0.5, 0.35, 0.05, 1.0]);

  body.matrix.scale(0.3, 0.3, 0.3);
  body.render();

  // Save transformed matrices for other parts
  var bodyCoordinateMat = new Matrix4(bodyMatrix);
  var bodyCoordinateMat1 = new Matrix4(bodyMatrix);
  var bodyCoordinateMat2 = new Matrix4(bodyMatrix);
  var bodyCoordinateMat3 = new Matrix4(bodyMatrix);
  var bodyCoordinateMat4 = new Matrix4(bodyMatrix);
  var bodyCoordinateMat5 = new Matrix4(bodyMatrix);

  // Draw Head
  var headMatrix = new Matrix4(bodyCoordinateMat);
  headMatrix.translate(0, 0, -0.01);
  headMatrix.rotate(g_headAngle, 1, 0, 0);

  var head = new Cube(new Matrix4(headMatrix), [1.0, 1.0, 0, 1.0], 1);
  head.matrix.scale(0.3, 0.3, 0.3);
  gl.activeTexture(gl.TEXTURE1);
gl.bindTexture(gl.TEXTURE_2D, texture1);
gl.uniform1i(u_Sampler1, 1);

  head.render();

  // Draw Butt
  var buttMatrix = new Matrix4(bodyCoordinateMat1);
  buttMatrix.translate(0, 0, 0.25);
  buttMatrix.rotate(g_buttAngle, 1, 0, 0);

  var butt = new Cube(new Matrix4(buttMatrix), [1, 1, 0, 1.0]);
  butt.matrix.scale(0.3, 0.3, 0.3);
  butt.render();

  // Save butt matrix for stinger
  var buttCoordinateMat = new Matrix4(buttMatrix);

  // Draw Wings
  var wingLMatrix = new Matrix4(bodyCoordinateMat2);
  wingLMatrix.translate(0.1, 0.20, 0.0);
  wingLMatrix.rotate(-g_WingAngle, 0, 0, 1);

  var wingL = new Cube(new Matrix4(wingLMatrix), [1.0, 1.0, 1.0, 1.0]);
  wingL.matrix.scale(0.1, 0.3, 0.3);
  wingL.render();

  var wingRMatrix = new Matrix4(bodyCoordinateMat3);
  wingRMatrix.translate(0.2, 0.30, 0.0);
  wingRMatrix.rotate(g_WingAngle, 0, 0, 1);

  var wingR = new Cube(new Matrix4(wingRMatrix), [1.0, 1.0, 1.0, 1.0]);
  wingR.matrix.scale(0.1, 0.3, 0.3);
  wingR.render();

  // Draw Legs
  var legLMatrix = new Matrix4(bodyCoordinateMat4);
  legLMatrix.translate(0.2, -0.10, 0.0);
  legLMatrix.rotate(-g_leg1Angle, 1, 0, 0);

  var legL = new Cube(new Matrix4(legLMatrix), [0.5, 0.35, 0.05, 1.0]);
  legL.matrix.scale(0.05, 0.2, 0.1);
  legL.render();

  var legRMatrix = new Matrix4(bodyCoordinateMat5);
  legRMatrix.translate(0.04, -0.10, 0.0);
  legRMatrix.rotate(-g_leg1Angle, 1, 0, 0);

  var legR = new Cube(new Matrix4(legRMatrix), [0.5, 0.35, 0.05, 1.0]);
  legR.matrix.scale(0.05, 0.2, 0.1);
  legR.render();

  //Draw Background 
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
  console.log("Rendering Cube - Color:", this.color, "TextureNum:", this.textureNum);

  floor.render();



  


  //Draw Walls
}

function keydown(ev) {
  let rotationSpeed = 5;
  let speed = 0.2;

  if (ev.keyCode == 68) { // 'D' key
    g_eye[0] += speed; // Move right
  }
  else if (ev.keyCode == 65) { // 'A' key
    g_eye[0] -= speed; // Move left
  }
  else if (ev.keyCode == 87) { // 'W' key
    g_eye[2] -= speed; // Move forward
  }
  else if (ev.keyCode == 83) { // 'S' key
    g_eye[2] += speed; // Move backward
  }
  else if (ev.keyCode == 81) { // 'Q' key
    g_sliderAngle -= rotationSpeed;
  }
  else if (ev.keyCode == 69) { // 'E' key
    g_sliderAngle += rotationSpeed;
  }
  renderAllShapes();
}

var g_map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 1, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
]

function drawMap(){
  for (x=0; x<8; x++){
    for (y=0; y<8; y++){
      if (g_map[x][y] == 1){
        var map = new Cube();
        map.color = [1.0, 1.0, 1.0, 1.0];
        map.matrix.translate(x-4, -0.75, y-4);
        map.render();
      }
    }
  }
}
//Improve Efficency with smaller fewer cubes

var g_camera = new Camera();
var g_eye = [0,0,3];
var g_at = [0,0,-100];
var g_up = [0,1,0];

function renderAllShapes(){
  // Check the time at the start of this function
  var startTime = performance.now();

  // Pass the projection matrix
  var projMat = new Matrix4();
  projMat.setPerspective(60, canvas.width/canvas.height, .1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // Pass the view matrix
  var viewMat = new Matrix4();
  viewMat.setLookAt(g_eye[0], g_eye[1], g_eye[2], g_at[0], g_at[1], g_at[2], g_up[0], g_up[1], g_up[2]);
  
  /*viewMat.setLookAt(
    g_camera.eye.x, g_camera.eye.y, g_camera.eye.z,
    g_camera.at.x, g_camera.at.y, g_camera.at.z,
    g_camera.up.x, g_camera.up.y, g_camera.up.z); //(eye, looking at,up)*/
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
}
//Display Performance
function sendTextToHTML(text, htmlID){
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm){
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

function mouseControl() {
  canvas.onmousedown = function(ev) {
      lastMouseX = ev.clientX;
  };
  canvas.onmousemove = function(ev) { 
      if(ev.buttons == 1) { // Detect mouse drag
          let deltaX = ev.clientX - lastMouseX;

          if (Math.abs(deltaX) < 1) {
              return;
          }
          // Adjust rotation speed
          g_mouseAngle += deltaX * 0.5; 

          renderAllShapes();
          lastMouseX = ev.clientX; // Update last position
      }
  };
}
  
