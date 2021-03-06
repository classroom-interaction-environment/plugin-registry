import { check, Match } from 'meteor/check'
import { createCategoriesHandler } from './factories/createCategoriesHandler'
import { createLanguageChangeHandler } from './factories/createLanguageChangeHandler'
import { createTranslateHandler } from './factories/createTranslateHandler'
import { createReactiveTranslateHandler } from './factories/createReactiveTranslateHandler'
import { createRegisterHandler } from './factories/createRegisterHandler'
import { createLoadHandler } from './factories/createLoadHandler'

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
ItemPlugins.categories = createCategoriesHandler({ target: internal })

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
ItemPlugins.onLanguageChange = createLanguageChangeHandler({ target: internal })

/**
 * Inject a translation processor that handles i18n compatible strings.
 * Call without arguments to get it and use it in the plugins.
 * @param value {Function} optional
 * @return {function():String}
 */
ItemPlugins.translate = createTranslateHandler({ target: internal })

/**
 * Returns a function to resolve reactively to a translated label.
 * @return {function(): function(): String}
 */
ItemPlugins.translateReactive = createReactiveTranslateHandler({ target: internal })

/**
 * Register a plugin by it's name and an async import function.
 * @param name {String} the name of the plugin
 * @param importFct {async Function} the function to dynamic-import the plugin
 */
ItemPlugins.register = createRegisterHandler({ target: internal })

/**
 * Loads all registered plugins, clears the register-cache and resolves them
 * into an array of objects.
 * @return {Promise<{name: any, plugin: any}[]>}
 */
ItemPlugins.load = createLoadHandler({ target: internal })