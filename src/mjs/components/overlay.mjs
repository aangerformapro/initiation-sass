import EventManager from "../helpers/event-manager.mjs";
import { createElement, intVal, isFloat, isInt } from "../helpers/utils.mjs";
import NoScroll from "./noscroll.mjs";




export default class Overlay {

    #container
    get open() {
        return this.#container.hidden !== true;
    }


    constructor(container) {

        if (container instanceof Element === false) {

            container = createElement('div', { class: 'overlay', hidden: true });

            document.body.appendChild(container);
            //throw new TypeError('container not an Element');
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
                    this.#container.hidden = null;
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

            setTimeout(() => {

                NoScroll.disable().then(() => {
                    this.trigger('close', this.#container);
                    this.#container.hidden = true;
                    resolve(true);
                });

            }, delay);
        });



    }

}

