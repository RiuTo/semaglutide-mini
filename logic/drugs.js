/**
 * 药物和规格配置
 */

var DRUGS = [
  {
    key: 'semaglutide_nht',
    name: '司美格鲁肽-诺和泰',
    type: 'diabetes',
    subtitle: '降糖版',
    specs: [
      {
        key: 'nht_15_2mg',
        name: '1.34mg/ml，1.5ml 预充笔',
        totalDose: 2,
        unit: 'mg',
        doses: [
          { dose: 2.5, count: 8, desc: '2.5mg×8次' },
          { dose: 5, count: 4, desc: '5mg×4次' }
        ],
        desc: '适用：起始2.5mg、5mg滴定阶段'
      },
      {
        key: 'nht_30_4mg',
        name: '1.34mg/ml，3ml 预充笔',
        totalDose: 4,
        unit: 'mg',
        doses: [
          { dose: 1, count: 4, desc: '1mg×4次' }
        ],
        desc: '适用：长期维持1mg控糖'
      }
    ]
  },
  {
    key: 'semaglutide_nhy',
    name: '司美格鲁肽-诺和盈',
    type: 'weight',
    subtitle: '减重版',
    specs: [
      {
        key: 'nhy_15_1mg',
        name: '0.68mg/ml，1.5ml',
        totalDose: 1,
        unit: 'mg',
        doses: [
          { dose: 2.5, count: 4, desc: '2.5mg×4剂' }
        ],
        desc: '减重起始'
      },
      {
        key: 'nhy_15_2mg',
        name: '1.34mg/ml，1.5ml',
        totalDose: 2,
        unit: 'mg',
        doses: [
          { dose: 5, count: 4, desc: '5mg×4剂' }
        ],
        desc: '减重滴定'
      },
      {
        key: 'nhy_30_4mg',
        name: '1.34mg/ml，3ml',
        totalDose: 4,
        unit: 'mg',
        doses: [
          { dose: 1, count: 4, desc: '1mg×4剂' }
        ],
        desc: '减重维持'
      },
      {
        key: 'nhy_30_68mg',
        name: '2.27mg/ml，3ml',
        totalDose: 6.8,
        unit: 'mg',
        doses: [
          { dose: 1.7, count: 4, desc: '1.7mg×4剂' }
        ],
        desc: '减重加量'
      },
      {
        key: 'nhy_30_96mg',
        name: '3.20mg/ml，3ml',
        totalDose: 9.6,
        unit: 'mg',
        doses: [
          { dose: 2.4, count: 4, desc: '2.4mg×4剂' }
        ],
        desc: '减重最高维持剂量'
      }
    ]
  },
  {
    key: 'tirzepatide',
    name: '替尔波肽',
    type: 'both',
    subtitle: '',
    specs: [
      {
        key: 'tir_25mg',
        name: '0.5ml:2.5mg',
        totalDose: 2.5,
        unit: 'mg',
        doses: [
          { dose: 2.5, count: 1, desc: '2.5mg×1次' }
        ],
        desc: '起始剂量'
      },
      {
        key: 'tir_5mg',
        name: '0.5ml:5mg',
        totalDose: 5,
        unit: 'mg',
        doses: [
          { dose: 5, count: 1, desc: '5mg×1次' }
        ],
        desc: '滴定剂量'
      },
      {
        key: 'tir_75mg',
        name: '0.5ml:7.5mg',
        totalDose: 7.5,
        unit: 'mg',
        doses: [
          { dose: 7.5, count: 1, desc: '7.5mg×1次' }
        ],
        desc: '滴定剂量'
      },
      {
        key: 'tir_10mg',
        name: '0.5ml:10mg',
        totalDose: 10,
        unit: 'mg',
        doses: [
          { dose: 10, count: 1, desc: '10mg×1次' }
        ],
        desc: '维持剂量'
      }
    ]
  }
]

function getDrugs() {
  return DRUGS
}

function getDrugByKey(key) {
  for (var i = 0; i < DRUGS.length; i++) {
    if (DRUGS[i].key === key) {
      return DRUGS[i]
    }
  }
  return null
}

function getSpecsByDrugKey(drugKey) {
  var drug = getDrugByKey(drugKey)
  if (drug) {
    return drug.specs
  }
  return []
}

function getSpecByKey(drugKey, specKey) {
  var specs = getSpecsByDrugKey(drugKey)
  for (var i = 0; i < specs.length; i++) {
    if (specs[i].key === specKey) {
      return specs[i]
    }
  }
  return null
}

function getDrugName(key) {
  var drug = getDrugByKey(key)
  if (drug) {
    return drug.name
  }
  return ''
}

function getSpecName(drugKey, specKey) {
  var spec = getSpecByKey(drugKey, specKey)
  if (spec) {
    return spec.name
  }
  return ''
}

/**
 * 计算已使用剂量
 * @param {number} totalDose 总剂量
 * @param {number} usedCount 已使用次数
 * @param {number} perDose 每次剂量
 * @returns {number} 已使用剂量
 */
function calculateUsedDose(totalDose, usedCount, perDose) {
  return usedCount * perDose
}

/**
 * 计算剩余剂量百分比
 * @param {number} totalDose 总剂量
 * @param {number} usedCount 已使用次数
 * @param {number} perDose 每次剂量
 * @returns {number} 剩余百分比 0-100
 */
function calculateRemainingPercent(totalDose, usedCount, perDose) {
  if (totalDose <= 0) return 0
  var used = usedCount * perDose
  var remaining = totalDose - used
  if (remaining < 0) remaining = 0
  return Math.round((remaining / totalDose) * 100)
}

module.exports = {
  DRUGS: DRUGS,
  getDrugs: getDrugs,
  getDrugByKey: getDrugByKey,
  getSpecsByDrugKey: getSpecsByDrugKey,
  getSpecByKey: getSpecByKey,
  getDrugName: getDrugName,
  getSpecName: getSpecName,
  calculateUsedDose: calculateUsedDose,
  calculateRemainingPercent: calculateRemainingPercent
}