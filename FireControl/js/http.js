// axios 简单封装

var imageURL = 'http://172.16.93.93:5005/api/Public/DownLoadFile?FileName=' // 图片路径

var packageURL = 'http://172.16.93.93:5002/appcenter/configinfo'
// var packageURL = 'http://172.16.93.33:5002/appcenter/configinfo'


var token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImIzZDE3MGZiMjM2MzQ2MTkxZWI0ZTllNjBjMTIxNDMzIiwidHlwIjoiSldUIn0.eyJuYmYiOjE1NjE0NDI2MjMsImV4cCI6MTU2MTUyOTAyMywiaXNzIjoiaHR0cDovLzEyNy4wLjAuMTo1MDAyIiwiYXVkIjpbIldlU2FmZSIsImh0dHA6Ly8xMjcuMC4wLjE6NTAwMi9yZXNvdXJjZXMiXSwiY2xpZW50X2lkIjoiZmlyZURlcGFydG1lbnQtZnJvbnQiLCJzdWIiOiIyIiwiYXV0aF90aW1lIjoxNTYxNDQyNjIzLCJpZHAiOiJsb2NhbCIsInRlbmFudCI6IjEiLCJyb2xlcyI6IkFkbWluIiwic2NvcGUiOlsib3BlbmlkIiwicHJvZmlsZSJdfQ.NX2dc2xHlL_uEW7e3Ip46LBR7iKbeqJMiW4xgkigbWRd9wPyuY7qbLm1hxgyxypzlyamaAjpEGu_ALC3JuDR9bgaVoemzi0LUGKgS3kAQ36mbbeVT_HUI9XVxWRHvGpBiQDAb312YUX5w5LnwL30dSN319VnnUUsV77oqecOKI6Biu50cpAQ-36CjV_aXC_SICTRyte0WtlGgbZ2YoFRDNeykRaEx2lKye6XANwFQ-cqMbZxD5Qsw3pxcxg1BKE2quCrQCVo2-YKbSe-CxWnAeq4mX2Jaba07sUbytLZDCY6IgQOC4-A-gebwv0WxGfIAU9hHE12vZwScR54tmPmDA'

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

var instance = axios.create({
  // baseURL: '192.168.10.160:5002/api',
  // withCredentials: false,
  timeout: 5000,
  headers: {'Content-Type': 'application/json'}
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

function apiPost(url, data, set) {
  url = /^\//.test(url) ? url : '/' + url

  return new Promise(function (resolve, reject) {
    if (sessionStorage.getItem('resourceUrl')) {
      _apiPost(sessionStorage.getItem('resourceUrl') + 'api' + url, data, set).then(function (response) {
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
