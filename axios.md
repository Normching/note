## axios原理分析

![](https://user-gold-cdn.xitu.io/2020/6/25/172ea81a672349ab?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



**核心只有两点：**

1. **request方法**，Axios外部方法其实都是在调用这一个方法
2. **方法内部创建一个Promise链式调用**，常用的功能，拦截器，数据修改器，http请求，就是在这个Promise链式调用中逐步被执行。**request方法返回Promise链**。我们用的就是这个返回的Promise，执行结果就在这个Promise中的状态值中。



### Axios提供的功能

1. http请求

   用来发送http请求的方法。例如axios(config)

2. 并发请求

   用来同时处理多个axios请求axios.all()

3. 拦截器（interceptors）

   - 请求拦截器(interceptors.request)是指可以拦截住每次或指定http请求，并可修改配置项

   - 响应拦截器(interceptors.response)可以在每次http请求后拦截住每次或指定http请求，并可修改返回结果项。

4. 数据修改器（transformRequest、transformResponse）

   - 请求转换器(transformRequest)是指在请求前对数据进行转换，

   - 响应转换器(transformResponse)主要对请求响应后的响应体做数据转换。

5. 取消请求

   通过config中的CancelToken属性，控制取消axios



### 基本内部工具方法

在源码中会用到一些工具方法，简单介绍一下，有助于顺利理解整个流程

- bind：给函数指定this

- forEach：遍历数组或对象，遍历对象属于自己的属性hasOwnProperty

- merge：深度合并多个对象

- extend：将一个对象的方法和属性扩展到另外一个对象上，并指定this

- mergeConfig：深度合并config的方法



### 多种形式调用Axios

```javascript
// 第一种方法
axios(config)
// 第二种
axios('example/url'[, config])
// 第三种
axios.request(config)
// 第四种
axios.get(url[, config])//'delete', 'get', 'head', 'options'请求方法一样的调用方式
// 第五种
axios.post(url[, data[, config]])// 'post', 'put', 'patch'请求方法永阳的调用方式
// 第六种
axios.all([axios1, axios2, axios3]).then(axios.spread(function (axios1response, axios2response, axios3response) {
    // 三个请求现在都执行完成
  }));
// 还可以通过axios.create方法建立自定义全局默认配置的Axios实例
axios.create(config)
```



### Axios入口

```javascript
function createInstance(defaultConfig) {
  // 建立Axios对象
  var context = new Axios(defaultConfig);

  // Axios作者的目的是提供一个对外可用的方法。
  // 并且方法中需要用到Axios对象中的config属性和拦截器。
  // 所以要把axios原型上的方法单独拿出来，绑定context这个axios实例。
  // instance方法就是后面导出的axios实例，
  // 所以到这里位置 第一种调用方法 axios(config) 就实现了
  // 在request方法的内部，有对传入参数类型的判断，如果传入第一参数为字符串，则认为是url字符串，并且把url参数添加到第二个参数config中
  // 所以就实现了第二种调用方法axios('example/url'[, config])
  var instance = bind(Axios.prototype.request, context);

  // 这里把Axios原型上的方法和属性，扩展到instance方法上，
  // 并制定了原型上方法的this为context（上面定义axios对象）
  // Axios上有request方法，这里绑定了this为context
  // 所有第三种调用方法 axios.request(config) 就实现了
  // Axios原型中其实定义了get，post，option等等方法，
  // 所以第四种axios.get(url[, config])和第五种axios.post(url[, data[, config]])方法就实现了
  utils.extend(instance, Axios.prototype, context);

  // 这里把上面建立axios对象（context）中自有的属性方法，扩展到了instance中
  // 这样instance就有了defaults、interceptors 属性，就可以添加拦截器，操作defaultConfig了
  utils.extend(instance, context);

  return instance;
}

// 调用createInstance方法，建立了Axios实例
var axios = createInstance(defaults);

// 这里也调用上面的createInstance方法，同样建立了Axios实例，
// 只不过，这里配置了自己的config作为全局默认的config
// 所以这里实现了，通过axios.create方法建立自定义默认配置的Axios实例
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// 这里添加了all方法，其实就是promise的all方法，
// 这就是第六种调用方法，并发请求的实现原理
axios.all = function all(promises) {
  return Promise.all(promises);
};
// spread方法就是把用数组作为一个参数，变成数组的每一项为一个参数。就是为了用着方便。
axios.spread = require('./helpers/spread');

module.exports = axios;// 对外导出实例
```

创建axios对象，并提供axios的多种调用方式



### Axios构造函数

```javascript
// Axios构造函数，定义l额defaults属性和interceptors属性
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

Axios.prototype.request = function request(config) {
  // 这里对传入参数类型的判断，如果传入第一参数为字符串，
  // 则认为字符串是url，并且把url参数添加到第二个参数config中
  // 所以就实现了第二种调用方法axios('example/url'[, config])
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  // ...省略了一些代码
  }

// 这里对Axios原型扩展了'delete', 'get', 'head', 'options'方法，
// 其实都是调用了request方法
// 结合上面lib / axios.js 代码中把原型中方法扩展到了instance上
// 所以第四种方法axios.get(url[, config])就实现了
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url
    }));
  };
});

// 这里对Axios原型扩展了'post', 'put', 'patch'方法，
// 其实都是调用了request方法
// 结合上面lib / axios.js 代码中把原型中方法扩展到了instance上
// 所以第五种方法axios.post(url[, data[, config]])就实现了
utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});
```



### request

#### 注册拦截器

```javascript
// 构造函数，在对象中定义handlers用来存储拦截器
function InterceptorManager() {
  this.handlers = [];
}

/**
 * 注册拦截器，并存储在handlers中
 * 参数fulfilled，用来拦截器处理数据的函数
 * 参数rejected，用来处理错误用的
 * 为什么这么设计，因为拦截器要通过Promise处理
 * 返回本条拦截器在数组handlers中的索引位置，以便提供给删除拦截器用
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * 通过注册时候返回的拦截器索引来删除拦截器
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};
/**
 * 遍历拦截器的方法
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};
```



#### 建立Promise链

```javascript
var dispatchRequest = require('./dispatchRequest');

Axios.prototype.request = function request(config) {
  // 刚进入方法，首先要处理config这里存放着http请求的必要配置
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }
  // 到这里处理完用于http请求的配置数据config
  
  // 先定义个数组，先放入一个dispatchRequest和undefined，
  // dispatchRequest前面的项目目录介绍里提到了，用来申请http请求用的
  // 为什么先建立个数组呢，作者的目的就是想先把拦截器和http请求先排好序
  // 然后再建立promise调用链，就可以一步一步的按顺序进行了
  // 入果没有理解，建议先深入研究一下Promise链式调用
  // 为什么先放dispatchRequest，又放个undefined呢
  // 可以先看一下下面怎么向chain插入拦截器的
  // 拦截器被插入到数组，并且一次向数组插入两个方法，interceptor.fulfilled, interceptor.rejected
  // 再看看后面建立promise链式调用的时候，分别用在了then的两个参数，是从数组中一起取两个的
  // 所以为了保证拦截器两个方法配对正确所以先插入[dispatchRequest, undefined]
  // 之所以用undefined，因为这里没法处理错综复杂而且多变的错误。而且这里也只能用来处理请求拦截器的错误。所以没有必要。
  // 所以用undefined，把错误抛到下面的promise，由用户定义处理方法。
  var chain = [dispatchRequest, undefined];

  // 先初始一个promise，value是config，
  // 提供给下面的promise用，也就是提供给请求拦截器用
  var promise = Promise.resolve(config);

  // 向chain数组插入请求拦截器。一对一对的插入
  // 注意这里是从前插入请求拦截器的
  // 所以用的时候，先注册的请求拦截器是后执行的，这点要注意
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  // 向chain数组插入相应拦截器。一对一对的插入
  // 相应拦截器是从后插入的
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });
  // 到此，把拦截器和http请求拍好顺序了
  // 下面就利用这个循序建立一个promise链
  // promise链让拦截器和http请求按照顺序执行了，执行顺序是：
  // 请求拦截器->http请求->相应拦截器
  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};
```



#### 数据修改器

```javascript
var defaults = {
  transformRequest: [function transformRequest(data, headers) {
   // 省略了代码
   // 修改之后要返回修改之后的data，因为需要重新给data赋值，
   // 不用返回headers，因为headers是对象，修改对象本身，对象就改变，
   // data有可能不是对象，修改之后要重新复制给config.data
   return data;
  }],

  transformResponse: [function transformResponse(data) {
    // 省略了代码
    // 返回data，因为response.data不一定是对象。所以修改后要重新复制
    return data;
  }],
};
```



### dispatchRequest解析-数据修改器执行原理

```javascript
module.exports = function dispatchRequest(config) {
  // 执行请求数据修改器
  // 这里重新给config.data赋值
  // 所以定义数据修改器的时候要返回data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );
  
  // 这里是获取http请求方法的
  var adapter = config.adapter || defaults.adapter;
  // adapter(config)是进行http请求
  // 方法返回promise对象，将这个promise作为dispatchRequest返回值，
  // 用于后面的相应拦截器处理
  return adapter(config).then(function onAdapterResolution(response) {
    // 请求成功，执行响应数据修改器
    // 这里要给response.data重新赋值，所以定义响应数据修改器要返回data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // 请求有误，也执行响应数据修改器
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};
```

在http请求之前，执行了transformRequest请求数据修改器，在请求之后无论http请求结果成功还是失败，都执行了transformResponse请求数据修改器，都是放在transformData方法中执行。



#### transformData方法内部实现

```javascript
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};
```

遍历数据修改器，把data和headers为参数传给定义的数据修改器处理，处理的结果返回给data，交由下一个修改器处理，直到修改器都执行完，最后返回处理好的data。



### 拦截器和数据修改器的区别

1. 拦截器用户配置级别的修改，**侧重整体配置层面**。

   数据修改器用于http请求和响应时数据的修改，**侧重于应用的数据层面**。

2. 拦截器侧重全局配置，一次配置全局使用。数据修改器更加灵活，可以全局配置，一次配置全局使用，也可以每次axios请求配置不同的修改器。



### http请求适配器

源码中定义适配器是这样的：

```javascript
// 这里是获取http请求方法的
// 先判断config中知否有自定义适配器，如果没有则调用默认的适配器
  var adapter = config.adapter || defaults.adapter;
```

先判断config中知否有自定义适配器，如果没有则调用默认的适配器。

**所以我们可以通过定义config的adapter属性定义自己的http请求。可以每次申请的时候定义，也可以通过拦截器定义全局的http请求适配器。**



#### 看看defaults.adapter源码

```javascript
// getDefaultAdapter方法通过判断是浏览器还是node环境选择相应的适配器
// node环境用./adapters/http
// 浏览器环境用./adapters/xhr
function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = require('./adapters/xhr');
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = require('./adapters/http');
  }
  return adapter;
}
var defaults = {
  // 默认用getDefaultAdapter方法选择适配器
  adapter: getDefaultAdapter(),
}
```

源码中默认给出了两套http请求适配器，node环境下用http适配器，浏览器环境用xhr适配器。

运行完dispatchRequest之后就是运行响应拦截器，最后返回Promise链，得到一个Promise。这里就有我们需要的结果，之后处理。



流程：入口 → 响应拦截器 → 响应数据修改器 → http请求 → 响应数据修改器 → 响应拦截器 → 返回Promise