/*** Features detection ***/
async function registerSW() {
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('../sw.js');
        } catch (e) {
            alert('ServiceWorker registration failed. Sorry about that.');
        }
    } else {
        document.querySelector('.alert').removeAttribute('hidden');
    }
}

const IsBrowserSupport = {
    WebWorker: typeof (Worker) !== "undefined"
}

/*** End of feature detection ***/

/*** Util function ***/
const sortEntryByDate = (arr) => arr.sort((a, b) => b.lastVisitDate - a.lastVisitDate);

const isNumber = (value) => !isNaN(value);

const getTenantName = key => {
    const arr = key.split('-');
    const startIndex = isNumber(arr[2]) ? 3 : 2;
    let tenantName = arr[startIndex];
    for (let i = (startIndex + 1); i < arr.length - 1; i++) {
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
        } else {
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
    };

    return {
        save,
        getAllEntries
    };
};

/*** Building entry list ***/

const UIBuilder = ({
    entryListElem,
    handleVisitClick,
    handleDelete,
    showEditOverlay
}) => {

    const bindListEvents = (list) => {
        const buttons = list.querySelectorAll('.btn-visit');
        buttons.forEach(button => button.addEventListener('click', handleVisitClick));
    };

    const bindDeleteEvent = (list) => {
        const ddDelete = list.querySelectorAll('#dropdown-row__delete');
        ddDelete.forEach(row => row.addEventListener('click', handleDelete))
    }

    const bindShowOverlayEvent = (list) => {
        const ddEdit = list.querySelectorAll('#dropdown-row__edit');
        ddEdit.forEach(row => row.addEventListener('click', showEditOverlay))
    }

    let opened = null;
    const toggleVisibility = e => e.classList.toggle('show');

    const handleDropdown = e => {
        const clickedItem = e.parentElement.querySelector('.entry-list-dropdown');
        toggleVisibility(clickedItem);

        if (!opened) {
            opened = clickedItem;
        } else if (opened == clickedItem) {
            opened = null;
        } else {
            toggleVisibility(opened);
            opened = clickedItem;
        }
    };

    const handleToggleClick = e => {
        if (e.target.parentElement.className.includes('entry-list-menu')) {
            handleDropdown(e.target.parentElement);
        } else if (opened) {
            toggleVisibility(opened);
            opened = null;
        }
    };

    document.addEventListener('click', handleToggleClick);

    const buildEntryListItemElem = entry => {
        return `<li data-key="${entry.key}">` +
            `<div class="entry-list-content">` +
            `<a href="javascript:void(0);" class="entry-list-menu js-listMenu">` +
            `<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAQklEQVRIiWNgGAVUBEcZGBj+Q/FhYjUxkmDBf3L0MpFgAVmAFAuOILGJDqJRQFUwmkwJgtFkOvBgNJkSBKPJlDYAAMoeEjdsTPIRAAAAAElFTkSuQmCC"/>` +
            `</a>` +
            `<div class="entry-list-dropdown">` +
            `<div class="dropdown-row" id="dropdown-row__edit" data-key="${entry.key}">Edit</div>` +
            `<div class="dropdown-row" id="dropdown-row__delete" data-key="${entry.key}">Delete</div>` +
            `</div>` +
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
        if (entries.length > 0) {
            entries.forEach(entry => {
                list += buildEntryListItemElem(entry);
            });
            entryListElem.innerHTML = list;
            bindListEvents(entryListElem);
            bindDeleteEvent(entryListElem);
            bindShowOverlayEvent(entryListElem);
        } else {
            entryListElem.innerHTML = '<li>No result found.</li>';
        }
    };


    const moveEntryToTop = (key) => {
        const entryElem = entryListElem.querySelector(`[data-key="${key}"]`);
        entryListElem.prepend(entryElem);

        CssClass.addClass(entryElem, 'highlight');
        setTimeout(() => CssClass.removeClass(entryElem, 'highlight'), 3000);
    };

    return {
        buildEntryListElem,
        moveEntryToTop
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

            canvasContext.drawImage(qrVideo, 0, 0, scanRegionSize, scanRegionSize);

            const imageData = canvasContext.getImageData(0, 0, scanRegionSize, scanRegionSize);

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
        video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
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
        page.showFormOverlay(url);
    }

    return {
        startScan,
        stopScan
    };
};

