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