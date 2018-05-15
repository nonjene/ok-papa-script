module.exports = {
  "ftp": {
    "host": "192.168.2.228",
    "port": "",
    "user": "testlimincom",
    "password": "testlimincom"
  },
  "remoteBasePath": "",
  "remotePath": "/activity/{$target}",
  "localAssetPath": "build/activity/{$target}",
  "domainName": "http://m.okpapa.net",
  "cdnDomain": "https://images.okpapa.com",
  "proxyPort": 80,
  "servePort": 3005,
  "staticFileConcatOrder": ["config.js", "reset.js", "responsive.js"],
  "commonVersion": "12",
  "webpackConfig": {
    "resolve": {
      "alias": {
        "common": "modules/tools/common"
      }
    }
  },
  "releaseEnvDesc": {
    "pre": "预发环境😛",
    "pro": "生产环境😝",
    "test": "开发环境🤔"
  },
  "requestEnvDesc": {
    "pre": "预发环境🥑",
    "produce": "生产环境🍓",
    "test": "测试环境🥝"
  }
}