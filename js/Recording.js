import { Matrix4, Quaternion, Vector3 } from "three";

class Recording {
  constructor() {
    this.filename = "";
    this.available = false;
    this.paths = {};
    this.indexMillis = 0;
    this.startMillis = 0;
    this.endMillis = 0;
    this.durationMillis = 0;
    this.framesPerSecond = 0;
    this.looping = true;
  }

  available() {
    return this.available;
  }

  getAt(timeMillis) {
    let state = {};
    for (const [id, path] of Object.entries(this.paths)) {
      state[id] = path.get(timeMillis - this.startMillis);
    }
    return state;
  }

  get() {
    return this.getAt(this.indexMillis);
  }

  rewind() {
    this.setIndex(this.startMillis);
  }

  step(deltaMillis) {
    this.setIndex(this.indexMillis + deltaMillis);
  }

  getIndex() {
    return this.indexMillis;
  }

  setIndex(_indexMillis) {
    if (this.looping) {
      this.indexMillis = Math.max(this.startMillis, _indexMillis); // Avoid looping backwards
      while (this.indexMillis >= this.endMillis) {
        this.indexMillis -= this.durationMillis;
      }
    } else {
      this.indexMillis = Math.min(
        Math.max(_indexMillis, this.startMillis),
        this.endMillis
      );
    }
  }

  parseTimestamp(date, time) {
    const time_items = time.split(":");
    const hours = parseInt(time_items[0], 10);
    const minutes = parseInt(time_items[1], 10);
    const second_items = time_items[2].split(",");
    const seconds = parseInt(second_items[0], 10);
    const milliseconds = parseInt(second_items[1], 10);
    return ((hours * 60 + minutes) * 60 + seconds) * 1000 + milliseconds;
  }

  load(filename, callback) {
    this.available = false;
    this.filename = filename;
    fetch("./" + filename)
      .then((response) => response.text())
      .then((data) => {
        let lines = data.split("\n");
        for (const line of lines) {
          if (line.length < 1) continue;
          const line_items = line.split(" ");
          const timestampMillis = this.parseTimestamp(
            line_items[0],
            line_items[1]
          );
          const id = line_items[2];
          if (id.startsWith("START")) {
            this.startMillis = timestampMillis;
            this.framesPerSecond = parseFloat(line_items[3]);
          } else if (id.startsWith("END")) {
            this.endMillis = timestampMillis;
            this.durationMillis = this.endMillis - this.endMillis;
          } else {
            let delta = timestampMillis - this.startMillis;
            if (!(id in this.paths)) {
              this.paths[id] = new TimeSeries();
              delta = 0;
            }
            const i = line_items;
            let m = new Matrix4();
            // prettier-ignore
            m.set(i[3],  i[4],  i[5],  i[6],
                  i[7],  i[8],  i[9],  i[10],
                  i[11], i[12], i[13], i[14],
                  0.000, 0.000, 0.000, 1.000);
            if (id.startsWith("tracker")) {
              let t = new Matrix4();
              //t.makeTranslation(0, -(0.5 + 0.375), 0);
              m.premultiply(t);
            }
            this.paths[id][delta] = m;
            this.endMillis = timestampMillis;
            this.durationMillis = this.endMillis - this.startMillis;
          }
        }
        this.indexMillis = this.startMillis;
        this.available = true;
        callback(this);
      });
  }
}

class TimeSeries extends Array {
  getIndex(t) {
    var index = t;
    if (!this[index]) {
      this.some((_, i) => {
        if (i > t) {
          return true;
        } else {
          index = i;
        }
      });
    }
    return index;
  }

  get(t) {
    // Early bail-out if the request coincies with a recorded time step
    if (this[t]) return this[t];
    // Calculate the linear interpolation of two matrices
    let lowerTime = t;
    let lowerMatrix = this[t];
    let upperTime = t;
    let upperMatrix = this[t];
    this.some((v, i) => {
      if (i > t) {
        upperTime = i;
        upperMatrix = v;
        return true;
      } else {
        lowerTime = i;
        lowerMatrix = v;
      }
    });
    if (!upperMatrix) return lowerMatrix;
    // Calculate in-between matrix
    // Decompose, lerp/slerp and recompose lower/upper matrices
    let lowerPosition = new Vector3();
    let lowerQuaternion = new Quaternion();
    let lowerScale = new Vector3();
    lowerMatrix.decompose(lowerPosition, lowerQuaternion, lowerScale);
    let upperPosition = new Vector3();
    let upperQuaternion = new Quaternion();
    let upperScale = new Vector3();
    upperMatrix.decompose(upperPosition, upperQuaternion, upperScale);
    let delta = (t - lowerTime) / (upperTime - lowerTime);
    let midPosition = new Vector3();
    midPosition.lerpVectors(lowerPosition, upperPosition, delta);
    let midQuaternion = new Quaternion();
    Quaternion.slerp(lowerQuaternion, upperQuaternion, midQuaternion, delta);
    let midScale = new Vector3();
    midScale.lerpVectors(lowerScale, upperScale, delta);
    let midMatrix = new Matrix4();
    midMatrix.compose(midPosition, midQuaternion, midScale);
    return midMatrix;
  }
}

export { Recording };
