import './css/query-editor.css!'

import _ from 'lodash';
import { QueryCtrl } from 'app/plugins/sdk';
import sqlPart from './sql_part';
import { PanelEvents } from '@grafana/data';
import { MetricsPanelCtrl } from 'app/plugins/sdk';
export class GenericDatasourceQueryCtrl extends QueryCtrl {
  
  constructor($scope, $injector, uiSegmentSrv, $q) {
    super($scope, $injector);
    this.scope = $scope;
    this.uiSegmentSrv = uiSegmentSrv;
    this.$q = $q;
    this.lastQueryError = null;
    this.panelCtrl.events.on(PanelEvents.dataReceived, this.onDataReceived.bind(this), $scope);
    this.panelCtrl.events.on(PanelEvents.dataError, this.onDataError.bind(this), $scope);
    
    this.panelCtrl.events.on(PanelEvents.render, this.onDataRefresh.bind(this), $scope)
    this.joinQueryList = this.joinQueryList || [];
    this.updateProjection()

    this.target.tableSelect = this.target.tableSelect || [];

    this.formats = [
      { text: 'Time series', value: 'grafana.timeserie' },
      { text: 'Table', value: 'grafana.table' },

    ];
    this.types = [
      { text: 'Left Join', value: 'left_join' },
      { text: 'Inner Join', value: 'inner_join' },
      { text: 'Full Join', value: 'full_join' }
    ];


    // this.target.tableSegment = null;
    this.target.target = this.target.target || '';
    this.target.type = this.target.type || 'grafana.timeserie';

    this.target.tableSegment = this.uiSegmentSrv.newSegment({ "value": this.target.table || 'select table', "fake": true });
    this.target.table = this.target.table || this.target.tableSegment.value;

    this.target.selectionsParts = this.target.selectionsParts || []
    this.selectionAdd = this.uiSegmentSrv.newPlusButton();

    this.selectMenu = [];
    this.selectMenu.push(this.uiSegmentSrv.newSegment({ type: 'expression', value: 'Expression' }));
    // this.selectionsParts = this.selectionsParts || [];
    this.target.whereParts = this.target.whereParts || []
    this.whereAdd = this.uiSegmentSrv.newPlusButton();
    this.target.aggParts = this.target.aggParts || [];
    this.aggAdd = this.uiSegmentSrv.newPlusButton();
    this.target.groupParts = this.target.groupParts || []
    this.groupAdd = this.uiSegmentSrv.newPlusButton();
    this.target.joinQueryList = this.target.joinQueryList||[]
    
    this.target.sortParts = this.target.sortParts || [];
    this.sortAdd = this.uiSegmentSrv.newPlusButton();
    this.target.fieldParts = this.target.fieldParts || []
    this.fieldAdd = this.uiSegmentSrv.newPlusButton();

    this.target.limitSegment = this.uiSegmentSrv.newSegment({ "value": this.target.limit || '1000', "fake": true });
    this.target.limit = this.target.limitSegment.value || '1000';
    this.target.queryLimitSegment = this.uiSegmentSrv.newSegment({ "value": this.target.queryLimit || '1000', "fake": true });
    this.target.queryLimit = this.target.queryLimitSegment.value || '1000';
    this.target.query = this.target.query|| {
      // restSql协议结构定义
      "select": {
        "from": "",
        "filter": {},
        "group_by": [],
        "aggregation": [],
        "sort": [],
      },
      "join": [],
      "sort": [],
      "fields": [],
      "limit": 200
    };

    this.varables = this.varables|| []
    this.panelCtrl.datasource.templateSrv.variables.forEach(ele => {
      this.varables.push({
        name:'$'+ ele.name,
        value: ele.current.value
      })
    });
  }
  // 数据回填
  updateProjection() {
    if (this.target.target ) {
      for (const key in this.target) {
        if (key.includes('Parts')&&this.target[key].length>0) {
          this.target[key].forEach((ele, index) => {
            this.target[key].splice(index,1,sqlPart.create(ele.part))
          })
        } else if (key.includes('Segment')) {
            this.target[key] = this.uiSegmentSrv.newSegment({ "value": this.target[key].value,"fake":true})
        } else {
          this.target.type = this.target.type
        }
      }
      if (this.target.joinQueryList.length > 0) {
        this.target.joinQueryList.forEach((ele, index) => {
          for (const key in ele) {
            if (Array.isArray(ele[key] && ele[key].length > 0)) {
              ele[key].forEach((element, i) => {
                ele[key].splice(i, 0, sqlPart.create(element.part))
              })
            } else if (key.includes('Add')) {
              ele[key] = this.uiSegmentSrv.newPlusButton()
            } else if (key == 'type') {
              ele[key] = ele.type
            } else if (key == 'table'||key=='limit') {
              ele[key] = this.uiSegmentSrv.newSegment({ "value": ele[key].value, "fake": true })
            }
          }
        })
      }
    }
  }
  transformToSegments() {
    return (result) => {
      const segments = _.map(results, segment => {
        return this.uiSegmentSrv.newSegment({
          value: segment.text,
          expandable: segment.expandable,
        });
      });
      return segments;
    }
  }

