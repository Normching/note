> 20+Vue题目
## 对 Vue 的理解
渐进式`JavaScript`框架、核心库加插件、动态创建用户界面（异步获取后台数据，数据展示在界面）  
特点：  
  `MVVM`模式；
  代码简洁体积小，运行效率高，适合移动、PC端开发；
  本身只关注`UI`，可以轻松引入`Vue`插件或其他的第三方库进行开发；


## 0.关于MVVM
MVVM是`Model-View-ViewModel`缩写。`Model`代表数据模型层，`View`代表视图层，`ViewModel`是`View`和`Model`层的桥梁，数据会绑定到`ViewModel`层并自动将数据渲染到页面中，视图变化的时候会通知`ViewModel`层更新数据。


## 1.Vue2.x响应式数据原理
Vue在初始化数据时，会使用`Object.defineProperty`重新定义`data`中的所有属性，`Object.defineProperty`可以使数据的获取与设置增加一个拦截的功能，拦截属性的获取操作，进行依赖收集。拦截属性的更新操作，进行通知依赖更新。
具体过程：  
首先Vue使用`initData`初始化用户传入的参数，然后使用`new Observer`对数据进行观测，如果数据是一个对象类型就会调用`this.walk(value)`对对象进行处理，内部使用`defineReactive`循环对象属性定义响应式变化，核心就是使用`Object.defineProperty`重新定义数据。

### `Object.defineProperty` 有什么缺陷？

- `Object.defineProperty` 无法监控到数组下标变化，导致通过数组下标添加元素，不能实现实时响应；
- `Object.defineProperty` 只能劫持对象的属性，从而需要对每个对象，每个属性进行遍历，如果属性值是对象，还需要深度遍历。`Proxy`可以劫持整个对象，并返回一个新的对象。

## 2.Vue3.x响应式数据原理
Vue3.x改用`Proxy`替代`Object.defineProperty`。因为Proxy可以直接监听对象和数组的变化，还可以代理动态增加的属性，并且有多达13种拦截方法。并且作为新标准将受到浏览器厂商重点持续的性能优化。

### Proxy只会代理对象的第一层，那么Vue3又是怎样处理这个问题的呢？
判断当前`Reflect.get`的返回值是否为`Object`，如果是则再通过`reactive`方法做代理，这样就是实现了深度观测。

### 监测数组的时候可能触发多次get/set，那么如何防止触发多次呢？
可以判断`key`是否为当前被代理对象`target`自身属性，也可以判断旧值与新值是否相等，只要满足以上两个条件之一，才有可能执行`trigger`。


## vue2.x中如何监测数组变化
使用了函数劫持的方式，重写了数组的方法，Vue将data中的数组进行了原型链重写，指向了自己定义的数组原型方法。这样当调用数组api时，可以通知依赖更新。如果数组中包含着引用类型，会对数组中的引用类型再次递归遍历进行监控。这样就实现了监测数组变化。

[原型链](./../JavaScript/3.原型链.md)


## 为什么Vue采用异步渲染？
`Vue`是组件级更新，如果不采用异步更新，那么每次更新数据都会对当前组件进行重新渲染，所以为了性能，`Vue`会在本轮数据更新后，再异步更新视图。核心思想`nextTick`。`dep.notify()`通知`watcher`进行更新，`ubs[i].update`依次调用`watcher`的`update`，`queueWatcher`将`watch`去重放入队列，`nextTick`（`flushSchedulerQueue`）在下一`tick`中刷新`watcher`队列（异步）。


## nextTick实现原理是什么？
在下次`DOM`更新循环结束之后执行延迟回调。`nextTick`主要使用了宏任务和微任务。
根据执行环境分别尝试采用
- Promise (微任务)
- MutationObserver (微任务)
- setImmediate (宏任务)
- 如果以上都不行则采用setTimeout (宏任务)

定义了一个异步方法，多次调用`nextTick`会将方法存入队列中，通过这个异步方法清空当前队列。

[事件循环](./../JavaScript/4.事件循环.md)
[宏任务与微任务](./../JavaScript/4.事件循环.md)


## Vue的生命周期
`beforeCreate`是new Vue()之后触发的第一个钩子（实例初始化之后，数据观测之前调用），在当前阶段data、methods、computed以及watch上的数据和方法都不能被访问。

`created`在实例创建完成后发生，当前阶段已经完成了数据观测，也就是可以使用数据，更改数据，在这里更改数据不会触发updated函数。在当前阶段无`$el`无法与DOM进行交互，如果要进行交互，可以用过`vm.$nextTick`来访问DOM。**可以做一些初始化数据的获取、，资源请求。**

