/*
 * @file: 
 * @Date: 2020-07-28 09:12:03
 * @author: manyao.zhu
 */ 
// import helper from '../helper';

export default class History {
  constructor() {
    this.undoItems = [];
    this.redoItems = [];
  }

  add(data) {
    // console.log(data)
    this.undoItems.push(data);
    this.redoItems = [];
  }

  canUndo() {
    return this.undoItems.length > 0;
  }

  canRedo() {
    return this.redoItems.length > 0;
  }

  undo(currentd, cb) {
    const { undoItems, redoItems } = this;
    if (this.canUndo()) {
      redoItems.push(currentd);
      cb(undoItems.pop());
    }
  }

  redo(currentd, cb) {
    const { undoItems, redoItems } = this;
    if (this.canRedo()) {
      undoItems.push(currentd);
      cb(redoItems.pop());
    }
  }
}