  onDataReceived(dataList) {
    console.log(dataList);
    this.lastQueryError = null
  }
  onDataError(err) {
    if (this.target.target) {
      this.lastQueryError = err.message
    }

  }
// 
  getOptions() {
    const options = [];
    options.push(this.uiSegmentSrv.newSegment({ type: 'expression', value: 'Expression' }));
    return Promise.resolve(options);
  }

  removePart(parts, part) {
    const index = _.indexOf(parts, part);
    parts.splice(index, 1);
  }

  onFormatChanged() {
    this.updateRestSql();
  }
  onJoinTypeChange() {
    this.updateRestSql();
  }
// 下拉关联
  onTableChanged() {
    console.log("tableChanged", this, this.target.tableSegment.value);
    this.target.table = this.target.tableSegment.value;
    let parth = 'getList';
    this.datasource.metricFindOption(this.target.table, parth).then(result => {
      if (result.status === 200) {
        this.target.tableSelect = result.data.data.tables[0].rows;
      }
    })
    this.updateRestSql();
  }

  onJoinTableChanged(joinIndex) {
    this.updateRestSql();
  }

  onLimitChanged() {
    this.target.limit = this.target.limitSegment.value;
    this.updateRestSql();
  }
  onLimitQueryChanged() {
    this.target.queryLimit = this.target.queryLimitSegment.value;
    this.updateRestSql()
  }
  onLimitJoinChanged(joinIndex) {
    this.target.joinQueryList[joinIndex].limit = this.uiSegmentSrv.newSegment({ "value": this.target.joinQueryList[joinIndex].limit.value || '1000', "fake": true });
    this.updateRestSql()
  }

  addSelectionAction(part, index) {
    this.getOptions()
    const express = sqlPart.create({ type: 'column', params: ['column'] });
    this.target.selectionsParts.push(express);
    this.resetPlusButton(this.selectionAdd);
  }

  handleSelectionsPartEvent(part, index, event) {
    if (event.name === "get-part-actions") {
      return this.$q.when([{ text: 'Remove', value: 'remove' }]);

    } else if (event.name === "action" && event.action.value === "remove") {
      this.removePart(this.target.selectionsParts, part);
      this.updateRestSql()
      console.log(this.target.selectionsParts, '------')
    } else if (event.name === "part-param-changed") {
      this.target.selectionsParts.forEach((item, i) => {
      })
      this.updateRestSql();
    } else if (event.name === "get-param-options") {
      return Promise.resolve(this.uiSegmentSrv.newOperators(this.target.tableSelect));
    }
  }

  addJoinSelectionAction(joinIndex, expIndex) {
    const express = sqlPart.create({ type: 'column', params: ['column'] });
    this.target.joinQueryList[joinIndex].selections.push(express)
    this.resetPlusButton(this.target.joinQueryList[joinIndex].selectionAdd);
  }

