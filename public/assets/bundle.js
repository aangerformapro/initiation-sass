/* global unsafeWindow, globalThis */

const global = typeof unsafeWindow !== 'undefined' ? unsafeWindow : globalThis;
const { document: document$1, JSON } = global;
const RE_NUMERIC = /^\d?\.?\d+$/;

const isPlainObject = (param) => param instanceof Object && Object.getPrototypeOf(param) === Object.prototype,
    isString = (param) => typeof param === 'string',
    isNumber = (param) => typeof param === 'number',
    isInt = (param) => Number.isInteger(param),
    isFloat = (param) => isNumber(param) && !isInt(param) && !isNaN(param),
    isNumeric = (param) => isInt(param) || isFloat(param) || RE_NUMERIC.test(param),
    intVal = (param) => isNumeric(param) && parseInt(param),
    isCallable = (param) => typeof param === 'function',
    isFunction = isCallable;

function runAsync(callback, ...args) {
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
function createElement(tagName = 'div', attributes = null, innerHTML = '') {
    if (isString(attributes)) {
        innerHTML = attributes;
        attributes = null;
    }

    attributes = isPlainObject(attributes) ? attributes : {};

    let elem = document$1.createElement(tagName),
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
 * A small Event manager that does not uses DOM
 */




class EventManager {

    #listeners
    #useasync

    static #events

    constructor(useasync = true) {
        this.#listeners = [];
        this.#useasync = useasync;
    }


    getListenersForEvent(type) {

        if (!isString(type) || type.includes(' ')) {
            throw new TypeError('Invalid event type, not a String or contains spaces.');
        }

        return this.#listeners.filter(item => item.type === type).map(item => item.listener);
    }


    on(type, listener, once = false) {

        if (!isString(type)) {
            throw new TypeError('Invalid event type, not a String.');
        }

        if (!isFunction(listener)) {
            throw new TypeError('Invalid listener, not a function');
        }



        type.split(/\s+/).forEach(type => {
            this.#listeners.push({
                type, listener, once: once === true
            });
        });

        return this;
    }


    one(type, listener) {
        return this.on(type, listener, true);
    }


    off(type, listener) {

        if (!isString(type)) {
            throw new TypeError('Invalid event type, not a String.');
        }

        type.split(/\s+/).forEach(type => {

            this.#listeners = this.#listeners.filter(item => {
                if (type === item.type) {
                    if (listener === item.listener || !listener) {
                        return false;
                    }
                }
                return true;
            });
        });


        return this;
    }


    trigger(type, data = null) {

        let event;

        if (type instanceof Event) {
            event = type;
            event.data ??= data;
            type = event.type;
        }

        if (!isString(type) && type instanceof Event === false) {
            throw new TypeError('Invalid event type, not a String|Event.');
        }


        const listeners = Array.from(this.#listeners), types = [];

        type.split(/\s+/).forEach(type => {

            if (types.includes(type)) {
                return;
            }

            types.push(type);

            for (let item of listeners) {

                if (item.type === type) {

                    if (this.#useasync) {
                        runAsync(item.listener, event ?? { type, data });

                    } else {
                        item.listener(event ?? { type, data });
                    }

                    if (item.once) {
                        this.off(type, item.listener);
                    }
                }
            }


        });

        return this;


    }


    mixin(binding) {

        if (binding instanceof Object) {
            ['on', 'off', 'one', 'trigger'].forEach(method => {
                Object.defineProperty(binding, method, {
                    enumerable: false, configurable: true,
                    value: (...args) => {
                        this[method](...args);
                        return binding;
                    }
                });
            });

        }

        return this;
    }


    static mixin(binding, useasync = true) {
        return (new EventManager(useasync)).mixin(binding);
    }


    static on(type, listener, once = false) {
        this.#events ??= new EventManager();
        return this.#events.on(type, listener, once);
    }

    static one(type, listener) {
        this.#events ??= new EventManager();
        return this.#events.one(type, listener);
    }

    static off(type, listener) {
        this.#events ??= new EventManager();
        return this.#events.off(type, listener);
    }

    static trigger(type, data = null) {
        this.#events ??= new EventManager();
        return this.#events.trigger(type, data);
    }

}

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = ".noscroll {\n    position: fixed !important;\n    overflow-y: hidden !important;\n    width: 100% !important;\n    z-index: -1 !important;\n}\n";
styleInject(css_248z);

