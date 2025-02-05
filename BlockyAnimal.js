// ColoredPoint.js (c) 2012 matsuda
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
  void main() {
    gl_FragColor = u_FragColor;
    //gl_FragColor = vec4(v_UV, 1.0, 1.0);
  }`

  // Global Variables
  let canvas;
  let gl;
  let a_Position;
  let a_UV;
  let u_FragColor;
  let u_Size;
  let u_ModelMatrix;
  let u_ProjectionMatrix;
  let u_ViewMatrix;
  let u_GlobalRotateMatrix;

  function setUpGL(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
    if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return;
    }

    gl.enable(gl.DEPTH_TEST);
  }

  function connectVariablesToGLSL(){
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
      console.log('Failed to intialize shaders.');
      return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
      console.log('Failed to get the storage location of a_Position');
      return;
    }

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
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, identityM.elements);
  
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
      console.log('Failed to get the storage location of u_ViewMatrix');
      return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
      console.log('Failed to get the storage location of u_ProjectionMatrix');
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
    document.getElementById('angleSlide').addEventListener('mousemove', function() { g_sliderAngle = this.value; renderAllShapes(); });
    document.getElementById('headSlide').addEventListener('mousemove', function() { g_headAngle = this.value; renderAllShapes(); });
    document.getElementById('bodySlide').addEventListener('mousemove', function() { g_bodyAngle = this.value; renderAllShapes(); });
    document.getElementById('buttSlide').addEventListener('mousemove', function() { g_buttAngle = this.value; renderAllShapes(); });
    document.getElementById('wingSlide').addEventListener('mousemove', function() { g_WingAngle = this.value; renderAllShapes(); });
    document.getElementById('leg1Slide').addEventListener('mousemove', function() { g_leg1Angle = this.value; renderAllShapes(); });
    
    //Animation Events
    document.getElementById("headAniOnButton").onclick = function() { g_headAnimation = true; };
    document.getElementById("headAniOffButton").onclick = function() { g_headAnimation = false; };
    
    document.getElementById("bodyAniOnButton").onclick = function() { g_bodyAnimation = true; };
    document.getElementById("bodyAniOffButton").onclick = function() { g_bodyAnimation = false; };
    
    document.getElementById("buttAniOnButton").onclick = function() { g_buttAnimation = true; };
    document.getElementById("buttAniOffButton").onclick = function() { g_buttAnimation = false; };
    
    document.getElementById("wingsAniOnButton").onclick = function() { g_wingsAnimation = true; };
    document.getElementById("wingsAniOffButton").onclick = function() { g_wingsAnimation = false; };
  
    document.getElementById("legsAniOnButton").onclick = function() { g_legsAnimation = true; };
    document.getElementById("legsAniOffButton").onclick = function() { g_legsAnimation = false; };
  }

function main() {  
  // Set up canvas and gl varaibles 
  setUpGL();

  // Set up GLSL shader program and connect GLSL variables
  connectVariablesToGLSL();
  
  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();

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

  var head = new Cube(new Matrix4(headMatrix), [1.0, 1.0, 0, 1.0]);
  head.matrix.scale(0.3, 0.3, 0.3);
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

  //Draw Stinger Cone
  var stinger = new Cone();
  stinger.color = [.211, .211, .211, 1.0];
  stinger.matrix = buttCoordinateMat;
  stinger.matrix.translate(0.2, 0.15, 0.30);
  stinger.matrix.rotate(90, 1, 0, 0);
  stinger.matrix.scale(0.15, 0.15, 0.15);
  stinger.render();

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
}
function renderAllShapes(){
  // Check the time at the start of this function
  var startTime = performance.now();

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