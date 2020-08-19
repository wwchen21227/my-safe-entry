
/*** Util function ***/
const sortEntryByDate = (arr) => arr.sort((a, b) => b.lastVisitDate - a.lastVisitDate);

const getTenantName = key => {
    const arr = key.split('-');
    let tenantName = arr[2];
    for(let i = 3; i < arr.length - 1; i++) {
        tenantName += ' ' + arr[i];
    }
    return tenantName;
};

const searchTenant = (arr, keyword) => {
    const regex = new RegExp(keyword, 'i');
    return arr.filter(entry => regex.test(entry.tenant));
};

const formatDate = (value) => {
    const date = new Date(value);
    return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()} ` + 
            `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}
/*** End Util function ***/

/*** CSS class Util ***/

const CssClass = {
    addClass: (elem, className) => elem.classList.add(className),
    removeClass: (elem, className) => elem.classList.remove(className),
    hasClass: (elem, className) => elem.classList.contains(className),
    toggleClass: (elem, className) => {
        if (CssClass.hasClass(elem, className)) {
            CssClass.removeClass(elem, className);
        }else {
            CssClass.addClass(elem, className);
        }
    }
};

/*** End CSS class Util ***/

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

/*** Building entry list ***/

const UIBuilder = ({
    entryListElem,
    handleVisitClick
}) => {
   
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

    return {
        buildEntryListElem
    }
};

/*** End Building entry list ***/

const QRScanner = ({
    video,
    canvas,
    page
}) => {
    const canvasContext = canvas.getContext("2d");

    const check = () => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            const smallestDimension = Math.min(video.videoWidth, video.videoHeight);
            const scanRegionSize = Math.round(2 / 3 * smallestDimension);

            canvas.height = scanRegionSize;
            canvas.width = scanRegionSize;

            canvasContext.drawImage(qrVideo, 0, 0, canvas.width, canvas.height);

            const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);

            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });

            if (code) {
                cancelAnimationFrame(check);
                stopScan();
                setResult(code.data);
            }
        }
        requestAnimationFrame(check);
    }

    const startScan = (stream, callback) => {
        video.srcObject = stream;
        video.play();
        
        requestAnimationFrame(check);

        callback();
    };

    const stopScan = () => {
        video.pause();

        const tracks = video.srcObject ? video.srcObject.getTracks() : [];
        for (const track of tracks) {
            track.stop(); 
        }
        
        video.srcObject = null;
    };

    function setResult(result) {
        const url = new URL(result);
        page.showOverlay(url);
    }

    return {
        startScan,
        stopScan
    };
};

(function() {
    'use strict';
    
    const LIST_KEY = 'entries-list';
    const entryStore = EntryStore(LIST_KEY);
    
    let entryList = [];
    let timeoutId = null;

    const scanContainer = document.getElementById('scanContainer');
    const qrScannerContainer = document.getElementById('qrScannerContainer');
    const entryListContainer = document.getElementById('entryListContainer');
    const entryListElem = document.getElementById('entryList');
    const btnQrScan = document.getElementById('btnQrScan');
    const txtSearchBox = document.getElementById('txtSearchBox');
    const qrVideo = document.getElementById('qrVideo');
    const btnScan = document.getElementById('btnScan');
    const btnCancelScan = document.getElementById('btnCancelScan');
    const overlayContainer = document.getElementById('overlay');
    const btnSave = document.getElementById('btnSave');
    const txtTenantName = document.getElementById('txtTenantName');
    const canvasElem = document.getElementById('canvas');

    const Page = {
        showLanding: () => {
            CssClass.addClass(btnQrScan, 'hide');
            CssClass.addClass(qrScannerContainer, 'hide');
            
            CssClass.removeClass(scanContainer, 'hide');
        },
        showEntryList: () => {    
            CssClass.addClass(qrScannerContainer, 'hide');
            CssClass.addClass(overlayContainer, 'hide');
            
            CssClass.removeClass(entryListContainer, 'hide');
            CssClass.removeClass(btnQrScan, 'hide');
        },
        showScan: () => {
            CssClass.addClass(scanContainer, 'hide');
            CssClass.addClass(entryListContainer, 'hide');
            CssClass.addClass(btnQrScan, 'hide');
    
            CssClass.removeClass(qrScannerContainer, 'hide');
        },
        showOverlay: (url) => {
            const tenantKey = url.pathname.split('/')[2];
            const isExist = entryList.some(entry => entry.key === tenantKey);

            if(!isExist) {
                txtTenantName.value = getTenantName(tenantKey);
                txtTenantName.setAttribute('data-key', tenantKey);
                txtTenantName.setAttribute('data-url', url);
    
                CssClass.addClass(qrScannerContainer, 'hide');
                CssClass.removeClass(overlayContainer, 'hide');
            }else {
                Page.showEntryList();
            }           
        }
    };

    const updateVisitEntry = (key) => {    
        let entry = entryList.find(entry => entry.key === key);
        entry.lastVisitDate = new Date();
        entry.visits += 1;

        const sortedList = sortEntryByDate(entryList);

        entryStore.save(sortedList);
        uiBuilder.buildEntryListElem(sortedList);
    };

    const uiBuilder = UIBuilder({
         entryListElem,
         handleVisitClick: (e) => {
            updateVisitEntry(e.target.dataset.key);
        }
    });

    const qrScanner = QRScanner({ 
        video: qrVideo,
        canvas: canvasElem,
        entryStore,
        entryList,
        uiBuilder,
        page: Page
    });

    const startStream = () => {
        // Use facingMode: environment to attemt to get the front camera on phones
        navigator
            .mediaDevices
            .getUserMedia({ video: { facingMode: "environment" } })
            .then((stream) => qrScanner.startScan(stream, Page.showScan));
    };

    const bindEvents = () => {
        const handleScanClick = () => {
            startStream();
        };
    
        const handleCancleClick = () => {
            qrScanner.stopScan();        
            if(entryList.length === 0) {
                Page.showLanding();
            }else {
               Page.showEntryList();
            }  
        };
        
        const handleSearchKeyup = (e) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const filteredList = searchTenant(entryList, e.target.value);
                uiBuilder.buildEntryListElem(filteredList);
            }, 300);
        };

        const handleSaveClick = () => {
            if(txtTenantName.value.length === 0) {
                CssClass.addClass(txtTenantName, 'error');
                txtTenantName.focus();
                return;
            }
            
            entryList.push({
                key: txtTenantName.dataset.key,
                tenant: txtTenantName.value,
                url: txtTenantName.dataset.url,
                lastVisitDate: new Date(),
                visits: 1
            });

            entryStore.save(entryList);

            uiBuilder.buildEntryListElem(sortEntryByDate(entryList));
            
            Page.showEntryList();
        };
        
        btnScan.addEventListener('click', handleScanClick);
        
        btnQrScan.addEventListener('click', handleScanClick);

        btnCancelScan.addEventListener('click', handleCancleClick);
    
        txtSearchBox.addEventListener('keyup', handleSearchKeyup);

        btnSave.addEventListener('click', handleSaveClick);
    };
    
    const init = () => {
        bindEvents();

        entryStore
            .getAllEntries()
            .then(data => {
                if(data && data.length > 0) {
                    entryList = sortEntryByDate(data);
        
                    uiBuilder.buildEntryListElem(entryList);
                    
                    Page.showEntryList();
                }else {
                    Page.showLanding();
                }
            });
    };

    init();
})();