  handleJoinSelectionsPartEvent(part, joinIndex, expIndex, event) {
    if (event.name === "get-part-actions") {
      return this.$q.when([{ text: 'Remove', value: 'remove' }]);
    } else if (event.name === "action" && event.action.value === "remove") {
      this.target.joinQueryList[joinIndex].selections.splice(expIndex, 1);
      this.updateRestSql()
    } else if (event.name === "part-param-changed") {
      this.updateRestSql();
    }
  }

  addWhereAction(part, index) {
    const express = sqlPart.create({ type: 'expression', params: ['column', '=', 'value'] });
    this.target.whereParts.push(express);
    this.resetPlusButton(this.whereAdd);
  }


  handleWherePartEvent(part, index, event) {
    if (event.name === "get-param-options" && event.param.name === "op") {
      // 暂时只支持展开操作符列表
      const operators = ['=', '<', '<=', '>', '>=', 'CONTAINS', 'STARTSWITH', 'ENDSWITH', 'RANGE', 'IN'];
      return Promise.resolve(this.uiSegmentSrv.newOperators(operators));
    } else if (event.name === "get-part-actions") {
      return this.$q.when([{ text: 'Remove', value: 'remove' }]);
    } else if (event.name === "action" && event.action.value === "remove") {
      this.target.whereParts.splice(index, 1);
      this.updateRestSql()
    } else if (event.name === "part-param-changed") {
      console.log(part,index,'😎');
      this.updateRestSql();
    } else {
      return Promise.resolve([]);
    }
  }

  addJoinWhereAction(joinIndex, expIndex) {
    const express = sqlPart.create({ type: 'expression', params: ['column', '=', 'value'] });
    this.target.joinQueryList[joinIndex].where.push(express);
    this.resetPlusButton(this.target.joinQueryList[joinIndex].whereAdd);
  }

