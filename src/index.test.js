import expect from 'expect';

import TaskQueue from './index';

describe('Task Queue', () => {
  it('addTasks() with Immediate Return Value', (done) => {
    const t = new TaskQueue();

    t.addTasks(
      () => 42,
      (value) => {
        expect(value).toEqual(42, 'An unexpected value was passed to the second function argument');
        done();
      });
  });

  it('addTasks() with Promise Return Value', (done) => {
    const t = new TaskQueue();

    t.addTasks(
      () => Promise.resolve(42),
      (value) => {
        expect(value).toEqual(42, 'An unexpected value was passed to the second function argument');
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
        done();
      }
    );
  });

  it('addTasks() with Non-Function Arguments', (done) => {
    const t = new TaskQueue();

    t.addTasks(
      () => 31,
      undefined,
      null,
      42,
      'some string',
      (value) => {
        expect(value).toEqual(31, 'An unexpected value was passed to the second function argument');
        return 42;
      },
      ['some array'],
      Promise.resolve(),
      (value) => {
        expect(value).toEqual(42, 'An unexpected value was passed to the third function argument');
        done();
      },
    );
  });

  it('addTasks() in Function Argument', (done) => {
    const t = new TaskQueue();

    let order = 1;

    function addTasksToQueue() {
      return t.addTasks(() => {
        expect(order++).toEqual(3, 'The third callback was invoked in an unexpected order');
        done();
      });
    }

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

  it('Destroy() Cancels Pending Functions', () => {
    const t = new TaskQueue();

    t.addTasks(
      () => {
        t.destroy();
        return 42;
      },
      () => {
        expect(false).toExist('The canceled function was still invoked');
      }
    );
  });
});
