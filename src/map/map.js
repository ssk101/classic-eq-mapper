import { h } from 'virtual-dom'
import maps from './maps.json'
import config from '../../config.json'
import styles from './map.styl'
import find from 'lodash/find'
import { skull } from './shapes.json'
const socket = global.io()

export class Map extends HTMLElement {
  constructor() {
    super()
    this.styles = styles
  }

  attributeChangedCallback(attr, newVal) {
    this[attr] = newVal
    this.updateMapImage()
    this.render()
  }

  connectedCallback() {
    this.selectedContinent = config.defaultContinent || 'antonica'
    this.selectedMap = config.defaultMap || 'grobb'
    this.currentLine = 'Waiting for log activity...'
    this.currentLocation = [0, 0]
    this.deathLocations = []
    this.render()

    this.updateMapImage()

    this.shadowRoot.querySelector('#continents')
      .addEventListener('change', ({ target }) => {
        this.selectedContinent = target.value
      })
    this.shadowRoot.querySelector('#maps')
      .addEventListener('change', ({ target }) => {
        this.selectedMap = target.value
      })

    socket.on('location', ({ location }) => {
      this.currentLocation = location
      this.render()
      this.drawLocation()
    })
    socket.on('death', () => {
      this.render()
      this.drawLocation({ death: true })
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

  convertCoords(x, y, layer = 'player') {
    const map = this.maps[this.selectedMap]
    const size = (c) => [map.x, map.y]
      .map(c => Math.abs(c[0]) + Math.abs(c[1]))
    const [mapWidth, mapHeight] = size()
    var widthDiff = this.canvases[layer].width / mapWidth * 100
    var heightDiff = this.canvases[layer].height / mapHeight * 100
    x = (x * (widthDiff / 100)) * map.modX
    y = (y * (heightDiff / 100)) * map.modY
    return [x, y]
  }

  drawLocation(highlights = {}) {
    const [y, x] = this.currentLocation
    const map = this.maps[this.selectedMap]
    const dotOpts = [4, 0, 2 * Math.PI, true]

    if(highlights.death) {
      this.deathLocations.push(this.currentLocation)
      this.contexts.highlights.translate(
        ...this.convertCoords(map.x[0], map.y[0])
      )
      this.contexts.highlights.clearRect(
        0, 0, this.canvases.highlights.width, this.canvases.highlights.height
      )

      this.deathLocations.forEach(([dy, dx]) => {
        var icon = new Image()
        icon.onload = () => {
          const width = 20
          const height = 20
          const coords = this.convertCoords(dx, dy)
          this.contexts.highlights.drawImage(
            icon,
            coords[0] - (width / 2),
            coords[1] - (height / 2),
            width,
            height
          )
        }
        icon.src = skull
      })
    }

    if(config.debug) {
      this.contexts.debug.translate(...this.convertCoords(map.x[0], map.y[0]))
      this.contexts.debug.clearRect(
        0, 0, this.canvases.debug.width, this.canvases.debug.height
      )
      this.contexts.debug.fillStyle = 'green'
      this.contexts.debug.beginPath()
      this.contexts.debug.arc(0, 0, ...dotOpts)
      this.contexts.debug.closePath()
      this.contexts.debug.fill()
    }

    this.contexts.player.translate(...this.convertCoords(map.x[0], map.y[0]))
    this.contexts.player.clearRect(
      0, 0, this.canvases.player.width, this.canvases.player.height
    )
    this.contexts.player.fillStyle = 'red'
    this.contexts.player.beginPath()
    this.contexts.player.arc(...this.convertCoords(x, y), ...dotOpts)
    this.contexts.player.closePath()
    this.contexts.player.fill()
  }

  updateMapImage() {
    if(!this.selectedMap || !Object.keys(this.canvases).length) return
    const map = this.maps[this.selectedMap]
    var background = new Image()
    background.src = map.path
    background.onload = ({ target }) => {
      ;['width', 'height'].forEach(d => {
        this.layers.forEach(layer => {
          this.canvases[layer][d] = target[d]
        })
      })
      this.contexts.img.drawImage(background, 0, 0)
    }
  }

  get canvases() {
    return this.layers.reduce((acc, layer) => {
      acc[layer] = this.shadowRoot.querySelector(`canvas#${layer}`)
      return acc
    }, {})
  }

  get contexts() {
    if(!Object.keys(this.canvases).length) return
    return this.layers.reduce((acc, layer) => {
      acc[layer] = this.canvases[layer].getContext('2d')
      return acc
    }, {})
  }

  get layers() {
    return [
      'img',
      'debug',
      'highlights',
      'player',
    ]
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
      h('.canvases', this.layers.map(layer => h(`canvas#${layer}`))),
    ])
  }

  static get observedAttributes() {
    return [
      'selected-continent',
      'selected-map',
    ]
  }
}
