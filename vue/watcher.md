## 三种 watcher

- render watcher
  - 场景：数据变化 → 使用数据的视图变化
  - 负责敦促视图更新
- computed watcher
  - 场景：数据变化 → 使用数据的计算属性变化 → 使用计算属性的视图变化
  - 执行敦促计算属性更新
- normal watcher
  - 场景：数据变化 → 开发者主动注册的 watch 回调函数执行
  - 用户注册的普通watcher



### render watcher

#### 建立联系

- 谁**用了**这个数据？
- 数据**变了**之后怎么办？



在视图渲染这个场景下，这两个问题的解答分别是：

- 负责生成视图的render函数要用这个数据
- 数据变了得执行render函数



##### 数据劫持

**用了**和**变了**，是可以通过对该属性值设置访问描述符（get/set）知道的。

此，需要遍历所有data属性值，用Object.defineProperty设置访问描述符（get/set）。

- 谁用了这个数据？
   触发了属性值get的就是要用到的，应该在getter里记录下使用者。
- 数据变了怎么办？
   数据变就会触发属性值set，应该在setter里告知使用者。



##### 订阅-发布

在视图渲染的场景中，render-watcher是订阅者。每个属性值都有一个依赖管理者——dep，负责记录和通知订阅者。



#### 依赖的收集与通知

收集订阅者（依赖）的流程

1. 订阅者执行回调（render函数）
2. 触发getter
3. 添加到订阅者队列（依赖队列）
4. 重复2、3直到所有的getter执行完毕



通知订阅者（依赖）的流程

1. 数据改变
2. 触发setter
3. dep通知订阅者（render watcher）
4. 订阅者执行回调（render函数）



取消订阅可以这么做：

1. 订阅者（render-watcher）也维护一个依赖集合，将依赖的属性值的dep存储在这个集合里。
2. 每当render function执行一次，也就是触发属性值的getter时，订阅者（render-watcher）会存储一份新的依赖集合。
3. 对比新旧依赖集合，找出已经不再依赖的旧dep，将render-watcher从这个旧dep的订阅者队列中删除。这样就不会通知到当前的订阅者了（render-watcher）。



### computed watcher

#### 建立联系

- data属性值变了，computed属性怎么知道？
- computed的属性值变了，模板渲染函数怎么知道？



- 得为computed属性创建watcher（正是computed-watcher），并添加到相关data属性值的订阅者队列里。watcher的回调函数正是computed属性值（函数）

- computed属性值的变化是由data属性变化引起的。因此若想模板也跟着变化，render-watcher就得添加到computed属性的相关data的订阅者队列里。



#### 依赖收集

##### computed属性的初始化

当完成所有data属性值的访问劫持劫持之后，便进入了computed属性的初始化流程：

- 遍历computed属性，为每个computed属性都创建一个watcher；
- 遍历computed属性，对每个computed属性进行get劫持

其中**get劫持**是最关键的步骤。在这个环节里，实现了我们上面提出的解决方案：

- 将computed-watcher添加到data属性值的订阅者队列。
- 将render-watcher添加到data属性值的订阅者队列。

这样就能实现，当data属性值变化后：

- render函数执行
- computed属性函数执行并返回新执行结果



##### computed属性的get劫持

render函数执行时，触发了computed属性值的get。

接着，在get里依次执行如下：

1. 执行computed属性函数，将函数返回值保存起来

   注意：执行computed函数的过程中，data属性值触发get了

2. data属性值把当前的computed属性的watch添加到订阅列队里

3. data属性把render-watcher添加到订阅队列里

4. 返回保存起来的computed函数执行结果

注意订阅队列里的顺序，**computed-watcher先，render-watcher后。**



#### 连携反应

##### 模板直接引用computed属性

当data的属性值被改变了

- data的属性值被set了
- data属性值通知所有订阅者，要更新了
- computed-watcher执行computed属性函数，返回了新的值
- render-watcher执行render回调函数，渲染了新的视图



computed-watcher回调执行了一次computed函数，render-watcher回调render函数，会触发computed属性的get进而又执行了computed函数，这不是重复执行了两次？

只能挑一个watcher，在其回调里触发computed函数的执行。这么做：

- 在computed-watcher的回调中，我们将computed属性标记为“待更新“（`dirty`）
- 在render-watcher → render函数 → computed属性值被get时，看有没有”待更新“标记，有就执行computed函数，执行完了就取消掉“待更新”标记。没有就直接返回上次执行后保存下来的结果



##### 模板间接引用computed属性

引用链如下：

模板 → computed属性1 → computed属性2 → data属性值

computed属性2就是模板的间接引用。



data属性值最后的订阅队列：

data属性值→ [computed-watcher1, computed-watcher2, render-watcher]



data属性值被set的时候，computed-watcher1、computed-watcher2相继被标记“待更新”；待到render-watcher更新时，就会依序执行：

- render函数
- computed1属性被get
- computed1属性函数执行
- computed2属性被get
- computed2属性函数执行
- 缓存并返回computed2结果给computed1
- 缓存并返回computed1结果给render函数
- render函数将computed1新值渲染到视图中