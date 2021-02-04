import { createLoadHandler } from './factories/createLoadHandler'
import { createLanguageChangeHandler } from './factories/createLanguageChangeHandler'
import { createRegisterHandler } from './factories/createRegisterHandler'
import { createCategoriesHandler } from './factories/createCategoriesHandler'
import { createReactiveTranslateHandler } from './factories/createReactiveTranslateHandler'
import { createTranslateHandler } from './factories/createTranslateHandler'

/**
 *
 * @type {{
 *  categories: Function,
 *  onLanguageChange: Function,
 *  translate: Function,
 *  translateReactive: Function,
 *  register: Function,
 *  load: Function
 * }}
 */
export const TaskElementPlugins = {}

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
TaskElementPlugins.categories = createCategoriesHandler({ target: internal })

/**
 * Host: call this method with a language code to make plugins import their
 *       translations
 * Plugin: call with a function argument that imports tha language by isocode
 *         and returns a promise that resolves to the JSON object
 * @param value {String|Function}
 * @return {undefined|Promise<any[]>}
 */
TaskElementPlugins.onLanguageChange = createLanguageChangeHandler({ target: internal })

/**
 * Inject a translation processor that handles i18n compatible strings.
 * Call without arguments to get it and use it in the plugins.
 * @param value {Function} optional
 * @return {function():String}
 */
TaskElementPlugins.translate = createTranslateHandler({ target: internal })

/**
 * Returns a function to resolve reactively to a translated label.
 * @return {function(): function(): String}
 */
TaskElementPlugins.translateReactive = createReactiveTranslateHandler({ target: internal })

/**
 * Register a plugin by it's name and an async import function.
 * @param name {String} the name of the plugin
 * @param importFct {async Function} the function to dynamic-import the plugin
 */
TaskElementPlugins.register = createRegisterHandler({ target: internal })

/**
 * Loads all registered plugins, clears the register-cache and resolves them
 * into an array of objects.
 * @return {Promise<{name: any, plugin: any}[]>}
 */
TaskElementPlugins.load = createLoadHandler({ target: internal })