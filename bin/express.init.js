const express = require('express');
const Stream = require('stream');
const chalk = require('chalk');

const { METHODS } = require('./const');
const {
  isPromise,
  getMethod,
  createContext,
  INFO,
  WARN,
  ERROR
} = require('./utils');


const router = express.Router();

router.__proto__.attch = function (pre, controller, needParams, prefix, file) {
  const name = controller.__$$getName();
  const methods = controller.__$$getMethods();
  const _this = this;

  function createApi (method) {
    const actions = getMethod(method);
    if (actions !== null) {
      const methodName = `${actions[2] === '' ? '' : actions[2].toLowerCase()}`;
      if (METHODS.indexOf(actions[1]) > -1) {
        let uri = '';
        if (needParams) {
          uri = methodName.length > 0 ? `${pre}${methodName}` : `${pre.substring(0, pre.length - 1)}`;
        } else {
          const className = name;
          const fileName = file;
          if (className !== fileName) {
            ERROR('The name of Controller must be the same as Class name!');
            throw new Error('The name of Controller must be the same as Class name!');
          } else {
            uri = methodName.length > 0 ? `${pre}${name.toLowerCase()}/${methodName}` : `${pre}${name.toLowerCase()}`;
          }
        }
        INFO(`api = [${actions[1]}] ${prefix}${uri}`);

        _this[actions[1]](`${uri}`, async function (req, res, next) {
          const ctx = createContext(controller, req, res);
          const start = new Date().getTime();

          res.on('finish', () => {
            controller.after.call(ctx, {
              duration: new Date().getTime() - start,
              status: ctx.status,
              originalUrl: ctx.req.originalUrl,
              request: ctx.req,
              response: ctx.res
            })
          })

          for (let key in controller) {
            ctx[key] = controller[key];
          }
          
          let data = null;

          const before = controller.before.call(ctx, req, res, next);
          let beforeRet = null;
          if (isPromise(before)) {
            beforeRet = await before;
          } else {
            beforeRet = before
          }

          if (beforeRet === true) {
            data = controller[method].call(ctx, req, res, next);
  
            let result = null;
            if (isPromise(data)) {
              result = await data;
            } else {
              result = data
            }

            if (!res.finished) {
              ctx.type && res.type(ctx.type);
              res.status(ctx.status);
              if (Buffer.isBuffer(result) || typeof result === 'string') {
                res.end(result);
              } else if (result instanceof Stream) {
                result.pipe(res);
              } else {
                res.json(result);
              }
            }
          } else {
            if (!res.finished) {
              ctx.type && res.type(ctx.type);
              res.status(405);
              res.end('Method not allowed');
            }
          }
        })
      }
    } else {
      WARN(`${method} in Controller ${name} is not right HTTP Method.\n`);
    }
  }

  methods.forEach(createApi);
}
