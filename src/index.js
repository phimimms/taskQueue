export default class TaskQueue {
  constructor() {
    /**
     * Indicates whether the task queue is destroyed.
     * @type  {boolean}
     */
    this._isDestroyed = false;

    /**
     * Indicates whether the task queue is actively running tasks.
     * @type  {boolean}
     */
    this._isRunningTasks = false;

    /**
     * The list of asynchronous functions to be invoked in sequential order.
     * @type  {Array.<Function>}
     */
    this._tasks = [];
  }

  /**
   * Appends the provided list of functions to the task queue.
   * @param {Array.<Function>}  args  A list of functions to be invoked in sequential order.
   */
  addTasks(...args) {
    if (this._isDestroyed) {
      return;
    }

    this._tasks.push(...args);

    if (!this._isRunningTasks) {
      this._runTasks();
    }
  }

  /**
   * Appends the provided list of functions to the task queue.
   * @param {Array.<Function>}  args  A list of functions to be invoked in sequential order.
   * @deprecated
   */
  append(...args) {
    this.addTasks(args);
  }

  /**
   * Dereferences instance properties.
   */
  destroy() {
    this._isDestroyed = true;
    this._isRunningTasks = false;
    this._tasks = null;
  }

  /**
   * Invokes the list of functions.
   * @param {*} arg The resolution value of the previous task.
   * @private
   */
  _runTasks(arg) {
    const task = this._tasks.shift();

    if (typeof task !== 'function') {
      if (this._tasks.length) {
        this._runTasks(arg);
        return;
      }

      this._isRunningTasks = false;
      return;
    }

    this._isRunningTasks = true;

    Promise.resolve(task(arg))
      .then((val) => {
        if (this._isDestroyed) {
          return;
        }

        if (this._tasks.length) {
          return this._runTasks(val);
        }

        this._isRunningTasks = false;
      });
  }
}
