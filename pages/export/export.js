var injectStore = require('../../storage/injectStore.js')
var drugCatalog = require('../../logic/drugCatalog.js')

Page({
  data: {
    recordCount: 0,
    exportPath: '',
    savePath: '',
    drugName: '',
    spec: ''
  },

  onLoad: function () {
    this.loadStats()
    this.setDefaultSavePath()
  },

  onShow: function () {
    this.loadStats()
  },

  loadStats: function () {
    var plan = injectStore.getPlan()
    var records = plan.records || []
    var specKey = plan.specKey || ''
    var spec = drugCatalog.getDrugSpec(specKey) || {}
    var drugName = spec.drugName || '司美格鲁肽'
    var specStr = spec.totalDose ? spec.totalDose + 'mg' : ''

    this.setData({
      recordCount: records.length,
      drugName: drugName,
      spec: specStr
    })
  },

  setDefaultSavePath: function () {
    var basePath = wx.env.USER_DATA_PATH
    var fileName = 'inject_' + this.formatDate() + '.csv'
    this.setData({
      savePath: basePath + '/' + fileName
    })
  },

  formatDate: function () {
    var now = new Date()
    var year = now.getFullYear()
    var month = String(now.getMonth() + 1).padStart(2, '0')
    var day = String(now.getDate()).padStart(2, '0')
    return year + month + day
  },

  buildExportData: function () {
    var plan = injectStore.getPlan()
    var records = plan.records || []
    var specKey = plan.specKey || ''
    var spec = drugCatalog.getDrugSpec(specKey) || {}
    var drugName = spec.drugName || '司美格鲁肽'
    var specStr = spec.totalDose ? spec.totalDose + 'mg/' + spec.volume + 'ml' : ''

    var data = []
    for (var i = 0; i < records.length; i++) {
      var r = records[i]
      data.push({
        drugName: drugName,
        spec: specStr,
        date: r.date || '',
        dose: r.dose || '',
        site: r.site || ''
      })
    }

    data.sort(function (a, b) {
      return a.date.localeCompare(b.date)
    })

    return data
  },

  toCSV: function (data) {
    var header = '药物名称,规格,日期,剂量(mg),部位\n'
    var rows = ''

    for (var i = 0; i < data.length; i++) {
      var item = data[i]
      rows += item.drugName + ',' + item.spec + ',' + item.date + ',' + item.dose + ',' + item.site + '\n'
    }

    return header + rows
  },

  onExport: function () {
    if (this.data.recordCount === 0) {
      wx.showToast({
        title: '暂无数据可导出',
        icon: 'none'
      })
      return
    }

    var that = this
    var exportData = this.buildExportData()
    var csvContent = this.toCSV(exportData)
    var fileName = 'inject_' + this.formatDate() + '.csv'
    var basePath = wx.env.USER_DATA_PATH
    var filePath = basePath + '/' + fileName

    var fs = wx.getFileSystemManager()

    try {
      fs.unlinkSync(filePath)
    } catch (e) {
      // ignore
    }

    try {
      fs.writeFileSync(filePath, csvContent, 'utf8')
      console.log('CSV文件已保存:', filePath)

      that.setData({
        exportPath: filePath,
        savePath: filePath
      })

      wx.showModal({
        title: '导出成功',
        content: '文件已保存至:\n' + filePath + '\n\n是否立即打开？',
        confirmText: '打开',
        cancelText: '关闭',
        success: function (res) {
          if (res.confirm) {
            wx.openDocument({
              filePath: filePath,
              fileType: 'csv',
              success: function () {
                console.log('文件打开成功')
              },
              fail: function (err) {
                console.error('打开文件失败', err)
                wx.showToast({
                  title: '打开失败',
                  icon: 'none'
                })
              }
            })
          }
        }
      })
    } catch (e) {
      console.error('导出失败', e)
      wx.showToast({
        title: '导出失败',
        icon: 'none'
      })
    }
  },

  onShareFile: function () {
    if (!this.data.exportPath) {
      wx.showToast({
        title: '请先导出文件',
        icon: 'none'
      })
      return
    }

    wx.shareFileMessage({
      filePath: this.data.exportPath,
      fileName: 'inject_' + this.formatDate() + '.csv',
      success: function () {
        console.log('文件分享成功')
      },
      fail: function (err) {
        console.error('分享失败', err)
        wx.showToast({
          title: '分享失败',
          icon: 'none'
        })
      }
    })
  },

  onBack: function () {
    wx.navigateBack()
  }
})