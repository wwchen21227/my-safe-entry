/*** Features detection ***/

const IsBrowserSupport = {
    WebWorker: typeof (Worker) !== "undefined",
    ServiceWorker: 'serviceWorker' in navigator,
    SpeechRecognition: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
};

async function registerSW() {
    if (IsBrowserSupport.ServiceWorker) {
        try {
            await navigator.serviceWorker.register('../sw.js');
        } catch (e) {
            alert('ServiceWorker registration failed. Sorry about that.');
        }
    } else {
        document.querySelector('.alert').removeAttribute('hidden');
    }
}

/*** End of feature detection ***/

/*** Speech Recognation ***/

const setupSpeechRecognition = (function(processTranscript) {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.addEventListener("result", event => {
        if (typeof event.results === "undefined") return;
        const transcript = event.results[event.results.length - 1][0].transcript
            .toLowerCase()
            .trim()

        processTranscript(transcript);

        recognition.stop();
    });

    return recognition;
});

/*** END OF Speech Recognation***/

/*** Util function ***/
const getDate = (value) => {
    const date = new Date(value);
    return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;
};

const sortEntryByDate = (arr) => arr.sort((a, b) => b.lastVisitDate - a.lastVisitDate);

const isNumber = (value) => !isNaN(value);

const capitaliseText = (value) => `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`;

