# Vue.set

## 用法

```javascript
Vue.set(target, key, value);
// 或者
vm.$set(target, key, value)
```

注意，这里的`target`不能是`Vue实例`或者`根级属性($data)`，必须要在初始化实例前声明好所有根级属性，哪怕是一个空值。

## 源码解读

`Vue.set`和`vm.$set`指向的是同一个方法`set`。

源码位置：`/src/core/observer/index.js`

```typescript
/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 * 在对象上设置属性。 添加新属性，如果该属性尚不存在，则触发更改通知。 
 */
export function set (target: Array<any> | Object, key: null, val: any): any {
    // 1. 首先会进行判断，传入的target是否是null、undefined或是原始类型(string, number, boolean, symbol)。如果是就抛出警告。
    if (process.env.NODE_ENV !== 'production' &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(`Cannot set reactive property on undefined, null, or primitive value: ${(target: any)}`)
  }
  // 2. 判断target是否是一个数组，并且key值是否是合法key。
  // isValidArrayIndex方法源码见代码块附1
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    // 将target.length设置为target.length和key中的最大值。
    // 这是为了防止某些情况下会报错，比如: 设置的key值，大于数组的长度。
    target.length = Math.max(target.length, key)
    // 将key位置的值替换为val。注意：当调用splice的时候就会重新渲染新的视图。
    // vue重写的数组方法代码块附2
    target.splice(key, 1, val)
    return val
  }
  // 3. 如果target对象上已经存在key，且这个key不是Object原型对象上的属性。
  // 这说明key这个属性已经是响应式的了，那么就则直接将val赋值给这个属性。
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }
  // 4. __ob__指的是Observer对象。vmCount用来表示当前对象是否是根级属性。
  // _isVue用来表示是否是Vue实例。上面说过target不能是根级属性或者Vue实例。
  const ob = (target: any).__ob__
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    )
    return val
  }
  // 5. 如果target上不存在Observer对象（这说明target只是一个普通的对象，不是一个响应式数据），则直接赋值给key属性。
  if (!ob) {
    target[key] = val
    return val
  }
  // 6. ob.value其实就是target，只不过它是Vue实例上$data里的已经被追踪依赖的对象。然后在这个被observed的对象上增加key属性。让key属性也转为getter/setter。
  defineReactive(ob.value, key, val)
  // 7. 让dep通知所有watcher重新渲染组件。
  ob.dep.notify()
  return val
}
```



### 代码块附1 isValidArrayIndex函数

```javascript
function isValidArrayIndex(val) {
  var n = parseFloat(String(val));
  return n >= 0 && Math.floor(n) === n && isFinite(val);
}
```



### 代码块附2 vue重写的数组方法

```javascript
var arrayProto = Array.prototype;
var arrayMethods = Object.create(arrayProto);

var methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse',
];

methodsToPatch.forEach(function(method) {
  // 缓存原始数组的方法
  var original = arrayProto[method];
  def(arrayMethods, method, function mutator(...args) {
    const result = original.apply(this, args);
    ...省略部分源码
    // 发送更新通知
    ob.dep.notify();
    return result;
  });
});
```

`Vue`定义的7个对象原型上的方法。

![](https://user-gold-cdn.xitu.io/2020/4/27/171bba32091881ff?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)