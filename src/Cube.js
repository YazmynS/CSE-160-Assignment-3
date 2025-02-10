class Cube {
  constructor(M, color, textureNum = -2) {
      this.type = 'cube';
      this.color = color;
      this.matrix = M;
      this.textureNum = textureNum;
  }

  render() {
      const rgba = this.color;

      gl.uniform1i(u_whichTexture, this.textureNum);
      if(this.textureNum == -2){
        gl.bindTexture(gl.TEXTURE_2D, null);  // Unbind any textures
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]); // Ensure color is set!

      }

      // Pass the color of a point to u_FragColor variable
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      if (this.textureNum >= 0) { 
        //Note:
        //Left bottom (0,0)
        //Left top(1,0)
        //Right bottom(0,1)
        //Right top(1,1)
      
        // Front of the Cube
        drawTriangle3DUV([0,0,0, 1,1,0, 1,0,0],
                          [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0,0,0, 0,1,0, 1,1,0], 
                        [0,0, 0,1, 1,1]);
        // Top of the Cube
        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
        drawTriangle3DUV([0.0, 1.0, 0.0,     0.0, 1.0, 1.0,     1.0, 1.0, 1.0], [1, 0, 0, 1, 1, 1]);
        drawTriangle3DUV([0.0, 1.0, 0.0,     1.0, 1.0, 1.0,     1.0, 1.0, 0.0], [1, 0, 0, 1, 1, 1]);

        // Side of Cube
        gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
        drawTriangle3DUV([0.0, 0.0, 0.0,     0.0, 1.0, 0.0,     0.0, 1.0, 1.0], [1, 0, 0, 1, 1, 1]);
        drawTriangle3DUV([0.0, 0.0, 0.0,     0.0, 1.0, 1.0,     0.0, 0.0, 1.0], [1, 0, 0, 1, 1, 1]);

        // Bottom of the Cube
        gl.uniform4f(u_FragColor, rgba[0] * 0.7, rgba[1] * 0.7, rgba[2] * 0.7, rgba[3]);
        drawTriangle3DUV([0.0, 0.0, 0.0,     1.0, 0.0, 0.0,     1.0, 0.0, 1.0], [1, 0, 0, 1, 1, 1]);
        drawTriangle3DUV([0.0, 0.0, 0.0,     1.0, 0.0, 1.0,     0.0, 0.0, 1.0], [1, 0, 0, 1, 1, 1]);

        // Back of the Cube
        gl.uniform4f(u_FragColor, rgba[0] * 0.6, rgba[1] * 0.6, rgba[2] * 0.6, rgba[3]);
        drawTriangle3DUV([0.0, 0.0, 1.0,     1.0, 0.0, 1.0,     1.0, 1.0, 1.0], [1, 0, 0, 1, 1, 1]);
        drawTriangle3DUV([0.0, 0.0, 1.0,     1.0, 1.0, 1.0,     0.0, 1.0, 1.0], [1, 0, 0, 1, 1, 1]);

        // Other side of the Cube
        gl.uniform4f(u_FragColor, rgba[0] * 0.5, rgba[1] * 0.5, rgba[2] * 0.5, rgba[3]);
        drawTriangle3DUV([1.0, 0.0, 0.0,     1.0, 1.0, 0.0,     1.0, 1.0, 1.0], [1, 0, 0, 1, 1, 1]);
        drawTriangle3DUV([1.0, 0.0, 0.0,     1.0, 1.0, 1.0,     1.0, 0.0, 1.0], [1, 0, 0, 1, 1, 1]);
      }else
      {
        // Front of the Cube
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);  // Ensure color is set!
        drawTriangle3D([0,0,0, 1,1,0, 1,0,0],);
        drawTriangle3D([0,0,0, 0,1,0, 1,1,0]);
        // Top of the Cube
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3D([0.0, 1.0, 0.0,     0.0, 1.0, 1.0,     1.0, 1.0, 1.0]);
        drawTriangle3D([0.0, 1.0, 0.0,     1.0, 1.0, 1.0,     1.0, 1.0, 0.0]);

        // Side of Cube
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3D([0.0, 0.0, 0.0,     0.0, 1.0, 0.0,     0.0, 1.0, 1.0]);
        drawTriangle3D([0.0, 0.0, 0.0,     0.0, 1.0, 1.0,     0.0, 0.0, 1.0]);

        // Bottom of the Cube
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3D([0.0, 0.0, 0.0,     1.0, 0.0, 0.0,     1.0, 0.0, 1.0]);
        drawTriangle3D([0.0, 0.0, 0.0,     1.0, 0.0, 1.0,     0.0, 0.0, 1.0]);

        // Back of the Cube
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3D([0.0, 0.0, 1.0,     1.0, 0.0, 1.0,     1.0, 1.0, 1.0]);
        drawTriangle3D([0.0, 0.0, 1.0,     1.0, 1.0, 1.0,     0.0, 1.0, 1.0]);

        // Other side of the Cube
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3D([1.0, 0.0, 0.0,     1.0, 1.0, 0.0,     1.0, 1.0, 1.0]);
        drawTriangle3D([1.0, 0.0, 0.0,     1.0, 1.0, 1.0,     1.0, 0.0, 1.0]);
      }
    }
  }
