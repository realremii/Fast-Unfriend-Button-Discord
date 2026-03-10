// ==UserScript==
// @name         fast discord unfriend
// @namespace    realremii
// @version      1.0.3
// @description  adds an unfriend button next to each friend in the discord friends list
// @match        https://discord.com/*
// @grant        none
// ==/UserScript==
(function () {
    'use strict';

    function clickWithRetry(selector, maxAttempts = 10, interval = 100) {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const id = setInterval(() => {
                const el = [...document.querySelectorAll(selector)];
                const target = el.find(e => e.textContent.toLowerCase().includes("remove friend"));
                if (target) {
                    clearInterval(id);
                    target.click();
                    resolve(target);
                } else if (++attempts >= maxAttempts) {
                    clearInterval(id);
                    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
                    reject(new Error("remove friend option not found"));
                }
            }, interval);
        });
    }

    function confirmRemoval() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const id = setInterval(() => {
                const buttons = [...document.querySelectorAll('button')];
                const confirm = buttons.find(b => b.textContent.toLowerCase().includes("remove friend"));
                if (confirm) {
                    clearInterval(id);
                    confirm.click();
                    resolve();
                } else if (++attempts >= 20) {
                    clearInterval(id);
                    reject(new Error("Confirmation button not found"));
                }
            }, 100);
        });
    }

    function addButtons() {
        const people = document.querySelectorAll('[data-list-item-id^="people___"]');
        people.forEach(item => {
            if (item.querySelector('.tm-unfriend-btn')) return;

            const btn = document.createElement('button');
            btn.textContent = 'unfriend';
            btn.className = 'tm-unfriend-btn';
            Object.assign(btn.style, {
                position: 'absolute',
                right: '120px',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '4px 8px',
                background: '#ed4245',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                zIndex: '10',
            });

            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const moreButton = item.querySelector('[aria-label="More"]');
                if (!moreButton) return;
                moreButton.click();
                try {
                    await clickWithRetry('[role="menuitem"]');
                    await confirmRemoval();
                } catch (err) {
                    console.warn('[unfriend]', err.message);
                }
            });

            item.style.position = 'relative';
            item.appendChild(btn);
        });
    }

    const observer = new MutationObserver(addButtons);
    observer.observe(document.body, { childList: true, subtree: true });
    addButtons();
})();