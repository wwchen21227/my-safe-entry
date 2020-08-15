const addClass = (elem, className) => {
    elem.classList.add(className);
};

const removeClass = (elem, className) => {
    elem.classList.remove(className);
};

const hasClass = (elem, className) => {
    return elem.classList.contains(className);
};

const toggleClass = (elem, className) => {
    if (hasClass(elem, className)) {
        removeClass(elem, className);
    }else {
        addClass(elem, className);
    }
};

(function() {
    'use strict';

    QrScanner.hasCamera().then(hasCamera => console.log(`Camera detected ${hasCamera}`));

    const scanContainer = document.getElementById('scanContainer');
    const qrScannerContainer = document.getElementById('qrScannerContainer');

    const qrVideo = document.getElementById('qrVideo');
    const camQrResult = document.getElementById('cam-qr-result');

    function setResult(label, result) {
        label.textContent = result;
        //camQrResultTimestamp.textContent = new Date().toString();
        label.style.color = 'teal';
        clearTimeout(label.highlightTimeout);
        label.highlightTimeout = setTimeout(() => label.style.color = 'inherit', 100);
    }

    const qrScanner = new QrScanner(qrVideo, result => setResult(camQrResult, result));

    document.getElementById('start-button').addEventListener('click', () => {
        qrScanner.start().then(stream => {
            console.log(stream);
            toggleClass(scanContainer, 'hide');
            toggleClass(qrScannerContainer, 'hide');

            document.getElementById('canvas').appendChild(qrScanner.$canvas);
        });
    });

    document.getElementById('stop-button').addEventListener('click', () => {
        qrScanner.stop();

        toggleClass(scanContainer, 'hide');
        toggleClass(qrScannerContainer, 'hide');

        document.getElementById('canvas').innerHTML = '';
    });
})();