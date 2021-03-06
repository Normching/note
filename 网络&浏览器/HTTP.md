## HTTP协议

### 一、概念

HTTP（Hypertext Transfer Protocol）：**超文本传输协议**，详细的制定了万维网服务器与客户端间的数据传输的**通信规则**。

HTTP是一个**基于TCP/IP通信协议**来传递数据（HTML文件，图片文件，查询结果等）。属于**应用层**的面向对象的协议，由于其简捷、快速的方式，适用于分布式超媒体信息系统。

HTTP协议**工作于客户端-服务器架构上**。浏览器作为HTTP客户端通过URL向HTTP服务器即WEB服务器发送所有请求。WEB服务器根据接收到的请求，向客户端发送响应信息。



### 二、特点

1. **简答快速**：客户向服务器请求服务时，只需传送请求方法和路径。请求方法常用的有GET、HEAD、POST。每种方法规定了客户与服务器联系的类型不同。由于HTTP协议简单，使得HTTP服务器的程序规模小，因而通信速度很快。
2. **灵活**：HTTP允许传输任意类型的数据对象。正在传输的类型有Content-Type加以标记。
3. **无连接**：无连接的含义是限制每次连接只处理一个请求。服务器处理完客户的请求，并收到客户的应答后，即断开连接。采用这种方式可以节省传输时间。
4. **无状态**：HTTP协议是无状态协议。无状态是指协议对于事务处理没有记忆能力。缺少状态意味着如果后续处理需要前面的信息，则它必须重传，这样可能导致每次连接传送的数据量增大。另一方面，在服务器不需要先前信息时它的应答就较快。
5. **支持B/S以及C/S模式**。



### 三、URI和URL的区别

- URI是统一资源标识符（Uniform Resource Identifiers，URI），URL是统一资源定位符（Uniform Resource Locator），URL是URI的子集。
- URI格式：协议名/方案名+登录信息（可选）+服务器地址（网址或ip）+端口号（可选）+文件路径+参数（可选）+片段标识符（可选，哈希值）
- 两者区别
  - URL是确定了文件的路径；
  - URI只是唯一的标识出文件，但是不一定是该文件的路径。



### 四、请求方式

>根据HTTP标准，HTTP请求可以使用多种请求方法。
>
>HTTP1.0定义了三种请求方法： GET, POST 和 HEAD方法。
>
>HTTP1.1新增了五种请求方法：OPTIONS, PUT, DELETE, TRACE 和 CONNECT 方法。

- **GET**  请求指定的页面信息，并返回实体主体。
- **HEAD** 类似于get请求，只不过返回的响应中没有具体的内容，用于获取报头。
- **POST** 向指定资源提交数据进行处理请求（例如提交表单或者上传文件）。数据被包含在请求体中。POST请求可能会导致新的资源的建立和/或已有资源的修改。
- **PUT**  从客户端向服务器传送的数据取代指定的文档的内容。
- **DELETE**   请求服务器删除指定的页面。
- **CONNECT** HTTP/1.1协议中预留给能够将连接改为管道方式的代理服务器。
- **OPTIONS**  允许客户端查看服务器的性能。
- **TRACE**    回显服务器收到的请求，主要用于测试或诊断。



补充：

> options：
>
> **与head类似，是客户端用于查看服务器的性能 。JavaScript的XMLHttpRequest对象进行CORS跨域资源共享时，就是使用OPTIONS方法发送嗅探请求（预请求），以判断是否有对指定资源的访问权限**
>
> 预请求：
>
> 预请求就是复杂请求（可能对服务器数据产生副作用的HTTP请求方法，如put，delete都会对服务器数据进行更修改，所以要先询问服务器）。
>  跨域请求中，浏览器自发的发起的预请求,浏览器会查询到两次请求，第一次的请求参数是options，以检测实际请求是否可以被浏览器接受
>
> 为什么需要：
>
> W3C规范要求，对复杂请求，浏览器必须先使用options发起一个预检请求，从而获知服务器是否允许该跨域请求，服务器确认以后才能发起实际的HTTP请求，否则停止第二次正式请求。



#### get和post的区别

get和post是http协议中规定的，告知服务器意图的方法。使用**get方法用来请求已被URI识别的资源，而post方法用来传输实体主体**，但**get请求也可以发送实体，post请求也可以在url上加参数。本质上，两者都是TCP连接，区别是get发送一次数据包，post发送两次数据包**。

在表面上，get和post的区别如下：

　　1、关于传入参数的大小限制，http协议里没有规定，只不过是浏览器和服务器的约定俗称。

　　2、关于传递参数的安全性，get请求的url是在服务器上有日志记录，在浏览器也能查到历史记录，但是post请求的参数都在body里面，服务器日志记录不到，浏览器历史也记录不到，所以相对来说安全些。

