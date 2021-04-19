# Flex布局

> ​	参考：阮一峰——[Flex 布局教程](http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html)

flex弹性布局，用来为盒模型提供最大的灵活性，可以简单、完整、响应式地实现各种页面布局。





## 基本概念

### 1.任何一个容器元素都能指定成flex容器

块级元素：

```css
display:flex;
```

行内元素也能使用flex布局：

```css
display:inline-flex;
```

Webkit 内核的浏览器，必须加上`-webkit`前缀。

```css
display: -webkit-flex; /* Safari */
display: flex;
```



- 设置了 `display: flex` 的元素会成为一个 **flex container**，并创建一个 **FFC(Flex Formatting Context)**，而该元素本身则会表现为一个**块级元素**，相应的，设置了 `inline-flex` 的元素则表现为**内联元素**。

- flex container 内部的元素会成为 **flex item**，包括内部的纯文本（会被包裹一个匿名块级盒子）。绝对定位元素因为不会参与到 *flex* 布局中来，所以不会成为一个 *flex item*。

- 在进行 *flex layout* 时，`flex` 会生效，使 *flex item* 完全填充至 *flex container* 的可用空间，或者收缩 *flex item* 以阻止溢出。当所有的 *flex item* 确定了尺寸之后，就会根据 `justify-content`、`align-self` 等属性进行排列和布局。



注意：设为 Flex 布局以后，子元素的`float`、`clear`和`vertical-align`属性将失效。



### 2.Flex容器和项目

使用flex布局的元素成为flex容器（flex container），简称“容器”。

它的所有子元素自动成为容器成员，成为flex项目（flex item），简称“项目”。

