/* global unsafeWindow, globalThis */

const global = typeof unsafeWindow !== 'undefined' ? unsafeWindow : globalThis;
const { document, JSON } = global;
const RE_NUMERIC = /^\d?\.?\d+$/;

export const
    isPlainObject = (param) => param instanceof Object && Object.getPrototypeOf(param) === Object.prototype,
    isUndef = (param) => typeof param === 'undefined',
    isString = (param) => typeof param === 'string',
    isNumber = (param) => typeof param === 'number',
    isInt = (param) => Number.isInteger(param),
    isFloat = (param) => isNumber(param) && !isInt(param) && !isNaN(param),
    isUnsigned = (param) => param >= 0 && isNumber(param),
    isUnsignedInt = (param) => param >= 0 && isInt(param),
    isNumeric = (param) => isInt(param) || isFloat(param) || RE_NUMERIC.test(param),
    intVal = (param) => isNumeric(param) && parseInt(param),
    floatVal = (param) => isNumeric(param) && parseFloat(param),
    isBool = (param) => typeof param === 'boolean',
    isArray = (param) => Array.isArray(param),
    isNull = (param) => param === null,
    isObject = (param) => typeof param === 'object' && !isNull(param),
    isCallable = (param) => typeof param === 'function',
    isFunction = isCallable,
    isScalar = (param) => isNumeric(param) || isString(param) || isBool(param);

const
    VALID_REFERERRPOLICY = [
        'no-referrer', 'no-referrer-when-downgrade',
        'origin', 'origin-when-cross-origin',
        'same-origin', 'strict-origin',
        'strict-origin-when-cross-origin', 'unsafe-url'
    ],
    VALID_CROSSORIGIN = ['', 'use-credentials', 'anonymous'];
export function isEmpty(param) {

    if (isUndef(param) || param === null) {
        return true;
    }
    if (isString(param) || isArray(param)) {
        return param.length === 0;
    }
    if (isNumber(param)) {
        return param === 0;
    }

    if (isPlainObject(param)) {
        return Object.keys(param).length === 0;
    }
    return false;
}

export function runAsync(callback, ...args) {
    if (isFunction(callback)) {
        setTimeout(() => {
            callback(...args);
        }, 0);
    }
}

/**
 * Creates an Element
 *
 * @param {string} tagName
 * @param {Object} [attributes]
 * @param {string} [innerHTML]
 * @returns {HTMLElement}
 */
export function createElement(tagName = 'div', attributes = null, innerHTML = '') {
    if (isString(attributes)) {
        innerHTML = attributes;
        attributes = null;
    }

    attributes = isPlainObject(attributes) ? attributes : {};

    let elem = document.createElement(tagName),
        props = Object.keys(attributes),
        prop;

    for (let i = 0; i < props.length; i++) {
        prop = props[i];
        if (prop === 'html') {
            innerHTML = attributes[prop];
            continue;
        }

        if (/^data(set)?$/.test(prop) && isPlainObject(attributes[prop])) {
            Object.keys(attributes[prop]).forEach((key) => {
                elem.dataset[key] = attributes[prop][key];
            });
        } else if (typeof attributes[prop] !== 'string') {
            elem[prop] = attributes[prop];
            continue;
        } else {
            elem.setAttribute(prop, attributes[prop]);
        }
    }
    if (innerHTML.length > 0) {
        elem.innerHTML = innerHTML;
    }

    return elem;
}



/**
 * Generate a unique ID
 * @returns {String}
 */
export function uniqid() {


    uniqid.values = uniqid.values || [];
    let value;

    while (!value || uniqid.values.includes(value)) {
        value = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    uniqid.values.push(value);
    return value;
}

/**
 * Clones an Object
 * @param {Object} obj
 * @returns {Object|undefined}
 */
export function clone(obj) {
    if (obj instanceof Object) {
        return Object.assign({}, obj);
    }

    return obj;
}

/**
 * Clones Object recursively
 * 
 * @param {Object} obj 
 * @returns 
 */
export function cloneRecursive(obj) {
    if (obj instanceof Object) {


        if (isArray(obj)) {

            return Array.from(obj).map(value => {
                if (isPlainObject(value) || isArray(value)) {
                    return cloneRecursive(value);
                }
                return value;
            });
        }

        if (!isPlainObject(obj)) {
            throw new TypeError('Invalid Object supplied.');
        }

        obj = clone(obj);
        for (let prop in obj) {
            if (isPlainObject(obj[prop]) || isArray(obj[prop])) {
                obj[prop] = cloneRecursive(obj[prop]);
            }
        }

    }

    return obj;
}

/**
 * Creates a Document from html code
 * @param {string} html
 * @returns {documentElement}
 */
export function html2doc(html) {
    let node = document.implementation.createHTMLDocument().documentElement;
    if (isString(html) && html.length > 0) {
        node.innerHTML = html;
    }
    return node;
}

/**
 * Creates an HTMLElement from html code
 * @param {string} html
 * @returns {HTMLElement|Text|NodeList}
 */
export function html2element(html) {
    if (isString(html) && html.length > 0) {
        let template = createElement('template', html),
            content = template.content;
        if (content.childNodes.length === 0) {
            return;
        }
        if (content.childNodes.length > 1) {
            return content.childNodes;
        } else {
            return content.childNodes[0];
        }
    }
}
export function getUrl(url) {

    if (url instanceof URL || isString(url)) {

        let a = createElement('a');
        a.href = url;
        return a.href;

    }
}

export function loadScript(url, options) {
    return new Promise(resolve => {
        const params = Object.assign({
            async: null,
            defer: null,
            crossorigin: null,
            referrerpolicy: null,
            type: null,
        }, options ?? {});

        let { async, defer, crossorigin, referrerpolicy, type } = params;

        if (async !== true) {
            async = null;
        }

        if (defer !== true) {
            defer = null;
        }

        if (VALID_CROSSORIGIN.includes(crossorigin)) {
            crossorigin = null;
        }
        if (VALID_REFERERRPOLICY.includes(referrerpolicy)) {
            referrerpolicy = null;
        }
        if (type !== 'module') {
            type = null;
        }

        if (url = getUrl(url)) {

            const script = createElement('script', { src: url, onload: () => resolve(script), id: uniqid() });

            for (let param in params) {
                let value = params[param];
                if (null !== value) {
                    script[param] = value;
                }
            }


            document.getElementsByTagName('head')[0].appendChild(script);
        }

    });
}


export {
    JSON,
    global,
    document,
};