　　3、get请求可以缓存，post请求不能缓存



### 五、HTTP1.1与HTTP1.0的区别

- http1.0对于每个连接都得建立一次连接，一次只能传送一个请求和响应，请求就会关闭，http1.0没有Host字段；
- 而http1.1在同一个连接中可以传送多个请求和响应，多个请求可以重叠和同时进行，http1.1必须有host字段；
- http1.1中引入ETag头，它的值entity tag可以用来唯一的描述一个资源，请求消息中可以使用If-None-Match头域来匹配资源的entity tag是否有变化；
- http1.1新增了Cache-Control头域（消息请求和响应请求都可以使用），它支持一个可扩展的指令子集；
- http1.0中只定义了16个状态响应码，对错误或警告的提示不够具体。http1.1引入了一个Warning头域，增加对错误或警告信息的描述，且新增了24个状态响应码。



### 六、HTTP与HTTPS的区别

HTTP协议运行在TCP之上，明文传输，客户端与服务器都无法验证对方的身份；

HTTPS是身披SSL（Secure Socket Layer）外壳的HTTP，运行在SSL上，SSL 运行于TCP之上，是添加了加密和认证机制的HTTP。二者之间存在如下不同：

- 端口不同：HTTP与HTTPS使用不同的连接方式，用的端口也不一样，前者是80，后者443；
- 资源消耗：和HTTP通信相比，HTTPS通信会由于加解密处理消耗更多的CPU和内存资源；
- 开销：HTTPS通信需要证书，而证书一般需要向认证机构购买；
- HTTPS的加密机制一种共享密钥加密和公开密钥加密并用的混合加密机制。



### 七、Cookie & Session

#### Cookie

cookie由服务器生成，发送给浏览器，浏览器把cookie以KV形式存储到某个目录下的文本文件中，下一次请求同一网站时会把该cookie发送给服务器。

由于cookie是存在客户端上的，所以浏览器加入了一些限制确保cookie不会被恶意使用，同时不会占据太多磁盘空间。所以每个域的cookie数量是有限制的。



### Session

session，会话。服务器要知道当前请求发给自己的是谁。为了做这种区分，服务器就是要给每个客户端分配不同的"身份标识"，然后客户端每次向服务器发请求的时候，都带上这个”身份标识“，服务器就知道这个请求来自与谁了。 至于客户端怎么保存这个”身份标识“，可以有很多方式，对于浏览器客户端，大家都采用cookie的方式。

