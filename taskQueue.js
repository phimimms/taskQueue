module.exports = function TaskQueue() {
    /**
     * Indicates whether the task queue has been destroyed
     * @type    {Boolean}
     */
    this.isDestroyed = false;

    /**
     * The queue of functions to invoke
     * @type    {Promise}
     * @private
     */
    this._queue = Promise.resolve();

    /**
     * Appends the function arguments to the task queue in the given order
     * @type    {Function}
     * @return  {Promise}
     */
    this.append = function() {
        for (var i = 0, n = arguments.length; i < n; i++) {
            if (typeof arguments[i] !== 'function') {
                continue;
            }
            this._queue = this._queue.then(function(cb, val) {
                if (this.isDestroyed) {
                    return val;
                }
                return cb(val);
            }.bind(this, arguments[i]));
        }

        return this._queue;
    };

    /**
     * Dereferences instance properties and methods
     * @type    {Function}
     */
    this.destroy = function() {
        this.isDestroyed = true;

        this.append = undefined;
        this.destroy = undefined;
        this._queue = undefined;
    };
};
