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

const sortEntryByDate = (arr) => {
    return arr.sort((a, b) => b.lastVisitDate - a.lastVisitDate);
}

const searchTenant = (arr, keyword) => {
    const regex = new RegExp(keyword, 'i');
    return arr.filter(entry => regex.test(entry.tenant));
};

const EntryStore = (listKey) => {
    const save = (entries) => {
        localforage.setItem(listKey, entries)
        .then(value => console.log(value))
        .catch(function (err) {
            console.error(err);
        });
    };

    const getAllEntries = () => {
        return localforage.getItem(listKey);
    }

    return {
        save,
        getAllEntries
    }
};

(function() {
    'use strict';

    const LIST_KEY = 'entries-list';
    const entryStore = EntryStore(LIST_KEY);

    let entryList = [];

    const scanContainer = document.getElementById('scanContainer');
    const qrScannerContainer = document.getElementById('qrScannerContainer');
    const entryListContainer = document.getElementById('entryListContainer');
    const entryListElem = document.getElementById('entryList');
    const btnQrScan = document.getElementById('btnQrScan');
    const txtSearchBox = document.getElementById('txtSearchBox');
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

    const updateVisitEntry = (key) => {    
        let entry = entryList.find(entry => entry.key === key);
        entry.lastVisitDate = new Date();
        entry.visits += 1;

        const sortedList = sortEntryByDate(entryList);

        entryStore.save(sortedList);
        buildEntryListElem(sortedList);
    };

    const handleVisitClick = (e) => {
        updateVisitEntry(e.target.dataset.key);
    };

    const bindListEvents = (list) => {
        const buttons = list.querySelectorAll('.btn-visit');
        buttons.forEach(button => button.addEventListener('click', handleVisitClick));
    };

    const buildEntryListItemElem = entry => {
        return `<li>` + 
                    `<div><span class="entry-title">${entry.tenant}</span>` +
                    `<div><span class="entry-date">Last visit: ${formatDate(entry.lastVisitDate)}</span></div></div>` + 
                    `<a class="btn btn-secondary btn-visit" href="${entry.url}" data-key="${entry.key}" target="_blank">Visit</a>` + 
                `</li>`;
    };

    const buildEntryListElem = entries => {
        let list = ``;
        if(entries.length > 0)  {
            entries.forEach(entry => {
                list += buildEntryListItemElem(entry);
            });
            entryListElem.innerHTML = list;
            bindListEvents(entryListElem);
        }
        else {
            entryListElem.innerHTML = '<li>No result found.</li>';
        }
    }

    entryStore.getAllEntries().then(data => {
        if(data && data.length > 0) {
            entryList = sortEntryByDate(data);

            buildEntryListElem(entryList);
            
            toggleClass(entryListContainer, 'hide');
        }else {
            toggleClass(scanContainer, 'hide');
            toggleClass(btnQrScan, 'hide');
        }
    });

    let cacheKey = '';
    function setResult(label, result) {
        document.getElementById('debug').textContent = result;
        //const url = new URL(result);
        //const tenantKey = url.pathname.split('/')[2];

        // if(cacheKey !== tenantKey) {
        //     cacheKey = tenantKey;
        //     const isExist = entryList.some(entry => entry.key === tenantKey);

        //     if(!isExist) {
        //         entryList.push({
        //             key: tenantKey,
        //             tenant: getTenantName(tenantKey),
        //             url: result,
        //             lastVisitDate: new Date(),
        //             visits: 1
        //         });
    
        //         entryStore.save(entryList);

        //         buildEntryListElem(sortEntryByDate(entryList));
        //     }

        //     toggleClass(entryListContainer, 'hide');
        //     toggleClass(qrScannerContainer, 'hide');
        // }
    }

    QrScanner.hasCamera().then(hasCamera => console.log(`Camera detected ${hasCamera}`));
    const qrScanner = new QrScanner(qrVideo, 
        result => setResult(camQrResult, result), 
        error => {
            document.getElementById('error').textContent = error
        });

    document.getElementById('start-button').addEventListener('click', () => {
        qrScanner.start().then(stream => {
            //console.log(stream);
            // toggleClass(scanContainer, 'hide');
            // toggleClass(qrScannerContainer, 'hide');

            //document.getElementById('canvas').appendChild(qrScanner.$canvas);
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

    let timeoutId = null;
    txtSearchBox.addEventListener('keyup', (e) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            const filteredList = searchTenant(entryList, e.target.value);
            buildEntryListElem(filteredList);
            console.log('fired')
        }, 300);
    });
})();