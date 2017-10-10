import expect from 'expect';

import TaskQueue from './taskQueue';

describe('Task Queue', () => {
  it('Append() Returns Promise', () => {
    const t = new TaskQueue();

    const p = t.append(() => {});

    expect(p).toBeA(Promise, 'append() did not return a Promise');
  });

  it('Append() with No Arguments', (done) => {
    const t = new TaskQueue();

    t.append().then(() => done());
  });

  it('Append() with Immediate Return Value', (done) => {
    const t = new TaskQueue();

    t.append(() => 42)
      .then((value) => {
        expect(value).toEqual(42, 'An unexpected value was passed to the append() Promise');
        done();
      });
  });

  it('Append() with Promise Return Value', (done) => {
    const t = new TaskQueue();

    t.append(() => Promise.resolve(42))
      .then((value) => {
        expect(value).toEqual(42, 'An unexpected value was passed to the append() Promise');
        done();
      });
  });

  it('Append() with Multiple Function Arguments', (done) => {
    const t = new TaskQueue();

    t.append(
      () => 31,
      (value) => {
        expect(value).toEqual(31, 'An unexpected value was passed to the second function argument');
        return 42;
      },
      (value) => {
        expect(value).toEqual(42, 'An unexpected value was passed to the third function argument');
        return 53;
      }
    ).then((value) => {
      expect(value).toEqual(53, 'An unexpected value was passed to the append() resolution handler');
      done();
    });
  });

  it('Append() with Non-Function Arguments', (done) => {
    const t = new TaskQueue();

    t.append(
      undefined,
      null,
      42,
      'some string',
      () => 42,
      ['some array'],
      Promise.resolve()
    ).then((value) => {
      expect(value).toEqual(42, 'An unexpected value was passed to the append() resolution handler');
      done();
    });
  });

  it('Append() in Function Argument', (done) => {
    const t = new TaskQueue();

    let order = 1;

    const appendToQueue = () => {
      return t.append(() => {
        expect(order++).toEqual(3, 'The third callback was invoked in an unexpected order');
        done();
      });
    };

    t.append(
      () => {
        expect(order++).toEqual(1, 'The first callback was invoked in an unexpected order');
        appendToQueue();
      },
      () => {
        expect(order++).toEqual(2, 'The second callback was invoked in an unexpected order');
      }
    );
  });

  it('Multiple Append() Invocations', (done) => {
    const t = new TaskQueue();

    let order = 1;

    t.append(
      () => {
        expect(order++).toEqual(1, 'The first callback was invoked in an unexpected order');
      },
      () => {
        expect(order++).toEqual(2, 'The second callback was invoked in an unexpected order');
      }
    );

    t.append(() => {
      expect(order++).toEqual(3, 'The third callback was invoked in an unexpected order');
      done();
    });
  });

  it('Destroy Task Queue', () => {
    const t1 = new TaskQueue();

    t1.destroy();

    expect(t1.isDestroyed).toExist('isDestroyed was not updated');
    expect(t1.append).toEqual(undefined, 'append() was not dereferenced');
    expect(t1.destroy).toEqual(undefined, 'destroy() was not dereferenced');
    expect(t1._queue).toEqual(undefined, '_queue was not dereferenced');

    const t2 = new TaskQueue();
    expect(t2.isDestroyed).toNotExist('Task Queue instantiated as destroyed');
  });

  it('Destroy() Cancels Pending Functions', (done) => {
    const t = new TaskQueue();

    t.append(
      () => {
        t.destroy();
        return 42;
      },
      () => {
        expect(false).toExist('The canceled function was still invoked');
      }
    ).then((value) => {
      expect(value).toEqual(42, 'An unexpected value was passed to the append() resolution handler');
      done();
    });
  });
});