`beforeMount`发生在挂载之前，在这之前`template`模板已导入渲染函数编译。而当前阶段虚拟DOM已经创建完成，即将开始渲染。在此时也可以对数据进行更改，不会触发`updated`。

`mounted`在挂载完成后发生，在当前阶段，真实的DOM挂载完毕，数据完成双向绑定，**可以访问到DOM节点**，使用`$refs`属性对DOM进行操作。

`beforeUpdate`发生在更新之前，也就是响应式数据发生更新，虚拟DOM重新渲染之前被触发，可以在当前阶段进行更改数据，不会造成重渲染。

`updated`发生在更新完成之后，当前阶段组件DOM已完成更新。**可以执行依赖于DOM的操作，要注意的是避免在此期间更改数据，因为这可能会导致无限循环的更新**。

`beforeDestroy`发生在实例销毁之前，在当前阶段实例完全可以被使用，可以在这时进行善后收尾工作，比如清除计时器。

`destroy`发生在实例销毁之后，这个时候只剩下了DOM空壳。组件已被拆解，数据绑定卸除，监听被移除，子实例也统统被销毁。


### 什么时候使用 beforeDestroy？
当页面使用`$on`，需要解绑事件。清除定时器、解除事件绑定、`scroll mouseover`。

## 6.接口请求一般放在哪个生命周期中？
接口请求一般放在`mounted`中，但需要注意的是服务端渲染时不支持`mounted`，需要放在`created`中。


## 7.说一下Computed和Watch
`Computed`本质是一个具备缓存的watcher，依赖的属性发生变化就会更新视图。适用于计算比较消耗性能的计算场景。当表示过于负载时，在模板中放入过多逻辑会让模板难以维护，可以将复杂的逻辑放入计算属性中处理。

`Watch`没有缓存，更多的是观察的作用，可以监听某些数据执行回调。当需要深度监听对象中的属性时，可以打开`deep: true`选项，这样便会对对象中的每一项进行监听。这样会带来性能问题，优化的话可以使用**字符串形式**监听，如果没有写到组件中，不要忘记使用`unWatch`手动注销。

## 8.v-if和v-show的区别
当条件不成立时，`v-if`不会渲染DOM元素，`v-show`操作的是样式（display），切换当前DOM的显示和隐藏。

## 9.组件中的data为什么是一个函数？
避免组件中的数据互相影响。一个组件被复用多次的话，也就会创建多个实例。本质上，**这些实例用的都是用一个构造函数**。如果data是对象的话，对象属于引用类型，会影响到所有的实例。所以为了保证组件不同的实例之间data不冲突，data必须是一个函数。

## 10.v-model的原理
`v-model`本质就是一个语法糖，可以看成`value + input`方法的语法糖。可以通过`model`属性的`prop`和`evnet`属性来进行自定义。原生的`v-model`，会根据标签的不同生成不同的事件和属性。

## 11.Vue事件绑定原理
原生事件绑定是通过`addEventListener`绑定给真实元素的，组件事件绑定是通过Vue自定义的`$on`实现的。

## 12.Vue模板编译原理
简单说，Vue的编译过程就是将`template`转化为`render`函数的过程。
会经历以下阶段：
- 生成AST树
- 优化
- codegen

首先解析模板`template`，生成`AST语法树`（一种用JavaScript对象的形式来描述整个模板）。使用大量的正则表达式对模板进行解析，遇到标签、文本的时候都会执行对应的钩子进行相关处理。

Vue的数据是响应式的，但其实模板中并不是所有的数据都是响应式的。有一些数据首次渲染后就不会再变化，对应的DOM也不会变化。那么优化过程就是深度遍历AST树，按照相关条件对树节点进行标记。这些被标记的节点（静态节点）就可以**跳过对它们的比对**，对运行时的模板起到很大的优化作用。

编译的最后一步是**将优化后的AST树转化为可执行的代码**。

### 用VNode来描述一个DOM结构
首先解析模板`template`，生成`AST语法树`（一种用JavaScript对象的形式来描述整个模板），AST树通过`codegen`生成`render`函数，`render`函数里的`_c`方法将它转为虚拟DOM。

## 13.Vue2.x和Vue3.x渲染器的diff算法分别说一下
简单来说，diff算法有一下过程
- 同级比较，再比较子节点
- 先判断一方有子节点一方没有子节点的情况（如果新的children没有子节点，将旧的子节点移除）
- 比较都有子节点的情况（核心diff）
- 递归比较子节点

