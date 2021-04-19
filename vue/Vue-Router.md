# Vue-Router



## vue-router的两种模式

### Hash模式

vue-router默认使用Hash模式。使用url的hash来模拟一个完整的url。

此时url变化时，浏览器是不会重新加载的。

Hash 模式是基于锚点以及 `onhashchange` 事件。

**Hash(即`#`)是url的锚点，代表的是网页中的一个位置，仅仅改变#后面部分，浏览器只会滚动对应的位置，而不会重新加载页面。**

`#`仅仅只是对浏览器进行指导，而对服务端是完全没有作用的！它不会被包括在http请求中，故也不会重新加载页面。

同时**hash发生变化时，url都会被浏览器记录下来，这样就可以使用浏览器的后退了。**

**总而言之：Hash模式就是通过改变`#`后面的值,实现浏览器渲染指定的组件。**



#### Hash模式实现原理

- URL 中`#`后面的内容作为路径地址
- 监听 `hashchange` 事件
- 根据当前路由地址找到对应组件重新渲染



### History模式

该模式利用了HTML5 History新增的 `pushState()` 和 `replaceState()` 方法。

>  除了之前的`back`，`forward`，`go`方法，这两个新方法可以应用在浏览器历史记录的增加替换功能上。

使用History模式，通过历史记录修改url，但它不会立即向后端发送请求。



 **`注意点:`** 虽然History模式可以丢掉不美观的`#`，也可以正常的前进后退。但是刷新f5后，此时浏览器就会访问服务器，在没有后台支持的情况下，此时就会得到一个404！

> 官方文档给出的描述是：“不过这种模式要玩好，还需要后台配置支持。因为我们的应用是单个客户端应用，如果后台没有正确的配置，当用户直接访问时，就会返回404。所以呢，你要在服务端增加一个覆盖所有情况的的候选资源；
>
> 如果url匹配不到任何静态资源，则应该返回同一个`index.html`页面。“

**总而言之：History模式就是通过 `pushState()` 方法来对浏览器的浏览记录进行修改，来达到不用请求后端来渲染的效果。不过建议，实际项目还是使用history模式。**



#### History模式实现原理

- 通过 `history.pushState()` 方法改变地址栏
- 监听 `popstate` 事件
- 根据当前路由地址找到对应组件重新渲染



### 区别

- Hash 模式是基于锚点以及 onhashchange 事件。

- History 模式是基于 HTML5 中的 History API。history 对象具有 pushState 和 replaceState 两个方法。但是需要注意 pushState 方法需要 IE10 以后才可以支持。在 IE10 之前的浏览器，只能使用 Hash 模式。

- history 对象还有一个 push 方法，可以改变导航栏的地址，并向服务器发送请求。pushState 方法可以只改变导航栏地址，而不向服务器发送请求。



### 服务器配置

History 需要服务器的支持。

原因是单页面应用中，只有一个 index.html。而在单页面应用正常通过点击进入 http://localhost:8080/login 不会有问题。但是当刷新浏览器时，就会请求服务器，而服务器上不存在这个 URL 对应的资源，就会返回 404。

所以在服务器上应该配置除了静态资源以外的所有请求都返回 index.html。



在 routes 中添加 404 的路由。

```javascript
const routes = [
  // other code
  {
    path: "*",
    name: "404",
    component: () => import("../views/404.vue"),
  },
];
```



##### nginx 服务器配置

nginx 的默认配置在 conf/nginx.conf 中。

在 nginx.conf 中找到监听 80 的那个 server 模块，在从中找到 location /的位置。

添加 try_files 配置。

```nginx
location / {
  root   html;
  index  index.html index.htm;
  # $uri 是 nginx 的变量，就是当前这次请求的路径
  # try files 会尝试在这个路径下寻找资源，如果找不到，会继续朝下一个寻找
  # $uri/ 的意思是在路径目录下寻找 index.html 或 index.htm
  # 最后都找不到的话，返回 index.html
  try_files $uri $uri/ /index.html;
}
```







## 导航守卫

`vue-router` 提供的导航守卫主要用来通过跳转或取消的方式守卫导航。有多种机会植入路由导航过程中：全局的, 单个路由独享的, 或者组件级的。

**参数或查询的改变并不会触发进入/离开的导航守卫**



### 全局守卫

- router.beforeEach 全局前置守卫 进入路由之前

- router.beforeResolve 全局解析守卫(2.5.0+) 在beforeRouteEnter调用之后调用

- router.afterEach 全局后置钩子 进入路由之后



