# Diff



## Virtual DOM（虚拟DOM）

 虚拟 `DOM` 就是为了解决浏览器性能问题而被设计出来的。

若一次操作中有多次更新 `DOM` 的动作，虚拟 `DOM` 不会立即操作 `DOM`，而是将这多次更新的 `diff` 内容保存到本地一个 `JS` 对象中，最终将这个 `JS` 对象一次性 `attch` 到 `DOM` 树上，再进行后续操作，避免大量无谓的计算量。

所以，用 `JS` 对象模拟 `DOM` 节点的好处是，页面的更新可以先全部反映在 `JS` 对象(虚拟 `DOM` )上，操作内存中的 `JS` 对象的速度显然要更快，等更新完成后，再将最终的 `JS` 对象映射成真实的 `DOM`，交由浏览器去绘制。



例如：

```html
<div key="1">123</div>
```

在 vue 中就会有个 `vnode` 对象与之对应，列举其中几个关键属性

```javascript
{
  elm: el, // 对应真实的DOM节点
  tag: 'div', // 标签属性
  key: 1,
  text: '123', // 文本属性
  children: []
}
```

 `vnode` 的 `children` 数组中对应子节点的 `vnode` 对象，所以在 vue 中通过 `vnode` 和真实的 DOM 树进行映射，称之为 虚拟树。

有了虚拟树，当数据更新时，可以对比新数据构建的 `vnode` 和老数据构建的 `oldVnode` 的差异，来实现精准更新。

这个对比差异的算法就是采用的 `diff` 。通过 `diff` 对比虚拟树的差异，将差异通过打补丁 `patch` 的方式更新到对应的真实DOM节点上。



## diff 过程

### patch 函数

patch 函数 是 diff 过程的入口

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/288f0feec2994bbbb5da15b29c5b191c~tplv-k3u1fbpfcp-watermark.image)



`patch` 函数接受两个参数，分别是虚拟节点 `vnode` 和 `oldVnode` ，对虚拟节点进行 `diff` 分析

```javascript
function patch (oldVnode, vnode) {
  // some code
  if (sameVnode(oldVnode, vnode)) {
    // patch existing root node
    patchVnode(oldVnode, vnode)
  } else {
    // replacing existing element
    const oldElm = oldVnode.elm
    const parentElm = nodeOps.parentNode(oldElm)

    // create new node
    createElm(
      vnode,
      null,
      parentElm,
      nodeOps.nextSibling(oldElm)
    )

    // destroy old node
    if (isDef(parentElm)) {
      removeVnodes([oldVnode], 0, 0)
    }
  }

  return vnode.elm
}
```

`patch` 函数的逻辑比较简单

1. 判断节点是否可以复用，可以复用则对节点打补丁
2. 节点不可复用，创建新的节点插入到旧节点之前，同时删除旧节点

可看出，如果节点不可复用，直接创建新节点替换，旧的子节点也将不再考虑复用。（这就对应了 diff 的假设，DOM节点跨层级的移动操作特别少，可以忽略不计。）



### sameVnode 函数

```javascript
function sameVnode (a, b) {
  return (
    a.key === b.key && (
      (
        a.tag === b.tag &&
        a.isComment === b.isComment &&
        isDef(a.data) === isDef(b.data) &&
        sameInputType(a, b)
      ) || (
        isTrue(a.isAsyncPlaceholder) &&
        a.asyncFactory === b.asyncFactory &&
        isUndef(b.asyncFactory.error)
      )
    )
  )
}
```

这段源码设计的变量比较多，只需要了解大致是通过`tag`、`key`、`inputType`来判断的。即当`tag`、`key`、`inputType`完全相同时，认定节点可复用。



### patchVnode 函数

