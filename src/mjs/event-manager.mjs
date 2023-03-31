/**
 * A small Event manager that does not uses DOM
 */


import { isFunction, isString, runAsync } from "./utils.mjs";




export class EventManager {

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
        if (!isString(type)) {
            throw new TypeError('Invalid event type, not a String.');
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
                        runAsync(item.listener, { type, data });

                    } else {
                        item.listener({ type, data });
                    }

                    if (item.once) {
                        this.off(type, item.listener)
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


export default EventManager

