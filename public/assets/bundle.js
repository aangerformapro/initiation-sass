function toggleClass(elem, ...classNames) {
    if (elem instanceof Element && classNames.length > 0) {

        for (let $i = 0; $i < classNames.length; $i++) {
            let $class = classNames[$i];

            if (typeof $class === 'string') {


                if (elem.classList.contains($class)) {
                    elem.classList.remove($class);
                } else {
                    elem.classList.add($class);
                }
            }
        }
    }
}




function toggleMenu(btn, e) {

    toggleClass(btn, 'open');

    if (btn.classList.contains('open')) {
        dispatchEvent(Object.assign(new Event('menu.open'), {
            data: {
                btn
            }
        }));
    }
    else {
        dispatchEvent(Object.assign(new Event('menu.close'), {
            data: {
                btn
            }
        }));
    }
}



addEventListener('menu.open', e => {
    document.documentElement.classList.add('noscroll');
    document.querySelector('nav').classList.add('flex');
});
addEventListener('menu.close', e => {
    document.documentElement.classList.remove('noscroll');
    document.querySelector('nav').classList.remove('flex');
});



addEventListener('click', e => {
    e.preventDefault();
    let target;
    // menu click
    if ((target = e.target.closest('.burger'))) {
        toggleMenu(target);
    }


});
