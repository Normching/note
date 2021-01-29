var PENDING = 'pending';
var FULFILLED = 'fulfilled';
var REJECTED = 'rejected';

function Promise(execute) {
  var that = this;
  that.state = PENDING;
  that.onFulfilledFn = [];
  that.onRejectedFn = [];

  function resolve(value) {
    setTimeout(function () {
      if (that.state === PENDING) {
        that.state = FULFILLED;
        that.value = value;
        that.onFulfilledFn.forEach(function (fn) { 
          fn(that.value);
         });
      }
    });
    
  }
  function reject(reason) {
    setTimeout(function () {
      if (that.state === PENDING) {
        that.state = REJECTED;
        that.reason = reason;
        that.onRejectedFn.forEach(function (fn) { 
          fn(that.reason);
         });
      }
    });
   
  }
  try {
    execute(resolve, reject);
  } catch (e) {
    reject(e);
  }
}
Promise.prototype.then = function (onFulfilled, onRejected) {
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : function (x) { return x; }
  onRejected = typeof onRejected === 'function' ? onRejected : function (e) { throw e; }

  var that = this;
  var promise;
  if (that.state === FULFILLED) {
    promise = new Promise(function (resolve, reject) {
      setTimeout(function () {
        try {
          onFulfilled(that.value);
        } catch (reason) {
          reject(reason);
        }
      });
    });
  }
  if (that.state === REJECTED) {
    promise = new Promise(function () {
      setTimeout(function () { 
        try {
          onRejected(that.reason);
        } catch (reason) {
          reject(reason);
        }
       });
     });
  }
  if (that.state === PENDING) {
    promise = new Promise(function (resolve, reject) {
      that.onFulfilledFn.push(function () { 
        try {
          onFulfilled(that.value);
        } catch (reason) {
          reject(reason);
        }
      });
      that.onRejectedFn.push(function () { 
        try {
          onRejected(that.reason);
        } catch (reason) {
          reject(reason);
        }
       });
    });
  }
}

// Promise 解决过程 resolvePromise()
function resolvePromise(promise, x, resolve, reject) {
  // x 等于 promise
  if (promise === x) {
    return reject(new TypeError('x 不能等于 promise'));
  }
  // x 是 promise 的实例
  if (x instanceof Promise) {
    if (x.state === FULFILLED) {
      resolve(x.value);
    } else if (x.state === REJECTED) {
      reject(x.reason);
    } else {
      x.then(function (y) {
        resolvePromise(promise, y, resolve, reject);
      });
    }
  }
  // x 是对象或函数
  if ((x !== null) && ((typeof x === 'object') || (typeof x === 'function'))) {
    var executed;
    try {
      var then = x.then;
      if (typeof then === 'function') {
        then.call(x, function (y) { 
          if (executed) return;
          executed = true;
          return resolvePromise(promise, y, resolve, reject);
        }, function (e) {
            if (executed) return;
            executed = true;
            reject(e);
         });
      } else {
        resolve(x);
      }
    } catch (e) {
      if (executed) return;
      executed = true;
      reject(e);
    }
  }
  // 直接将 x 作为值执行
  resolve(x);
}