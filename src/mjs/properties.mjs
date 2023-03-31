import { isString, isUndef, isFunction, isPlainObject } from "./utils.mjs";
import EventManager from "./event-manager.mjs";

function anyvalue(value) {
    return !isUndef(value);
}





export class Properties {

    #target
    #properties = {}


    constructor(target) {

        if (target instanceof Object === false) {
            throw new TypeError('Target name is not an Object');
        }
        this.#target = target;
        EventManager.mixin(this, false);
    }


    hasProperty(name) {
        return this.#properties.hasOwnProperty(name);
    }

    addProperty(name, value = null, testFunction) {

        if (!isString(name)) {
            throw new TypeError('Property name is not a String');
        }

        if (this.hasProperty(name)) {
            throw new Error('Cannot define the same property ' + name + ' twice.');
        }

        if (isFunction(value)) {
            testFunction = value;
            value = null;
        }

        testFunction ??= anyvalue;

        if (!isFunction(testFunction)) {
            throw new TypeError('Test function for property ' + name + ' is not a Function.');
        }

        this.#properties[name] = value;

        Object.defineProperty(this.#target, name, {
            enumerable: true, configurable: true,
            get: () => this.getProperty(name),
            set: _value => {
                this.setProperty(name, _value);
            }

        });

        this.#properties[name] = {
            test: testFunction,
            value
        };



    }


    addProperties(properties) {
        if (properties instanceof Object === false) {
            throw new TypeError('Properties are not an Object');
        }

        for (let name in properties) {

            let value = null, test = anyvalue;

            const item = properties[name];
            if (isPlainObject(item)) {

                let valid = false;

                if (item.hasOwnProperty('value')) {
                    value = item.value;
                    valid = true;
                }
                if (isFunction(item.test)) {
                    test = item.test;
                    valid = true;
                }

                if (!valid) {
                    value = item;
                }


            } else if (isFunction(item)) {

                test = item;

            } else {
                value = item;
            }

            this.addProperty(name, value, test);

        }
    }


    getProperty(name, defaultValue = null) {

        if (!isString(name)) {
            throw new TypeError('Property name is not a String');
        }

        if (!this.hasProperty(name)) {
            return defaultValue;
        }

        return this.#properties[name].value ?? defaultValue;
    }


    setProperty(name, value) {
        if (!isString(name)) {
            throw new TypeError('Property name is not a String');
        }

        if (!this.hasProperty(name) || isUndef(value)) {
            return;
        }
        if (this.#properties[name].test(value) === true) {

            this.forceSetProperty(name, value);

        }
    }

    forceSetProperty(name, value) {
        if (!isString(name)) {
            throw new TypeError('Property name is not a String');
        }

        if (isUndef(value) || !this.hasProperty(name)) {
            return;
        }


        let previous = this.getProperty(name);
        this.#properties[name].value = value;

        if (value !== previous) {
            this.trigger('valuechange', { property: name, value, previous });
        }

    }



    getProperties() {

        const result = {};

        for (let prop in this.#properties) {
            result[prop] = this.getProperty(prop);
        }
        return result;
    }








}


export default Properties;