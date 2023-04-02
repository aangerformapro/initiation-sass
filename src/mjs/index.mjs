
//import 'animate.css';

import Overlay from "./components/overlay.mjs";


const
    btn = document.querySelector('.nav-btn'),
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
    } else if (e.target.closest('.open nav a')) {
        overlay.hide(1.2);
    }
});