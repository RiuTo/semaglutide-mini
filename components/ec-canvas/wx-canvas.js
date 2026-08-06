function WxCanvas(ctx, canvasId, isNew, canvasNode) {
  this.ctx = ctx
  this.canvasId = canvasId
  this.chart = null
  this.isNew = isNew
  if (isNew) {
    this.canvasNode = canvasNode
  } else {
    this._initStyle(ctx)
  }
  this._initEvent()
}

WxCanvas.prototype.getContext = function (contextType) {
  if (contextType === '2d') {
    return this.ctx
  }
}

WxCanvas.prototype.setChart = function (chart) {
  this.chart = chart
}

WxCanvas.prototype.addEventListener = function () {
  // noop
}

WxCanvas.prototype.attachEvent = function () {
  // noop
}

WxCanvas.prototype.detachEvent = function () {
  // noop
}

WxCanvas.prototype._initStyle = function (ctx) {
  ctx.createRadialGradient = function () {
    return ctx.createCircularGradient(arguments)
  }
}

WxCanvas.prototype._initEvent = function () {
  var that = this
  this.event = {}
  var eventNames = [
    { wxName: 'touchStart', ecName: 'mousedown' },
    { wxName: 'touchMove', ecName: 'mousemove' },
    { wxName: 'touchEnd', ecName: 'mouseup' },
    { wxName: 'touchEnd', ecName: 'click' }
  ]
  eventNames.forEach(function (name) {
    that.event[name.wxName] = function (e) {
      var touch = e.touches[0]
      that.chart.getZr().handler.dispatch(name.ecName, {
        zrX: name.wxName === 'tap' ? touch.clientX : touch.x,
        zrY: name.wxName === 'tap' ? touch.clientY : touch.y,
        preventDefault: function () {},
        stopImmediatePropagation: function () {},
        stopPropagation: function () {}
      })
    }
  })
}

Object.defineProperty(WxCanvas.prototype, 'width', {
  set: function (w) {
    if (this.canvasNode) this.canvasNode.width = w
  },
  get: function () {
    if (this.canvasNode) return this.canvasNode.width
    return 0
  }
})

Object.defineProperty(WxCanvas.prototype, 'height', {
  set: function (h) {
    if (this.canvasNode) this.canvasNode.height = h
  },
  get: function () {
    if (this.canvasNode) return this.canvasNode.height
    return 0
  }
})

module.exports = WxCanvas
