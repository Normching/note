# nextTick



## 源码分析

### nextTick

```javascript
const callbacks = []
let pending = false

/**
 * 完成两件事：
 *   1、用 try catch 包装 flushSchedulerQueue 函数，然后将其放入 callbacks 数组
 *   2、如果 pending 为 false，表示现在浏览器的任务队列中没有 flushCallbacks 函数
 *     如果 pending 为 true，则表示浏览器的任务队列中已经被放入了 flushCallbacks 函数，
 *     待执行 flushCallbacks 函数时，pending 会被再次置为 false，表示下一个 flushCallbacks 函数可以进入
 *     浏览器的任务队列了
 * pending 的作用：保证在同一时刻，浏览器的任务队列中只有一个 flushCallbacks 函数
 * @param {*} cb 接收一个回调函数 => flushSchedulerQueue
 * @param {*} ctx 上下文
 * @returns 
 */
export function nextTick (cb?: Function, ctx?: Object) {
  let _resolve
  // 用 callbacks 数组存储经过包装的 cb 函数
  callbacks.push(() => {
    if (cb) {
      // 用 try catch 包装回调函数，便于错误捕获
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
    // 执行 timerFunc，在浏览器的任务队列中（首选微任务队列）放入 flushCallbacks 函数
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
// 可以看到 timerFunc 的作用很简单，就是将 flushCallbacks 函数放入浏览器的异步任务队列中
let timerFunc
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  // 首选 Promise.resolve().then()
  timerFunc = () => {
    // 在 微任务队列 中放入 flushCallbacks 函数
    p.then(flushCallbacks)
    /**
     * 在有问题的UIWebViews中，Promise.then不会完全中断，但是它可能会陷入怪异的状态，
     * 在这种状态下，回调被推入微任务队列，但队列没有被刷新，直到浏览器需要执行其他工作，例如处理一个计时器。
     * 因此，我们可以通过添加空计时器来“强制”刷新微任务队列。
     */
    if (isIOS) setTimeout(noop)
  }
  isUsingMicroTask = true
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) ||
  // PhantomJS and iOS 7.x
  MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {
  // MutationObserver 次之
  // Use MutationObserver where native Promise is not available,
  // e.g. PhantomJS, iOS7, Android 4.4
  // (#6466 MutationObserver is unreliable in IE11)
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
  // 再就是 setImmediate，它其实已经是一个宏任务了，但仍然比 setTimeout 要好
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  // 最后没办法，则使用 setTimeout
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
const callbacks = []
let pending = false

/**
 * 做了三件事：
 *   1、将 pending 置为 false
 *   2、清空 callbacks 数组
 *   3、执行 callbacks 数组中的每一个函数（flushSchedulerQueue）
 */
function flushCallbacks () {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  // 遍历 callbacks 数组，执行其中存储的每个 flushSchedulerQueue 函数
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



## 异步更新

### dep.notify

```javascript
/**
 * 通知 dep 中的所有 watcher，执行 watcher.update() 方法
 */
notify () {
  // stabilize the subscriber list first
  const subs = this.subs.slice()
  // 遍历 dep 中存储的 watcher，执行 watcher.update()
  for (let i = 0, l = subs.length; i < l; i++) {
    subs[i].update()
  }
}
```



### watcher.update

```javascript
/**
 * 根据 watcher 配置项，决定接下来怎么走，一般是 queueWatcher
 */
update () {
  /* istanbul ignore else */
  if (this.lazy) {
    // 懒执行时走这里，比如 computed
    // 将 dirty 置为 true，可以让 computedGetter 执行时重新计算 computed 回调函数的执行结果
    this.dirty = true
  } else if (this.sync) {
    // 同步执行，在使用 vm.$watch 或者 watch 选项时可以传一个 sync 选项，
    // 当为 true 时在数据更新时该 watcher 就不走异步更新队列，直接执行 this.run 
    // 方法进行更新
    // 这个属性在官方文档中没有出现
    this.run()
  } else {
    // 更新时一般都这里，将 watcher 放入 watcher 队列
    queueWatcher(this)
  }
}
```



### queueWatcher

```javascript
const queue: Array<Watcher> = []
let has: { [key: number]: ?true } = {}
let waiting = false
let flushing = false
// ...
/**
 * 将 watcher 放入 watcher 队列 
 */
