> 20+`Vue`题目
## 对 `Vue` 的理解
渐进式`JavaScript`框架、核心库加插件、动态创建用户界面（异步获取后台数据，数据展示在界面）  
特点：  
  `MVVM`模式；
  代码简洁体积小，运行效率高，适合移动、PC端开发；
  本身只关注`UI`，可以轻松引入`Vue`插件或其他的第三方库进行开发；


## 0.关于`MVVM`
`MVVM`是`Model-View-ViewModel`缩写。`Model`代表数据模型层，`View`代表视图层，`ViewModel`是`View`和`Model`层的桥梁，数据会绑定到`ViewModel`层并自动将数据渲染到页面中，视图变化的时候会通知`ViewModel`层更新数据。


## 1.`Vue2.x`响应式数据原理
基本原理：

1. `vue` 会遍历此data中对象所有的属性，并使用 `Object.defineProperty` 把这些属性全部转为 `getter/setter` 
2. 而每个组件实例都有 `watcher` 对象，它会在组件渲染的过程中把属性记录为依赖
3. 之后当依赖属性的 `setter`  被调用时，会通知 `watcher` 重新计算，从而致使它关联的组件得以更新

~~`Vue`在初始化数据时，会使用 `Object.defineProperty` 重新定义`data`中的所有属性，`Object.defineProperty`可以使数据的获取与设置增加一个拦截的功能，拦截属性的获取操作，进行依赖收集。拦截属性的更新操作，进行通知依赖更新。~~

~~具体过程:~~    

1. ~~首先 `Vue.prototype._init(option)` 初始化传入的参数~~
2. ~~`initState(vm)` 初始化实例，对`vue`实例中的 props, methods, data, computed 和 watch 数据进行初始化~~
3. ~~使用 `new Observer(data)` 对数据进行观测~~
4. ~~调用 `walk` 方法，遍历 data 中的每一个属性，监听数据的变化~~
5. ~~执行 `defineReactive` 监听数据 `get` 和 `set` ，核心就是使用 `Object.defineProperty `重新定义数据。~~

### `vue` 响应式原理设计三个重要对象：`Observer` 、`Watcher` 、`Dep`

- `Observer` 对象：`vue` 中数据对象在初始化过程中转换为 `Observer` 对象
- `Watcher` 对象：将模板和 `Observer` 对象结合在一起生成 `Watcher` 实例，`Watcher` 是发布订阅中的订阅者
- `Dep` 对象：`Watcher`对象和 `Observer`之间的纽带，每一个 `Observer`都有一个`Dep`实例，用来存储订阅者`Watcher`

当属性变化时会执行对象 `Observer` 的 `dep.notify` 方法，这个方法会遍历订阅者`Watcher`列表向其发送消息，`Watcher`会执行`run`方法去更新视图。

依赖关系如下

