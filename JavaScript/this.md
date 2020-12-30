# About This
## 1.this是什么？
**`this`是声明函数时附加的参数**，指向特定的对象，也就是隐藏参数。

## 2.为什么要使用this？
`this`提供了一种更加优雅的方式来隐式的传递对象引用。

通俗地说，就是让我们可以把API设计的更加简洁而且易于复用。

`this`可以帮我们省略参数。

## 3.this的指向
**`this`的指向在函数声明的时候是不会被确定的，只有函数执行的时候才被确定，`this`最终指向的是调用它的对象。**

<center>&#x2B07; </center>

**`this`的指向决定于函数的调用方式**

总结：  
1. `this`是声明函数时附加的参数，指向特定的对象，也就是隐藏参数。
2. `this`可以帮助我们省略参数。
3. `this`的指向决定于函数的调用方式。

### 情况1：全局 & 调用普通函数
1. 在非严格模式下，指向就是`window`。
2. 在严格模式下，即`"use strict"`的情况下，指向`undefined`。
3. `node`的全局环境指向`global`。

举个例子&#x1F330;
```js
console.log(this === window); // true

function demo() {
  var user = "nacho";
  console.log(this.user); // undefined
  console.log(this);      // window
}

demo();

// 函数demo实际上是被window对象调用
function demo() {
  var user = "nacho";
  console.log(this.user); // undefined
  console.log(this);      // window
}

window.demo();
```
严格模式
```js
"use strict"
function demo() {
  var user = "nacho";
  console.log(this.user); // Error
  console.log(this);      // undefined
}

demo();
```

### 情况2：函数作为对象的一个属性
如果函数作为对象的一个属性时，**并且作为对象的一个属性被调用时**，函数中的`this`指向该对象。
```js
var obj = {
  user: "nacho",
  fn: function() {
    console.log(this.user) // nacho
  }
};

obj.fn();
```
this的指向在函数创建时是决定不了的  
在调用的时候才可以决定，谁调用就指向谁

```js
var obj = {
  user: "nacho",
  fn: function() {
    console.log(this.user) // nacho
  }
};
window.obj.fn();
```
这段代码跟上面的代码几乎是一样的，但是这里为什么没有指向window呢？  
```js
var obj = {
  a: 1,
  b: {
    a: 2,
    fn: function() {
      console.log(this.a); // 2
    }
  }
};

obj.b.fn();
```
以下几种情况需要记住：
1. 如果一个函数中有`this`，但是它没有被上一级的对象调用，那么`this`就会指向`window`（非严格模式下）。
2. 如果一个函数中有`this`，这个函数又被上一级的对象所调用，那么`this`就会指向上一级的对象。
3. 如果一个函数中有`this`，这个函数中包含多个对象，尽管这个函数是被最外层的对象所调用，`this`却会指向它的上一级对象。
```js
var obj = {
  a: 1,
  b: {
    // a: 2,
    fu: function() {
      console.log(this.a); // undefined
    }
  }
};
obj.b.fn();
```
我们可以看到，对象b中没有属性a，这个`this`指向的也是对象b，因为`this`只会指向它的上一级对象，不管这个对象中有没有`this`要的东西  
```js
var obj = {
  a: 1,
  b: {
    a: 2,
    fu: function() {
      console.log(this.a); // undefined
      console.log(this); // window
    }
  }
};
var demo = obj.b.fn;
demo();
```
在上面的代码中，`this`指向的是`window`。  
`this`永远指向的都是最后调用它的对象，也就是看它执行的时候是谁调用的。  
上面的例子中虽然函数`fn`是被对象b所引用了，但是在将`fn`赋值给变量`demo`的时候并没有执行，所以最终`this`指向的是`window`。

### 情况3：call、apply、bind
```js
function returnThis() {
  return this;
}
var user = { name: "nacho" };

returnThis();           // window
returnThis.call(user);  // nacho
returnThis.apply(user); // nacho
```
这里就是`Object.prototype.call`和`Object.prototype.apply`方法，他们可以用过参数来执行`this`

```js
function returnThis() {
  return this;
}

var user1 = { name: "nacho" };
var user1returnThis = returnThis.bind(user1);
user1returnThis(); // nacho
var user2 = { name: "normching" }；
user1returnThis.call(user2); // nacho
```
`Object.prototype.bind`通过一个新函数来提供了永久的绑定，而且会覆盖`call`和`apply`的指向

### 情况4：构造函数
```js
function Fn() {
  this.user = "nacho";
}
var demo = new Fn();
console.log(demo.user); // nacho
```
这里`new`关键字改变了`this`的指向，`new`关键字创建了一个对象实例，所以可以通过对象`demo``.`语法调用函数`Fn`里面的`user`  
这个`this`指向对象`demo`  

注意：这里`new`会覆盖`bind`的绑定
```js
function demo() {
  console.log(this);
}

demo(); // window
new demo(); // demo
var user1 = { name: "nacho" };
demo.call(user1); // nacho

var user2 = demo.bind(user1);
user2(); // nacho
new user2(); // demo
```

构造函数的prototype
```js
function Fn() {
  this.name = "nacho";
}
Fn.prototype.getName = function () {
  console.log(this.name);
}
var f1 = new Fn();
f1.getName(); // nacho
```
**不仅仅是构造函数的prototype，即便是在整个原型链中，this代表的也是当前对象的值。**

### 情况5：return
```js
function fn() {
  this.user = "nacho";
  return {}
}
var a = new fn;
console.log(a.user); // undefined

function fn() {
  this.user = "nacho";
  return function() {};
}
var a = new fn;
console.log(a.user); // undefined

function fn() {
  this.user = "nacho";
  return 1;
}
var a = new fn;
console.log(a.user); // nacho

function fn() {
  this.user = "nacho";
  return undefined;
}
var a = new fn;
console.log(a.user); // nacho
```
总结：  
如果返回值是一个对象，那么`this`指向就是返回的对象；
如果返回值不是一个对象，那么`this`还是指向函数的实例；

`null`比较特殊，虽然它是对象，但是这里`this`还是指向那个函数的实例。
```js
function fn() {
  this.user = "nacho";
  return null;
}
var a = new fn;
console.log(a.user); // nacho
```

### 情况6：箭头函数
箭头函数中的this在代码运行前就已经被确定了，谁也不能把它覆盖。  
为了方便让回调函数中this使用当前作用域，让this指针更加的清晰，所以对于箭头函数中this的指向，只要看它创建的位置即可。
```js
function callback(aaa) {
  aaa();
}
callback(() => { console.log(this) }); //window

var user = {
  name: "nacho",
  callback: callback,
  callback1() {
    callback(() => { console.log(this) });
  }
}
user.callback(() => { console.log(this) }); // window
user.callback1(() => { console.log(this) }); // user
```