export function queueWatcher (watcher: Watcher) {
  const id = watcher.id
  // 如果 watcher 已经存在，则跳过，不会重复入队
  if (has[id] == null) {
    // 缓存 watcher.id，用于判断 watcher 是否已经入队
    has[id] = true
    if (!flushing) {
      // 当前没有处于刷新队列状态，watcher 直接入队
      queue.push(watcher)
    } else {
      // 已经在刷新队列了
      // 从队列末尾开始倒序遍历，根据当前 watcher.id 找到它大于的 watcher.id 的位置，然后将自己插入到该位置之后的下一个位置
      // 即将当前 watcher 放入已排序的队列中，且队列仍是有序的
      let i = queue.length - 1
      while (i > index && queue[i].id > watcher.id) {
        i--
      }
      queue.splice(i + 1, 0, watcher)
    }
    // queue the flush
    if (!waiting) {
      waiting = true

      if (process.env.NODE_ENV !== 'production' && !config.async) {
        // 直接刷新调度队列
        // 一般不会走这儿，Vue 默认是异步执行，如果改为同步执行，性能会大打折扣
        flushSchedulerQueue()
        return
      }
      /**
       * 熟悉的 nextTick => vm.$nextTick、Vue.nextTick
       *   1、将 回调函数（flushSchedulerQueue） 放入 callbacks 数组
       *   2、通过 pending 控制向浏览器任务队列中添加 flushCallbacks 函数
       */
      nextTick(flushSchedulerQueue)
    }
  }
}
```

`nextTick(flushSchedulerQueue)`中的`flushSchedulerQueue`函数其实就是`watcher`的视图更新:

```javascript
/**
 * Flush both queues and run the watchers.
 * 刷新队列，由 flushCallbacks 函数负责调用，主要做了如下两件事：
 *   1、更新 flushing 为 ture，表示正在刷新队列，在此期间往队列中 push 新的 watcher 时需要特殊处理（将其放在队列的合适位置）
 *   2、按照队列中的 watcher.id 从小到大排序，保证先创建的 watcher 先执行，也配合 第一步
 *   3、遍历 watcher 队列，依次执行 watcher.before、watcher.run，并清除缓存的 watcher
 */
function flushSchedulerQueue () {
  currentFlushTimestamp = getNow()
  // 标志现在正在刷新队列
  flushing = true
  let watcher, id

  /**
   * 刷新队列之前先给队列排序（升序），可以保证：
   *   1、组件的更新顺序为从父级到子级，因为父组件总是在子组件之前被创建
   *   2、一个组件的用户 watcher 在其渲染 watcher 之前被执行，因为用户 watcher 先于 渲染 watcher 创建
   *   3、如果一个组件在其父组件的 watcher 执行期间被销毁，则它的 watcher 可以被跳过
   * 排序以后在刷新队列期间新进来的 watcher 也会按顺序放入队列的合适位置
   */
  queue.sort((a, b) => a.id - b.id)

  // 这里直接使用了 queue.length，动态计算队列的长度，没有缓存长度，是因为在执行现有 watcher 期间队列中可能会被 push 进新的 watcher
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index]
    // 执行 before 钩子，在使用 vm.$watch 或者 watch 选项时可以通过配置项（options.before）传递
    if (watcher.before) {
      watcher.before()
    }
    // 将缓存的 watcher 清除
    id = watcher.id
    has[id] = null

    // 执行 watcher.run，最终触发更新函数，比如 updateComponent 或者 获取 this.xx（xx 为用户 watch 的第二个参数），当然第二个参数也有可能是一个函数，那就直接执行
    watcher.run()
  }

  // keep copies of post queues before resetting state
  const activatedQueue = activatedChildren.slice()
  const updatedQueue = queue.slice()

  /**
   * 重置调度状态：
   *   1、重置 has 缓存对象，has = {}
   *   2、waiting = flushing = false，表示刷新队列结束
   *     waiting = flushing = false，表示可以像 callbacks 数组中放入新的 flushSchedulerQueue 函数，并且可以向浏览器的任务队列放入下一个 flushCallbacks 函数了
   */
  resetSchedulerState()

  // call component updated and activated hooks
  callActivatedHooks(activatedQueue)
  callUpdatedHooks(updatedQueue)

  // devtool hook
  /* istanbul ignore if */
  if (devtools && config.devtools) {
    devtools.emit('flush')
  }
}

/**
 * Reset the scheduler's state.
 */