class NoScroll {


    static #scrollTop = 0
    static #stylesheet

    static get enabled() {
        return document.documentElement.classList.contains('noscroll');
    }

    static #getStylesheet() {

        if (!this.#stylesheet) {


            this.#stylesheet = createElement('style', { type: 'text/css', id: 'no-scroll-component' });
            document.getElementsByTagName('head')[0].appendChild(this.#stylesheet);

        }
        return this.#stylesheet;
    }


    static async enable() {

        if (this.enabled) {
            return true;
        }


        let pos = Math.max(0, document.documentElement.scrollTop);
        this.#scrollTop = pos;
        //this.#getStylesheet().innerHTML = `html.noscroll{top:-${pos}px;}`;
        document.documentElement.classList.add('noscroll');
        this.trigger('enabled');
        return true;
    }




    static async disable() {

        if (!this.enabled) {
            return true;
        }

        document.documentElement.classList.remove('noscroll');
        if (this.#scrollTop > 0) {
            document.documentElement.scrollTo(0, this.#scrollTop);
        }
        this.trigger('disabled');
        return true;
    }






}


EventManager.mixin(NoScroll);

class Overlay {

    #container
    get open() {
        return this.#container.classList.contains('open');
    }


    constructor(container) {

        if (container instanceof Element === false) {
            throw new TypeError('container not an Element');
        }

        EventManager.mixin(this);
        this.#container = container;

    }


    async toggle(delay = 0) {
        if (this.open) {
            return await this.hide(delay);
        }
        return await this.show(delay);
    }

    #getDelay(delay) {

        if (delay < 31 || isFloat(delay)) {
            delay = intVal(delay * 1000);
        }
        if (!isInt(delay)) {
            throw new TypeError('delay is not an Integer');
        }
        return Math.max(0, delay);

    }


    show(delay = 0) {

        return new Promise(resolve => {

            if (this.open) {
                return resolve(true);
            }
            delay = this.#getDelay(delay);


            this.trigger('show', this.#container);

            NoScroll.enable().then(() => {

                setTimeout(() => {
                    this.#container.classList.add('overlay', 'open');
                    this.trigger('open', this.#container);
                    resolve(true);
                }, delay);


            });




        });

    }

    hide(delay = 0) {


        return new Promise(resolve => {
            if (!this.open) {
                return resolve(true);
            }

            delay = this.#getDelay(delay);
            this.trigger('hide', this.#container);


            this.#container.classList.add('closing');


            setTimeout(() => {

                NoScroll.disable().then(() => {
                    this.#container.classList.remove('open', 'closing');
                    this.trigger('close', this.#container);
                    resolve(true);
                });

            }, delay);
        });



    }

}

const
    //btn = document.querySelector('.nav-btn'),
    header = document.querySelector('header').cloneNode(true),
    overlay = new Overlay(header);




//header.hidden = true;

header.classList.add('overlay');
document.body.appendChild(header);


overlay.on('close', () => {
    //  header.hidden = true;
}).on('show', () => {
    //  btn.classList.add('clicked');
    header.hidden = null;
});




addEventListener('click', e => {
    if (e.target.closest('.nav-btn')) {
        e.preventDefault();
        overlay.toggle(1.2);
    } else if (e.target.closest('.open nav a, .open .logo')) {
        overlay.hide(1.2);
    }
});
//# sourceMappingURL=bundle.js.map
