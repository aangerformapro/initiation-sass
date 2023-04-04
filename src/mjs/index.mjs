
import Overlay from "./components/overlay.mjs";

const overlay = new Overlay(), delay = {
    show: 0,
    hide: 1.2,
}, { body } = document;



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
    }
});

