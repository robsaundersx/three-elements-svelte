import { Recording } from "./Recording.js";

function createRecordingStore(_filename, cb) {
  let _recording = new Recording();
  _recording.load(_filename, () => {
    cb(_filename);
    dispatch();
  });
  const subs = [];

  const available = () => {
    return _recording.available;
  };

  const filename = () => {
    return _recording.filename;
  };

  const subscribe = (cb) => {
    subs.push(cb);
    if (available()) cb(_recording.get());

    return () => {
      const index = subs.findIndex((fn) => fn === cb);
      subs.splice(index, 1);
    };
  };

  const dispatch = () => {
    console.log(_recording.get());
    subs.forEach((fn) => fn(_recording.get()));
  };

  const set = (t) => {
    _recording.setIndex(t);
    dispatch();
  };

  const step = (dt) => () => {
    _recording.step(dt);
    dispatch();
  };

  const rewind = () => {
    _recording.rewind();
    dispatch();
  };

  return { subscribe, set, step, rewind, filename, available };
}

export const recording = createRecordingStore;
