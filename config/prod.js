/**
 * 生产环境配置
 */
var prodConfig = {
  env: 'PROD',
  version: '1.0.0',
  buildDate: '2026-07-08',
  enableLog: false,
  enableMock: false,
  enableDebugPage: false,

  // 导出功能配置
  export: {
    filenamePrefix: 'inject_',
    includeDebugInfo: false
  },

  // 提醒功能配置
  reminder: {
    mockSubscribe: false  // 生产环境使用真实订阅
  },

  // 共享功能配置
  share: {
    codeValidityHours: 24,
    mockMode: false
  },

  // 功能列表
  features: [
    '注射记录：记录每次注射，自动轮换部位',
    '血糖记录：记录空腹和餐后血糖',
    '趋势分析：药效曲线与血糖趋势图',
    '提醒设置：自定义提醒时间和提前量',
    '家属共享：生成6位共享码，24小时有效',
    '数据导出：导出CSV格式记录文件'
  ],

  // 更新日志
  changelog: [
    {
      version: '0.1.1',
      date: '2026-06-30',
      title: '药物规格与引导优化',
      items: [
        '新增首次使用5步引导流程',
        '支持多种药物选择（诺和泰/诺和盈/替尔波肽）',
        '支持多种药品规格选择',
        '新增剩余针剂计算与进度显示',
        '新增独立记录注射页面',
        '剂量支持自定义输入',
        '部位支持自定义输入',
        '数据结构升级（v0.1.1）'
      ]
    },
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

module.exports = prodConfig