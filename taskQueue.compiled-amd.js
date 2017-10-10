define(['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var TaskQueue = function () {
    function TaskQueue() {
      _classCallCheck(this, TaskQueue);

      this._isDestroyed = false;
      this._isPerformingTasks = false;
      this._tasks = [];
    }

    _createClass(TaskQueue, [{
      key: 'append',
      value: function append() {
        var _tasks;

        (_tasks = this._tasks).push.apply(_tasks, arguments);

        if (!this._isPerformingTasks) {
          this._performTasks();
        }
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        this._isDestroyed = true;
        this._isPerformingTasks = false;
        this._tasks = null;
      }
    }, {
      key: '_performTasks',
      value: function _performTasks(arg) {
        var _this = this;

        var task = this._tasks.pop();

        if (typeof task !== 'function') {
          if (this._tasks.length) {
            this._performTasks(arg);
          }
          return;
        }

        this._isPerformingTasks = true;

        Promise.resolve(task(arg)).then(function (val) {
          if (_this._isDestroyed) {
            return;
          }

          if (_this._tasks.length) {
            _this._performTasks(val);
          }

          _this._isPerformingTasks = false;
        });
      }
    }]);

    return TaskQueue;
  }();

  exports.default = TaskQueue;
});
