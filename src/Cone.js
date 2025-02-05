class Cone {
    constructor() {
        this.type = 'cone';
        this.color = [1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.segments = 36; // segments for cone's base
    }

    render() {
        const rgba = this.color;
        const segments = this.segments;
        const radius = 1.0;
        const height = 1.5;

        // Pass the color to the shader
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Cone tip
        const tip = [0.0, height, 0.0];

        // Generate vertices for the base of the cone
        const baseVertices = [];
        for (let i = 0; i < segments; i++) {
            const angle = (i * 2 * Math.PI) / segments;
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);
            baseVertices.push([x, 0.0, z]);
        }

        // Draw triangles connecting the tip to the base
        for (let i = 0; i < segments; i++) {
            const current = baseVertices[i];
            const next = baseVertices[(i + 1) % segments];

            // Side of the cone
            gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
            drawTriangle3D([tip[0], tip[1], tip[2],
                current[0], current[1], current[2],
                next[0], next[1], next[2]]);
        }

        // Draw the base of the cone
        for (let i = 0; i < segments; i++) {
            const current = baseVertices[i];
            const next = baseVertices[(i + 1) % segments];

            gl.uniform4f(u_FragColor, rgba[0] * 0.7, rgba[1] * 0.7, rgba[2] * 0.7, rgba[3]);
            drawTriangle3D([0.0, 0.0, 0.0,
                current[0], current[1], current[2],
                next[0], next[1], next[2]]);
        }
    }
}
