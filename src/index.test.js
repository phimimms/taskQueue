import expect from 'expect';

import TaskQueue from './index';

describe('Task Queue', () => {
  it('addTasks() Returns Promise', () => {
    const t = new TaskQueue();

    const p = t.addTasks(() => {});

    expect(p).toBeA(Promise, 'addTasks() did not return a Promise');
  });

  it('addTasks() with No Arguments', (done) => {
    const t = new TaskQueue();

    t.addTasks().then(() => done());
  });

  it('addTasks() with Immediate Return Value', (done) => {
    const t = new TaskQueue();

    t.addTasks(() => 42)
      .then((value) => {
        expect(value).toEqual(42, 'An unexpected value was passed to the addTasks() Promise');
        done();
      });
  });

  it('addTasks() with Promise Return Value', (done) => {
    const t = new TaskQueue();

    t.addTasks(() => Promise.resolve(42))
      .then((value) => {
        expect(value).toEqual(42, 'An unexpected value was passed to the addTasks() Promise');
        done();
      });
  });

  it('addTasks() with Multiple Function Arguments', (done) => {
    const t = new TaskQueue();

    t.addTasks(
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
      expect(value).toEqual(53, 'An unexpected value was passed to the addTasks() resolution handler');
      done();
    });
  });

  it('addTasks() with Non-Function Arguments', (done) => {
    const t = new TaskQueue();

    t.addTasks(
      undefined,
      null,
      42,
      'some string',
      () => 42,
      ['some array'],
      Promise.resolve()
    ).then((value) => {
      expect(value).toEqual(42, 'An unexpected value was passed to the addTasks() resolution handler');
      done();
    });
  });

  it('addTasks() in Function Argument', (done) => {
    const t = new TaskQueue();

    let order = 1;

    const addTasksToQueue = () => {
      return t.addTasks(() => {
        expect(order++).toEqual(3, 'The third callback was invoked in an unexpected order');
        done();
      });
    };

    t.addTasks(
      () => {
        expect(order++).toEqual(1, 'The first callback was invoked in an unexpected order');
        addTasksToQueue();
      },
      () => {
        expect(order++).toEqual(2, 'The second callback was invoked in an unexpected order');
      }
    );
  });

  it('Multiple addTasks() Invocations', (done) => {
    const t = new TaskQueue();

    let order = 1;

    t.addTasks(
      () => {
        expect(order++).toEqual(1, 'The first callback was invoked in an unexpected order');
      },
      () => {
        expect(order++).toEqual(2, 'The second callback was invoked in an unexpected order');
      }
    );

    t.addTasks(() => {
      expect(order++).toEqual(3, 'The third callback was invoked in an unexpected order');
      done();
    });
  });

  it('Destroy Task Queue', () => {
    const t1 = new TaskQueue();

    t1.destroy();

    expect(t1._isDestroyed).toEqual(true, '_isDestroyed was not updated');
    expect(t1._tasks).toEqual(null, '_tasks was not dereferenced');

    const t2 = new TaskQueue();
    expect(t2._isDestroyed).toEqual(false, 'The subsequent task queue instantiated as destroyed');
  });

  it('Destroy() Cancels Pending Functions', (done) => {
    const t = new TaskQueue();

    t.addTasks(
      () => {
        t.destroy();
        return 42;
      },
      () => {
        expect(false).toExist('The canceled function was still invoked');
      }
    ).then((value) => {
      expect(value).toEqual(42, 'An unexpected value was passed to the addTasks() resolution handler');
      done();
    });
  });
});
