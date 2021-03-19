class MyPromise {
  constructor(fn) {
    this.resolvedCallBacks = [];
    this.rejectedCallBacks = [];

    this.state = 'PENDING';
    this.value = '';

    fn(this.resolve.bind(this), this.reject.bind(this));
  }

  resolve(value) {
    if (this.state === 'PENDING') {
      this.state = 'RESOLVED';
      this.value = value

      this.resolvedCallBacks.map(cb => cb(value));
    }
  }

  reject(value) {
    if (this.state === 'PENDING') {
      this.state = 'REJECTED';
      this.value = value

      this.rejectedCallBacks.map(cb => cb(value));
    }
  }

  then(onFulfilled, onRejected) {
    if (this.state === 'PENDING') {
      this.resolvedCallBacks.push(onFulfilled);
      this.rejectedCallBacks.push(onRejected);
    }
    if (this.state === 'RESOLVED') {
      onFulfilled(this.value)
    }
    if (this.state === 'REJECTED') {
      onRejected(this.value)
    }
  }
}