# Vuex原理

> 参考
>
> [Vuex源码](https://github.com/vuejs/vuex)
>
> 《了解VUEX原理》作者：Nordon [掘金](https://juejin.cn/post/6844904081119510536)
>
> 《Vue最全知识点，面试必备》作者：阿李卑斯[掘金](https://juejin.cn/post/6844903709055401991)
>
> 《遇见面试 Vuex原理解析》作者：凌晨四点半er [掘金](https://juejin.cn/post/6844903950290944007)



## 什么是Vuex

- Vuex 是一个专为 Vue.js 应用程序开发的状态管理模式。
- 每一个 Vuex 应用的核心就是 store（仓库）。“store” 基本上就是一个容器，它包含着你的应用中大部分的状态 ( state )。

- Vuex 的状态存储是响应式的。当 Vue 组件从 store 中读取状态的时候，若 store 中的状态发生变化，那么相应的组件也会相应地得到高效更新。
- 改变 store 中的状态的唯一途径就是显式地提交 (commit) mutation。这样使得我们可以方便地跟踪每一个状态的变化。



Vuex采用MVC模式中的Model层，规定所有的数据必须通过action ---> mutaion ---> state这个流程进行来改变状态的。再结合Vue的数据视图双向绑定实现页面的更新。

统一页面状态管理，可以让复杂的组件交互变的简单清晰，同时在调试时也可以通过devtools去查看状态。



## use

在`vue`中使用插件时，会调用`Vue.use(Vuex)`将插件进行处理，此过程会通过`mixin`在各个组件中的生命钩子`beforeCreate`中为每个实例增加`$store`属性

![](https://user-gold-cdn.xitu.io/2019/2/28/1693337567150fac?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### install

在`vue`项目中，使用`vuex`进行数据管理，首先做的就是将`vuex`引入并`Vue.use(Vuex)`

```javascript
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
```



在执行`Vue.use(Vuex)`时，会触发`vuex`中暴露出来的方法`install`进行初始化，并且会将`Vue`作为形参传递。方法在`/src/store.js`中暴露

> 所有的`vue`插件都会暴露一个`install`方法，**用于初始化一些操作**

```javascript
// vuex/src/store.js
let Vue // bind on install

export function install (_Vue) {
  // 容错判断
  if (Vue && _Vue === Vue) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        '[vuex] already installed. Vue.use(Vuex) should be called only once.'
      )
    }
    return
  }
  Vue = _Vue // 只初始化赋值一次--单例模式
  applyMixin(Vue)
}
```

首先会在`store`中定义一个变量`Vue`，用来接受`Vue`实例。

`install`函数中，首先会判断是否已经调用了`Vue.use(Vuex)`，然后调用`applyMixin`方法进行初始化的一些操作

**总结**：

`install`方法仅仅做了一个容错处理，然后调用`applyMixin`，`Vue`赋值。



### applyMixin

`applyMixin`方法在`/src/mixin`中暴露，该方法只做了一件事情，就是将所有的实例上挂载一个`$store`对象。

```javascript
// vuex/src/mixin
export default function (Vue) {
  // 获取当前的vue版本号
  const version = Number(Vue.version.split('.')[0])

  // 若是2以上的vue版本，直接通过mixin进行挂载$store
  if (version >= 2) {
    // 在每个实例beforeCreate的时候进行挂载$store
    Vue.mixin({ beforeCreate: vuexInit })
  } else {
    // vue 1.x版本处理 省略...
  }

  function vuexInit () {
    // 1. 获取每个组件实例的选项
    const options = this.$options

  // 2. 检测options.store是否存在
    if (options.store) {
      // 下面详细说明
      this.$store = typeof options.store === 'function'
        ? options.store()
        : options.store
    } else if (options.parent && options.parent.$store) {
      // 检测当前组件实例的父组件是够存在，并且其父组件存在$store
      // 存在，则为当前组件实例挂载$store属性
      this.$store = options.parent.$store
    }
  }
}
```

**难点**在于理解`this.$store = typeof options.store === 'function' ? options.store() : options.store`做了什么事



在使用`vuex`的时候，会将`store`挂载在根组件之上

```javascript
import Vue from 'vue'
import App from './App'
import store from './store'

new Vue({
  el: '#app',
  store,
  render: h => h(App)
})
```

在第一次调用`vuexInit`函数时，`options.store`就是根选项的`store`，因此会判断其类型是不是`function`，若是则执行函数并将结果赋值给根实例的`$store`中，否则直接赋值。



**总结**：

整个`mixin`文件做的事情，就是利用`mixin`在各个实例的生命钩子`beforeCreate`中为其增加属性`$store`并为其赋值，保证在每个实例中都可以直接通过`this.$store`获取数据和行为。



## Module

`module`模块主要的功能：是将我们定义的`store`根据一定的规则转化为一颗树形结构，在实例化`Store`的时候执行，会将其得到的树形结构赋值给`this._modules`，后续会基于这颗树进行操作。



### 树形结构

首先，在`vuex`中定义一些状态和模块，观察其转化的树形结构

```javascript
const state = {
  count: 0
}

const getters = {
}

const mutations = {
}

const actions = {
}

const modules = {
  moduleA:{
    state: {
      a: 'module a'
    },
    modules: {
      moduleB:{
        state: {
          b: 'module b'
        }
      }
    }
  },
  moduleC: {
    state: {
      c: 'module c'
    }
  }
}

export default new Vuex.Store({
  modules,
  state,
  getters,
  actions,
  mutations
})
```

`vuex`在获取到定义的状态和模块，会将其格式化成一个树形结构，后续的很多操作都是基于这颗树形结构进行操作和处理，可以在任意一个使用的组件中打印`this.$store._modules.root`观察其结构

![](https://user-gold-cdn.xitu.io/2020/3/4/170a44320c45dd34?imageslim)



格式化之后的树形结构，每一层级都会包含`state`、`_rawModule`、`_children`三个主要属性

树形节点结构

```javascript
{
  state:{},
  _rawModule:{},
  _children: {}
}
```



#### state

根模块会将自身还有其包含的全部子模块`state`数据按照模块的层级按照树级结构放置，根模块的`state`会包含自身以及所有的子模块数据，子模块的`state`会包含自身以及其子模块的数据。

```javascript
{
  state: {
  count: 0,
    moduleA: {
      a: 'module a',
        moduleB: {
          b: 'module b'
        }
    },
    moduleC: {
      c: 'module c'
    }
  }
}
```



#### _rawModule

每一层树形结构都会包含一个`_rawModule`节点，就是在调用`store`初始化的时候传入的`options`，根上的`_rawModule`就是初始化时的所有选项，子模块上就是各自初始化时使用的`options`。

```javascript
{
  modules:{},
  state:{},
  getters:{},
  actions:{},
  mutations:{}
}
```



#### _children

`_children`会将当前模块以及其子模块按照约定的树形结构进行格式化，放在其父或者跟组件的`_children`中，键名就是其模块名。

```javascript
{
  moduleA:{
    state: {},
    _rawModule:{},
    _children:{
      moduleB:{
        state: {},
        _rawModule:{},
        _children:{}
      },
    }
  },
  moduleC:{
    state: {},
    _rawModule:{},
    _children:{}
  }
}
```



**总结**：

根据调用`store`初始化时传入的参数，在其内部将其转化为一个树形结构，可以通过`this.$store._modules.root`查看



### 转化

知道了转化处理之后的树形结构，接下来看看`vuex`中是如何通过代码处理的。

在`src/module`文件夹中，存在`module-collection.js`和`module.js`两个文件，主要通过`ModuleCollection`和`Module`两个类进行模块收集。



#### Module

`Module`的主要作用就是根据设计好的树形节点结构生成对应的节点结构，实例化之后会生成一个基础的数据结构，并在其原型上定一些操作方法供实例调用。

```javascript
// vuex/src/module/module.js 
import { forEachValue } from '../util'

export default class Module {
  constructor (rawModule, runtime) {
    // 是否为运行时 默认为true
    this.runtime = runtime
    // _children 初始化是一个空对象
    this._children = Object.create(null)
    // 将初始化vuex的时候 传递的参数放入_rawModule
    this._rawModule = rawModule
    // 将初始化vuex的时候 传递的参数的state属性放入state
    const rawState = rawModule.state
    this.state = (typeof rawState === 'function' ? rawState() : rawState) || {}
  }

  // _children 初始化是一个空对象，为其增加子模块
  addChild (key, module) {
    this._children[key] = module
  }
  
  // 根据 key，获取对应的模块
  getChild (key) {
    return this._children[key]
  }
}
```



#### ModuleCollection

结合`Module`用来生成树形结构

```javascript
// src/module/module-collection.js
import Module from './module'
import { forEachValue } from '../util'

export default class ModuleCollection {
  constructor (rawRootModule) {
    // 根据options 注册模块
    this.register([], rawRootModule, false)
  }
 
  // 利用 reduce，根据 path 找到此时子模块对应的父模块
  get (path) {
    return path.reduce((module, key) => {
      return module.getChild(key)
    }, this.root)
  }

  register (path, rawModule, runtime = true) {
    // 初始化一个节点
    const newModule = new Module(rawModule, runtime)
    
    if (path.length === 0) { // 根节点， 此时 path 为 []
      this.root = newModule
    } else { // 子节点处理
      // 1. 找到当前子节点对应的父
      // path ==> [moduleA, moduleC]
      // path.slice(0, -1) ==> [moduleA]
      // get ==> 获取到moduleA
      const parent = this.get(path.slice(0, -1))
      // 2. 调用 Module 的 addChild 方法，为其 _children 增加节点
      parent.addChild(path[path.length - 1], newModule)
    }

    // 若是存在子模块，则会遍历递归调用 register
    if (rawModule.modules) {
      forEachValue(rawModule.modules, (rawChildModule, key) => {
        this.register(path.concat(key), rawChildModule, runtime)
      })
    }
  }
}
```

1. 初始化`ModuleCollection`时传递的实参为`new Vuex.Store({....options})`中的`options`，此时的`rawRootModule`就是`options`，接下来的操作都是基于`rawRootModule`进行

   `options`的数据结构简写

   ```javascript
   {
     modules: {
       moduleA:{
         modules: {
           moduleB:{
           }
         }
       },
       moduleC: {
       }
     }
   }
   ```

2. 执行`this.register([], rawRootModule, false)`

   `[]`对应形参`path`，保存的是当前模块的层级路径，例如`moduleB`对应的路径`["moduleA", "moduleB"]`

   `rawRootModule`对应形参`rawModule`，代表在初始化参数`options`中对应的数据，例如`moduleA`对应的`rawModule`为：

   ```javascript
   moduleA:{
     state: {
       a: 'module a'
     },
     mutations:{
       incrementA: ({ commit }) => commit('increment'),
       decrementA: ({ commit }) => commit('decrement'),
     },
     modules: {
       moduleB:{
         state: {
           b: 'module b'
         }
       }
     }
   }
   ```

3. 每次执行`register`时都会实例化`Module`，生成一个树形的节点`newModule`，之后便是通过判断`path`的长度来决定`newModule`放置的位置，第一次执行`register`时`path`为`[]`，则直接将`newModule`赋值给`this.root`，其余情况，便是通过`path`找到当前节点对应的父节点并将其放置在`_children`中

4. 判断`rawModule.modules`是否存在，若是存在子模块，便遍历`rawModule.modules`进行递归调用`register`进行递归处理，最终会生成一个期望的树形结构。



## Store

在`store`中会对定义的`state`，`mutations`，`actions`，`getters`等进行处理。

首先看看`Store`的整体结构

```javascript
class Store {
  constructor (options = {}) {}

  get state () {}

  set state (v) {}

  commit (_type, _payload, _options) {}

  dispatch (_type, _payload) {}

  subscribe (fn) {}

  subscribeAction (fn) {}

  watch (getter, cb, options) {}

  replaceState (state) {}

  registerModule (path, rawModule, options = {}) {}

  unregisterModule (path) {}

  hotUpdate (newOptions) {}

  _withCommit (fn) {}
}
```

在使用`vuex`中，会看到常用的方法和属性都定义在`store`类中，接下来通过完善类中的内容逐步的实现主要功能。



### State

在模块中定义的`state`通过`vux`之后处理之后，便可以在`vue`中通过`$store.state.xxx`使用，且当数据变化时会驱动视图更新。

首先会在`store`中进行初始化

```javascript
class Store {
  constructor(options) {
    // 定义一些内部的状态  ....
    this._modules = new ModuleCollection(options)
    const state = this._modules.root.state
    // 初始化根模块，会递归注册所有的子模块
    installModule(this, state, [], this._modules.root)
    // 初始化 store、vm
    resetStoreVM(this, state)
  }

  // 利用类的取值函数定义state，其实取的值是内部的_vm上的数据，代理模式
  get state() {
    return this._vm._data.$state
  }

  _withCommit (fn) {
    fn()
  }
}
```

首先会执行`installModule`，递归调用，会将所有的子模块的数据进行注册，函数内部会进行递归调用自身进行对子模块的属性进行便利，最终会将所有子模块的模块名作为键，模块的`state`作为对应的值，模块的嵌套层级进行嵌套，最终生成所期望的数据嵌套结构。

```javascript
{
  count: 0,
  moduleA: {
    a: "module a",
    moduleB: {
      b: "module b"
    }
  },
  moduleC: {
    c: "module c"
  }
}
```



`installModule`关于处理`state`的核心代码如下

```javascript
/**
 * @param {*} store 整个store
 * @param {*} rootState 当前的根状态
 * @param {*} path 为了递归使用的，路径的一个数组
 * @param {*} module 从根模块开始安装
 * @param {*} hot 
 */
function installModule (store, rootState, path, module, hot) {
  const isRoot = !path.length // 是不是根节点

  // 设置 state
  // 非根节点的时候 进入，
  if (!isRoot && !hot) {
    // 1. 获取到当前模块的父模块
    const parentState = getNestedState(rootState, path.slice(0, -1))
    // 2. 获取当前模块的模块名
    const moduleName = path[path.length - 1]
    // 3. 调用 _withCommit ，执行回调
    store._withCommit(() => {
      // 4. 利用Vue的特性，使用 Vue.set使刚设置的键值也具备响应式，否则Vue监控不到变化
      Vue.set(parentState, moduleName, module.state)
    })
  }

  // 递归处理子模块的state
  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child, hot)
  })
}
```

将`state`处理成期望的结构之后，会结合`resetStoreVM`对`state`进行处理，若是直接在`Store`中定义变量`state`，外面可以获取到，但是当修改了之后并不能利用的`vue`的数据绑定驱动视图的更新。所以利用`vue`的特性，将`vue`的实例放置在`_vm`上，然后利用类的取值函数获取。

当使用`$store.state.count`的时候，会先根据类的取值函数`get state`进行取值，取值函数内部返回的就是`resetStoreVM`所赋值`_vm`，结合`vue`进行响应适处理。

```javascript
function resetStoreVM(store, state) {
  store._vm = new Vue({
    data: {
      $state: state
    }
  })
}
```



### Mutations

在`vuex`中，对于同步修改数据状态时，推荐使用`mutations`进行修改，不推荐直接使用`this.$store.state.xxx = xxx`进行修改，可以开启严格模式`strict: true`进行处理。

`vuex`对于`mutations`的处理，分为两部分，第一步是在`installModule`时将所有模块的`mutations`收集订阅，第二步在`Store`暴露`commit`方法发布执行所对应的方法。



#### 订阅

首先在`Store`中处理增加一个`_mutations`属性

```javascript
constructor(options){
 // 创建一个_mutations 空对象，用于收集各个模块中的 mutations
 this._mutations = Object.create(null)
}
```

在`installModule`中递归调用地处理所有的`mutations`

```javascript
const local = module.context = makeLocalContext(store, '', path)
// 处理 mutations
module.forEachMutation((mutation, key) => {
  registerMutation(store, key, mutation, local)
})
```

在`registerMutation`函数中进行对应的`nutations`收集

```javascript
// 注册 mutations 的处理 -- 订阅
function registerMutation (store, type, handler, local) {
  const entry = store._mutations[type] || (store._mutations[type] = [])
  entry.push(function wrappedMutationHandler (payload) {
    handler.call(store, local.state, payload)
  })
}
```

此时所有模块的`mutations`都会被订阅在`_mutations`中，只需要在调用执行时找到对应的`mutations`进行遍历执行，这里使用一个数组收集订阅，因为在`vuex`中，定义在不同模块中的同名`mutations`都会被依次执行，所以需要使用数组订阅，并遍历调用，因此也建议在使用`vuex`的时候，若项目具有一定的复杂度和体量，建议使用命名空间`namespaced: true`，可以减少不必要的重名`mutations`全部被执行，导致不可控的问题出现。



`makeLocalContext`函数将`vuex`的选项进行处理，省略开启命名空间的代码，主要是将`getters` 和 `state`进行劫持处理。

```javascript
function makeLocalContext (store, namespace, path) {
  const local = {
    dispatch: store.dispatch,
    commit: store.commit
  }

  // getters 和 state 必须是懒获取，因为他们的修改会通过vue实例的更新而变化
  Object.defineProperties(local, {
    getters: {
      get: () => store.getters
    },
    state: {
      get: () => getNestedState(store.state, path)
    }
  })

  return local
}
```



#### 发布

收集订阅完成之后，需要`Store`暴露一个方法用于触发发布，执行相关的函数修改数据状态。

首先在`Store`类上定义一个`commit`方法

```javascript
{
  // 触发 mutations
  commit (_type, _payload, _options) {
    // 1. 区分不同的调用方式 进行统一处理
    const {
      type,
      payload,
      options
    } = unifyObjectStyle(_type, _payload, _options)

    // 2. 获取到对应type的mutation方法，便利调用
    const entry = this._mutations[type]
    this._withCommit(() => {
      entry.forEach(function commitIterator (handler) {
        handler(payload)
      })
    })
  }
}
```

但是在源码中，外界调用时并不是直接调用类上的`commit`方法，而是在构造`constructor`中重写的`commit`

```javascript
constructor(options){
 // 1. 获取 commit 方法
  const { commit } = this
  // 2. 使用箭头函数和call 保证this的指向
  this.commit = (type, payload, options) => {
   return commit.call(this, type, payload, options)
  }
} 
```

`unifyObjectStyle`方法做了一个参数格式化的处理，调用 `mutations` 可以使用`this.$store.commit('increment', payload)`和`this.$store.commit({type: 'increment', payload})`两种方式，`unifyObjectStyle`函数就是为了将不同的参数格式化成一种情况，`actions`同理。

```javascript
function unifyObjectStyle (type, payload, options) {
  if (isObject(type) && type.type) {
    options = payload
    payload = type
    type = type.type
  }

  return { type, payload, options }
}
```



### Actions

`actions`用于处理异步数据改变，`mutations`用于处理同步数据改变。

两者的区别主要在于是否是异步处理数据，因此两者在实现上具备很多的共通性，首先将所有的`actions`进行订阅收集，然后暴露方法发布执行。



#### 订阅

首先在`Store`中处理增加一个`_actions`属性

```javascript
constructor(options){
 // 创建一个 _actions 空对象，用于收集各个模块中的 actions
 this._actions = Object.create(null)
}
```

在`installModule`中递归调用的处理所有的`actions`

```javascript
const local = module.context = makeLocalContext(store, '', path)
// 处理actions
module.forEachAction((action, key) => {
 const type = action.root ? key : '' + key
 const handler = action.handler || action
 registerAction(store, type, handler, local)
})
```

在`registerAction`函数中进行对应的`actions`收集

```javascript
// 注册 actions 的处理
function registerAction (store, type, handler, local) {
  const entry = store._actions[type] || (store._actions[type] = [])
  // actions 和 mutations 在执行时，第一个参数接受到的不一样 
  entry.push(function wrappedActionHandler (payload) {
    let res = handler.call(store, {
      dispatch: local.dispatch,
      commit: local.commit,
      getters: local.getters,
      state: local.state,
      rootGetters: store.getters,
      rootState: store.state
    }, payload)
    
    // 判断是否时Promise
    if (!isPromise(res)) {
      res = Promise.resolve(res)
    }
    
    return res
  })
}
```



#### 发布

`actions`的发布执行，和`mutations`处理方式一致，区别在于`dispatch`方法需要多做一些处理

```javascript
// 触发 actipns
dispatch (_type, _payload) {
  // check object-style dispatch
  const {
    type,
    payload
  } = unifyObjectStyle(_type, _payload)

  const action = { type, payload }
  const entry = this._actions[type]

 // 若是多个，则使用Promise.all()，否则执行一次
  const result = entry.length > 1
    ? Promise.all(entry.map(handler => handler(payload)))
    : entry[0](payload)
 
  // 拿到执行结果 进行判断处理
  return result.then(res => {
    try {
      this._actionSubscribers
        .filter(sub => sub.after)
        .forEach(sub => sub.after(action, this.state))
    } catch (e) {}
    return res
  })
}
```



## 其他

#### 什么情况下使用 Vuex？

- 如果应用够简单，最好不要使用 Vuex，一个简单的 store 模式即可
- 需要构建一个中大型单页应用时，使用Vuex能更好地在组件外部管理状态



#### Vuex和单纯的全局对象有什么区别？

- Vuex 的状态存储是响应式的。当 Vue 组件从 store 中读取状态的时候，若 store 中的状态发生变化，那么相应的组件也会相应地得到高效更新。
- 不能直接改变 store 中的状态。改变 store 中的状态的唯一途径就是显式地提交 (commit) mutation。这样使得我们可以方便地跟踪每一个状态的变化，从而让我们能够实现一些工具帮助我们更好地了解我们的应用。



#### 为什么 Vuex 的 mutation 中不能做异步操作？

- Vuex中所有的状态更新的唯一途径都是mutation，异步操作通过 Action 来提交 mutation实现，这样使得我们可以方便地跟踪每一个状态的变化，从而让我们能够实现一些工具帮助我们更好地了解我们的应用。
- 每个mutation执行完成后都会对应到一个新的状态变更，这样devtools就可以打个快照存下来，然后就可以实现 time-travel 了。如果mutation支持异步操作，就没有办法知道状态是何时更新的，无法很好的进行状态的追踪，给调试带来困难。



#### vuex的action有返回值吗？返回的是什么？

- store.dispatch 可以处理被触发的 action 的处理函数返回的 Promise，并且 store.dispatch 仍旧返回 Promise
- Action 通常是异步的，要知道 action 什么时候结束或者组合多个 action以处理更加复杂的异步流程，可以通过定义action时返回一个promise对象，就可以在派发action的时候就可以通过处理返回的 Promise处理异步流程

> 一个 store.dispatch 在不同模块中可以触发多个 action 函数。在这种情况下，只有当所有触发函数完成后，返回的 Promise 才会执行。



#### 为什么不直接分发mutation,而要通过分发action之后提交 mutation变更状态

- mutation 必须同步执行，我们可以在 action 内部执行异步操作
- 可以进行一系列的异步操作，并且通过提交 mutation 来记录 action 产生的副作用（即状态变更）