/**
 * 环境配置入口
 * 通过修改 ENV 变量切换环境：'dev' 或 'prod'
 */
var ENV = 'dev'  // 当前环境：开发环境

// 加载对应环境配置
var devConfig = require('./dev.js')
var prodConfig = require('./prod.js')

var config = ENV === 'prod' ? prodConfig : devConfig

// 导出配置
function getEnv() {
  return config.env
}

function getVersion() {
  return config.version
}

function getBuildDate() {
  return config.buildDate
}

function getFullVersion() {
  return 'v' + config.version + ' (' + config.buildDate + ')'
}

function isEnableLog() {
  return config.enableLog
}

function isEnableMock() {
  return config.enableMock
}

function getExportConfig() {
  return config.export
}

function getReminderConfig() {
  return config.reminder
}

function getShareConfig() {
  return config.share
}

function getConfig() {
  return config
}

function getFeatures() {
  return config.features
}

function getChangelog() {
  return config.changelog
}

// 切换环境（仅用于开发调试，不要在生产代码中使用）
function switchEnv(newEnv) {
  if (newEnv === 'dev' || newEnv === 'prod') {
    ENV = newEnv
    config = ENV === 'prod' ? prodConfig : devConfig
    console.log('[config] 环境切换为:', config.env)
  } else {
    console.error('[config] 无效环境:', newEnv)
  }
}

module.exports = {
  ENV: ENV,
  config: config,
  getEnv: getEnv,
  getVersion: getVersion,
  getBuildDate: getBuildDate,
  getFullVersion: getFullVersion,
  isEnableLog: isEnableLog,
  isEnableMock: isEnableMock,
  getExportConfig: getExportConfig,
  getReminderConfig: getReminderConfig,
  getShareConfig: getShareConfig,
  getFeatures: getFeatures,
  getChangelog: getChangelog,
  getConfig: getConfig,
  switchEnv: switchEnv
}