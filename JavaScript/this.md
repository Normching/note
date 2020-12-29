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

### 情况3：