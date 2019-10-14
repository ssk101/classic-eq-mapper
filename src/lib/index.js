import createElement from 'virtual-dom/create-element'
import { diff, patch } from 'virtual-dom'

global.CACHE = {}

export function attachTemplate() {
  this.attachShadow({ mode: 'open' })

  const style = document.createElement('style')
  style.innerHTML = this.styles
  this.shadowRoot.appendChild(style)

  const template = createElement(this.domTree)
  this.shadowRoot.appendChild(template)
  CACHE[this.tagName] = { template, oldTree: this.domTree }
}

export function render() {
  const tag = this.tagName
  if (!CACHE[tag]) return
  const patches = diff(CACHE[tag].oldTree, this.domTree)
  CACHE[tag].template = patch(CACHE[tag].template, patches)
  CACHE[tag].oldTree = this.domTree
}