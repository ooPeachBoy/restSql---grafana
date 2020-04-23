import _ from "lodash";

export class GenericDatasource {

  constructor(instanceSettings, $q, backendSrv, templateSrv) {
    console.log('3333333', this);
    // console.log("instanceSettings", instanceSettings);
    this.type = instanceSettings.type;
    this.url = instanceSettings.url;
    this.name = instanceSettings.name;
    this.q = $q;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
    this.withCredentials = instanceSettings.withCredentials;
    this.headers = {'Content-Type': 'application/json'};
    if (typeof instanceSettings.basicAuth === 'string' && instanceSettings.basicAuth.length > 0) {
      this.headers['Authorization'] = instanceSettings.basicAuth;
    }
  }
// query
  query(options) {
    var query = this.buildQueryParameters(options);

    if(options.targets.length <= 0) {
      return this.q.when({data: []});
    }

    const queryStr = `?query=${options.targets[0].target}`;
    const formatStr = `&datatype=${options.targets[0].type}`;
    
    return this.doRequest({
      url: encodeURI(this.url + `/query/${queryStr}${formatStr}`).replace(/\+/g, '%2B'),
      method: 'GET'
    })
  }

  testDatasource() {
    return this.doRequest({
      url: this.url + '/',
      method: 'GET',
    }).then(response => {
      if (response.status === 200) {
        return { status: "success", message: "Data source is working", title: "Success" };
      }
    });
  }

  annotationQuery(options) {
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
    }).then(result => {
      return result.data;
    });
  }

  metricFindQuery(query) {
    console.log("metricFindQuery", query, this.url);
    var interpolated = {
        target: this.templateSrv.replace(query, null, 'regex')
    };
    console.log("metricFindQuery", interpolated);
    return this.doRequest({
      url: this.url + '/search',
      data: interpolated,
      method: 'POST',
    }).then(this.mapToTextValue);
  }
// 下拉选项
  metricFindOption(tableName,parth) {
    const data = {
      tableName
    }
    return this.backendSrv
      .datasourceRequest({
        // url: '/api/tsdb/query',
        url:'http://mock.studyinghome.com/mock/5e74382b8c3c6c22c4271aea/example_copy/'+parth,
        method: 'POST',
        data
      })
      .then((result) => {return result});
  }


  mapToTextValue(result) {
    console.log(result,'🙃');
    return _.map(result.data, (d, i) => {
      if (d && d.text && d.value) {
        return { text: d.text, value: d.value };
      } else if (_.isObject(d)) {
        return { text: d, value: i};
      }
      return { text: d, value: d };
    });
  }

  doRequest(options) {
    options.withCredentials = this.withCredentials;
    options.headers = this.headers;

    return this.backendSrv.datasourceRequest(options);
  }

  // filter targets.target
  buildQueryParameters(options) {
    options.targets = _.filter(options.targets, target => {
      return target.target !== 'select metric';
    });

    var targets = _.map(options.targets, target => {
      const queryRow = this.templateSrv.replace(target.target, options.scopedVars, 'regex');
      var query = JSON.parse(queryRow);
      if (query.select.aggregation.length > 0) {
        this.filterAggregation(query.select.aggregation )
      }
      query.join.forEach(element => {
        if (element.query.select.aggregation.length > 0) {
          this.filterAggregation(element.query.select.aggregation )
        }
      });
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
//  filter query aggregation
  filterAggregation(array) {
    const varables = []
    this.templateSrv.variables.forEach(ele => {
      varables.push({
        name: '$' + ele.name,
        value: ele.current.value
      })
    });
    varables.forEach(element => {
      if (array.length > 0) {
        array.forEach((ele, index) => {
          console.log(ele.startsWith(element.name), '222');
          if (ele.startsWith(element.name)) {
            var field = ele.split('__')
            field[0] = "(" + element.value.join(',') + ")"
            array.splice(index, 1, [field[0], field[1]].join('__'))
          }
        })
      }

    })
  }

  getTagKeys(options) {
    return new Promise((resolve, reject) => {
      this.doRequest({
        url: this.url + '/tag-keys',
        method: 'POST',
        data: options
      }).then(result => {
        return resolve(result.data);
      });
    });
  }

  getTagValues(options) {
    return new Promise((resolve, reject) => {
      this.doRequest({
        url: this.url + '/tag-values',
        method: 'POST',
        data: options
      }).then(result => {
        return resolve(result.data);
      });
    });
  }

}
