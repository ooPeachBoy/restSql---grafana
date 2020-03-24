import _ from "lodash";

export class GenericDatasource {

  constructor(instanceSettings, $q, backendSrv, templateSrv) {
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

  query(options) {
    // console.log("query222333Options", options,'1234567');
    var query = this.buildQueryParameters(options);
    // query.targets = query.targets.filter(t => !t.hide)
    // console.log("query222333Query", this.url);

    if(options.targets.length <= 0) {
      return this.q.when({data: []});
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
    console.log("metricFindQuery", query);
    var interpolated = {
        target: this.templateSrv.replace(query, null, 'regex')
    };
    console.log("metricFindQuery", query);
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
        url:'https://easy-mock.com/mock/5e7820fa4ecfa92432bfd6f1/'+parth,
        method: 'POST',
        data: data,
      })
      .then((result) => {return result});
  }


  mapToTextValue(result) {
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

  buildQueryParameters(options) {
    //remove placeholder targets
    options.targets = _.filter(options.targets, target => {
      return target.target !== 'select metric';
    });

    var targets = _.map(options.targets, target => {
      return {
        target: this.templateSrv.replace(target.target, options.scopedVars, 'regex'),
        refId: target.refId,
        hide: target.hide,
        type: target.type || 'timeserie'
      };
    });

    options.targets = targets;

    return options;
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
