class Cube {
  constructor(M, color) {
      this.type = 'cube';
      this.color = color;
      this.matrix = M;
  }

  render() {
      const rgba = this.color;

      // Pass the color of a point to u_FragColor variable
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      // Front of the Cube
      //drawTriangle3DUV([0.0, 0.0, 0.0,     1.0, 0.0, 0.0,     1.0, 1.0, 0.0]);
      drawTriangle3D([0.0, 0.0, 0.0,     1.0, 1.0, 0.0,     1.0, 0.0, 0.0]);
      drawTriangle3D([0.0, 0.0, 0.0,     0.0, 1.0, 0.0,     1.0, 1.0, 0.0]);

      // Top of the Cube
      gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
      drawTriangle3D([0.0, 1.0, 0.0,     0.0, 1.0, 1.0,     1.0, 1.0, 1.0]);
      drawTriangle3D([0.0, 1.0, 0.0,     1.0, 1.0, 1.0,     1.0, 1.0, 0.0]);

      // Side of Cube
      gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
      drawTriangle3D([0.0, 0.0, 0.0,     0.0, 1.0, 0.0,     0.0, 1.0, 1.0]);
      drawTriangle3D([0.0, 0.0, 0.0,     0.0, 1.0, 1.0,     0.0, 0.0, 1.0]);

      // Bottom of the Cube
      gl.uniform4f(u_FragColor, rgba[0] * 0.7, rgba[1] * 0.7, rgba[2] * 0.7, rgba[3]);
      drawTriangle3D([0.0, 0.0, 0.0,     1.0, 0.0, 0.0,     1.0, 0.0, 1.0]);
      drawTriangle3D([0.0, 0.0, 0.0,     1.0, 0.0, 1.0,     0.0, 0.0, 1.0]);

      // Back of the Cube
      gl.uniform4f(u_FragColor, rgba[0] * 0.6, rgba[1] * 0.6, rgba[2] * 0.6, rgba[3]);
      drawTriangle3D([0.0, 0.0, 1.0,     1.0, 0.0, 1.0,     1.0, 1.0, 1.0]);
      drawTriangle3D([0.0, 0.0, 1.0,     1.0, 1.0, 1.0,     0.0, 1.0, 1.0]);

      // Other side of the Cube
      gl.uniform4f(u_FragColor, rgba[0] * 0.5, rgba[1] * 0.5, rgba[2] * 0.5, rgba[3]);
      drawTriangle3D([1.0, 0.0, 0.0,     1.0, 1.0, 0.0,     1.0, 1.0, 1.0]);
      drawTriangle3D([1.0, 0.0, 0.0,     1.0, 1.0, 1.0,     1.0, 0.0, 1.0]);
  }
}