```javascript
function patchVnode(oldVnode, vnode) {
  // some code
  if (oldVnode === vnode) {
    return;
  }

  const elm = (vnode.elm = oldVnode.elm);
  const oldCh = oldVnode.children;
  const ch = vnode.children;
  
  // 非文本节点
  if (isUndef(vnode.text)) {
    // 新旧节点都有子节点
    if (isDef(oldCh) && isDef(ch)) {
      // 子节点的同层比较
      if (oldCh !== ch)
        updateChildren(elm, oldCh, ch);
    } else if (isDef(ch)) {
      // 仅新元素有子节点
      if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, "");
      addVnodes(elm, null, ch, 0, ch.length - 1, null);
      // 仅旧元素有子节点
    } else if (isDef(oldCh)) {
      removeVnodes(oldCh, 0, oldCh.length - 1);
    } else if (isDef(oldVnode.text)) {
      // 清空文本
      nodeOps.setTextContent(elm, "");
    }
  // 文本节点，更新文本即可
  } else if (oldVnode.text !== vnode.text) {
    nodeOps.setTextContent(elm, vnode.text);
  }
}
```

patchVnode函数的逻辑并不复杂

1. 找到对应的 DOM 节点 `elm` ，并且赋值给 `vnode.elm`
2. 判断新节点类型（`vnode.text`），如果是文本节点，更新 `elm` 文本即可
3. 非文本节点下，判断新老节点的子节点
4. 如果新老节点都有子节点，走子节点的同层比较流程 `updateChildren`
5. 如果只有新节点有子节点，直接使用 `addVnodes` 为 `elm` 添加子节点（先删除文本）
6. 如果只有旧节点有子节点，使用 `removeVnodes` 移除即可
7. 如果都没有子节点，判断旧数据是否有文本节点，有则清空



### updateChildren

```javascript
function updateChildren(parentElm, oldCh, newCh) {
  let oldStartIdx = 0;
  let newStartIdx = 0;
  let oldEndIdx = oldCh.length - 1;
  let oldStartVnode = oldCh[0];
  let oldEndVnode = oldCh[oldEndIdx];
  let newEndIdx = newCh.length - 1;
  let newStartVnode = newCh[0];
  let newEndVnode = newCh[newEndIdx];
  let oldKeyToIdx, idxInOld, vnodeToMove, refElm;

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (isUndef(oldStartVnode)) {
      oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
    } else if (isUndef(oldEndVnode)) {
      oldEndVnode = oldCh[--oldEndIdx];
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      patchVnode(oldStartVnode, newStartVnode);
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartIdx];
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      patchVnode(oldEndVnode, newEndVnode);
      oldEndVnode = oldCh[--oldEndIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldStartVnode, newEndVnode)) {
      // Vnode moved right
      patchVnode(oldStartVnode, newEndVnode);
      nodeOps.insertBefore(
        parentElm,
        oldStartVnode.elm,
        nodeOps.nextSibling(oldEndVnode.elm)
      );
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldEndVnode, newStartVnode)) {
      // Vnode moved left
      patchVnode(oldEndVnode, newStartVnode);
      nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];
    } else {
      if (isUndef(oldKeyToIdx))
        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);

      idxInOld = isDef(newStartVnode.key)
        ? oldKeyToIdx[newStartVnode.key]
        : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);

      if (isUndef(idxInOld)) {
        // New element
        createElm(
          newStartVnode,
          null,
          parentElm,
          oldStartVnode.elm
        );
      } else {
        vnodeToMove = oldCh[idxInOld];
        if (sameVnode(vnodeToMove, newStartVnode)) {
          patchVnode(vnodeToMove, newStartVnode);
          oldCh[idxInOld] = undefined;
          nodeOps.insertBefore(
            parentElm,
            vnodeToMove.elm,
            oldStartVnode.elm
          );
        } else {
          // same key but different element. treat as new element
          createElm(newStartVnode, insertedVnodeQueue, parentElm);
        }
      }
      newStartVnode = newCh[++newStartIdx];
    }
  }

  if (oldStartIdx > oldEndIdx) {
    refElm = isUndef(newCh[newEndIdx + 1])
      ? null
      : newCh[newEndIdx + 1].elm;
    addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx);
  } else if (newStartIdx > newEndIdx) {
    removeVnodes(oldCh, oldStartIdx, oldEndIdx);
  }
}
```

