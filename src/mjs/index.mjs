
import Overlay from "./components/overlay.mjs";
import { LoremIpsum } from "lorem-ipsum";

const overlay = new Overlay(document.querySelector('.overlay')), delay = {
    show: 0,
    hide: 1.01,
}, { body } = document, lorem = new LoremIpsum({
    sentencesPerParagraph: {
        min: 1,
        max: 1,
    },
    wordsPerSentence: {
        min: 8,
        max: 8,
    }
}), related = body.querySelector('.related'), card = body.querySelector('.card').cloneNode(true);

let lock = true, cnt = 3, max = 99;

overlay
    .on('hide', () => {

        body.classList.add('menu-closing');
    })
    .on('close', () => {
        body.classList.remove('menu-closing', 'menu-shown');
    })
    .on('show', () => {
        body.classList.remove('menu-closing');
        body.classList.add('menu-showing');
    })
    .on('open', () => {
        body.classList.remove('menu-showing');
        body.classList.add('menu-shown');
    });




addEventListener('click', e => {
    if (e.target.closest('.nav-btn')) {
        e.preventDefault();
        overlay.open ? overlay.hide(delay.hide) : overlay.show(delay.show);
    } else if (e.target.closest('.menu-shown nav a, .menu-shown .logo')) {
        overlay.hide(delay.hide);
    } else if (e.target.closest('.btn-pink')) {
        lock = false;
    }
});


addEventListener("scroll", () => {

    const endOfPage = window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 10;

    if (endOfPage && !lock && related && card) {
        lock = true;

        for (let i = 0; i < 3; i++) {

            if (cnt === max) {
                break;
            }

            cnt++;

            let elem = card.cloneNode(true),
                text = lorem.generateParagraphs(1),
                title = text.split(' ', 3).join(' '),
                cntText = '0' + cnt;

            if (cntText.length > 2) {
                cntText = cntText.slice(1);
            }

            elem.querySelector('.card-text').innerHTML = text;
            elem.querySelector('.card-header').innerHTML = cntText;
            elem.querySelector('.card-title').innerHTML = title;


            related.appendChild(elem);

        }

        setTimeout(() => {
            lock = cnt > max;
            //document.documentElement.scrollTo(0, 0);
        }, 50);

        //console.debug('scroll end');





    }

});

addEventListener('load', () => {
    //lock = false;
});
