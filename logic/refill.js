/**
 * 换笔提醒模块
 */
var pen = require('./pen.js')

/**
 * 判断是否需要更换新笔
 * @param {number} remainDose - 剩余剂量
 * @param {number} recommendDose - 推荐剂量
 * @returns {boolean} true=需要更换
 */
function needReplacePen(remainDose, recommendDose) {
  if (!remainDose || remainDose <= 0) {
    return true
  }
  if (!recommendDose || recommendDose <= 0) {
    return false
  }
  return remainDose < recommendDose
}

/**
 * 获取换笔提醒信息
 * @param {object} plan - 注射计划
 * @param {number} recommendDose - 推荐剂量
 * @returns {object} { needReplace, remainDose, recommendDose }
 */
function getRefillInfo(plan, recommendDose) {
  var remainDose = 0
  if (plan) {
    var remain = pen.getRemainDose(plan)
    remainDose = remain.remainDose
  }
  return {
    needReplace: needReplacePen(remainDose, recommendDose),
    remainDose: remainDose,
    recommendDose: recommendDose
  }
}

module.exports = {
  needReplacePen: needReplacePen,
  getRefillInfo: getRefillInfo
}