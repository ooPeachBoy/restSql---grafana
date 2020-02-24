'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SqlPartDef = function SqlPartDef(options) {
  _classCallCheck(this, SqlPartDef);

  this.type = options.type;
  if (options.label) {
    this.label = options.label;
  } else {
    this.label = this.type[0].toUpperCase() + this.type.substring(1) + ':';
  }
  this.style = options.style;
  if (this.style === 'function') {
    this.wrapOpen = '(';
    this.wrapClose = ')';
    this.separator = ', ';
  } else if (this.style === 'alias') {
    this.separator = ' as ';
  } else if (this.style === 'on') {
    this.separator = ' = ';
  } else if (this.style === 'aggregate') {
    this.separator = ' (';
    this.wrapClose = ')';
  } else {
    this.wrapOpen = ' ';
    this.wrapClose = ' ';
    this.separator = ' ';
  }
  this.params = options.params;
  this.defaultParams = options.defaultParams;
};

var SqlPart = function () {
  function SqlPart(part, def) {
    _classCallCheck(this, SqlPart);

    this.part = part;
    this.def = def;
    if (!this.def) {
      throw { message: 'Could not find sql part ' + part.type };
    }

    this.datatype = part.datatype;

    if (part.name) {
      this.name = part.name;
      this.label = def.label + ' ' + part.name;
    } else {
      this.name = '';
      this.label = def.label;
    }

    part.params = part.params || _lodash2.default.clone(this.def.defaultParams);
    this.params = part.params;
  }

  _createClass(SqlPart, [{
    key: 'updateParam',
    value: function updateParam(strValue, index) {
      // handle optional parameters
      if (strValue === '' && this.def.params[index].optional) {
        this.params.splice(index, 1);
      } else {
        this.params[index] = strValue;
      }

      this.part.params = this.params;
    }
  }]);

  return SqlPart;
}();

var index = [];

function createPart(part) {
  // console.log("createPartHAHA", part);
  var def = index[part.type];
  if (!def) {
    return null;
  }

  return new SqlPart(part, def);
}

function register(options) {
  index[options.type] = new SqlPartDef(options);
}

register({
  type: 'column',
  style: 'label',
  //   params: [{ type: 'column', dynamicLookup: true }],
  params: [{ type: 'string', dynamicLookup: true }],
  defaultParams: ['value']
});

register({
  type: 'expression',
  style: 'expression',
  label: 'Expr:',
  params: [{ name: 'left', type: 'string', dynamicLookup: true }, { name: 'op', type: 'string', dynamicLookup: true }, { name: 'right', type: 'string', dynamicLookup: true }],
  defaultParams: ['value1', '>', 'value2']
});

register({
  type: 'macro',
  style: 'label',
  label: 'Macro:',
  params: [],
  defaultParams: []
});

register({
  type: 'aggregate',
  style: 'label',
  label: 'Agg:',
  params: [{
    name: 'agg',
    type: 'string',
    options: ['avg', 'sum', 'count', 'count_distinct'],
    dynamicLookup: true
  }, { name: 'column', type: 'string', dynamicLookup: true }],
  defaultParams: ['avg', 'column']
});

register({
  type: 'alias',
  style: 'alias',
  params: [{ name: 'field', type: 'string', dynamicLookup: true }, { name: 'alias', type: 'string', dynamicLookup: true }],
  defaultParams: ['alias']
});

register({
  type: 'on',
  style: 'on',
  params: [{ name: 'field1', type: 'string', dynamicLookup: true }, { name: 'field2', type: 'string', dynamicLookup: true }]
});

register({
  type: 'sort',
  style: 'sort',
  label: 'Order by:',
  params: [{ name: 'sort', type: 'string', options: ['asc', 'desc'], dynamicLookup: true }, { name: 'field', type: 'string', dynamicLookup: true }]
});

exports.default = {
  create: createPart
};
//# sourceMappingURL=sql_part.js.map
