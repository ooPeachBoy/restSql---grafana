'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GenericDatasource = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GenericDatasource = exports.GenericDatasource = function () {
  function GenericDatasource(instanceSettings, $q, backendSrv, templateSrv) {
    _classCallCheck(this, GenericDatasource);

    console.log('3333333', this);
    // console.log("instanceSettings", instanceSettings);
    this.type = instanceSettings.type;
    this.url = instanceSettings.url;
    this.name = instanceSettings.name;
    this.q = $q;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
    this.withCredentials = instanceSettings.withCredentials;
    this.headers = { 'Content-Type': 'application/json' };
    if (typeof instanceSettings.basicAuth === 'string' && instanceSettings.basicAuth.length > 0) {
      this.headers['Authorization'] = instanceSettings.basicAuth;
    }
  }

  _createClass(GenericDatasource, [{
    key: 'query',
    value: function query(options) {
      console.log(options, '😋', '😀😡🐷');

      // console.log("query222333Options", options,'1234567');
      var query = this.buildQueryParameters(options);
      // query.targets = query.targets.filter(t => !t.hide)
      // console.log("query222333Query", this.url);

      if (options.targets.length <= 0) {
        return this.q.when({ data: [] });
      }

      // if (query.targets.length <= 0) {
      //   return this.q.when({data: []});
      // }

      // if (this.templateSrv.getAdhocFilters) {
      //   query.adhocFilters = this.templateSrv.getAdhocFilters(this.name);
      // } else {
      //   query.adhocFilters = [];
      // }
      // return this.doRequest({
      //   url: this.url + '/query',
      //   data: query,
      //   method: 'POST'
      // });
      var queryStr = '?query=' + options.targets[0].target;
      var formatStr = '&datatype=' + options.targets[0].type;

      return this.doRequest({
        url: encodeURI(this.url + ('/query/' + queryStr + formatStr)).replace(/\+/g, '%2B'),
        method: 'GET'
      });
    }
  }, {
    key: 'testDatasource',
    value: function testDatasource() {
      return this.doRequest({
        url: this.url + '/',
        method: 'GET'
      }).then(function (response) {
        if (response.status === 200) {
          return { status: "success", message: "Data source is working", title: "Success" };
        }
      });
    }
  }, {
    key: 'annotationQuery',
    value: function annotationQuery(options) {
      console.log('444444444444');
      var query = this.templateSrv.replace(options.annotation.query, {}, 'glob');
      var annotationQuery = {
        range: options.range,
        annotation: {
          name: options.annotation.name,
          datasource: options.annotation.datasource,
          enable: options.annotation.enable,
          iconColor: options.annotation.iconColor,
          query: query
        },
        rangeRaw: options.rangeRaw
      };

      return this.doRequest({
        url: this.url + '/annotations',
        method: 'POST',
        data: annotationQuery
      }).then(function (result) {
        return result.data;
      });
    }
  }, {
    key: 'metricFindQuery',
    value: function metricFindQuery(query) {
      console.log("metricFindQuery", query, this.url);
      var interpolated = {
        target: this.templateSrv.replace(query, null, 'regex')
      };
      console.log("metricFindQuery", interpolated);
      return this.doRequest({
        // url: this.url + '/search',
        url: "http://mock.studyinghome.com/mock/5e74382b8c3c6c22c4271aea/example_copy/gitpid",
        data: interpolated,
        method: 'POST'
      }).then(this.mapToTextValue);
    }
    // 下拉选项

  }, {
    key: 'metricFindOption',
    value: function metricFindOption(tableName, parth) {
      var data = {
        tableName: tableName
      };
      return this.backendSrv.datasourceRequest({
        // url: '/api/tsdb/query',
        url: 'http://mock.studyinghome.com/mock/5e74382b8c3c6c22c4271aea/example_copy/' + parth,
        method: 'POST',
        data: data
      }).then(function (result) {
        return result;
      });
    }
  }, {
    key: 'mapToTextValue',
    value: function mapToTextValue(result) {
      console.log(result, '🙃');
      return _lodash2.default.map(result.data, function (d, i) {
        if (d && d.text && d.value) {
          return { text: d.text, value: d.value };
        } else if (_lodash2.default.isObject(d)) {
          return { text: d, value: i };
        }
        return { text: d, value: d };
      });
    }
  }, {
    key: 'doRequest',
    value: function doRequest(options) {
      console.log('2222222', options);
      options.withCredentials = this.withCredentials;
      options.headers = this.headers;

      return this.backendSrv.datasourceRequest(options);
    }
  }, {
    key: 'buildQueryParameters',
    value: function buildQueryParameters(options) {
      var _this = this;

      console.log('111111111', options);
      options.targets = _lodash2.default.filter(options.targets, function (target) {
        return target.target !== 'select metric';
      });

      var targets = _lodash2.default.map(options.targets, function (target) {
        var queryRow = _this.templateSrv.replace(target.target, options.scopedVars, 'regex');

        var query = JSON.parse(queryRow);
        if (query.select.aggregation.length > 0) {
          _this.filterAggregation(query.select.aggregation);
        }

        query.join.forEach(function (element) {
          if (element.query.select.aggregation.length > 0) {
            _this.filterAggregation(element.query.select.aggregation);
          }
        });

        console.log(query, '111');

        return {
          target: JSON.stringify(query),
          refId: target.refId,
          hide: target.hide,
          type: target.type || 'timeserie'
        };
      });

      options.targets = targets;

      return options;
    }
  }, {
    key: 'filterAggregation',
    value: function filterAggregation(array) {
      var varables = [];
      this.templateSrv.variables.forEach(function (ele) {
        varables.push({
          name: '$' + ele.name,
          value: ele.current.value
        });
      });
      varables.forEach(function (element) {
        if (array.length > 0) {
          array.forEach(function (ele, index) {
            console.log(ele.startsWith(element.name), '222');
            if (ele.startsWith(element.name)) {
              var field = ele.split('__');
              field[0] = "(" + element.value.join(',') + ")";
              array.splice(index, 1, [field[0], field[1]].join('__'));
            }
          });
        }
      });
    }
  }, {
    key: 'getTagKeys',
    value: function getTagKeys(options) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2.doRequest({
          url: _this2.url + '/tag-keys',
          method: 'POST',
          data: options
        }).then(function (result) {
          return resolve(result.data);
        });
      });
    }
  }, {
    key: 'getTagValues',
    value: function getTagValues(options) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        _this3.doRequest({
          url: _this3.url + '/tag-values',
          method: 'POST',
          data: options
        }).then(function (result) {
          return resolve(result.data);
        });
      });
    }
  }]);

  return GenericDatasource;
}();
//# sourceMappingURL=datasource.js.map