![](https://i.loli.net/2021/04/05/joftL9GF1DHi8Zv.png)

容器中有两个轴线，水平的主轴（main axis）和垂直的交叉轴（cross axis）。

主轴的开始位置（与边框的交叉点）叫做main start，结束位置叫做main end；

交叉轴的开始位置叫做cross start，结束位置叫做cross end。

项目默认沿主轴排列。

单个项目占据的主轴空间叫做main size，占据的交叉轴空间叫做cross size。



## 容器的属性

flex container容器有一下6个属性：

- flex-direction
- flex-wrap
- flex-flow
- justify-content
- align-items
- align-content



### flex-direction

决定主轴的方向

属性值：

- `row`（默认值）：主轴为水平方向，起点在左端。
- `row-reverse`：主轴为水平方向，起点在右端。
- `column`：主轴为垂直方向，起点在上沿。
- `column-reverse`：主轴为垂直方向，起点在下沿。



### flex-wrap

默认情况下，项目都排在一条轴线上。当轴线排不下时，它决定如何换行

属性值：

- `nowrap`（默认值）：不换行；
- `wrap`：换行，且方向与交叉轴一致；
- `wrap-reverse`：换行（使交叉轴反向）；



### flex-flow

`flex-flow`属性是`flex-direction`属性和`flex-wrap`属性的简写形式，

默认值为`row nowrap`。



### justify-content

定义了项目在主轴上的对齐方式。

属性值：

- space-between：两端对齐，项目之间的间隔都相等；

- space-around：每个项目两侧的间隔都相等。（项目之间的间隔比项目与边框的间隔大一倍）

- flex-start（默认值）：项目靠近主轴起点

- flex-end：项目靠近主轴终点

- center：项目居中



### align-items

定义项目在交叉轴上对齐方式。

属性值：

- `flex-start`：与交叉轴的起点对齐。
- `flex-end`：与交叉轴的终点对齐。
- `center`：与交叉轴的中点对齐。
- `baseline`: 项目的第一行文字的基线对齐。
- `stretch`（默认值）：如果项目未设置高度或设为auto，将占满整个容器的高度。



### align-content

属性定义了多根轴线在交叉轴方向的对齐方式。

如果项目只有一根轴线，该属性不起作用。

存在多根轴线时，该属性优先级比`align-items`高。

属性值：

- `flex-start`：与交叉轴的起点对齐。
- `flex-end`：与交叉轴的终点对齐。
- `center`：与交叉轴的中点对齐。
- `space-between`：与交叉轴两端对齐，轴线之间的间隔平均分布。
- `space-around`：每根轴线两侧的间隔都相等。（轴线之间的间隔比轴线与边框的间隔大一倍。）
- `stretch`（默认值）：轴线占满整个交叉轴。



## 项目的属性

flex item 项目有一下6个属性：

- `order`
- `flex-grow`
- `flex-shrink`
- `flex-basis`
- `flex`
- `align-self`



### order

定义项目的排列顺序。属性值为整数，数值越小，排列越靠前，默认为`0`。

```css
.item {
  order: <integer>;
}
```



### flex-grow

定义项目的放大比例，默认为`0`，即如果存在剩余空间，也不放大。

```css
.item {
  flex-grow: <number>; /* default 0 */
}
```

![](https://i.loli.net/2021/04/05/KewHA9hzf7cyRpt.png)

如果所有项目的`flex-grow`属性都为1，则它们将等分剩余空间（如果有的话）。如果一个项目的`flex-grow`属性为2，其他项目都为1，则前者占据的剩余空间将比其他项多一倍。



flex-grow 属性决定了子容器要占用父容器多少剩余空间。计算方式如下：

- 剩余空间：x
- 假设有三个flex item元素，flex-grow 的值分别为a, b, c
- 每个元素可以分配的剩余空间为： a/(a+b+c) * x，b/(a+b+c) * x，c/(a+b+c) * x



### flex-shrink

定义了项目的缩小比例，默认为1，即如果空间不足，该项目将缩小。

```css
.item {
  flex-shrink: <number>; /* default 1 */
}
```

![](https://i.loli.net/2021/04/05/SMzFJo3QjLxEY7R.jpg)

如果所有项目的`flex-shrink`属性都为1，当空间不足时，都将等比例缩小。如果一个项目的`flex-shrink`属性为0，其他项目都为1，则空间不足时，前者不缩小。

负值对该属性无效。



计算方式：

- 三个flex item元素的width: w1, w2, w3
- 三个flex item元素的flex-shrink：a, b, c
- 计算总压缩权重： sum = a * w1 + b * w2 + c * w3
- 计算每个元素压缩率： S1 = a * w1 / sum，S2 =b * w2 / sum，S3 =c * w3 / sum
- 计算每个元素宽度：width - 压缩率 * 溢出空间



### flex-basis 

定义了在分配多余空间之前，项目占据的主轴空间（main size）。浏览器根据这个属性，计算主轴是否有多余空间。它的默认值为`auto`，即项目的本来大小。

**`flex-basis` 会代替 flex item在主轴（main axis）方向上的尺寸属性（width/height，flex-basis优先级更高），并在分配剩余空间（free space）之前初始化 flex item的主轴尺寸。**

```css
.item {
  flex-basis: <length> | auto; /* default auto */
}
```



属性值指定为 `auto` 时，会取当前 *flex item* 主轴尺寸属性（width/height）的值，如果取到的值是 `auto` 时，则会使用 `content`，也就是根据 *flex item* 的内容大小来确定。



### flex

`flex`属性是`flex-grow`, `flex-shrink` 和 `flex-basis`的简写，默认值为`0 1 auto`。

后两个属性可选。

```css
.item {
  flex: none | [ <'flex-grow'> <'flex-shrink'>? || <'flex-basis'> ]
}
```

该属性有两个快捷值：`auto` (`1 1 auto`) 和 none (`0 0 auto`)。



`flex: 1` 完整值是`flex: 1 1 0`





### align-self

`align-self`属性允许单个项目有与其他项目不一样的对齐方式，可覆盖`align-items`属性。

默认值为`auto`，表示继承父元素的`align-items`属性，如果没有父元素，则等同于`stretch`。

```css
.item {
  align-self: auto | flex-start | flex-end | center | baseline | stretch;
}
```

属性值除了auto，其他都与容器的`align-items`属性完全一致。

