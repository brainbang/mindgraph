const serialport = require('serialport')
const Mindwave = require('mindwave')
const { TimeSeries, SmoothieChart } = require('smoothie')

const dPorts = document.getElementById('ports')
const dGraphs = document.getElementById('graphs')

const bands = {
  attention: [0, 255, 0],
  meditation: [255, 0, 0],
  delta: [127, 127, 0],
  theta: [127, 0, 0],
  lowAlpha: [0, 127, 0],
  highAlpha: [255, 255, 0],
  lowBeta: [255, 127, 0],
  highBeta: [127, 255, 0],
  lowGamma: [0, 0, 127],
  highGamma: [255, 0, 127]
}

const charts = {}
const series = {}
const canvas = {}

Object.keys(bands).forEach(function (band, i) {
  const h = document.createElement('h3')
  h.innerHTML = band
  dGraphs.appendChild(h)
  charts[band] = new SmoothieChart()
  series[band] = new TimeSeries()
  canvas[band] = document.createElement('canvas')
  canvas[band].width = window.innerWidth - 30
  canvas[band].height = 50
  dGraphs.appendChild(canvas[band])
  charts[band].addTimeSeries(series[band], {
    strokeStyle: 'rgba(' + bands[band][0] + ', ' + bands[band][1] + ', ' + bands[band][2] + ', 1)',
    fillStyle: 'rgba(' + bands[band][0] + ', ' + bands[band][1] + ', ' + bands[band][2] + ', 0.2)',
    lineWidth: 1
  })
  charts[band].streamTo(canvas[band], 500)
})

const mw = new Mindwave()
mw.on('eeg', function (eeg) {
  const now = (new Date()).getTime()
  Object.keys(bands).forEach(function (band) {
    if (eeg[band]) {
      series[band].append(now, eeg[band])
    }
  })
})

mw.on('attention', function (attention) {
  const now = (new Date()).getTime()
  series.attention.append(now, attention)
})

mw.on('meditation', function (meditation) {
  const now = (new Date()).getTime()
  series.meditation.append(now, meditation)
})

dPorts.addEventListener('change', () => {
  mw.connect(dPorts.options[dPorts.selectedIndex].value)
})

serialport.list()
  .then(ports => {
    dPorts.innerHTML = '<option></option>' + ports.map(p => `<option>${p.path}</option>`).join('')
  })
