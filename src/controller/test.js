const { BaseController } = require('./../../index');

module.exports = class Test3 extends BaseController {
  getListAction () {
    return this.params.id;
  }

  putScoueTextAction () {

  }
}