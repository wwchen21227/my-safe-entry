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

const formatDate = (value) => {
    const date = new Date(value);
    return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()} ` + 
            `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

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
        
    const stopVideo = () => {
        qrVideo.pause();

        const tracks = qrVideo.srcObject ? qrVideo.srcObject.getTracks() : [];
        for (const track of tracks) {
            track.stop(); 
        }
        
        qrVideo.srcObject = null;
    };

    const getTenantName = key => {
        const arr = key.split('-');
        let tenantName = arr[2];
        for(let i = 3; i < arr.length - 1; i++) {
            tenantName += ' ' + arr[i];
        }
        return tenantName;
    };

    

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
                    `<div class="entry-list-content">` + 
                        `<a href="javascript:void(0);" class="entry-list-menu js-listMenu">` + 
                            `<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAQklEQVRIiWNgGAVUBEcZGBj+Q/FhYjUxkmDBf3L0MpFgAVmAFAuOILGJDqJRQFUwmkwJgtFkOvBgNJkSBKPJlDYAAMoeEjdsTPIRAAAAAElFTkSuQmCC"/>` +
                        `</a>` +
                        `<div>` + 
                            `<span class="entry-title">${entry.tenant}</span>` +
                            `<div><span class="entry-date">Last visit: ${formatDate(entry.lastVisitDate)}</span></div>` +
                        `</div>` + 
                    `</div>` + 
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
    function setResult(result) {
        const url = new URL(result);
        const tenantKey = url.pathname.split('/')[2];

        if(cacheKey !== tenantKey) {
            cacheKey = tenantKey;
            const isExist = entryList.some(entry => entry.key === tenantKey);

            if(!isExist) {
                entryList.push({
                    key: tenantKey,
                    tenant: getTenantName(tenantKey),
                    url: result,
                    lastVisitDate: new Date(),
                    visits: 1
                });
    
                entryStore.save(entryList);

                buildEntryListElem(sortEntryByDate(entryList));
            }

            toggleClass(entryListContainer, 'hide');
            toggleClass(qrScannerContainer, 'hide');
            toggleClass(btnQrScan, 'hide');
        }
    }

    document.getElementById('start-button').addEventListener('click', () => {
        // Use facingMode: environment to attemt to get the front camera on phones
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then(function(stream) {
                qrVideo.srcObject = stream;
                qrVideo.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
                qrVideo.play();
                
                requestAnimationFrame(tick);

                toggleClass(scanContainer, 'hide');
                toggleClass(qrScannerContainer, 'hide');
            });
    });

    document.getElementById('stop-button').addEventListener('click', () => {
        stopVideo();        

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
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then(function(stream) {
                qrVideo.srcObject = stream;
                qrVideo.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
                qrVideo.play();
                
                requestAnimationFrame(tick);

                toggleClass(entryListContainer, 'hide');
                toggleClass(btnQrScan, 'hide');
                toggleClass(qrScannerContainer, 'hide');
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

    const canvasElement = document.getElementById('canvas');
    const canvas = canvasElement.getContext("2d");

    function tick() {
        if (qrVideo.readyState === qrVideo.HAVE_ENOUGH_DATA) {
          const smallestDimension = Math.min(qrVideo.videoWidth, qrVideo.videoHeight);
          const scanRegionSize = Math.round(2 / 3 * smallestDimension);

          canvasElement.height = scanRegionSize;
          canvasElement.width = scanRegionSize;
          canvas.drawImage(qrVideo, 0, 0, canvasElement.width, canvasElement.height);

          const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            cancelAnimationFrame(tick);
            stopVideo();
            setResult(code.data);
          }
        }
        requestAnimationFrame(tick);
      }
})();

