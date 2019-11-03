import { h } from 'virtual-dom'
import maps from './maps.json'
import config from '../../config.json'
import styles from './map.styl'
import find from 'lodash/find'
const socket = global.io()

export class Map extends HTMLElement {
  constructor() {
    super()
    this.styles = styles
  }

  attributeChangedCallback(attr, newVal) {
    this[attr] = newVal
    this.updateCanvas()
    this.render()
  }

  connectedCallback() {
    this.selectedContinent = config.defaultContinent || 'antonica'
    this.selectedMap = config.defaultMap || 'grobb'
    this.currentLine = 'Waiting for log activity...'

    this.updateCanvas()

    this.shadowRoot.querySelector('#continents')
      .addEventListener('change', ({ target }) => {
        this.selectedContinent = target.value
      })
    this.shadowRoot.querySelector('#maps')
      .addEventListener('change', ({ target }) => {
        this.selectedMap = target.value
      })

    socket.on('location', ({ location }) => {
      this.drawLocation(location)
    })
    socket.on('map', ({ map }) => {
      const found = find(maps, map)
      if(found) {
        this.selectedMap = map
        this.render()
      }
    })
    socket.on('line', ({ line }) => {
      this.currentLine = line
      this.render()
    })
  }

  convertCoords(x, y) {
    const map = this.maps[this.selectedMap]
    const size = (c) => [map.x, map.y]
      .map(c => Math.abs(c[0]) + Math.abs(c[1]))
    const [mapWidth, mapHeight] = size()
    var widthDiff = this.canvases.data.width / mapWidth * 100
    var heightDiff = this.canvases.data.height / mapHeight * 100
    x = (x * (widthDiff / 100)) * map.modX
    y = (y * (heightDiff / 100)) * map.modY
    return [x, y]
  }

  drawLocation([y, x]) {
    const map = this.maps[this.selectedMap]
    const dotOpts = [4, 0, 2 * Math.PI, true]
    this.contexts.data.clearRect(
      0, 0, this.canvases.data.width, this.canvases.data.height
    )
    this.contexts.data.save()
    this.contexts.data.translate(
      ...this.convertCoords(map.x[0], map.y[0])
    )

    if(config.debug) {
      this.contexts.data.fillStyle = 'green'
      this.contexts.data.beginPath()
      this.contexts.data.arc(0, 0, ...dotOpts)
      this.contexts.data.closePath()
      this.contexts.data.fill()
    }

    this.contexts.data.fillStyle = 'red'
    this.contexts.data.beginPath()
    this.contexts.data.arc(...this.convertCoords(x, y), ...dotOpts)
    this.contexts.data.closePath()
    this.contexts.data.fill()
    this.contexts.data.restore()
  }

  updateCanvas() {
    if(!this.selectedMap) return
    const map = this.maps[this.selectedMap]

    this.canvases = {
      img: this.shadowRoot.querySelector('canvas#img'),
      data: this.shadowRoot.querySelector('canvas#data'),
    }

    this.contexts = {
      img: this.canvases.img.getContext('2d'),
      data: this.canvases.data.getContext('2d'),
    }

    var background = new Image()
    background.src = map.path
    background.onload = ({ target }) => {
      ;['width', 'height'].forEach(d => {
        this.canvases.img[d] = target[d]
        this.canvases.data[d] = target[d]
      })
      this.contexts.img.drawImage(background, 0, 0)
    }
  }

  get continents() {
    return maps
  }

  get maps() {
    return this.continents[this.selectedContinent] || {}
  }

  get map() {
    return this.continents[this.selectedContinent][this.selectedMap] ||
      Object.keys(this.continents)[0]
  }

  get selectedContinent() {
    return this.getAttribute('selected-continent')
  }

  get selectedMap() {
    return this.getAttribute('selected-map')
  }

  set selectedContinent(continent) {
    this.setAttribute('selected-continent', continent)
  }

  set selectedMap(map) {
    this.setAttribute('selected-map', map)
  }

  get domTree() {
    return h('div', [
      h('.top', [
        h('label', { for: 'continents' }, 'Continent:'),
        h('select#continents', { value: this.selectedContinent }, [
          Object.keys(this.continents).map(continent => {
            return h('option', continent)
          }),
        ]),
        h('label', { for: 'maps' }, 'Map:'),
        h('select#maps', { value: this.selectedMap }, [
          Object.keys(this.maps).map(map => {
            return h('option', map)
          }),
        ]),
      ]),
      h('.log', this.currentLine),
      h('.canvases', [
        h('canvas#img'),
        h('canvas#data'),
      ]),
    ])
  }

  static get observedAttributes() {
    return ['selected-continent', 'selected-map', 'current-line']
  }
}
