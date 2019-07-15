// axios 简单封装

var imageURL = 'http://172.16.93.93:5005/api/Public/DownLoadFile?FileName=' // 图片路径
// var packageURL = 'http://192.168.10.160:5002/appcenter/configinfo'
// var packageURL = 'http://211.137.68.118:30160/appcenter/configinfo'
var packageURL = 'http://172.16.93.93:5002/appcenter/configinfo'


var token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImIzZDE3MGZiMjM2MzQ2MTkxZWI0ZTllNjBjMTIxNDMzIiwidHlwIjoiSldUIn0.eyJ1bmlxdWVfbmFtZSI6ImFkbWluIiwic3ViIjoiMzAwMTQiLCJ0ZW5hbnQiOiIxIiwianRpIjoiMDgwYTVhM2ItMmQzNy00MTY5LTkxNzYtMjdlOTE4Y2RhYTIzIiwiaWF0IjoxNTYyMjA0NDM1LCJzY29wZSI6WyJvcGVuaWQiLCJwcm9maWxlIl0sImNsaWVudF9pZCI6InN1cGVydmlzZXItZnJvbnQiLCJuYmYiOjE1NjIyMDQ0MzUsImV4cCI6MTU2NDc5NjQzNSwiaXNzIjoiaHR0cDovLzEyNy4wLjAuMTo1MDAyIiwiYXVkIjoiaHR0cDovLzEyNy4wLjAuMTo1MDAyL3Jlc291cmNlcyJ9.qPd-CyaSEmxMSoM8j33OuX41X8FZFovYhBHPz1YdRnpEU3e9fwIrZQR1upbapwqZQxI_OgIgnk4v9DHY7UYLlhwwkEmGMSwBGwKwIdldXkuAmWWWd6hDpVFxKN_T5Q8XMbNvZVzsjzfZX3WP_vOjgwwQvCdKYipOzASCRkgiYl3f9kNcbAO_OMpiDfQ5I7kM5BPgA8xWs5DuCim03PRoPodlVllxbs2gWFeG-UDZSE0bpd1Z9Bqfvo2Z-Fbek_eI6hZI_4C9yDuIJ7q3CXY9xtHSDYUjimJWwSviQLxF9otLFrGGvRCR9gjDlq9y35dT81X0DES0jNZA9DCU_DOvgA'

if (typeof Object.assign != 'function') {
  Object.assign = function (target) {
    'use strict';
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    target = Object(target);
    for (var index = 1; index < arguments.length; index++) {
      var source = arguments[index];
      if (source != null) {
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
    }
    return target;
  };
}

// 将一个对象转成QueryString
function toQueryString(obj) {
  if (!obj) return ''
  var arr = []
  for (var key in obj) {
    arr.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]))
  }
  return arr.join('&')
}


var instance = axios.create({
  // baseURL: '192.168.10.160:5002/api',
  // withCredentials: false,
  timeout: 5000,
  // headers: {'Content-Type': 'application/json'}
  headers: {'Content-Type': 'application/x-www-form-urlencoded'}
})

instance.interceptors.request.use(
  function (config) {
    if (token) {
      Object.assign(config.headers, {'Authorization': token});
    }

    if (config.showLoading) {

    }

    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)

instance.interceptors.response.use(
  function (res) {
    return res
  },
  function (error) {
    return Promise.reject(error.response)
  }
)

function _apiGet(url, params, set) {
  params = params || {}
  set = set || {}
  if (set.timeout === undefined) {
    set.timeout = 20000
  }
  if (set.showLoading === undefined) {
    set.showLoading = true
  }

  return new Promise(function (resolve, reject) {
    instance.get(url, {
      params: params,
      timeout: set.timeout,
      showLoading: set.showLoading,
    }).then(function (response) {
      resolve(response)
    }).catch(function (error) {
      reject(error)
    })
  })
}

function _apiPost(url, data, set) {
  data = data || {}
  set = set || {}
  if (set.timeout === undefined) {
    set.timeout = 20000
  }
  if (set.showLoading === undefined) {
    set.showLoading = true
  }

  return new Promise(function (resolve, reject) {
    instance.post(url, data, set).then(function (response) {
      resolve(response)
    }).catch(function (error) {
      reject(error)
    })
  })
}


function apiGet(url, params, set) {
  url = /^\//.test(url) ? url : '/' + url

  return new Promise(function (resolve, reject) {
    //..............................................................................................................
    _apiGet('http://172.16.93.33:5005/' + 'api' + url, params, set).then(function (response) {
      resolve(response)
    }).catch(function (error) {
      reject(error)
    })

    return;
    //..............................................................................................................

    if (sessionStorage.getItem('resourceUrl')) {
      _apiGet(sessionStorage.getItem('resourceUrl') + 'api' + url, params, set).then(function (response) {
        resolve(response)
      }).catch(function (error) {
        reject(error)
      })
      return
    }

    _apiGet(packageURL).then(function (_response) {
      var package = _response.data.package
      var resourceUrl = ''

      for (var i = 0; i < package.length; i++) {
        if (package[i].id == 'fireDepartmentWebApi') {
          resourceUrl = package[i].resourceUrl
        }
      }
      sessionStorage.setItem('resourceUrl', resourceUrl)

      _apiGet(resourceUrl + 'api' + url, params, set).then(function (response) {
        resolve(response)
      }).catch(function (error) {
        setTimeout(function () {
          reject(error)
        }, 3000)
      })

    }).catch(function (error) {
      reject(error)
    })
  })
}

function apiPost(url, data, set={}) {
  url = /^\//.test(url) ? url : '/' + url
  if (set.file) { // 上传文件
    // set.headers = {
    //   'Content-Type': 'multipart/form-data'
    // } // 上传文件的请求头
    // console.log(100, data);
    var form = new FormData();
    // for (var key in data) {
    //   form.append(data[key].name,data[key])
    // }
      form.append(data.name,data)
    // console.log(form);
    // form.append('data',data[key])
    data = form
  }
  return new Promise(function (resolve, reject) {
    if(!set.file){
      data = toQueryString(data)
    }
    //..............................................................................................................
    _apiPost('http://172.16.93.33:5005/' + 'api' + url, data, set).then(function (response) {
      resolve(response)
    }).catch(function (error) {
      reject(error)
    })

    return;
    //..............................................................................................................


    if (sessionStorage.getItem('resourceUrl')) {
      _apiPost('http://172.16.93.33:5000/' + 'api' + url, data, set).then(function (response) {
        resolve(response)
      }).catch(function (error) {
        reject(error)
      })
      return
    }

    _apiGet(packageURL).then(function (_response) {
      var package = _response.data.package
      var resourceUrl = ''

      for (var i = 0; i < package.length; i++) {
        if (package[i].id == 'fireDepartmentWebApi') {
          resourceUrl = package[i].resourceUrl
        }
      }
      sessionStorage.setItem('resourceUrl', resourceUrl)

      _apiPost(resourceUrl + 'api' + url, data, set).then(function (response) {
        resolve(response)
      }).catch(function (error) {
        setTimeout(function () {
          reject(error)
        }, 3000)
      })

    }).catch(function (error) {
      reject(error)
    })
  })
}


Vue.apiGet = apiGet
Vue.apiPost = apiPost
Vue.prototype.apiGet = apiGet
Vue.prototype.apiPost = apiPost
