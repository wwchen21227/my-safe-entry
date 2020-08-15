(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["DLxIDB"] = factory();
	else
		root["DLxIDB"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
Object.defineProperty(exports,"__esModule",{value:true});exports.default={Lexeme:`Language`};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
Object.defineProperty(exports,"__esModule",{value:true});exports.default={Language:`languages`,Lexeme:`lexemes`};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
Object.defineProperty(exports,"__esModule",{value:true});exports.default={Language:[`Lexeme`]};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
Object.defineProperty(exports,"__esModule",{value:true});const types={languages:`Language`,lexemes:`Lexeme`};exports.default=types;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
Object.defineProperty(exports,'__esModule',{value:true});const defaultCallback=()=>{};const respond=(resolve,cb=defaultCallback)=>response=>{resolve(response);cb(response)};const updateTimestamp=model=>{model._ts=Math.floor(new Date/1000);return model};const uuid=()=>{let d=new Date().getTime();if(typeof performance!=='undefined'&&typeof performance.now==='function'){d+=performance.now()}return'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=(d+Math.random()*16)%16|0;d=Math.floor(d/16);return(c==='x'?r:r&3|8).toString(16)})};const validateID=(id,name=`ID argument`)=>{if(!(typeof id===`string`&&id.length)){const e=new Error(`The ${name} must be a non-empty String.`);e.status=400;throw e}};const validateOpts=opts=>{if(!(opts instanceof Object)){const e=new Error(`The options hash must be an Object, if present.`);e.status=400;throw e}};exports.defaultCallback=defaultCallback;exports.respond=respond;exports.updateTimestamp=updateTimestamp;exports.uuid=uuid;exports.validateID=validateID;exports.validateOpts=validateOpts;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
Object.defineProperty(exports,'__esModule',{value:true});var _parents=__webpack_require__(0);var _parents2=_interopRequireDefault(_parents);var _stores=__webpack_require__(1);var _stores2=_interopRequireDefault(_stores);var _subItems=__webpack_require__(2);var _subItems2=_interopRequireDefault(_subItems);var _types=__webpack_require__(3);var _types2=_interopRequireDefault(_types);var _utils=__webpack_require__(4);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}const version=1;const keys={add:Symbol(`add`),delete:Symbol(`delete`),deleteSubItem:Symbol(`deleteSubItem`),get:Symbol(`get`),getAll:Symbol(`getAll`),purgeStore:Symbol(`purgeStore`),update:Symbol(`update`),upsert:Symbol(`upsert`)};const setupDatabase=db=>{const createStore=(storeName,indexes={})=>{const store=db.createObjectStore(storeName,{keyPath:`id`});Object.entries(indexes).forEach(([index,unique])=>store.createIndex(index,index,{unique}))};createStore(`languages`,{_ts:false,abbreviation:false,glottolog:false,iso:false,url:true});createStore(`lexemes`,{_ts:false,key:false,url:true})};class IDBClient{constructor(options={}){if(!window.indexedDB)throw new Error(`Your browser doesn't support a stable version of IndexedDB. Local database storage will not be available.`);this.connected=false;this.name=options.name||`dlx`;Object.defineProperty(this,`version`,{configurable:false,enumerable:true,value:version,writable:false})}get disconnected(){return!this.connected}get types(){return _types2.default}close(){if(!this.client)return;this.client.close();this.connected=false}connect(){return this.open()}deleteDatabase(dbname=this.name,cb){return new Promise((resolve,reject)=>{const callback=dbname instanceof Function?dbname:cb;const res=(0,_utils.respond)(resolve,callback);const req=indexedDB.deleteDatabase(dbname);req.onsuccess=()=>{this.connected=false;res(req.result)};req.onerror=()=>reject(req.error);req.onabort=()=>reject(req.error)})}disconnect(){return this.close()}open(cb){return new Promise((resolve,reject)=>{const res=(0,_utils.respond)(resolve,cb);const req=indexedDB.open(this.name,this.version);req.onblocked=()=>reject(req.error);req.onerror=()=>reject(req.error);req.onsuccess=()=>{this.client=req.result;this.client.onabort=ev=>console.error(ev.target);this.client.onclose=ev=>{this.connected=false;throw ev.target};this.client.onversionchange=()=>{this.client.close();this.connected=false};this.connected=true;res(this)};req.onupgradeneeded=()=>{const txn=req.transaction;this.client=req.result;this.client.onabort=ev=>console.error(ev.target);this.client.onclose=ev=>{this.connected=false;throw ev.target};this.client.onversionchange=()=>{this.client.close();this.connected=false};setupDatabase(this.client);this.connected=true;txn.onerror=reject;txn.oncomplete=()=>res(this)}})}purge(){return new Promise((resolve,reject)=>{const tables=Object.values(_stores2.default);const txn=this.client.transaction(tables,`readwrite`);txn.onerror=()=>{txn.error.status=500;reject(txn.error)};txn.oncomplete=resolve;const purgeStore=storeName=>{const objectStore=txn.objectStore(storeName);objectStore.openCursor().onsuccess=ev=>{const cursor=ev.target.result;if(cursor){if(cursor.value.deleted)objectStore.delete(cursor.value.id);cursor.continue()}}};tables.map(purgeStore)})}async[keys.add](type,item={},options={},callback=_utils.defaultCallback){if(!this.client)await this.open();const opts=options instanceof Function?{}:options;const cb=options instanceof Function?options:callback;if(item.id)(0,_utils.validateID)(item.id,`id property`);(0,_utils.validateOpts)(opts);const Model=dlx.models[type];try{var model=new Model(item)}catch(e){e.status=422;throw e}model.id=model.id||(0,_utils.uuid)();(0,_utils.updateTimestamp)(model);if(type in _parents2.default){const parentIDProp=`${_parents2.default[type].toLowerCase()}ID`;const parentID=opts[parentIDProp]||model[parentIDProp];const parentStore=_stores2.default[_parents2.default[type]];(0,_utils.validateID)(parentID,`${parentIDProp} property`);await new Promise((resolve,reject)=>{const txn=this.client.transaction(parentStore);txn.onerror=()=>{txn.error.status=500;reject(txn.error)};txn.oncomplete=resolve;txn.objectStore(parentStore).get(parentID).onsuccess=ev=>{const parent=ev.target.result;if(parent){model[parentIDProp]=parentID}else{const e=new Error(`${_parents2.default[type]} with ID ${parentID} not found. Could not add subitem.`);e.status=404;reject(e)}}})}return new Promise((resolve,reject)=>{const res=(0,_utils.respond)(resolve,cb);const store=_stores2.default[type];const txn=this.client.transaction(store,`readwrite`);txn.onerror=()=>{txn.error.status=500;reject(txn.error)};txn.oncomplete=()=>res(model);txn.objectStore(store).add(model.data)})}async[keys.delete](type,id,cb=_utils.defaultCallback){if(!this.client)await this.open();(0,_utils.validateID)(id);if(type in _subItems2.default){await Promise.all(_subItems2.default[type].map(subType=>this[keys.deleteSubItems](subType,id)))}return new Promise((resolve,reject)=>{const res=(0,_utils.respond)(resolve,cb);const store=_stores2.default[type];const txn=this.client.transaction(store,`readwrite`);txn.onerror=()=>{txn.error.status=500;reject(txn.error)};txn.oncomplete=()=>res({message:`${type} with ID ${id} successfully deleted.`,status:204});const objectStore=txn.objectStore(store);objectStore.get(id).onsuccess=ev=>{const{result}=ev.target;if(result){result.deleted=true;(0,_utils.updateTimestamp)(result);objectStore.put(result)}else{const e=new Error(`${type} with ID ${id} could not be found.`);e.status=404;reject(e)}}})}[keys.deleteSubItems](subType,parentID){const parentIDProp=`${_parents2.default[subType].toLowerCase()}ID`;const store=_stores2.default[subType];return new Promise((resolve,reject)=>{const txn=this.client.transaction(store,`readwrite`);txn.onerror=()=>reject(txn.error);txn.oncomplete=resolve;const objectStore=txn.objectStore(store);objectStore.openCursor().onsuccess=ev=>{const cursor=ev.target.result;if(cursor){if(cursor.value[parentIDProp]===parentID&&!cursor.deleted){cursor.value.deleted=true;objectStore.put(cursor.value)}cursor.continue()}}})}async[keys.get](type,id,options={},callback=_utils.defaultCallback){const opts=options instanceof Function?{}:options;const cb=options instanceof Function?options:callback;if(!this.client)await this.open();(0,_utils.validateID)(id);const store=_stores2.default[type];let result=null;return new Promise((resolve,reject)=>{const res=(0,_utils.respond)(resolve,cb);const txn=this.client.transaction(store);txn.onerror=()=>{txn.error.status=500;reject(txn.error)};txn.oncomplete=()=>{const Model=dlx.models[_types2.default[store]];try{var model=new Model(result)}catch(e){e.status=422;return reject(e)}res(model)};const objectStore=txn.objectStore(store);const req=objectStore.get(id);req.onsuccess=()=>{if(req.result&&req.result.deleted&&!opts.deleted){const e=new Error(`${type} with ID ${id} has been deleted.`);e.status=410;reject(e)}else if(req.result){result=req.result}else{const e=new Error(`${type} with ID ${id} could not be found.`);e.status=404;reject(e)}}})}async[keys.getAll](type,options={},callback=_utils.defaultCallback){if(!this.client)await this.open();const cb=options instanceof Function?options:callback;const opts=options instanceof Function?{}:options;const store=_stores2.default[type];let results=[];(0,_utils.validateOpts)(opts);if(`deleted`in opts&&typeof opts.deleted!==`boolean`){const e=new Error(`The deleted option must be a Boolean.`);e.status=400;throw e}if(`ifModifiedSince`in opts&&isNaN(Date.parse(opts.ifModifiedSince))){const e=new Error(`The ifModifiedSince option must be a Date or valid date string.`);e.status=400;throw e}if(type in _parents2.default){const parentIDProp=`${_parents2.default[type].toLowerCase()}ID`;if(parentIDProp in opts){(0,_utils.validateID)(opts[parentIDProp],`${parentIDProp} property`);opts.parentID=opts[parentIDProp]}}return new Promise((resolve,reject)=>{const res=(0,_utils.respond)(resolve,cb);const txn=this.client.transaction(store);txn.onerror=()=>{txn.error.status=500;reject(txn.error)};txn.oncomplete=()=>{const Model=dlx.models[_types2.default[store]];try{results=results.map(item=>new Model(item))}catch(e){e.status=422;throw e}res(results)};const since=new Date(opts.ifModifiedSince)/1000;const isDeleted=item=>opts.deleted===true?true:!item.deleted;const isModified=item=>`ifModifiedSince`in opts?item._ts>=since:true;const isSubItem=item=>`parentID`in opts?item[`${_parents2.default[type].toLowerCase()}ID`]===opts.parentID:true;const matches=item=>isModified(item)&&isSubItem(item)&&isDeleted(item);txn.objectStore(store).openCursor().onsuccess=ev=>{const cursor=ev.target.result;if(cursor){if(matches(cursor.value))results.push(cursor.value);cursor.continue()}}})}async[keys.update](type,item={},callback=_utils.defaultCallback){if(!this.client)await this.open();const data=item;(0,_utils.validateID)(data.id,`id property`);if(type in _parents2.default){const parentIDProp=`${_parents2.default[type].toLowerCase()}ID`;delete data[parentIDProp]}return new Promise((resolve,reject)=>{const Model=dlx.models[type];const store=_stores2.default[type];const res=(0,_utils.respond)(resolve,callback);const txn=this.client.transaction(store,`readwrite`);let response;txn.onerror=()=>{txn.error.status=500;reject(txn.error)};txn.oncomplete=()=>res(response);const objectStore=txn.objectStore(store);objectStore.get(data.id).onsuccess=ev=>{const{result}=ev.target;if(ev.target.result){try{var model=new Model(Object.assign(result,data))}catch(e){e.status=422;return reject(e)}delete model.deleted;(0,_utils.updateTimestamp)(model);objectStore.put(model.data);response=model}else{const e=new Error(`${type} with ID ${data.id} could not be found.`);e.status=404;reject(e)}}})}async[keys.upsert](type,item={},callback=_utils.defaultCallback){if(!item.id)return this[keys.add](type,item,callback);if(!this.client)await this.open();const Model=dlx.models[type];try{var model=new Model(item)}catch(e){e.status=422;throw e}(0,_utils.validateID)(model.id,`id property`);return new Promise((resolve,reject)=>{const res=(0,_utils.respond)(resolve,callback);const store=_stores2.default[type];(0,_utils.updateTimestamp)(model);const txn=this.client.transaction(store,`readwrite`);txn.onerror=()=>{txn.error.status=500;reject(txn.error)};txn.oncomplete=()=>res(model);const objectStore=txn.objectStore(store);objectStore.get(model.id).onsuccess=ev=>{const{result}=ev.target;if(!result)return this[keys.add](type,item,callback);delete result.deleted;if(type in _parents2.default){const parentIDProp=`${_parents2.default[type].toLowerCase()}ID`;model[parentIDProp]=result[parentIDProp]}objectStore.put(model.data)}})}addLanguage(language,callback){return this[keys.add](`Language`,language,callback)}deleteLanguage(languageID,callback){return this[keys.delete](`Language`,languageID,callback)}getLanguage(id,callback){return this[keys.get](`Language`,id,callback)}getLanguages(options,callback){return this[keys.getAll](`Language`,options,callback)}updateLanguage(language,callback){return this[keys.update](`Language`,language,callback)}upsertLanguage(language,callback){return this[keys.upsert](`Language`,language,callback)}addLexeme(lexeme={},options={},callback=_utils.defaultCallback){return this[keys.add](`Lexeme`,lexeme,options,callback)}deleteLexeme(id,callback){return this[keys.delete](`Lexeme`,id,callback)}getLexeme(id,callback){return this[keys.get](`Lexeme`,id,callback)}getLexemes(options={},callback=_utils.defaultCallback){return this[keys.getAll](`Lexeme`,options,callback)}updateLexeme(lexeme,callback){return this[keys.update](`Lexeme`,lexeme,callback)}upsertLexeme(lexeme,callback){return this[keys.upsert](`Lexeme`,lexeme,callback)}}exports.default=IDBClient;

/***/ })
/******/ ]);
});