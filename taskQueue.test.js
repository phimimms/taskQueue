var expect = require('expect');
var TaskQueue = require('./taskQueue')

describe('Task Queue', function() {
    it('Append() Returns Promise', function() {
        var t = new TaskQueue();

        var p = t.append(function() {});

        expect(p).toBeA(Promise, 'append() did not return a Promise');
    });

    it('Append() with No Arguments', function(done) {
        var t = new TaskQueue();

        t.append().then(function() {
            done();
        });
    });

    it('Append() with Immediate Return Value', function(done) {
        var t = new TaskQueue();

        t.append(function() {
            return 42;
        }).then(function(value) {
            expect(value).toEqual(42, 'An unexpected value was passed to the append() Promise');
            done();
        });
    });

    it('Append() with Promise Return Value', function(done) {
        var t = new TaskQueue();

        t.append(function() {
            return Promise.resolve(42);
        }).then(function(value) {
            expect(value).toEqual(42, 'An unexpected value was passed to the append() Promise');
            done();
        });
    });

    it('Append() with Multiple Function Arguments', function(done) {
        var t = new TaskQueue();

        t.append(
            function() {
                return 31;
            },
            function(value) {
                expect(value).toEqual(31, 'An unexpected value was passed to the second function argument');
                return 42;
            },
            function(value) {
                expect(value).toEqual(42, 'An unexpected value was passed to the third function argument');
                return 53;
            }
        ).then(function(value) {
            expect(value).toEqual(53, 'An unexpected value was passed to the append() resolution handler');
            done();
        })
    });

    it('Append() with Non-Function Arguments', function(done) {
        var t = new TaskQueue();

        t.append(
            undefined,
            null,
            42,
            'some string',
            function() {
                return 42;
            },
            ['some array'],
            Promise.resolve()
        ).then(function(value) {
            expect(value).toEqual(42, 'An unexpected value was passed to the append() resolution handler');
            done();
        });
    });

    it('Append() in Function Argument', function(done) {
        var t = new TaskQueue();

        var order = 1;

        var appendToQueue = function() {
            return t.append(function() {
                expect(order++).toEqual(3, 'The third callback was invoked in an unexpected order');
                done();
            });
        };

        t.append(
            function() {
                expect(order++).toEqual(1, 'The first callback was invoked in an unexpected order');
                appendToQueue();
            },
            function() {
                expect(order++).toEqual(2, 'The second callback was invoked in an unexpected order');
            }
        )
    });

    it('Multiple Append() Invocations', function(done) {
        var t = new TaskQueue();

        var order = 1;

        t.append(
            function() {
                expect(order++).toEqual(1, 'The first callback was invoked in an unexpected order');
            },
            function() {
                expect(order++).toEqual(2, 'The second callback was invoked in an unexpected order');
            }
        );

        t.append(function() {
            expect(order++).toEqual(3, 'The third callback was invoked in an unexpected order');
            done();
        });
    });

    it('Destroy Task Queue', function() {
        var t1 = new TaskQueue();

        t1.destroy();

        expect(t1.isDestroyed).toExist('isDestroyed was not updated');
        expect(t1.append).toEqual(undefined, 'append() was not dereferenced');
        expect(t1.destroy).toEqual(undefined, 'destroy() was not dereferenced');
        expect(t1._queue).toEqual(undefined, '_queue was not dereferenced');

        var t2 = new TaskQueue();
        expect(t2.isDestroyed).toNotExist('Task Queue instantiated as destroyed');
    });

    it('Destroy() Cancels Pending Functions', function(done) {
        var t = new TaskQueue();

        t.append(
            function() {
                t.destroy();
                return 42;
            },
            function() {
                expect(false).toExist('The canceled function was still invoked');
            }
        ).then(function(value) {
            expect(value).toEqual(42, 'An unexpected value was passed to the append() resolution handler');
            done();
        })
    });
});
