class Camera {
    constructor() {
        this.eye = [0, 0, 3];   // Camera position
        this.at = [0, 0, -100]; // Where the camera is looking
        this.up = [0, 1, 0];    // Up direction
    }

    forward(speed) {
        let forwardX = this.at[0] - this.eye[0];
        let forwardZ = this.at[2] - this.eye[2];
        let length = Math.sqrt(forwardX * forwardX + forwardZ * forwardZ);

        if (length > 0) {
            forwardX /= length;
            forwardZ /= length;
        }

        let nextX = this.eye[0] + forwardX * speed;
        let nextZ = this.eye[2] + forwardZ * speed;

        if (!checkCollision(nextX, nextZ)) {
            this.eye[0] = nextX;
            this.eye[2] = nextZ;
        }
    }

    back(speed) {
        let forwardX = this.at[0] - this.eye[0];
        let forwardZ = this.at[2] - this.eye[2];
        let length = Math.sqrt(forwardX * forwardX + forwardZ * forwardZ);

        if (length > 0) {
            forwardX /= length;
            forwardZ /= length;
        }

        let nextX = this.eye[0] - forwardX * speed;
        let nextZ = this.eye[2] - forwardZ * speed;

        if (!checkCollision(nextX, nextZ)) {
            this.eye[0] = nextX;
            this.eye[2] = nextZ;
        }
    }

    left(speed) {
        let forwardX = this.at[0] - this.eye[0];
        let forwardZ = this.at[2] - this.eye[2];
        let rightX = -forwardZ;
        let rightZ = forwardX;
        let length = Math.sqrt(rightX * rightX + rightZ * rightZ);

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
        let forwardX = this.at[0] - this.eye[0];
        let forwardZ = this.at[2] - this.eye[2];
        let rightX = -forwardZ;
        let rightZ = forwardX;
        let length = Math.sqrt(rightX * rightX + rightZ * rightZ);

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
