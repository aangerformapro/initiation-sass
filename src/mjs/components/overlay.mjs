import EventManager from "../helpers/event-manager.mjs";
import { createElement, intVal, isFloat, isInt } from "../helpers/utils.mjs";
import NoScroll from "./noscroll.mjs";




export default class Overlay {


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

            this.trigger('show');

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

            this.trigger('hide');

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