

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




function toggleMenu(nav) {

    toggleClass(nav, 'open');

    if (nav.classList.contains('open')) {
        dispatchEvent(Object.assign(new Event('menu.open'), {
            data: {
                nav
            }
        }));
    }
    else {
        dispatchEvent(Object.assign(new Event('menu.close'), {
            data: {
                nav
            }
        }));
    }
}



addEventListener('menu.open', e => {
    document.documentElement.classList.add('noscroll');
    //document.querySelector('nav').classList.add('open');
});
addEventListener('menu.close', e => {
    document.documentElement.classList.remove('noscroll');
    // document.querySelector('nav').classList.remove('open');
});



addEventListener('click', e => {
    e.preventDefault();
    let target;
    // menu click
    if ((target = e.target.closest('.nav-btn'))) {
        toggleMenu(target.closest('header'));
    }


});