  handleJoinWherePartEvent(part, joinIndex, expIndex, event) {
    console.log("handleJoinWherePartEvent", event);
    if (event.name === "get-param-options" && event.param.name === "op") {
      // 暂时只支持展开操作符列表
      const operators = ['=', '<', '<=', '>', '>=', 'CONTAINS', 'STARTSWITH', 'ENDSWITH', 'RANGE', 'IN'];
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

  addAggAction() {
    const express = sqlPart.create({ type: 'aggregate', params: ['avg', 'column'] });
    console.log("addAggAction", express);
    this.target.aggParts.push(express);
    this.resetPlusButton(this.aggAdd);
  }

  handleAggPartEvent(part, index, event) {
    console.log("handleAggPartEvent", event, part, index);
    if (event.name === "get-param-options" && event.param.name === "agg") {
      // 暂时只支持展开操作符列表
      const operators = event.param.options;
      return Promise.resolve(this.uiSegmentSrv.newOperators(operators));
    } else if (event.name === "get-part-actions") {
      return this.$q.when([{ text: 'Remove', value: 'remove' }]);
    } else if (event.name === "action" && event.action.value === "remove") {
      this.target.aggParts.splice(index, 1)
      this.updateRestSql()
    } else if (event.name === "part-param-changed") {
      this.updateRestSql();
    } else {
      return Promise.resolve([]);
    }
  }

  addJoinAggAction(joinIndex) {
    const express = sqlPart.create({ type: 'aggregate', params: ['avg', 'column'] });
    console.log("addJoinAggAction", express);
    this.target.joinQueryList[joinIndex].aggs.push(express);
    this.resetPlusButton(this.target.joinQueryList[joinIndex].aggAdd);
  }

  handleJoinAggPartEvent(part, joinIndex, expIndex, event) {
    console.log("handleJoinAggPartEvent", event);
    if (event.name === "get-param-options" && event.param.name === "agg") {
      // 暂时只支持展开操作符列表
      const operators = event.param.options;
      return Promise.resolve(this.uiSegmentSrv.newOperators(operators));
    } else if (event.name === "get-part-actions") {
      return this.$q.when([{ text: 'Remove', value: 'remove' }]);
    } else if (event.name === "action" && event.action.value === "remove") {
      this.target.joinQueryList[joinIndex].aggs.splice(expIndex, 1);
      this.updateRestSql()
    } else if (event.name === "part-param-changed") {
      this.updateRestSql();
    } else {
      return Promise.resolve([]);
    }
  }

  addGroupAction() {
    const express = sqlPart.create({ type: 'column', params: ['column'] });
    console.log("addGroupsAction", express);
    this.target.groupParts.push(express);
    this.resetPlusButton(this.groupAdd);
  }

  handleGroupPartEvent(part, index, event) {
    console.log("handleGroupsPartEvent");
    if (event.name === "get-part-actions") {
      return this.$q.when([{ text: 'Remove', value: 'remove' }]);
    } else if (event.name === "action" && event.action.value === "remove") {
      this.target.groupParts.splice(index, 1);
      this.updateRestSql()
    } else if (event.name === "part-param-changed") {
      this.updateRestSql();
    }
  }

  addJoinGroupAction(part, joinIndex, expIndex) {
    const express = sqlPart.create({ type: 'column', params: ['column'] });
    console.log("addGroupsAction", express);
    this.target.joinQueryList[joinIndex].groups.push(express);
    this.resetPlusButton(this.target.joinQueryList[joinIndex].groupAdd);
  }

  handleJoinGroupPartEvent(part, joinIndex, expIndex, event) {
    if (event.name === "get-part-actions") {
      return this.$q.when([{ text: 'Remove', value: 'remove' }]);
    } else if (event.name === "action" && event.action.value === "remove") {
      this.target.joinQueryList[joinIndex].groups.splice(expIndex, 1);
      this.updateRestSql();
    } else if (event.name === "part-param-changed") {
      this.updateRestSql();
    }
  }

  addJoinOnAction(part, joinIndex, expIndex) {
    const express = sqlPart.create({ type: 'on', params: ['field', 'field'] });
    this.target.joinQueryList[joinIndex].on.push(express);
    this.resetPlusButton(this.target.joinQueryList[joinIndex].onAdd);
  }

  handleJoinOnPartEvent(part, joinIndex, expIndex, event) {
    console.log("handleJoinOnPartEvent", event);
    if (event.name === "get-param-options" && event.param.name === "op") {
      // 暂时只支持展开操作符列表
      const operators = ['='];
      return Promise.resolve(this.uiSegmentSrv.newOperators(operators));
    } else if (event.name === "get-part-actions") {
      return this.$q.when([{ text: 'Remove', value: 'remove' }]);
    } else if (event.name === "action" && event.action.value === "remove") {
      this.target.joinQueryList[joinIndex].on.splice(expIndex, 1);
    } else if (event.name === "get-param-options" && event.param.name === "field1") {
      // on field1=field2，field1是join的表中的字段，field2是原始表中的字段，这里做成可选项
      console.log("handleJoinOnPartEvent", this.target.joinQueryList[joinIndex]);
      const options = [];
      this.target.joinQueryList[joinIndex].selections.forEach((part) => {
        options.push(part["params"][0]);
      });
      return Promise.resolve(this.uiSegmentSrv.newOperators(options));
    } else if (event.name === "get-param-options" && event.param.name === "field2") {
      const options = [];
      this.target.selectionsParts.forEach((part) => {
        options.push(part["params"][0]);
      });
      return Promise.resolve(this.uiSegmentSrv.newOperators(options));
    } else if (event.name === "part-param-changed") {
      this.updateRestSql();
    } else {
      return Promise.resolve([]);
    }
  }

  addJoinExportAction(part, joinIndex, expIndex) {
    const express = sqlPart.create({ type: 'alias', params: ['fields', 'alias'] });
    this.target.joinQueryList[joinIndex].export.push(express);
    this.resetPlusButton(this.target.joinQueryList[joinIndex].exportAdd);
  }
  onJoinLimitChanged(joinIndex) {
    this.target.joinQueryList[joinIndex].limit = this.target.joinQueryList[joinIndex].limit.value;
    this.updateRestSql();
  }

  handleJoinExportPartEvent(part, joinIndex, expIndex, event) {
    console.log("handleJoinExportPartEvent", event);
    if (event.name === "get-part-actions") {
      return this.$q.when([{ text: 'Remove', value: 'remove' }]);
    } else if (event.name === "action" && event.action.value === "remove") {
      this.target.joinQueryList[joinIndex].export.splice(expIndex, 1);
      this.updateRestSql();
    } else if (event.name === "get-param-options" && event.param.name === "field") {
      const options = this.getExportOptions(this.target.joinQueryList[joinIndex].selections, this.target.joinQueryList[joinIndex].aggs);
      return Promise.resolve(this.uiSegmentSrv.newOperators(options));
    } else if (event.name === "part-param-changed") {
      this.updateRestSql();
    } else {
      return Promise.resolve([]);
    }
  }

  addSortAction(index) {
    const express = sqlPart.create({ type: 'sort', params: ['asc', 'field'] });
    console.log("addSortAction", index);
    this.target.sortParts.push(express);
    this.resetPlusButton(this.sortAdd);
  }

  handleSortPartEvent(part, index, event) {
    console.log("handleSortPartEvent", event);
    if (event.name === "get-part-actions") {
      return this.$q.when([{ text: 'Remove', value: 'remove' }]);
    } else if (event.name === "action" && event.action.value === "remove") {
      this.target.sortParts.splice(index, 1);
      this.updateRestSql();
    } else if (event.name === "get-param-options" && event.param.name === "field") {
      return Promise.resolve(this.uiSegmentSrv.newOperators(this.getAllFields()));
    } else if (event.name === "part-param-changed") {
      this.updateRestSql();
    } else {
      return Promise.resolve([]);
    }
  }

  addFieldAction(index) {
    const express = sqlPart.create({ type: 'alias', params: ['fields', 'alias'] });
    this.target.fieldParts.push(express);
    this.resetPlusButton(this.fieldAdd);
  }

  handleFieldPartEvent(part, index, event) {
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

  resetPlusButton(button) {
    const plusButton = this.uiSegmentSrv.newPlusButton();
    button.html = plusButton.html;
    button.value = plusButton.value;
  }

  addJoin() {
    const queryObj = {
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
      limit: this.uiSegmentSrv.newSegment({ "value": '1000', "fake": true }),
    };
    this.target.joinQueryList.push(queryObj);
  }
  delJoin(index) {
    this.target.joinQueryList.splice(index, 1)
  }

  getAllFields() {
    // 获取select的字段，aggregate的字段，以及所有join表中的export字段
    const mainFields = this.getExportOptions(this.target.selectionsParts, this.target.aggParts);
    const exportFields = []
    this.target.joinQueryList.forEach((query) => {
      console.log("fafadsf1", query.export)
      query.export.forEach((part) => {
        console.log("fafadsf2", part);
        exportFields.push(part.params[1]) // todo: 重复元素保护
      });
    });
    return mainFields.concat(exportFields)
  }

  getExportOptions(selections, aggs) {
    // 获取select的字段和aggs的字段并格式化为restSql格式
    const options = [];
    selections.forEach((part) => {
      // export已经select的字段
      options.push(part["params"][0]);
    });
    aggs.forEach((part) => {
      // export已经aggregation的字段
      console.log("handleJoinExportPartEvent", part);
      const [aggFunc, field] = part.params;
      options.push([field, aggFunc].join(","));
      // options.push([field, aggFunc].join("__"));
    });
    return options;
  }

  updateRestSql() {
    // 将输入的内容更新到target中去
    this.target.query = {
      // restSql协议结构定义
      "select": {
        "from": "",
        "fields": [],
        "filter": {},
        "group_by": [],
        "aggregation": [],
        "sort": [],
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
    this.target.selectionsParts.forEach((part) => {
      this.target.query.select.fields.push(part.params[0]);
    });
    // update where
    const operatorToSuffix = {
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
    }
    // ["1", "=", "1"]
    this.target.whereParts.forEach((part) => {
      const suffix = operatorToSuffix[part.params[1]];
      const key = `${part.params[0]}${suffix}`
      if (part.params[1] === "IN") {
        this.target.query.select.filter[key] = JSON.parse(part.params[2]);

      } else {
        if ((part.params[2].startsWith("\"") && part.params[2].endsWith("\"")) || (part.params[2].startsWith("\'") && part.params[2].endsWith("\'"))) {
          const tmpStr = part.params[2]
          this.target.query.select.filter[key] = tmpStr.slice(1, tmpStr.length - 1);
        } else if (!isNaN(parseFloat(part.params[2]))) {
          this.target.query.select.filter[key] = parseFloat(part.params[2]);
          console.log( this.target.query.select.filter);
        }
        else if (Object.keys(this.varables).indexOf(part.params[2] )) {
          this.target.query.select.filter[key] = part.params[2]
        }
        else if (part.params[2].toLowerCase() === "true") {
          this.target.query.select.filter[key] = true;
        } else if (part.params[2].toLowerCase() === "false") {
          this.target.query.select.filter[key] = false;
        }
        else {
          return Promise.reject({
            message: 'tetete',
          });
        }
      }
    });

    // update aggregation
    // todo:agg func无法修改, 无法删除
    this.target.aggParts.forEach((part) => {
      const [aggFunc, field] = part.params;
      this.target.query.select.aggregation.push([field, aggFunc].join("__"));
    });

    // update group by
    this.target.groupParts.forEach((part) => {
      console.log("groupParts", part);
      this.target.query.select.group_by.push(part.params[0]);
    });

    // update join
    this.target.joinQueryList.forEach((query) => {
      const joinQuery = {};
      // update join type
      joinQuery.type = query.type;
      joinQuery.query = { "select": {} };
      // update join table
      joinQuery.query.select.from = query.table.value;
      // update join fields
      joinQuery.query.select.fields = []
      query.selections.forEach((part) => {
        joinQuery.query.select.fields.push(part.params[0]);
      });
      // udpate join filter
      joinQuery.query.select.filter = {};
      query.where.forEach((part) => {
        const suffix = operatorToSuffix[part.params[1]];
        const key = `${part.params[0]}${suffix}`;
        if (part.params[1] === "IN") {
          joinQuery.query.select.filter[key] = JSON.parse(part.params[2]);
        } else {
          if ((part.params[2].startsWith("\"") && part.params[2].endsWith("\"")) || (part.params[2].startsWith("\'") && part.params[2].endsWith("\'"))) {
            const tmpStr = part.params[2]
            joinQuery.query.select.filter[key] = tmpStr.slice(1, tmpStr.length - 1);
          } else if (!isNaN(parseFloat(part.params[2]))) {
            joinQuery.query.select.filter[key] = parseFloat(part.params[2]);
          } else {
            return Promise.reject({
              message: 'tetete',
            });
          }
        }
      })
      // update aggregation 
      // todo:agg func无法修改
      joinQuery.query.select.aggregation = [];
      query.aggs.forEach((part) => {
        const [aggFunc, field] = part.params;
        joinQuery.query.select.aggregation.push([field, aggFunc].join("__"));
      });
      // update join group by
      joinQuery.query.select.group_by = [];
      query.groups.forEach((part) => {
        joinQuery.query.select.group_by.push(part.params[0]);
      });
      // update join on
      joinQuery.on = {};
      query.on.forEach((part) => {
        joinQuery.on[part.params[0]] = part.params[1];
      });
      // updaate export
      joinQuery.export = [];
      query.export.forEach((part) => {
        joinQuery.export.push(part.params.join("@"));
      });
      // update joinLimit
      joinQuery.limit = parseInt(query.limit.value);
      this.target.query.join.push(joinQuery);
    });

    // update sort
    this.target.sortParts.forEach((part) => {
      console.log("sortParts", part);
      const sortExp = part.params[0] === "asc" ? part.params[1] : `-${part.params[1]}`;
      this.target.query.sort.push(sortExp);
    });

    //update fields
    this.target.fieldParts.forEach((part) => {
      this.target.query.fields.push(part.params.join("@"));
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
}
GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';