function resetSchedulerState () {
  index = queue.length = activatedChildren.length = 0
  has = {}
  if (process.env.NODE_ENV !== 'production') {
    circular = {}
  }
  waiting = flushing = false
}
```

另外，关于`waiting`变量，这是很重要的一个标志位，它保证`flushSchedulerQueue`回调只允许被置入`callbacks`一次。



### watcher.run

```javascript
/**
 * 由 刷新队列函数 flushSchedulerQueue 调用，如果是同步 watch，则由 this.update 直接调用，完成如下几件事：
 *   1、执行实例化 watcher 传递的第二个参数，updateComponent 或者 获取 this.xx 的一个函数(parsePath 返回的函数)
 *   2、更新旧值为新值
 *   3、执行实例化 watcher 时传递的第三个参数，比如用户 watcher 的回调函数
 */
run () {
  if (this.active) {
    // 调用 this.get 方法
    const value = this.get()
    if (
      value !== this.value ||
      // Deep watchers and watchers on Object/Arrays should fire even
      // when the value is the same, because the value may
      // have mutated.
      isObject(value) ||
      this.deep
    ) {
      // 更新旧值为新值
      const oldValue = this.value
      this.value = value

      if (this.user) {
        // 如果是用户 watcher，则执行用户传递的第三个参数 —— 回调函数，参数为 val 和 oldVal
        try {
          this.cb.call(this.vm, value, oldValue)
        } catch (e) {
          handleError(e, this.vm, `callback for watcher "${this.expression}"`)
        }
      } else {
        // 渲染 watcher，this.cb = noop，一个空函数
        this.cb.call(this.vm, value, oldValue)
      }
    }
  }
}
```



### watcher.get

```javascript
  /**
   * 执行 this.getter，并重新收集依赖
   * this.getter 是实例化 watcher 时传递的第二个参数，一个函数或者字符串，比如：updateComponent 或者 parsePath 返回的函数
   * 为什么要重新收集依赖？
   *   因为触发更新说明有响应式数据被更新了，但是被更新的数据虽然已经经过 observe 观察了，但是却没有进行依赖收集，
   *   所以，在更新页面时，会重新执行一次 render 函数，执行期间会触发读取操作，这时候进行依赖收集
   */
  get () {
    // 打开 Dep.target，Dep.target = this
    pushTarget(this)
    // value 为回调函数执行的结果
    let value
    const vm = this.vm
    try {
      // 执行回调函数，比如 updateComponent，进入 patch 阶段
      value = this.getter.call(vm, vm)
    } catch (e) {
      if (this.user) {
        handleError(e, vm, `getter for watcher "${this.expression}"`)
      } else {
        throw e
      }
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value)
      }
      // 关闭 Dep.target，Dep.target = null
      popTarget()
      this.cleanupDeps()
    }
    return value
  }
```



根据响应式触发`setter -> Dep -> Watcher -> update -> run`

如果这时候没有异步更新视图，那么每次操作DOM更新视图，这是非常消耗性能的。 

所以Vue实现了一个`queue`队列，在下一个Tick（或者是当前Tick的微任务阶段）的时候会统一执行`queue`中`Watcher`的run。

同时，拥有相同id的Watcher不会被重复加入到该queue中去，所以不会执行多次Watcher的run。

最终更新视图只会直接操作一次DOM。 保证更新视图操作DOM的动作是在当前栈执行完以后下一个Tick（或者是当前Tick的微任务阶段）的时候调用，大大优化了性能。



### 总结

**Vue 的异步更新机制是如何实现的？**

1. Vue 的异步更新机制的核心是利用了浏览器的异步任务队列来实现的，首选微任务队列，宏任务队列次之。
2. 当响应式数据更新后，会调用 dep.notify 方法，通知 dep 中收集的 watcher 去执行 update 方法，watcher.update 将 watcher 自己放入一个 watcher 队列（全局的 queue 数组）。
3. 然后通过 nextTick 方法将一个刷新 watcher 队列的方法（flushSchedulerQueue）放入一个全局的 callbacks 数组中。
4. 如果此时浏览器的异步任务队列中没有一个叫 flushCallbacks 的函数，则执行 timerFunc 函数，将 flushCallbacks 函数放入异步任务队列。如果异步任务队列中已经存在 flushCallbacks 函数，等待其执行完成以后再放入下一个 flushCallbacks 函数。
5. flushCallbacks 函数负责执行 callbacks 数组中的所有 flushSchedulerQueue 函数。
6. flushSchedulerQueue 函数负责刷新 watcher 队列，即执行 queue 数组中每一个 watcher 的 run 方法，从而进入更新阶段，比如执行组件更新函数或者执行用户 watch 的回调函数。

