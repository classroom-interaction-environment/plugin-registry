import { check, Match } from 'meteor/check'

/**
 * Plugin registry for item plugins.
 */
export const ItemPlugins = {}

// /////////////////////////////////////////////////////////////////////////////
//
// INTERNAL
//
// /////////////////////////////////////////////////////////////////////////////

/**
 * @private
 */
const internal = {
  categories: () => {},
  dataTypes: () => {},
  registered: new Map(),
  translate: x => x,
  languageChangeHandlers: []
}

// /////////////////////////////////////////////////////////////////////////////
//
// HELPERS API / DEPENDENCY INJECTION
//
// /////////////////////////////////////////////////////////////////////////////

/**
 * Host: Registers a function that returns all available/registered categories
 * Plugin: Call without args to receive all available categories
 * @param value {Function} optional pass a function that returns categories
 * @return {function(): Object}
 */
ItemPlugins.categories = function (value) {
  check(value, Match.Maybe(Function))

  if (value) {
    internal.categories = value
  }

  return internal.categories()
}

/**
 * Host: Registers a function that returns all available dataTypes
 * Plugin: Call without args to receive all available dataTypes
 * @param value
 * @return {function(): Object}
 */
ItemPlugins.dataTypes = function (value) {
  check(value, Match.Maybe(Function))

  if (value) {
    internal.dataTypes = value
  }

  return internal.dataTypes()
}

/**
 * Host: call this method with a language code to make plugins import their
 *       translations
 * Plugin: call with a function argument that imports tha language by isocode
 *         and returns a promise that resolves to the JSON object
 * @param value {String|Function}
 * @return {undefined|Promise<any[]>}
 */
ItemPlugins.onLanguageChange = function (value) {
  if (typeof value === 'function') {
    internal.languageChangeHandlers.push(value)
  } else {
    const promises = internal.languageChangeHandlers.map(fct => fct(value))
    console.info(promises)
    return Promise.all(promises)
  }
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
 * Register a plugin by it's name and an async import function.
 * @param name {String} the name of the plugin
 * @param importFct {async Function} the function to dynamic-import the plugin
 */
ItemPlugins.register = function (name, /* async */ importFct) {
  check(name, String)
  check(importFct, Function)
  internal.registered.set(name, importFct)
}

/**
 * Loads all registered plugins, clears the register-cache and resolves them
 * into an array of objects.
 * @return {Promise<{name: any, plugin: any}[]>}
 */
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