#### 参数

- **`to: Route`**: 即将要进入的目标 

- **`from: Route`**: 当前导航正要离开的路由

- **`next: Function`**：这个参数是个函数，且**必须调用，否则不能进入路由**(页面空白)

  - **`next()`**: 进行管道中的下一个钩子。如果全部钩子执行完了，则导航的状态就是 **confirmed** (确认的)。

  - **`next(false)`**: 中断当前的导航。如果浏览器的 URL 改变了 (可能是用户手动或者浏览器后退按钮)，那么 URL 地址会重置到 `from` 路由对应的地址。

  - **`next`** 跳转新路由，当前的导航被中断，重新开始一个新的导航。

    > 可以跳转：next('path地址')或者next({path:''})或者next({name:''}) 
    >
    > 且允许设置诸如 replace: true、name: 'home' 之类的选项  
    >
    > 以及用在router-link或router.push的对象选项。



### 路由独享守卫

可以为某些路由单独配置守卫：

```javascript
const router = new VueRouter({
    routes: [
        {
            path: '/foo',
            component: Foo,
            beforeEnter: (to, from, next) => {
                // 参数用法什么的都一样,调用顺序在全局前置守卫后面，所以不会被全局守卫覆盖
                // ...
            }
        }
    ]
})
```



### 组件内的守卫

- beforeRouteEnter 进入路由前
- beforeRouteUpdate (2.2) 路由复用同一个组件时
- beforeRouteLeave 离开当前路由时

```javascript
const Foo = {
  template: `...`,
  beforeRouteEnter(to, from, next) {
    // 在渲染该组件的对应路由被 confirm 前调用
    // 不！能！获取组件实例 `this`
    // 因为当守卫执行前，组件实例还没被创建
  },
  beforeRouteUpdate(to, from, next) {
    // 在当前路由改变，但是该组件被复用时调用
    // 举例来说，对于一个带有动态参数的路径 /foo/:id，在 /foo/1 和 /foo/2 之间跳转的时候，
    // 由于会渲染同样的 Foo 组件，因此组件实例会被复用。而这个钩子就会在这个情况下被调用。
    // 可以访问组件实例 `this`
  },
  beforeRouteLeave(to, from, next) {
    // 导航离开该组件的对应路由时调用
    // 可以访问组件实例 `this`
  }
}
```

`beforeRouteEnter`访问`this`的方法

因为钩子在组件实例还没被创建的时候调用，所以不能获取组件实例 `this`，可以通过传一个回调给`next`来访问组件实例 。

但是**回调的执行时机在mounted后面**，所以在这里对this的访问意义不太大，可以放在`created`或者`mounted`里面。

```javascript
beforeRouteEnter (to, from, next) {
    console.log('在路由独享守卫后调用');
    next(vm => {
        // 通过 `vm` 访问组件实例`this` 执行回调的时机在mounted后面
    })
}
```

注意 `beforeRouteEnter` 是支持给 `next` 传递回调的**唯一**守卫。

对于 `beforeRouteUpdate` 和 `beforeRouteLeave` 来说，`this` 已经可用了，所以**不支持**传递回调，因为没有必要了。



### 完整的导航解析流程

1. 导航被触发。
2. 在失活的组件里调用 `beforeRouteLeave` 守卫。
3. 调用全局的 `beforeEach` 守卫。
4. 在重用的组件里调用 `beforeRouteUpdate` 守卫 (2.2+)。
5. 在路由配置里调用 `beforeEnter`。
6. 解析异步路由组件。
7. 在被激活的组件里调用 `beforeRouteEnter`。
8. 调用全局的 `beforeResolve` 守卫 (2.5+)。
9. 导航被确认。
10. 调用全局的 `afterEach` 钩子。
11. 触发 DOM 更新。
12. 调用 `beforeRouteEnter` 守卫中传给 `next` 的回调函数，创建好的组件实例会作为回调函数的参数传入。



### 其他关于钩子的点

#### 路由钩子函数的错误捕获

```javascript
router.onError(callback => { 
    // 2.4.0新增 并不常用，了解一下就可以了 
    console.log(callback, 'callback');
});
```



## keep-alive

Vue提供了一个内置组件`keep-alive`来**缓存组件内部状态，避免重新渲染**。

> `<keep-alive>` 是一个抽象组件：它自身不会渲染一个 DOM 元素，也不会出现在父组件链中。



### 用法

#### 缓存动态组件

`<keep-alive>`包裹动态组件时，会缓存不活动的组件实例，而不是销毁它们，此种方式并无太大的实用意义。

