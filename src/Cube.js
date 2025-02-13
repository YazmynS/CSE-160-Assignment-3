class Cube {
  constructor(M, color, textureNum = -2) {
      this.type = 'cube';
      this.color = color;
      this.matrix = M;
      this.textureNum = textureNum;
  }

  render() {
      const rgba = this.color;

      // Set the texture if applicable
      gl.uniform1i(u_whichTexture, this.textureNum);
      if (this.textureNum == -2) {
          gl.bindTexture(gl.TEXTURE_2D, null);
          gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      }

      // Pass color and matrix to shaders
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      drawCube();
  }
}

// Store buffers globally so they are created only once
let cubeVertexBuffer = null;
let cubeUVBuffer = null;
let cubeIndicesBuffer = null;

// Cube vertices (for a standard cube)
const cubeVertices = new Float32Array([
  // Front
  0, 0, 0,  1, 1, 0,  1, 0, 0,
  0, 0, 0,  0, 1, 0,  1, 1, 0,
  
  // Right
  1, 0, 0,  1, 1, 0,  1, 1, 1,
  1, 0, 0,  1, 1, 1,  1, 0, 1,
  
  // Back
  1, 0, 1,  1, 1, 1,  0, 1, 1,
  1, 0, 1,  0, 1, 1,  0, 0, 1,
  
  // Left
  0, 0, 1,  0, 1, 1,  0, 1, 0,
  0, 0, 1,  0, 1, 0,  0, 0, 0,
  
  // Top
  0, 1, 0,  1, 1, 0,  1, 1, 1,
  0, 1, 0,  1, 1, 1,  0, 1, 1,

  // Bottom
  0, 0, 0,  1, 0, 0,  1, 0, 1,
  0, 0, 0,  1, 0, 1,  0, 0, 1
]);

// Cube UVs (for texture mapping)
const cubeUVs = new Float32Array([
  // Front
  0, 0,  1, 1,  1, 0,
  0, 0,  0, 1,  1, 1,
  
  // Right
  0, 0,  1, 0,  1, 1,
  0, 0,  1, 1,  0, 1,
  
  // Back
  1, 0,  1, 1,  0, 1,
  1, 0,  0, 1,  0, 0,
  
  // Left
  0, 0,  1, 0,  1, 1,
  0, 0,  1, 1,  0, 1,
  
  // Top
  0, 1,  1, 1,  1, 0,
  0, 1,  1, 0,  0, 0,

  // Bottom
  0, 0,  1, 0,  1, 1,
  0, 0,  1, 1,  0, 1
]);

function drawCube() {
  var n = 36;

  // Create and reuse the vertex buffer
  if (!cubeVertexBuffer) {
      cubeVertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  // Create and reuse the UV buffer
  if (!cubeUVBuffer) {
      cubeUVBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, cubeUVBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, cubeUVs, gl.STATIC_DRAW);
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeUVBuffer);
  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_UV);

  // Draw the cube
  gl.drawArrays(gl.TRIANGLES, 0, n);
}
