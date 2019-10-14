import { Map } from './map'

const define = (klass) => {
  const k = klass.name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
  const tag = `ss-${k}`
  customElements.define(tag, klass)
  return document.createElement(tag)
}

const main = document.querySelector('main')
main.appendChild(define(Map))