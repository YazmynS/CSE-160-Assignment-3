class Point {
  constructor() {
      this.type = 'point';
      this.position = [0.0, 0.0, 0.0];
      this.color = [1.0, 1.0, 1.0];
      this.size = 5.0;
  }

  render() {
      var xy = this.position;
      var rgba = this.color;
      var size = this.size;

      // Use a shared buffer for points (faster)
      if (!pointBuffer) {
          pointBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 0.0]), gl.STATIC_DRAW);
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_Position);

      // Pass the color to the fragment shader
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

      // Pass the size of the point
      gl.uniform1f(u_Size, size);

      // Draw the point
      gl.drawArrays(gl.POINTS, 0, 1);
  }
}

// Shared buffer for points
let pointBuffer = null;