![session](https://user-gold-cdn.xitu.io/2019/6/13/16b4fb158d3a7cbb?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

1. 用户向服务器发送用户名和密码

2. 服务器验证通过后,在当前对话(session)里面保存相关数据,比如用户角色, 登陆时间等;

3. 服务器向用户返回一个`session_id`, 写入用户的`cookie`

4. 用户随后的每一次请求, 都会通过`cookie`, 将`session_id`传回服务器

5. 服务端收到 `session_id`, 找到前期保存的数据, 由此得知用户的身份



### 八、localstorage、sessionstorage、cookie

![1](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1a67fe2bd365470395d8a4be3829addc~tplv-k3u1fbpfcp-zoom-1.image)

```javascript
window.localStorage.setItem("key", "value")
window.localStorage.getItem("key")
window.localStorage.removeItem("key")

window.sessionStorage.setItem("key", "value")
window.sessionStorage.getItem("key")
window.sessionStorage.removeItem("key")
```



### 九、Token

Token 是访问资源接口（API）时所需要的资源凭证。与 Session 相比，token的优点是不需要存储数据在服务端，服务端只需要根据客户端传来的 token 进行合法验证，通过后则返回请求资源即可，减轻了服务端的资源占用压力。

目前最流行的跨域认证解决方案 JWT (JSON WEB TOKEN) 就是基于 token 实现。 以下就以 JWT 标准介绍Token

JWT 的认证流程：

1. 客户端发送用户信息给服务端请求登录
2. 服务端验证用户信息，验证通过后签发一个 Token 返回给客户端，客户端收到后会存储在 Cookie 或 localStorage 中
3. 客户端继续第二次业务请求，请求头的 Authorization 字段携带这个 Token或者直接放在 Cookie(但是这样就不能跨域了)
4. 服务端根据 headers 中的 Token 进行验证，验证通过后返回业务请求的数据

![img](https://user-gold-cdn.xitu.io/2020/1/8/16f84690abd3348b?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

JWT 的**优点**：

- 可用于应用管理，避开同源策略
- 避免 CSRF 攻击
- 实现无状态服务端，能够在多个服务间使用，可扩展性好



### 十、XSS、CSRF

#### XSS

XSS攻击的原理是，攻击者通过注入某些代码，来执行某些恶意操作。

　　比如，用户再输入框里输入一些html的代码，网页展示的时候，网页本身的代码和用户输入的html代码混在一起，导致浏览器执行了用户输入的恶意代码。

　　1、所有用户输入的地方都不安全

　　2、所有展示用户输入的地方都不安全

　　3、js 里不要用 eval

　　4、不要用 innerHTML

#### CSRF

　　CSRF攻击的原理是，攻击者构造网站后台某个功能接口的请求地址，诱导用户去点击或者用特殊方法让该请求地址自动加载。用户在登录状态下这个请求被服务端接收后会被误以为是用户合法的操作。



### 十一、状态码

![](https://i.loli.net/2021/04/11/5idoIamHfXLKgzw.png)

#### 常见状态码

- 1xx
  - 101 切换协议，在使用websocket时会用到
- 2xx
  - 200 OK 请求已成功，返回正常数据
  - 204 No Content 响应正常，但是没有响应内容，一般 PUT 和 DELETE 方法响应的是204
  - 206 Partial Content 是 HTTP 分块请求，响应的只是部分数据。
- 3xx
  - 301 Moved Permanently 永久重定向
  - 302 Found 临时重定向
  - 303 See Other 类似 302，要求重定向后的请求改为 GET 方法
  - 304 Not Modified 缓存重定向
  - 307 Temporary Redirect 临时重定向，类似 302，重定向后请求里的方法和实体不变
  - 308 Permanent Redirect 永久重定向，类似 301，重定向后请求里的方法和实体不变
- 4xx
  - 400 Bad Request 请求报文有错误
  - 401 Unauthorized 需要认证
  - 403 Forbidden 服务器禁止访问资源
  - 404 Not Found 未找到资源
  - 405 Method Not Allowed 服务器禁止了使用当前 HTTP 方法的请求
  - 413 Request Entity Too Large：请求报文里的 body 太大；
  - 414 Request-URI Too Long：请求行里的 URI 太大；
  - 429 Too Many Requests：客户端发送了太多的请求，通常是由于服务器的限连策略；
  - 431 Request Header Fields Too Large：请求头某个字段或总体太大
- 5xx
  - 500 Internal Server Error 服务器内部错误
  - 501 Not Implemented 请求的方法不被服务器支持
  - 502 Bad Gateway 网关错误
  - 503 Service Unavailable 服务器超负载或停机维护，暂时不能处理请求
  - 504 Gateway Timeout 网关超时



### 十二、HTTP2

#### HTTP1.1的缺点

1. 对头阻塞（Head-of-line blocking） HTTP/1.1协议虽然可以在同一个TCP连接上发送多个请求，但是这多个请求是有顺序的，必须处理完第一个请求才会响应下一个请求。如果第一个请求处理的特别慢，后面的所有请求就需要排队。

2. TCP 连接数限制 对于同一个域名，浏览器最多只能同时创建 6 ~ 8 个TCP连接。如果一个页面有十个请求同时发送，那么只能等第一次的 6 ~ 8 个请求都返回了才能继续接下来的 2 ~ 4 个请求。这怎么能行？`域名分片`技术应运而生。就是把资源分配到不同的域名下（可以是二级子域名），这样就解决了限制，但是滥用域名分片技术也不行，因为每个TCP连接也是很费时的。

3. Header 内容繁多，有时有可能会超过响应内容，并且每次有许多字段都是重复传输。

4. HTTP/1.1是文本协议传输，不够安全。



#### HTTP2特点

1. 使用二进制格式传输，更高效、更紧凑。
2. 对报头压缩，降低开销。
3. 多路复用，一个网络连接实现并行请求。
4. 服务器主动推送，减少请求的延迟。
5. 默认使用加密。



### 十三、HTTPS加密原理

**一、服务端发送公钥到客户端**

1. 服务端将公钥以证书的形式发送给客户端，证书内包含服务器端的公钥，证书颁发的机构，证书有效期，服务端域名等信息。

**二、客户端对证书进行校验并且向服务端发送对称密钥**

1. 客户端收到证书后，会选择是否信任证书（根据域名、颁发机构、有效期等信息来判断

   - 如果证书校验不通过，就给予风险提示并断开连接；

   - 如果校验通过，就生成一个随机数，作为对称加密的密钥。

2. 取出证书中的公钥，用该公钥对随机数（对称加密的密钥）进行加密，并将加密后的结果发送到服务器端。

**三、服务端用收到的对称密钥加密一段握手信息，发送到客户端）**

1. 服务端收到客户端发来的密文，先用自己的私钥解密，解密成功获得对称密钥
2. 用该对称密钥发送一段握手信息到客户端
3. 客户端收到后，解密成功
4. HTTPS连接成功，后续的数据传输就会使用该对称密钥进行加密

