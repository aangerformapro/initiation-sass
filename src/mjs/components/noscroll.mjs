import EventManager from "../helpers/event-manager.mjs";
import { createElement } from "../helpers/utils.mjs";
import "./noscroll.css";

export default class NoScroll {


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