```html
<!-- 基本 -->
<keep-alive>
	<component :is="view"></component>
</keep-alive>

<!-- 多个条件判断的子组件 -->
<keep-alive>
	<comp-a v-if="a > 1"></comp-a>
	<comp-b v-else></comp-b>
</keep-alive>
```

#### 缓存路由组件

使用`keep-alive`可以将所有路径匹配到的路由组件都缓存起来，包括路由组件里面的组件，`keep-alive`大多数使用场景就是这种。

```html
<keep-alive>
	<router-view></router-view>
</keep-alive>
```



### 生命周期钩子

在被`keep-alive`包含的组件/路由中，会多出两个生命周期的钩子:`activated` 与 `deactivated`。

> 在 2.2.0 及其更高版本中，activated 和 deactivated 将会在 树内的**所有嵌套组件**中触发。



#### activated

`activated`在组件第一次渲染时会被调用，之后在每次缓存组件被激活时调用。

第一次进入缓存路由/组件，在`mounted`后面，`beforeRouteEnter`守卫传给 `next` 的回调函数之前调用：

1. `beforeMount` => 
2. 如果你是从别的路由/组件进来(组件销毁 `destroyed` 或离开缓存 `deactivated`  =>    
3. `mounted` => 
4. `activated` 进入缓存组件 => 
5. 执行 `beforeRouteEnter` 回调



因为组件被缓存了，**再次进入缓存路由/组件时，不会触发这些钩子**：

- `beforeCreate`

- `created`

- `beforeMount`
- `mounted`



之后的调用时机是：

1. 前一个组件销毁 `destroyed` 或离开缓存 `deactivated` => 

2. `activated` 进入当前缓存组件 => 

3. 执行 `beforeRouteEnter` 回调


组件缓存或销毁，嵌套组件的销毁和缓存也在这里触发



#### deactivated

组件被停用(离开路由)时调用

使用了`keep-alive`就不会调用`beforeDestroy`(组件销毁前钩子)和`destroyed`(组件销毁)，因为组件没被销毁，被缓存起来了。



如果你离开了路由，会依次触发：

1. 组件内的离开当前路由钩子 `beforeRouteLeave` =>  

2. 路由前置守卫 `beforeEach` =>    

3. 全局后置钩子 `afterEach` => 

4. `deactivated` 离开缓存组件 => 

5. `activated` 进入下一个缓存组件(如果进入的也是缓存路由)    

如果离开的组件没有缓存的话 `beforeDestroy` 会替换 `deactivated`

如果进入的路由也没有缓存的话  全局后置钩子 `afterEach` => 销毁 `destroyed` => `beforeCreate` 等



### 参数

- `include` - 字符串或正则表达式。只有名称匹配的组件会被缓存。
- `exclude` - 字符串或正则表达式。任何名称匹配的组件都不会被缓存。
- `max` - 数字。最多可以缓存多少组件实例。



`include` 和 `exclude` 允许组件有条件地缓存。二者都可以用逗号分隔字符串、正则表达式或一个数组来表示：

```html
<!-- 逗号分隔字符串 -->
<keep-alive include="a,b">
  <component :is="view"></component>
</keep-alive>

<!-- 正则表达式 (使用 `v-bind`) -->
<keep-alive :include="/a|b/">
  <component :is="view"></component>
</keep-alive>

<!-- 数组 (使用 `v-bind`) -->
<keep-alive :include="['a', 'b']">
  <component :is="view"></component>
</keep-alive>
```



**匹配规则：**

1. **首先匹配组件的name选项**，如果`name`选项不可用。

2. 则匹配它的**局部注册名称**。 (父组件 `components` 选项的键值)

3. **匿名组件，不可匹配**。

   比如路由组件没有`name`选项，并且没有注册的组件名。

4. 只能匹配当前被包裹的组件，**不能匹配更下面嵌套的子组件**。

   比如用在路由上，只能匹配路由组件的`name`选项，不能匹配路由组件里面的嵌套组件的`name`选项。

5. 文档：`<keep-alive>`**不会在函数式组件中正常工作**，因为它们没有缓存实例。

6. **`exclude`的优先级大于`include`**

也就是说：当`include`和`exclude`同时存在时，`exclude`生效，`include`不生效。

```html
<keep-alive include="a,b" exclude="a">
    <!--只有a不被缓存-->
    <router-view></router-view>
</keep-alive>
```

当组件被`exclude`匹配，该组件将不会被缓存，不会调用`activated` 和 `deactivated`。

