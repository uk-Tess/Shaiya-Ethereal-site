/*           CONTENTS

01 - Cookies
02 - Scrool Menu
03 - Scrool Page Archor


/* ---------- 01 COOKIES ----------- */
var msgCookies = document.getElementById('cookies-msg')

function accepted(){
    localStorage.lgpd = 'yes'
    msgCookies.classList.remove('ShowCookies')
}

if(localStorage.lgpd == 'yes'){
    msgCookies.classList.remove('ShowCookies')
}else{
    msgCookies.classList.add('ShowCookies')
}
/* ---------- END COOKIES ----------- */



/* ---------- 02 SCROLL MENU ----------- */
window.addEventListener("scroll", function(){
    let header = document.querySelector('#header')
    header.classList.toggle('scrollmenu', window.scrollY > 340)
})
/* ---------- END SCROLL MENU ----------- */



/* ---------- 03 SCROLL PAGE ARCHOR ----------- */
document.getElementById('scrollIcon').addEventListener('click', function() {
    const targetId = this.getAttribute('data-target');
    const targetElement = document.querySelector(targetId);
targetElement.scrollIntoView({ behavior: 'smooth' });
});
/* ---------- END SCROLL MENU ----------- */


$(document).ready(function () {
    $("html").niceScroll();
});