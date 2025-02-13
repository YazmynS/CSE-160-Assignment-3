class Camera {
    constructor() {
        this.eye = [0, 0, 3];   // Camera position
        this.at = [0, 0, -100]; // Where the camera is looking
        this.up = [0, 1, 0];    // Up direction

        this.direction = [0, 0]; // Shared movement vector
    }

    move(speed, direction) {
        // Compute movement direction once
        this.direction[0] = this.at[0] - this.eye[0]; // forwardX
        this.direction[1] = this.at[2] - this.eye[2]; // forwardZ

        let length = Math.sqrt(this.direction[0] ** 2 + this.direction[1] ** 2);
        if (length > 0) {
            this.direction[0] /= length;
            this.direction[1] /= length;
        }

        let nextX = this.eye[0] + this.direction[0] * speed * direction;
        let nextZ = this.eye[2] + this.direction[1] * speed * direction;

        if (!checkCollision(nextX, nextZ)) {
            this.eye[0] = nextX;
            this.eye[2] = nextZ;
        }
    }

    forward(speed) { this.move(speed, 1); } // Move forward
    back(speed) { this.move(speed, -1); }  // Move backward

    left(speed) {
        let rightX = this.at[2] - this.eye[2]; // Compute perpendicular vector
        let rightZ = -(this.at[0] - this.eye[0]);

        let length = Math.sqrt(rightX ** 2 + rightZ ** 2);
        if (length > 0) {
            rightX /= length;
            rightZ /= length;
        }

        let nextX = this.eye[0] - rightX * speed;
        let nextZ = this.eye[2] - rightZ * speed;

        if (!checkCollision(nextX, nextZ)) {
            this.eye[0] = nextX;
            this.eye[2] = nextZ;
        }
    }

    right(speed) {
        let rightX = this.at[2] - this.eye[2]; // Compute perpendicular vector
        let rightZ = -(this.at[0] - this.eye[0]);

        let length = Math.sqrt(rightX ** 2 + rightZ ** 2);
        if (length > 0) {
            rightX /= length;
            rightZ /= length;
        }

        let nextX = this.eye[0] + rightX * speed;
        let nextZ = this.eye[2] + rightZ * speed;

        if (!checkCollision(nextX, nextZ)) {
            this.eye[0] = nextX;
            this.eye[2] = nextZ;
        }
    }

    rotate(angleDegrees) {
        let angleRadians = angleDegrees * Math.PI / 180;
        let dx = this.at[0] - this.eye[0];
        let dz = this.at[2] - this.eye[2];

        let newDx = dx * Math.cos(angleRadians) - dz * Math.sin(angleRadians);
        let newDz = dx * Math.sin(angleRadians) + dz * Math.cos(angleRadians);

        this.at[0] = this.eye[0] + newDx;
        this.at[2] = this.eye[2] + newDz;
    }
}
