// Compa Drinks Co — shared behavior for sub-pages:
// age gate (remembered across pages), mobile menu, rising bubbles.

(function () {
    // Age gate — remembered so visitors aren't asked on every page
    var gate = document.getElementById('age-gate');
    var gateYes = document.getElementById('gate-yes');
    var AGE_KEY = 'compa_age_ok';

    function ageOk() {
        try { return localStorage.getItem(AGE_KEY) === '1'; } catch (e) { return false; }
    }

    if (gate) {
        if (ageOk()) {
            gate.style.transition = 'none';
            gate.classList.add('hidden');
        } else if (gateYes) {
            gateYes.addEventListener('click', function () {
                try { localStorage.setItem(AGE_KEY, '1'); } catch (e) { }
                gate.classList.add('hidden');
            });
        }
    }

    // Mobile menu
    var mobileMenu = document.getElementById('mobile-menu');
    var menuBtn = document.getElementById('menu-btn');
    var menuClose = document.getElementById('menu-close');
    if (mobileMenu && menuBtn && menuClose) {
        menuBtn.addEventListener('click', function () { mobileMenu.classList.add('open'); });
        menuClose.addEventListener('click', function () { mobileMenu.classList.remove('open'); });
        mobileMenu.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', function () { mobileMenu.classList.remove('open'); });
        });
    }

    // Bubbles
    var bubblesContainer = document.getElementById('bubbles-container');
    function createBubble() {
        if (!bubblesContainer) return;
        var bubble = document.createElement('img');
        bubble.src = 'assets/bubble.png';
        bubble.className = 'bubble-img';
        var size = Math.random() * 20 + 10 + 'px';
        bubble.style.width = size;
        bubble.style.height = 'auto';
        bubble.style.left = Math.random() * 100 + '%';
        bubble.style.bottom = '-50px';
        bubble.style.opacity = Math.random() * 0.4 + 0.2;
        var duration = Math.random() * 6 + 4;
        bubble.style.animation = 'floatUpImg ' + duration + 's linear forwards';
        bubblesContainer.appendChild(bubble);
        setTimeout(function () { bubble.remove(); }, duration * 1000);
    }
    setInterval(createBubble, window.innerWidth < 768 ? 1000 : 500);
})();