![](https://i.loli.net/2021/03/25/k7Et3zq6mBwelQC.jpg)

### 总结：
1. 在生命周期的`initState`方法中将data，prop，method，computed，watch中的数据劫持， 通过observe方法与`Object.defineProperty`方法将相关对象转为换`Observer`对象。

2. 然后在`initRender`方法中解析模板，通过`Watcher`对象，`Dep`对象与观察者模式将模板中的指令与对象的数据建立依赖关系，使用全局对象`Dep.target`实现依赖收集。

3. 当数据变化时，`setter`被调用，触发`Object.defineProperty`方法中的`dep.notify`方法， 遍历该数据依赖列表，执行其`update`方法通知`Watcher`进行视图更新。

### `Object.defineProperty` 有什么缺陷？
- `vue`是无法检测到对象属性的添加和删除，但是可以使用全局`Vue.set`方法（或`vm.$set`实例方法）。
  
  >`Object.defineProperty` 只能劫持对象的属性，从而需要对每个对象，每个属性进行遍历，如果属性值是对象，还需要深度遍历。`Proxy`可以劫持整个对象，并返回一个新的对象。
- `vue`无法检测利用索引设置数组，但是可以使用全局`Vue.set`方法（或`vm.$set`实例方法）。
  
  >`Object.defineProperty` 无法监控到数组下标变化，导致通过数组下标添加元素，不能实现实时响应；
- 无法检测直接修改数组长度，但是可以使用`splice`

### vue2.x为什么对数组对象的深层监听无法实现
因为组件每次渲染都是将data里的数据通过`defineProperty`进行响应式或者双向绑定上，之前没有后加的属性是不会被绑定上，也就不会触发更新渲染。


## 2.`Vue3.x`响应式数据原理
`Vue3.x`改用`Proxy`替代`Object.defineProperty`。因为Proxy可以直接监听对象和数组的变化，还可以代理动态增加的属性，并且有多达13种拦截方法。并且作为新标准将受到浏览器厂商重点持续的性能优化。

### Proxy只会代理对象的第一层，那么`Vue3`又是怎样处理这个问题的呢？
判断当前`Reflect.get`的返回值是否为`Object`，如果是则再通过`reactive`方法做代理，这样就是实现了深度观测。

### 监测数组的时候可能触发多次get/set，那么如何防止触发多次呢？
可以判断`key`是否为当前被代理对象`target`自身属性，也可以判断旧值与新值是否相等，只要满足以上两个条件之一，才有可能执行`trigger`。

## `vue2.x`中如何监测数组变化
使用了函数劫持的方式，重写了数组的方法，`Vue`将`data`中的数组进行了原型链重写，指向了自己定义的数组原型方法。这样当调用数组`api`时，可以通知依赖更新。如果数组中包含着引用类型，会对数组中的引用类型再次递归遍历进行监控。这样就实现了监测数组变化。

[原型链](./../JavaScript/3.原型链.md)


## 为什么`Vue`采用异步渲染？
`Vue`是组件级更新，如果不采用异步更新，那么每次更新数据都会对当前组件进行重新渲染，所以为了性能，`Vue`会在本轮数据更新后，再异步更新视图。核心思想`nextTick`。

**详见《nextTick》**

~~`dep.notify()`通知`watcher`进行更新，`subs[i].update`依次调用`watcher`的`update`，`queueWatcher`将`watch`去重放入队列，`nextTick`（`flushSchedulerQueue`）在下一`tick`中刷新`watcher`队列并执行（异步）。~~


## `nextTick`实现原理是什么？
**详见《nextTick》**

在下次`DOM`更新循环结束之后执行延迟回调。`nextTick`主要使用了宏任务和微任务。
根据执行环境分别尝试采用

- `Promise` (微任务)
- `MutationObserver` (微任务) 
- `setImmediate` (宏任务)
- 如果以上都不行则采用`setTimeout` (宏任务)

定义了一个异步方法，多次调用`nextTick`会将方法存入队列中，通过这个异步方法清空当前队列。

[事件循环](./../JavaScript/4.事件循环.md)
[宏任务与微任务](./../JavaScript/4.事件循环.md)


## `Vue`的生命周期
`beforeCreate`是`new Vue()`之后触发的第一个钩子（实例初始化之后，数据观测之前调用），在当前阶段`data`、`methods`、`computed`以及`watch`上的数据和方法都不能被访问。

`created`在实例创建完成后发生，当前阶段已经完成了数据观测，也就是可以使用数据，更改数据，在这里更改数据不会触发`updated`函数。在当前阶段无`$el`无法与DOM进行交互，如果要进行交互，可以用过`vm.$nextTick`来访问DOM。**可以做一些初始化数据的获取、，资源请求。**

`beforeMount`发生在挂载之前，在这之前`template`模板已导入渲染函数编译。而当前阶段虚拟DOM已经创建完成，即将开始渲染。在此时也可以对数据进行更改，不会触发`updated`。

`mounted`在挂载完成后发生，在当前阶段，真实的DOM挂载完毕，数据完成双向绑定，**可以访问到DOM节点**，使用`$refs`属性对DOM进行操作。

`beforeUpdate`发生在更新之前，也就是响应式数据发生更新，虚拟DOM重新渲染之前被触发，可以在当前阶段进行更改数据，不会造成重渲染。

`updated`发生在更新完成之后，当前阶段组件DOM已完成更新。**可以执行依赖于DOM的操作，要注意的是避免在此期间更改数据，因为这可能会导致无限循环的更新**。

`beforeDestroy`发生在实例销毁之前，在当前阶段实例完全可以被使用，可以在这时进行善后收尾工作，比如清除计时器。

`destroy`发生在实例销毁之后，这个时候只剩下了DOM空壳。组件已被拆解，数据绑定卸除，监听被移除，子实例也统统被销毁。


### 什么时候使用 `beforeDestroy`？
当页面使用`$on`，需要解绑事件。清除定时器、解除事件绑定、`scroll mouseover`。

## 6.接口请求一般放在哪个生命周期中？
接口请求一般放在`mounted`中，但需要注意的是服务端渲染时不支持`mounted`，需要放在`created`中。


## 7.说一下`Computed`和`Watch`
`Computed`本质是一个具备缓存的`watcher`，依赖的属性发生变化就会更新视图。适用于计算比较消耗性能的计算场景。当表示过于负载时，在模板中放入过多逻辑会让模板难以维护，可以将复杂的逻辑放入计算属性中处理。

`Watch`没有缓存，更多的是观察的作用，可以监听某些数据执行回调。当需要深度监听对象中的属性时，可以打开`deep: true`选项，这样便会对对象中的每一项进行监听。这样会带来性能问题，优化的话可以使用**字符串形式**监听，如果没有写到组件中，不要忘记使用`unWatch`手动注销。

## 8.`v-if`和`v-show`的区别
当条件不成立时，`v-if`不会渲染DOM元素，`v-show`操作的是样式（`display`），切换当前DOM的显示和隐藏。

### 使用场景

#### v-if

- 某一块代码在运行时条件很少改变，使用v-if较好（v-if有更改的切换开销）
- 和key结合使用，管理可复用的元素（Vue会尽可能高效地渲染元素，通常会复用已有元素而不是从头开始渲染）
- 和template配合使用，可以分组渲染代码块
- 和v-else或者v-else-if结合使用
- 在组件上使用v-if可触发组件的生命周期函数
- 与v-for结合使用，v-for比v-if的优先级更高
- 与transition结合使用，当条件变化时该指令可以触发过渡效果（用于动画切换）
- 与keep-alive结合使用可以保留组件状态，避免重新渲染

#### v-show

- 需要非常频繁地切换某块代码，使用v-show渲染
- 当条件变化时该指令触发过渡效果（用于动画切换）
- 不可用于组件
- 没有条件语句

## 9.组件中的`data`为什么是一个函数？
避免组件中的数据互相影响。一个组件被复用多次的话，也就会创建多个实例。本质上，**这些实例用的都是用一个构造函数**。如果data是对象的话，对象属于引用类型，会影响到所有的实例。所以为了保证组件不同的实例之间data不冲突，data必须是一个函数。

## 10.`v-model`的原理
`v-model`本质就是一个语法糖，可以看成`value + input`方法的语法糖。可以通过`model`属性的`prop`和`evnet`属性来进行自定义。原生的`v-model`，会根据标签的不同生成不同的事件和属性。

## 11.`Vue`事件绑定原理
原生事件绑定是通过`addEventListener`绑定给真实元素的，组件事件绑定是通过Vue自定义的`$on`实现的。

## 12.`Vue`模板编译原理
简单说，`Vue`的编译过程就是将`template`转化为`render`函数的过程。
会经历以下阶段：

- 生成`AST`树
- 优化
- `odegen`

首先解析模板`template`，生成`AST语法树`（一种用`JavaScript`对象的形式来描述整个模板）。使用大量的正则表达式对模板进行解析，遇到标签、文本的时候都会执行对应的钩子进行相关处理。

`Vue`的数据是响应式的，但其实模板中并不是所有的数据都是响应式的。有一些数据首次渲染后就不会再变化，对应的DOM也不会变化。那么优化过程就是深度遍历`AST`树，按照相关条件对树节点进行标记。这些被标记的节点（静态节点）就可以**跳过对它们的比对**，对运行时的模板起到很大的优化作用。

编译的最后一步是**将优化后的`AST`树转化为可执行的代码**。

### 用`VNode`来描述一个DOM结构
~~首先解析模板`template`，生成`AST语法树`（一种用JavaScript对象的形式来描述整个模板），`AST`树通过`codegen`生成`render`函数，`render`函数里的`_c`方法将它转为虚拟DOM。~~

## 13.`Vue2.x`和`Vue3.x`渲染器的`diff`算法分别说一下
简单来说，`diff`算法有一下过程
- 同级比较，再比较子节点
- 先判断一方有子节点一方没有子节点的情况（如果新的children没有子节点，将旧的子节点移除）
- 比较都有子节点的情况（核心`diff`）
- 递归比较子节点

正常`Diff`两个树的时间复杂度是$O(n^3)$，但实际情况下很少会进行**跨层级的移动DOM**，所以`Vue`将`Diff`进行了优化，从$O(n^3)$ -> $O(n)$，只有当新旧children都为多个子节点时才需要用核心的`Diff`算法进行同层级比较。

`Vue2.x`的核心`Diff`算法采用了**双端比较**的算法，同时从新旧children的两端开始进行比较，借助key值找到可复用的节点，再进行相关操作。相比React的`Diff`算法，同样情况下可以减少移动节点次数，减少不必要的性能损耗，更加的优雅。

> `Vue3.x`借鉴了`ivi`算法和inferno算法

再创建`VNode`时就确定其类型，以及在`mount/patch`的过程中采用**位运算**来判断一个`VNode`的类型，在这个基础之上再配合核心的`Diff`算法，使得性能上较`Vue2.x`有了提升。

该算法中还运用了**动态规划**的思想求解最长递归子序列。

### `diff`算法的优化策略: 四种命中查找，四个指针
1. 旧前与新前（先比开头，后插入和删除节点的这种情况）
2. 旧后与新后（比结尾，前插入或删除的情况）
3. 旧前与新后（头与尾比，此种发生了涉及移动节点，那么新前指向的节点，移动到旧后之后）
4. 旧后与新前（头与尾比，此种发生了涉及移动节点，那么新前指向的节点，移动到旧前之前）

## 14.虚拟DOM和key属性的作用
由于在浏览器中操作DOM开销是很昂贵的。频繁的操作DOM，会产生一定的性能问题。这就是虚拟DOM的**产生原因**。

> `Vue2`的`Virtual DOM`借鉴了开源库`snabbdom`的实现。

**`Virtual DOM`本质就是用一个原生的`JS`对象去描述一个DOM节点。是对真实DOM的一层抽象。**（也就是源码中的`VNode`类，它定义在`src/code/vdom/vnode.js`中。）

`Virtual DOM`映射到真实DOM需要经历`VNode`的`create`、`diff`、`patch`等阶段。

### 『key的作用是尽可能的复用 DOM 元素』

1. `key`的作用主要是为了高效的更新虚拟`DOM`，其原理是`vue`在`patch`过程中通过`key`可以精准判断两个节点是否是同一个，从而避免频繁更新不同元素，使得整个`patch`过程更加高效，减少`dom`操作量，提高性能；
2. 过渡切换时，`key`可以让`vue`区分元素，否则只会替换其内部元素而不会触发过渡效果。

> 新旧的`children`中的节点只有顺序不同的时候，最佳的操作应该是通过移动元素的位置来达到更新的目的。
>
> 需要在新旧`children`的节点中保存映射关系，以便能够在旧`children`的节点中找到可复用的节点。`key`也就是`children`中节点的唯一标识。

## 15.`keep-alive`
**详见《nextTick》**

`keep-alive`可以实现组件缓存，当组件切换时不会对当前组件进行卸载。

常用的两个属性`include/exclude`，允许组件有条件的进行缓存。

两个生命周期`activated/deavtivated`，用来得知当前组件是否处于活跃状态。

`keep-alive`中还运用了`LRU(Least Recentl Used)`算法。

## 16.`Vue`中生命周期调用顺序 组件调用顺序
组件的调用顺序是**先父后子**，渲染完成的顺序是**先子后父**。

组件的销毁操作是**先父后子**，销毁完成的顺序是**先子后父**。

<u>加载渲染过程</u> 渲染先父后子，完成先子后父  
`父beforeCreate -> 父created -> 父beforeMount -> 子beforeCreate -> 子created ->  子beforeMount -> 子mounted -> 父mounted`

<u>子组件更新过程</u> 父更新导致子更新，子更新完成后父  
`父beforeUpdate -> 子beforeUpdate -> 子updated -> 父updated`

<u>父组件更新过程</u>  
`父beforeUpdate -> 父update`

<u>销毁过程</u>销毁先父后子，完成先子后父  
`父beforeDestroy -> 子beforeDestroy -> 子destroyed -> 父destroyed`

## 17.`Vue2.x`的组件通信有哪些方式？
- 父子组件通信  
  - 父 -> 子`props`，子 -> 父`$on、$emit`  
  - 获取父组件实例`$parent、$children`  
  - `Ref`获取实例的方式调用组件的属性或者方法  
  - `Provide、inject`官方不推荐使用，但是写组件库时很常用

- 兄弟组件通信  
  - `Event Bus`实现跨组件通信`Vue.prototype.$bus = new Vue`  
  - `Vuex`

- 跨级组件通信
  - `Vuex`  
  - `$attrs、$listeners`  
  - `Provide、inject`

## 18.`SSR`
`SSR`也就是服务端渲染，**也就是将`Vue`在客户端把标签渲染成HTML的工作放在服务端完成，然后再把HTML直接返回给客户端**。

`SSR`有这更好的`SEO`，并且首屏加载速度更快等优点。  
不过他也有一些缺点，比如开发条件会受限，服务端渲染只支持`beforeCreate`和`created`两个钩子，当需要一些外部扩展库时需要特殊处理，服务端渲染 应用程序也需要处于`Node.js`的运行环境。还有就是服务器会有更大的负载需求。

## 19.做过哪些`Vue`的性能优化
- 编码阶段
  - 尽量减少data中的数据，data中的数据会增加getter和setter，会收集对应的watcher
  - v-if和v-for不能连用（v-for会比v-if的优先级更高，连用的话会把v-if的每个元素都添加一下，造成性能问题）
  - 如果需要使用v-for给每项元素绑定事件时使用事件代理
  - SPA页面采用keep-alive缓存组件
  - 在更多的情况下，使用v-if代替v-show
  - key保证唯一
  - 使用路由懒加载、异步组件
  - 防抖、节流
  - 第三方模块按需引入
  - 长列表滚动到可视区域动态加载
  - 图片懒加载
- `SEO`优化
  - 预渲染
  - 服务端渲染`SSR`
- 打包优化
  - 压缩代码
  - `Tree Shaking`/`Scope Hoisting`
  - 使用`CDN`加载第三方模块
  - 多线程打包`happypack`
  - `splitChunk`抽离公共文件
  - `sourceMap`优化
- 用户体验
  - 骨架屏
  - `PWA`

还可以使用缓存（客户端缓存、服务端缓存）优化、服务端开启gzip压缩等。

## 20.`hash`路由和`history`路由实现原理
详细见《Vue-Router》

~~`location.hash`的值实际就是URL中`#`后面的东西~~

~~`history`实际采用了`HTML5`中提供的`API`来实现的，主要有`history.pushState()`和`history.replaceState()`。~~

## 21.`v-html` 会导致哪些问题
- `XSS`攻击
- `v-html`会替换标签内部的元素

## 22.描述组件渲染和更新过程
渲染组件时，会通过`vue.extend()`方法构建子组件的构造函数，并进行实例化。最终手动调用`$mount()`进行挂载。  
更新组件时会进行`patchVnode`流程，核心就是`diff`算法。

****

## 23.`Vuex`中的5个属性

- `State`：定义了应用状态的数据结构，可以在此设置默认的初始值；
- `Getter`：允许组件从`Store`中获取数据，`mapGetters `辅助函数仅仅是将 `store` 中的  `getter` 映射到局部计算属性；
- `Mutation`： 是唯一更改 `store` 中的状态的方法，且必须是同步函数；
- `Action`：用于提交  `mutation`  ，而不是直接变更状态，可以包含任意异步操作；
- `Module`：可以将` store` 分割成模块。每个模块拥有自己的 `state` 、`mutation`、`action`、`getter`，甚至是嵌套子模块，从上至下进行同样方式的分割。


## 24.vue2和vue3的区别是什么？
1. 语法层面上
   - `defineProperty`只能响应首次渲染时候的属性，
   - `Proxy`需要的是整体监听，不需要关心里面有什么属性，而且`Proxy`的配置项有13种，可以做更细致的事情，这是之前的`defineProperty`无法达到的。
2. 兼容层面上
   - `vue2.x`之所以只能兼容到IE8就是因为`defineProperty`无法兼容IE8,其他浏览器也会存在轻微兼容问题。
   - `proxy`的话除了IE，其他浏览器都兼容，这次vue3还是使用了它，说明vue3直接放弃了IE的兼容考虑。


需要补充更正的知识点  

1. 用`VNode`来描述一个DOM结构