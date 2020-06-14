# mkbug.js
A OOP style declare Nodejs Web framework base on Express.js

[官方文档](http://doc.mkbug.com)

# What is mkbug.js
`Mkbug.js`是一个`OOP`风格声明式`Nodejs`框架。只需要声明并继承了对应接口的`Class`即可轻松的开发一个`Nodejs API`应用服务。

# Mkbug.js VS Egg.js VS Think.js

| 项目 | Mkbug.js | Egg.js | Think.js |
| ---- | ---- | ---- | ---- |
| Nodejs | Nodejs 10+ | Nodejs 8+ | Nodejs 6+ |
| 底层框架 | Express.js | Koa.js | Koa.js |
| 路由管理 | 自动 | 手动 | 自动 |
| 逻辑层管理 | 自动 | 无 | 无 |
| 数据层管理 | 自动 | 无 | 无 |
| 插件管理 | 自动 | 手动 | 手动 |
| 中间件管理 | 手动+自动 | 手动 | 手动 |
| 配置信息管理 | 自动 | 无 | 无 |
| JS扩展 | 原生 | 原生 | Babel |
| 代码风格 | OOP声明式 | 原生 | 原生 |
| 响应耗时 | 有 | 无 | 无 |
| 页面渲染 | 无差别使用expressjs渲染中间件 | egg页面渲染中间件 | 兼容koa页面渲染中间件 |
| 扩展能力 | 无差别使用expressjs | egg生态中间件 | 兼容koa页面渲染中间件 |
| 维护团队 | 个人 | 阿里 | 个人 |

# Mkbug
```
  const express = require('express');

  const app = express();

  const { Mkbug } = require('mkbugjs');

  new Mkbug(app)
    .create('/demo') // 请求url前缀
    .use(middleware) // 配置第三方中间件
    .start(3000, () => { // 启动，同app.listen
    console.log('Server started!')
  })
```

# BaseController 
```
  get Logics // 逻辑抽象模块，会自动注入src/logics下的模块

  getLogic (path, def) // 支持以path的方式读取logic指定模块

  before () // 请求前置拦截器，默认返回true，如果返回false将直接返回。 也可以自己通过this.res自己处理

  after ({ duration /* 请求耗费时间 */, status /* 请求执行状态 */, originalUrl  /* 请求访问路径 */, request, response }) // 请求返回前的拦截器，通常用于处理日志

  [get|post|put|delete|head|options|update|patch]XXXAction // get接口，return 内容作为返回的结果。可以通过this.type和this.status修改返回状态
```

# BaseLogic 
```
  // 继承自BaseLogic 且存在于logic目录的模块会自动注入到 controller对象的Logics中
  const { BaseLogic } = require('mkbugjs');

  module.exports = class Test1 extends BaseLogic {
    getHelloWorld () {
      return this.Models.Test.fetchHello();
    }
  }
```

# BaseModel
```
  // 继承自BaseModel 且存在于model目录的模块会自动注入到 logic对象的Models中
  const { BaseModel, Config } = require('mkbugjs');

  module.exports = class Test extends BaseModel {
    fetchHello () {
      return new Config().WELCOME_WORD;
    }
  }
```

# BaseUtil
```
  // 用于各种工具类或者工具函数的封装 可以在controller, logic, model中直接通过this调用。支持getPath
  const { BaseUtil } = require('mkbugjs');

  module.exports = class Test extends BaseUtil {
    fetchHello () {
      return new Config().WELCOME_WORD;
    }
  }
```

# Config
```
  new Config('xxx') // 会自动读取src/config目录下文件。xxx.xxx.js的内容会覆盖xxx.js的内容实现配置信息的继承。
```

# How to use mkbug.js
```
  const express = require('express');

  const app = express();

  const { Mkbug } = require('mkbugjs')

  new Mkbug(app).create('/demo').start(3000, () => {
    console.log('Server started!')
  })
```

```
  // src/controller/test.js
  const { BaseController } = require('mkbugjs');

  module.exports = class Test extends BaseController {
    getTestAction () {
      return this.Logics.Test1.getHelloWorld();
    }
  }
  // 如果 process.env.NODE_ENV = dev 那么将返回HELLO [DEV], config是支持继承的。

  // src/logic/test.js
  const { BaseLogic } = require('mkbugjs');

  module.exports = class Test1 extends BaseLogic {
    getHelloWorld () {
      return this.Models.Test.fetchHello();
    }
  }

  // src/plugin/test.js
  const { BaseUtil } = require('mkbugjs');

  module.exports = class Util extends BaseUtil {
    getHello () {
      return 'Hello';
    }
  }

  // src/model/test.js
  const { BaseModel, Config } = require('mkbugjs');

  module.exports = class Test extends BaseModel {
    fetchHello () {
      
      return { 
        msg: new Config().WELCOME_WORD + this.Utils.Util.getHello()
      };
    }
  }

  // src/config/config.conf
  WELCOME_WORD=HELLO

  // src/config/config.dev.conf
  WELCOME_WORD=HELLO [DEV]
```

# Changelog
2020-05-22: [FEATURE]: 增加Util工具类plugin的自动注入<br/>
2020-05-22: [FEATURE]: controller, logic, model在原型链上的隔离，使之无法跨层直接访问。避免用户通过原型链跨调用层在controller中调model<br/>
2020-05-22: [BUGFIX]: Controller无法正确根据路径识别路由的问题<br/>
2020-05-10: [BUGFIX]: 修正Config默认获取src目录<br/>
2020-05-10: [BUGFIX]: 修正默认获取代码路径<br/>
2020-05-10: [OPTIMIZE]: 优化文件不存在提示<br/>
