import './css/query-editor.css!'

import _ from 'lodash';
import { QueryCtrl } from 'app/plugins/sdk';
import sqlPart from './sql_part';

export class GenericDatasourceQueryCtrl extends QueryCtrl {

  constructor($scope, $injector, uiSegmentSrv,$q) {
    super($scope, $injector);
    // console.log("GenericDatasourceQueryCtrl", uiSegmentSrv);
    this.scope = $scope;
    this.uiSegmentSrv = uiSegmentSrv;
    this.$q = $q;


    this.formats = [
      { text: 'Time series', value: 'grafana.timeserie' },
      { text: 'Table', value: 'grafana.table' },
    ];
    this.types = [
      { text: 'Left Join', value: 'left_join' },
      { text: 'Inner Join', value: 'inner_join' },
      { text: 'Full Join', value: 'full_join' }
    ];
    
    console.log(this.target, 11111111111111111111);
  
    // this.target.tableSegment = null;
    this.target.target = this.target.target || 'targettest';
    this.target.type = this.target.type;

    this.target.tableSegment = this.uiSegmentSrv.newSegment({ "value": this.target.table||'select table', "fake": true });
    this.target.table = this.target.table || this.target.tableSegment.value;
    this.target.selectionsParts = this.target.selectionsParts|| [];
    this.selectionAdd = this.uiSegmentSrv.newPlusButton();  
    
    this.selectMenu = [];
    this.selectMenu .push(this.uiSegmentSrv.newSegment({ type: 'expression', value: 'Expression' }));
   
    this.target.whereParts = this.target.whereParts|| [];
    this.whereAdd = this.uiSegmentSrv.newPlusButton();

    this.target.aggParts = this.target.aggParts|| [];
    this.aggAdd = this.uiSegmentSrv.newPlusButton();

    this.target.groupParts = this.target.groupParts|| [];
    this.groupAdd = this.uiSegmentSrv.newPlusButton();

    this.target.joinQueryList = this.target.joinQueryList|| [];

    this.target.sortParts = this.target.sortParts|| [];
    this.sortAdd = this.uiSegmentSrv.newPlusButton();

    this.target.fieldParts = this.target.fieldParts|| [];
    this.fieldAdd = this.uiSegmentSrv.newPlusButton();

    this.target.limitSegment = this.uiSegmentSrv.newSegment({ "value": this.target.limit||'1000', "fake": true });
    this.target.limit = this.target.limitSegment.value||'1000';
    this.target.query = {
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

  }
 
  getOptions() {
    const options = [];
    options.push(this.uiSegmentSrv.newSegment({ type: 'expression', value: 'Expression' }));
    console.log("tttttt getOptions", options);
    return Promise.resolve(options);
  }  

  removePart(parts, part) {
    const index = _.indexOf(parts, part);
    parts.splice(index, 1);
  }

  onFormatChanged() {
    console.log("onFormatChanged", this);
    this.updateRestSql();
  }

  onTableChanged() {
    console.log("tableChanged", this);
    this.target.table = this.target.tableSegment.value;
    this.updateRestSql();
  }

  onJoinTableChanged(joinIndex) {
    console.log("onJoinTableChanged", joinIndex);
    // this.target.joinQueryList[joinIndex].table = ;
    this.updateRestSql();
  }

  onLimitChanged() {
    // console.log("onLimitChanged");
    this.target.limit = this.target.limitSegment.value;
    this.updateRestSql();
  }

  addSelectionAction(part, index) {
    console.log(1111, part,index);
    this.getOptions()
    const express = sqlPart.create({ type: 'column', params: ['column'] });
    this.target.selectionsParts.push(express);
    this.resetPlusButton(this.selectionAdd);

  }

  handleSelectionsPartEvent(part, index, event) {
    console.log("tttttt handleSelectionsPartEvent", event, index, part, '---');
    if (event.name === "get-part-actions") {
      return this.$q.when([{ text: 'Remove', value: 'remove' }]);
     
    } else if (event.name === "action" && event.action.value === "remove") {
      this.removePart(this.target.selectionsParts, part);
      // this.target.selectionsParts.splice(index, 1, null);
      this.updateRestSql()
      console.log(this.target.selectionsParts, '------')
    } else if (event.name === "part-param-changed") {
      console.log(this.target.selectionsParts);
      this.target.selectionsParts.forEach((item, i) => {
      })
      this.updateRestSql();
    }
  }

  addJoinSelectionAction(joinIndex, expIndex) {
    console.log("addJoinSelectionAction", joinIndex, expIndex);
    const express = sqlPart.create({ type: 'column', params: ['column'] });
    this.target.joinQueryList[joinIndex].selections.push(express)
    this.resetPlusButton(this.target.joinQueryList[joinIndex].selectionAdd);
  }

  handleJoinSelectionsPartEvent(part, joinIndex, expIndex, event) {
    console.log("handleJoinSelectionsPartEvent", joinIndex, expIndex);
    if (event.name === "get-part-actions") {
      return this.$q.when([{ text: 'Remove', value: 'remove' }]);
    } else if (event.name === "action" && event.action.value === "remove") {
      // this.removePart(this.target.joinQueryList[joinIndex].selections, part);
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
    // console.log("handleWherePartEvent", event);
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
      this.updateRestSql();
    } else {
      return Promise.resolve([]);
    }
  }

  addJoinWhereAction(joinIndex, expIndex) {
    const express = sqlPart.create({ type: 'expression', params: ['column', '=', 'value'] });
    console.log("addWhereAction", express);
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
    console.log("handleAggPartEvent");
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

  addJoinOnAction(part, joinIndex, expIndex) {
    const express = sqlPart.create({ type: 'on', params: ['field', 'field'] });
    console.log("addJoinOnAction", express);
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
    console.log("addJoinOnAction", express);
    this.target.joinQueryList[joinIndex].export.push(express);
    this.resetPlusButton(this.target.joinQueryList[joinIndex].exportAdd);
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

  addFieldAction(index) {
    const express = sqlPart.create({ type: 'alias', params: ['fields', 'alias'] });
    console.log("addSortAction", index);
    this.target.fieldParts.push(express);
    this.resetPlusButton(this.fieldAdd);
  }

  handleFieldPartEvent(part, index, event) {
    console.log("handleFieldPartEvent", event);
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
      exportAdd: this.uiSegmentSrv.newPlusButton()
    };
    this.target.joinQueryList.push(queryObj);
    console.log("addJoin", this.target.joinQueryList);
  }
  delJoin(index) {
    this.target.joinQueryList.splice(index, 1)
  }

  getAllFields() {
    // 获取select的字段，aggregate的字段，以及所有join表中的export字段

    const mainFields = this.getExportOptions(this.target.selectionsParts, this.target.aggParts);
    console.log(this.target.selectionsParts, '--------');
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
      options.push([field, aggFunc].join("__"));
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
        "filter":{}, 
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
        console.log("whereTest", part.params[2], typeof part.params[2]);
        this.target.query.select.filter[key] = JSON.parse(part.params[2]);
       
      } else {
        if ((part.params[2].startsWith("\"") && part.params[2].endsWith("\"")) || (part.params[2].startsWith("\'") && part.params[2].endsWith("\'"))) {
          const tmpStr = part.params[2]
          this.target.query.select.filter[key] = tmpStr.slice(1, tmpStr.length - 1);
          // console.log(this.target.query.select);
        } else if (!isNaN(parseFloat(part.params[2]))) {
          this.target.query.select.filter[key] = parseFloat(part.params[2]);
          console.log(this.target.query.select);
        }
        else if (part.params[2].toLowerCase() === "true" ) {          
          this.target.query.select.filter[key] =true;
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
      console.log("aggParts", part);
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
      console.log("joinQueryList", query);
      const joinQuery = {};
      // update join type
      joinQuery.type = query.type;
      joinQuery.query = { "select": {} };
      console.log("joinQueryList", query);
      // update join table
      joinQuery.query.select.from = query.table.value;
      console.log("joinQueryList", joinQuery.query.select.from);
      // update join fields
      joinQuery.query.select.fields = []
      query.selections.forEach((part) => {
        console.log("selections", part);
        joinQuery.query.select.fields.push(part.params[0]);
      });
      // udpate join filter
      joinQuery.query.select.filter = {};
      query.where.forEach((part) => {
        const suffix = operatorToSuffix[part.params[1]];
        const key = `${part.params[0]}${suffix}`;

        if (part.params[1] === "IN") {
          console.log("whereTest", part.params[2], typeof part.params[2]);
          joinQuery.query.select.filter[key] = JSON.parse(part.params[2]);
        } else {
          console.log("whereTest", part.params[2]);
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

        console.log("joinfilter", key, joinQuery.query.select.filter);
      })
      // update aggregation 
      // todo:agg func无法修改
      joinQuery.query.select.aggregation = [];
      query.aggs.forEach((part) => {
        console.log("join_aggregation", part);
        const [aggFunc, field] = part.params;
        joinQuery.query.select.aggregation.push([field, aggFunc].join("__"));
      });
      // update join group by
      joinQuery.query.select.group_by = [];
      query.groups.forEach((part) => {
        // console.log("join_group", part);
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
        console.log("joinQuery");
        joinQuery.export.push(part.params.join("@"));
      });
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
      // console.log("fieldParts", part);
      this.target.query.fields.push(part.params.join("@"));
    });

    // update limit
    this.target.query.limit = parseInt(this.target.limit);
    // console.log("UpdateComplete", this.target.query);
    // this.datasource.metricFindQuery(this.target.query || '').then(this.panelCtrl.refresh());
    // console.log(this.target, this.target.query);
    this.target.target = JSON.stringify(this.target.query);
    // this.target.target = this.target.query;

    // console.log(this.target, this.target.query);
    this.target.whereParts = this.target.whereParts;
    // console.log("UpdateComplete", this.target.selectionsParts);
    // this.datasource.metricFindQuery(JSON.stringify(this.target.query) || '');
    // this.datasource.query(this.target.query);
    this.panelCtrl.refresh();

  }
}
GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';

