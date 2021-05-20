## rgba与opacity的区别？
`opacity`是属性，`rgba()`是函数，计算之后是个属性值。  
`rgba`一般修改的是背景色或者文本的颜色，内容不会继承透明度。  
`opacity`作用于元素和元素的内容，内容会继承透明度。

## background-attachment
`background-attachment`：如果指定了`background-image`，那么`background-attachment`决定背景是在视口中固定还是随着包含它的区块滚动的。

### 属性值
- background-attachment: scroll
  `scroll`此关键字表示背景相对于元素本身固定，而不是随着它的内容滚动。
- background-attachment: local
  `local`此关键字表示背景相对于元素的内容固定。如果一个元素拥有滚动机制，背景将会随着元素的内容滚动，并且背景的绘制区域和定位区域是相对于可滚动的区域而不是包含它们的边框。
- background-attachment: fixed
  `fixed`此关键词表示背景相对于视口固定。及时一个元素拥有滚动机制，背景也不会随着元素的内容滚动。

****

## 让一个div水平垂直居中

```html
<div class="parent">
    <div class="child"></div>
</div>
```
1.flexbox

```css
div.parent { /*可用于未知宽高*/
    display: flex;
    justify-content: center;
    align-items: center;
}
```

2.absolete绝对定位

```css
div.parent {
    position: relative;
}

div.child { /*可用于未知宽高*/
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
/* 或者 */
div.child {
    width: 50px;
    height: 10px;
    position: absolute;
    top: 50%;
    left: 50%;
    margin-left: -25px;
    margin-top: -5px;
}
/* 或者 */
div.child {
    width: 50px;
    height: 10px;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    margin: auto;
}
```

3.grid栅格布局

```css
div.parent {
    display: grid;
}

div.child {
    justify-self: center;
    align-self: center;
}
```

4.行内元素

```scss
div.parent {
    font-size: 0;
    text-align: center;
    &::before {
        content: "";
        display: inline-block;
        width: 0;
        height: 100%;
        vertical-align: middle;
    }
}

div.child {
    display: inline-block;
    vertical-align: middle;
}
```

****

## 清除浮动

> 浮动元素会脱离文档流并向左/向右浮动，直到碰到父元素或者另一个浮动元素。
>
> 浮动元素并不会占据文档流的位置，如果一个父元素下面都是浮动元素，那么这个父元素就无法被浮动元素所撑开，这样父元素就丢失了高度，这就是所谓的浮动元素造成的父元素高度坍塌问题。

#### BFC清除浮动

计算BFC高度的时候浮动子元素的高度也将计算在内，利用该规则可以清除浮动。

>假设一个父元素 parent 内部只有 2 个子元素 child，且它们都是左浮动的，这个时候 parent 如果没有设置高度的话，因为浮动造成了高度坍塌，所以 parent 的高度会是 0，此时只要给 parent 创造一个 BFC，那它的高度就能恢复了。

产生 BFC 的方式很多，我们可以给父元素设置overflow: auto 来简单的实现 BFC 清除浮动，但是为了兼容 IE 最好用 overflow: hidden。

```css
.parent {
    overflow: hidden;
}
```

通过 overflow: hidden 来清除浮动并不完美，当元素有阴影或存在下拉菜单的时候会被截断，所以该方法使用比较局限。

#### 通过clear清除浮动

```css
.clearfix::after {
    content: "";
    display: block;
    clear: both;
}
```

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/05edf023dd564a2f8d11ab47c3d56361~tplv-k3u1fbpfcp-zoom-1.image)

> 上面这个 demo 或者图里为了展示需要所以给伪元素的内容设置为了 ::after，实际使用的时候需要设置为空字符串，让它的高度为 0，从而父元素的高度都是由实际的子元素撑开。

****

## BFC

BFC——block formatting context

具备BFC特性的元素，即独立的渲染区域，或者看成是一个容器，容器内的不会影响到外面的容器。

BFC内部的子元素，在垂直方向边距会发生重叠(外边距合并，取最大值)。



### BFC的布局规则

1、内部的Box会在垂直方向，由上到下一个接一个地放置。

2、同一个BFC的两个垂直相邻的元素margin会发生重叠，同时会取margin的最大值做重叠部分。

3、BFC就是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面的元素。

4、BFC不会与已经float的元素发生重叠。

5、计算BFC的高度时，浮动元素也参与计算。



### 如何生成BFC

1、float：设置浮动

2、overflow：auto，hidden

3、position：设置absolute或者fixed

4、display：inline-block、flex、inline-flex、table-cell、table-caption



## inline元素间的空白间隙

例如：

```html
<ul>
	<li>我是第一项</li>
	<li>我是第二项</li>
	<li>我是第三项</li>
</ul>
```

```css
ul {
    list-style: none;
}

li {
    width: 25%;
    display: inline-block;
    background: green;
    text-align: center;
    height: 40px;
    line-height: 40px;
}
```

![image-20210519113215384](https://i.loli.net/2021/05/19/ZKJ3X9xdntajb1D.png)

为了页面代码的整洁可读性，往往会设置一些适当的缩进、换行，但当元素的display为inline或者inline-block的时候，这些缩进、换行就会产生空白，所以出现上述问题。

最合适的方法就是给li的父级ul设置**font-size: 0**， 给li设置**font-size: 16px**，如此就达到了所需效果；



图片间的间隙问题也是因为换行、缩进。

```css
<div>
     <img src="pic1.jpg">
     <img src="pic2.jpg">
</div>
```

图片出现间隙后，在div设置**font-size:0**，间隙就会消失。