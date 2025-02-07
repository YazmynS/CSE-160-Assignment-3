class Camera {
    constructor(){
        this.eye = new Vector3([0, 0, 0]);
        this.at = new Vector3([0, 0, -1]);
        this.up = new Vector3([0, 1, 0]);
    }

    forward(){
        var f = this.at.subtract(this.eye);
        f = f.divide(f.length());
        this.at = this.at.add(f);
        this.eye = this.eye.add(f);
    }

    back(){
        var f = this.at.subtract(this.eye);
        f = f.divide(f.length());
        this.at = this.at.add(f);
        this.eye = this.eye.add(f);
    }

    left(){
        var f = this.at.subtract(this.eye);
        var l = f.cross(this.up);
        l = l.divide(l.length());
        this.at = this.at.add(l);
        this.eye = this.eye.add(l);
    }

    right(){
        var f = this.at.subtract(this.eye);
        var l = f.cross(this.up);
        l = l.divide(l.length());
        this.at = this.at.add(l);
        this.eye = this.eye.add(l);
    }
}