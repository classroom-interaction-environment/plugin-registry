import { check, Match } from 'meteor/check'

/**
 *
 * @type {{
 *  categories: Function,
 *  dataTypes: Function,
 *  register: Function,
 *  load: Function
 * }}
 */
export const ItemPlugins = {}

/**
 * @private
 */
const internal = {
  categories: () => {},
  dataTypes: () => {},
  registered: new Map(),
  translate: x => x
}

/**
 * Inject a translation processor that handles i18n compatible strings.
 * Call without arguments to get it and use it in the plugins.
 * @param value {Function} optional
 * @return {function():String}
 */
ItemPlugins.translate = function (value) {
  check(value, Match.Maybe(Function))

  if (typeof value === 'function') {
    internal.translate = value
    return
  }

  return (...args) => internal.translate(...args)
}

/**
 * Returns a function to resolve reactively to a translated label.
 * @return {function(): function(): String}
 */
ItemPlugins.translateReactive = function () {
  return (...args) => () => internal.translate(...args)
}

/**
 * Registers a function that returns all available/registered categories
 * @param value {Function} optional pass a function that returns categories
 * @return {Object} All categories mapped to an Object
 */
ItemPlugins.categories = function (value) {
  check(value, Match.Maybe(Function))

  if (value) {
    internal.categories = value
  }

  return internal.categories()
}

ItemPlugins.dataTypes = function (value) {
  check(value, Match.Maybe(Function))

  if (value) {
    internal.dataTypes = value
  }

  return internal.dataTypes()
}

ItemPlugins.register = function (name, /* async */ importFct) {
  check(name, String)
  check(importFct, Function)
  internal.registered.set(name, importFct)
}

ItemPlugins.load = async function () {
  const all = Array.from(internal.registered.entries())
  const imports = all.map(entry => {
    const importFct = entry[1]
    return importFct()
  })
  return Promise.all(imports)
    .then(allResolved => {
      internal.registered.clear()

      return allResolved.map((plugin, index) => {
        return { name: all[index][0], plugin }
      })
    })
}
