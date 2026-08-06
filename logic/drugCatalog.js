/**
 * 药物规格目录
 * 统一管理所有药物和规格配置
 */

var DrugCatalog = [
  // 诺和泰（司美格鲁肽 - 降糖版）
  {
    id: 'nht_15_2mg',
    drugName: '司美格鲁肽',
    brandName: '诺和泰',
    type: 'semaglutide_nht',
    typeName: '降糖版',
    concentration: 1.34,
    totalDose: 2,
    volume: 1.5,
    form: '预充笔',
    doses: [0.25, 0.5, 0.75, 1],
    description: '起始滴定阶段'
  },
  {
    id: 'nht_30_4mg',
    drugName: '司美格鲁肽',
    brandName: '诺和泰',
    type: 'semaglutide_nht',
    typeName: '降糖版',
    concentration: 1.34,
    totalDose: 4,
    volume: 3,
    form: '预充笔',
    doses: [0.25, 0.5, 0.75, 1],
    description: '长期维持1mg控糖'
  },
  // 诺和盈（司美格鲁肽 - 减重版）
  {
    id: 'nhy_15_1mg',
    drugName: '司美格鲁肽',
    brandName: '诺和盈',
    type: 'semaglutide_nhy',
    typeName: '减重版',
    concentration: 0.68,
    totalDose: 1,
    volume: 1.5,
    form: '预充笔',
    doses: [0.25],
    description: '减重起始'
  },
  {
    id: 'nhy_15_2mg',
    drugName: '司美格鲁肽',
    brandName: '诺和盈',
    type: 'semaglutide_nhy',
    typeName: '减重版',
    concentration: 1.34,
    totalDose: 2,
    volume: 1.5,
    form: '预充笔',
    doses: [0.5],
    description: '减重滴定'
  },
  {
    id: 'nhy_30_4mg',
    drugName: '司美格鲁肽',
    brandName: '诺和盈',
    type: 'semaglutide_nhy',
    typeName: '减重版',
    concentration: 1.34,
    totalDose: 4,
    volume: 3,
    form: '预充笔',
    doses: [1],
    description: '减重滴定'
  },
  {
    id: 'nhy_30_68mg',
    drugName: '司美格鲁肽',
    brandName: '诺和盈',
    type: 'semaglutide_nhy',
    typeName: '减重版',
    concentration: 2.27,
    totalDose: 6.8,
    volume: 3,
    form: '预充笔',
    doses: [1.7],
    description: '减重点滴定'
  },
  {
    id: 'nhy_30_96mg',
    drugName: '司美格鲁肽',
    brandName: '诺和盈',
    type: 'semaglutide_nhy',
    typeName: '减重版',
    concentration: 3.20,
    totalDose: 9.6,
    volume: 3,
    form: '预充笔',
    doses: [2.4],
    description: '减重最高维持剂量'
  },
  // 替尔泊肽（固定单次注射容积 0.6mL）
  {
    id: 'tze_24_10mg',
    drugName: '替尔泊肽',
    brandName: '',
    type: 'tirzepatide',
    typeName: '',
    concentration: 4.1667,
    totalDose: 10,
    volume: 2.4,
    form: '预填充注射笔',
    doses: [2.5],
    doseVolume: 0.6,
    description: '起始剂量'
  },
  {
    id: 'tze_24_20mg',
    drugName: '替尔泊肽',
    brandName: '',
    type: 'tirzepatide',
    typeName: '',
    concentration: 8.3333,
    totalDose: 20,
    volume: 2.4,
    form: '预填充注射笔',
    doses: [5],
    doseVolume: 0.6,
    description: '滴定剂量'
  },
  {
    id: 'tze_24_30mg',
    drugName: '替尔泊肽',
    brandName: '',
    type: 'tirzepatide',
    typeName: '',
    concentration: 12.5,
    totalDose: 30,
    volume: 2.4,
    form: '预填充注射笔',
    doses: [7.5],
    doseVolume: 0.6,
    description: '滴定剂量'
  },
  {
    id: 'tze_24_40mg',
    drugName: '替尔泊肽',
    brandName: '',
    type: 'tirzepatide',
    typeName: '',
    concentration: 16.6667,
    totalDose: 40,
    volume: 2.4,
    form: '预填充注射笔',
    doses: [10],
    doseVolume: 0.6,
    description: '维持剂量'
  }
]

function getDrugSpec(specId) {
  if (!specId) return null
  for (var i = 0; i < DrugCatalog.length; i++) {
    if (DrugCatalog[i].id === specId) {
      return DrugCatalog[i]
    }
  }
  return null
}

function getSpecsByDrugType(drugType) {
  var result = []
  for (var i = 0; i < DrugCatalog.length; i++) {
    if (DrugCatalog[i].type === drugType) {
      result.push(DrugCatalog[i])
    }
  }
  return result
}

function getDrugTypes() {
  var types = {}
  for (var i = 0; i < DrugCatalog.length; i++) {
    var item = DrugCatalog[i]
    if (!types[item.type]) {
      types[item.type] = {
        type: item.type,
        drugName: item.drugName,
        brandName: item.brandName,
        name: item.brandName || item.drugName,
        typeName: item.typeName
      }
    }
  }
  var result = []
  for (var key in types) {
    result.push(types[key])
  }
  return result
}

function getSpecDisplay(specId) {
  var spec = getDrugSpec(specId)
  if (!spec) return ''
  return spec.concentration + 'mg/ml，' + spec.volume + 'ml' + spec.form
}

function getDrugName(drugType) {
  var types = getDrugTypes()
  for (var i = 0; i < types.length; i++) {
    if (types[i].type === drugType) {
      return types[i].name
    }
  }
  return ''
}

function matchSpecByTotalDose(drugType, totalDose) {
  var specs = getSpecsByDrugType(drugType)
  for (var i = 0; i < specs.length; i++) {
    if (specs[i].totalDose === totalDose) {
      return specs[i]
    }
  }
  return null
}

function getDosesByDrugType(drugType) {
  var doseMap = {}
  doseMap['semaglutide_nht'] = [0.25, 0.5, 0.75, 1]
  doseMap['semaglutide_nhy'] = [0.25, 0.5, 0.75, 1, 1.7, 2.4]
  doseMap['tirzepatide'] = [2.5, 5, 7.5, 10]
  return doseMap[drugType] || [0.25, 0.5, 0.75, 1]
}

module.exports = {
  DrugCatalog: DrugCatalog,
  getDrugSpec: getDrugSpec,
  getSpecsByDrugType: getSpecsByDrugType,
  getDrugTypes: getDrugTypes,
  getSpecDisplay: getSpecDisplay,
  getDrugName: getDrugName,
  matchSpecByTotalDose: matchSpecByTotalDose,
  getDosesByDrugType: getDosesByDrugType
}