分析前先画个图

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/576522ed8c6e4f29b4af7d73c659845b~tplv-k3u1fbpfcp-watermark.image?imageslim)

首先把 `startIdx` 、 `endIdx` 称为左指针、右指针，相应的 `startVnode` 、 `endVnode` 称为左节点、右节点

开始分析逻辑

1. 当左指针小于等于右指针，循环遍历（说明上下区间都有节点）

2. 判断旧节点边界为 `null` 的情况，向内移动指针

3. 判断左节点是否可以复用，可以则为节点打补丁（递归调用 `patchVnode` ，下同），向右移动指针

4. 否则，判断右节点是否可以复用，可以则为节点打补丁，向左移动指针

5. 否则，判断新右节点和旧左节点是否可以复用，可以则为节点打补丁，同时将旧左节点移动到旧右节点前面，再向内移动指针（移动的过程会淘汰旧的右节点）

6. 同理，判断新左节点和旧右节点，进行类似的操作

7. 当上面的几种情况都无法复用的话，接下来使用 `key` 来判断是否可以复用

   使用 `key` 来判断是否可以复用

   首先，通过 `createKeyToOldIdx` 函数来得到旧节点索引和 `key` 属性的映射，数据结构为

   ```javascript
   {
    	keyIdx: oldChIdx
   }
   ```

   再赋值 `idxInOld` 变量为新左节点的 `key` 对应的旧节点索引

   ```javascript
   idxInOld = isDef(newStartVnode.key)
   	? oldKeyToIdx[newStartVnode.key]
   	: findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
   ```
   `findIdxInOld`函数

   ```javascript
   function findIdxInOld (node, oldCh, start, end) {
     for (let i = start; i < end; i++) {
       const c = oldCh[i]
       // 返回第一个可以复用的旧节点（旧节点的key也一定会是null）
       if (isDef(c) && sameVnode(node, c)) return i
     }
   }
   ```
   如果未找到 `key` 可复用的节点索引，则创建新的节点，移动到旧左节点（`oldStartVnode.elm`）之前

   ```javascript
   if (isUndef(idxInOld)) {
     // New element
     createElm(
       newStartVnode,
       null,
       parentElm,
       oldStartVnode.elm
     );
   }
   ```

   如果找到 `key` 对应的旧节点，还要通过 `sameVnode` 再判断是否真正可复用，不可复用则创建新节点。确认 `key` 对应的旧节点可复用，为旧节点打补丁，旧节点数组元素设置为 `null` （这也是第一步要判断是否为 `null` 的原因），同时将旧节点移动到旧左节点（`oldStartVnode.elm`）之前。

   ```javascript
   vnodeToMove = oldCh[idxInOld];
   if (sameVnode(vnodeToMove, newStartVnode)) {
     patchVnode(vnodeToMove, newStartVnode);
     oldCh[idxInOld] = undefined;
     nodeOps.insertBefore(
       parentElm,
       vnodeToMove.elm,
       oldStartVnode.elm
     );
   } else {
     // same key but different element. treat as new element
     createElm(newStartVnode, insertedVnodeQueue, parentElm);
   }
   ```

   最后完成本步逻辑，向内移动指针

   ```javascript
   newStartVnode = newCh[++newStartIdx];
   ```
   
8. 执行完上面的遍历程序之后，跳出循环

9. 如果旧节点已经遍历完，则批量向后添加剩余新节点

   ```javascript
   if (oldStartIdx > oldEndIdx) {
     refElm = isUndef(newCh[newEndIdx + 1])
       ? null
       : newCh[newEndIdx + 1].elm;
     addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx);
   }
   ```

10. 如果新节点已经遍历完，则批量删除剩余旧节点

    ```javascript
    if (newStartIdx > newEndIdx) {
      removeVnodes(oldCh, oldStartIdx, oldEndIdx);
    }
    ```

至此， `updateChildren` 的逻辑也就完了，其精髓在于指针（索引）的移动。



从初始化 `Vue` 到最终渲染的整个过程

![](https://user-gold-cdn.xitu.io/2019/7/23/16c1e2486c7e0ed7?imageslim)