const getTenantName = key => {
    const arr = key.split('-');
    const startIndex = isNumber(arr[2]) ? 3 : 2;
    let tenantName = capitaliseText(arr[startIndex]);
    for (let i = (startIndex + 1); i < arr.length - 1; i++) {
        tenantName += ' ' + capitaliseText(arr[i]);
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
        `${date.getHours()}`+
        `:${(date.getMinutes() < 10 ? '0' : '')}${date.getMinutes()}`+
        `:${(date.getSeconds() < 10 ? '0' : '')}${date.getSeconds()}`;
}

const $elem = (selector) => document.querySelector(selector);

var moveInArray = function (arr, from, to) {
	if (Object.prototype.toString.call(arr) !== '[object Array]') {
		throw new Error('Please provide a valid array');
	}
	const item = arr.splice(from, 1);
	if (!item.length) {
		throw new Error('There is no item in the array at index ' + from);
	}
	arr.splice(to, 0, item[0]);
};

/*** End Util function ***/

/*** CSS class Util ***/

const CssClass = {
    addClass: (elem, className) => elem.classList.add(className),
    removeClass: (elem, className) => elem.classList.remove(className),
    hasClass: (elem, className) => elem.classList.contains(className),
    toggleClass: (elem, className) => elem.classList.toggle(className),
};

/*** End CSS class Util ***/

const EntryStore = (listKey) => {
    const save = (entries) => {
        localforage.setItem(listKey, entries)
            //.then(value => console.log(value))
            .catch(function (err) {
                console.error(err);
            });
    };

    const getAllEntries = async () => {
        return localforage.getItem(listKey) || [];
    };

    return {
        save,
        getAllEntries
    };
};

/*** Veact ***/

const MenuIcon = () => 
        `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-dots-vertical" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z"/>
            <circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /><circle cx="12" cy="5" r="1" />
        </svg>`;

const MenuButton = () => 
    `<a href="javascript:void(0);" class="entry-list-menu js-listMenu">${MenuIcon()}</a>`;

const VisitButton = ({url, key}) => 
    `<a class="btn btn-secondary js-visitLink" href="${url}" data-key="${key}" target="_blank">Visit</a>`;

const MenuDropdown = (key) => {
    return `<div class="entry-list-dropdown" data-key="${key}">` +
                `<a href="javascript:void(0)" class="dropdown-row js-editEntry">Edit</a>` +
                `<a href="javascript:void(0)" class="dropdown-row js-deleteEntry">Delete</a>` +
            `</div>`;
}

const EntryItemTitle = (tenantName) => 
    `<span class="entry-title">${tenantName}</span>`;

const EntryItemVisitDateTime = (lastVisitDate) => 
    `<span class="entry-date d-block">Last visit: ${formatDate(lastVisitDate)}</span>`;

const EntryListItem = (entry) => {
    return `<li data-key="${entry.key}" class="entry-list-item">` +
                `<div class="entry-list-content">` +
                    `${MenuButton()}` +
                    `${MenuDropdown(entry.key)}` +
                    `<div>` +
                        `${EntryItemTitle(entry.tenant)}` +
                        `${EntryItemVisitDateTime(entry.lastVisitDate)}` +
                    `</div>` +
                `</div>` +
                `${VisitButton({ url: entry.url, key: entry.key })}` +
            `</li>`;
};
    
const EntryList = ({ entries }) => {
    return entries.length === 0 ? 
            '<li class="entry-list-item no-result">No result found.</li>'
            :
            `${entries.map(EntryListItem).join('')}`;
};

let Veact = function (options) {
    this.elem = document.querySelector(options.selector);
    this.state = options.state;
    this.template = options.template;
};

Veact.prototype.render = function () {
    this.elem.innerHTML = this.template(this.state);
};

Veact.prototype.setState = function (props) {
    for (let key in props) {
        if (props.hasOwnProperty(key)) {
            this.state[key] = props[key];
        }
    }
    this.render();
};

/*** End Veact ***/

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
        ABOUT: 'about',
        OVERLAY: 'overlay'
    };

    const LIST_KEY = 'entries-list';
    const PATH_PRODUCT_KEY_INDEX = 2;
    const entryStore = EntryStore(LIST_KEY);
    const todayDate = getDate(new Date());
    
    let timeoutId = null;
    let originEntries = [];
    let isEdit = false;
    
    const app = $elem('#app');
    const btnQrScan = $elem('#btnQrScan');
    const txtSearchBox = $elem('#txtSearchBox');
    const qrVideo = $elem('#qrVideo');
    const btnScan = $elem('#btnScan');
    const btnCancelScan = $elem('#btnCancelScan');
    const btnSave = $elem('#btnSave');
    const btnMenu = $elem('#btnMenu');
    const btnCloseMenu = $elem('#btnCloseMenu');
    const txtTenantName = $elem('#txtTenantName');
    const canvasElem = $elem('#canvas');
    const btnClearSearch = $elem('.js-clearSearch');
    const btnSpeech = $elem('.js-speech');

    const entryList = new Veact({
        selector: '#entryList',
        state: {
            entries: []
        },
        template: (props) => EntryList(props)
    });

    const todayEntryList = new Veact({
        selector: '#todayEntryList',
        state: {
            entries: []
        },
        template: (props) => EntryList(props)
    });

    const updateEntryList = (entries, isSearch = false) => {
        const [todayList, pastList] = entries.reduce((result, entry) => {
                    result[getDate(entry.lastVisitDate) === todayDate ? 0 : 1].push(entry); 
                    return result;
                },
                [[], []]); 
                    
        todayEntryList.setState({ entries: todayList });
        entryList.setState({ entries: pastList });

        if(!isSearch) {
            if(todayList.length === 0) CssClass.addClass(app, 'no-today-list');
            if(pastList.length === 0) CssClass.addClass(app, 'no-older-list');
        }
    };
    
    const updateVisitEntry = async (key) => {
        const entries = await entryStore.getAllEntries();
        
        let entry = entries.find(entry => entry.key === key);
        entry.lastVisitDate = new Date();
        entry.visits += 1;

        const sortedList = sortEntryByDate(entries);

        entryStore.save(sortedList);
        
        updateEntryList(sortedList);
    };

    const deleteVisitEntry = async (key) => {
        const entries = await entryStore.getAllEntries();
        const newEntries = entries.filter(entry => entry.key !== key);
        entryStore.save(newEntries);

        if(newEntries.length === 0) {
            Page.render(PageUrl.LANDING);
        }else {
            updateEntryList(newEntries);
        }
    }

    const Page = {
        render: (url) => {
            app.dataset.page = url
        },
        showFormOverlay: async (url) => {
            const pathArr = url.pathname.split('/');
            const entries = await entryStore.getAllEntries();
            if(url.hostname.indexOf('gov.sg') === -1 || 
               pathArr.length < 2) {
                if(entries.length === 0) {
                    Page.render(PageUrl.SCAN);    
                }else {
                    Page.render(PageUrl.LIST);
                }
                alert('Sorry, QR code not supported.');
                return;
            }

            const tenantKey = pathArr[PATH_PRODUCT_KEY_INDEX];
            const isExist = entries && entries.some(entry => entry.key === tenantKey);

            if (!isExist) {
                txtTenantName.value = getTenantName(tenantKey);
                txtTenantName.setAttribute('data-key', tenantKey);
                txtTenantName.setAttribute('data-url', url);

                Page.render(PageUrl.OVERLAY);

                txtTenantName.focus();
            } else {
                moveEntryToTop(tenantKey);
                Page.render(PageUrl.LIST);
            }
        },
        showEditOverlay: async (tenantKey) => {
            const entries = await entryStore.getAllEntries();

            const selected = entries.find(entry => entry.key === tenantKey);
            txtTenantName.value = selected.tenant;
            txtTenantName.setAttribute('data-key', tenantKey);

            Page.render(PageUrl.OVERLAY);

            isEdit = true;
            txtTenantName.focus();
        }
    };

    const qrScanner = QRScanner({
        video: qrVideo,
        canvas: canvasElem,
        page: Page
    });

    const moveEntryToTop = (key) => {
        const entryElem = entryList.elem.querySelector(`[data-key="${key}"]`);
        entryList.elem.prepend(entryElem);

        CssClass.addClass(entryElem, 'highlight');
        setTimeout(() => CssClass.removeClass(entryElem, 'highlight'), 3000);
    };

    const startStream = () => {
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

    const resetSearch = () => {
        updateEntryList(originEntries);

        originEntries = [];
        CssClass.removeClass(btnClearSearch, 'visible');
    };

    const searchKeyword = async (keyword) => {
        const entries = await entryStore.getAllEntries();
        if(originEntries.length === 0) {
            originEntries = entries;
        }else {
            entries = originEntries;
        }

        const filteredList = searchTenant(entries, keyword);
        updateEntryList(filteredList, true);

        CssClass.addClass(btnClearSearch, 'visible');
    };

    const bindEvents = () => {
        const handleScanClick = () => {
            startStream();
        };

        const handleCancleClick = async () => {
            qrScanner.stopScan();
            displayLanding();
        };

        const handleSearchKeyup = (e) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                if(e.target.value.trim() === '' && originEntries.length === 0) return;
                if(e.target.value === '') {
                    resetSearch();
                }else {
                    searchKeyword(e.target.value); 
                }
            }, 300);
        };

        const handleUpdate = async () => {
            const entries = await entryStore.getAllEntries();
            const updatedList = entries
                                .map(entry => entry.key === txtTenantName.dataset.key 
                                    ? 
                                    {
                                        ...entry,
                                        tenant: txtTenantName.value.trim()
                                    } 
                                    : entry);

            entryStore.save(updatedList);

            updateEntryList(updatedList);

            isEdit = false;
            Page.render(PageUrl.LIST);
        }

        const handleSaveClick = async () => {
            if (txtTenantName.value.length === 0) {
                CssClass.addClass(txtTenantName, 'error');
                txtTenantName.focus();
                return;
            }
            if (!isEdit) {
                const entries = await entryStore.getAllEntries();

                entries.push({
                    key: txtTenantName.dataset.key,
                    tenant: txtTenantName.value,
                    url: txtTenantName.dataset.url,
                    lastVisitDate: new Date(),
                    visits: 1
                });

                entryStore.save(entries);

                updateEntryList(entries);

                //Page.render(PageUrl.LIST);
                window.location.href = txtTenantName.dataset.url;
            } else {
                handleUpdate();
            }
        };

        let opened = null;
        const handleDropdown = e => {
            const clickedItem = e.parentElement.querySelector('.entry-list-dropdown');
            CssClass.toggleClass(clickedItem, 'd-block');

            if (!opened) {
                opened = clickedItem;
            } else if (opened == clickedItem) {
                opened = null;
            } else {
                CssClass.toggleClass(opened, 'd-block');
                opened = clickedItem;
            }
        };

        const handleToggleMenu = (e) => {
            if (e.target.matches('.js-listMenu')) {
                handleDropdown(e.target.parentElement);
                return;
            } else if (opened) {
                CssClass.toggleClass(opened, 'd-block');
                opened = null;
            }
        };

        const handleDeleteEntry = (e) => {
            const btnDelete = e.target;
            if (btnDelete.matches('.js-deleteEntry')) {
                if(confirm('Delete entry?' )) {
                    deleteVisitEntry(btnDelete.parentElement.dataset.key);
                }
                return;
            }
        };

        const handleEditEntry = (e) => {
            const btnEdit = e.target;
            if (btnEdit.matches('.js-editEntry')) {
                Page.showEditOverlay(e.target.parentElement.dataset.key);
                return;
            }
        };

        const handleVisitClick = (e) => {
            const visitLink = e.target;
            if (visitLink.matches('.js-visitLink')) {
                updateVisitEntry(visitLink.dataset.key);
                return;
            }
        };

        const handleGlobalClick = e => {
            handleToggleMenu(e);
            handleDeleteEntry(e);
            handleEditEntry(e);
            handleVisitClick(e);  
        };
    
        document.addEventListener('click', handleGlobalClick);

        btnScan.addEventListener('click', handleScanClick);

        btnQrScan.addEventListener('click', handleScanClick);

        btnCancelScan.addEventListener('click', handleCancleClick);

        txtSearchBox.addEventListener('keyup', handleSearchKeyup);

        btnSave.addEventListener('click', handleSaveClick);
        
        btnClearSearch.addEventListener('click', () => {
            txtSearchBox.value = '';
            resetSearch();
        });

        btnMenu.addEventListener('click', () => {
            Page.render(PageUrl.ABOUT);
        });

        btnCloseMenu.addEventListener('click', displayLanding);
    };

    const displayLanding = async () => {
        const entries = await entryStore.getAllEntries();
        if (entries && entries.length > 0) {
            updateEntryList(entries);

            Page.render(PageUrl.LIST);
        } else {
            Page.render(PageUrl.LANDING);
        }
    };

    const init = async () => {
        bindEvents();

        displayLanding();

        if(IsBrowserSupport.SpeechRecognition) {
            const SPEECH_WAITING_TIME = 10000;
            let speechTimerId = null;
            
            const commands = {
                "search for": term => (txtSearchBox.value = term)
            };
            
            const recognition = setupSpeechRecognition((transcript) => {
                for (let command in commands) {
                    if (transcript.indexOf(command) === 0) {
                        if (transcript[command.length] === undefined) {
                            commands[command]();
                        } else {
                            const param = transcript
                                .substring(command.length, transcript.length)
                                .trim();
                            commands[command](param);
                            searchKeyword(param);
                        }
                    } else {
                        txtSearchBox.value = transcript;
                        searchKeyword(transcript);
                    }
                }
                clearTimeout(speechTimerId);
                CssClass.removeClass(app, 'speech-activated');
            });

            btnSpeech.addEventListener('click', () => {
                recognition.start(); 
                CssClass.addClass(app, 'speech-activated');

                speechTimerId = setTimeout(() => {
                    recognition.stop(); 
                    CssClass.removeClass(app, 'speech-activated');
                }, SPEECH_WAITING_TIME);
            });

            CssClass.addClass(btnSpeech, 'visible');
        }else {
            CssClass.addClass(app, 'no-speech');
        }

        CssClass.removeClass(app, 'loading');
    };

    window.addEventListener('load', () => {
        registerSW();
        init();
    });
})();
