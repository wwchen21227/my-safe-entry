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

    const DB_KEY = 'entries-list';
    let entryList = [];

    QrScanner.hasCamera().then(hasCamera => console.log(`Camera detected ${hasCamera}`));

    const scanContainer = document.getElementById('scanContainer');
    const qrScannerContainer = document.getElementById('qrScannerContainer');
    const entryListContainer = document.getElementById('entryListContainer');
    const entryListElem = document.getElementById('entryList');
    const btnQrScan = document.getElementById('btnQrScan');

    const qrVideo = document.getElementById('qrVideo');
    const camQrResult = document.getElementById('cam-qr-result');

    const getTenantName = key => {
        const arr = key.split('-');
        let tenantName = arr[2];
        for(let i = 3; i < arr.length - 1; i++) {
            tenantName += ' ' + arr[i];
        }
        return tenantName;
    };

    const formatDate = (value) => {
        const date = new Date(value);
        return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()} ` + 
                `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    }

    localforage.getItem(DB_KEY).then(data => {
        if(data && data.length > 0) {
            entryList = data;

            let list = ``;
            data.forEach(entry => {
                list += `<li>` + 
                            `<a href="${entry.url}" target="_blank">${entry.tenant}</a>` +
                            `<div><span class="entry-date">Last visit: ${formatDate(entry.lastVisitDate)}</span></div>` + 
                        `</li>`
            });
            entryListElem.innerHTML = list;
            toggleClass(entryListContainer, 'hide');
        }else {
            toggleClass(scanContainer, 'hide');
        }
    });

    let cacheKey = '';
    function setResult(label, result) {
        console.log(result);
        const url = new URL(result);
        const tenantKey = url.pathname.split('/')[2];

        if(cacheKey !== tenantKey) {
            cacheKey = tenantKey;

            console.log(getTenantName(tenantKey));
            const isExist = entryList.some(entry => entry.key === tenantKey);

            if(!isExist) {
                const entry = {
                    key: tenantKey,
                    tenant: getTenantName(tenantKey),
                    url: result,
                    lastVisitDate: new Date(),
                    visits: 1
                };

                entryList.push(entry);
    
                localforage.setItem(DB_KEY, entryList)
                .then(value => console.log(value))
                .catch(function (err) {
                    console.error(err);
                });
            }

            toggleClass(entryListContainer, 'hide');
            toggleClass(qrScannerContainer, 'hide');
        }
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

        if(entryList.length === 0) {
            toggleClass(scanContainer, 'hide');
        }else {
            toggleClass(entryListContainer, 'hide');
            toggleClass(btnQrScan, 'hide');
        }
        toggleClass(qrScannerContainer, 'hide');

        document.getElementById('canvas').innerHTML = '';
    });

    btnQrScan.addEventListener('click', () => {
        qrScanner.start().then(stream => {
            console.log(stream);
            toggleClass(entryListContainer, 'hide');
            toggleClass(btnQrScan, 'hide');
            toggleClass(qrScannerContainer, 'hide');

            document.getElementById('canvas').appendChild(qrScanner.$canvas);
        });
    });
})();