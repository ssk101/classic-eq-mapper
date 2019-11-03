import { attachTemplate, render } from './lib'
import { Map } from './map/map'

const main = document.querySelector('main')

const define = (Class) => {
  const k = Class.name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
  const tag = `cem-${k}`
  Object.assign(Class.prototype, {
    render() {
      render.call(this)
    },
    attachTemplate() {
      attachTemplate.call(this)
    },
  })
  customElements.define(tag, Class)
  const element = document.createElement(tag)
  element.attachTemplate()
  return element
}

main.appendChild(define(Map))
