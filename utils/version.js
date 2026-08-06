var VERSION = {
  version: '0.1.0',
  buildDate: '2026-06-29',
  features: [
    '注射记录：记录每次注射，自动轮换部位',
    '血糖记录：记录空腹和餐后血糖',
    '趋势分析：药效曲线与血糖趋势图',
    '提醒设置：自定义提醒时间和提前量',
    '家属共享：生成6位共享码，24小时有效',
    '数据导出：导出CSV格式记录文件'
  ],
  changelog: [
    {
      version: '0.1.0',
      date: '2026-06-29',
      title: '体验版首发',
      items: [
        '注射记录功能',
        '血糖记录功能',
        '药效曲线计算',
        '趋势分析图表',
        '提醒设置',
        '家属共享码',
        '数据导出CSV',
        '数据一致性校验'
      ]
    }
  ]
}

function getVersion() {
  return VERSION.version
}

function getBuildDate() {
  return VERSION.buildDate
}

function getFeatures() {
  return VERSION.features
}

function getChangelog() {
  return VERSION.changelog
}

function getFullVersion() {
  return 'v' + VERSION.version + ' (' + VERSION.buildDate + ')'
}

module.exports = {
  VERSION: VERSION,
  getVersion: getVersion,
  getBuildDate: getBuildDate,
  getFeatures: getFeatures,
  getChangelog: getChangelog,
  getFullVersion: getFullVersion
}