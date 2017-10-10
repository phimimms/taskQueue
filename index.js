export default class TaskQueue {
  constructor() {
    this._isDestroyed = false;
    this._isPerformingTasks = false;
    this._tasks = [];
  }

  append(...args) {
    this._tasks.push(...args);

    if (!this._isPerformingTasks) {
      this._performTasks();
    }
  }

  destroy() {
    this._isDestroyed = true;
    this._isPerformingTasks = false;
    this._tasks = null;
  }

  _performTasks(arg) {
    const task = this._tasks.pop();

    if (typeof task !== 'function') {
      if (this._tasks.length) {
        this._performTasks(arg);
      }
      return;
    }

    this._isPerformingTasks = true;

    Promise.resolve(task(arg))
      .then((val) => {
        if (this._isDestroyed) {
          return;
        }

        if (this._tasks.length) {
          this._performTasks(val);
        }

        this._isPerformingTasks = false;
      });
  }
}
