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
        this.#getStylesheet().innerHTML = `html.noscroll{top:-${pos}px;}`;
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


    static #menu
    static #bound
    static #overlay


    static register(elem) {

        this.#menu ??= elem.cloneNode(true);

        if (!this.#bound && this.#menu) {

            const overlay = this.#overlay = createElement('div', { class: 'overlay', hidden: true });
            overlay.appendChild(this.#menu);
            document.body.appendChild(overlay);


            addEventListener('click', e => {

                let btn = null;
                try {
                    btn = e.target.closest('.nav-btn, .overlay nav a');
                } catch (err) {

                }

                if (btn !== null) {

                    if (btn.classList.contains('nav-btn')) {
                        e.preventDefault();
                    }

                    if (this.open) {
                        this.hide();

                    } else {
                        this.show();
                    }
                }
            });

            this.#bound = true;
        }

    }






    static get open() {

        if (!this.#overlay) {
            return false;
        }

        return this.#overlay.hidden !== true;
    }



    static async show() {


        return new Promise(resolve => {

            if (!this.#menu) {
                return resolve(false);
            }

            if (this.open) {
                return resolve(true);
            }

            this.trigger('show', { header: this.#menu });

            NoScroll.enable().then(() => {
                // show the overlay
                this.#overlay.hidden = null;

                // wait a little for it to display
                setTimeout(() => {
                    // loads the animations
                    this.#menu.classList.add('open');
                    this.trigger('open', {
                        header: this.#menu
                    });

                    resolve(true);
                }, 50);
            });

        });


    }



    static hide(after = 1200) {

        return new Promise(resolve => {

            if (!this.#menu) {
                return resolve(false);
            }

            if (!this.open) {
                return resolve(true);
            }


            // eg hide(1.2) hides after 1200 ms

            if (isFloat(after)) {
                if (after <= 30) {
                    after *= 1000;
                }
                after = intVal(after);
            }

            if (!isInt(after)) {
                throw new TypeError('after is not an Integer');
            }
            after = Math.max(0, after);

            this.trigger('hide', { header: this.#menu });

            this.#menu.classList.remove('open');

            // let the close animations do their work
            setTimeout(() => {

                this.#overlay.hidden = true;

                NoScroll.disable().then(() => {
                    this.trigger('close', {
                        header: this.#menu
                    });

                    resolve(true);
                });



            }, after);


        });


    }

}


EventManager.mixin(Overlay);

Overlay.register(document.querySelector('.flexbox header'));
//# sourceMappingURL=bundle.js.map