(function () {
    'use strict';

    const PageUrl = {
        LANDING: 'landing',
        LIST: 'list',
        SCAN: 'scan',
        ABOUT: 'about'
    };

    const LIST_KEY = 'entries-list';
    const entryStore = EntryStore(LIST_KEY);

    let entryList = [];

    let timeoutId = null;
    let currentEdit = null;

    const app = document.getElementById('app');
    const qrScannerContainer = document.getElementById('qrScannerContainer');
    const entryListElem = document.getElementById('entryList');
    const btnQrScan = document.getElementById('btnQrScan');
    const txtSearchBox = document.getElementById('txtSearchBox');
    const qrVideo = document.getElementById('qrVideo');
    const btnScan = document.getElementById('btnScan');
    const btnCancelScan = document.getElementById('btnCancelScan');
    const overlayContainer = document.getElementById('overlay');
    const btnSave = document.getElementById('btnSave');
    const btnMenu = document.getElementById('btnMenu');
    const btnCloseMenu = document.getElementById('btnCloseMenu');
    const txtTenantName = document.getElementById('txtTenantName');
    const canvasElem = document.getElementById('canvas');

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
        },
        handleDelete: (e) => {
            handleDeleteEntry(e.target.dataset.key)
        },
        showEditOverlay: (e) => {
            CssClass.removeClass(overlayContainer, 'hide');
            const selected = entryList.find(entry => entry.key === e.target.dataset.key);
            txtTenantName.value = selected.tenant;
            currentEdit = selected.key;
            txtTenantName.focus();
        }
    });

    const Page = {
        render: (url) => {
            app.dataset.page = url
        },
        showFormOverlay: (url) => {
            const tenantKey = url.pathname.split('/')[2];
            const isExist = entryList.some(entry => entry.key === tenantKey);

            if (!isExist) {
                txtTenantName.value = getTenantName(tenantKey);
                txtTenantName.setAttribute('data-key', tenantKey);
                txtTenantName.setAttribute('data-url', url);

                CssClass.addClass(qrScannerContainer, 'hide');
                CssClass.removeClass(overlayContainer, 'hide');

                txtTenantName.focus();
            } else {
                uiBuilder.moveEntryToTop(tenantKey);
                Page.render(PageUrl.LIST);
            }
        },
        showAbout: () => {
            app.dataset.page = PageUrl.ABOUT;
        },
        closeAbout: () => {
            app.dataset.page =
                entryList.length === 0 ?
                PageUrl.LANDING :
                PageUrl.LIST;
        }
    };

    const handleDeleteEntry = (key) => {
        const removed = entryList.filter(entry => entry.key !== key)
        entryStore.save(removed);
        uiBuilder.buildEntryListElem(removed);
    }

    const qrScanner = QRScanner({
        video: qrVideo,
        canvas: canvasElem,
        page: Page
    });

    const startStream = () => {
        // Use facingMode: environment to attemt to get the front camera on phones
        navigator
            .mediaDevices
            .getUserMedia({
                video: {
                    facingMode: "environment"
                }
            })
            .then((stream) => qrScanner.startScan(stream, () => Page.render(PageUrl.SCAN)))
            .catch(err => console.error(err.name + ": " + err.message));
    };

    const bindEvents = () => {
        const handleScanClick = () => {
            startStream();
        };

        const handleCancleClick = () => {
            qrScanner.stopScan();
            if (entryList.length === 0) {
                Page.render(PageUrl.LANDING);
            } else {
                Page.render(PageUrl.LIST);
            }
        };

        const handleSearchKeyup = (e) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const filteredList = searchTenant(entryList, e.target.value);
                uiBuilder.buildEntryListElem(filteredList);
            }, 300);
        };

        const handleUpdate = () => {
            const updatedList = entryList.map(entry => entry.key === currentEdit ? {
                ...entry,
                tenant: txtTenantName.value
            } : entry);

            entryStore.save(updatedList);
            uiBuilder.buildEntryListElem(updatedList);
            currentEdit = null;
            CssClass.addClass(overlayContainer, 'hide');
        }

        const handleSaveClick = () => {
            if (txtTenantName.value.length === 0) {
                CssClass.addClass(txtTenantName, 'error');
                txtTenantName.focus();
                return;
            }
            if (!currentEdit) {
                entryList.push({
                    key: txtTenantName.dataset.key,
                    tenant: txtTenantName.value,
                    url: txtTenantName.dataset.url,
                    lastVisitDate: new Date(),
                    visits: 1
                });

                entryStore.save(entryList);

                uiBuilder.buildEntryListElem(sortEntryByDate(entryList));

                Page.render(PageUrl.LIST);
            } else {
                handleUpdate();
            }
        };

        btnScan.addEventListener('click', handleScanClick);

        btnQrScan.addEventListener('click', handleScanClick);

        btnCancelScan.addEventListener('click', handleCancleClick);

        txtSearchBox.addEventListener('keyup', handleSearchKeyup);

        btnSave.addEventListener('click', handleSaveClick);

        btnMenu.addEventListener('click', () => {
            Page.render(PageUrl.ABOUT);
        });

        btnCloseMenu.addEventListener('click', () => {
            if (entryList.length === 0) {
                Page.render(PageUrl.LANDING);
            } else {
                Page.render(PageUrl.LIST);
            }
        });
    };

    const init = () => {
        bindEvents();

        entryStore
            .getAllEntries()
            .then(data => {
                if (data && data.length > 0) {
                    entryList = sortEntryByDate(data);

                    uiBuilder.buildEntryListElem(entryList);

                    Page.render(PageUrl.LIST);
                } else {
                    Page.render(PageUrl.LANDING);
                }
            });

        CssClass.removeClass(app, 'loading');

        window.addEventListener('load', () => {
            registerSW();
        });
    };

    init();
})();