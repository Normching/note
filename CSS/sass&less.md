### SASS 和 LESS 的区别

1. 编译环境

   Sass需要安装Ruby环境，是在服务端处理的；

   Less需要引用less.js来处理Less代码输出css到浏览器

2. 变量符

   Sass的变量符是`$`

   Less的变量符是`@`

3. 变量的作用域

   ```less
   /* Less-作用域 */
   @color: #00c; /* 蓝色 */
   #header {
     @color: #c00; /* red */
     border: 1px solid @color; /* 红色边框 */
   }
   
   #footer {
     border: 1px solid @color; /* 蓝色边框 */
   }
   
   /* Less-作用域编译后 */
   #header{border:1px solid #cc0000;}
   #footer{border:1px solid #0000cc;}
   ```

   ```scss
   /* scss-作用域 */
   $color: #00c; /* 蓝色 */
   
   #header {
   
     $color: #c00; /* red */
     border: 1px solid $color; /* 红色边框 */
   }
   
   #footer {
     border: 1px solid $color; /* 蓝色边框 */
   }
   
   /* Sass-作用域编译后 */
   
   #header{border:1px solid #c00}
   #footer{border:1px solid #c00}
   ```

   可以看出less和sass的变量会随着作用域的变化而不同。

4. 输出设置

   sass提供四种输出选项：`nested`，`compact`，`compressed` 和 `expanded`

   输出样式的风格可以有四种选择：

   ```scss
   nested：/* 嵌套缩进的css代码 */
   expanded：/* 展开的多行css代码 */
   compact：/* 简洁格式的css代码 */
   compressed：/* 压缩后的css代码 */
   ```

   

   less没有输出设置

5. 支持语句

   sass支持条件语句，可以使用if{}else{}，和for{}循环等

   ```scss
   /* Sample Sass “if” statement */
   
   @if lightness($color) > 30% {
   
   } @else {
   
   }
   
   /* Sample Sass “for” loop */
   
   @for $i from 1 to 10 {
     .border-#{$i} {
       border: #{$i}px solid blue;
     }
   }
   ```

   less不支持

6. 引用外部CSS文件

   `Scss`引用的外部文件命名必须以_开头，文件名如果以下划线_开头的话，Sass会认为该文件是一个引用文件，不会将其编译为css文件。

   ```scss
   // 源代码：
   @import "_test1.scss";
   @import "_test2.scss";
   @import "_test3.scss";
   // 编译后：
   h1 {
     font-size: 17px;
   }
    
   h2 {
     font-size: 17px;
   }
    
   h3 {
     font-size: 17px;
   }
   ```

   Less引用外部文件和css中的`@import`没有差异