# nextTick



## 源码分析

### nextTick

```javascript
// /src/core/util/next-tick.js
const callbacks = []
let pending = false
let timerFunc

export function nextTick (cb?: Function, ctx?: Object) {
  let _resolve
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  if (!pending) {
    pending = true
    timerFunc()
  }
  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
```

首先找到`nextTick`这个函数定义的地方，看看它具体做了什么操作

在外层定义了三个变量，其中 `callbacks` ，就是所说的队列；

在 `nextTick` 的外层定义变量就形成了一个闭包，所以我们每次调用 `$nextTick` 的过程其实就是在向 `callbacks` 新增回调函数的过程；

`callbacks` 新增回调函数后又执行了 `timerFunc` 函数，`pending`用来标识同一个时间只能执行一次。



### timerFunc

再看看 `timerFunc` 函数是做什么用的

```javascript
export let isUsingMicroTask = false
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  //判断1：是否原生支持Promise
  const p = Promise.resolve()
  timerFunc = () => {
    p.then(flushCallbacks)
    if (isIOS) setTimeout(noop)
  }
  isUsingMicroTask = true
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) ||
  MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {
  //判断2：是否原生支持MutationObserver
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
  isUsingMicroTask = true
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  //判断3：是否原生支持setImmediate
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  //判断4：上面都不行，直接用setTimeout
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}
```

代码做了四个判断，对当前环境进行不断的降级处理，尝试使用原生的`Promise.then`、`MutationObserver`和`setImmediate`，上述三个都不支持最后使用 `setTimeout` ；

降级处理的目的都是将`flushCallbacks`函数放入微任务(判断1和判断2)或者宏任务(判断3和判断4)，等待下一次事件循环时来执行。

`MutationObserver`是H5的一个新特性，用来监听目标DOM结构是否改变，也就是代码中新建的 `textNode`；如果改变了就执行 `MutationObserver` 构造函数中的回调函数，不过是它是在微任务中执行的。

> `isNative`函数，是用来判断所传参数是否在当前环境原生就支持；
>
> 例如某些浏览器不支持Promise，虽然我们使用了垫片(polify)，但是isNative(Promise)还是会返回false。



### flushCallbacks 

```javascript
function flushCallbacks () {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}
```

它所做的事情也非常的简单，把 `callbacks` 数组复制一份，然后把 `callbacks` 置为空，最后把复制出来的数组中的每个函数依次执行一遍；

所以它的作用仅仅是用来执行 `callbacks` 中的回调函数。



### 总结

整体 `nextTick` 代码的流程就是：

1. 把回调函数放入 `callbacks` 等待执行
2. 将执行函数放到微任务或者宏任务中
3. 事件循环到了微任务或者宏任务，执行函数依次执行 `callbacks` 中的回调



### 其他

nextTick一般情况下总是先于setTimeout执行

```javascript
setTimeout(()=>{
    console.log(1)
}, 0)
this.$nextTick(()=>{
    console.log(2)
})
this.$nextTick(()=>{
    console.log(3)
})
//运行结果 2 3 1
```



## queueWatcher

当定义 `watch`监听数据变化时，实际上会被Vue这样调用`vm.$watch(keyOrFn, handler, options)`。

`$watch`是我们初始化的时候，为`vm`绑定的一个函数，用于创建`Watcher`对象。



那么看看`Watcher`中是如何处理`handler`的：

```javascript
this.deep = this.user = this.lazy = this.sync = false
...
  update () {
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) {
      this.run()
    } else {
      queueWatcher(this)
    }
  }
...
```

初始设定`this.deep = this.user = this.lazy = this.sync = false`，也就是当触发`update`更新的时候，会去执行`queueWatcher`方法

```javascript
const queue: Array<Watcher> = []
let has: { [key: number]: ?true } = {}
let waiting = false
let flushing = false
...
export function queueWatcher (watcher: Watcher) {
  const id = watcher.id
  if (has[id] == null) {
    has[id] = true
    if (!flushing) {
      queue.push(watcher)
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      let i = queue.length - 1
      while (i > index && queue[i].id > watcher.id) {
        i--
      }
      queue.splice(i + 1, 0, watcher)
    }
    // queue the flush
    if (!waiting) {
      waiting = true
      nextTick(flushSchedulerQueue)
    }
  }
}
```

`nextTick(flushSchedulerQueue)`中的`flushSchedulerQueue`函数其实就是`watcher`的视图更新:

```javascript
function flushSchedulerQueue () {
  flushing = true
  let watcher, id
  ...
 for (index = 0; index < queue.length; index++) {
    watcher = queue[index]
    id = watcher.id
    has[id] = null
    watcher.run()
    ...
  }
}
```

另外，关于`waiting`变量，这是很重要的一个标志位，它保证`flushSchedulerQueue`回调只允许被置入`callbacks`一次。



根据响应式触发`setter -> Dep -> Watcher -> update -> run`

如果这时候没有异步更新视图，那么每次操作DOM更新视图，这是非常消耗性能的。 

所以Vue实现了一个`queue`队列，在下一个Tick（或者是当前Tick的微任务阶段）的时候会统一执行`queue`中`Watcher`的run。

同时，拥有相同id的Watcher不会被重复加入到该queue中去，所以不会执行多次Watcher的run。

最终更新视图只会直接操作一次DOM。 保证更新视图操作DOM的动作是在当前栈执行完以后下一个Tick（或者是当前Tick的微任务阶段）的时候调用，大大优化了性能。