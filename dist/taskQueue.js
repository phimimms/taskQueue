'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TaskQueue = function () {
  function TaskQueue() {
    _classCallCheck(this, TaskQueue);

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


  _createClass(TaskQueue, [{
    key: 'addTasks',
    value: function addTasks() {
      var _tasks;

      if (this._isDestroyed) {
        return;
      }

      (_tasks = this._tasks).push.apply(_tasks, arguments);

      if (!this._isRunningTasks) {
        this._runTasks();
      }
    }

    /**
     * Appends the provided list of functions to the task queue.
     * @param {Array.<Function>}  args  A list of functions to be invoked in sequential order.
     * @deprecated
     */

  }, {
    key: 'append',
    value: function append() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      this.addTasks(args);
    }

    /**
     * Dereferences instance properties.
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      this._isDestroyed = true;
      this._isRunningTasks = false;
      this._tasks = null;
    }

    /**
     * Invokes the list of functions.
     * @param {*} arg The resolution value of the previous task.
     * @private
     */

  }, {
    key: '_runTasks',
    value: function _runTasks(arg) {
      var _this = this;

      var task = this._tasks.shift();

      if (typeof task !== 'function') {
        if (this._tasks.length) {
          this._runTasks(arg);
          return;
        }

        this._isRunningTasks = false;
        return;
      }

      this._isRunningTasks = true;

      Promise.resolve(task(arg)).then(function (val) {
        if (_this._isDestroyed) {
          return;
        }

        if (_this._tasks.length) {
          return _this._runTasks(val);
        }

        _this._isRunningTasks = false;
      });
    }
  }]);

  return TaskQueue;
}();

exports.default = TaskQueue;
