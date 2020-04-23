'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GenericDatasourceQueryCtrl = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('./css/query-editor.css!');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _sdk = require('app/plugins/sdk');

var _sql_part = require('./sql_part');

var _sql_part2 = _interopRequireDefault(_sql_part);

var _data = require('@grafana/data');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GenericDatasourceQueryCtrl = exports.GenericDatasourceQueryCtrl = function (_QueryCtrl) {
  _inherits(GenericDatasourceQueryCtrl, _QueryCtrl);

  function GenericDatasourceQueryCtrl($scope, $injector, uiSegmentSrv, $q) {
    _classCallCheck(this, GenericDatasourceQueryCtrl);

    var _this = _possibleConstructorReturn(this, (GenericDatasourceQueryCtrl.__proto__ || Object.getPrototypeOf(GenericDatasourceQueryCtrl)).call(this, $scope, $injector));

    _this.scope = $scope;
    _this.uiSegmentSrv = uiSegmentSrv;
    _this.$q = $q;
    _this.lastQueryError = null;
    _this.panelCtrl.events.on(_data.PanelEvents.dataReceived, _this.onDataReceived.bind(_this), $scope);
    _this.panelCtrl.events.on(_data.PanelEvents.dataError, _this.onDataError.bind(_this), $scope);

    _this.panelCtrl.events.on(_data.PanelEvents.render, _this.onDataRefresh.bind(_this), $scope);
    console.log(_this, '11111111111111111111');
    _this.joinQueryList = _this.joinQueryList || [];
    _this.updateProjection();

    _this.target.tableSelect = _this.target.tableSelect || [];

    _this.formats = [{ text: 'Time series', value: 'grafana.timeserie' }, { text: 'Table', value: 'grafana.table' }];
    _this.types = [{ text: 'Left Join', value: 'left_join' }, { text: 'Inner Join', value: 'inner_join' }, { text: 'Full Join', value: 'full_join' }];

    // this.target.tableSegment = null;
    _this.target.target = _this.target.target || '';
    _this.target.type = _this.target.type || 'grafana.timeserie';

    _this.target.tableSegment = _this.uiSegmentSrv.newSegment({ "value": _this.target.table || 'select table', "fake": true });
    _this.target.table = _this.target.table || _this.target.tableSegment.value;

    _this.target.selectionsParts = _this.target.selectionsParts || [];
    _this.selectionAdd = _this.uiSegmentSrv.newPlusButton();

    _this.selectMenu = [];
    _this.selectMenu.push(_this.uiSegmentSrv.newSegment({ type: 'expression', value: 'Expression' }));
    // this.selectionsParts = this.selectionsParts || [];
    _this.target.whereParts = _this.target.whereParts || [];
    _this.whereAdd = _this.uiSegmentSrv.newPlusButton();
    _this.target.aggParts = _this.target.aggParts || [];
    _this.aggAdd = _this.uiSegmentSrv.newPlusButton();
    _this.target.groupParts = _this.target.groupParts || [];
    _this.groupAdd = _this.uiSegmentSrv.newPlusButton();
    _this.target.joinQueryList = _this.target.joinQueryList || [];

    _this.target.sortParts = _this.target.sortParts || [];
    _this.sortAdd = _this.uiSegmentSrv.newPlusButton();
    _this.target.fieldParts = _this.target.fieldParts || [];
    _this.fieldAdd = _this.uiSegmentSrv.newPlusButton();

    _this.target.limitSegment = _this.uiSegmentSrv.newSegment({ "value": _this.target.limit || '1000', "fake": true });
    _this.target.limit = _this.target.limitSegment.value || '1000';
    _this.target.queryLimitSegment = _this.uiSegmentSrv.newSegment({ "value": _this.target.queryLimit || '1000', "fake": true });
    _this.target.queryLimit = _this.target.queryLimitSegment.value || '1000';
    _this.target.query = _this.target.query || {
      // restSql协议结构定义
      "select": {
        "from": "",
        "filter": {},
        "group_by": [],
        "aggregation": [],
        "sort": []
      },
      "join": [],
      "sort": [],
      "fields": [],
      "limit": 200
    };

    _this.varables = _this.varables || [];
    _this.panelCtrl.datasource.templateSrv.variables.forEach(function (ele) {
      //  console.log(ele, '🐷');
      _this.varables.push({
        name: '$' + ele.name,
        value: ele.current.value
      });
    });
    return _this;
  }

  _createClass(GenericDatasourceQueryCtrl, [{
    key: 'updateProjection',
    value: function updateProjection() {
      var _this2 = this;

      if (this.target.target) {
        var _loop = function _loop(key) {
          if (key.includes('Parts') && _this2.target[key].length > 0) {
            _this2.target[key].forEach(function (ele, index) {
              _this2.target[key].splice(index, 1, _sql_part2.default.create(ele.part));
            });
          } else if (key.includes('Segment')) {
            _this2.target[key] = _this2.uiSegmentSrv.newSegment({ "value": _this2.target[key].value, "fake": true });
          } else {
            _this2.target.type = _this2.target.type;
          }
        };

        for (var key in this.target) {
          _loop(key);
        }
        if (this.target.joinQueryList.length > 0) {
          this.target.joinQueryList.forEach(function (ele, index) {
            var _loop2 = function _loop2(key) {
              if (Array.isArray(ele[key] && ele[key].length > 0)) {
                ele[key].forEach(function (element, i) {
                  ele[key].splice(i, 0, _sql_part2.default.create(element.part));
                });
              } else if (key.includes('Add')) {
                ele[key] = _this2.uiSegmentSrv.newPlusButton();
              } else if (key == 'type') {
                ele[key] = ele.type;
              } else if (key == 'table' || key == 'limit') {
                ele[key] = _this2.uiSegmentSrv.newSegment({ "value": ele[key].value, "fake": true });
              }
            };

            for (var key in ele) {
              _loop2(key);
            }
          });
        }
      }
    }
  }, {
    key: 'onDataRefresh',
    value: function onDataRefresh() {
      // console.log('数据重新加载了');
    }
  }, {
    key: 'transformToSegments',
    value: function transformToSegments() {
      var _this3 = this;

      return function (result) {
        var segments = _lodash2.default.map(results, function (segment) {
          return _this3.uiSegmentSrv.newSegment({
            value: segment.text,
            expandable: segment.expandable
          });
        });
        return segments;
      };
    }
  }, {
    key: 'onDataReceived',
    value: function onDataReceived(dataList) {
      console.log(dataList);
      this.lastQueryError = null;
    }
  }, {
    key: 'onDataError',
    value: function onDataError(err) {
      if (this.target.target) {
        this.lastQueryError = err.message;
      }
    }
  }, {
    key: 'getOptions',
    value: function getOptions() {
      var options = [];
      options.push(this.uiSegmentSrv.newSegment({ type: 'expression', value: 'Expression' }));
      console.log("tttttt getOptions", options);
      return Promise.resolve(options);
    }
  }, {
    key: 'removePart',
    value: function removePart(parts, part) {
      var index = _lodash2.default.indexOf(parts, part);
      parts.splice(index, 1);
    }
  }, {
    key: 'onFormatChanged',
    value: function onFormatChanged() {
      // this.datasource.metricVariables
      this.updateRestSql();
    }
  }, {
    key: 'onJoinTypeChange',
    value: function onJoinTypeChange() {
      console.log('😡😂');
      this.updateRestSql();
    }
  }, {
    key: 'onTableChanged',
    value: function onTableChanged() {
      var _this4 = this;

      console.log("tableChanged", this, this.target.tableSegment.value);
      this.target.table = this.target.tableSegment.value;
      var parth = 'getList';
      this.datasource.metricFindOption(this.target.table, parth).then(function (result) {
        if (result.status === 200) {
          _this4.target.tableSelect = result.data.data.tables[0].rows;
        }
      });
      this.updateRestSql();
    }
  }, {
    key: 'onJoinTableChanged',
    value: function onJoinTableChanged(joinIndex) {
      console.log("onJoinTableChanged", joinIndex);
      // this.target.joinQueryList[joinIndex].table = ;
      this.updateRestSql();
    }
  }, {
    key: 'onLimitChanged',
    value: function onLimitChanged() {
      // console.log("onLimitChanged");
      this.target.limit = this.target.limitSegment.value;
      this.updateRestSql();
    }
  }, {
    key: 'onLimitQueryChanged',
    value: function onLimitQueryChanged() {
      this.target.queryLimit = this.target.queryLimitSegment.value;
      this.updateRestSql();
    }
  }, {
    key: 'onLimitJoinChanged',
    value: function onLimitJoinChanged(joinIndex) {
      this.target.joinQueryList[joinIndex].limit = this.uiSegmentSrv.newSegment({ "value": this.target.joinQueryList[joinIndex].limit.value || '1000', "fake": true });
      this.updateRestSql();
    }
  }, {
    key: 'addSelectionAction',
    value: function addSelectionAction(part, index) {
      console.log(1111, part, index);
      this.getOptions();
      var express = _sql_part2.default.create({ type: 'column', params: ['column'] });
      this.target.selectionsParts.push(express);
      this.resetPlusButton(this.selectionAdd);
    }
  }, {
    key: 'handleSelectionsPartEvent',
    value: function handleSelectionsPartEvent(part, index, event) {
      console.log("tttttt handleSelectionsPartEvent", event, index, part, '---');
      // if (event.name = "get-param-options")
      if (event.name === "get-part-actions") {
        return this.$q.when([{ text: 'Remove', value: 'remove' }]);
      } else if (event.name === "action" && event.action.value === "remove") {
        this.removePart(this.target.selectionsParts, part);
        // this.target.selectionsParts.splice(index, 1, null);
        this.updateRestSql();
        console.log(this.target.selectionsParts, '------');
      } else if (event.name === "part-param-changed") {
        // console.log(this.target.selectionsParts);
        this.target.selectionsParts.forEach(function (item, i) {});
        this.updateRestSql();
      } else if (event.name === "get-param-options") {
        return Promise.resolve(this.uiSegmentSrv.newOperators(this.target.tableSelect));
      }
    }
  }, {
    key: 'addJoinSelectionAction',
    value: function addJoinSelectionAction(joinIndex, expIndex) {
      console.log("addJoinSelectionAction", joinIndex, expIndex);
      var express = _sql_part2.default.create({ type: 'column', params: ['column'] });
      this.target.joinQueryList[joinIndex].selections.push(express);
      this.resetPlusButton(this.target.joinQueryList[joinIndex].selectionAdd);
    }
  }, {
    key: 'handleJoinSelectionsPartEvent',
    value: function handleJoinSelectionsPartEvent(part, joinIndex, expIndex, event) {
      console.log("handleJoinSelectionsPartEvent", joinIndex, expIndex);
      if (event.name === "get-part-actions") {
        return this.$q.when([{ text: 'Remove', value: 'remove' }]);
      } else if (event.name === "action" && event.action.value === "remove") {
        // this.removePart(this.target.joinQueryList[joinIndex].selections, part);
        this.target.joinQueryList[joinIndex].selections.splice(expIndex, 1);
        this.updateRestSql();
      } else if (event.name === "part-param-changed") {
        this.updateRestSql();
      }
    }
  }, {
    key: 'addWhereAction',
    value: function addWhereAction(part, index) {
      var express = _sql_part2.default.create({ type: 'expression', params: ['column', '=', 'value'] });

      this.target.whereParts.push(express);
      this.resetPlusButton(this.whereAdd);
    }
  }, {
    key: 'handleWherePartEvent',
    value: function handleWherePartEvent(part, index, event) {
      // console.log("handleWherePartEvent", part, index, event);
      if (event.name === "get-param-options" && event.param.name === "op") {
        // 暂时只支持展开操作符列表
        var operators = ['=', '<', '<=', '>', '>=', 'CONTAINS', 'STARTSWITH', 'ENDSWITH', 'RANGE', 'IN'];
        return Promise.resolve(this.uiSegmentSrv.newOperators(operators));
      } else if (event.name === "get-part-actions") {
        return this.$q.when([{ text: 'Remove', value: 'remove' }]);
      } else if (event.name === "action" && event.action.value === "remove") {
        this.target.whereParts.splice(index, 1);
        this.updateRestSql();
      } else if (event.name === "part-param-changed") {
        console.log(part, index, '😎');
        this.updateRestSql();
      } else {
        return Promise.resolve([]);
      }
    }
  }, {
    key: 'addJoinWhereAction',
    value: function addJoinWhereAction(joinIndex, expIndex) {
      var express = _sql_part2.default.create({ type: 'expression', params: ['column', '=', 'value'] });
      console.log("addWhereAction", express);
      this.target.joinQueryList[joinIndex].where.push(express);
      this.resetPlusButton(this.target.joinQueryList[joinIndex].whereAdd);
    }
  }, {
    key: 'handleJoinWherePartEvent',
    value: function handleJoinWherePartEvent(part, joinIndex, expIndex, event) {
      console.log("handleJoinWherePartEvent", event);
      if (event.name === "get-param-options" && event.param.name === "op") {
        // 暂时只支持展开操作符列表
        var operators = ['=', '<', '<=', '>', '>=', 'CONTAINS', 'STARTSWITH', 'ENDSWITH', 'RANGE', 'IN'];
        return Promise.resolve(this.uiSegmentSrv.newOperators(operators));
      } else if (event.name === "get-part-actions") {
        return this.$q.when([{ text: 'Remove', value: 'remove' }]);
      } else if (event.name === "action" && event.action.value === "remove") {
        this.target.joinQueryList[joinIndex].where.splice(expIndex, 1);
      } else if (event.name === "part-param-changed") {
        this.updateRestSql();
      } else {
        return Promise.resolve([]);
      }
    }
  }, {
    key: 'addAggAction',
    value: function addAggAction() {
      var express = _sql_part2.default.create({ type: 'aggregate', params: ['avg', 'column'] });
      console.log("addAggAction", express);
      this.target.aggParts.push(express);
      this.resetPlusButton(this.aggAdd);
    }
  }, {
    key: 'handleAggPartEvent',
    value: function handleAggPartEvent(part, index, event) {
      console.log("handleAggPartEvent", event, part, index);
      if (event.name === "get-param-options" && event.param.name === "agg") {
        // 暂时只支持展开操作符列表
        var operators = event.param.options;
        return Promise.resolve(this.uiSegmentSrv.newOperators(operators));
      } else if (event.name === "get-part-actions") {
        return this.$q.when([{ text: 'Remove', value: 'remove' }]);
      } else if (event.name === "action" && event.action.value === "remove") {
        this.target.aggParts.splice(index, 1);
        this.updateRestSql();
      } else if (event.name === "part-param-changed") {
        this.updateRestSql();
      } else {
        return Promise.resolve([]);
      }
    }
  }, {
    key: 'addJoinAggAction',
    value: function addJoinAggAction(joinIndex) {
      var express = _sql_part2.default.create({ type: 'aggregate', params: ['avg', 'column'] });
      console.log("addJoinAggAction", express);
      this.target.joinQueryList[joinIndex].aggs.push(express);
      this.resetPlusButton(this.target.joinQueryList[joinIndex].aggAdd);
    }
  }, {
    key: 'handleJoinAggPartEvent',
    value: function handleJoinAggPartEvent(part, joinIndex, expIndex, event) {
      console.log("handleJoinAggPartEvent", event);
      if (event.name === "get-param-options" && event.param.name === "agg") {
        // 暂时只支持展开操作符列表
        var operators = event.param.options;
        return Promise.resolve(this.uiSegmentSrv.newOperators(operators));
      } else if (event.name === "get-part-actions") {
        return this.$q.when([{ text: 'Remove', value: 'remove' }]);
      } else if (event.name === "action" && event.action.value === "remove") {
        this.target.joinQueryList[joinIndex].aggs.splice(expIndex, 1);
        this.updateRestSql();
      } else if (event.name === "part-param-changed") {
        this.updateRestSql();
      } else {
        return Promise.resolve([]);
      }
    }
  }, {
    key: 'addGroupAction',
    value: function addGroupAction() {
      var express = _sql_part2.default.create({ type: 'column', params: ['column'] });
      console.log("addGroupsAction", express);
      this.target.groupParts.push(express);
      this.resetPlusButton(this.groupAdd);
    }
  }, {
    key: 'handleGroupPartEvent',
    value: function handleGroupPartEvent(part, index, event) {
      console.log("handleGroupsPartEvent");
      if (event.name === "get-part-actions") {
        return this.$q.when([{ text: 'Remove', value: 'remove' }]);
      } else if (event.name === "action" && event.action.value === "remove") {
        this.target.groupParts.splice(index, 1);
        this.updateRestSql();
      } else if (event.name === "part-param-changed") {
        this.updateRestSql();
      }
    }
  }, {
    key: 'addJoinGroupAction',
    value: function addJoinGroupAction(part, joinIndex, expIndex) {
      var express = _sql_part2.default.create({ type: 'column', params: ['column'] });
      console.log("addGroupsAction", express);
      this.target.joinQueryList[joinIndex].groups.push(express);
      this.resetPlusButton(this.target.joinQueryList[joinIndex].groupAdd);
    }
  }, {
    key: 'handleJoinGroupPartEvent',
    value: function handleJoinGroupPartEvent(part, joinIndex, expIndex, event) {
      console.log("handleJoinGroupPartEvent");
      if (event.name === "get-part-actions") {
        return this.$q.when([{ text: 'Remove', value: 'remove' }]);
      } else if (event.name === "action" && event.action.value === "remove") {
        this.target.joinQueryList[joinIndex].groups.splice(expIndex, 1);
        this.updateRestSql();
      } else if (event.name === "part-param-changed") {
        this.updateRestSql();
      }
    }
  }, {
    key: 'addJoinOnAction',
    value: function addJoinOnAction(part, joinIndex, expIndex) {
      var express = _sql_part2.default.create({ type: 'on', params: ['field', 'field'] });
      console.log("addJoinOnAction", express);
      this.target.joinQueryList[joinIndex].on.push(express);
      this.resetPlusButton(this.target.joinQueryList[joinIndex].onAdd);
    }
  }, {
    key: 'handleJoinOnPartEvent',
    value: function handleJoinOnPartEvent(part, joinIndex, expIndex, event) {
      console.log("handleJoinOnPartEvent", event);
      if (event.name === "get-param-options" && event.param.name === "op") {
        // 暂时只支持展开操作符列表
        var operators = ['='];
        return Promise.resolve(this.uiSegmentSrv.newOperators(operators));
      } else if (event.name === "get-part-actions") {
        return this.$q.when([{ text: 'Remove', value: 'remove' }]);
      } else if (event.name === "action" && event.action.value === "remove") {
        this.target.joinQueryList[joinIndex].on.splice(expIndex, 1);
      } else if (event.name === "get-param-options" && event.param.name === "field1") {
        // on field1=field2，field1是join的表中的字段，field2是原始表中的字段，这里做成可选项
        console.log("handleJoinOnPartEvent", this.target.joinQueryList[joinIndex]);
        var options = [];
        this.target.joinQueryList[joinIndex].selections.forEach(function (part) {
          options.push(part["params"][0]);
        });
        return Promise.resolve(this.uiSegmentSrv.newOperators(options));
      } else if (event.name === "get-param-options" && event.param.name === "field2") {
        var _options = [];
        this.target.selectionsParts.forEach(function (part) {
          _options.push(part["params"][0]);
        });
        return Promise.resolve(this.uiSegmentSrv.newOperators(_options));
      } else if (event.name === "part-param-changed") {
        this.updateRestSql();
      } else {
        return Promise.resolve([]);
      }
    }
  }, {
    key: 'addJoinExportAction',
    value: function addJoinExportAction(part, joinIndex, expIndex) {
      var express = _sql_part2.default.create({ type: 'alias', params: ['fields', 'alias'] });
      console.log("addJoinOnAction", express);
      this.target.joinQueryList[joinIndex].export.push(express);
      this.resetPlusButton(this.target.joinQueryList[joinIndex].exportAdd);
    }
  }, {
    key: 'onJoinLimitChanged',
    value: function onJoinLimitChanged(joinIndex) {
      this.target.joinQueryList[joinIndex].limit = this.target.joinQueryList[joinIndex].limit.value;
      this.updateRestSql();
    }
  }, {
    key: 'handleJoinExportPartEvent',
    value: function handleJoinExportPartEvent(part, joinIndex, expIndex, event) {
      console.log("handleJoinExportPartEvent", event);
      if (event.name === "get-part-actions") {
        return this.$q.when([{ text: 'Remove', value: 'remove' }]);
      } else if (event.name === "action" && event.action.value === "remove") {
        this.target.joinQueryList[joinIndex].export.splice(expIndex, 1);
        this.updateRestSql();
      } else if (event.name === "get-param-options" && event.param.name === "field") {
        var options = this.getExportOptions(this.target.joinQueryList[joinIndex].selections, this.target.joinQueryList[joinIndex].aggs);
        return Promise.resolve(this.uiSegmentSrv.newOperators(options));
      } else if (event.name === "part-param-changed") {
        this.updateRestSql();
      } else {
        return Promise.resolve([]);
      }
    }
  }, {
    key: 'addSortAction',
    value: function addSortAction(index) {
      var express = _sql_part2.default.create({ type: 'sort', params: ['asc', 'field'] });
      console.log("addSortAction", index);
      this.target.sortParts.push(express);
      this.resetPlusButton(this.sortAdd);
    }
  }, {
    key: 'handleSortPartEvent',
    value: function handleSortPartEvent(part, index, event) {
      console.log("handleSortPartEvent", event);
      if (event.name === "get-part-actions") {
        return this.$q.when([{ text: 'Remove', value: 'remove' }]);
      } else if (event.name === "action" && event.action.value === "remove") {
        // console.log(this.target.sortParts,'====');

        this.target.sortParts.splice(index, 1);
        this.updateRestSql();
        // console.log(this.target.sortParts,'====');
      } else if (event.name === "get-param-options" && event.param.name === "field") {
        return Promise.resolve(this.uiSegmentSrv.newOperators(this.getAllFields()));
      } else if (event.name === "part-param-changed") {
        this.updateRestSql();
      } else {
        return Promise.resolve([]);
      }
    }
  }, {
    key: 'addFieldAction',
    value: function addFieldAction(index) {
      var express = _sql_part2.default.create({ type: 'alias', params: ['fields', 'alias'] });
      console.log("addSortAction", index, express);
      this.target.fieldParts.push(express);
      this.resetPlusButton(this.fieldAdd);
    }
  }, {
    key: 'handleFieldPartEvent',
    value: function handleFieldPartEvent(part, index, event) {
      // console.log("handleFieldPartEvent", event);
      if (event.name === "get-part-actions") {
        return this.$q.when([{ text: 'Remove', value: 'remove' }]);
      } else if (event.name === "action" && event.action.value === "remove") {

        this.target.fieldParts.splice(index, 1);
        this.updateRestSql();
      } else if (event.name === "get-param-options") {
        return Promise.resolve(this.uiSegmentSrv.newOperators(this.getAllFields()));
      } else if (event.name === "part-param-changed") {
        this.updateRestSql();
      } else {
        return Promise.resolve([]);
      }
    }
  }, {
    key: 'resetPlusButton',
    value: function resetPlusButton(button) {
      var plusButton = this.uiSegmentSrv.newPlusButton();
      button.html = plusButton.html;
      button.value = plusButton.value;
    }
  }, {
    key: 'addJoin',
    value: function addJoin() {
      var queryObj = {
        type: "left_join",
        table: this.uiSegmentSrv.newSegment({ "value": "select table", "fake": true }),
        selections: [],
        selectionAdd: this.uiSegmentSrv.newPlusButton(),
        where: [],
        whereAdd: this.uiSegmentSrv.newPlusButton(),
        aggs: [],
        aggAdd: this.uiSegmentSrv.newPlusButton(),
        groups: [],
        groupAdd: this.uiSegmentSrv.newPlusButton(),
        on: [],
        onAdd: this.uiSegmentSrv.newPlusButton(),
        export: [],
        exportAdd: this.uiSegmentSrv.newPlusButton(),
        limit: this.uiSegmentSrv.newSegment({ "value": '1000', "fake": true })
      };
      this.target.joinQueryList.push(queryObj);
      console.log("addJoin", this.target.joinQueryList);
    }
  }, {
    key: 'delJoin',
    value: function delJoin(index) {
      this.target.joinQueryList.splice(index, 1);
    }
  }, {
    key: 'getAllFields',
    value: function getAllFields() {
      // 获取select的字段，aggregate的字段，以及所有join表中的export字段

      var mainFields = this.getExportOptions(this.target.selectionsParts, this.target.aggParts);
      var exportFields = [];
      this.target.joinQueryList.forEach(function (query) {
        console.log("fafadsf1", query.export);
        query.export.forEach(function (part) {
          console.log("fafadsf2", part);
          exportFields.push(part.params[1]); // todo: 重复元素保护
        });
      });
      return mainFields.concat(exportFields);
    }
  }, {
    key: 'getExportOptions',
    value: function getExportOptions(selections, aggs) {
      // 获取select的字段和aggs的字段并格式化为restSql格式
      var options = [];
      selections.forEach(function (part) {
        // export已经select的字段
        options.push(part["params"][0]);
      });
      aggs.forEach(function (part) {
        // export已经aggregation的字段
        console.log("handleJoinExportPartEvent", part);

        var _part$params = _slicedToArray(part.params, 2),
            aggFunc = _part$params[0],
            field = _part$params[1];

        options.push([field, aggFunc].join(","));
        // options.push([field, aggFunc].join("__"));
      });
      return options;
    }
  }, {
    key: 'updateRestSql',
    value: function updateRestSql() {
      var _this5 = this;

      // console.log('🎭', this.target);
      // 将输入的内容更新到target中去
      this.target.query = {
        // restSql协议结构定义
        "select": {
          "from": "",
          "fields": [],
          "filter": {},
          "group_by": [],
          "aggregation": [],
          "sort": []
        },
        "join": [],
        "sort": [],
        "fields": [],
        "limit": 200
      };

      // udpate table
      this.target.query.select.from = this.target.table;

      // update queryLimit
      this.target.query.select.limit = parseInt(this.target.queryLimit);

      // update select fields
      this.target.selectionsParts.forEach(function (part) {
        _this5.target.query.select.fields.push(part.params[0]);
      });
      // update where
      var operatorToSuffix = {
        "=": "",
        "<": "__lt",
        "<=": "__lte",
        ">": "__gt",
        ">=": "__gte",
        "CONTAINS": "__contains",
        "STARTSWITH": "__startswith",
        "ENDSWITH": "__endswith",
        "RANGE": "__range",
        "IN": "__in"
        // ["1", "=", "1"]
      };this.target.whereParts.forEach(function (part) {
        // console.log('🎭',part);
        var suffix = operatorToSuffix[part.params[1]];
        var key = '' + part.params[0] + suffix;
        if (part.params[1] === "IN") {
          // console.log("whereTest", part.params[2], typeof part.params[2]);
          _this5.target.query.select.filter[key] = JSON.parse(part.params[2]);
        } else {
          if (part.params[2].startsWith("\"") && part.params[2].endsWith("\"") || part.params[2].startsWith("\'") && part.params[2].endsWith("\'")) {
            var tmpStr = part.params[2];
            _this5.target.query.select.filter[key] = tmpStr.slice(1, tmpStr.length - 1);
            // console.log(this.target.query.select);
          } else if (!isNaN(parseFloat(part.params[2]))) {
            _this5.target.query.select.filter[key] = parseFloat(part.params[2]);
            console.log(_this5.target.query.select.filter);
          } else if (Object.keys(_this5.varables).indexOf(part.params[2])) {
            _this5.target.query.select.filter[key] = part.params[2];
          } else if (part.params[2].toLowerCase() === "true") {
            _this5.target.query.select.filter[key] = true;
          } else if (part.params[2].toLowerCase() === "false") {
            _this5.target.query.select.filter[key] = false;
          } else {
            return Promise.reject({
              message: 'tetete'
            });
          }
        }
      });

      // update aggregation
      // todo:agg func无法修改, 无法删除
      this.target.aggParts.forEach(function (part) {
        var _part$params2 = _slicedToArray(part.params, 2),
            aggFunc = _part$params2[0],
            field = _part$params2[1];

        _this5.target.query.select.aggregation.push([field, aggFunc].join("__"));
      });

      // update group by
      this.target.groupParts.forEach(function (part) {
        console.log("groupParts", part);
        _this5.target.query.select.group_by.push(part.params[0]);
      });

      // update join
      this.target.joinQueryList.forEach(function (query) {
        console.log("joinQueryList", query);
        var joinQuery = {};
        // update join type
        joinQuery.type = query.type;
        joinQuery.query = { "select": {} };
        console.log("joinQueryList", query);
        // update join table
        joinQuery.query.select.from = query.table.value;
        console.log("joinQueryList", joinQuery.query.select.from);
        // update join fields
        joinQuery.query.select.fields = [];
        query.selections.forEach(function (part) {
          console.log("selections", part);
          joinQuery.query.select.fields.push(part.params[0]);
        });
        // udpate join filter
        joinQuery.query.select.filter = {};
        query.where.forEach(function (part) {
          var suffix = operatorToSuffix[part.params[1]];
          var key = '' + part.params[0] + suffix;

          if (part.params[1] === "IN") {
            console.log("whereTest", part.params[2], _typeof(part.params[2]));
            joinQuery.query.select.filter[key] = JSON.parse(part.params[2]);
          } else {
            console.log("whereTest", part.params[2]);
            if (part.params[2].startsWith("\"") && part.params[2].endsWith("\"") || part.params[2].startsWith("\'") && part.params[2].endsWith("\'")) {
              var tmpStr = part.params[2];
              joinQuery.query.select.filter[key] = tmpStr.slice(1, tmpStr.length - 1);
            } else if (!isNaN(parseFloat(part.params[2]))) {
              joinQuery.query.select.filter[key] = parseFloat(part.params[2]);
            } else {
              return Promise.reject({
                message: 'tetete'
              });
            }
          }

          console.log("joinfilter", key, joinQuery.query.select.filter);
        });
        // update aggregation 
        // todo:agg func无法修改
        joinQuery.query.select.aggregation = [];
        query.aggs.forEach(function (part) {
          console.log("join_aggregation", part);

          var _part$params3 = _slicedToArray(part.params, 2),
              aggFunc = _part$params3[0],
              field = _part$params3[1];
          // joinQuery.query.select.aggregation.push([field, aggFunc].join(","));


          joinQuery.query.select.aggregation.push([field, aggFunc].join("__"));
        });
        // update join group by
        joinQuery.query.select.group_by = [];
        query.groups.forEach(function (part) {
          // console.log("join_group", part);
          joinQuery.query.select.group_by.push(part.params[0]);
        });
        // update join on
        joinQuery.on = {};
        query.on.forEach(function (part) {
          joinQuery.on[part.params[0]] = part.params[1];
        });
        // updaate export
        joinQuery.export = [];
        query.export.forEach(function (part) {
          console.log("joinQuery");
          joinQuery.export.push(part.params.join("@"));
        });
        // update joinLimit
        joinQuery.limit = parseInt(query.limit.value);
        _this5.target.query.join.push(joinQuery);
      });

      // update sort
      this.target.sortParts.forEach(function (part) {
        console.log("sortParts", part);
        var sortExp = part.params[0] === "asc" ? part.params[1] : '-' + part.params[1];
        _this5.target.query.sort.push(sortExp);
      });

      //update fields
      this.target.fieldParts.forEach(function (part) {
        console.log("fieldParts", part.params, '5555555555');

        _this5.target.query.fields.push(part.params.join("@"));
      });

      // update limit
      this.target.query.limit = parseInt(this.target.limit);
      // console.log("UpdateComplete", this.target.query);
      // this.datasource.metricFindQuery(this.target.query || '').then(this.panelCtrl.refresh());
      // console.log(this.target, this.target.query);
      this.target.target = JSON.stringify(this.target.query);
      // this.target.target.push(this.target.query)
      // this.target.target = this.target.query;

      // console.log(this.target, this.target.query);

      // this.target.whereParts = this.tasrget.whereParts;


      // this.datasource.metricFindQuery(JSON.stringify(this.target.query) || '');
      // this.datasource.query(this.target.query);
      this.panelCtrl.refresh();
    }
  }]);

  return GenericDatasourceQueryCtrl;
}(_sdk.QueryCtrl);

GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';
//# sourceMappingURL=query_ctrl.js.map