正常Diff两个树的时间复杂度是$O(n^3)$，但实际情况下很少会进行**跨层级的移动DOM**，所以Vue将Diff进行了优化，从$O(n^3) -> O(n)$，只有当新旧children都为多个子节点时才需要用核心的Diff算法进行同层级比较。

Vue2.x的核心Diff算法采用了**双端比较**的算法，同时从新旧children的两端开始进行比较，借助key值找到可复用的节点，再进行相关操作。相比React的Diff算法，同样情况下可以减少移动节点次数，减少不必要的性能损耗，更加的优雅。

Vue3.x借鉴了ivi算法和inferno算法

再创建VNode时就确定其类型，以及在`mount/patch`的过程中采用**位运算**来判断一个VNode的类型，在这个基础之上再配合核心的Diff算法，使得性能上较Vue2.x有了提升。

该算法中还运用了**动态规划**的思想求解最长递归子序列。

### diff算法的优化策略: 四种命中查找，四个指针
1. 旧前与新前（先比开头，后插入和删除节点的这种情况）
2. 旧后与新后（比结尾，前插入或删除的情况）
3. 旧前与新后（头与尾比，此种发生了涉及移动节点，那么新前指向的节点，移动到旧后之后）
4. 旧后与新前（头与尾比，此种发生了涉及移动节点，那么新前指向的节点，移动到旧前之前）

## 14.虚拟DOM和key属性的作用
由于在浏览器中操作DOM开销是很昂贵的。频繁的操作DOM，会产生一定的性能问题。这就是虚拟DOM的**产生原因**。

Vue2的`Virtual DOM`借鉴了开源库`snabbdom`的实现。

**`Virtual DOM`本质就是用一个原生的JS对象去描述一个DOM节点。是对真实DOM的一层抽象。**（也就是源码中的VNode类，它定义在src/code/vdom/vnode.js中。）

`Virtual DOM`映射到真实DOM需要经历VNode的create、diff、patch等阶段。

### 『key的作用是尽可能的复用 DOM 元素』
新旧的`children`中的节点只有顺序不同的时候，最佳的操作应该是通过移动元素的位置来达到更新的目的。

需要在新旧`children`的节点中保存映射关系，以便能够在旧`children`的节点中找到可复用的节点。`key`也就是`children`中节点的唯一标识。

## 15.keep-alive
`keep-alive`可以实现组件缓存，当组件切换时不会对当前组件进行卸载。

常用的两个属性`include/exclude`，允许组件有条件的进行缓存。

两个生命周期`activated/deavtivated`，用来得知当前组件是否处于活跃状态。

`keep-alive`中还运用了`LRU(Least Recentl Used)`算法。

## 16.Vue中生命周期调用顺序 组件调用顺序
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

## 17.Vue2.x的组件通信有哪些方式？
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

## 18.SSR
SSR也就是服务端渲染，**也就是将Vue在客户端把标签渲染成HTML的工作放在服务端完成，然后再把HTML直接返回给客户端**。

SSR有这更好的SEO，并且首屏加载速度更快等优点。  
不过他也有一些缺点，比如开发条件会受限，服务端渲染只支持`beforeCreate`和`created`两个钩子，当需要一些外部扩展库时需要特殊处理，服务端渲染 应用程序也需要处于Node.js的运行环境。还有就是服务器会有更大的负载需求。

## 19.做过哪些Vue的性能优化
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
- SEO优化
  - 预渲染
  - 服务端渲染SSR
- 打包优化
  - 压缩代码
  - Tree Shaking/Scope Hoisting
  - 使用CDN加载第三方模块
  - 多线程打包happypack
  - splitChunk抽离公共文件
  - sourceMap优化
- 用户体验
  - 骨架屏
  - PWA
    

还可以使用缓存（客户端缓存、服务端缓存）优化、服务端开启gzip压缩等。

## 20.hash路由和history路由实现原理
`location.hash`的值实际就是URL中`#`后面的东西

history实际采用了HTML5中提供的API来实现的，主要有`history.pushState()`和`history.replaceState()`。

## v-html 会导致哪些问题
- `XSS`攻击
- `v-html`会替换标签内部的元素

## 描述组件渲染和更新过程
渲染组件时，会通过`vue.extend()`方法构建子组件的构造函数，并进行实例化。最终手动调用`$mount()`进行挂载。  
更新组件时会进行`patchVnode`流程，核心就是`diff`算法。


需要补充更正的知识点  
1. 用VNode来描述一个DOM结构
2. 虚拟DOM和key属性的作用