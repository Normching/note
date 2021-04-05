// 先定义三个常量表示状态
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';
// 新建 MyPromise 类
class MyPromise {
  constructor(executor) {
    // executor是一个执行器，进入会立即执行
    // 并传入 resolve 和 reject 方法    
    try {
      executor(this.resolve, this.reject);
    } catch (error) {
      // 发生错误时，直接执行reject
      this.reject(error)
    }
  }

  // 存储状态的变量，初始值是 pending
  status = PENDING;
  // 成功之后的值
  value = null;
  // 失败之后的值
  reason = null;
  // 存储成功回调函数
  onFulfilledCallbacks = [];
  // 存储失败回调函数
  onRejectedCallbacks = [];

  // resolve 和 reject 使用箭头函数让this指向当前实例对象
  // 更改成功后的状态
  resolve = (value) => {
    // 只有状态是等待，才执行状态修改
    if (this.status === PENDING) {
      // 状态修改为成功
      this.status = FULFILLED;
      // 保存成功之后的值
      this.value = value;
      // resolve里面将所有成功的回调拿出来执行
      while (this.onFulfilledCallbacks.length) {
        this.onFulfilledCallbacks.shift()(value);
      }
    }
  }

  // 更改失败后的状态
  reject = (reason) => {
    if (this.status === PENDING) {
      // 状态修改为失败
      this.status = REJECTED;
      // 保存失败的原因
      this.reason = reason;
      // reject里面将所有失败的回调拿出来执行
      while (this.onRejectedCallbacks.length) {
        this.onRejectedCallbacks.shift()(reason);
      }
    }
  }

  then(onFulfilled, onRejected) {
    // 参数不传，就使用默认函数
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason };

    // 为了链式调用在这里直接创建一个 MyPromise，并在后面 return 出去
    const promise2 = new MyPromise((resolve, reject) => {
      const fulfilledMicrotask = () => {
        // 创建一个微任务等待 promise2 完成初始化
        queueMicrotask(() => {
          try {
            // 获取成功回调函数的执行结果
            const x = onFulfilled(this.value);
            // 传入 resolvePromise 集中处理
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            // 发生错误时，直接执行reject
            reject(error);
          }
        });
      }

      const rejectedMicrotask = () => {
        // 创建一个微任务等待 promise2 完成初始化
        queueMicrotask(() => {
          try {
            // 调用失败回调，并把原因返回
            const x = onRejected(this.reason);
            // 传入 resolvePromise 集中处理
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      }

      // 这里的内容在执行器中，会立即执行
      if (this.status === FULFILLED) {
        fulfilledMicrotask();
      } else if (this.status === REJECTED) {
        rejectedMicrotask();
      } else if (this.status === PENDING) {
        // 因为不知道后面状态的变化情况，所以将成功回调和失败回调存起来
        // 等到执行成功或失败函数的时候再传递
        this.onFulfilledCallbacks.push(fulfilledMicrotask);
        this.onRejectedCallback.push(rejectedMicrotask);
      }
    })
    return promise2;
  }

  // resolve 静态方法
  static resolve(parameter) {
    // 如果传入的 MyPromise 就直接返回
    if (parameter instanceof MyPromise) {
      return parameter;
    }

    // 转成常规方法
    return new MyPromise(resolve => {
      resolve(parameter);
    });
  }

  // reject 静态方法
  static reject(reason) {
    return new MyPromise((resolve, reject) => {
      reject(reason);
    });
  }
}

function resolvePromise(promise, x, resolve, reject) {
  if (promise2 === x) {
    // 如果相等了，说明return的是自己，抛出类型错误并返回
    return reject(new TypeError('The promise and the return value are the same'));
  }

  if (typeof x === 'object' || typeof x === 'function') {
    // x 为 null 直接返回
    if (x === null) {
      return resolve(x);
    }

    let then;
    try {
      // 把 x.then 赋值给 then
      then = x.then;
    } catch (error) {
      // 如果获取 x.then 的值时抛出错误 error ， 则以 error 为由拒绝 promise
      return reject(error);
    }

    // 如果 then 是函数
    if (typeof then === 'function') {
      let called = fase;
      try {
        then.cal(
          x, // this指向x
          y => { // 如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)
            // 如果 resolvePromise 和 rejectPromise 均被调用，
            // 或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
            // 实现这条需要前面加一个变量 called
            if (called) return;
            called = true;
            resolvePromise(promise, y, resolve, reject);
          },
          r => { // 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
            if (called) return;
            called = true;
            reject(r);
          });
      } catch (error) {
        // 如果调用 then 方法抛出了异常 error：
        // 如果 resolvePromise 或 rejectPromise 已经被调用，直接返回
        if (called) return;
        // 否则以error为由拒绝promise
        reject(error);
      }
    } else {
      // 如果 then 不是函数，以 x 为参数执行 promise
      resolve(x);
    }
  } else {
    // 如果 x 不为对象或者函数，以 x 为参数执行promise
    resolve(x);
  }
}

module.exports = MyPromise