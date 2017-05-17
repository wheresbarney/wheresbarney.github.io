/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
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
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /** @module pbjs */
	
	var _prebidGlobal = __webpack_require__(1);
	
	var _utils = __webpack_require__(2);
	
	var _video = __webpack_require__(4);
	
	__webpack_require__(87);
	
	var _url = __webpack_require__(22);
	
	var _cpmBucketManager = __webpack_require__(12);
	
	var _secureCreatives = __webpack_require__(135);
	
	var _cookie = __webpack_require__(85);
	
	var _adloader = __webpack_require__(13);
	
	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	
	var pbjs = (0, _prebidGlobal.getGlobal)();
	var CONSTANTS = __webpack_require__(3);
	var utils = __webpack_require__(2);
	var bidmanager = __webpack_require__(11);
	var adaptermanager = __webpack_require__(5);
	var bidfactory = __webpack_require__(10);
	var events = __webpack_require__(8);
	var adserver = __webpack_require__(136);
	var targeting = __webpack_require__(137);
	
	/* private variables */
	
	var objectType_function = 'function';
	var objectType_undefined = 'undefined';
	var objectType_object = 'object';
	var BID_WON = CONSTANTS.EVENTS.BID_WON;
	var SET_TARGETING = CONSTANTS.EVENTS.SET_TARGETING;
	
	var auctionRunning = false;
	var bidRequestQueue = [];
	
	var eventValidators = {
	  bidWon: checkDefinedPlacement
	};
	
	/* Public vars */
	
	pbjs._bidsRequested = [];
	pbjs._bidsReceived = [];
	// _adUnitCodes stores the current filter to use for adUnits as an array of adUnitCodes
	pbjs._adUnitCodes = [];
	pbjs._winningBids = [];
	pbjs._adsReceived = [];
	pbjs._sendAllBids = false;
	
	pbjs.bidderSettings = pbjs.bidderSettings || {};
	
	//default timeout for all bids
	pbjs.bidderTimeout = pbjs.bidderTimeout || 3000;
	
	// current timeout set in `requestBids` or to default `bidderTimeout`
	pbjs.cbTimeout = pbjs.cbTimeout || 200;
	
	// timeout buffer to adjust for bidder CDN latency
	pbjs.timeoutBuffer = 200;
	
	pbjs.logging = pbjs.logging || false;
	
	// domain where prebid is running for cross domain iframe communication
	pbjs.publisherDomain = pbjs.publisherDomain || window.location.origin;
	
	//let the world know we are loaded
	pbjs.libLoaded = true;
	
	//version auto generated from build
	pbjs.version = 'v0.24.0-pre';
	utils.logInfo('Prebid.js v0.24.0-pre loaded');
	
	//create adUnit array
	pbjs.adUnits = pbjs.adUnits || [];
	
	//delay to request cookie sync to stay out of critical path
	pbjs.cookieSyncDelay = pbjs.cookieSyncDelay || 100;
	
	/**
	 * Command queue that functions will execute once prebid.js is loaded
	 * @param  {function} cmd Anonymous function to execute
	 * @alias module:pbjs.que.push
	 */
	pbjs.que.push = function (cmd) {
	  if ((typeof cmd === 'undefined' ? 'undefined' : _typeof(cmd)) === objectType_function) {
	    try {
	      cmd.call();
	    } catch (e) {
	      utils.logError('Error processing command :' + e.message);
	    }
	  } else {
	    utils.logError('Commands written into pbjs.que.push must wrapped in a function');
	  }
	};
	
	function processQue() {
	  for (var i = 0; i < pbjs.que.length; i++) {
	    if (_typeof(pbjs.que[i].called) === objectType_undefined) {
	      try {
	        pbjs.que[i].call();
	        pbjs.que[i].called = true;
	      } catch (e) {
	        utils.logError('Error processing command :', 'prebid.js', e);
	      }
	    }
	  }
	}
	
	function checkDefinedPlacement(id) {
	  var placementCodes = pbjs._bidsRequested.map(function (bidSet) {
	    return bidSet.bids.map(function (bid) {
	      return bid.placementCode;
	    });
	  }).reduce(_utils.flatten).filter(_utils.uniques);
	
	  if (!utils.contains(placementCodes, id)) {
	    utils.logError('The "' + id + '" placement is not defined.');
	    return;
	  }
	
	  return true;
	}
	
	/**
	 * When a request for bids is made any stale bids remaining will be cleared for
	 * a placement included in the outgoing bid request.
	 */
	function clearPlacements() {
	  pbjs._bidsRequested = [];
	
	  // leave bids received for ad slots not in this bid request
	  pbjs._bidsReceived = pbjs._bidsReceived.filter(function (bid) {
	    return !pbjs._adUnitCodes.includes(bid.adUnitCode);
	  });
	}
	
	function setRenderSize(doc, width, height) {
	  if (doc.defaultView && doc.defaultView.frameElement) {
	    doc.defaultView.frameElement.width = width;
	    doc.defaultView.frameElement.height = height;
	  }
	}
	
	//////////////////////////////////
	//                              //
	//    Start Public APIs         //
	//                              //
	//////////////////////////////////
	
	/**
	 * This function returns the query string targeting parameters available at this moment for a given ad unit. Note that some bidder's response may not have been received if you call this function too quickly after the requests are sent.
	 * @param  {string} [adunitCode] adUnitCode to get the bid responses for
	 * @alias module:pbjs.getAdserverTargetingForAdUnitCodeStr
	 * @return {array}  returnObj return bids array
	 */
	pbjs.getAdserverTargetingForAdUnitCodeStr = function (adunitCode) {
	  utils.logInfo('Invoking pbjs.getAdserverTargetingForAdUnitCodeStr', arguments);
	
	  // call to retrieve bids array
	  if (adunitCode) {
	    var res = pbjs.getAdserverTargetingForAdUnitCode(adunitCode);
	    return utils.transformAdServerTargetingObj(res);
	  } else {
	    utils.logMessage('Need to call getAdserverTargetingForAdUnitCodeStr with adunitCode');
	  }
	};
	
	/**
	 * This function returns the query string targeting parameters available at this moment for a given ad unit. Note that some bidder's response may not have been received if you call this function too quickly after the requests are sent.
	 * @param adUnitCode {string} adUnitCode to get the bid responses for
	 * @returns {object}  returnObj return bids
	 */
	pbjs.getAdserverTargetingForAdUnitCode = function (adUnitCode) {
	  return pbjs.getAdserverTargeting(adUnitCode)[adUnitCode];
	};
	
	/**
	 * returns all ad server targeting for all ad units
	 * @return {object} Map of adUnitCodes and targeting values []
	 * @alias module:pbjs.getAdserverTargeting
	 */
	
	pbjs.getAdserverTargeting = function (adUnitCode) {
	  utils.logInfo('Invoking pbjs.getAdserverTargeting', arguments);
	  return targeting.getAllTargeting(adUnitCode).map(function (targeting) {
	    return _defineProperty({}, Object.keys(targeting)[0], targeting[Object.keys(targeting)[0]].map(function (target) {
	      return _defineProperty({}, Object.keys(target)[0], target[Object.keys(target)[0]].join(', '));
	    }).reduce(function (p, c) {
	      return _extends(c, p);
	    }, {}));
	  }).reduce(function (accumulator, targeting) {
	    var key = Object.keys(targeting)[0];
	    accumulator[key] = _extends({}, accumulator[key], targeting[key]);
	    return accumulator;
	  }, {});
	};
	
	/**
	 * This function returns the bid responses at the given moment.
	 * @alias module:pbjs.getBidResponses
	 * @return {object}            map | object that contains the bidResponses
	 */
	
	pbjs.getBidResponses = function () {
	  utils.logInfo('Invoking pbjs.getBidResponses', arguments);
	  var responses = pbjs._bidsReceived.filter(_utils.adUnitsFilter.bind(this, pbjs._adUnitCodes));
	
	  // find the last requested id to get responses for most recent auction only
	  var currentRequestId = responses && responses.length && responses[responses.length - 1].requestId;
	
	  return responses.map(function (bid) {
	    return bid.adUnitCode;
	  }).filter(_utils.uniques).map(function (adUnitCode) {
	    return responses.filter(function (bid) {
	      return bid.requestId === currentRequestId && bid.adUnitCode === adUnitCode;
	    });
	  }).filter(function (bids) {
	    return bids && bids[0] && bids[0].adUnitCode;
	  }).map(function (bids) {
	    return _defineProperty({}, bids[0].adUnitCode, { bids: bids });
	  }).reduce(function (a, b) {
	    return _extends(a, b);
	  }, {});
	};
	
	/**
	 * Returns bidResponses for the specified adUnitCode
	 * @param  {String} adUnitCode adUnitCode
	 * @alias module:pbjs.getBidResponsesForAdUnitCode
	 * @return {Object}            bidResponse object
	 */
	
	pbjs.getBidResponsesForAdUnitCode = function (adUnitCode) {
	  var bids = pbjs._bidsReceived.filter(function (bid) {
	    return bid.adUnitCode === adUnitCode;
	  });
	  return {
	    bids: bids
	  };
	};
	
	/**
	 * Set query string targeting on all GPT ad units.
	 * @alias module:pbjs.setTargetingForGPTAsync
	 */
	pbjs.setTargetingForGPTAsync = function () {
	  utils.logInfo('Invoking pbjs.setTargetingForGPTAsync', arguments);
	  if (!(0, _utils.isGptPubadsDefined)()) {
	    utils.logError('window.googletag is not defined on the page');
	    return;
	  }
	
	  //first reset any old targeting
	  targeting.resetPresetTargeting();
	
	  //now set new targeting keys
	  targeting.setTargeting(targeting.getAllTargeting());
	
	  //emit event
	  events.emit(SET_TARGETING);
	};
	
	pbjs.setTargetingForAst = function () {
	  utils.logInfo('Invoking pbjs.setTargetingForAn', arguments);
	  if (!targeting.isApntagDefined()) {
	    utils.logError('window.apntag is not defined on the page');
	    return;
	  }
	
	  targeting.setTargetingForAst();
	
	  //emit event
	  events.emit(SET_TARGETING);
	};
	
	/**
	 * Returns a bool if all the bids have returned or timed out
	 * @alias module:pbjs.allBidsAvailable
	 * @return {bool} all bids available
	 */
	pbjs.allBidsAvailable = function () {
	  utils.logInfo('Invoking pbjs.allBidsAvailable', arguments);
	  return bidmanager.bidsBackAll();
	};
	
	/**
	 * This function will render the ad (based on params) in the given iframe document passed through.
	 * Note that doc SHOULD NOT be the parent document page as we can't doc.write() asynchronously
	 * @param  {HTMLDocument} doc document
	 * @param  {string} id bid id to locate the ad
	 * @alias module:pbjs.renderAd
	 */
	pbjs.renderAd = function (doc, id) {
	  utils.logInfo('Invoking pbjs.renderAd', arguments);
	  utils.logMessage('Calling renderAd with adId :' + id);
	  if (doc && id) {
	    try {
	      //lookup ad by ad Id
	      var bid = pbjs._bidsReceived.find(function (bid) {
	        return bid.adId === id;
	      });
	      if (bid) {
	        //replace macros according to openRTB with price paid = bid.cpm
	        bid.ad = utils.replaceAuctionPrice(bid.ad, bid.cpm);
	        bid.url = utils.replaceAuctionPrice(bid.url, bid.cpm);
	        //save winning bids
	        pbjs._winningBids.push(bid);
	
	        //emit 'bid won' event here
	        events.emit(BID_WON, bid);
	
	        var height = bid.height,
	            width = bid.width,
	            ad = bid.ad,
	            mediaType = bid.mediaType,
	            url = bid.adUrl,
	            renderer = bid.renderer;
	
	
	        if (renderer && renderer.url) {
	          renderer.render(bid);
	        } else if (doc === document && !utils.inIframe() || mediaType === 'video') {
	          utils.logError('Error trying to write ad. Ad render call ad id ' + id + ' was prevented from writing to the main document.');
	        } else if (ad) {
	          doc.write(ad);
	          doc.close();
	          setRenderSize(doc, width, height);
	        } else if (url) {
	          doc.write('<IFRAME SRC="' + url + '" FRAMEBORDER="0" SCROLLING="no" MARGINHEIGHT="0" MARGINWIDTH="0" TOPMARGIN="0" LEFTMARGIN="0" ALLOWTRANSPARENCY="true" WIDTH="' + width + '" HEIGHT="' + height + '"></IFRAME>');
	          doc.close();
	          setRenderSize(doc, width, height);
	        } else {
	          utils.logError('Error trying to write ad. No ad for bid response id: ' + id);
	        }
	      } else {
	        utils.logError('Error trying to write ad. Cannot find ad by given id : ' + id);
	      }
	    } catch (e) {
	      utils.logError('Error trying to write ad Id :' + id + ' to the page:' + e.message);
	    }
	  } else {
	    utils.logError('Error trying to write ad Id :' + id + ' to the page. Missing document or adId');
	  }
	};
	
	/**
	 * Remove adUnit from the pbjs configuration
	 * @param  {String} adUnitCode the adUnitCode to remove
	 * @alias module:pbjs.removeAdUnit
	 */
	pbjs.removeAdUnit = function (adUnitCode) {
	  utils.logInfo('Invoking pbjs.removeAdUnit', arguments);
	  if (adUnitCode) {
	    for (var i = 0; i < pbjs.adUnits.length; i++) {
	      if (pbjs.adUnits[i].code === adUnitCode) {
	        pbjs.adUnits.splice(i, 1);
	      }
	    }
	  }
	};
	
	pbjs.clearAuction = function () {
	  auctionRunning = false;
	  (0, _cookie.syncCookies)(pbjs.cookieSyncDelay);
	  utils.logMessage('Prebid auction cleared');
	  if (bidRequestQueue.length) {
	    bidRequestQueue.shift()();
	  }
	};
	
	/**
	 *
	 * @param bidsBackHandler
	 * @param timeout
	 * @param adUnits
	 * @param adUnitCodes
	 */
	pbjs.requestBids = function () {
	  var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	      bidsBackHandler = _ref4.bidsBackHandler,
	      timeout = _ref4.timeout,
	      adUnits = _ref4.adUnits,
	      adUnitCodes = _ref4.adUnitCodes;
	
	  events.emit('requestBids');
	  var cbTimeout = pbjs.cbTimeout = timeout || pbjs.bidderTimeout;
	  adUnits = adUnits || pbjs.adUnits;
	
	  utils.logInfo('Invoking pbjs.requestBids', arguments);
	
	  if (adUnitCodes && adUnitCodes.length) {
	    // if specific adUnitCodes supplied filter adUnits for those codes
	    adUnits = adUnits.filter(function (unit) {
	      return adUnitCodes.includes(unit.code);
	    });
	  } else {
	    // otherwise derive adUnitCodes from adUnits
	    adUnitCodes = adUnits && adUnits.map(function (unit) {
	      return unit.code;
	    });
	  }
	
	  // for video-enabled adUnits, only request bids if all bidders support video
	  var invalidVideoAdUnits = adUnits.filter(_video.videoAdUnit).filter(_video.hasNonVideoBidder);
	  invalidVideoAdUnits.forEach(function (adUnit) {
	    utils.logError('adUnit ' + adUnit.code + ' has \'mediaType\' set to \'video\' but contains a bidder that doesn\'t support video. No Prebid demand requests will be triggered for this adUnit.');
	    for (var i = 0; i < adUnits.length; i++) {
	      if (adUnits[i].code === adUnit.code) {
	        adUnits.splice(i, 1);
	      }
	    }
	  });
	
	  if (auctionRunning) {
	    bidRequestQueue.push(function () {
	      pbjs.requestBids({ bidsBackHandler: bidsBackHandler, timeout: cbTimeout, adUnits: adUnits, adUnitCodes: adUnitCodes });
	    });
	    return;
	  }
	
	  auctionRunning = true;
	
	  // we will use adUnitCodes for filtering the current auction
	  pbjs._adUnitCodes = adUnitCodes;
	
	  bidmanager.externalCallbackReset();
	  clearPlacements();
	
	  if (!adUnits || adUnits.length === 0) {
	    utils.logMessage('No adUnits configured. No bids requested.');
	    if ((typeof bidsBackHandler === 'undefined' ? 'undefined' : _typeof(bidsBackHandler)) === objectType_function) {
	      bidmanager.addOneTimeCallback(bidsBackHandler, false);
	    }
	    bidmanager.executeCallback();
	    return;
	  }
	
	  //set timeout for all bids
	  var timedOut = true;
	  var timeoutCallback = bidmanager.executeCallback.bind(bidmanager, timedOut);
	  var timer = setTimeout(timeoutCallback, cbTimeout);
	  if ((typeof bidsBackHandler === 'undefined' ? 'undefined' : _typeof(bidsBackHandler)) === objectType_function) {
	    bidmanager.addOneTimeCallback(bidsBackHandler, timer);
	  }
	
	  adaptermanager.callBids({ adUnits: adUnits, adUnitCodes: adUnitCodes, cbTimeout: cbTimeout });
	  if (pbjs._bidsRequested.length === 0) {
	    bidmanager.executeCallback();
	  }
	};
	
	/**
	 *
	 * Add adunit(s)
	 * @param {Array|String} adUnitArr Array of adUnits or single adUnit Object.
	 * @alias module:pbjs.addAdUnits
	 */
	pbjs.addAdUnits = function (adUnitArr) {
	  utils.logInfo('Invoking pbjs.addAdUnits', arguments);
	  if (utils.isArray(adUnitArr)) {
	    // generate transactionid for each new adUnits
	    // Append array to existing
	    adUnitArr.forEach(function (adUnit) {
	      return adUnit.transactionId = utils.generateUUID();
	    });
	    pbjs.adUnits.push.apply(pbjs.adUnits, adUnitArr);
	  } else if ((typeof adUnitArr === 'undefined' ? 'undefined' : _typeof(adUnitArr)) === objectType_object) {
	    // Generate the transaction id for the adunit
	    adUnitArr.transactionId = utils.generateUUID();
	    pbjs.adUnits.push(adUnitArr);
	  }
	};
	
	/**
	 * @param {String} event the name of the event
	 * @param {Function} handler a callback to set on event
	 * @param {String} id an identifier in the context of the event
	 *
	 * This API call allows you to register a callback to handle a Prebid.js event.
	 * An optional `id` parameter provides more finely-grained event callback registration.
	 * This makes it possible to register callback events for a specific item in the
	 * event context. For example, `bidWon` events will accept an `id` for ad unit code.
	 * `bidWon` callbacks registered with an ad unit code id will be called when a bid
	 * for that ad unit code wins the auction. Without an `id` this method registers the
	 * callback for every `bidWon` event.
	 *
	 * Currently `bidWon` is the only event that accepts an `id` parameter.
	 */
	pbjs.onEvent = function (event, handler, id) {
	  utils.logInfo('Invoking pbjs.onEvent', arguments);
	  if (!utils.isFn(handler)) {
	    utils.logError('The event handler provided is not a function and was not set on event "' + event + '".');
	    return;
	  }
	
	  if (id && !eventValidators[event].call(null, id)) {
	    utils.logError('The id provided is not valid for event "' + event + '" and no handler was set.');
	    return;
	  }
	
	  events.on(event, handler, id);
	};
	
	/**
	 * @param {String} event the name of the event
	 * @param {Function} handler a callback to remove from the event
	 * @param {String} id an identifier in the context of the event (see `pbjs.onEvent`)
	 */
	pbjs.offEvent = function (event, handler, id) {
	  utils.logInfo('Invoking pbjs.offEvent', arguments);
	  if (id && !eventValidators[event].call(null, id)) {
	    return;
	  }
	
	  events.off(event, handler, id);
	};
	
	/**
	 * Add a callback event
	 * @param {String} eventStr event to attach callback to Options: "allRequestedBidsBack" | "adUnitBidsBack"
	 * @param {Function} func  function to execute. Parameters passed into the function: (bidResObj), [adUnitCode]);
	 * @alias module:pbjs.addCallback
	 * @returns {String} id for callback
	 */
	pbjs.addCallback = function (eventStr, func) {
	  utils.logInfo('Invoking pbjs.addCallback', arguments);
	  var id = null;
	  if (!eventStr || !func || (typeof func === 'undefined' ? 'undefined' : _typeof(func)) !== objectType_function) {
	    utils.logError('error registering callback. Check method signature');
	    return id;
	  }
	
	  id = utils.getUniqueIdentifierStr;
	  bidmanager.addCallback(id, func, eventStr);
	  return id;
	};
	
	/**
	 * Remove a callback event
	 * //@param {string} cbId id of the callback to remove
	 * @alias module:pbjs.removeCallback
	 * @returns {String} id for callback
	 */
	pbjs.removeCallback = function () /* cbId */{
	  //todo
	  return null;
	};
	
	/**
	 * Wrapper to register bidderAdapter externally (adaptermanager.registerBidAdapter())
	 * @param  {[type]} bidderAdaptor [description]
	 * @param  {[type]} bidderCode    [description]
	 * @return {[type]}               [description]
	 */
	pbjs.registerBidAdapter = function (bidderAdaptor, bidderCode) {
	  utils.logInfo('Invoking pbjs.registerBidAdapter', arguments);
	  try {
	    adaptermanager.registerBidAdapter(bidderAdaptor(), bidderCode);
	  } catch (e) {
	    utils.logError('Error registering bidder adapter : ' + e.message);
	  }
	};
	
	/**
	 * Wrapper to register analyticsAdapter externally (adaptermanager.registerAnalyticsAdapter())
	 * @param  {[type]} options [description]
	 */
	pbjs.registerAnalyticsAdapter = function (options) {
	  utils.logInfo('Invoking pbjs.registerAnalyticsAdapter', arguments);
	  try {
	    adaptermanager.registerAnalyticsAdapter(options);
	  } catch (e) {
	    utils.logError('Error registering analytics adapter : ' + e.message);
	  }
	};
	
	pbjs.bidsAvailableForAdapter = function (bidderCode) {
	  utils.logInfo('Invoking pbjs.bidsAvailableForAdapter', arguments);
	
	  pbjs._bidsRequested.find(function (bidderRequest) {
	    return bidderRequest.bidderCode === bidderCode;
	  }).bids.map(function (bid) {
	    return _extends(bid, bidfactory.createBid(1), {
	      bidderCode: bidderCode,
	      adUnitCode: bid.placementCode
	    });
	  }).map(function (bid) {
	    return pbjs._bidsReceived.push(bid);
	  });
	};
	
	/**
	 * Wrapper to bidfactory.createBid()
	 * @param  {[type]} statusCode [description]
	 * @return {[type]}            [description]
	 */
	pbjs.createBid = function (statusCode) {
	  utils.logInfo('Invoking pbjs.createBid', arguments);
	  return bidfactory.createBid(statusCode);
	};
	
	/**
	 * Wrapper to bidmanager.addBidResponse
	 * @param {[type]} adUnitCode [description]
	 * @param {[type]} bid        [description]
	 */
	pbjs.addBidResponse = function (adUnitCode, bid) {
	  utils.logInfo('Invoking pbjs.addBidResponse', arguments);
	  bidmanager.addBidResponse(adUnitCode, bid);
	};
	
	/**
	 * Wrapper to adloader.loadScript
	 * @param  {[type]}   tagSrc   [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	pbjs.loadScript = function (tagSrc, callback, useCache) {
	  utils.logInfo('Invoking pbjs.loadScript', arguments);
	  (0, _adloader.loadScript)(tagSrc, callback, useCache);
	};
	
	/**
	 * Will enable sending a prebid.js to data provider specified
	 * @param  {object} config object {provider : 'string', options : {}}
	 */
	pbjs.enableAnalytics = function (config) {
	  if (config && !utils.isEmpty(config)) {
	    utils.logInfo('Invoking pbjs.enableAnalytics for: ', config);
	    adaptermanager.enableAnalytics(config);
	  } else {
	    utils.logError('pbjs.enableAnalytics should be called with option {}');
	  }
	};
	
	pbjs.aliasBidder = function (bidderCode, alias) {
	  utils.logInfo('Invoking pbjs.aliasBidder', arguments);
	  if (bidderCode && alias) {
	    adaptermanager.aliasBidAdapter(bidderCode, alias);
	  } else {
	    utils.logError('bidderCode and alias must be passed as arguments', 'pbjs.aliasBidder');
	  }
	};
	
	/**
	 * Sets a default price granularity scheme.
	 * @param {String|Object} granularity - the granularity scheme.
	 * "low": $0.50 increments, capped at $5 CPM
	 * "medium": $0.10 increments, capped at $20 CPM (the default)
	 * "high": $0.01 increments, capped at $20 CPM
	 * "auto": Applies a sliding scale to determine granularity
	 * "dense": Like "auto", but the bid price granularity uses smaller increments, especially at lower CPMs
	 *
	 * Alternatively a custom object can be specified:
	 * { "buckets" : [{"min" : 0,"max" : 20,"increment" : 0.1,"cap" : true}]};
	 * See http://prebid.org/dev-docs/publisher-api-reference.html#module_pbjs.setPriceGranularity for more details
	 */
	pbjs.setPriceGranularity = function (granularity) {
	  utils.logInfo('Invoking pbjs.setPriceGranularity', arguments);
	  if (!granularity) {
	    utils.logError('Prebid Error: no value passed to `setPriceGranularity()`');
	    return;
	  }
	  if (typeof granularity === 'string') {
	    bidmanager.setPriceGranularity(granularity);
	  } else if ((typeof granularity === 'undefined' ? 'undefined' : _typeof(granularity)) === 'object') {
	    if (!(0, _cpmBucketManager.isValidePriceConfig)(granularity)) {
	      utils.logError('Invalid custom price value passed to `setPriceGranularity()`');
	      return;
	    }
	    bidmanager.setCustomPriceBucket(granularity);
	    bidmanager.setPriceGranularity(CONSTANTS.GRANULARITY_OPTIONS.CUSTOM);
	    utils.logMessage('Using custom price granularity');
	  }
	};
	
	pbjs.enableSendAllBids = function () {
	  pbjs._sendAllBids = true;
	};
	
	pbjs.getAllWinningBids = function () {
	  return pbjs._winningBids;
	};
	
	/**
	 * Build master video tag from publishers adserver tag
	 * @param {string} adserverTag default url
	 * @param {object} options options for video tag
	 */
	pbjs.buildMasterVideoTagFromAdserverTag = function (adserverTag, options) {
	  utils.logInfo('Invoking pbjs.buildMasterVideoTagFromAdserverTag', arguments);
	  var urlComponents = (0, _url.parse)(adserverTag);
	
	  //return original adserverTag if no bids received
	  if (pbjs._bidsReceived.length === 0) {
	    return adserverTag;
	  }
	
	  var masterTag = '';
	  if (options.adserver.toLowerCase() === 'dfp') {
	    var dfpAdserverObj = adserver.dfpAdserver(options, urlComponents);
	    if (!dfpAdserverObj.verifyAdserverTag()) {
	      utils.logError('Invalid adserverTag, required google params are missing in query string');
	    }
	    dfpAdserverObj.appendQueryParams();
	    masterTag = (0, _url.format)(dfpAdserverObj.urlComponents);
	  } else {
	    utils.logError('Only DFP adserver is supported');
	    return;
	  }
	  return masterTag;
	};
	
	/**
	 * Set the order bidders are called in. If not set, the bidders are called in
	 * the order they are defined within the adUnit.bids array
	 * @param {string} order - Order to call bidders in. Currently the only possible value
	 * is 'random', which randomly shuffles the order
	 */
	pbjs.setBidderSequence = function (order) {
	  if (order === CONSTANTS.ORDER.RANDOM) {
	    adaptermanager.setBidderSequence(CONSTANTS.ORDER.RANDOM);
	  }
	};
	
	/**
	 * Get array of highest cpm bids for all adUnits, or highest cpm bid
	 * object for the given adUnit
	 * @param {string} adUnitCode - optional ad unit code
	 * @return {array} array containing highest cpm bid object(s)
	 */
	pbjs.getHighestCpmBids = function (adUnitCode) {
	  return targeting.getWinningBids(adUnitCode);
	};
	
	/**
	 * Set config for server to server header bidding
	 * @param {object} options - config object for s2s
	 */
	pbjs.setS2SConfig = function (options) {
	
	  if (!utils.contains(Object.keys(options), 'accountId')) {
	    utils.logError('accountId missing in Server to Server config');
	    return;
	  }
	
	  if (!utils.contains(Object.keys(options), 'bidders')) {
	    utils.logError('bidders missing in Server to Server config');
	    return;
	  }
	
	  var config = _extends({
	    enabled: false,
	    endpoint: CONSTANTS.S2S.DEFAULT_ENDPOINT,
	    timeout: 1000,
	    maxBids: 1,
	    adapter: 'prebidServer'
	  }, options);
	  adaptermanager.setS2SConfig(config);
	};
	
	pbjs.que.push(function () {
	  return (0, _secureCreatives.listenMessagesFromCreative)();
	});
	processQue();

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getGlobal = getGlobal;
	// if pbjs already exists in global document scope, use it, if not, create the object
	// global defination should happen BEFORE imports to avoid global undefined errors.
	window.pbjs = window.pbjs || {};
	window.pbjs.que = window.pbjs.que || [];
	
	function getGlobal() {
	  return window.pbjs;
	}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	exports.uniques = uniques;
	exports.flatten = flatten;
	exports.getBidRequest = getBidRequest;
	exports.getKeys = getKeys;
	exports.getValue = getValue;
	exports.getBidderCodes = getBidderCodes;
	exports.isGptPubadsDefined = isGptPubadsDefined;
	exports.getHighestCpm = getHighestCpm;
	exports.shuffle = shuffle;
	exports.adUnitsFilter = adUnitsFilter;
	exports.isSrcdocSupported = isSrcdocSupported;
	exports.cloneJson = cloneJson;
	exports.inIframe = inIframe;
	exports.isSafariBrowser = isSafariBrowser;
	exports.replaceAuctionPrice = replaceAuctionPrice;
	exports.getBidderRequest = getBidderRequest;
	var CONSTANTS = __webpack_require__(3);
	
	var objectType_object = 'object';
	var objectType_string = 'string';
	var objectType_number = 'number';
	
	var _loggingChecked = false;
	
	var t_Arr = 'Array';
	var t_Str = 'String';
	var t_Fn = 'Function';
	var t_Numb = 'Number';
	var toString = Object.prototype.toString;
	var infoLogger = null;
	try {
	  infoLogger = console.info.bind(window.console);
	} catch (e) {}
	
	/*
	 *   Substitutes into a string from a given map using the token
	 *   Usage
	 *   var str = 'text %%REPLACE%% this text with %%SOMETHING%%';
	 *   var map = {};
	 *   map['replace'] = 'it was subbed';
	 *   map['something'] = 'something else';
	 *   console.log(replaceTokenInString(str, map, '%%')); => "text it was subbed this text with something else"
	 */
	exports.replaceTokenInString = function (str, map, token) {
	  this._each(map, function (value, key) {
	    value = value === undefined ? '' : value;
	
	    var keyString = token + key.toUpperCase() + token;
	    var re = new RegExp(keyString, 'g');
	
	    str = str.replace(re, value);
	  });
	
	  return str;
	};
	
	/* utility method to get incremental integer starting from 1 */
	var getIncrementalInteger = function () {
	  var count = 0;
	  return function () {
	    count++;
	    return count;
	  };
	}();
	
	function _getUniqueIdentifierStr() {
	  return getIncrementalInteger() + Math.random().toString(16).substr(2);
	}
	
	//generate a random string (to be used as a dynamic JSONP callback)
	exports.getUniqueIdentifierStr = _getUniqueIdentifierStr;
	
	/**
	 * Returns a random v4 UUID of the form xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx,
	 * where each x is replaced with a random hexadecimal digit from 0 to f,
	 * and y is replaced with a random hexadecimal digit from 8 to b.
	 * https://gist.github.com/jed/982883 via node-uuid
	 */
	exports.generateUUID = function generateUUID(placeholder) {
	  return placeholder ? (placeholder ^ Math.random() * 16 >> placeholder / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, generateUUID);
	};
	
	exports.getBidIdParameter = function (key, paramsObj) {
	  if (paramsObj && paramsObj[key]) {
	    return paramsObj[key];
	  }
	
	  return '';
	};
	
	exports.tryAppendQueryString = function (existingUrl, key, value) {
	  if (value) {
	    return existingUrl += key + '=' + encodeURIComponent(value) + '&';
	  }
	
	  return existingUrl;
	};
	
	//parse a query string object passed in bid params
	//bid params should be an object such as {key: "value", key1 : "value1"}
	exports.parseQueryStringParameters = function (queryObj) {
	  var result = '';
	  for (var k in queryObj) {
	    if (queryObj.hasOwnProperty(k)) result += k + '=' + encodeURIComponent(queryObj[k]) + '&';
	  }
	
	  return result;
	};
	
	//transform an AdServer targeting bids into a query string to send to the adserver
	exports.transformAdServerTargetingObj = function (targeting) {
	  // we expect to receive targeting for a single slot at a time
	  if (targeting && Object.getOwnPropertyNames(targeting).length > 0) {
	
	    return getKeys(targeting).map(function (key) {
	      return key + '=' + encodeURIComponent(getValue(targeting, key));
	    }).join('&');
	  } else {
	    return '';
	  }
	};
	
	/**
	 * Parse a GPT-Style general size Array like `[[300, 250]]` or `"300x250,970x90"` into an array of sizes `["300x250"]` or '['300x250', '970x90']'
	 * @param  {array[array|number]} sizeObj Input array or double array [300,250] or [[300,250], [728,90]]
	 * @return {array[string]}  Array of strings like `["300x250"]` or `["300x250", "728x90"]`
	 */
	exports.parseSizesInput = function (sizeObj) {
	  var parsedSizes = [];
	
	  //if a string for now we can assume it is a single size, like "300x250"
	  if ((typeof sizeObj === 'undefined' ? 'undefined' : _typeof(sizeObj)) === objectType_string) {
	    //multiple sizes will be comma-separated
	    var sizes = sizeObj.split(',');
	
	    //regular expression to match strigns like 300x250
	    //start of line, at least 1 number, an "x" , then at least 1 number, and the then end of the line
	    var sizeRegex = /^(\d)+x(\d)+$/i;
	    if (sizes) {
	      for (var curSizePos in sizes) {
	        if (hasOwn(sizes, curSizePos) && sizes[curSizePos].match(sizeRegex)) {
	          parsedSizes.push(sizes[curSizePos]);
	        }
	      }
	    }
	  } else if ((typeof sizeObj === 'undefined' ? 'undefined' : _typeof(sizeObj)) === objectType_object) {
	    var sizeArrayLength = sizeObj.length;
	
	    //don't process empty array
	    if (sizeArrayLength > 0) {
	      //if we are a 2 item array of 2 numbers, we must be a SingleSize array
	      if (sizeArrayLength === 2 && _typeof(sizeObj[0]) === objectType_number && _typeof(sizeObj[1]) === objectType_number) {
	        parsedSizes.push(this.parseGPTSingleSizeArray(sizeObj));
	      } else {
	        //otherwise, we must be a MultiSize array
	        for (var i = 0; i < sizeArrayLength; i++) {
	          parsedSizes.push(this.parseGPTSingleSizeArray(sizeObj[i]));
	        }
	      }
	    }
	  }
	
	  return parsedSizes;
	};
	
	//parse a GPT style sigle size array, (i.e [300,250])
	//into an AppNexus style string, (i.e. 300x250)
	exports.parseGPTSingleSizeArray = function (singleSize) {
	  //if we aren't exactly 2 items in this array, it is invalid
	  if (this.isArray(singleSize) && singleSize.length === 2 && !isNaN(singleSize[0]) && !isNaN(singleSize[1])) {
	    return singleSize[0] + 'x' + singleSize[1];
	  }
	};
	
	exports.getTopWindowLocation = function () {
	  var location = void 0;
	  try {
	    location = window.top.location;
	  } catch (e) {
	    location = window.location;
	  }
	
	  return location;
	};
	
	exports.getTopWindowUrl = function () {
	  var href = void 0;
	  try {
	    href = this.getTopWindowLocation().href;
	  } catch (e) {
	    href = '';
	  }
	
	  return href;
	};
	
	exports.logWarn = function (msg) {
	  if (debugTurnedOn() && console.warn) {
	    console.warn('WARNING: ' + msg);
	  }
	};
	
	exports.logInfo = function (msg, args) {
	  if (debugTurnedOn() && hasConsoleLogger()) {
	    if (infoLogger) {
	      if (!args || args.length === 0) {
	        args = '';
	      }
	
	      infoLogger('INFO: ' + msg + (args === '' ? '' : ' : params : '), args);
	    }
	  }
	};
	
	exports.logMessage = function (msg) {
	  if (debugTurnedOn() && hasConsoleLogger()) {
	    console.log('MESSAGE: ' + msg);
	  }
	};
	
	function hasConsoleLogger() {
	  return window.console && window.console.log;
	}
	
	exports.hasConsoleLogger = hasConsoleLogger;
	
	var errLogFn = function (hasLogger) {
	  if (!hasLogger) return '';
	  return window.console.error ? 'error' : 'log';
	}(hasConsoleLogger());
	
	var debugTurnedOn = function debugTurnedOn() {
	  if (pbjs.logging === false && _loggingChecked === false) {
	    pbjs.logging = getParameterByName(CONSTANTS.DEBUG_MODE).toUpperCase() === 'TRUE';
	    _loggingChecked = true;
	  }
	
	  return !!pbjs.logging;
	};
	
	exports.debugTurnedOn = debugTurnedOn;
	
	exports.logError = function (msg, code, exception) {
	  var errCode = code || 'ERROR';
	  if (debugTurnedOn() && hasConsoleLogger()) {
	    console[errLogFn](console, errCode + ': ' + msg, exception || '');
	  }
	};
	
	exports.createInvisibleIframe = function _createInvisibleIframe() {
	  var f = document.createElement('iframe');
	  f.id = _getUniqueIdentifierStr();
	  f.height = 0;
	  f.width = 0;
	  f.border = '0px';
	  f.hspace = '0';
	  f.vspace = '0';
	  f.marginWidth = '0';
	  f.marginHeight = '0';
	  f.style.border = '0';
	  f.scrolling = 'no';
	  f.frameBorder = '0';
	  f.src = 'about:blank';
	  f.style.display = 'none';
	  return f;
	};
	
	/*
	 *   Check if a given parameter name exists in query string
	 *   and if it does return the value
	 */
	var getParameterByName = function getParameterByName(name) {
	  var regexS = '[\\?&]' + name + '=([^&#]*)';
	  var regex = new RegExp(regexS);
	  var results = regex.exec(window.location.search);
	  if (results === null) {
	    return '';
	  }
	
	  return decodeURIComponent(results[1].replace(/\+/g, ' '));
	};
	
	/**
	 * This function validates paramaters.
	 * @param  {object[string]} paramObj          [description]
	 * @param  {string[]} requiredParamsArr [description]
	 * @return {bool}                   Bool if paramaters are valid
	 */
	exports.hasValidBidRequest = function (paramObj, requiredParamsArr, adapter) {
	  var found = false;
	
	  function findParam(value, key) {
	    if (key === requiredParamsArr[i]) {
	      found = true;
	    }
	  }
	
	  for (var i = 0; i < requiredParamsArr.length; i++) {
	    found = false;
	
	    this._each(paramObj, findParam);
	
	    if (!found) {
	      this.logError('Params are missing for bid request. One of these required paramaters are missing: ' + requiredParamsArr, adapter);
	      return false;
	    }
	  }
	
	  return true;
	};
	
	// Handle addEventListener gracefully in older browsers
	exports.addEventHandler = function (element, event, func) {
	  if (element.addEventListener) {
	    element.addEventListener(event, func, true);
	  } else if (element.attachEvent) {
	    element.attachEvent('on' + event, func);
	  }
	};
	/**
	 * Return if the object is of the
	 * given type.
	 * @param {*} object to test
	 * @param {String} _t type string (e.g., Array)
	 * @return {Boolean} if object is of type _t
	 */
	exports.isA = function (object, _t) {
	  return toString.call(object) === '[object ' + _t + ']';
	};
	
	exports.isFn = function (object) {
	  return this.isA(object, t_Fn);
	};
	
	exports.isStr = function (object) {
	  return this.isA(object, t_Str);
	};
	
	exports.isArray = function (object) {
	  return this.isA(object, t_Arr);
	};
	
	exports.isNumber = function (object) {
	  return this.isA(object, t_Numb);
	};
	
	/**
	 * Return if the object is "empty";
	 * this includes falsey, no keys, or no items at indices
	 * @param {*} object object to test
	 * @return {Boolean} if object is empty
	 */
	exports.isEmpty = function (object) {
	  if (!object) return true;
	  if (this.isArray(object) || this.isStr(object)) {
	    return !(object.length > 0); // jshint ignore:line
	  }
	
	  for (var k in object) {
	    if (hasOwnProperty.call(object, k)) return false;
	  }
	
	  return true;
	};
	
	/**
	 * Return if string is empty, null, or undefined
	 * @param str string to test
	 * @returns {boolean} if string is empty
	 */
	exports.isEmptyStr = function (str) {
	  return this.isStr(str) && (!str || 0 === str.length);
	};
	
	/**
	 * Iterate object with the function
	 * falls back to es5 `forEach`
	 * @param {Array|Object} object
	 * @param {Function(value, key, object)} fn
	 */
	exports._each = function (object, fn) {
	  if (this.isEmpty(object)) return;
	  if (this.isFn(object.forEach)) return object.forEach(fn, this);
	
	  var k = 0;
	  var l = object.length;
	
	  if (l > 0) {
	    for (; k < l; k++) {
	      fn(object[k], k, object);
	    }
	  } else {
	    for (k in object) {
	      if (hasOwnProperty.call(object, k)) fn.call(this, object[k], k);
	    }
	  }
	};
	
	exports.contains = function (a, obj) {
	  if (this.isEmpty(a)) {
	    return false;
	  }
	
	  if (this.isFn(a.indexOf)) {
	    return a.indexOf(obj) !== -1;
	  }
	
	  var i = a.length;
	  while (i--) {
	    if (a[i] === obj) {
	      return true;
	    }
	  }
	
	  return false;
	};
	
	exports.indexOf = function () {
	  if (Array.prototype.indexOf) {
	    return Array.prototype.indexOf;
	  }
	
	  // ie8 no longer supported
	  //return polyfills.indexOf;
	}();
	
	/**
	 * Map an array or object into another array
	 * given a function
	 * @param {Array|Object} object
	 * @param {Function(value, key, object)} callback
	 * @return {Array}
	 */
	exports._map = function (object, callback) {
	  if (this.isEmpty(object)) return [];
	  if (this.isFn(object.map)) return object.map(callback);
	  var output = [];
	  this._each(object, function (value, key) {
	    output.push(callback(value, key, object));
	  });
	
	  return output;
	};
	
	var hasOwn = function hasOwn(objectToCheck, propertyToCheckFor) {
	  if (objectToCheck.hasOwnProperty) {
	    return objectToCheck.hasOwnProperty(propertyToCheckFor);
	  } else {
	    return typeof objectToCheck[propertyToCheckFor] !== 'undefined' && objectToCheck.constructor.prototype[propertyToCheckFor] !== objectToCheck[propertyToCheckFor];
	  }
	};
	
	var insertElement = function insertElement(elm) {
	  var elToAppend = document.getElementsByTagName('head');
	  try {
	    elToAppend = elToAppend.length ? elToAppend : document.getElementsByTagName('body');
	    if (elToAppend.length) {
	      elToAppend = elToAppend[0];
	      elToAppend.insertBefore(elm, elToAppend.firstChild);
	    }
	  } catch (e) {}
	};
	
	exports.insertPixel = function (url) {
	  var img = new Image();
	  img.id = this.getUniqueIdentifierStr();
	  img.src = url;
	  img.height = 0;
	  img.width = 0;
	  img.style.display = 'none';
	  img.onload = function () {
	    try {
	      this.parentNode.removeChild(this);
	    } catch (e) {}
	  };
	  insertElement(img);
	};
	
	/**
	 * Inserts empty iframe with the specified `url` for cookie sync
	 * @param  {string} url URL to be requested
	 * @param  {string} encodeUri boolean if URL should be encoded before inserted. Defaults to true
	 */
	exports.insertCookieSyncIframe = function (url, encodeUri) {
	  var iframeHtml = this.createTrackPixelIframeHtml(url, encodeUri);
	  var div = document.createElement('div');
	  div.innerHTML = iframeHtml;
	  var iframe = div.firstChild;
	  insertElement(iframe);
	};
	
	/**
	 * Creates a snippet of HTML that retrieves the specified `url`
	 * @param  {string} url URL to be requested
	 * @return {string}     HTML snippet that contains the img src = set to `url`
	 */
	exports.createTrackPixelHtml = function (url) {
	  if (!url) {
	    return '';
	  }
	
	  var escapedUrl = encodeURI(url);
	  var img = '<div style="position:absolute;left:0px;top:0px;visibility:hidden;">';
	  img += '<img src="' + escapedUrl + '"></div>';
	  return img;
	};
	
	/**
	 * Creates a snippet of Iframe HTML that retrieves the specified `url`
	 * @param  {string} url plain URL to be requested
	 * @param  {string} encodeUri boolean if URL should be encoded before inserted. Defaults to true
	 * @return {string}     HTML snippet that contains the iframe src = set to `url`
	 */
	exports.createTrackPixelIframeHtml = function (url) {
	  var encodeUri = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
	
	  if (!url) {
	    return '';
	  }
	  if (encodeUri) {
	    url = encodeURI(url);
	  }
	
	  return '<iframe frameborder="0" allowtransparency="true" marginheight="0" marginwidth="0" width="0" hspace="0" vspace="0" height="0" style="height:0p;width:0p;display:none;" scrolling="no" src="' + url + '"></iframe>';
	};
	
	/**
	 * Returns iframe document in a browser agnostic way
	 * @param  {object} iframe reference
	 * @return {object}        iframe `document` reference
	 */
	exports.getIframeDocument = function (iframe) {
	  if (!iframe) {
	    return;
	  }
	
	  var doc = void 0;
	  try {
	    if (iframe.contentWindow) {
	      doc = iframe.contentWindow.document;
	    } else if (iframe.contentDocument.document) {
	      doc = iframe.contentDocument.document;
	    } else {
	      doc = iframe.contentDocument;
	    }
	  } catch (e) {
	    this.logError('Cannot get iframe document', e);
	  }
	
	  return doc;
	};
	
	exports.getValueString = function (param, val, defaultValue) {
	  if (val === undefined || val === null) {
	    return defaultValue;
	  }
	  if (this.isStr(val)) {
	    return val;
	  }
	  if (this.isNumber(val)) {
	    return val.toString();
	  }
	  this.logWarn('Unsuported type for param: ' + param + ' required type: String');
	};
	
	function uniques(value, index, arry) {
	  return arry.indexOf(value) === index;
	}
	
	function flatten(a, b) {
	  return a.concat(b);
	}
	
	function getBidRequest(id) {
	  return pbjs._bidsRequested.map(function (bidSet) {
	    return bidSet.bids.find(function (bid) {
	      return bid.bidId === id;
	    });
	  }).find(function (bid) {
	    return bid;
	  });
	}
	
	function getKeys(obj) {
	  return Object.keys(obj);
	}
	
	function getValue(obj, key) {
	  return obj[key];
	}
	
	function getBidderCodes() {
	  var adUnits = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : pbjs.adUnits;
	
	  // this could memoize adUnits
	  return adUnits.map(function (unit) {
	    return unit.bids.map(function (bid) {
	      return bid.bidder;
	    }).reduce(flatten, []);
	  }).reduce(flatten).filter(uniques);
	}
	
	function isGptPubadsDefined() {
	  if (window.googletag && exports.isFn(window.googletag.pubads) && exports.isFn(window.googletag.pubads().getSlots)) {
	    return true;
	  }
	}
	
	function getHighestCpm(previous, current) {
	  if (previous.cpm === current.cpm) {
	    return previous.timeToRespond > current.timeToRespond ? current : previous;
	  }
	
	  return previous.cpm < current.cpm ? current : previous;
	}
	
	/**
	 * Fisher–Yates shuffle
	 * http://stackoverflow.com/a/6274398
	 * https://bost.ocks.org/mike/shuffle/
	 * istanbul ignore next
	 */
	function shuffle(array) {
	  var counter = array.length;
	
	  // while there are elements in the array
	  while (counter > 0) {
	    // pick a random index
	    var index = Math.floor(Math.random() * counter);
	
	    // decrease counter by 1
	    counter--;
	
	    // and swap the last element with it
	    var temp = array[counter];
	    array[counter] = array[index];
	    array[index] = temp;
	  }
	
	  return array;
	}
	
	function adUnitsFilter(filter, bid) {
	  return filter.includes(bid && bid.placementCode || bid && bid.adUnitCode);
	}
	
	/**
	 * Check if parent iframe of passed document supports content rendering via 'srcdoc' property
	 * @param {HTMLDocument} doc document to check support of 'srcdoc'
	 */
	function isSrcdocSupported(doc) {
	  //Firefox is excluded due to https://bugzilla.mozilla.org/show_bug.cgi?id=1265961
	  return doc.defaultView && doc.defaultView.frameElement && 'srcdoc' in doc.defaultView.frameElement && !/firefox/i.test(navigator.userAgent);
	}
	
	function cloneJson(obj) {
	  return JSON.parse(JSON.stringify(obj));
	}
	
	function inIframe() {
	  try {
	    return window.self !== window.top;
	  } catch (e) {
	    return true;
	  }
	}
	
	function isSafariBrowser() {
	  return (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)
	  );
	}
	
	function replaceAuctionPrice(str, cpm) {
	  if (!str) return;
	  return str.replace(/\$\{AUCTION_PRICE\}/g, cpm);
	}
	
	function getBidderRequest(bidder, adUnitCode) {
	  return pbjs._bidsRequested.find(function (request) {
	    return request.bids.filter(function (bid) {
	      return bid.bidder === bidder && bid.placementCode === adUnitCode;
	    }).length > 0;
	  }) || { start: null, requestId: null };
	}

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = {
		"JSON_MAPPING": {
			"PL_CODE": "code",
			"PL_SIZE": "sizes",
			"PL_BIDS": "bids",
			"BD_BIDDER": "bidder",
			"BD_ID": "paramsd",
			"BD_PL_ID": "placementId",
			"ADSERVER_TARGETING": "adserverTargeting",
			"BD_SETTING_STANDARD": "standard"
		},
		"REPO_AND_VERSION": "prebid_prebid_0.24.0-pre",
		"DEBUG_MODE": "pbjs_debug",
		"STATUS": {
			"GOOD": 1,
			"NO_BID": 2
		},
		"CB": {
			"TYPE": {
				"ALL_BIDS_BACK": "allRequestedBidsBack",
				"AD_UNIT_BIDS_BACK": "adUnitBidsBack",
				"BID_WON": "bidWon",
				"REQUEST_BIDS": "requestBids"
			}
		},
		"objectType_function": "function",
		"objectType_undefined": "undefined",
		"objectType_object": "object",
		"objectType_string": "string",
		"objectType_number": "number",
		"EVENTS": {
			"AUCTION_INIT": "auctionInit",
			"AUCTION_END": "auctionEnd",
			"BID_ADJUSTMENT": "bidAdjustment",
			"BID_TIMEOUT": "bidTimeout",
			"BID_REQUESTED": "bidRequested",
			"BID_RESPONSE": "bidResponse",
			"BID_WON": "bidWon",
			"SET_TARGETING": "setTargeting",
			"REQUEST_BIDS": "requestBids"
		},
		"EVENT_ID_PATHS": {
			"bidWon": "adUnitCode"
		},
		"ORDER": {
			"RANDOM": "random"
		},
		"GRANULARITY_OPTIONS": {
			"LOW": "low",
			"MEDIUM": "medium",
			"HIGH": "high",
			"AUTO": "auto",
			"DENSE": "dense",
			"CUSTOM": "custom"
		},
		"TARGETING_KEYS": [
			"hb_bidder",
			"hb_adid",
			"hb_pb",
			"hb_size",
			"hb_deal"
		],
		"S2S": {
			"DEFAULT_ENDPOINT": "https://prebid.adnxs.com/pbs/v1/auction"
		}
	};

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.hasNonVideoBidder = exports.videoAdUnit = undefined;
	
	var _adaptermanager = __webpack_require__(5);
	
	/**
	 * Helper functions for working with video-enabled adUnits
	 */
	var videoAdUnit = exports.videoAdUnit = function videoAdUnit(adUnit) {
	  return adUnit.mediaType === 'video';
	};
	var nonVideoBidder = function nonVideoBidder(bid) {
	  return !_adaptermanager.videoAdapters.includes(bid.bidder);
	};
	var hasNonVideoBidder = exports.hasNonVideoBidder = function hasNonVideoBidder(adUnit) {
	  return adUnit.bids.filter(nonVideoBidder).length;
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /** @module adaptermanger */
	
	var _utils = __webpack_require__(2);
	
	var _sizeMapping = __webpack_require__(6);
	
	var _baseAdapter = __webpack_require__(7);
	
	var utils = __webpack_require__(2);
	var CONSTANTS = __webpack_require__(3);
	var events = __webpack_require__(8);
	
	
	var _bidderRegistry = {};
	exports.bidderRegistry = _bidderRegistry;
	
	//create s2s settings objectType_function
	var _s2sConfig = {};
	var _analyticsRegistry = {};
	var _bidderSequence = null;
	
	function getBids(_ref) {
	    var bidderCode = _ref.bidderCode,
	        requestId = _ref.requestId,
	        bidderRequestId = _ref.bidderRequestId,
	        adUnits = _ref.adUnits;
	
	    return adUnits.map(function (adUnit) {
	        return adUnit.bids.filter(function (bid) {
	            return bid.bidder === bidderCode;
	        }).map(function (bid) {
	            var sizes = adUnit.sizes;
	            if (adUnit.sizeMapping) {
	                var sizeMapping = (0, _sizeMapping.mapSizes)(adUnit);
	                if (sizeMapping === '') {
	                    return '';
	                }
	                sizes = sizeMapping;
	            }
	            return _extends({}, bid, {
	                placementCode: adUnit.code,
	                mediaType: adUnit.mediaType,
	                transactionId: adUnit.transactionId,
	                sizes: sizes,
	                bidId: bid.bid_id || utils.getUniqueIdentifierStr(),
	                bidderRequestId: bidderRequestId,
	                requestId: requestId
	            });
	        });
	    }).reduce(_utils.flatten, []).filter(function (val) {
	        return val !== '';
	    });
	}
	
	exports.callBids = function (_ref2) {
	    var adUnits = _ref2.adUnits,
	        cbTimeout = _ref2.cbTimeout;
	
	    var requestId = utils.generateUUID();
	    var auctionStart = Date.now();
	
	    var auctionInit = {
	        timestamp: auctionStart,
	        requestId: requestId
	    };
	    events.emit(CONSTANTS.EVENTS.AUCTION_INIT, auctionInit);
	
	    var bidderCodes = (0, _utils.getBidderCodes)(adUnits);
	    if (_bidderSequence === CONSTANTS.ORDER.RANDOM) {
	        bidderCodes = (0, _utils.shuffle)(bidderCodes);
	    }
	
	    if (_s2sConfig.enabled) {
	        //these are called on the s2s adapter
	        var adaptersServerSide = _s2sConfig.bidders;
	
	        //don't call these client side
	        bidderCodes = bidderCodes.filter(function (elm) {
	            return !adaptersServerSide.includes(elm);
	        });
	        var adUnitsCopy = utils.cloneJson(adUnits);
	
	        //filter out client side bids
	        adUnitsCopy.forEach(function (adUnit) {
	            if (adUnit.sizeMapping) {
	                adUnit.sizes = (0, _sizeMapping.mapSizes)(adUnit);
	                delete adUnit.sizeMapping;
	            }
	            adUnit.sizes = transformHeightWidth(adUnit);
	            adUnit.bids = adUnit.bids.filter(function (bid) {
	                return adaptersServerSide.includes(bid.bidder);
	            }).map(function (bid) {
	                bid.bid_id = utils.getUniqueIdentifierStr();
	                return bid;
	            });
	        });
	
	        var tid = utils.generateUUID();
	        adaptersServerSide.forEach(function (bidderCode) {
	            var bidderRequestId = utils.getUniqueIdentifierStr();
	            var bidderRequest = {
	                bidderCode: bidderCode,
	                requestId: requestId,
	                bidderRequestId: bidderRequestId,
	                tid: tid,
	                bids: getBids({ bidderCode: bidderCode, requestId: requestId, bidderRequestId: bidderRequestId, 'adUnits': adUnitsCopy }),
	                start: new Date().getTime(),
	                auctionStart: auctionStart,
	                timeout: _s2sConfig.timeout
	            };
	            //Pushing server side bidder
	            pbjs._bidsRequested.push(bidderRequest);
	        });
	
	        var s2sBidRequest = { tid: tid, 'ad_units': adUnitsCopy };
	        var s2sAdapter = _bidderRegistry[_s2sConfig.adapter]; //jshint ignore:line
	        utils.logMessage('CALLING S2S HEADER BIDDERS ==== ' + adaptersServerSide.join(','));
	        s2sAdapter.setConfig(_s2sConfig);
	        s2sAdapter.callBids(s2sBidRequest);
	    }
	
	    bidderCodes.forEach(function (bidderCode) {
	        var adapter = _bidderRegistry[bidderCode];
	        if (adapter) {
	            var bidderRequestId = utils.getUniqueIdentifierStr();
	            var bidderRequest = {
	                bidderCode: bidderCode,
	                requestId: requestId,
	                bidderRequestId: bidderRequestId,
	                bids: getBids({ bidderCode: bidderCode, requestId: requestId, bidderRequestId: bidderRequestId, adUnits: adUnits }),
	                start: new Date().getTime(),
	                auctionStart: auctionStart,
	                timeout: cbTimeout
	            };
	            if (bidderRequest.bids && bidderRequest.bids.length !== 0) {
	                utils.logMessage('CALLING BIDDER ======= ' + bidderCode);
	                pbjs._bidsRequested.push(bidderRequest);
	                events.emit(CONSTANTS.EVENTS.BID_REQUESTED, bidderRequest);
	                adapter.callBids(bidderRequest);
	            }
	        } else {
	            utils.logError('Adapter trying to be called which does not exist: ' + bidderCode + ' adaptermanager.callBids');
	        }
	    });
	};
	
	function transformHeightWidth(adUnit) {
	    var sizesObj = [];
	    var sizes = utils.parseSizesInput(adUnit.sizes);
	    sizes.forEach(function (size) {
	        var heightWidth = size.split('x');
	        var sizeObj = {
	            'w': parseInt(heightWidth[0]),
	            'h': parseInt(heightWidth[1])
	        };
	        sizesObj.push(sizeObj);
	    });
	    return sizesObj;
	}
	
	exports.registerBidAdapter = function (bidAdaptor, bidderCode) {
	    if (bidAdaptor && bidderCode) {
	
	        if (_typeof(bidAdaptor.callBids) === CONSTANTS.objectType_function) {
	            _bidderRegistry[bidderCode] = bidAdaptor;
	        } else {
	            utils.logError('Bidder adaptor error for bidder code: ' + bidderCode + 'bidder must implement a callBids() function');
	        }
	    } else {
	        utils.logError('bidAdaptor or bidderCode not specified');
	    }
	};
	
	exports.aliasBidAdapter = function (bidderCode, alias) {
	    var existingAlias = _bidderRegistry[alias];
	
	    if ((typeof existingAlias === 'undefined' ? 'undefined' : _typeof(existingAlias)) === CONSTANTS.objectType_undefined) {
	        var bidAdaptor = _bidderRegistry[bidderCode];
	
	        if ((typeof bidAdaptor === 'undefined' ? 'undefined' : _typeof(bidAdaptor)) === CONSTANTS.objectType_undefined) {
	            utils.logError('bidderCode "' + bidderCode + '" is not an existing bidder.', 'adaptermanager.aliasBidAdapter');
	        } else {
	            try {
	                var newAdapter = null;
	                if (bidAdaptor instanceof _baseAdapter.BaseAdapter) {
	                    //newAdapter = new bidAdaptor.constructor(alias);
	                    utils.logError(bidderCode + ' bidder does not currently support aliasing.', 'adaptermanager.aliasBidAdapter');
	                } else {
	                    newAdapter = bidAdaptor.createNew();
	                    newAdapter.setBidderCode(alias);
	                    this.registerBidAdapter(newAdapter, alias);
	                }
	            } catch (e) {
	                utils.logError(bidderCode + ' bidder does not currently support aliasing.', 'adaptermanager.aliasBidAdapter');
	            }
	        }
	    } else {
	        utils.logMessage('alias name "' + alias + '" has been already specified.');
	    }
	};
	
	exports.registerAnalyticsAdapter = function (_ref3) {
	    var adapter = _ref3.adapter,
	        code = _ref3.code;
	
	    if (adapter && code) {
	
	        if (_typeof(adapter.enableAnalytics) === CONSTANTS.objectType_function) {
	            adapter.code = code;
	            _analyticsRegistry[code] = adapter;
	        } else {
	            utils.logError('Prebid Error: Analytics adaptor error for analytics "' + code + '"\n        analytics adapter must implement an enableAnalytics() function');
	        }
	    } else {
	        utils.logError('Prebid Error: analyticsAdapter or analyticsCode not specified');
	    }
	};
	
	exports.enableAnalytics = function (config) {
	    if (!utils.isArray(config)) {
	        config = [config];
	    }
	
	    utils._each(config, function (adapterConfig) {
	        var adapter = _analyticsRegistry[adapterConfig.provider];
	        if (adapter) {
	            adapter.enableAnalytics(adapterConfig);
	        } else {
	            utils.logError('Prebid Error: no analytics adapter found in registry for\n        ' + adapterConfig.provider + '.');
	        }
	    });
	};
	
	exports.setBidderSequence = function (order) {
	    _bidderSequence = order;
	};
	
	exports.setS2SConfig = function (config) {
	    _s2sConfig = config;
	};
	
	var AardvarkAdapter = __webpack_require__(9);
	exports.registerBidAdapter(new AardvarkAdapter(), 'aardvark');
	var AdbladeAdapter = __webpack_require__(15);
	exports.registerBidAdapter(new AdbladeAdapter(), 'adblade');
	var AdbundAdapter = __webpack_require__(16);
	exports.registerBidAdapter(new AdbundAdapter(), 'adbund');
	var AdbutlerAdapter = __webpack_require__(17);
	exports.registerBidAdapter(new AdbutlerAdapter(), 'adbutler');
	var AdequantAdapter = __webpack_require__(18);
	exports.registerBidAdapter(new AdequantAdapter(), 'adequant');
	var AdformAdapter = __webpack_require__(19);
	exports.registerBidAdapter(new AdformAdapter(), 'adform');
	var AdkernelAdapter = __webpack_require__(20);
	exports.registerBidAdapter(new AdkernelAdapter(), 'adkernel');
	var AdmediaAdapter = __webpack_require__(23);
	exports.registerBidAdapter(new AdmediaAdapter(), 'admedia');
	var BidfluenceAdapter = __webpack_require__(24);
	exports.registerBidAdapter(new BidfluenceAdapter(), 'bidfluence');
	var VertamediaAdapter = __webpack_require__(25);
	exports.registerBidAdapter(new VertamediaAdapter(), 'vertamedia');
	var AolAdapter = __webpack_require__(26);
	exports.registerBidAdapter(new AolAdapter(), 'aol');
	var AppnexusAdapter = __webpack_require__(27);
	exports.registerBidAdapter(new AppnexusAdapter(), 'appnexus');
	var AppnexusAstAdapter = __webpack_require__(28);
	exports.registerBidAdapter(new AppnexusAstAdapter(), 'appnexusAst');
	var BeachfrontAdapter = __webpack_require__(30);
	exports.registerBidAdapter(new BeachfrontAdapter(), 'beachfront');
	var AudienceNetworkAdapter = __webpack_require__(31);
	exports.registerBidAdapter(new AudienceNetworkAdapter(), 'audienceNetwork');
	var ConversantAdapter = __webpack_require__(32);
	exports.registerBidAdapter(new ConversantAdapter(), 'conversant');
	var DistrictmDMXAdapter = __webpack_require__(33);
	exports.registerBidAdapter(new DistrictmDMXAdapter(), 'districtmDMX');
	var FidelityAdapter = __webpack_require__(34);
	exports.registerBidAdapter(new FidelityAdapter(), 'fidelity');
	var GumgumAdapter = __webpack_require__(35);
	exports.registerBidAdapter(new GumgumAdapter(), 'gumgum');
	var HiromediaAdapter = __webpack_require__(36);
	exports.registerBidAdapter(new HiromediaAdapter(), 'hiromedia');
	var IndexExchangeAdapter = __webpack_require__(37);
	exports.registerBidAdapter(new IndexExchangeAdapter(), 'indexExchange');
	var InnityAdapter = __webpack_require__(38);
	exports.registerBidAdapter(new InnityAdapter(), 'innity');
	var KruxlinkAdapter = __webpack_require__(39);
	exports.registerBidAdapter(new KruxlinkAdapter(), 'kruxlink');
	var GetintentAdapter = __webpack_require__(40);
	exports.registerBidAdapter(new GetintentAdapter(), 'getintent');
	var InneractiveAdapter = __webpack_require__(41);
	exports.registerBidAdapter(new InneractiveAdapter(), 'inneractive');
	var KomoonaAdapter = __webpack_require__(42);
	exports.registerBidAdapter(new KomoonaAdapter(), 'komoona');
	var LifestreetAdapter = __webpack_require__(43);
	exports.registerBidAdapter(new LifestreetAdapter(), 'lifestreet');
	var MantisAdapter = __webpack_require__(44);
	exports.registerBidAdapter(new MantisAdapter(), 'mantis');
	var OpenxAdapter = __webpack_require__(45);
	exports.registerBidAdapter(new OpenxAdapter(), 'openx');
	var PiximediaAdapter = __webpack_require__(46);
	exports.registerBidAdapter(new PiximediaAdapter(), 'piximedia');
	var PubmaticAdapter = __webpack_require__(47);
	exports.registerBidAdapter(new PubmaticAdapter(), 'pubmatic');
	var PubgearsAdapter = __webpack_require__(48);
	exports.registerBidAdapter(new PubgearsAdapter(), 'pubgears');
	var PulsepointAdapter = __webpack_require__(49);
	exports.registerBidAdapter(new PulsepointAdapter(), 'pulsepoint');
	var PulsepointLiteAdapter = __webpack_require__(50);
	exports.registerBidAdapter(new PulsepointLiteAdapter(), 'pulsepointLite');
	var QuantcastAdapter = __webpack_require__(51);
	exports.registerBidAdapter(new QuantcastAdapter(), 'quantcast');
	var RhythmoneAdapter = __webpack_require__(52);
	exports.registerBidAdapter(new RhythmoneAdapter(), 'rhythmone');
	var RubiconAdapter = __webpack_require__(53);
	exports.registerBidAdapter(new RubiconAdapter(), 'rubicon');
	var SmartyadsAdapter = __webpack_require__(54);
	exports.registerBidAdapter(new SmartyadsAdapter(), 'smartyads');
	var HuddledmassesAdapter = __webpack_require__(55);
	exports.registerBidAdapter(new HuddledmassesAdapter(), 'huddledmasses');
	var SmartadserverAdapter = __webpack_require__(56);
	exports.registerBidAdapter(new SmartadserverAdapter(), 'smartadserver');
	var SekindoUMAdapter = __webpack_require__(57);
	exports.registerBidAdapter(new SekindoUMAdapter(), 'sekindoUM');
	var ServerbidAdapter = __webpack_require__(58);
	exports.registerBidAdapter(new ServerbidAdapter(), 'serverbid');
	var SonobiAdapter = __webpack_require__(59);
	exports.registerBidAdapter(new SonobiAdapter(), 'sonobi');
	var SovrnAdapter = __webpack_require__(60);
	exports.registerBidAdapter(new SovrnAdapter(), 'sovrn');
	var SpringserveAdapter = __webpack_require__(61);
	exports.registerBidAdapter(new SpringserveAdapter(), 'springserve');
	var ThoughtleadrAdapter = __webpack_require__(62);
	exports.registerBidAdapter(new ThoughtleadrAdapter(), 'thoughtleadr');
	var StickyadstvAdapter = __webpack_require__(63);
	exports.registerBidAdapter(new StickyadstvAdapter(), 'stickyadstv');
	var TripleliftAdapter = __webpack_require__(64);
	exports.registerBidAdapter(new TripleliftAdapter(), 'triplelift');
	var TwengaAdapter = __webpack_require__(65);
	exports.registerBidAdapter(new TwengaAdapter(), 'twenga');
	var YieldbotAdapter = __webpack_require__(66);
	exports.registerBidAdapter(new YieldbotAdapter(), 'yieldbot');
	var NginadAdapter = __webpack_require__(67);
	exports.registerBidAdapter(new NginadAdapter(), 'nginad');
	var BrightcomAdapter = __webpack_require__(68);
	exports.registerBidAdapter(new BrightcomAdapter(), 'brightcom');
	var WideorbitAdapter = __webpack_require__(69);
	exports.registerBidAdapter(new WideorbitAdapter(), 'wideorbit');
	var JcmAdapter = __webpack_require__(70);
	exports.registerBidAdapter(new JcmAdapter(), 'jcm');
	var UnderdogmediaAdapter = __webpack_require__(71);
	exports.registerBidAdapter(new UnderdogmediaAdapter(), 'underdogmedia');
	var MemeglobalAdapter = __webpack_require__(72);
	exports.registerBidAdapter(new MemeglobalAdapter(), 'memeglobal');
	var CriteoAdapter = __webpack_require__(73);
	exports.registerBidAdapter(new CriteoAdapter(), 'criteo');
	var CentroAdapter = __webpack_require__(74);
	exports.registerBidAdapter(new CentroAdapter(), 'centro');
	var XhbAdapter = __webpack_require__(75);
	exports.registerBidAdapter(new XhbAdapter(), 'xhb');
	var SharethroughAdapter = __webpack_require__(76);
	exports.registerBidAdapter(new SharethroughAdapter(), 'sharethrough');
	var RoxotAdapter = __webpack_require__(77);
	exports.registerBidAdapter(new RoxotAdapter(), 'roxot');
	var VertozAdapter = __webpack_require__(78);
	exports.registerBidAdapter(new VertozAdapter(), 'vertoz');
	var WidespaceAdapter = __webpack_require__(79);
	exports.registerBidAdapter(new WidespaceAdapter(), 'widespace');
	var AdmixerAdapter = __webpack_require__(80);
	exports.registerBidAdapter(new AdmixerAdapter(), 'admixer');
	var AtomxAdapter = __webpack_require__(81);
	exports.registerBidAdapter(new AtomxAdapter(), 'atomx');
	var TapsenseAdapter = __webpack_require__(82);
	exports.registerBidAdapter(new TapsenseAdapter(), 'tapsense');
	var TrionAdapter = __webpack_require__(83);
	exports.registerBidAdapter(new TrionAdapter(), 'trion');
	var PrebidServerAdapter = __webpack_require__(84);
	exports.registerBidAdapter(new PrebidServerAdapter(), 'prebidServer');
	var AdsupplyAdapter = __webpack_require__(86);
	exports.registerBidAdapter(new AdsupplyAdapter(), 'adsupply');
	exports.aliasBidAdapter('appnexus', 'brealtime');
	exports.aliasBidAdapter('appnexus', 'pagescience');
	exports.aliasBidAdapter('appnexus', 'defymedia');
	exports.aliasBidAdapter('appnexus', 'gourmetads');
	exports.aliasBidAdapter('appnexus', 'matomy');
	exports.aliasBidAdapter('rubicon', 'rubiconLite');
	exports.aliasBidAdapter('appnexus', 'featureforward');
	exports.aliasBidAdapter('appnexus', 'oftmedia');
	exports.aliasBidAdapter('adkernel', 'headbidding');
	exports.aliasBidAdapter('stickyadstv', 'freewheel-ssp');
	exports.videoAdapters = ["appnexusAst", "vertamedia", "beachfront", "rubicon", "getintent", "rhythmone"];
	
	null;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.setWindow = exports.getScreenWidth = exports.mapSizes = undefined;
	
	var _utils = __webpack_require__(2);
	
	var utils = _interopRequireWildcard(_utils);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }
	
	var _win = void 0; /**
	                    * @module sizeMapping
	                    */
	
	
	function mapSizes(adUnit) {
	  if (!isSizeMappingValid(adUnit.sizeMapping)) {
	    return adUnit.sizes;
	  }
	  var width = getScreenWidth();
	  if (!width) {
	    //size not detected - get largest value set for desktop
	    var _mapping = adUnit.sizeMapping.reduce(function (prev, curr) {
	      return prev.minWidth < curr.minWidth ? curr : prev;
	    });
	    if (_mapping.sizes && _mapping.sizes.length) {
	      return _mapping.sizes;
	    }
	    return adUnit.sizes;
	  }
	  var sizes = '';
	  var mapping = adUnit.sizeMapping.find(function (sizeMapping) {
	    return width > sizeMapping.minWidth;
	  });
	  if (mapping && mapping.sizes && mapping.sizes.length) {
	    sizes = mapping.sizes;
	    utils.logMessage('AdUnit : ' + adUnit.code + ' resized based on device width to : ' + sizes);
	  } else {
	    utils.logMessage('AdUnit : ' + adUnit.code + ' not mapped to any sizes for device width. This request will be suppressed.');
	  }
	  return sizes;
	}
	
	function isSizeMappingValid(sizeMapping) {
	  if (utils.isArray(sizeMapping) && sizeMapping.length > 0) {
	    return true;
	  }
	  utils.logInfo('No size mapping defined');
	  return false;
	}
	
	function getScreenWidth(win) {
	  var w = win || _win || window;
	  var d = w.document;
	
	  if (w.innerWidth) {
	    return w.innerWidth;
	  } else if (d.body.clientWidth) {
	    return d.body.clientWidth;
	  } else if (d.documentElement.clientWidth) {
	    return d.documentElement.clientWidth;
	  }
	  return 0;
	}
	
	function setWindow(win) {
	  _win = win;
	}
	
	exports.mapSizes = mapSizes;
	exports.getScreenWidth = getScreenWidth;
	exports.setWindow = setWindow;

/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var BaseAdapter = exports.BaseAdapter = function () {
	  function BaseAdapter(code) {
	    _classCallCheck(this, BaseAdapter);
	
	    this.code = code;
	  }
	
	  _createClass(BaseAdapter, [{
	    key: 'getCode',
	    value: function getCode() {
	      return this.code;
	    }
	  }, {
	    key: 'setCode',
	    value: function setCode(code) {
	      this.code = code;
	    }
	  }, {
	    key: 'callBids',
	    value: function callBids() {
	      throw 'adapter implementation must override callBids method';
	    }
	  }]);

	  return BaseAdapter;
	}();

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	/**
	 * events.js
	 */
	var utils = __webpack_require__(2);
	var CONSTANTS = __webpack_require__(3);
	var slice = Array.prototype.slice;
	var push = Array.prototype.push;
	
	//define entire events
	//var allEvents = ['bidRequested','bidResponse','bidWon','bidTimeout'];
	var allEvents = utils._map(CONSTANTS.EVENTS, function (v) {
	  return v;
	});
	
	var idPaths = CONSTANTS.EVENT_ID_PATHS;
	
	//keep a record of all events fired
	var eventsFired = [];
	
	module.exports = function () {
	
	  var _handlers = {};
	  var _public = {};
	
	  /**
	   *
	   * @param {String} eventString  The name of the event.
	   * @param {Array} args  The payload emitted with the event.
	   * @private
	   */
	  function _dispatch(eventString, args) {
	    utils.logMessage('Emitting event for: ' + eventString);
	
	    var eventPayload = args[0] || {};
	    var idPath = idPaths[eventString];
	    var key = eventPayload[idPath];
	    var event = _handlers[eventString] || { que: [] };
	    var eventKeys = utils._map(event, function (v, k) {
	      return k;
	    });
	
	    var callbacks = [];
	
	    //record the event:
	    eventsFired.push({
	      eventType: eventString,
	      args: eventPayload,
	      id: key
	    });
	
	    /** Push each specific callback to the `callbacks` array.
	     * If the `event` map has a key that matches the value of the
	     * event payload id path, e.g. `eventPayload[idPath]`, then apply
	     * each function in the `que` array as an argument to push to the
	     * `callbacks` array
	     * */
	    if (key && utils.contains(eventKeys, key)) {
	      push.apply(callbacks, event[key].que);
	    }
	
	    /** Push each general callback to the `callbacks` array. */
	    push.apply(callbacks, event.que);
	
	    /** call each of the callbacks */
	    utils._each(callbacks, function (fn) {
	      if (!fn) return;
	      try {
	        fn.apply(null, args);
	      } catch (e) {
	        utils.logError('Error executing handler:', 'events.js', e);
	      }
	    });
	  }
	
	  function _checkAvailableEvent(event) {
	    return utils.contains(allEvents, event);
	  }
	
	  _public.on = function (eventString, handler, id) {
	
	    //check whether available event or not
	    if (_checkAvailableEvent(eventString)) {
	      var event = _handlers[eventString] || { que: [] };
	
	      if (id) {
	        event[id] = event[id] || { que: [] };
	        event[id].que.push(handler);
	      } else {
	        event.que.push(handler);
	      }
	
	      _handlers[eventString] = event;
	    } else {
	      utils.logError('Wrong event name : ' + eventString + ' Valid event names :' + allEvents);
	    }
	  };
	
	  _public.emit = function (event) {
	    var args = slice.call(arguments, 1);
	    _dispatch(event, args);
	  };
	
	  _public.off = function (eventString, handler, id) {
	    var event = _handlers[eventString];
	
	    if (utils.isEmpty(event) || utils.isEmpty(event.que) && utils.isEmpty(event[id])) {
	      return;
	    }
	
	    if (id && (utils.isEmpty(event[id]) || utils.isEmpty(event[id].que))) {
	      return;
	    }
	
	    if (id) {
	      utils._each(event[id].que, function (_handler) {
	        var que = event[id].que;
	        if (_handler === handler) {
	          que.splice(utils.indexOf.call(que, _handler), 1);
	        }
	      });
	    } else {
	      utils._each(event.que, function (_handler) {
	        var que = event.que;
	        if (_handler === handler) {
	          que.splice(utils.indexOf.call(que, _handler), 1);
	        }
	      });
	    }
	
	    _handlers[eventString] = event;
	  };
	
	  _public.get = function () {
	    return _handlers;
	  };
	
	  /**
	   * This method can return a copy of all the events fired
	   * @return {Array} array of events fired
	   */
	  _public.getEvents = function () {
	    var arrayCopy = [];
	    utils._each(eventsFired, function (value) {
	      var newProp = _extends({}, value);
	      arrayCopy.push(newProp);
	    });
	
	    return arrayCopy;
	  };
	
	  return _public;
	}();

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	/*
	 * Adapter for requesting bids from RTK Aardvark
	 * To request an RTK Aardvark Header bidding account
	 * or for additional integration support please contact sales@rtk.io
	 */
	
	var utils = __webpack_require__(2);
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var adloader = __webpack_require__(13);
	var adapter = __webpack_require__(14);
	var constants = __webpack_require__(3);
	
	var AARDVARK_CALLBACK_NAME = 'aardvarkResponse',
	    AARDVARK_REQUESTS_MAP = 'aardvarkRequests',
	    AARDVARK_BIDDER_CODE = 'aardvark',
	    DEFAULT_REFERRER = 'thor.rtk.io',
	    DEFAULT_ENDPOINT = 'thor.rtk.io',
	    endpoint = DEFAULT_ENDPOINT,
	    requestBids = function requestBids(bidderCode, callbackName, bidReqs) {
	  var ref = utils.getTopWindowLocation(),
	      ai = '',
	      scs = [],
	      bidIds = [];
	
	  ref = ref ? ref.host : DEFAULT_REFERRER;
	
	  for (var i = 0, l = bidReqs.length, bid, _ai, _sc, _endpoint; i < l; i += 1) {
	    bid = bidReqs[i];
	    _ai = utils.getBidIdParameter('ai', bid.params);
	    _sc = utils.getBidIdParameter('sc', bid.params);
	    if (!_ai || !_ai.length || !_sc || !_sc.length) continue;
	
	    _endpoint = utils.getBidIdParameter('host', bid.params);
	    if (_endpoint) endpoint = _endpoint;
	
	    if (!ai.length) ai = _ai;
	    if (_sc) scs.push(_sc);
	
	    bidIds.push(_sc + "=" + bid.bidId);
	
	    // Create the bidIdsMap for easier mapping back later
	    pbjs[AARDVARK_REQUESTS_MAP][bidderCode][bid.bidId] = bid;
	  }
	
	  if (!ai.length || !scs.length) return utils.logWarn("Bad bid request params given for adapter $" + bidderCode + " (" + AARDVARK_BIDDER_CODE + ")");
	
	  adloader.loadScript(['//' + endpoint + '/', ai, '/', scs.join('_'), '/aardvark/?jsonp=pbjs.', callbackName, '&rtkreferer=', ref, '&', bidIds.join('&')].join(''));
	},
	    registerBidResponse = function registerBidResponse(bidderCode, rawBidResponse) {
	  if (rawBidResponse.error) return utils.logWarn("Aardvark bid received with an error, ignoring... [" + rawBidResponse.error + "]");
	
	  if (!rawBidResponse.cid) return utils.logWarn("Aardvark bid received without a callback id, ignoring...");
	
	  var bidObj = pbjs[AARDVARK_REQUESTS_MAP][bidderCode][rawBidResponse.cid];
	  if (!bidObj) return utils.logWarn("Aardvark request not found: " + rawBidResponse.cid);
	
	  if (bidObj.params.sc !== rawBidResponse.id) return utils.logWarn("Aardvark bid received with a non matching shortcode " + rawBidResponse.id + " instead of " + bidObj.params.sc);
	
	  var bidResponse = bidfactory.createBid(constants.STATUS.GOOD, bidObj);
	  bidResponse.bidderCode = bidObj.bidder;
	  bidResponse.cpm = rawBidResponse.cpm;
	  bidResponse.ad = rawBidResponse.adm + utils.createTrackPixelHtml(decodeURIComponent(rawBidResponse.nurl));
	  bidResponse.width = bidObj.sizes[0][0];
	  bidResponse.height = bidObj.sizes[0][1];
	
	  bidmanager.addBidResponse(bidObj.placementCode, bidResponse);
	  pbjs[AARDVARK_REQUESTS_MAP][bidderCode][rawBidResponse.cid].responded = true;
	},
	    registerAardvarkCallback = function registerAardvarkCallback(bidderCode, callbackName) {
	  pbjs[callbackName] = function (rtkResponseObj) {
	
	    rtkResponseObj.forEach(function (bidResponse) {
	      registerBidResponse(bidderCode, bidResponse);
	    });
	
	    for (var bidRequestId in pbjs[AARDVARK_REQUESTS_MAP][bidderCode]) {
	      if (pbjs[AARDVARK_REQUESTS_MAP][bidderCode].hasOwnProperty(bidRequestId)) {
	        var bidRequest = pbjs[AARDVARK_REQUESTS_MAP][bidderCode][bidRequestId];
	        if (!bidRequest.responded) {
	          var bidResponse = bidfactory.createBid(constants.STATUS.NO_BID, bidRequest);
	          bidResponse.bidderCode = bidRequest.bidder;
	          bidmanager.addBidResponse(bidRequest.placementCode, bidResponse);
	        }
	      }
	    }
	  };
	},
	    AardvarkAdapter = function AardvarkAdapter() {
	  var baseAdapter = adapter.createNew(AARDVARK_BIDDER_CODE);
	
	  pbjs[AARDVARK_REQUESTS_MAP] = pbjs[AARDVARK_REQUESTS_MAP] || {};
	
	  baseAdapter.callBids = function (params) {
	    var bidderCode = baseAdapter.getBidderCode(),
	        callbackName = AARDVARK_CALLBACK_NAME;
	
	    if (bidderCode !== AARDVARK_BIDDER_CODE) callbackName = [AARDVARK_CALLBACK_NAME, bidderCode].join('_');
	
	    pbjs[AARDVARK_REQUESTS_MAP][bidderCode] = {};
	
	    registerAardvarkCallback(bidderCode, callbackName);
	
	    return requestBids(bidderCode, callbackName, params.bids || []);
	  };
	
	  return {
	    callBids: baseAdapter.callBids,
	    setBidderCode: baseAdapter.setBidderCode,
	    createNew: exports.createNew
	  };
	};
	
	exports.createNew = function () {
	  return new AardvarkAdapter();
	};
	
	module.exports = AardvarkAdapter;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(2);
	
	/**
	 Required paramaters
	 bidderCode,
	 height,
	 width,
	 statusCode
	 Optional paramaters
	 adId,
	 cpm,
	 ad,
	 adUrl,
	 dealId,
	 priceKeyString;
	 */
	function Bid(statusCode, bidRequest) {
	  var _bidId = bidRequest && bidRequest.bidId || utils.getUniqueIdentifierStr();
	  var _statusCode = statusCode || 0;
	
	  this.bidderCode = '';
	  this.width = 0;
	  this.height = 0;
	  this.statusMessage = _getStatus();
	  this.adId = _bidId;
	
	  function _getStatus() {
	    switch (_statusCode) {
	      case 0:
	        return 'Pending';
	      case 1:
	        return 'Bid available';
	      case 2:
	        return 'Bid returned empty or error response';
	      case 3:
	        return 'Bid timed out';
	    }
	  }
	
	  this.getStatusCode = function () {
	    return _statusCode;
	  };
	
	  //returns the size of the bid creative. Concatenation of width and height by ‘x’.
	  this.getSize = function () {
	    return this.width + 'x' + this.height;
	  };
	}
	
	// Bid factory function.
	exports.createBid = function () {
	  return new (Function.prototype.bind.apply(Bid, [null].concat(Array.prototype.slice.call(arguments))))();
	};

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _utils = __webpack_require__(2);
	
	var _cpmBucketManager = __webpack_require__(12);
	
	var CONSTANTS = __webpack_require__(3);
	var AUCTION_END = CONSTANTS.EVENTS.AUCTION_END;
	var utils = __webpack_require__(2);
	var events = __webpack_require__(8);
	
	var objectType_function = 'function';
	
	var externalCallbacks = { byAdUnit: [], all: [], oneTime: null, timer: false };
	var _granularity = CONSTANTS.GRANULARITY_OPTIONS.MEDIUM;
	var _customPriceBucket = void 0;
	var defaultBidderSettingsMap = {};
	
	exports.setCustomPriceBucket = function (customConfig) {
	  _customPriceBucket = customConfig;
	};
	
	/**
	 * Returns a list of bidders that we haven't received a response yet
	 * @return {array} [description]
	 */
	exports.getTimedOutBidders = function () {
	  return pbjs._bidsRequested.map(getBidderCode).filter(_utils.uniques).filter(function (bidder) {
	    return pbjs._bidsReceived.map(getBidders).filter(_utils.uniques).indexOf(bidder) < 0;
	  });
	};
	
	function timestamp() {
	  return new Date().getTime();
	}
	
	function getBidderCode(bidSet) {
	  return bidSet.bidderCode;
	}
	
	function getBidders(bid) {
	  return bid.bidder;
	}
	
	function bidsBackAdUnit(adUnitCode) {
	  var _this = this;
	
	  var requested = pbjs._bidsRequested.map(function (request) {
	    return request.bids.filter(_utils.adUnitsFilter.bind(_this, pbjs._adUnitCodes)).filter(function (bid) {
	      return bid.placementCode === adUnitCode;
	    });
	  }).reduce(_utils.flatten, []).map(function (bid) {
	    return bid.bidder === 'indexExchange' ? bid.sizes.length : 1;
	  }).reduce(add, 0);
	
	  var received = pbjs._bidsReceived.filter(function (bid) {
	    return bid.adUnitCode === adUnitCode;
	  }).length;
	  return requested === received;
	}
	
	function add(a, b) {
	  return a + b;
	}
	
	function bidsBackAll() {
	  var requested = pbjs._bidsRequested.map(function (request) {
	    return request.bids;
	  }).reduce(_utils.flatten, []).filter(_utils.adUnitsFilter.bind(this, pbjs._adUnitCodes)).map(function (bid) {
	    return bid.bidder === 'indexExchange' ? bid.sizes.length : 1;
	  }).reduce(function (a, b) {
	    return a + b;
	  }, 0);
	
	  var received = pbjs._bidsReceived.filter(_utils.adUnitsFilter.bind(this, pbjs._adUnitCodes)).length;
	
	  return requested === received;
	}
	
	exports.bidsBackAll = function () {
	  return bidsBackAll();
	};
	
	/*
	 *   This function should be called to by the bidder adapter to register a bid response
	 */
	exports.addBidResponse = function (adUnitCode, bid) {
	  if (!adUnitCode) {
	    utils.logWarn('No adUnitCode supplied to addBidResponse, response discarded');
	    return;
	  }
	
	  if (bid) {
	    var _getBidderRequest = (0, _utils.getBidderRequest)(bid.bidderCode, adUnitCode),
	        requestId = _getBidderRequest.requestId,
	        start = _getBidderRequest.start;
	
	    _extends(bid, {
	      requestId: requestId,
	      responseTimestamp: timestamp(),
	      requestTimestamp: start,
	      cpm: parseFloat(bid.cpm) || 0,
	      bidder: bid.bidderCode,
	      adUnitCode: adUnitCode
	    });
	
	    bid.timeToRespond = bid.responseTimestamp - bid.requestTimestamp;
	
	    if (bid.timeToRespond > pbjs.cbTimeout + pbjs.timeoutBuffer) {
	      var timedOut = true;
	
	      exports.executeCallback(timedOut);
	    }
	
	    //emit the bidAdjustment event before bidResponse, so bid response has the adjusted bid value
	    events.emit(CONSTANTS.EVENTS.BID_ADJUSTMENT, bid);
	
	    //emit the bidResponse event
	    events.emit(CONSTANTS.EVENTS.BID_RESPONSE, bid);
	
	    //append price strings
	    var priceStringsObj = (0, _cpmBucketManager.getPriceBucketString)(bid.cpm, _customPriceBucket);
	    bid.pbLg = priceStringsObj.low;
	    bid.pbMg = priceStringsObj.med;
	    bid.pbHg = priceStringsObj.high;
	    bid.pbAg = priceStringsObj.auto;
	    bid.pbDg = priceStringsObj.dense;
	    bid.pbCg = priceStringsObj.custom;
	
	    //if there is any key value pairs to map do here
	    var keyValues = {};
	    if (bid.bidderCode && (bid.cpm > 0 || bid.dealId)) {
	      keyValues = getKeyValueTargetingPairs(bid.bidderCode, bid);
	    }
	
	    bid.adserverTargeting = keyValues;
	    pbjs._bidsReceived.push(bid);
	  }
	
	  if (bid && bid.adUnitCode && bidsBackAdUnit(bid.adUnitCode)) {
	    triggerAdUnitCallbacks(bid.adUnitCode);
	  }
	
	  if (bidsBackAll()) {
	    exports.executeCallback();
	  }
	};
	
	function getKeyValueTargetingPairs(bidderCode, custBidObj) {
	  var keyValues = {};
	  var bidder_settings = pbjs.bidderSettings;
	
	  //1) set the keys from "standard" setting or from prebid defaults
	  if (custBidObj && bidder_settings) {
	    //initialize default if not set
	    var standardSettings = getStandardBidderSettings();
	    setKeys(keyValues, standardSettings, custBidObj);
	  }
	
	  //2) set keys from specific bidder setting override if they exist
	  if (bidderCode && custBidObj && bidder_settings && bidder_settings[bidderCode] && bidder_settings[bidderCode][CONSTANTS.JSON_MAPPING.ADSERVER_TARGETING]) {
	    setKeys(keyValues, bidder_settings[bidderCode], custBidObj);
	    custBidObj.alwaysUseBid = bidder_settings[bidderCode].alwaysUseBid;
	    custBidObj.sendStandardTargeting = bidder_settings[bidderCode].sendStandardTargeting;
	  }
	
	  //2) set keys from standard setting. NOTE: this API doesn't seem to be in use by any Adapter
	  else if (defaultBidderSettingsMap[bidderCode]) {
	      setKeys(keyValues, defaultBidderSettingsMap[bidderCode], custBidObj);
	      custBidObj.alwaysUseBid = defaultBidderSettingsMap[bidderCode].alwaysUseBid;
	      custBidObj.sendStandardTargeting = defaultBidderSettingsMap[bidderCode].sendStandardTargeting;
	    }
	
	  return keyValues;
	}
	
	exports.getKeyValueTargetingPairs = function () {
	  return getKeyValueTargetingPairs.apply(undefined, arguments);
	};
	
	function setKeys(keyValues, bidderSettings, custBidObj) {
	  var targeting = bidderSettings[CONSTANTS.JSON_MAPPING.ADSERVER_TARGETING];
	  custBidObj.size = custBidObj.getSize();
	
	  utils._each(targeting, function (kvPair) {
	    var key = kvPair.key;
	    var value = kvPair.val;
	
	    if (keyValues[key]) {
	      utils.logWarn('The key: ' + key + ' is getting ovewritten');
	    }
	
	    if (utils.isFn(value)) {
	      try {
	        value = value(custBidObj);
	      } catch (e) {
	        utils.logError('bidmanager', 'ERROR', e);
	      }
	    }
	
	    if ((typeof bidderSettings.suppressEmptyKeys !== "undefined" && bidderSettings.suppressEmptyKeys === true || key === "hb_deal") && ( // hb_deal is suppressed automatically if not set
	    utils.isEmptyStr(value) || value === null || value === undefined)) {
	      utils.logInfo("suppressing empty key '" + key + "' from adserver targeting");
	    } else {
	      keyValues[key] = value;
	    }
	  });
	
	  return keyValues;
	}
	
	exports.setPriceGranularity = function setPriceGranularity(granularity) {
	  var granularityOptions = CONSTANTS.GRANULARITY_OPTIONS;
	  if (Object.keys(granularityOptions).filter(function (option) {
	    return granularity === granularityOptions[option];
	  })) {
	    _granularity = granularity;
	  } else {
	    utils.logWarn('Prebid Warning: setPriceGranularity was called with invalid setting, using' + ' `medium` as default.');
	    _granularity = CONSTANTS.GRANULARITY_OPTIONS.MEDIUM;
	  }
	};
	
	exports.registerDefaultBidderSetting = function (bidderCode, defaultSetting) {
	  defaultBidderSettingsMap[bidderCode] = defaultSetting;
	};
	
	exports.executeCallback = function (timedOut) {
	  // if there's still a timeout running, clear it now
	  if (!timedOut && externalCallbacks.timer) {
	    clearTimeout(externalCallbacks.timer);
	  }
	
	  if (externalCallbacks.all.called !== true) {
	    processCallbacks(externalCallbacks.all);
	    externalCallbacks.all.called = true;
	
	    if (timedOut) {
	      var timedOutBidders = exports.getTimedOutBidders();
	
	      if (timedOutBidders.length) {
	        events.emit(CONSTANTS.EVENTS.BID_TIMEOUT, timedOutBidders);
	      }
	    }
	  }
	
	  //execute one time callback
	  if (externalCallbacks.oneTime) {
	    events.emit(AUCTION_END);
	    try {
	      processCallbacks([externalCallbacks.oneTime]);
	    } catch (e) {
	      utils.logError('Error executing bidsBackHandler', null, e);
	    } finally {
	      externalCallbacks.oneTime = null;
	      externalCallbacks.timer = false;
	      pbjs.clearAuction();
	    }
	  }
	};
	
	exports.externalCallbackReset = function () {
	  externalCallbacks.all.called = false;
	};
	
	function triggerAdUnitCallbacks(adUnitCode) {
	  //todo : get bid responses and send in args
	  var singleAdUnitCode = [adUnitCode];
	  processCallbacks(externalCallbacks.byAdUnit, singleAdUnitCode);
	}
	
	function processCallbacks(callbackQueue, singleAdUnitCode) {
	  var _this2 = this;
	
	  if (utils.isArray(callbackQueue)) {
	    callbackQueue.forEach(function (callback) {
	      var adUnitCodes = singleAdUnitCode || pbjs._adUnitCodes;
	      var bids = [pbjs._bidsReceived.filter(_utils.adUnitsFilter.bind(_this2, adUnitCodes)).reduce(groupByPlacement, {})];
	
	      callback.apply(pbjs, bids);
	    });
	  }
	}
	
	/**
	 * groupByPlacement is a reduce function that converts an array of Bid objects
	 * to an object with placement codes as keys, with each key representing an object
	 * with an array of `Bid` objects for that placement
	 * @returns {*} as { [adUnitCode]: { bids: [Bid, Bid, Bid] } }
	 */
	function groupByPlacement(bidsByPlacement, bid) {
	  if (!bidsByPlacement[bid.adUnitCode]) bidsByPlacement[bid.adUnitCode] = { bids: [] };
	
	  bidsByPlacement[bid.adUnitCode].bids.push(bid);
	
	  return bidsByPlacement;
	}
	
	/**
	 * Add a one time callback, that is discarded after it is called
	 * @param {Function} callback
	 * @param timer Timer to clear if callback is triggered before timer time's out
	 */
	exports.addOneTimeCallback = function (callback, timer) {
	  externalCallbacks.oneTime = callback;
	  externalCallbacks.timer = timer;
	};
	
	exports.addCallback = function (id, callback, cbEvent) {
	  callback.id = id;
	  if (CONSTANTS.CB.TYPE.ALL_BIDS_BACK === cbEvent) {
	    externalCallbacks.all.push(callback);
	  } else if (CONSTANTS.CB.TYPE.AD_UNIT_BIDS_BACK === cbEvent) {
	    externalCallbacks.byAdUnit.push(callback);
	  }
	};
	
	//register event for bid adjustment
	events.on(CONSTANTS.EVENTS.BID_ADJUSTMENT, function (bid) {
	  adjustBids(bid);
	});
	
	function adjustBids(bid) {
	  var code = bid.bidderCode;
	  var bidPriceAdjusted = bid.cpm;
	  if (code && pbjs.bidderSettings && pbjs.bidderSettings[code]) {
	    if (_typeof(pbjs.bidderSettings[code].bidCpmAdjustment) === objectType_function) {
	      try {
	        bidPriceAdjusted = pbjs.bidderSettings[code].bidCpmAdjustment.call(null, bid.cpm, _extends({}, bid));
	      } catch (e) {
	        utils.logError('Error during bid adjustment', 'bidmanager.js', e);
	      }
	    }
	  }
	
	  if (bidPriceAdjusted >= 0) {
	    bid.cpm = bidPriceAdjusted;
	  }
	}
	
	exports.adjustBids = function () {
	  return adjustBids.apply(undefined, arguments);
	};
	
	function getStandardBidderSettings() {
	  var bidder_settings = pbjs.bidderSettings;
	  if (!bidder_settings[CONSTANTS.JSON_MAPPING.BD_SETTING_STANDARD]) {
	    bidder_settings[CONSTANTS.JSON_MAPPING.BD_SETTING_STANDARD] = {
	      adserverTargeting: [{
	        key: 'hb_bidder',
	        val: function val(bidResponse) {
	          return bidResponse.bidderCode;
	        }
	      }, {
	        key: 'hb_adid',
	        val: function val(bidResponse) {
	          return bidResponse.adId;
	        }
	      }, {
	        key: 'hb_pb',
	        val: function val(bidResponse) {
	          if (_granularity === CONSTANTS.GRANULARITY_OPTIONS.AUTO) {
	            return bidResponse.pbAg;
	          } else if (_granularity === CONSTANTS.GRANULARITY_OPTIONS.DENSE) {
	            return bidResponse.pbDg;
	          } else if (_granularity === CONSTANTS.GRANULARITY_OPTIONS.LOW) {
	            return bidResponse.pbLg;
	          } else if (_granularity === CONSTANTS.GRANULARITY_OPTIONS.MEDIUM) {
	            return bidResponse.pbMg;
	          } else if (_granularity === CONSTANTS.GRANULARITY_OPTIONS.HIGH) {
	            return bidResponse.pbHg;
	          } else if (_granularity === CONSTANTS.GRANULARITY_OPTIONS.CUSTOM) {
	            return bidResponse.pbCg;
	          }
	        }
	      }, {
	        key: 'hb_size',
	        val: function val(bidResponse) {
	          return bidResponse.size;
	        }
	      }, {
	        key: 'hb_deal',
	        val: function val(bidResponse) {
	          return bidResponse.dealId;
	        }
	      }]
	    };
	  }
	  return bidder_settings[CONSTANTS.JSON_MAPPING.BD_SETTING_STANDARD];
	}
	
	function getStandardBidderAdServerTargeting() {
	  return getStandardBidderSettings()[CONSTANTS.JSON_MAPPING.ADSERVER_TARGETING];
	}
	
	exports.getStandardBidderAdServerTargeting = getStandardBidderAdServerTargeting;

/***/ },
/* 12 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var _defaultPrecision = 2;
	var _lgPriceConfig = {
	  'buckets': [{
	    'min': 0,
	    'max': 5,
	    'increment': 0.5
	  }]
	};
	var _mgPriceConfig = {
	  'buckets': [{
	    'min': 0,
	    'max': 20,
	    'increment': 0.1
	  }]
	};
	var _hgPriceConfig = {
	  'buckets': [{
	    'min': 0,
	    'max': 20,
	    'increment': 0.01
	  }]
	};
	var _densePriceConfig = {
	  'buckets': [{
	    'min': 0,
	    'max': 3,
	    'increment': 0.01
	  }, {
	    'min': 3,
	    'max': 8,
	    'increment': 0.05
	  }, {
	    'min': 8,
	    'max': 20,
	    'increment': 0.5
	  }]
	};
	var _autoPriceConfig = {
	  'buckets': [{
	    'min': 0,
	    'max': 5,
	    'increment': 0.05
	  }, {
	    'min': 5,
	    'max': 10,
	    'increment': 0.1
	  }, {
	    'min': 10,
	    'max': 20,
	    'increment': 0.5
	  }]
	};
	
	function getPriceBucketString(cpm, customConfig) {
	  var cpmFloat = 0;
	  cpmFloat = parseFloat(cpm);
	  if (isNaN(cpmFloat)) {
	    cpmFloat = '';
	  }
	
	  return {
	    low: cpmFloat === '' ? '' : getCpmStringValue(cpm, _lgPriceConfig),
	    med: cpmFloat === '' ? '' : getCpmStringValue(cpm, _mgPriceConfig),
	    high: cpmFloat === '' ? '' : getCpmStringValue(cpm, _hgPriceConfig),
	    auto: cpmFloat === '' ? '' : getCpmStringValue(cpm, _autoPriceConfig),
	    dense: cpmFloat === '' ? '' : getCpmStringValue(cpm, _densePriceConfig),
	    custom: cpmFloat === '' ? '' : getCpmStringValue(cpm, customConfig)
	  };
	}
	
	function getCpmStringValue(cpm, config) {
	  var cpmStr = '';
	  if (!isValidePriceConfig(config)) {
	    return cpmStr;
	  }
	  var cap = config.buckets.reduce(function (prev, curr) {
	    if (prev.max > curr.max) {
	      return prev;
	    }
	    return curr;
	  }, {
	    'max': 0
	  });
	  var bucket = config.buckets.find(function (bucket) {
	    if (cpm > cap.max) {
	      var precision = bucket.precision || _defaultPrecision;
	      cpmStr = bucket.max.toFixed(precision);
	    } else if (cpm <= bucket.max && cpm >= bucket.min) {
	      return bucket;
	    }
	  });
	  if (bucket) {
	    cpmStr = getCpmTarget(cpm, bucket.increment, bucket.precision);
	  }
	  return cpmStr;
	}
	
	function isValidePriceConfig(config) {
	  if (!config || !config.buckets || !Array.isArray(config.buckets)) {
	    return false;
	  }
	  var isValid = true;
	  config.buckets.forEach(function (bucket) {
	    if (typeof bucket.min === 'undefined' || !bucket.max || !bucket.increment) {
	      isValid = false;
	    }
	  });
	  return isValid;
	}
	
	function getCpmTarget(cpm, increment, precision) {
	  if (!precision) {
	    precision = _defaultPrecision;
	  }
	  var bucketSize = 1 / increment;
	  return (Math.floor(cpm * bucketSize) / bucketSize).toFixed(precision);
	}
	
	exports.getPriceBucketString = getPriceBucketString;
	exports.isValidePriceConfig = isValidePriceConfig;

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(2);
	var _requestCache = {};
	
	//add a script tag to the page, used to add /jpt call to page
	exports.loadScript = function (tagSrc, callback, cacheRequest) {
	  //var noop = () => {};
	  //
	  //callback = callback || noop;
	  if (!tagSrc) {
	    utils.logError('Error attempting to request empty URL', 'adloader.js:loadScript');
	    return;
	  }
	
	  if (cacheRequest) {
	    if (_requestCache[tagSrc]) {
	      if (callback && typeof callback === 'function') {
	        if (_requestCache[tagSrc].loaded) {
	          //invokeCallbacks immediately
	          callback();
	        } else {
	          //queue the callback
	          _requestCache[tagSrc].callbacks.push(callback);
	        }
	      }
	    } else {
	      _requestCache[tagSrc] = {
	        loaded: false,
	        callbacks: []
	      };
	      if (callback && typeof callback === 'function') {
	        _requestCache[tagSrc].callbacks.push(callback);
	      }
	
	      requestResource(tagSrc, function () {
	        _requestCache[tagSrc].loaded = true;
	        try {
	          for (var i = 0; i < _requestCache[tagSrc].callbacks.length; i++) {
	            _requestCache[tagSrc].callbacks[i]();
	          }
	        } catch (e) {
	          utils.logError('Error executing callback', 'adloader.js:loadScript', e);
	        }
	      });
	    }
	  }
	
	  //trigger one time request
	  else {
	      requestResource(tagSrc, callback);
	    }
	};
	
	function requestResource(tagSrc, callback) {
	  var jptScript = document.createElement('script');
	  jptScript.type = 'text/javascript';
	  jptScript.async = true;
	
	  // Execute a callback if necessary
	  if (callback && typeof callback === 'function') {
	    if (jptScript.readyState) {
	      jptScript.onreadystatechange = function () {
	        if (jptScript.readyState === 'loaded' || jptScript.readyState === 'complete') {
	          jptScript.onreadystatechange = null;
	          callback();
	        }
	      };
	    } else {
	      jptScript.onload = function () {
	        callback();
	      };
	    }
	  }
	
	  jptScript.src = tagSrc;
	
	  //add the new script tag to the page
	  var elToAppend = document.getElementsByTagName('head');
	  elToAppend = elToAppend.length ? elToAppend : document.getElementsByTagName('body');
	  if (elToAppend.length) {
	    elToAppend = elToAppend[0];
	    elToAppend.insertBefore(jptScript, elToAppend.firstChild);
	  }
	}

/***/ },
/* 14 */
/***/ function(module, exports) {

	"use strict";
	
	function Adapter(code) {
	  var bidderCode = code;
	
	  function setBidderCode(code) {
	    bidderCode = code;
	  }
	
	  function getBidderCode() {
	    return bidderCode;
	  }
	
	  function callBids() {}
	
	  return {
	    callBids: callBids,
	    setBidderCode: setBidderCode,
	    getBidderCode: getBidderCode
	  };
	}
	
	exports.createNew = function (bidderCode) {
	  return new Adapter(bidderCode);
	};

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(2);
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var adloader = __webpack_require__(13);
	
	/**
	 * Adapter for requesting bids from Adblade
	 * To request an Adblade Header partner account
	 * or for additional integration support please
	 * register at http://www.adblade.com.
	 */
	var AdbladeAdapter = function AdbladeAdapter() {
	  'use strict';
	
	  var BIDDER_CODE = 'adblade';
	  var BASE_URI = '//rtb.adblade.com/prebidjs/bid?';
	  var DEFAULT_BID_FLOOR = 0.0000000001;
	
	  function _callBids(params) {
	    var bids = params.bids || [],
	        referrer = utils.getTopWindowUrl(),
	        loc = utils.getTopWindowLocation(),
	        domain = loc.hostname,
	        partnerId = 0,
	        bidRequests = {};
	
	    if (bids.length > 0) {
	      partnerId = '' + bids[0].params.partnerId;
	    }
	
	    utils._each(bids, function (bid) {
	      // make sure the "sizes" are an array of arrays
	      if (!(bid.sizes[0] instanceof Array)) {
	        bid.sizes = [bid.sizes];
	      }
	      utils._each(bid.sizes, function (size) {
	        var key = size[0] + 'x' + size[1];
	
	        bidRequests[key] = bidRequests[key] || {
	          'site': {
	            'id': partnerId,
	            'page': referrer,
	            'domain': domain,
	            'publisher': {
	              'id': partnerId,
	              'name': referrer,
	              'domain': domain
	            }
	          },
	          'id': params.requestId,
	          'imp': [],
	          'device': {
	            'ua': window.navigator.userAgent
	          },
	          'cur': ['USD'],
	          'user': {}
	        };
	
	        bidRequests[key].imp.push({
	          'id': bid.bidId,
	          'bidfloor': bid.params.bidFloor || DEFAULT_BID_FLOOR,
	          'tag': bid.placementCode,
	          'banner': {
	            'w': size[0],
	            'h': size[1]
	          },
	          'secure': 0 + (loc.protocol === 'https')
	        });
	      });
	    });
	
	    utils._each(bidRequests, function (bidRequest) {
	      adloader.loadScript(utils.tryAppendQueryString(utils.tryAppendQueryString(BASE_URI, 'callback', 'pbjs.adbladeResponse'), 'json', JSON.stringify(bidRequest)));
	    });
	  }
	
	  pbjs.adbladeResponse = function (response) {
	    var auctionIdRe = /\$(%7B|\{)AUCTION_ID(%7D|\})/gi,
	        auctionPriceRe = /\$(%7B|\{)AUCTION_PRICE(%7D|\})/gi,
	        clickUrlRe = /\$(%7B|\{)CLICK_URL(%7D|\})/gi;
	
	    if (typeof response === 'undefined' || !response.hasOwnProperty('seatbid') || utils.isEmpty(response.seatbid)) {
	      // handle empty bids
	      var bidsRequested = pbjs._bidsRequested.find(function (bidSet) {
	        return bidSet.bidderCode === BIDDER_CODE;
	      }).bids;
	      if (bidsRequested.length > 0) {
	        var bid = bidfactory.createBid(2);
	        bid.bidderCode = BIDDER_CODE;
	        bidmanager.addBidResponse(bidsRequested[0].placementCode, bid);
	      }
	
	      return;
	    }
	
	    utils._each(response.seatbid, function (seatbid) {
	      utils._each(seatbid.bid, function (seatbidBid) {
	        var bidRequest = utils.getBidRequest(seatbidBid.impid),
	            ad = seatbidBid.adm + utils.createTrackPixelHtml(seatbidBid.nurl);
	
	        ad = ad.replace(auctionIdRe, seatbidBid.impid);
	        ad = ad.replace(clickUrlRe, '');
	        ad = ad.replace(auctionPriceRe, seatbidBid.price);
	
	        var bid = bidfactory.createBid(1);
	
	        bid.bidderCode = BIDDER_CODE;
	        bid.cpm = seatbidBid.price;
	        bid.ad = ad;
	        bid.width = seatbidBid.w;
	        bid.height = seatbidBid.h;
	        bidmanager.addBidResponse(bidRequest.placementCode, bid);
	      });
	    });
	  };
	
	  return {
	    callBids: _callBids
	  };
	};
	
	module.exports = AdbladeAdapter;

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var CONSTANTS = __webpack_require__(3);
	var utils = __webpack_require__(2);
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var adloader = __webpack_require__(13);
	
	var adBundAdapter = function adBundAdapter() {
	  var timezone = new Date().getTimezoneOffset();
	  var bidAPIs = ['http://us-east-engine.adbund.xyz/prebid/ad/get', 'http://us-west-engine.adbund.xyz/prebid/ad/get'];
	  //Based on the time zone to select the interface to the server
	  var bidAPI = bidAPIs[timezone < 0 ? 0 : 1];
	
	  function _stringify(param) {
	    var result = [];
	    var key;
	    for (key in param) {
	      if (param.hasOwnProperty(key)) {
	        result.push(key + '=' + encodeURIComponent(param[key]));
	      }
	    }
	    return result.join('&');
	  }
	
	  function _createCallback(bid) {
	    return function (data) {
	      var response;
	      if (data && data.cpm) {
	        response = bidfactory.createBid(CONSTANTS.STATUS.GOOD);
	        response.bidderCode = 'adbund';
	        _extends(response, data);
	      } else {
	        response = bidfactory.createBid(CONSTANTS.STATUS.NO_BID);
	        response.bidderCode = 'adbund';
	      }
	      bidmanager.addBidResponse(bid.placementCode, response);
	    };
	  }
	
	  function _requestBids(bid) {
	    var info = {
	      referrer: utils.getTopWindowUrl(),
	      domain: utils.getTopWindowLocation().hostname,
	      ua: window.navigator.userAgent
	    };
	    var param = _extends({}, bid.params, info);
	    param.sizes = JSON.stringify(param.sizes || bid.sizes);
	    param.callback = 'pbjs.adbundResponse';
	    pbjs.adbundResponse = _createCallback(bid);
	    adloader.loadScript(bidAPI + '?' + _stringify(param));
	  }
	
	  function _callBids(params) {
	    (params.bids || []).forEach(function (bid) {
	      _requestBids(bid);
	    });
	  }
	
	  return {
	    callBids: _callBids
	  };
	};
	
	module.exports = adBundAdapter;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @overview AdButler Prebid.js adapter.
	 * @author dkharton
	 */
	
	'use strict';
	
	var utils = __webpack_require__(2);
	var adloader = __webpack_require__(13);
	var bidmanager = __webpack_require__(11);
	var bidfactory = __webpack_require__(10);
	
	var AdButlerAdapter = function AdButlerAdapter() {
	
	  function _callBids(params) {
	
	    var bids = params.bids || [],
	        callbackData = {},
	        zoneCount = {},
	        pageID = Math.floor(Math.random() * 10e6);
	
	    //Build and send bid requests
	    for (var i = 0; i < bids.length; i++) {
	      var bid = bids[i],
	          zoneID = utils.getBidIdParameter('zoneID', bid.params),
	          callbackID;
	
	      if (!(zoneID in zoneCount)) {
	        zoneCount[zoneID] = 0;
	      }
	
	      //build callbackID to get placementCode later  
	      callbackID = zoneID + '_' + zoneCount[zoneID];
	
	      callbackData[callbackID] = {};
	      callbackData[callbackID].bidId = bid.bidId;
	
	      var adRequest = buildRequest(bid, zoneCount[zoneID], pageID);
	      zoneCount[zoneID]++;
	
	      adloader.loadScript(adRequest);
	    }
	
	    //Define callback function for bid responses
	    pbjs.adbutlerCB = function (aBResponseObject) {
	
	      var bidResponse = {},
	          callbackID = aBResponseObject.zone_id + '_' + aBResponseObject.place,
	          width = parseInt(aBResponseObject.width),
	          height = parseInt(aBResponseObject.height),
	          isCorrectSize = false,
	          isCorrectCPM = true,
	          CPM,
	          minCPM,
	          maxCPM,
	          bidObj = callbackData[callbackID] ? utils.getBidRequest(callbackData[callbackID].bidId) : null;
	
	      if (bidObj) {
	
	        if (aBResponseObject.status === 'SUCCESS') {
	          CPM = aBResponseObject.cpm;
	          minCPM = utils.getBidIdParameter('minCPM', bidObj.params);
	          maxCPM = utils.getBidIdParameter('maxCPM', bidObj.params);
	
	          //Ensure response CPM is within the given bounds
	          if (minCPM !== '' && CPM < parseFloat(minCPM)) {
	            isCorrectCPM = false;
	          }
	          if (maxCPM !== '' && CPM > parseFloat(maxCPM)) {
	            isCorrectCPM = false;
	          }
	
	          //Ensure that response ad matches one of the placement sizes.  
	          utils._each(bidObj.sizes, function (size) {
	            if (width === size[0] && height === size[1]) {
	              isCorrectSize = true;
	            }
	          });
	
	          if (isCorrectCPM && isCorrectSize) {
	
	            bidResponse = bidfactory.createBid(1, bidObj);
	            bidResponse.bidderCode = 'adbutler';
	            bidResponse.cpm = CPM;
	            bidResponse.width = width;
	            bidResponse.height = height;
	            bidResponse.ad = aBResponseObject.ad_code;
	            bidResponse.ad += addTrackingPixels(aBResponseObject.tracking_pixels);
	          } else {
	
	            bidResponse = bidfactory.createBid(2, bidObj);
	            bidResponse.bidderCode = 'adbutler';
	          }
	        } else {
	
	          bidResponse = bidfactory.createBid(2, bidObj);
	          bidResponse.bidderCode = 'adbutler';
	        }
	
	        bidmanager.addBidResponse(bidObj.placementCode, bidResponse);
	      }
	    };
	  }
	
	  function buildRequest(bid, adIndex, pageID) {
	    var accountID = utils.getBidIdParameter('accountID', bid.params),
	        zoneID = utils.getBidIdParameter('zoneID', bid.params),
	        keyword = utils.getBidIdParameter('keyword', bid.params),
	        domain = utils.getBidIdParameter('domain', bid.params);
	
	    if (typeof domain === 'undefined' || domain.length === 0) {
	      domain = 'servedbyadbutler.com';
	    }
	
	    var requestURI = location.protocol + '//' + domain + '/adserve/;type=hbr;';
	    requestURI += 'ID=' + encodeURIComponent(accountID) + ';';
	    requestURI += 'setID=' + encodeURIComponent(zoneID) + ';';
	    requestURI += 'pid=' + encodeURIComponent(pageID) + ';';
	    requestURI += 'place=' + encodeURIComponent(adIndex) + ';';
	
	    //append the keyword for targeting if one was passed in  
	    if (keyword !== '') {
	      requestURI += 'kw=' + encodeURIComponent(keyword) + ';';
	    }
	    requestURI += 'jsonpfunc=pbjs.adbutlerCB;';
	    requestURI += 'click=CLICK_MACRO_PLACEHOLDER';
	
	    return requestURI;
	  }
	
	  function addTrackingPixels(trackingPixels) {
	    var trackingPixelMarkup = '';
	    utils._each(trackingPixels, function (pixelURL) {
	
	      var trackingPixel = '<img height="0" width="0" border="0" style="display:none;" src="';
	      trackingPixel += pixelURL;
	      trackingPixel += '">';
	
	      trackingPixelMarkup += trackingPixel;
	    });
	    return trackingPixelMarkup;
	  }
	
	  // Export the callBids function, so that prebid.js can execute this function
	  // when the page asks to send out bid requests.
	  return {
	    callBids: _callBids
	  };
	};
	
	module.exports = AdButlerAdapter;

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var adloader = __webpack_require__(13);
	var utils = __webpack_require__(2);
	var CONSTANTS = __webpack_require__(3);
	
	module.exports = function () {
	  var req_url_base = 'https://rex.adequant.com/rex/c2s_prebid?';
	
	  function _callBids(params) {
	    var req_url = [];
	    var publisher_id = null;
	    var sizes = [];
	    var cats = null;
	    var replies = [];
	    var placements = {};
	
	    var bids = params.bids || [];
	    for (var i = 0; i < bids.length; i++) {
	      var bid_request = bids[i];
	      var br_params = bid_request.params || {};
	      placements[bid_request.placementCode] = true;
	
	      publisher_id = br_params.publisher_id.toString() || publisher_id;
	      var bidfloor = br_params.bidfloor || 0.01;
	      cats = br_params.cats || cats;
	      if ((typeof cats === 'undefined' ? 'undefined' : _typeof(cats)) === utils.objectType_string) {
	        cats = cats.split(' ');
	      }
	      var br_sizes = utils.parseSizesInput(bid_request.sizes);
	      for (var j = 0; j < br_sizes.length; j++) {
	        sizes.push(br_sizes[j] + '_' + bidfloor);
	        replies.push(bid_request.placementCode);
	      }
	    }
	    // send out 1 bid request for all bids
	    if (publisher_id) {
	      req_url.push('a=' + publisher_id);
	    }
	    if (cats) {
	      req_url.push('c=' + cats.join('+'));
	    }
	    if (sizes) {
	      req_url.push('s=' + sizes.join('+'));
	    }
	
	    adloader.loadScript(req_url_base + req_url.join('&'), function () {
	      process_bids(replies, placements);
	    });
	  }
	
	  function process_bids(replies, placements) {
	    var placement_code,
	        bid,
	        adequant_creatives = window.adequant_creatives;
	    if (adequant_creatives && adequant_creatives.seatbid) {
	      for (var i = 0; i < adequant_creatives.seatbid.length; i++) {
	        var bid_response = adequant_creatives.seatbid[i].bid[0];
	        placement_code = replies[parseInt(bid_response.impid, 10) - 1];
	        if (!placement_code || !placements[placement_code]) {
	          continue;
	        }
	
	        bid = bidfactory.createBid(CONSTANTS.STATUS.GOOD);
	        bid.bidderCode = 'adequant';
	        bid.cpm = bid_response.price;
	        bid.ad = bid_response.adm;
	        bid.width = bid_response.w;
	        bid.height = bid_response.h;
	        bidmanager.addBidResponse(placement_code, bid);
	        placements[placement_code] = false;
	      }
	    }
	    for (placement_code in placements) {
	      if (placements[placement_code]) {
	        bid = bidfactory.createBid(CONSTANTS.STATUS.NO_BID);
	        bid.bidderCode = 'adequant';
	        bidmanager.addBidResponse(placement_code, bid);
	        utils.logMessage('No bid response from Adequant for placement code ' + placement_code);
	      }
	    }
	  }
	
	  return {
	    callBids: _callBids
	  };
	};

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(2);
	var adloader = __webpack_require__(13);
	var bidmanager = __webpack_require__(11);
	var bidfactory = __webpack_require__(10);
	var STATUSCODES = __webpack_require__(3).STATUS;
	
	function AdformAdapter() {
	
	  return {
	    callBids: _callBids
	  };
	
	  function _callBids(params) {
	    var bid, _value, _key, i, j, k, l;
	    var bids = params.bids;
	    var request = [];
	    var callbackName = '_adf_' + utils.getUniqueIdentifierStr();
	    var globalParams = [['adxDomain', 'adx.adform.net'], ['url', null], ['tid', null], ['callback', 'pbjs.' + callbackName]];
	
	    for (i = 0, l = bids.length; i < l; i++) {
	      bid = bids[i];
	
	      for (j = 0, k = globalParams.length; j < k; j++) {
	        _key = globalParams[j][0];
	        _value = bid[_key] || bid.params[_key];
	        if (_value) {
	          bid[_key] = bid.params[_key] = null;
	          globalParams[j][1] = _value;
	        }
	      }
	
	      request.push(formRequestUrl(bid.params));
	    }
	
	    request.unshift('//' + globalParams[0][1] + '/adx/?rp=4');
	
	    for (i = 1, l = globalParams.length; i < l; i++) {
	      _key = globalParams[i][0];
	      _value = globalParams[i][1];
	      if (_value) {
	        request.push(globalParams[i][0] + '=' + encodeURIComponent(_value));
	      }
	    }
	
	    pbjs[callbackName] = handleCallback(bids);
	
	    adloader.loadScript(request.join('&'));
	  }
	
	  function formRequestUrl(reqData) {
	    var key;
	    var url = [];
	
	    for (key in reqData) {
	      if (reqData.hasOwnProperty(key) && reqData[key]) url.push(key, '=', reqData[key], '&');
	    }
	
	    return encode64(url.join('').slice(0, -1));
	  }
	
	  function handleCallback(bids) {
	    return function handleResponse(adItems) {
	      var bidObject;
	      var bidder = 'adform';
	      var adItem;
	      var bid;
	      for (var i = 0, l = adItems.length; i < l; i++) {
	        adItem = adItems[i];
	        bid = bids[i];
	        if (adItem && adItem.response === 'banner' && verifySize(adItem, bid.sizes)) {
	
	          bidObject = bidfactory.createBid(STATUSCODES.GOOD, bid);
	          bidObject.bidderCode = bidder;
	          bidObject.cpm = adItem.win_bid;
	          bidObject.cur = adItem.win_cur;
	          bidObject.ad = adItem.banner;
	          bidObject.width = adItem.width;
	          bidObject.height = adItem.height;
	          bidObject.dealId = adItem.deal_id;
	          bidmanager.addBidResponse(bid.placementCode, bidObject);
	        } else {
	          bidObject = bidfactory.createBid(STATUSCODES.NO_BID, bid);
	          bidObject.bidderCode = bidder;
	          bidmanager.addBidResponse(bid.placementCode, bidObject);
	        }
	      }
	    };
	
	    function verifySize(adItem, validSizes) {
	      for (var j = 0, k = validSizes.length; j < k; j++) {
	        if (adItem.width === validSizes[j][0] && adItem.height === validSizes[j][1]) {
	          return true;
	        }
	      }
	
	      return false;
	    }
	  }
	
	  function encode64(input) {
	    var out = [];
	    var chr1;
	    var chr2;
	    var chr3;
	    var enc1;
	    var enc2;
	    var enc3;
	    var enc4;
	    var i = 0;
	    var _keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=';
	
	    input = utf8_encode(input);
	
	    while (i < input.length) {
	
	      chr1 = input.charCodeAt(i++);
	      chr2 = input.charCodeAt(i++);
	      chr3 = input.charCodeAt(i++);
	
	      enc1 = chr1 >> 2;
	      enc2 = (chr1 & 3) << 4 | chr2 >> 4;
	      enc3 = (chr2 & 15) << 2 | chr3 >> 6;
	      enc4 = chr3 & 63;
	
	      if (isNaN(chr2)) {
	        enc3 = enc4 = 64;
	      } else if (isNaN(chr3)) {
	        enc4 = 64;
	      }
	
	      out.push(_keyStr.charAt(enc1), _keyStr.charAt(enc2));
	      if (enc3 !== 64) out.push(_keyStr.charAt(enc3));
	      if (enc4 !== 64) out.push(_keyStr.charAt(enc4));
	    }
	
	    return out.join('');
	  }
	
	  function utf8_encode(string) {
	    string = string.replace(/\r\n/g, '\n');
	    var utftext = '';
	
	    for (var n = 0; n < string.length; n++) {
	
	      var c = string.charCodeAt(n);
	
	      if (c < 128) {
	        utftext += String.fromCharCode(c);
	      } else if (c > 127 && c < 2048) {
	        utftext += String.fromCharCode(c >> 6 | 192);
	        utftext += String.fromCharCode(c & 63 | 128);
	      } else {
	        utftext += String.fromCharCode(c >> 12 | 224);
	        utftext += String.fromCharCode(c >> 6 & 63 | 128);
	        utftext += String.fromCharCode(c & 63 | 128);
	      }
	    }
	
	    return utftext;
	  }
	}
	
	module.exports = AdformAdapter;

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _bidmanager = __webpack_require__(11);
	
	var _bidmanager2 = _interopRequireDefault(_bidmanager);
	
	var _bidfactory = __webpack_require__(10);
	
	var _bidfactory2 = _interopRequireDefault(_bidfactory);
	
	var _utils = __webpack_require__(2);
	
	var utils = _interopRequireWildcard(_utils);
	
	var _ajax = __webpack_require__(21);
	
	var _adapter = __webpack_require__(14);
	
	var _adapter2 = _interopRequireDefault(_adapter);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	/**
	 * Adapter for requesting bids from AdKernel white-label platform
	 * @class
	 */
	var AdKernelAdapter = function AdKernelAdapter() {
	  var AJAX_REQ_PARAMS = {
	    contentType: 'text/plain',
	    withCredentials: true,
	    method: 'GET'
	  };
	  var EMPTY_BID_RESPONSE = { 'seatbid': [{ 'bid': [] }] };
	
	  var baseAdapter = _adapter2['default'].createNew('adkernel');
	
	  /**
	   * Helper object to build multiple bid requests in case of multiple zones/ad-networks
	   * @constructor
	   */
	  function RtbRequestDispatcher() {
	    var _dispatch = {};
	    var originalBids = {};
	    var site = createSite();
	    var syncedHostZones = {};
	
	    //translate adunit info into rtb impression dispatched by host/zone
	    this.addImp = function (bid) {
	      var host = bid.params.host;
	      var zone = bid.params.zoneId;
	      var size = bid.sizes[0];
	      var bidId = bid.bidId;
	
	      if (!(host in _dispatch)) {
	        _dispatch[host] = {};
	      }
	      /* istanbul ignore else  */
	      if (!(zone in _dispatch[host])) {
	        _dispatch[host][zone] = [];
	      }
	      var imp = { 'id': bidId, 'tagid': bid.placementCode, 'banner': { 'w': size[0], 'h': size[1] } };
	      if (utils.getTopWindowLocation().protocol === 'https:') {
	        imp.secure = 1;
	      }
	      //save rtb impression for specified ad-network host and zone
	      _dispatch[host][zone].push(imp);
	      originalBids[bidId] = bid;
	      //perform user-sync
	      if (!(host in syncedHostZones)) {
	        syncedHostZones[host] = [];
	      }
	      if (syncedHostZones[host].indexOf(zone) === -1) {
	        syncedHostZones[host].push(zone);
	        insertUserSync(host, zone);
	      }
	    };
	
	    function insertUserSync(host, zone) {
	      var iframe = utils.createInvisibleIframe();
	      iframe.src = '//' + host + '/user-sync?zone=' + zone;
	      try {
	        document.body.appendChild(iframe);
	      } catch (error) {
	        /* istanbul ignore next */
	        utils.logError(error);
	      }
	    }
	
	    /**
	     *  Main function to get bid requests
	     */
	    this.dispatch = function (callback) {
	      utils._each(_dispatch, function (zones, host) {
	        utils.logMessage('processing network ' + host);
	        utils._each(zones, function (impressions, zone) {
	          utils.logMessage('processing zone ' + zone);
	          dispatchRtbRequest(host, zone, impressions, callback);
	        });
	      });
	    };
	
	    function dispatchRtbRequest(host, zone, impressions, callback) {
	      var url = buildEndpointUrl(host);
	      var rtbRequest = buildRtbRequest(impressions);
	      var params = buildRequestParams(zone, rtbRequest);
	      (0, _ajax.ajax)(url, function (bidResp) {
	        bidResp = bidResp === '' ? EMPTY_BID_RESPONSE : JSON.parse(bidResp);
	        utils._each(rtbRequest.imp, function (imp) {
	          var bidFound = false;
	          utils._each(bidResp.seatbid[0].bid, function (bid) {
	            /* istanbul ignore else */
	            if (!bidFound && bid.impid === imp.id) {
	              bidFound = true;
	              callback(originalBids[imp.id], imp, bid);
	            }
	          });
	          if (!bidFound) {
	            callback(originalBids[imp.id], imp);
	          }
	        });
	      }, params, AJAX_REQ_PARAMS);
	    }
	
	    /**
	     * Builds complete rtb bid request
	     * @param imps collection of impressions
	     */
	    function buildRtbRequest(imps) {
	      return {
	        'id': utils.getUniqueIdentifierStr(),
	        'imp': imps,
	        'site': site,
	        'at': 1,
	        'device': {
	          'ip': 'caller',
	          'ua': 'caller'
	        }
	      };
	    }
	
	    /**
	     * Build ad-network specific endpoint url
	     */
	    function buildEndpointUrl(host) {
	      return window.location.protocol + '//' + host + '/rtbg';
	    }
	
	    function buildRequestParams(zone, rtbReq) {
	      return {
	        'zone': encodeURIComponent(zone),
	        'ad_type': 'rtb',
	        'r': encodeURIComponent(JSON.stringify(rtbReq))
	      };
	    }
	  }
	
	  /**
	   *  Main module export function implementation
	   */
	  baseAdapter.callBids = function (params) {
	    var bids = params.bids || [];
	    processBids(bids);
	  };
	
	  /**
	   *  Process all bids grouped by network/zone
	   */
	  function processBids(bids) {
	    var dispatcher = new RtbRequestDispatcher();
	    //process individual bids
	    utils._each(bids, function (bid) {
	      if (!validateBidParams(bid.params)) {
	        utils.logError('Incorrect configuration for adkernel bidder: ' + bid.params);
	        _bidmanager2['default'].addBidResponse(bid.placementCode, createEmptyBidObject(bid));
	      } else {
	        dispatcher.addImp(bid);
	      }
	    });
	    //process bids grouped into bidrequests
	    dispatcher.dispatch(function (bid, imp, bidResp) {
	      var adUnitId = bid.placementCode;
	      if (bidResp) {
	        utils.logMessage('got response for ' + adUnitId);
	        _bidmanager2['default'].addBidResponse(adUnitId, createBidObject(bidResp, bid, imp.banner.w, imp.banner.h));
	      } else {
	        utils.logMessage('got empty response for ' + adUnitId);
	        _bidmanager2['default'].addBidResponse(adUnitId, createEmptyBidObject(bid));
	      }
	    });
	  }
	
	  /**
	   *  Create bid object for the bid manager
	   */
	  function createBidObject(resp, bid, width, height) {
	    return _extends(_bidfactory2['default'].createBid(1, bid), {
	      bidderCode: bid.bidder,
	      ad: formatAdMarkup(resp),
	      width: width,
	      height: height,
	      cpm: parseFloat(resp.price)
	    });
	  }
	
	  /**
	   * Create empty bid object for the bid manager
	   */
	  function createEmptyBidObject(bid) {
	    return _extends(_bidfactory2['default'].createBid(2, bid), {
	      bidderCode: bid.bidder
	    });
	  }
	
	  /**
	   *  Format creative with optional nurl call
	   */
	  function formatAdMarkup(bid) {
	    var adm = bid.adm;
	    if ('nurl' in bid) {
	      adm += utils.createTrackPixelHtml(bid.nurl + '&px=1');
	    }
	    return adm;
	  }
	
	  function validateBidParams(params) {
	    return typeof params.host !== 'undefined' && typeof params.zoneId !== 'undefined';
	  }
	
	  /**
	   * Creates site description object
	   */
	  function createSite() {
	    var location = utils.getTopWindowLocation();
	    return {
	      'domain': location.hostname,
	      'page': location.href.split('?')[0]
	    };
	  }
	
	  return {
	    callBids: baseAdapter.callBids,
	    setBidderCode: baseAdapter.setBidderCode,
	    getBidderCode: baseAdapter.getBidderCode,
	    createNew: AdKernelAdapter.createNew
	  };
	};
	
	/**
	 * Creates new instance of AdKernel bidder adapter
	 */
	AdKernelAdapter.createNew = function () {
	  return new AdKernelAdapter();
	};
	
	module.exports = AdKernelAdapter;

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	exports.ajax = ajax;
	
	var _url = __webpack_require__(22);
	
	var utils = __webpack_require__(2);
	
	var XHR_DONE = 4;
	
	/**
	 * Simple IE9+ and cross-browser ajax request function
	 * Note: x-domain requests in IE9 do not support the use of cookies
	 *
	 * @param url string url
	 * @param callback {object | function} callback
	 * @param data mixed data
	 * @param options object
	 */
	
	function ajax(url, callback, data) {
	  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
	
	  try {
	    var x = void 0;
	    var useXDomainRequest = false;
	    var method = options.method || (data ? 'POST' : 'GET');
	
	    var callbacks = (typeof callback === 'undefined' ? 'undefined' : _typeof(callback)) === "object" ? callback : {
	      success: function success() {
	        utils.logMessage('xhr success');
	      },
	      error: function error(e) {
	        utils.logError('xhr error', null, e);
	      }
	    };
	
	    if (typeof callback === "function") {
	      callbacks.success = callback;
	    }
	
	    if (!window.XMLHttpRequest) {
	      useXDomainRequest = true;
	    } else {
	      x = new window.XMLHttpRequest();
	      if (x.responseType === undefined) {
	        useXDomainRequest = true;
	      }
	    }
	
	    if (useXDomainRequest) {
	      x = new window.XDomainRequest();
	      x.onload = function () {
	        callbacks.success(x.responseText, x);
	      };
	
	      // http://stackoverflow.com/questions/15786966/xdomainrequest-aborts-post-on-ie-9
	      x.onerror = function () {
	        callbacks.error("error", x);
	      };
	      x.ontimeout = function () {
	        callbacks.error("timeout", x);
	      };
	      x.onprogress = function () {
	        utils.logMessage('xhr onprogress');
	      };
	    } else {
	      x.onreadystatechange = function () {
	        if (x.readyState === XHR_DONE) {
	          var status = x.status;
	          if (status >= 200 && status < 300 || status === 304) {
	            callbacks.success(x.responseText, x);
	          } else {
	            callbacks.error(x.statusText, x);
	          }
	        }
	      };
	    }
	
	    if (method === 'GET' && data) {
	      var urlInfo = (0, _url.parse)(url);
	      _extends(urlInfo.search, data);
	      url = (0, _url.format)(urlInfo);
	    }
	
	    x.open(method, url);
	
	    if (!useXDomainRequest) {
	      if (options.withCredentials) {
	        x.withCredentials = true;
	      }
	      utils._each(options.customHeaders, function (value, header) {
	        x.setRequestHeader(header, value);
	      });
	      if (options.preflight) {
	        x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
	      }
	      x.setRequestHeader('Content-Type', options.contentType || 'text/plain');
	    }
	    x.send(method === 'POST' && data);
	  } catch (error) {
	    utils.logError('xhr construction', error);
	  }
	}

/***/ },
/* 22 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	exports.parseQS = parseQS;
	exports.formatQS = formatQS;
	exports.parse = parse;
	exports.format = format;
	function parseQS(query) {
	  return !query ? {} : query.replace(/^\?/, '').split('&').reduce(function (acc, criteria) {
	    var _criteria$split = criteria.split('='),
	        _criteria$split2 = _slicedToArray(_criteria$split, 2),
	        k = _criteria$split2[0],
	        v = _criteria$split2[1];
	
	    if (/\[\]$/.test(k)) {
	      k = k.replace('[]', '');
	      acc[k] = acc[k] || [];
	      acc[k].push(v);
	    } else {
	      acc[k] = v || '';
	    }
	    return acc;
	  }, {});
	}
	
	function formatQS(query) {
	  return Object.keys(query).map(function (k) {
	    return Array.isArray(query[k]) ? query[k].map(function (v) {
	      return k + '[]=' + v;
	    }).join('&') : k + '=' + query[k];
	  }).join('&');
	}
	
	function parse(url) {
	  var parsed = document.createElement('a');
	  parsed.href = decodeURIComponent(url);
	  return {
	    protocol: (parsed.protocol || '').replace(/:$/, ''),
	    hostname: parsed.hostname,
	    port: +parsed.port,
	    pathname: parsed.pathname.replace(/^(?!\/)/, '/'),
	    search: parseQS(parsed.search || ''),
	    hash: (parsed.hash || '').replace(/^#/, ''),
	    host: parsed.host
	  };
	}
	
	function format(obj) {
	  return (obj.protocol || 'http') + '://' + (obj.host || obj.hostname + (obj.port ? ':' + obj.port : '')) + (obj.pathname || '') + (obj.search ? '?' + formatQS(obj.search || '') : '') + (obj.hash ? '#' + obj.hash : '');
	}

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _utils = __webpack_require__(2);
	
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var adloader = __webpack_require__(13);
	var utils = __webpack_require__(2);
	var CONSTANTS = __webpack_require__(3);
	
	/**
	 * Adapter for requesting bids from AdMedia.
	 *
	 */
	var AdmediaAdapter = function AdmediaAdapter() {
	
	  function _callBids(params) {
	    var bids,
	        bidderUrl = window.location.protocol + "//b.admedia.com/banner/prebid/bidder/?";
	    bids = params.bids || [];
	    for (var i = 0; i < bids.length; i++) {
	      var request_obj = {};
	      var bid = bids[i];
	
	      if (bid.params.aid) {
	        request_obj.aid = bid.params.aid;
	      } else {
	        utils.logError('required param aid is missing', "admedia");
	        continue;
	      }
	
	      //optional page_url macro
	      if (bid.params.page_url) {
	        request_obj.page_url = bid.params.page_url;
	      }
	
	      //if set, return a test ad for all aids
	      if (bid.params.test_ad === 1) {
	        request_obj.test_ad = 1;
	      }
	
	      var parsedSizes = utils.parseSizesInput(bid.sizes);
	      var parsedSizesLength = parsedSizes.length;
	      if (parsedSizesLength > 0) {
	        //first value should be "size"
	        request_obj.size = parsedSizes[0];
	        if (parsedSizesLength > 1) {
	          //any subsequent values should be "promo_sizes"
	          var promo_sizes = [];
	          for (var j = 1; j < parsedSizesLength; j++) {
	            promo_sizes.push(parsedSizes[j]);
	          }
	
	          request_obj.promo_sizes = promo_sizes.join(",");
	        }
	      }
	
	      //detect urls
	      request_obj.siteDomain = window.location.host;
	      request_obj.sitePage = window.location.href;
	      request_obj.siteRef = document.referrer;
	      request_obj.topUrl = utils.getTopWindowUrl();
	
	      request_obj.callbackId = bid.bidId;
	
	      var endpoint = bidderUrl + utils.parseQueryStringParameters(request_obj);
	
	      //utils.logMessage('Admedia request built: ' + endpoint);
	
	      adloader.loadScript(endpoint);
	    }
	  }
	
	  //expose the callback to global object
	  pbjs.admediaHandler = function (response) {
	    var bidObject = {};
	    var callback_id = response.callback_id;
	    var placementCode = '';
	    var bidObj = (0, _utils.getBidRequest)(callback_id);
	    if (bidObj) {
	      placementCode = bidObj.placementCode;
	    }
	
	    if (bidObj && response.cpm > 0 && !!response.ad) {
	      bidObject = bidfactory.createBid(CONSTANTS.STATUS.GOOD);
	      bidObject.bidderCode = bidObj.bidder;
	      bidObject.cpm = parseFloat(response.cpm);
	      bidObject.ad = response.ad;
	      bidObject.width = response.width;
	      bidObject.height = response.height;
	    } else {
	      bidObject = bidfactory.createBid(CONSTANTS.STATUS.NO_BID);
	      bidObject.bidderCode = bidObj.bidder;
	      utils.logMessage('No prebid response from Admedia for placement code ' + placementCode);
	    }
	
	    bidmanager.addBidResponse(placementCode, bidObject);
	  };
	
	  // Export the callBids function, so that prebid.js can execute this function
	  // when the page asks to send out bid requests.
	  return {
	    callBids: _callBids
	  };
	};
	
	module.exports = AdmediaAdapter;

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var bidmanager = __webpack_require__(11);
	var bidfactory = __webpack_require__(10);
	var utils = __webpack_require__(2);
	var adloader = __webpack_require__(13);
	
	var BidfluenceAdapter = function BidfluenceAdapter() {
	
	  var scriptUrl = "//cdn.bidfluence.com/forge.js";
	
	  pbjs.bfPbjsCB = function (bfr) {
	    var bidRequest = utils.getBidRequest(bfr.cbID);
	    var bidObject = null;
	    if (bfr.cpm > 0) {
	      bidObject = bidfactory.createBid(1, bidRequest);
	      bidObject.bidderCode = 'bidfluence';
	      bidObject.cpm = bfr.cpm;
	      bidObject.ad = bfr.ad;
	      bidObject.width = bfr.width;
	      bidObject.height = bfr.height;
	    } else {
	      bidObject = bidfactory.createBid(2, bidRequest);
	      bidObject.bidderCode = 'bidfluence';
	    }
	
	    bidmanager.addBidResponse(bfr.placementCode, bidObject);
	  };
	
	  function _callBids(params) {
	    var bfbids = params.bids || [];
	    for (var i = 0; i < bfbids.length; i++) {
	      var bid = bfbids[i];
	      call(bid);
	    }
	  }
	  function call(bid) {
	
	    var adunitId = utils.getBidIdParameter('adunitId', bid.params);
	    var publisherId = utils.getBidIdParameter('pubId', bid.params);
	    var reservePrice = utils.getBidIdParameter('reservePrice', bid.params);
	    var pbjsBfobj = {
	      placementCode: bid.placementCode,
	      cbID: bid.bidId
	    };
	
	    var cb = function cb() {
	      /* globals FORGE */
	      FORGE.init([adunitId, publisherId, pbjsBfobj, reservePrice]);
	    };
	
	    adloader.loadScript(scriptUrl, cb);
	  }
	  return {
	    callBids: _callBids
	  };
	};
	
	module.exports = BidfluenceAdapter;

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _adapter = __webpack_require__(14);
	
	var _adapter2 = _interopRequireDefault(_adapter);
	
	var _bidfactory = __webpack_require__(10);
	
	var _bidfactory2 = _interopRequireDefault(_bidfactory);
	
	var _bidmanager = __webpack_require__(11);
	
	var _bidmanager2 = _interopRequireDefault(_bidmanager);
	
	var _utils = __webpack_require__(2);
	
	var utils = _interopRequireWildcard(_utils);
	
	var _ajax = __webpack_require__(21);
	
	var _constants = __webpack_require__(3);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	var ENDPOINT = '//rtb.vertamedia.com/hb/';
	
	function VertamediaAdapter() {
	  var baseAdapter = _adapter2['default'].createNew('vertamedia'),
	      bidRequest;
	
	  baseAdapter.callBids = function (bidRequests) {
	    if (!bidRequests || !bidRequests.bids || bidRequests.bids.length === 0) {
	      return;
	    }
	
	    var RTBDataParams = prepareAndSaveRTBRequestParams(bidRequests.bids[0]);
	
	    if (!RTBDataParams) {
	      return;
	    }
	
	    (0, _ajax.ajax)(ENDPOINT, handleResponse, RTBDataParams, {
	      contentType: 'text/plain',
	      withCredentials: true,
	      method: 'GET'
	    });
	  };
	
	  function prepareAndSaveRTBRequestParams(bid) {
	    if (!bid || !bid.params || !bid.params.aid || !bid.placementCode) {
	      return;
	    }
	
	    bidRequest = bid;
	
	    var size = getSize(bid.sizes);
	
	    bidRequest.width = size.width;
	    bidRequest.height = size.height;
	
	    return {
	      aid: bid.params.aid,
	      w: size.width,
	      h: size.height,
	      domain: document.location.hostname
	    };
	  }
	
	  function getSize(requestSizes) {
	    var parsed = {},
	        size = utils.parseSizesInput(requestSizes)[0];
	
	    if (typeof size !== 'string') {
	      return parsed;
	    }
	
	    var parsedSize = size.toUpperCase().split('X');
	
	    return {
	      width: parseInt(parsedSize[0], 10) || undefined,
	      height: parseInt(parsedSize[1], 10) || undefined
	    };
	  }
	
	  /* Notify Prebid of bid responses so bids can get in the auction */
	  function handleResponse(response) {
	    var parsed;
	
	    try {
	      parsed = JSON.parse(response);
	    } catch (error) {
	      utils.logError(error);
	    }
	
	    if (!parsed || parsed.error || !parsed.bids || !parsed.bids.length) {
	      _bidmanager2['default'].addBidResponse(bidRequest.placementCode, createBid(_constants.STATUS.NO_BID));
	
	      return;
	    }
	
	    _bidmanager2['default'].addBidResponse(bidRequest.placementCode, createBid(_constants.STATUS.GOOD, parsed.bids[0]));
	  }
	
	  function createBid(status, tag) {
	    var bid = _bidfactory2['default'].createBid(status, tag);
	
	    bid.code = baseAdapter.getBidderCode();
	    bid.bidderCode = bidRequest.bidder;
	
	    if (!tag || status !== _constants.STATUS.GOOD) {
	      return bid;
	    }
	
	    bid.mediaType = 'video';
	    bid.cpm = tag.cpm;
	    bid.creative_id = tag.cmpId;
	    bid.width = bidRequest.width;
	    bid.height = bidRequest.height;
	    bid.descriptionUrl = tag.url;
	    bid.vastUrl = tag.url;
	
	    return bid;
	  }
	
	  return {
	    createNew: VertamediaAdapter.createNew,
	    callBids: baseAdapter.callBids,
	    setBidderCode: baseAdapter.setBidderCode
	  };
	}
	
	VertamediaAdapter.createNew = function () {
	  return new VertamediaAdapter();
	};
	
	module.exports = VertamediaAdapter;

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _templateObject = _taggedTemplateLiteral(['', '://', '/pubapi/3.0/', '/', '/', '/', '/ADTECH;v=2;cmd=bid;cors=yes;alias=', '', ';misc=', ''], ['', '://', '/pubapi/3.0/', '/', '/', '/', '/ADTECH;v=2;cmd=bid;cors=yes;alias=', '', ';misc=', '']),
	    _templateObject2 = _taggedTemplateLiteral(['', '://', '/bidRequest?'], ['', '://', '/bidRequest?']),
	    _templateObject3 = _taggedTemplateLiteral(['dcn=', '&pos=', '&cmd=bid', ''], ['dcn=', '&pos=', '&cmd=bid', '']);
	
	function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }
	
	var utils = __webpack_require__(2);
	var ajax = __webpack_require__(21).ajax;
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var constants = __webpack_require__(3);
	
	var AolAdapter = function AolAdapter() {
	
	  var showCpmAdjustmentWarning = true;
	  var pubapiTemplate = template(_templateObject, 'protocol', 'host', 'network', 'placement', 'pageid', 'sizeid', 'alias', 'bidfloor', 'misc');
	  var nexageBaseApiTemplate = template(_templateObject2, 'protocol', 'host');
	  var nexageGetApiTemplate = template(_templateObject3, 'dcn', 'pos', 'ext');
	  var BIDDER_CODE = 'aol';
	  var MP_SERVER_MAP = {
	    us: 'adserver-us.adtech.advertising.com',
	    eu: 'adserver-eu.adtech.advertising.com',
	    as: 'adserver-as.adtech.advertising.com'
	  };
	  var NEXAGE_SERVER = 'hb.nexage.com';
	  var SYNC_TYPES = {
	    iframe: 'IFRAME',
	    img: 'IMG'
	  };
	
	  var domReady = function () {
	    var readyEventFired = false;
	    return function (fn) {
	      var idempotentFn = function idempotentFn() {
	        if (readyEventFired) {
	          return;
	        }
	        readyEventFired = true;
	        return fn();
	      };
	
	      if (document.readyState === "complete") {
	        return idempotentFn();
	      }
	
	      document.addEventListener("DOMContentLoaded", idempotentFn, false);
	      window.addEventListener("load", idempotentFn, false);
	    };
	  }();
	
	  function dropSyncCookies(pixels) {
	    var pixelElements = parsePixelItems(pixels);
	    renderPixelElements(pixelElements);
	  }
	
	  function parsePixelItems(pixels) {
	    var itemsRegExp = /(img|iframe)[\s\S]*?src\s*=\s*("|')(.*?)\2/gi;
	    var tagNameRegExp = /\w*(?=\s)/;
	    var srcRegExp = /src=("|')(.*?)\1/;
	    var pixelsItems = [];
	
	    if (pixels) {
	      var matchedItems = pixels.match(itemsRegExp);
	      if (matchedItems) {
	        matchedItems.forEach(function (item) {
	          var tagNameMatches = item.match(tagNameRegExp);
	          var sourcesPathMatches = item.match(srcRegExp);
	          if (tagNameMatches && sourcesPathMatches) {
	            pixelsItems.push({
	              tagName: tagNameMatches[0].toUpperCase(),
	              src: sourcesPathMatches[2]
	            });
	          }
	        });
	      }
	    }
	
	    return pixelsItems;
	  }
	
	  function renderPixelElements(pixelsElements) {
	    pixelsElements.forEach(function (element) {
	      switch (element.tagName) {
	        case SYNC_TYPES.img:
	          return renderPixelImage(element);
	        case SYNC_TYPES.iframe:
	          return renderPixelIframe(element);
	      }
	    });
	  }
	
	  function renderPixelImage(pixelsItem) {
	    var image = new Image();
	    image.src = pixelsItem.src;
	  }
	
	  function renderPixelIframe(pixelsItem) {
	    var iframe = document.createElement('iframe');
	    iframe.width = 1;
	    iframe.height = 1;
	    iframe.style.display = 'none';
	    iframe.src = pixelsItem.src;
	    if (document.readyState === 'interactive' || document.readyState === 'complete') {
	      document.body.appendChild(iframe);
	    } else {
	      domReady(function () {
	        document.body.appendChild(iframe);
	      });
	    }
	  }
	
	  function template(strings) {
	    for (var _len = arguments.length, keys = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	      keys[_key - 1] = arguments[_key];
	    }
	
	    return function () {
	      for (var _len2 = arguments.length, values = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	        values[_key2] = arguments[_key2];
	      }
	
	      var dict = values[values.length - 1] || {};
	      var result = [strings[0]];
	      keys.forEach(function (key, i) {
	        var value = Number.isInteger(key) ? values[key] : dict[key];
	        result.push(value, strings[i + 1]);
	      });
	      return result.join('');
	    };
	  }
	
	  function _buildMarketplaceUrl(bid) {
	    var params = bid.params;
	    var serverParam = params.server;
	    var regionParam = params.region || 'us';
	    var server = void 0;
	
	    if (!MP_SERVER_MAP.hasOwnProperty(regionParam)) {
	      utils.logWarn('Unknown region \'' + regionParam + '\' for AOL bidder.');
	      regionParam = 'us'; // Default region.
	    }
	
	    if (serverParam) {
	      server = serverParam;
	    } else {
	      server = MP_SERVER_MAP[regionParam];
	    }
	
	    // Set region param, used by AOL analytics.
	    params.region = regionParam;
	
	    return pubapiTemplate({
	      protocol: document.location.protocol === 'https:' ? 'https' : 'http',
	      host: server,
	      network: params.network,
	      placement: parseInt(params.placement),
	      pageid: params.pageId || 0,
	      sizeid: params.sizeId || 0,
	      alias: params.alias || utils.getUniqueIdentifierStr(),
	      bidfloor: typeof params.bidFloor !== 'undefined' ? ';bidfloor=' + params.bidFloor.toString() : '',
	      misc: new Date().getTime() // cache busting
	    });
	  }
	
	  function _buildNexageApiUrl(bid) {
	    var _bid$params = bid.params,
	        dcn = _bid$params.dcn,
	        pos = _bid$params.pos;
	
	    var nexageApi = nexageBaseApiTemplate({
	      protocol: document.location.protocol === 'https:' ? 'https' : 'http',
	      host: bid.params.host || NEXAGE_SERVER
	    });
	    if (dcn && pos) {
	      var ext = '';
	      utils._each(bid.params.ext, function (value, key) {
	        ext += '&' + key + '=' + encodeURIComponent(value);
	      });
	      nexageApi += nexageGetApiTemplate({ dcn: dcn, pos: pos, ext: ext });
	    }
	    return nexageApi;
	  }
	
	  function _addErrorBidResponse(bid) {
	    var response = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	
	    var bidResponse = bidfactory.createBid(2, bid);
	    bidResponse.bidderCode = BIDDER_CODE;
	    bidResponse.reason = response.nbr;
	    bidResponse.raw = response;
	    bidmanager.addBidResponse(bid.placementCode, bidResponse);
	  }
	
	  function _addBidResponse(bid, response) {
	    var bidData = void 0;
	
	    try {
	      bidData = response.seatbid[0].bid[0];
	    } catch (e) {
	      _addErrorBidResponse(bid, response);
	      return;
	    }
	
	    var cpm = void 0;
	
	    if (bidData.ext && bidData.ext.encp) {
	      cpm = bidData.ext.encp;
	    } else {
	      cpm = bidData.price;
	
	      if (cpm === null || isNaN(cpm)) {
	        utils.logError('Invalid price in bid response', BIDDER_CODE, bid);
	        _addErrorBidResponse(bid, response);
	        return;
	      }
	    }
	
	    var ad = bidData.adm;
	    if (response.ext && response.ext.pixels) {
	      if (bid.params.userSyncOn === constants.EVENTS.BID_RESPONSE) {
	        dropSyncCookies(response.ext.pixels);
	      } else {
	        ad += response.ext.pixels;
	      }
	    }
	
	    var bidResponse = bidfactory.createBid(1, bid);
	    bidResponse.bidderCode = BIDDER_CODE;
	    bidResponse.ad = ad;
	    bidResponse.cpm = cpm;
	    bidResponse.width = bidData.w;
	    bidResponse.height = bidData.h;
	    bidResponse.creativeId = bidData.crid;
	    bidResponse.pubapiId = response.id;
	    bidResponse.currencyCode = response.cur;
	    if (bidData.dealid) {
	      bidResponse.dealId = bidData.dealid;
	    }
	
	    bidmanager.addBidResponse(bid.placementCode, bidResponse);
	  }
	
	  function _isNexageRequestPost(bid) {
	    if (bid.params.id && bid.params.imp && bid.params.imp[0]) {
	      var imp = bid.params.imp[0];
	      return imp.id && imp.tagid && (imp.banner && imp.banner.w && imp.banner.h || imp.video && imp.video.mimes && imp.video.minduration && imp.video.maxduration);
	    }
	  }
	
	  function _callBids(params) {
	    utils._each(params.bids, function (bid) {
	      var apiUrl = void 0;
	      var data = null;
	      var options = {
	        withCredentials: true
	      };
	      var isNexageRequestPost = _isNexageRequestPost(bid);
	      if (bid.params.placement && bid.params.network) {
	        apiUrl = _buildMarketplaceUrl(bid);
	      } else if (bid.params.dcn && bid.params.pos || isNexageRequestPost) {
	        apiUrl = _buildNexageApiUrl(bid);
	        if (isNexageRequestPost) {
	          data = bid.params;
	          options.customHeaders = {
	            'x-openrtb-version': '2.2'
	          };
	          options.method = 'POST';
	          options.contentType = 'application/json';
	        }
	      }
	      if (apiUrl) {
	        ajax(apiUrl, function (response) {
	          // Needs to be here in case bidderSettings are defined after requestBids() is called
	          if (showCpmAdjustmentWarning && pbjs.bidderSettings && pbjs.bidderSettings.aol && typeof pbjs.bidderSettings.aol.bidCpmAdjustment === 'function') {
	            utils.logWarn('bidCpmAdjustment is active for the AOL adapter. ' + 'As of Prebid 0.14, AOL can bid in net – please contact your accounts team to enable.');
	          }
	          showCpmAdjustmentWarning = false; // warning is shown at most once
	
	          if (!response && response.length <= 0) {
	            utils.logError('Empty bid response', BIDDER_CODE, bid);
	            _addErrorBidResponse(bid, response);
	            return;
	          }
	
	          try {
	            response = JSON.parse(response);
	          } catch (e) {
	            utils.logError('Invalid JSON in bid response', BIDDER_CODE, bid);
	            _addErrorBidResponse(bid, response);
	            return;
	          }
	
	          _addBidResponse(bid, response);
	        }, data, options);
	      }
	    });
	  }
	
	  return {
	    callBids: _callBids
	  };
	};
	
	module.exports = AolAdapter;

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _utils = __webpack_require__(2);
	
	var CONSTANTS = __webpack_require__(3);
	var utils = __webpack_require__(2);
	var adloader = __webpack_require__(13);
	var bidmanager = __webpack_require__(11);
	var bidfactory = __webpack_require__(10);
	var Adapter = __webpack_require__(14);
	
	var AppNexusAdapter;
	AppNexusAdapter = function AppNexusAdapter() {
	  var baseAdapter = Adapter.createNew('appnexus');
	  var usersync = false;
	
	  baseAdapter.callBids = function (params) {
	    //var bidCode = baseAdapter.getBidderCode();
	
	    var anArr = params.bids;
	
	    //var bidsCount = anArr.length;
	
	    //set expected bids count for callback execution
	    //bidmanager.setExpectedBidsCount(bidCode, bidsCount);
	
	    for (var i = 0; i < anArr.length; i++) {
	      var bidRequest = anArr[i];
	      var callbackId = bidRequest.bidId;
	      adloader.loadScript(buildJPTCall(bidRequest, callbackId));
	
	      //store a reference to the bidRequest from the callback id
	      //bidmanager.pbCallbackMap[callbackId] = bidRequest;
	    }
	  };
	
	  function buildJPTCall(bid, callbackId) {
	
	    //determine tag params
	    var placementId = utils.getBidIdParameter('placementId', bid.params);
	
	    //memberId will be deprecated, use member instead
	    var memberId = utils.getBidIdParameter('memberId', bid.params);
	    var member = utils.getBidIdParameter('member', bid.params);
	    var inventoryCode = utils.getBidIdParameter('invCode', bid.params);
	    var query = utils.getBidIdParameter('query', bid.params);
	    var referrer = utils.getBidIdParameter('referrer', bid.params);
	    var altReferrer = utils.getBidIdParameter('alt_referrer', bid.params);
	
	    //build our base tag, based on if we are http or https
	
	    var jptCall = 'http' + (document.location.protocol === 'https:' ? 's://secure.adnxs.com/jpt?' : '://ib.adnxs.com/jpt?');
	
	    jptCall = utils.tryAppendQueryString(jptCall, 'callback', 'pbjs.handleAnCB');
	    jptCall = utils.tryAppendQueryString(jptCall, 'callback_uid', callbackId);
	    jptCall = utils.tryAppendQueryString(jptCall, 'psa', '0');
	    jptCall = utils.tryAppendQueryString(jptCall, 'id', placementId);
	    if (member) {
	      jptCall = utils.tryAppendQueryString(jptCall, 'member', member);
	    } else if (memberId) {
	      jptCall = utils.tryAppendQueryString(jptCall, 'member', memberId);
	      utils.logMessage('appnexus.callBids: "memberId" will be deprecated soon. Please use "member" instead');
	    }
	
	    jptCall = utils.tryAppendQueryString(jptCall, 'code', inventoryCode);
	    jptCall = utils.tryAppendQueryString(jptCall, 'traffic_source_code', utils.getBidIdParameter('trafficSourceCode', bid.params));
	
	    //sizes takes a bit more logic
	    var sizeQueryString = '';
	    var parsedSizes = utils.parseSizesInput(bid.sizes);
	
	    //combine string into proper querystring for impbus
	    var parsedSizesLength = parsedSizes.length;
	    if (parsedSizesLength > 0) {
	      //first value should be "size"
	      sizeQueryString = 'size=' + parsedSizes[0];
	      if (parsedSizesLength > 1) {
	        //any subsequent values should be "promo_sizes"
	        sizeQueryString += '&promo_sizes=';
	        for (var j = 1; j < parsedSizesLength; j++) {
	          sizeQueryString += parsedSizes[j] += ',';
	        }
	
	        //remove trailing comma
	        if (sizeQueryString && sizeQueryString.charAt(sizeQueryString.length - 1) === ',') {
	          sizeQueryString = sizeQueryString.slice(0, sizeQueryString.length - 1);
	        }
	      }
	    }
	
	    if (sizeQueryString) {
	      jptCall += sizeQueryString + '&';
	    }
	
	    //this will be deprecated soon
	    var targetingParams = utils.parseQueryStringParameters(query);
	
	    if (targetingParams) {
	      //don't append a & here, we have already done it in parseQueryStringParameters
	      jptCall += targetingParams;
	    }
	
	    //append custom attributes:
	    var paramsCopy = _extends({}, bid.params);
	
	    //delete attributes already used
	    delete paramsCopy.placementId;
	    delete paramsCopy.memberId;
	    delete paramsCopy.invCode;
	    delete paramsCopy.query;
	    delete paramsCopy.referrer;
	    delete paramsCopy.alt_referrer;
	    delete paramsCopy.member;
	
	    //get the reminder
	    var queryParams = utils.parseQueryStringParameters(paramsCopy);
	
	    //append
	    if (queryParams) {
	      jptCall += queryParams;
	    }
	
	    //append referrer
	    if (referrer === '') {
	      referrer = utils.getTopWindowUrl();
	    }
	
	    jptCall = utils.tryAppendQueryString(jptCall, 'referrer', referrer);
	    jptCall = utils.tryAppendQueryString(jptCall, 'alt_referrer', altReferrer);
	
	    //remove the trailing "&"
	    if (jptCall.lastIndexOf('&') === jptCall.length - 1) {
	      jptCall = jptCall.substring(0, jptCall.length - 1);
	    }
	
	    // @if NODE_ENV='debug'
	    utils.logMessage('jpt request built: ' + jptCall);
	
	    // @endif
	
	    //append a timer here to track latency
	    bid.startTime = new Date().getTime();
	
	    return jptCall;
	  }
	
	  //expose the callback to the global object:
	  pbjs.handleAnCB = function (jptResponseObj) {
	
	    var bidCode;
	
	    if (jptResponseObj && jptResponseObj.callback_uid) {
	
	      var responseCPM;
	      var id = jptResponseObj.callback_uid;
	      var placementCode = '';
	      var bidObj = (0, _utils.getBidRequest)(id);
	      if (bidObj) {
	
	        bidCode = bidObj.bidder;
	
	        placementCode = bidObj.placementCode;
	
	        //set the status
	        bidObj.status = CONSTANTS.STATUS.GOOD;
	      }
	
	      // @if NODE_ENV='debug'
	      utils.logMessage('JSONP callback function called for ad ID: ' + id);
	
	      // @endif
	      var bid = [];
	      if (jptResponseObj.result && jptResponseObj.result.cpm && jptResponseObj.result.cpm !== 0) {
	        responseCPM = parseInt(jptResponseObj.result.cpm, 10);
	
	        //CPM response from /jpt is dollar/cent multiplied by 10000
	        //in order to avoid using floats
	        //switch CPM to "dollar/cent"
	        responseCPM = responseCPM / 10000;
	
	        //store bid response
	        //bid status is good (indicating 1)
	        var adId = jptResponseObj.result.creative_id;
	        bid = bidfactory.createBid(1, bidObj);
	        bid.creative_id = adId;
	        bid.bidderCode = bidCode;
	        bid.cpm = responseCPM;
	        bid.adUrl = jptResponseObj.result.ad;
	        bid.width = jptResponseObj.result.width;
	        bid.height = jptResponseObj.result.height;
	        bid.dealId = jptResponseObj.result.deal_id;
	
	        bidmanager.addBidResponse(placementCode, bid);
	      } else {
	        //no response data
	        // @if NODE_ENV='debug'
	        utils.logMessage('No prebid response from AppNexus for placement code ' + placementCode);
	
	        // @endif
	        //indicate that there is no bid for this placement
	        bid = bidfactory.createBid(2, bidObj);
	        bid.bidderCode = bidCode;
	        bidmanager.addBidResponse(placementCode, bid);
	      }
	
	      if (!usersync) {
	        var iframe = utils.createInvisibleIframe();
	        iframe.src = '//acdn.adnxs.com/ib/static/usersync/v3/async_usersync.html';
	        try {
	          document.body.appendChild(iframe);
	        } catch (error) {
	          utils.logError(error);
	        }
	        usersync = true;
	      }
	    } else {
	      //no response data
	      // @if NODE_ENV='debug'
	      utils.logMessage('No prebid response for placement %%PLACEMENT%%');
	
	      // @endif
	    }
	  };
	
	  return {
	    callBids: baseAdapter.callBids,
	    setBidderCode: baseAdapter.setBidderCode,
	    createNew: AppNexusAdapter.createNew,
	    buildJPTCall: buildJPTCall
	  };
	};
	
	AppNexusAdapter.createNew = function () {
	  return new AppNexusAdapter();
	};
	
	module.exports = AppNexusAdapter;

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var _adapter = __webpack_require__(14);
	
	var _adapter2 = _interopRequireDefault(_adapter);
	
	var _Renderer = __webpack_require__(29);
	
	var _bidfactory = __webpack_require__(10);
	
	var _bidfactory2 = _interopRequireDefault(_bidfactory);
	
	var _bidmanager = __webpack_require__(11);
	
	var _bidmanager2 = _interopRequireDefault(_bidmanager);
	
	var _utils = __webpack_require__(2);
	
	var utils = _interopRequireWildcard(_utils);
	
	var _ajax = __webpack_require__(21);
	
	var _constants = __webpack_require__(3);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	var ENDPOINT = '//ib.adnxs.com/ut/v2/prebid';
	var VIDEO_TARGETING = ['id', 'mimes', 'minduration', 'maxduration', 'startdelay', 'skippable', 'playback_method', 'frameworks'];
	var USER_PARAMS = ['age', 'external_uid', 'segments', 'gender', 'dnt', 'language'];
	
	/**
	 * Bidder adapter for /ut endpoint. Given the list of all ad unit tag IDs,
	 * sends out a bid request. When a bid response is back, registers the bid
	 * to Prebid.js. This adapter supports alias bidding.
	 */
	function AppnexusAstAdapter() {
	
	  var baseAdapter = _adapter2['default'].createNew('appnexusAst');
	  var bidRequests = {};
	  var usersync = false;
	
	  /* Prebid executes this function when the page asks to send out bid requests */
	  baseAdapter.callBids = function (bidRequest) {
	    var bids = bidRequest.bids || [];
	    var member = 0;
	    var userObj = void 0;
	    var tags = bids.filter(function (bid) {
	      return valid(bid);
	    }).map(function (bid) {
	      // map request id to bid object to retrieve adUnit code in callback
	      bidRequests[bid.bidId] = bid;
	
	      var tag = {};
	      tag.sizes = getSizes(bid.sizes);
	      tag.primary_size = tag.sizes[0];
	      tag.uuid = bid.bidId;
	      if (bid.params.placementId) {
	        tag.id = parseInt(bid.params.placementId, 10);
	      } else {
	        tag.code = bid.params.invCode;
	      }
	      tag.allow_smaller_sizes = bid.params.allowSmallerSizes || false;
	      tag.prebid = true;
	      tag.disable_psa = true;
	      member = parseInt(bid.params.member, 10);
	      if (bid.params.reserve) {
	        tag.reserve = bid.params.reserve;
	      }
	      if (bid.params.position) {
	        tag.position = { 'above': 1, 'below': 2 }[bid.params.position] || 0;
	      }
	      if (bid.params.trafficSourceCode) {
	        tag.traffic_source_code = bid.params.trafficSourceCode;
	      }
	      if (bid.params.privateSizes) {
	        tag.private_sizes = getSizes(bid.params.privateSizes);
	      }
	      if (bid.params.supplyType) {
	        tag.supply_type = bid.params.supplyType;
	      }
	      if (bid.params.pubClick) {
	        tag.pubclick = bid.params.pubClick;
	      }
	      if (bid.params.extInvCode) {
	        tag.ext_inv_code = bid.params.extInvCode;
	      }
	      if (bid.params.externalImpId) {
	        tag.external_imp_id = bid.params.externalImpId;
	      }
	      if (!utils.isEmpty(bid.params.keywords)) {
	        tag.keywords = getKeywords(bid.params.keywords);
	      }
	
	      if (bid.mediaType === 'video') {
	        tag.require_asset_url = true;
	      }
	      if (bid.params.video) {
	        tag.video = {};
	        // place any valid video params on the tag
	        Object.keys(bid.params.video).filter(function (param) {
	          return VIDEO_TARGETING.includes(param);
	        }).forEach(function (param) {
	          return tag.video[param] = bid.params.video[param];
	        });
	      }
	
	      if (bid.params.user) {
	        userObj = {};
	        Object.keys(bid.params.user).filter(function (param) {
	          return USER_PARAMS.includes(param);
	        }).forEach(function (param) {
	          return userObj[param] = bid.params.user[param];
	        });
	      }
	
	      return tag;
	    });
	
	    if (!utils.isEmpty(tags)) {
	      var payloadJson = { tags: [].concat(_toConsumableArray(tags)), user: userObj };
	      if (member > 0) {
	        payloadJson.member_id = member;
	      }
	      var payload = JSON.stringify(payloadJson);
	      (0, _ajax.ajax)(ENDPOINT, handleResponse, payload, {
	        contentType: 'text/plain',
	        withCredentials: true
	      });
	    }
	  };
	
	  /* Notify Prebid of bid responses so bids can get in the auction */
	  function handleResponse(response) {
	    var parsed = void 0;
	
	    try {
	      parsed = JSON.parse(response);
	    } catch (error) {
	      utils.logError(error);
	    }
	
	    if (!parsed || parsed.error) {
	      var errorMessage = 'in response for ' + baseAdapter.getBidderCode() + ' adapter';
	      if (parsed && parsed.error) {
	        errorMessage += ': ' + parsed.error;
	      }
	      utils.logError(errorMessage);
	
	      // signal this response is complete
	      Object.keys(bidRequests).map(function (bidId) {
	        return bidRequests[bidId].placementCode;
	      }).forEach(function (placementCode) {
	        _bidmanager2['default'].addBidResponse(placementCode, createBid(_constants.STATUS.NO_BID));
	      });
	      return;
	    }
	
	    parsed.tags.forEach(function (tag) {
	      var ad = getRtbBid(tag);
	      var cpm = ad && ad.cpm;
	      var type = ad && ad.ad_type;
	
	      var status = void 0;
	      if (cpm !== 0 && (type === 'banner' || type === 'video' || type === 'video-outstream')) {
	        status = _constants.STATUS.GOOD;
	      } else {
	        status = _constants.STATUS.NO_BID;
	      }
	
	      if (type && type !== 'banner' && type !== 'video' && type !== 'video-outstream') {
	        utils.logError(type + ' ad type not supported');
	      }
	
	      tag.bidId = tag.uuid; // bidfactory looks for bidId on requested bid
	      var bid = createBid(status, tag);
	      if (type === 'video') bid.mediaType = 'video';
	      if (type === 'video-outstream') bid.mediaType = 'video-outstream';
	      var placement = bidRequests[bid.adId].placementCode;
	      _bidmanager2['default'].addBidResponse(placement, bid);
	    });
	
	    if (!usersync) {
	      var iframe = utils.createInvisibleIframe();
	      iframe.src = '//acdn.adnxs.com/ib/static/usersync/v3/async_usersync.html';
	      try {
	        document.body.appendChild(iframe);
	      } catch (error) {
	        utils.logError(error);
	      }
	      usersync = true;
	    }
	  }
	
	  /* Check that a bid has required paramters */
	  function valid(bid) {
	    if (bid.params.placementId || bid.params.member && bid.params.invCode) {
	      return bid;
	    } else {
	      utils.logError('bid requires placementId or (member and invCode) params');
	    }
	  }
	
	  /* Turn keywords parameter into ut-compatible format */
	  function getKeywords(keywords) {
	    var arrs = [];
	
	    utils._each(keywords, function (v, k) {
	      if (utils.isArray(v)) {
	        var values = [];
	        utils._each(v, function (val) {
	          val = utils.getValueString('keywords.' + k, val);
	          if (val) {
	            values.push(val);
	          }
	        });
	        v = values;
	      } else {
	        v = utils.getValueString('keywords.' + k, v);
	        if (utils.isStr(v)) {
	          v = [v];
	        } else {
	          return;
	        } // unsuported types - don't send a key
	      }
	      arrs.push({ key: k, value: v });
	    });
	
	    return arrs;
	  }
	
	  /* Turn bid request sizes into ut-compatible format */
	  function getSizes(requestSizes) {
	    var sizes = [];
	    var sizeObj = {};
	
	    if (utils.isArray(requestSizes) && requestSizes.length === 2 && !utils.isArray(requestSizes[0])) {
	      sizeObj.width = parseInt(requestSizes[0], 10);
	      sizeObj.height = parseInt(requestSizes[1], 10);
	      sizes.push(sizeObj);
	    } else if ((typeof requestSizes === 'undefined' ? 'undefined' : _typeof(requestSizes)) === 'object') {
	      for (var i = 0; i < requestSizes.length; i++) {
	        var size = requestSizes[i];
	        sizeObj = {};
	        sizeObj.width = parseInt(size[0], 10);
	        sizeObj.height = parseInt(size[1], 10);
	        sizes.push(sizeObj);
	      }
	    }
	
	    return sizes;
	  }
	
	  function getRtbBid(tag) {
	    return tag && tag.ads && tag.ads.length && tag.ads.find(function (ad) {
	      return ad.rtb;
	    });
	  }
	
	  function outstreamRender(bid) {
	    window.ANOutstreamVideo.renderAd({
	      tagId: bid.adResponse.tag_id,
	      sizes: [bid.getSize().split('x')],
	      targetId: bid.adUnitCode, // target div id to render video
	      uuid: bid.adResponse.uuid,
	      adResponse: bid.adResponse,
	      rendererOptions: bid.renderer.getConfig()
	    }, handleOutstreamRendererEvents.bind(bid));
	  }
	
	  function onOutstreamRendererLoaded() {
	    // setup code for renderer, if any
	  }
	
	  function handleOutstreamRendererEvents(id, eventName) {
	    var bid = this;
	    bid.renderer.handleVideoEvent({ id: id, eventName: eventName });
	  }
	
	  /* Create and return a bid object based on status and tag */
	  function createBid(status, tag) {
	    var ad = getRtbBid(tag);
	    var bid = _bidfactory2['default'].createBid(status, tag);
	    bid.code = baseAdapter.getBidderCode();
	    bid.bidderCode = baseAdapter.getBidderCode();
	
	    if (ad && status === _constants.STATUS.GOOD) {
	      bid.cpm = ad.cpm;
	      bid.creative_id = ad.creative_id;
	      bid.dealId = ad.deal_id;
	
	      if (ad.rtb.video) {
	        bid.width = ad.rtb.video.player_width;
	        bid.height = ad.rtb.video.player_height;
	        bid.vastUrl = ad.rtb.video.asset_url;
	        bid.descriptionUrl = ad.rtb.video.asset_url;
	        if (ad.renderer_url) {
	
	          // outstream video
	
	          bid.adResponse = tag;
	          bid.renderer = _Renderer.Renderer.install({
	            id: ad.renderer_id,
	            url: ad.renderer_url,
	            config: { adText: 'AppNexus Outstream Video Ad via Prebid.js' },
	            callback: function callback() {
	              return onOutstreamRendererLoaded.call(null, bid);
	            }
	          });
	
	          try {
	            bid.renderer.setRender(outstreamRender);
	          } catch (err) {
	            utils.logWarning('Prebid Error calling setRender on renderer', err);
	          }
	
	          bid.renderer.setEventHandlers({
	            impression: function impression() {
	              return utils.logMessage('AppNexus outstream video impression event');
	            },
	            loaded: function loaded() {
	              return utils.logMessage('AppNexus outstream video loaded event');
	            },
	            ended: function ended() {
	              utils.logMessage('AppNexus outstream renderer video event');
	              document.querySelector('#' + bid.adUnitCode).style.display = 'none';
	            }
	          });
	
	          bid.adResponse.ad = bid.adResponse.ads[0];
	          bid.adResponse.ad.video = bid.adResponse.ad.rtb.video;
	        }
	      } else {
	        bid.width = ad.rtb.banner.width;
	        bid.height = ad.rtb.banner.height;
	        bid.ad = ad.rtb.banner.content;
	        try {
	          var url = ad.rtb.trackers[0].impression_urls[0];
	          var tracker = utils.createTrackPixelHtml(url);
	          bid.ad += tracker;
	        } catch (error) {
	          utils.logError('Error appending tracking pixel', error);
	        }
	      }
	    }
	
	    return bid;
	  }
	
	  return {
	    createNew: AppnexusAstAdapter.createNew,
	    callBids: baseAdapter.callBids,
	    setBidderCode: baseAdapter.setBidderCode
	  };
	}
	
	AppnexusAstAdapter.createNew = function () {
	  return new AppnexusAstAdapter();
	};
	
	module.exports = AppnexusAstAdapter;

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Renderer = Renderer;
	
	var _adloader = __webpack_require__(13);
	
	var _utils = __webpack_require__(2);
	
	var utils = _interopRequireWildcard(_utils);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }
	
	function Renderer(options) {
	  var url = options.url,
	      config = options.config,
	      id = options.id,
	      callback = options.callback;
	
	  this.url = url;
	  this.config = config;
	  this.callback = callback;
	  this.handlers = {};
	  this.id = id;
	
	  // we expect to load a renderer url once only so cache the request to load script
	  (0, _adloader.loadScript)(url, callback, true);
	}
	
	Renderer.install = function (_ref) {
	  var url = _ref.url,
	      config = _ref.config,
	      id = _ref.id,
	      callback = _ref.callback;
	
	  return new Renderer({ url: url, config: config, id: id, callback: callback });
	};
	
	Renderer.prototype.getConfig = function () {
	  return this.config;
	};
	
	Renderer.prototype.setRender = function (fn) {
	  this.render = fn;
	};
	
	Renderer.prototype.setEventHandlers = function (handlers) {
	  this.handlers = handlers;
	};
	
	Renderer.prototype.handleVideoEvent = function (_ref2) {
	  var id = _ref2.id,
	      eventName = _ref2.eventName;
	
	  if (typeof this.handlers[eventName] === 'function') {
	    this.handlers[eventName]();
	  }
	
	  utils.logMessage('Prebid Renderer event for id ' + id + ' type ' + eventName);
	};

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';
	
	var _adapter = __webpack_require__(14);
	
	var _adapter2 = _interopRequireDefault(_adapter);
	
	var _bidfactory = __webpack_require__(10);
	
	var _bidfactory2 = _interopRequireDefault(_bidfactory);
	
	var _bidmanager = __webpack_require__(11);
	
	var _bidmanager2 = _interopRequireDefault(_bidmanager);
	
	var _utils = __webpack_require__(2);
	
	var utils = _interopRequireWildcard(_utils);
	
	var _ajax = __webpack_require__(21);
	
	var _constants = __webpack_require__(3);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	var ENDPOINT = '//reachms.bfmio.com/bid.json?exchange_id=';
	
	function BeachfrontAdapter() {
	  var baseAdapter = _adapter2['default'].createNew('beachfront');
	
	  baseAdapter.callBids = function (bidRequests) {
	    var bids = bidRequests.bids || [];
	    bids.forEach(function (bid) {
	      var bidRequest = getBidRequest(bid);
	      var RTBDataParams = prepareAndSaveRTBRequestParams(bid);
	      if (!RTBDataParams) {
	        var error = "No bid params";
	        utils.logError(error);
	        if (bid && bid.placementCode) {
	          _bidmanager2['default'].addBidResponse(bid.placementCode, createBid(bid, _constants.STATUS.NO_BID));
	        }
	        return;
	      }
	      var BID_URL = ENDPOINT + RTBDataParams.appId;
	      (0, _ajax.ajax)(BID_URL, handleResponse(bidRequest), JSON.stringify(RTBDataParams), {
	        contentType: 'text/plain',
	        withCredentials: true
	      });
	    });
	  };
	
	  function getBidRequest(bid) {
	    if (!bid || !bid.params || !bid.params.appId) {
	      return;
	    }
	
	    var bidRequest = bid;
	    bidRequest.width = parseInt(bid.sizes[0], 10) || undefined;
	    bidRequest.height = parseInt(bid.sizes[1], 10) || undefined;
	    return bidRequest;
	  }
	
	  function prepareAndSaveRTBRequestParams(bid) {
	    if (!bid || !bid.params || !bid.params.appId || !bid.params.bidfloor) {
	      return;
	    }
	
	    function fetchDeviceType() {
	      return (/(ios|ipod|ipad|iphone|android)/i.test(global.navigator.userAgent) ? 1 : /(smart[-]?tv|hbbtv|appletv|googletv|hdmi|netcast\.tv|viera|nettv|roku|\bdtv\b|sonydtv|inettvbrowser|\btv\b)/i.test(global.navigator.userAgent) ? 1 : 2
	      );
	    }
	
	    var bidRequestObject = {
	      isPrebid: true,
	      appId: bid.params.appId,
	      domain: document.location.hostname,
	      imp: [{
	        video: {},
	        bidfloor: bid.params.bidfloor
	      }],
	      site: {
	        page: utils.getTopWindowLocation().host
	      },
	      device: {
	        ua: navigator.userAgent,
	        devicetype: fetchDeviceType()
	      },
	      cur: ["USD"]
	    };
	    return bidRequestObject;
	  }
	
	  /* Notify Prebid of bid responses so bids can get in the auction */
	  function handleResponse(bidRequest) {
	    return function (response) {
	      var parsed;
	      if (response) {
	        try {
	          parsed = JSON.parse(response);
	        } catch (error) {
	          utils.logError(error);
	        }
	      } else {
	        utils.logWarn("No bid response");
	      }
	
	      if (!parsed || parsed.error || !parsed.url || !parsed.bidPrice) {
	        utils.logWarn("No Valid Bid");
	        _bidmanager2['default'].addBidResponse(bidRequest.placementCode, createBid(bidRequest, _constants.STATUS.NO_BID));
	        return;
	      }
	
	      var newBid = {};
	      newBid.price = parsed.bidPrice;
	      newBid.url = parsed.url;
	      newBid.bidId = bidRequest.bidId;
	      _bidmanager2['default'].addBidResponse(bidRequest.placementCode, createBid(bidRequest, _constants.STATUS.GOOD, newBid));
	    };
	  }
	
	  function createBid(bidRequest, status, tag) {
	    var bid = _bidfactory2['default'].createBid(status, tag);
	    bid.code = baseAdapter.getBidderCode();
	    bid.bidderCode = bidRequest.bidder;
	    if (!tag || status !== _constants.STATUS.GOOD) {
	      return bid;
	    }
	
	    bid.cpm = tag.price;
	    bid.creative_id = tag.cmpId;
	    bid.width = bidRequest.width;
	    bid.height = bidRequest.height;
	    bid.descriptionUrl = tag.url;
	    bid.vastUrl = tag.url;
	    bid.mediaType = 'video';
	
	    return bid;
	  }
	
	  return {
	    createNew: BeachfrontAdapter.createNew,
	    callBids: baseAdapter.callBids,
	    setBidderCode: baseAdapter.setBidderCode
	  };
	}
	
	BeachfrontAdapter.createNew = function () {
	  return new BeachfrontAdapter();
	};
	
	module.exports = BeachfrontAdapter;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /**
	                                                                                                                                                                                                                                                                               * @file AudienceNetwork adapter.
	                                                                                                                                                                                                                                                                               */
	
	
	var _ajax = __webpack_require__(21);
	
	var _bidfactory = __webpack_require__(10);
	
	var _bidmanager = __webpack_require__(11);
	
	var _constants = __webpack_require__(3);
	
	var _url = __webpack_require__(22);
	
	var _utils = __webpack_require__(2);
	
	var _adapter = __webpack_require__(14);
	
	var _createNew = (0, _adapter.createNew)('audienceNetwork'),
	    setBidderCode = _createNew.setBidderCode,
	    getBidderCode = _createNew.getBidderCode;
	
	/**
	 * Does this bid request contain valid parameters?
	 * @param {Object} bid
	 * @returns {Boolean}
	 */
	
	
	var validateBidRequest = function validateBidRequest(bid) {
	  return _typeof(bid.params) === 'object' && typeof bid.params.placementId === 'string' && bid.params.placementId.length > 0 && Array.isArray(bid.sizes) && bid.sizes.length > 0;
	};
	
	/**
	 * Get a custom FB format if so configured
	 */
	var getFBFormat = function getFBFormat(bid) {
	  return bid.params.fullwidth ? 'fullwidth' : bid.params.native ? 'native' : null;
	};
	
	/**
	 * Return a copy of a bid with slot sizes filtered
	 * @param {Object} bid
	 * @returns {Object} Copy of bid
	 */
	var filterBidRequestSizes = function filterBidRequestSizes(bid) {
	  var sizes = Array.isArray(bid.sizes) && bid.sizes.filter(isValidSize).slice(0, 1);
	  return _extends({}, bid, { sizes: sizes });
	};
	
	/**
	 * Return a flattened size, or a format string
	 * @param {Object} bid
	 * @returns {String} size or format
	 */
	var flattenBidRequestSize = function flattenBidRequestSize(bid, size) {
	  return getFBFormat(bid) || flattenSize(size);
	};
	
	/**
	 * Flattens a 2-element [W, H] array as a 'WxH' string,
	 * otherwise passes value through.
	 * @param {Array|String} size
	 * @returns {String}
	 */
	var flattenSize = function flattenSize(size) {
	  return Array.isArray(size) && size.length === 2 ? size[0] + 'x' + size[1] : size;
	};
	
	/**
	 * Is this a valid slot size?
	 * @param {Array} size
	 * @returns {Boolean}
	 */
	var isValidSize = function isValidSize(size) {
	  return Array.isArray(size) && size.length === 2 && [[300, 250], [320, 50]].some(function (good) {
	    return good.every(function (val, i) {
	      return val === size[i];
	    });
	  });
	};
	
	/**
	 * Does the search part of the URL contain "anhb_testmode"
	 * and therefore indicate testmode should be used?
	 * @returns {String} "true" or "false"
	 */
	var isTestmode = function isTestmode() {
	  return Boolean(window && window.location && typeof window.location.search === 'string' && window.location.search.indexOf('anhb_testmode') !== -1).toString();
	};
	
	/**
	 * Parse JSON-as-string into an Object, default to empty.
	 * @param {String} JSON-as-string
	 * @returns {Object}
	 */
	var parseJson = function parseJson(jsonAsString) {
	  var data = {};
	  try {
	    data = JSON.parse(jsonAsString);
	  } catch (err) {}
	  return data;
	};
	
	/**
	 * Generate ad HTML for injection into an iframe
	 * @param {String} placementId
	 * @param {String} size
	 * @param {String} bidId
	 * @returns {String} HTML
	 */
	var createAdHtml = function createAdHtml(placementId, format, bidId) {
	  var nativeStyle = format === 'native' ? '<script>window.onload=function(){if(parent){var o=document.getElementsByTagName("head")[0];var s=parent.document.getElementsByTagName("style");for(var i=0;i<s.length;i++)o.appendChild(s[i].cloneNode(true));}}</script>' : '';
	  var nativeContainer = format === 'native' ? '<div class="thirdPartyRoot"><a class="fbAdLink"><div class="fbAdMedia thirdPartyMediaClass"></div><div class="fbAdSubtitle thirdPartySubtitleClass"></div><div class="fbDefaultNativeAdWrapper"><div class="fbAdCallToAction thirdPartyCallToActionClass"></div><div class="fbAdTitle thirdPartyTitleClass"></div></div></a></div>' : '';
	  return '<html><head>' + nativeStyle + '</head><body><div style="display:none;position:relative;">\n<script type=\'text/javascript\'>var data = {placementid:\'' + placementId + '\',format:\'' + format + '\',bidid:\'' + bidId + '\',onAdLoaded:function(e){console.log(\'Audience Network [' + placementId + '] ad loaded\');e.style.display = \'block\';},onAdError:function(c,m){console.log(\'Audience Network [' + placementId + '] error (\' + c + \') \' + m);}};\n(function(a,b,c){var d=\'https://www.facebook.com\',e=\'https://connect.facebook.net/en_US/fbadnw55.js\',f={iframeLoaded:true,xhrLoaded:true},g=a.data,h=function(){if(Date.now){return Date.now();}else return +new Date();},i=function(aa){var ba=d+\'/audience_network/client_event\',ca={cb:h(),event_name:\'ADNW_ADERROR\',ad_pivot_type:\'audience_network_mobile_web\',sdk_version:\'5.5.web\',app_id:g.placementid.split(\'_\')[0],publisher_id:g.placementid.split(\'_\')[1],error_message:aa},da=[];for(var ea in ca)da.push(encodeURIComponent(ea)+\'=\'+encodeURIComponent(ca[ea]));var fa=ba+\'?\'+da.join(\'&\'),ga=new XMLHttpRequest();ga.open(\'GET\',fa,true);ga.send();if(g.onAdError)g.onAdError(\'1000\',\'Internal error.\');},j=function(){if(b.currentScript){return b.currentScript;}else{var aa=b.getElementsByTagName(\'script\');return aa[aa.length-1];}},k=function(aa){try{return aa.document.referrer;}catch(ba){}return \'\';},l=function(){var aa=a,ba=[aa];try{while(aa!==aa.parent&&aa.parent.document)ba.push(aa=aa.parent);}catch(ca){}return ba.reverse();},m=function(){var aa=l();for(var ba=0;ba<aa.length;ba++){var ca=aa[ba],da=ca.ADNW||{};ca.ADNW=da;if(!ca.ADNW)continue;return da.v55=da.v55||{ads:[],window:ca};}throw new Error(\'no_writable_global\');},n=function(aa){var ba=aa.indexOf(\'/\',aa.indexOf(\'://\')+3);if(ba===-1)return aa;return aa.substring(0,ba);},o=function(aa){return aa.location.href||k(aa);},p=function(aa){if(aa.sdkLoaded)return;var ba=aa.window.document,ca=ba.createElement(\'iframe\');ca.name=\'fbadnw\';ca.style.display=\'none\';ba.body.appendChild(ca);var da=ca.contentDocument.createElement(\'script\');da.src=e;da.async=true;ca.contentDocument.body.appendChild(da);aa.sdkLoaded=true;},q=function(aa){var ba=/https?:\\/\\/www\\.google(\\.com?)?\\.\\w{2,3}$/;return !!aa.match(ba);},r=function(aa){return !!aa.match(/cdn\\.ampproject\\.org$/);},s=function(){var aa=c.ancestorOrigins||[],ba=aa[aa.length-1]||c.origin,ca=aa[aa.length-2]||c.origin;if(q(ba)&&r(ca)){return n(ca);}else return n(ba);},t=function(aa){try{return JSON.parse(aa);}catch(ba){i(ba.message);throw ba;}},u=function(aa,ba,ca){if(!aa.iframe){var da=ca.createElement(\'iframe\');da.src=d+\'/audiencenetwork/iframe/\';da.style.display=\'none\';ca.body.appendChild(da);aa.iframe=da;aa.iframeAppendedTime=h();aa.iframeData={};}ba.iframe=aa.iframe;ba.iframeData=aa.iframeData;ba.tagJsIframeAppendedTime=aa.iframeAppendedTime||0;},v=function(aa){var ba=d+\'/audiencenetwork/xhr/?sdk=5.5.web\';for(var ca in aa)if(typeof aa[ca]!==\'function\')ba+=\'&\'+ca+\'=\'+encodeURIComponent(aa[ca]);var da=new XMLHttpRequest();da.open(\'GET\',ba,true);da.withCredentials=true;da.onreadystatechange=function(){if(da.readyState===4){var ea=t(da.response);aa.events.push({name:\'xhrLoaded\',source:aa.iframe.contentWindow,data:ea,postMessageTimestamp:h(),receivedTimestamp:h()});}};da.send();},w=function(aa,ba){var ca=d+\'/audiencenetwork/xhriframe/?sdk=5.5.web\';for(var da in ba)if(typeof ba[da]!==\'function\')ca+=\'&\'+da+\'=\'+encodeURIComponent(ba[da]);var ea=b.createElement(\'iframe\');ea.src=ca;ea.style.display=\'none\';b.body.appendChild(ea);ba.iframe=ea;ba.iframeData={};ba.tagJsIframeAppendedTime=h();},x=function(aa){var ba=function(event){try{var da=event.data;if(da.name in f)aa.events.push({name:da.name,source:event.source,data:da.data});}catch(ea){}},ca=aa.iframe.contentWindow.parent;ca.addEventListener(\'message\',ba,false);},y=function(aa){if(aa.context&&aa.context.sourceUrl)return true;try{return !!JSON.parse(decodeURI(aa.name)).ampcontextVersion;}catch(ba){return false;}},z=function(aa){var ba=h(),ca=l()[0],da=j().parentElement,ea=ca!=a.top,fa=ca.$sf&&ca.$sf.ext,ga=o(ca),ha=m();p(ha);var ia={amp:y(ca),events:[],tagJsInitTime:ba,rootElement:da,iframe:null,tagJsIframeAppendedTime:ha.iframeAppendedTime||0,url:ga,domain:s(),channel:n(o(ca)),width:screen.width,height:screen.height,pixelratio:a.devicePixelRatio,placementindex:ha.ads.length,crossdomain:ea,safeframe:!!fa,placementid:g.placementid,format:g.format||\'300x250\',testmode:!!g.testmode,onAdLoaded:g.onAdLoaded,onAdError:g.onAdError};if(g.bidid)ia.bidid=g.bidid;if(ea){w(ha,ia);}else{u(ha,ia,ca.document);v(ia);}; x(ia);ia.rootElement.dataset.placementid=ia.placementid;ha.ads.push(ia);};try{z();}catch(aa){i(aa.message||aa);throw aa;}})(window,document,location);\n</script>\n' + nativeContainer + '</div></body></html>';
	};
	
	/**
	 * Creates a "good" Bid object with the given bid ID and CPM.
	 * @param {String} placementId
	 * @param {String} bidId
	 * @param {String} size
	 * @param {Number} cpmCents
	 * @returns {Object} Bid
	 */
	var createSuccessBidResponse = function createSuccessBidResponse(placementId, size, bidId, cpmCents, format) {
	  var bid = (0, _bidfactory.createBid)(_constants.STATUS.GOOD, { bidId: bidId });
	  // Prebid attributes
	  bid.bidderCode = getBidderCode();
	  bid.cpm = cpmCents / 100;
	  bid.ad = createAdHtml(placementId, format, bidId);
	
	
	  // Audience Network attributes
	  var _ref = [size[0], size[1]];
	  bid.width = _ref[0];
	  bid.height = _ref[1];
	  bid.hb_bidder = 'fan';
	  bid.fb_bidid = bidId;
	  bid.fb_format = format;
	  bid.fb_placementid = placementId;
	  return bid;
	};
	
	/**
	 * Creates a "no bid" Bid object.
	 * @returns {Object} Bid
	 */
	var createFailureBidResponse = function createFailureBidResponse() {
	  var bid = (0, _bidfactory.createBid)(_constants.STATUS.NO_BID);
	  bid.bidderCode = getBidderCode();
	  return bid;
	};
	
	/**
	 * Fetch bids for given parameters.
	 * @param {Object} bidRequest
	 * @param {Array} params.bids - list of bids
	 * @param {String} params.bids[].placementCode - Prebid placement identifier
	 * @param {Object} params.bids[].params
	 * @param {String} params.bids[].params.placementId - Audience Network placement identifier
	 * @param {Boolean} params.bids[].params.fullwidth - fullwidth flag or unset
	 * @param {Boolean} params.bids[].params.native - native flag or unset
	 * @param {Array} params.bids[].sizes - list of desired advert sizes
	 * @param {Array} params.bids[].sizes[] - Size arrays [h,w]: should include one of [300, 250], [320, 50]: first matched size is used
	 * @returns {void}
	 */
	var callBids = function callBids(bidRequest) {
	  // Build lists of adUnitCodes, placementids and adformats
	  var adUnitCodes = [];
	  var placementids = [];
	  var adformats = [];
	  var sizes = [];
	  bidRequest.bids.map(filterBidRequestSizes).filter(validateBidRequest).forEach(function (bid) {
	    adUnitCodes.push(bid.placementCode);
	    placementids.push(bid.params.placementId);
	    adformats.push(flattenBidRequestSize(bid, bid.sizes[0]));
	    sizes.push(bid.sizes[0]);
	  });
	
	  if (placementids.length) {
	    // Build URL
	    var testmode = isTestmode();
	    var url = (0, _url.format)({
	      protocol: 'https',
	      host: 'an.facebook.com',
	      pathname: '/v2/placementbid.json',
	      search: {
	        sdk: '5.5.web',
	        testmode: testmode,
	        placementids: placementids,
	        adformats: adformats
	      }
	    });
	    // Request
	    (0, _ajax.ajax)(url, function (res) {
	      // Handle response
	      var data = parseJson(res);
	      if (data.errors && data.errors.length) {
	        var noBid = createFailureBidResponse();
	        adUnitCodes.forEach(function (adUnitCode) {
	          return (0, _bidmanager.addBidResponse)(adUnitCode, noBid);
	        });
	        data.errors.forEach(_utils.logError);
	      } else {
	        // For each placementId in bids Object
	        Object.keys(data.bids)
	        // extract Array of bid responses
	        .map(function (placementId) {
	          return data.bids[placementId];
	        })
	        // flatten
	        .reduce(function (a, b) {
	          return a.concat(b);
	        }, [])
	        // call addBidResponse
	        .forEach(function (bid, i) {
	          return (0, _bidmanager.addBidResponse)(adUnitCodes[i], createSuccessBidResponse(bid.placement_id, sizes[i], bid.bid_id, bid.bid_price_cents, adformats[i]));
	        });
	      }
	    }, null, { withCredentials: true });
	  } else {
	    // No valid bids
	    (0, _utils.logError)('No valid bids requested');
	  }
	};
	
	/**
	 * @class AudienceNetwork
	 * @type {Object}
	 * @property {Function} callBids - fetch bids for given parameters
	 * @property {Function} setBidderCode - used for bidder aliasing
	 * @property {Function} getBidderCode - unique 'audienceNetwork' identifier
	 */
	var AudienceNetwork = function AudienceNetwork() {
	  return { callBids: callBids, setBidderCode: setBidderCode, getBidderCode: getBidderCode };
	};
	
	module.exports = AudienceNetwork;

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var VERSION = '2.0.1',
	    CONSTANTS = __webpack_require__(3),
	    utils = __webpack_require__(2),
	    bidfactory = __webpack_require__(10),
	    bidmanager = __webpack_require__(11),
	    adloader = __webpack_require__(13),
	    ajax = __webpack_require__(21).ajax;
	
	/**
	 * Adapter for requesting bids from Conversant
	 */
	var ConversantAdapter = function ConversantAdapter() {
	  var w = window,
	      n = navigator;
	
	  // production endpoint
	  var conversantUrl = '//media.msg.dotomi.com/s2s/header?callback=pbjs.conversantResponse';
	
	  // SSAPI returns JSONP with window.pbjs.conversantResponse as the cb
	  var appendScript = function appendScript(code) {
	    var script = document.createElement('script');
	    script.type = 'text/javascript';
	    script.className = 'cnvr-response';
	
	    try {
	      script.appendChild(document.createTextNode(code));
	      document.getElementsByTagName('head')[0].appendChild(script);
	    } catch (e) {
	      script.text = code;
	      document.getElementsByTagName('head')[0].appendChild(script);
	    }
	  };
	
	  var getDNT = function getDNT() {
	    return n.doNotTrack === '1' || w.doNotTrack === '1' || n.msDoNotTrack === '1' || n.doNotTrack === 'yes';
	  };
	
	  var getDevice = function getDevice() {
	    var language = n.language ? 'language' : 'userLanguage';
	    return {
	      h: screen.height,
	      w: screen.width,
	      dnt: getDNT() ? 1 : 0,
	      language: n[language].split('-')[0],
	      make: n.vendor ? n.vendor : '',
	      ua: n.userAgent
	    };
	  };
	
	  var callBids = function callBids(params) {
	    var conversantBids = params.bids || [];
	    requestBids(conversantBids);
	  };
	
	  var requestBids = function requestBids(bidReqs) {
	    // build bid request object
	    var page = location.pathname + location.search + location.hash,
	        siteId = '',
	        conversantImps = [],
	        conversantBidReqs,
	        secure = 0;
	
	    //build impression array for conversant
	    utils._each(bidReqs, function (bid) {
	      var bidfloor = utils.getBidIdParameter('bidfloor', bid.params),
	          adW = 0,
	          adH = 0,
	          imp;
	
	      secure = utils.getBidIdParameter('secure', bid.params) ? 1 : secure;
	      siteId = utils.getBidIdParameter('site_id', bid.params) + '';
	
	      // Allow sizes to be overridden per placement
	      var bidSizes = Array.isArray(bid.params.sizes) ? bid.params.sizes : bid.sizes;
	
	      if (bidSizes.length === 2 && typeof bidSizes[0] === 'number' && typeof bidSizes[1] === 'number') {
	        adW = bidSizes[0];
	        adH = bidSizes[1];
	      } else {
	        adW = bidSizes[0][0];
	        adH = bidSizes[0][1];
	      }
	
	      imp = {
	        id: bid.bidId,
	        banner: {
	          w: adW,
	          h: adH
	        },
	        secure: secure,
	        bidfloor: bidfloor ? bidfloor : 0,
	        displaymanager: 'Prebid.js',
	        displaymanagerver: VERSION
	      };
	
	      conversantImps.push(imp);
	    });
	
	    conversantBidReqs = {
	      'id': utils.getUniqueIdentifierStr(),
	      'imp': conversantImps,
	
	      'site': {
	        'id': siteId,
	        'mobile': document.querySelector('meta[name="viewport"][content*="width=device-width"]') !== null ? 1 : 0,
	        'page': page
	      },
	
	      'device': getDevice(),
	      'at': 1
	    };
	
	    var url = secure ? 'https:' + conversantUrl : location.protocol + conversantUrl;
	    ajax(url, appendScript, JSON.stringify(conversantBidReqs), {
	      withCredentials: true
	    });
	  };
	
	  var addEmptyBidResponses = function addEmptyBidResponses(placementsWithBidsBack) {
	    var allConversantBidRequests = pbjs._bidsRequested.find(function (bidSet) {
	      return bidSet.bidderCode === 'conversant';
	    });
	
	    if (allConversantBidRequests && allConversantBidRequests.bids) {
	      utils._each(allConversantBidRequests.bids, function (conversantBid) {
	        if (!utils.contains(placementsWithBidsBack, conversantBid.placementCode)) {
	          // Add a no-bid response for this placement.
	          var bid = bidfactory.createBid(2, conversantBid);
	          bid.bidderCode = 'conversant';
	          bidmanager.addBidResponse(conversantBid.placementCode, bid);
	        }
	      });
	    }
	  };
	
	  var parseSeatbid = function parseSeatbid(bidResponse) {
	    var placementsWithBidsBack = [];
	    utils._each(bidResponse.bid, function (conversantBid) {
	      var responseCPM,
	          placementCode = '',
	          id = conversantBid.impid,
	          bid = {},
	          responseAd,
	          responseNurl,
	          sizeArrayLength;
	
	      // Bid request we sent Conversant
	      var bidRequested = pbjs._bidsRequested.find(function (bidSet) {
	        return bidSet.bidderCode === 'conversant';
	      }).bids.find(function (bid) {
	        return bid.bidId === id;
	      });
	
	      if (bidRequested) {
	        placementCode = bidRequested.placementCode;
	        bidRequested.status = CONSTANTS.STATUS.GOOD;
	        responseCPM = parseFloat(conversantBid.price);
	
	        if (responseCPM !== 0.0) {
	          conversantBid.placementCode = placementCode;
	          placementsWithBidsBack.push(placementCode);
	          conversantBid.size = bidRequested.sizes;
	          responseAd = conversantBid.adm || '';
	          responseNurl = conversantBid.nurl || '';
	
	          // Our bid!
	          bid = bidfactory.createBid(1, bidRequested);
	          bid.creative_id = conversantBid.id || '';
	          bid.bidderCode = 'conversant';
	
	          bid.cpm = responseCPM;
	
	          // Track impression image onto returned html
	          bid.ad = responseAd + '<img src=\"' + responseNurl + '\" />';
	
	          sizeArrayLength = bidRequested.sizes.length;
	          if (sizeArrayLength === 2 && typeof bidRequested.sizes[0] === 'number' && typeof bidRequested.sizes[1] === 'number') {
	            bid.width = bidRequested.sizes[0];
	            bid.height = bidRequested.sizes[1];
	          } else {
	            bid.width = bidRequested.sizes[0][0];
	            bid.height = bidRequested.sizes[0][1];
	          }
	
	          bidmanager.addBidResponse(placementCode, bid);
	        }
	      }
	    });
	    addEmptyBidResponses(placementsWithBidsBack);
	  };
	
	  // Register our callback to the global object:
	  pbjs.conversantResponse = function (conversantResponseObj, path) {
	    // valid object?
	    if (conversantResponseObj && conversantResponseObj.id) {
	      if (conversantResponseObj.seatbid && conversantResponseObj.seatbid.length > 0 && conversantResponseObj.seatbid[0].bid && conversantResponseObj.seatbid[0].bid.length > 0) {
	        utils._each(conversantResponseObj.seatbid, parseSeatbid);
	      } else {
	        //no response data for any placements
	        addEmptyBidResponses([]);
	      }
	    } else {
	      //no response data for any placements
	      addEmptyBidResponses([]);
	    }
	    // for debugging purposes
	    if (path) {
	      adloader.loadScript(path, function () {
	        var allConversantBidRequests = pbjs._bidsRequested.find(function (bidSet) {
	          return bidSet.bidderCode === 'conversant';
	        });
	
	        if (pbjs.conversantDebugResponse) {
	          pbjs.conversantDebugResponse(allConversantBidRequests);
	        }
	      });
	    }
	  }; // conversantResponse
	
	  return {
	    callBids: callBids
	  };
	};
	
	module.exports = ConversantAdapter;

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var adLoader = __webpack_require__(13);
	
	var DistrictmAdaptor = function districtmAdaptor() {
	  var _this = this;
	
	  var districtmUrl = window.location.protocol + '//prebid.districtm.ca/lib.js';
	  this.callBids = function (params) {
	    if (!window.hb_dmx_res) {
	      adLoader.loadScript(districtmUrl, function () {
	        _this.sendBids(params);
	      });
	    } else {
	      _this.sendBids(params);
	    }
	    return params;
	  };
	
	  this.handlerRes = function (response, bidObject) {
	    var bid = void 0;
	    if (parseFloat(response.result.cpm) > 0) {
	      bid = bidfactory.createBid(1);
	      bid.bidderCode = bidObject.bidder;
	      bid.cpm = response.result.cpm;
	      bid.width = response.result.width;
	      bid.height = response.result.height;
	      bid.ad = response.result.banner;
	      bidmanager.addBidResponse(bidObject.placementCode, bid);
	    } else {
	      bid = bidfactory.createBid(2);
	      bid.bidderCode = bidObject.bidder;
	      bidmanager.addBidResponse(bidObject.placementCode, bid);
	    }
	
	    return bid;
	  };
	
	  this.sendBids = function (params) {
	    var bids = params.bids;
	    for (var i = 0; i < bids.length; i++) {
	      bids[i].params.sizes = window.hb_dmx_res.auction.fixSize(bids[i].sizes);
	    }
	    window.hb_dmx_res.auction.run(window.hb_dmx_res.ssp, bids, this.handlerRes);
	    return bids;
	  };
	
	  return {
	    callBids: this.callBids,
	    sendBids: this.sendBids,
	    handlerRes: this.handlerRes
	  };
	};
	
	module.exports = DistrictmAdaptor;

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(2);
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var adloader = __webpack_require__(13);
	var STATUS = __webpack_require__(3).STATUS;
	
	var FidelityAdapter = function FidelityAdapter() {
	  var FIDELITY_BIDDER_NAME = 'fidelity';
	  var FIDELITY_SERVER_NAME = 'x.fidelity-media.com';
	
	  function _callBids(params) {
	    var bids = params.bids || [];
	    bids.forEach(function (currentBid) {
	      var server = currentBid.params.server || FIDELITY_SERVER_NAME;
	      var m3_u = window.location.protocol + '//' + server + '/delivery/hb.php?';
	      m3_u += 'callback=window.pbjs.fidelityResponse';
	      m3_u += '&requestid=' + utils.getUniqueIdentifierStr();
	      m3_u += '&impid=' + currentBid.bidId;
	      m3_u += '&zoneid=' + currentBid.params.zoneid;
	      m3_u += '&cb=' + Math.floor(Math.random() * 99999999999);
	      m3_u += document.charset ? '&charset=' + document.charset : document.characterSet ? '&charset=' + document.characterSet : '';
	
	      var loc;
	      try {
	        loc = window.top !== window ? document.referrer : window.location.href;
	      } catch (e) {
	        loc = document.referrer;
	      }
	      loc = currentBid.params.loc || loc;
	      m3_u += '&loc=' + encodeURIComponent(loc);
	
	      var subid = currentBid.params.subid || 'hb';
	      m3_u += '&subid=' + subid;
	      if (document.referrer) m3_u += '&referer=' + encodeURIComponent(document.referrer);
	      if (currentBid.params.click) m3_u += '&ct0=' + encodeURIComponent(currentBid.params.click);
	      m3_u += '&flashver=' + encodeURIComponent(getFlashVersion());
	
	      adloader.loadScript(m3_u);
	    });
	  }
	
	  function getFlashVersion() {
	    var plugins, plugin, result;
	
	    if (navigator.plugins && navigator.plugins.length > 0) {
	      plugins = navigator.plugins;
	      for (var i = 0; i < plugins.length && !result; i++) {
	        plugin = plugins[i];
	        if (plugin.name.indexOf("Shockwave Flash") > -1) {
	          result = plugin.description.split("Shockwave Flash ")[1];
	        }
	      }
	    }
	    return result ? result : "";
	  }
	
	  function addBlankBidResponses(placementsWithBidsBack) {
	    var allFidelityBidRequests = pbjs._bidsRequested.find(function (bidSet) {
	      return bidSet.bidderCode === FIDELITY_BIDDER_NAME;
	    });
	
	    if (allFidelityBidRequests && allFidelityBidRequests.bids) {
	      utils._each(allFidelityBidRequests.bids, function (fidelityBid) {
	        if (!utils.contains(placementsWithBidsBack, fidelityBid.placementCode)) {
	          // Add a no-bid response for this placement.
	          var bid = bidfactory.createBid(STATUS.NO_BID, fidelityBid);
	          bid.bidderCode = FIDELITY_BIDDER_NAME;
	          bidmanager.addBidResponse(fidelityBid.placementCode, bid);
	        }
	      });
	    }
	  }
	
	  pbjs.fidelityResponse = function (responseObj) {
	
	    if (!responseObj || !responseObj.seatbid || responseObj.seatbid.length === 0 || !responseObj.seatbid[0].bid || responseObj.seatbid[0].bid.length === 0) {
	      addBlankBidResponses([]);
	      return;
	    }
	
	    var bid = responseObj.seatbid[0].bid[0];
	    var status = bid.adm ? STATUS.GOOD : STATUS.NO_BID;
	    var requestObj = utils.getBidRequest(bid.impid);
	
	    var bidResponse = bidfactory.createBid(status);
	    bidResponse.bidderCode = FIDELITY_BIDDER_NAME;
	    if (status === STATUS.GOOD) {
	      bidResponse.cpm = parseFloat(bid.price);
	      bidResponse.ad = bid.adm;
	      bidResponse.width = parseInt(bid.width);
	      bidResponse.height = parseInt(bid.height);
	    }
	    var placementCode = requestObj && requestObj.placementCode;
	    bidmanager.addBidResponse(placementCode, bidResponse);
	  };
	
	  return {
	    callBids: _callBids
	  };
	};
	
	module.exports = FidelityAdapter;

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var utils = __webpack_require__(2);
	var adloader = __webpack_require__(13);
	
	var BIDDER_CODE = 'gumgum';
	var CALLBACKS = {};
	
	var GumgumAdapter = function GumgumAdapter() {
	
	  var bidEndpoint = 'https://g2.gumgum.com/hbid/imp';
	
	  var topWindow = void 0;
	  var topScreen = void 0;
	  var pageViewId = void 0;
	  var requestCache = {};
	  var throttleTable = {};
	  var defaultThrottle = 3e4;
	
	  try {
	    topWindow = global.top;
	    topScreen = topWindow.screen;
	  } catch (error) {
	    return utils.logError(error);
	  }
	
	  function _getTimeStamp() {
	    return new Date().getTime();
	  }
	
	  function _callBids(_ref) {
	    var bids = _ref.bids;
	
	    var browserParams = {
	      vw: topWindow.innerWidth,
	      vh: topWindow.innerHeight,
	      sw: topScreen.width,
	      sh: topScreen.height,
	      pu: topWindow.location.href,
	      ce: navigator.cookieEnabled,
	      dpr: topWindow.devicePixelRatio || 1
	    };
	    utils._each(bids, function (bidRequest) {
	      var bidId = bidRequest.bidId,
	          _bidRequest$params = bidRequest.params,
	          params = _bidRequest$params === undefined ? {} : _bidRequest$params,
	          placementCode = bidRequest.placementCode;
	
	      var timestamp = _getTimeStamp();
	      var trackingId = params.inScreen;
	      var nativeId = params.native;
	      var slotId = params.inSlot;
	      var bid = { tmax: pbjs.cbTimeout };
	
	      /* slot/native ads need the placement id */
	      switch (true) {
	        case !!params.inImage:
	          bid.pi = 1;break;
	        case !!params.inScreen:
	          bid.pi = 2;break;
	        case !!params.inSlot:
	          bid.pi = 3;break;
	        case !!params.native:
	          bid.pi = 5;break;
	        default:
	          return utils.logWarn('[GumGum] No product selected for the placement ' + placementCode + ', please check your implementation.');
	      }
	
	      /* throttle based on the latest request for this product */
	      var productId = bid.pi;
	      var requestKey = productId + '|' + placementCode;
	      var throttle = throttleTable[productId];
	      var latestRequest = requestCache[requestKey];
	      if (latestRequest && throttle && timestamp - latestRequest < throttle) {
	        return utils.logWarn('[GumGum] The refreshes for "' + placementCode + '" with the params ' + (JSON.stringify(params) + ' should be at least ' + throttle / 1e3 + 's apart.'));
	      }
	      /* update the last request */
	      requestCache[requestKey] = timestamp;
	
	      /* tracking id is required for in-image and in-screen */
	      if (trackingId) bid.t = trackingId;
	      /* native ads require a native placement id */
	      if (nativeId) bid.ni = nativeId;
	      /* slot ads require a slot id */
	      if (slotId) bid.si = slotId;
	
	      /* include the pageViewId, if any */
	      if (pageViewId) bid.pv = pageViewId;
	
	      var cachedBid = _extends({
	        placementCode: placementCode,
	        id: bidId
	      }, bid);
	
	      var callback = { jsonp: 'pbjs.handleGumGumCB[\'' + bidId + '\']' };
	      CALLBACKS[bidId] = _handleGumGumResponse(cachedBid);
	      var query = _extends(callback, browserParams, bid);
	      var bidCall = bidEndpoint + '?' + utils.parseQueryStringParameters(query);
	      adloader.loadScript(bidCall);
	    });
	  }
	
	  var _handleGumGumResponse = function _handleGumGumResponse(cachedBidRequest) {
	    return function () {
	      var bidResponse = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	      var productId = cachedBidRequest.pi;
	      var _bidResponse$ad = bidResponse.ad,
	          ad = _bidResponse$ad === undefined ? {} : _bidResponse$ad,
	          _bidResponse$pag = bidResponse.pag,
	          pag = _bidResponse$pag === undefined ? {} : _bidResponse$pag,
	          throttle = bidResponse.thms;
	      /* cache the pageViewId */
	
	      if (pag && pag.pvid) pageViewId = pag.pvid;
	      if (ad && ad.id) {
	        /* set the new throttle */
	        throttleTable[productId] = throttle || defaultThrottle;
	        /* create the bid */
	        var bid = bidfactory.createBid(1);
	        var trackingId = pag.t;
	
	        bidResponse.request = cachedBidRequest;
	        var encodedResponse = encodeURIComponent(JSON.stringify(bidResponse));
	        var gumgumAdLoader = '<script>\n        (function (context, topWindow, d, s, G) {\n          G = topWindow.GUMGUM;\n          d = topWindow.document;\n          function loadAd() {\n            topWindow.GUMGUM.pbjs("' + trackingId + '", ' + productId + ', "' + encodedResponse + '" , context);\n          }\n          if (G) {\n            loadAd();\n          } else {\n            topWindow.pbjs.loadScript("https://g2.gumgum.com/javascripts/ggv2.js", loadAd);\n          }\n        }(window, top));\n      </script>';
	        _extends(bid, {
	          cpm: ad.price,
	          ad: gumgumAdLoader,
	          width: ad.width,
	          height: ad.height,
	          bidderCode: BIDDER_CODE
	        });
	        bidmanager.addBidResponse(cachedBidRequest.placementCode, bid);
	      } else {
	        var noBid = bidfactory.createBid(2);
	        noBid.bidderCode = BIDDER_CODE;
	        bidmanager.addBidResponse(cachedBidRequest.placementCode, noBid);
	      }
	      delete CALLBACKS[cachedBidRequest.id];
	    };
	  };
	
	  window.pbjs.handleGumGumCB = CALLBACKS;
	
	  return {
	    callBids: _callBids
	  };
	};
	
	module.exports = GumgumAdapter;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	/*jslint white:true, browser:true, single: true*/
	/*global pbjs, require, module*/
	
	/**
	 * Adapter for HIRO Media
	 *
	 * @module HiroMediaAdapter
	 *
	 * @requires src/adloader
	 * @requires src/bidfactory
	 * @requires src/bidmanager
	 * @requires src/constants
	 * @requires src/utils
	 */
	var adloader = __webpack_require__(13);
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var utils = __webpack_require__(2);
	var STATUS = __webpack_require__(3).STATUS;
	
	var HiroMediaAdapter = function HiroMediaAdapter() {
	
	  'use strict';
	
	  /**
	   * Bidder code
	   *
	   * @memberof module:HiroMediaAdapter~
	   * @constant {string}
	   * @private
	   */
	
	  var BIDDER_CODE = 'hiromedia';
	
	  /**
	   * Adapter version
	   *
	   * @memberof module:HiroMediaAdapter~
	   * @constant {number}
	   * @private
	   */
	  var ADAPTER_VERSION = 3;
	
	  /**
	   * Default bid param values
	   *
	   * @memberof module:HiroMediaAdapter~
	   * @constant {module:HiroMediaAdapter~bidParams}
	   * @private
	   */
	  var REQUIRED_BID_PARAMS = ['accountId'];
	
	  /**
	   * Default bid param values
	   *
	   * @memberof module:HiroMediaAdapter~
	   * @constant {module:HiroMediaAdapter~bidParams}
	   * @private
	   */
	  var DEFAULT_BID_PARAMS = {
	    bidUrl: 'https://hb-rtb.ktdpublishers.com/bid/get'
	  };
	
	  /**
	   * Storage for bid objects.
	   *
	   * Bids need to be stored between requests and response since the response
	   * is a global callback.
	   *
	   * @memberof module:HiroMediaAdapter~
	   * @var {array.<module:HiroMediaAdapter~bidInfo>}
	   * @private
	   */
	  var _bidStorage = [];
	
	  /**
	   * Call bidmanager.addBidResponse
	   *
	   * Simple wrapper that will create a bid object with the correct status
	   * and add the response for the placement.
	   *
	   * @memberof module:HiroMediaAdapter~
	   * @private
	   *
	   * @param  {module:HiroMediaAdapter~bidInfo} bidInfo bid object wrapper to respond for
	   * @param  {object|boolean} [bidResponse] response object for bid, if not
	   * set the response will be an empty bid response.
	   */
	  function addBidResponse(bidInfo, bidResponse) {
	
	    var placementCode = bidInfo.bid.placementCode;
	    var bidStatus = bidResponse ? STATUS.GOOD : STATUS.NO_BID;
	    var bidObject = bidfactory.createBid(bidStatus, bidInfo.bid);
	
	    bidObject.bidderCode = BIDDER_CODE;
	
	    if (bidResponse) {
	      bidObject.cpm = bidResponse.cpm;
	      bidObject.ad = bidResponse.ad;
	      bidObject.width = bidResponse.width;
	      bidObject.height = bidResponse.height;
	    }
	
	    utils.logMessage('hiromedia.callBids, addBidResponse for ' + placementCode + ' status: ' + bidStatus);
	    bidmanager.addBidResponse(placementCode, bidObject);
	  }
	
	  /**
	   * Return `true` if sampling is larger than a newly created random value
	   *
	   * @memberof module:HiroMediaAdapter~
	   * @private
	   *
	   * @param  {number} sampling the value to check
	   * @return {boolean}  `true` if the sampling is larger, `false` otherwise
	   */
	  function checkChance(sampling) {
	    return Math.random() < sampling;
	  }
	
	  /**
	   * Apply a response for all pending bids that have the same response batch key
	   *
	   * @memberof module:HiroMediaAdapter~
	   * @private
	   *
	   * @param  {object} response [description]
	   */
	  function handleResponse(response) {
	
	    _bidStorage.filter(function (bidInfo) {
	      return bidInfo.batchKey === response.batchKey;
	    }).forEach(function (bidInfo) {
	
	      // Sample the bid responses according to `response.chance`,
	      // if `response.chance` is not provided, sample at 100%.
	      if (response.chance === undefined || checkChance(response.chance)) {
	        addBidResponse(bidInfo, response);
	      } else {
	        addBidResponse(bidInfo, false);
	      }
	    });
	  }
	
	  /**
	   * Call {@linkcode module:HiroMediaAdapter~handleResponse} for valid responses
	   *
	   * @global
	   *
	   * @param  {object} [response] the response from the server
	   */
	  pbjs.hiromedia_callback = function (response) {
	
	    if (response && response.batchKey) {
	      handleResponse(response);
	    }
	  };
	
	  /**
	   * Find browser name and version
	   *
	   * Super basic UA parser for the major browser configurations.
	   *
	   * @memberof module:HiroMediaAdapter~
	   * @private
	   *
	   * @return {module:HiroMediaAdapter~browserInfo} object containing name and version of browser
	   * or empty strings.
	   */
	  function getBrowser() {
	
	    var ua = navigator.userAgent;
	    var browsers = [{
	      name: 'Mobile',
	      stringSearch: 'Mobi'
	    }, {
	      name: 'Edge'
	    }, {
	      name: 'Chrome'
	    }, {
	      name: 'Firefox'
	    }, {
	      name: 'IE',
	      versionSearch: /MSIE\s(\d+)/
	    }, {
	      name: 'IE',
	      stringSearch: 'Trident',
	      versionSearch: /rv:(\d+)/
	    }];
	
	    var name = '';
	    var version = '';
	
	    browsers.some(function (browser) {
	
	      var nameSearch = browser.stringSearch || browser.name;
	      var defaultVersionSearch = nameSearch + '\\/(\\d+)';
	      var versionSearch = browser.versionSearch || defaultVersionSearch;
	      var versionMatch;
	
	      if (ua.indexOf(nameSearch) !== -1) {
	        name = browser.name;
	        versionMatch = ua.match(versionSearch);
	        if (versionMatch) {
	          version = versionMatch && versionMatch[1];
	        }
	        return true;
	      }
	    });
	
	    return {
	      name: name,
	      version: version
	    };
	  }
	
	  /**
	   * Return top context domain
	   *
	   * @memberof module:HiroMediaAdapter~
	   * @private
	   *
	   * @return {string}  domain of top context url.
	   */
	  function getDomain() {
	
	    var a = document.createElement('a');
	    a.href = utils.getTopWindowUrl();
	    return a.hostname;
	  }
	
	  /**
	   * Apply default parameters to an object if the parameters are not set
	   *
	   * @memberof module:HiroMediaAdapter~
	   * @private
	   *
	   * @param  {module:HiroMediaAdapter~bidParams} bidParams custom parameters for bid
	   * @return {module:HiroMediaAdapter~bidParams} `bidParams` shallow merged with
	   * {@linkcode module:HiroMediaAdapter~DEFAULT_BID_PARAMS|DEFAULT_BID_PARAMS}
	   */
	  function defaultParams(bidParams) {
	    return _extends({}, DEFAULT_BID_PARAMS, bidParams);
	  }
	
	  /**
	   * Calculate and return a batchKey key for a bid
	   *
	   * Bid of similar placement can have similar responses,
	   * we can calculate a key based on the variant properties
	   * of a bid which can share the same response
	   *
	   * @memberof module:HiroMediaAdapter~
	   * @private
	   *
	   * @param  {module:HiroMediaAdapter~bidInfo} bidInfo bid information
	   * @return {string}  batch key for bid
	   */
	  function getBatchKey(bidInfo) {
	
	    var bidParams = bidInfo.bidParams;
	    var batchParams = [bidParams.bidUrl, bidParams.accountId, bidInfo.selectedSize, bidInfo.additionalSizes];
	
	    return batchParams.join('-');
	  }
	
	  /**
	   * Build a set of {@linkcode module:HiroMediaAdapter~bidInfo|bidInfo} objects based on the
	   * bids sent to {@linkcode module:HiroMediaAdapter#callBids|callBids}
	   *
	   * @memberof module:HiroMediaAdapter~
	   * @private
	   *
	   * @param  {object} bids bids sent from `Prebid.js`
	   * @return {array.<module:HiroMediaAdapter~bidInfo>} wrapped bids
	   */
	  function processBids(bids) {
	
	    var result = [];
	
	    if (bids) {
	
	      utils.logMessage('hiromedia.processBids, processing ' + bids.length + ' bids');
	
	      bids.forEach(function (bid) {
	
	        var sizes = utils.parseSizesInput(bid.sizes);
	        var bidParams = defaultParams(bid.params);
	        var hasValidBidRequest = utils.hasValidBidRequest(bidParams, REQUIRED_BID_PARAMS, BIDDER_CODE);
	        var shouldBid = hasValidBidRequest;
	        var bidInfo = {
	          bid: bid,
	          bidParams: bidParams,
	          shouldBid: shouldBid,
	          selectedSize: sizes[0],
	          additionalSizes: sizes.slice(1).join(',')
	        };
	
	        if (shouldBid) {
	          bidInfo.batchKey = getBatchKey(bidInfo);
	        }
	
	        result.push(bidInfo);
	      });
	    }
	
	    return result;
	  }
	
	  /**
	   * Send a bid request to the bid server endpoint
	   *
	   * Calls `adLoader.loadScript`
	   *
	   * @memberof module:HiroMediaAdapter~
	   * @private
	   *
	   * @param  {string} url base url, can already contain query parameters
	   * @param  {object} requestParams parameters to add to query
	   */
	  function sendBidRequest(url, requestParams) {
	
	    if (requestParams) {
	
	      if (url.indexOf('?') !== -1) {
	        url = url + '&';
	      } else {
	        url = url + '?';
	      }
	
	      Object.keys(requestParams).forEach(function (key) {
	        url = utils.tryAppendQueryString(url, key, requestParams[key]);
	      });
	    }
	
	    utils.logMessage('hiromedia.callBids, url:' + url);
	
	    adloader.loadScript(url);
	  }
	
	  /**
	   * Receive a set of bid placements and create bid requests and responses accordingly
	   *
	   * @alias module:HiroMediaAdapter#callBids
	   *
	   * @param  {object} params placement and bid data from `Prebid.js`
	   */
	  function _callBids(params) {
	
	    var browser = getBrowser();
	    var domain = getDomain();
	    var bidsRequested = {};
	
	    utils.logMessage('hiromedia.callBids');
	
	    if (params) {
	
	      // Processed bids are stored in the adapter scope
	      _bidStorage = processBids(params.bids);
	    } else {
	
	      // Ensure we don't run on stale data
	      _bidStorage = [];
	    }
	
	    if (_bidStorage.length) {
	
	      // Loop over processed bids and send a request if a request for the bid
	      // batchKey has not been sent.
	      _bidStorage.forEach(function (bidInfo) {
	
	        var bid = bidInfo.bid;
	        var batchKey = bidInfo.batchKey;
	        var bidParams = bidInfo.bidParams;
	
	        utils.logMessage('hiromedia.callBids, bidInfo ' + bid.placementCode + ' ' + bidInfo.shouldBid);
	
	        if (bidInfo.shouldBid) {
	
	          var url = bidParams.bidUrl;
	
	          if (!bidsRequested[batchKey]) {
	
	            bidsRequested[batchKey] = true;
	
	            sendBidRequest(url, {
	              adapterVersion: ADAPTER_VERSION,
	              callback: 'pbjs.hiromedia_callback',
	              batchKey: batchKey,
	              placementCode: bid.placementCode,
	              accountId: bidParams.accountId,
	              browser: browser.name,
	              browserVersion: browser.version,
	              domain: domain,
	              selectedSize: bidInfo.selectedSize,
	              additionalSizes: bidInfo.additionalSizes
	            });
	          }
	        } else {
	
	          // No bid
	          addBidResponse(bidInfo, false);
	        }
	      });
	    }
	  }
	
	  return {
	    callBids: _callBids
	  };
	
	  // JSDoc typedefs
	
	  /**
	   * Parameters for bids to HIRO Media adapter
	   *
	   * @typedef {object} module:HiroMediaAdapter~bidParams
	   * @private
	   *
	   * @property {string} bidUrl the bid server endpoint url
	   */
	
	  /**
	   * Bid object wrapper
	   *
	   * @typedef {object} module:HiroMediaAdapter~bidInfo
	   * @private
	   *
	   * @property {object} bid original bid passed to #callBids
	   * @property {string} selectedSize the first size in the the placement sizes array
	   * @property {string} additionalSizes list of sizes in the placement sizes array besides the first
	   * @property {string} batchKey key used for batching requests which have the same basic properties
	   * @property {module:HiroMediaAdapter~bidParams} bidParams original params passed for bid in #callBids
	   * @property {boolean} shouldBid flag to determine if the bid is valid for bidding or not
	   */
	
	  /**
	   * browserInfo
	   *
	   * @typedef {object} module:HiroMediaAdapter~browserInfo
	   * @private
	   *
	   * @property {string} name browser name (e.g. `'Chrome'` or `'Firefox'`)
	   * @property {string} version browser major version (e.g. `'53'`)
	   */
	};
	
	module.exports = HiroMediaAdapter;

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	//Factory for creating the bidderAdaptor
	// jshint ignore:start
	var utils = __webpack_require__(2);
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var adloader = __webpack_require__(13);
	
	var ADAPTER_NAME = 'INDEXEXCHANGE';
	var ADAPTER_CODE = 'indexExchange';
	
	var CONSTANTS = {
	  "INDEX_DEBUG_MODE": {
	    "queryParam": "pbjs_ix_debug",
	    "mode": {
	      "sandbox": {
	        "topFrameLimit": 10,
	        "queryValue": "sandbox",
	        "siteID": "999990"
	      }
	    }
	  }
	};
	
	var OPEN_MARKET = 'IOM';
	var PRIVATE_MARKET = 'IPM';
	
	window.cygnus_index_parse_res = function (response) {
	  try {
	    if (response) {
	      if ((typeof _IndexRequestData === 'undefined' ? 'undefined' : _typeof(_IndexRequestData)) !== "object" || _typeof(_IndexRequestData.impIDToSlotID) !== "object" || typeof _IndexRequestData.impIDToSlotID[response.id] === "undefined") {
	        return;
	      }
	      var targetMode = 1;
	      var callbackFn;
	      if (_typeof(_IndexRequestData.reqOptions) === 'object' && _typeof(_IndexRequestData.reqOptions[response.id]) === 'object') {
	        if (typeof _IndexRequestData.reqOptions[response.id].callback === "function") {
	          callbackFn = _IndexRequestData.reqOptions[response.id].callback;
	        }
	        if (typeof _IndexRequestData.reqOptions[response.id].targetMode === "number") {
	          targetMode = _IndexRequestData.reqOptions[response.id].targetMode;
	        }
	      }
	
	      _IndexRequestData.lastRequestID = response.id;
	      _IndexRequestData.targetIDToBid = {};
	      _IndexRequestData.targetIDToResp = {};
	      _IndexRequestData.targetIDToCreative = {};
	
	      var allBids = [];
	      var seatbidLength = typeof response.seatbid === "undefined" ? 0 : response.seatbid.length;
	      for (var i = 0; i < seatbidLength; i++) {
	        for (var j = 0; j < response.seatbid[i].bid.length; j++) {
	          var bid = response.seatbid[i].bid[j];
	          if (_typeof(bid.ext) !== "object" || typeof bid.ext.pricelevel !== "string") {
	            continue;
	          }
	          if (typeof _IndexRequestData.impIDToSlotID[response.id][bid.impid] === "undefined") {
	            continue;
	          }
	          var slotID = _IndexRequestData.impIDToSlotID[response.id][bid.impid];
	          var targetID;
	          var noTargetModeTargetID;
	          var targetPrefix;
	          if (typeof bid.ext.dealid === "string") {
	            if (targetMode === 1) {
	              targetID = slotID + bid.ext.pricelevel;
	            } else {
	              targetID = slotID + "_" + bid.ext.dealid;
	            }
	            noTargetModeTargetID = slotID + '_' + bid.ext.dealid;
	            targetPrefix = PRIVATE_MARKET + '_';
	          } else {
	            targetID = slotID + bid.ext.pricelevel;
	            noTargetModeTargetID = slotID + bid.ext.pricelevel;
	            targetPrefix = OPEN_MARKET + '_';
	          }
	          if (_IndexRequestData.targetIDToBid[targetID] === undefined) {
	            _IndexRequestData.targetIDToBid[targetID] = [bid.adm];
	          } else {
	            _IndexRequestData.targetIDToBid[targetID].push(bid.adm);
	          }
	          if (_IndexRequestData.targetIDToCreative[noTargetModeTargetID] === undefined) {
	            _IndexRequestData.targetIDToCreative[noTargetModeTargetID] = [bid.adm];
	          } else {
	            _IndexRequestData.targetIDToCreative[noTargetModeTargetID].push(bid.adm);
	          }
	          var impBid = {};
	          impBid.impressionID = bid.impid;
	          if (typeof bid.ext.dealid !== 'undefined') {
	            impBid.dealID = bid.ext.dealid;
	          }
	          impBid.bid = bid.price;
	          impBid.slotID = slotID;
	          impBid.priceLevel = bid.ext.pricelevel;
	          impBid.target = targetPrefix + targetID;
	          _IndexRequestData.targetIDToResp[targetID] = impBid;
	          allBids.push(impBid);
	        }
	      }
	      if (typeof callbackFn === "function") {
	        if (allBids.length === 0) {
	          callbackFn(response.id);
	        } else {
	          callbackFn(response.id, allBids);
	        }
	      }
	    }
	  } catch (e) {}
	
	  if (typeof window.cygnus_index_ready_state === 'function') {
	    window.cygnus_index_ready_state();
	  }
	};
	
	window.index_render = function (doc, targetID) {
	  try {
	    var ad = _IndexRequestData.targetIDToCreative[targetID].pop();
	    if (ad != null) {
	      doc.write(ad);
	    } else {
	      var url = window.location.protocol === 'https:' ? 'https://as-sec.casalemedia.com' : 'http://as.casalemedia.com';
	      url += '/headerstats?type=RT&s=' + cygnus_index_args.siteID + '&u=' + encodeURIComponent(location.href) + '&r=' + _IndexRequestData.lastRequestID;
	      var px_call = new Image();
	      px_call.src = url + '&blank=' + targetID;
	    }
	  } catch (e) {}
	};
	
	window.headertag_render = function (doc, targetID, slotID) {
	  var index_slot = slotID;
	  var index_ary = targetID.split(',');
	  for (var i = 0; i < index_ary.length; i++) {
	    var unpack = index_ary[i].split('_');
	    if (unpack[0] == index_slot) {
	      index_render(doc, index_ary[i]);
	      return;
	    }
	  }
	};
	
	window.cygnus_index_args = {};
	
	var cygnus_index_adunits = [[728, 90], [120, 600], [300, 250], [160, 600], [336, 280], [234, 60], [300, 600], [300, 50], [320, 50], [970, 250], [300, 1050], [970, 90], [180, 150]]; // jshint ignore:line
	
	var getIndexDebugMode = function getIndexDebugMode() {
	  return getParameterByName(CONSTANTS.INDEX_DEBUG_MODE.queryParam).toUpperCase();
	};
	
	var getParameterByName = function getParameterByName(name) {
	  var wdw = window;
	  var childsReferrer = '';
	  for (var x = 0; x < CONSTANTS.INDEX_DEBUG_MODE.mode.sandbox.topFrameLimit; x++) {
	    if (wdw.parent == wdw) {
	      break;
	    }
	    try {
	      childsReferrer = wdw.document.referrer;
	    } catch (err) {}
	    wdw = wdw.parent;
	  }
	  var topURL = top === self ? location.href : childsReferrer;
	  var regexS = '[\\?&]' + name + '=([^&#]*)';
	  var regex = new RegExp(regexS);
	  var results = regex.exec(topURL);
	  if (results === null) {
	    return '';
	  }
	  return decodeURIComponent(results[1].replace(/\+/g, ' '));
	};
	
	var cygnus_index_start = function cygnus_index_start() {
	  window.cygnus_index_args.parseFn = cygnus_index_parse_res;
	  var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
	  var meta = {
	    '\b': '\\b',
	    '\t': '\\t',
	    '\n': '\\n',
	    '\f': '\\f',
	    '\r': '\\r',
	    '"': '\\"',
	    '\\': '\\\\'
	  };
	
	  function escapeCharacter(character) {
	    var escaped = meta[character];
	    if (typeof escaped === 'string') {
	      return escaped;
	    } else {
	      return '\\u' + ('0000' + character.charCodeAt(0).toString(16)).slice(-4);
	    }
	  }
	
	  function quote(string) {
	    escapable.lastIndex = 0;
	    if (escapable.test(string)) {
	      return string.replace(escapable, escapeCharacter);
	    } else {
	      return string;
	    }
	  }
	
	  function OpenRTBRequest(siteID, parseFn, timeoutDelay) {
	    this.initialized = false;
	    if (typeof siteID !== 'number' || siteID % 1 !== 0 || siteID < 0) {
	      throw 'Invalid Site ID';
	    }
	
	    timeoutDelay = Number(timeoutDelay);
	    if (typeof timeoutDelay === 'number' && timeoutDelay % 1 === 0 && timeoutDelay >= 0) {
	      this.timeoutDelay = timeoutDelay;
	    }
	
	    this.siteID = siteID;
	    this.impressions = [];
	    this._parseFnName = undefined;
	    if (top === self) {
	      this.sitePage = location.href;
	      this.topframe = 1;
	    } else {
	      this.sitePage = document.referrer;
	      this.topframe = 0;
	    }
	
	    if (typeof parseFn !== 'undefined') {
	      if (typeof parseFn === 'function') {
	        this._parseFnName = 'cygnus_index_args.parseFn';
	      } else {
	        throw 'Invalid jsonp target function';
	      }
	    }
	
	    if (typeof _IndexRequestData.requestCounter === 'undefined') {
	      _IndexRequestData.requestCounter = Math.floor(Math.random() * 256);
	    } else {
	      _IndexRequestData.requestCounter = (_IndexRequestData.requestCounter + 1) % 256;
	    }
	
	    this.requestID = String(new Date().getTime() % 2592000 * 256 + _IndexRequestData.requestCounter + 256);
	    this.initialized = true;
	  }
	
	  OpenRTBRequest.prototype.serialize = function () {
	    var json = '{"id":"' + this.requestID + '","site":{"page":"' + quote(this.sitePage) + '"';
	    if (typeof document.referrer === 'string' && document.referrer !== "") {
	      json += ',"ref":"' + quote(document.referrer) + '"';
	    }
	
	    json += '},"imp":[';
	    for (var i = 0; i < this.impressions.length; i++) {
	      var impObj = this.impressions[i];
	      var ext = [];
	      json += '{"id":"' + impObj.id + '", "banner":{"w":' + impObj.w + ',"h":' + impObj.h + ',"topframe":' + String(this.topframe) + '}';
	      if (typeof impObj.bidfloor === 'number') {
	        json += ',"bidfloor":' + impObj.bidfloor;
	        if (typeof impObj.bidfloorcur === 'string') {
	          json += ',"bidfloorcur":"' + quote(impObj.bidfloorcur) + '"';
	        }
	      }
	
	      if (typeof impObj.slotID === 'string' && !impObj.slotID.match(/^\s*$/)) {
	        ext.push('"sid":"' + quote(impObj.slotID) + '"');
	      }
	
	      if (typeof impObj.siteID === 'number') {
	        ext.push('"siteID":' + impObj.siteID);
	      }
	
	      if (ext.length > 0) {
	        json += ',"ext": {' + ext.join() + '}';
	      }
	
	      if (i + 1 === this.impressions.length) {
	        json += '}';
	      } else {
	        json += '},';
	      }
	    }
	
	    json += ']}';
	    return json;
	  };
	
	  OpenRTBRequest.prototype.setPageOverride = function (sitePageOverride) {
	    if (typeof sitePageOverride === 'string' && !sitePageOverride.match(/^\s*$/)) {
	      this.sitePage = sitePageOverride;
	      return true;
	    } else {
	      return false;
	    }
	  };
	
	  OpenRTBRequest.prototype.addImpression = function (width, height, bidFloor, bidFloorCurrency, slotID, siteID) {
	    var impObj = {
	      id: String(this.impressions.length + 1)
	    };
	    if (typeof width !== 'number' || width <= 1) {
	      return null;
	    }
	
	    if (typeof height !== 'number' || height <= 1) {
	      return null;
	    }
	
	    if ((typeof slotID === 'string' || typeof slotID === 'number') && String(slotID).length <= 50) {
	      impObj.slotID = String(slotID);
	    }
	
	    impObj.w = width;
	    impObj.h = height;
	    if (bidFloor !== undefined && typeof bidFloor !== 'number') {
	      return null;
	    }
	
	    if (typeof bidFloor === 'number') {
	      if (bidFloor < 0) {
	        return null;
	      }
	
	      impObj.bidfloor = bidFloor;
	      if (bidFloorCurrency !== undefined && typeof bidFloorCurrency !== 'string') {
	        return null;
	      }
	
	      impObj.bidfloorcur = bidFloorCurrency;
	    }
	
	    if (typeof siteID !== 'undefined') {
	      if (typeof siteID === 'number' && siteID % 1 === 0 && siteID >= 0) {
	        impObj.siteID = siteID;
	      } else {
	        return null;
	      }
	    }
	
	    this.impressions.push(impObj);
	    return impObj.id;
	  };
	
	  OpenRTBRequest.prototype.buildRequest = function () {
	    if (this.impressions.length === 0 || this.initialized !== true) {
	      return;
	    }
	
	    var jsonURI = encodeURIComponent(this.serialize());
	
	    var scriptSrc;
	    if (getIndexDebugMode() == CONSTANTS.INDEX_DEBUG_MODE.mode.sandbox.queryValue.toUpperCase()) {
	      this.siteID = CONSTANTS.INDEX_DEBUG_MODE.mode.sandbox.siteID;
	      scriptSrc = window.location.protocol === 'https:' ? 'https://sandbox.ht.indexexchange.com' : 'http://sandbox.ht.indexexchange.com';
	      utils.logMessage('IX DEBUG: Sandbox mode activated');
	    } else {
	      scriptSrc = window.location.protocol === 'https:' ? 'https://as-sec.casalemedia.com' : 'http://as.casalemedia.com';
	    }
	    var prebidVersion = encodeURIComponent("0.24.0-pre");
	    scriptSrc += '/cygnus?v=7&fn=cygnus_index_parse_res&s=' + this.siteID + '&r=' + jsonURI + '&pid=pb' + prebidVersion;
	    if (typeof this.timeoutDelay === 'number' && this.timeoutDelay % 1 === 0 && this.timeoutDelay >= 0) {
	      scriptSrc += '&t=' + this.timeoutDelay;
	    }
	
	    return scriptSrc;
	  };
	
	  try {
	    if (typeof cygnus_index_args === 'undefined' || typeof cygnus_index_args.siteID === 'undefined' || typeof cygnus_index_args.slots === 'undefined') {
	      return;
	    }
	
	    var req = new OpenRTBRequest(cygnus_index_args.siteID, cygnus_index_args.parseFn, cygnus_index_args.timeout);
	    if (cygnus_index_args.url && typeof cygnus_index_args.url === 'string') {
	      req.setPageOverride(cygnus_index_args.url);
	    }
	
	    _IndexRequestData.impIDToSlotID[req.requestID] = {};
	    _IndexRequestData.reqOptions[req.requestID] = {};
	    var slotDef, impID;
	
	    for (var i = 0; i < cygnus_index_args.slots.length; i++) {
	      slotDef = cygnus_index_args.slots[i];
	
	      impID = req.addImpression(slotDef.width, slotDef.height, slotDef.bidfloor, slotDef.bidfloorcur, slotDef.id, slotDef.siteID);
	      if (impID) {
	        _IndexRequestData.impIDToSlotID[req.requestID][impID] = String(slotDef.id);
	      }
	    }
	
	    if (typeof cygnus_index_args.targetMode === 'number') {
	      _IndexRequestData.reqOptions[req.requestID].targetMode = cygnus_index_args.targetMode;
	    }
	
	    if (typeof cygnus_index_args.callback === 'function') {
	      _IndexRequestData.reqOptions[req.requestID].callback = cygnus_index_args.callback;
	    }
	
	    return req.buildRequest();
	  } catch (e) {
	    utils.logError('Error calling index adapter', ADAPTER_NAME, e);
	  }
	};
	
	var IndexExchangeAdapter = function IndexExchangeAdapter() {
	  var slotIdMap = {};
	  var requiredParams = [
	  /* 0 */
	  'id',
	  /* 1 */
	  'siteID'];
	  var firstAdUnitCode = '';
	
	  function _callBids(request) {
	    var bidArr = request.bids;
	
	    if (typeof window._IndexRequestData === 'undefined') {
	      window._IndexRequestData = {};
	      window._IndexRequestData.impIDToSlotID = {};
	      window._IndexRequestData.reqOptions = {};
	    }
	    // clear custom targets at the beginning of every request
	    _IndexRequestData.targetAggregate = { 'open': {}, 'private': {} };
	
	    if (!utils.hasValidBidRequest(bidArr[0].params, requiredParams, ADAPTER_NAME)) {
	      return;
	    }
	
	    //Our standard is to always bid for all known slots.
	    cygnus_index_args.slots = [];
	
	    var expectedBids = 0;
	
	    //Grab the slot level data for cygnus_index_args
	    for (var i = 0; i < bidArr.length; i++) {
	      var bid = bidArr[i];
	      var sizeID = 0;
	
	      expectedBids++;
	
	      // Expecting nested arrays for sizes
	      if (!(bid.sizes[0] instanceof Array)) {
	        bid.sizes = [bid.sizes];
	      }
	
	      // Create index slots for all bids and sizes
	      for (var j = 0; j < bid.sizes.length; j++) {
	        var validSize = false;
	        for (var k = 0; k < cygnus_index_adunits.length; k++) {
	          if (bid.sizes[j][0] == cygnus_index_adunits[k][0] && bid.sizes[j][1] == cygnus_index_adunits[k][1]) {
	            bid.sizes[j][0] = Number(bid.sizes[j][0]);
	            bid.sizes[j][1] = Number(bid.sizes[j][1]);
	            validSize = true;
	            break;
	          }
	        }
	
	        if (!validSize) {
	          utils.logMessage(ADAPTER_NAME + " slot excluded from request due to no valid sizes");
	          continue;
	        }
	
	        var usingSizeSpecificSiteID = false;
	        // Check for size defined in bidder params 
	        if (bid.params.size && bid.params.size instanceof Array) {
	          if (!(bid.sizes[j][0] == bid.params.size[0] && bid.sizes[j][1] == bid.params.size[1])) continue;
	          usingSizeSpecificSiteID = true;
	        }
	
	        if (bid.params.timeout && typeof cygnus_index_args.timeout === 'undefined') {
	          cygnus_index_args.timeout = bid.params.timeout;
	        }
	
	        var siteID = Number(bid.params.siteID);
	        if (typeof siteID !== "number" || siteID % 1 != 0 || siteID <= 0) {
	          utils.logMessage(ADAPTER_NAME + " slot excluded from request due to invalid siteID");
	          continue;
	        }
	        if (siteID && typeof cygnus_index_args.siteID === 'undefined') {
	          cygnus_index_args.siteID = siteID;
	        }
	
	        if (utils.hasValidBidRequest(bid.params, requiredParams, ADAPTER_NAME)) {
	          firstAdUnitCode = bid.placementCode;
	          var slotID = bid.params[requiredParams[0]];
	          if (typeof slotID !== 'string' && typeof slotID !== 'number') {
	            utils.logError(ADAPTER_NAME + " bid contains invalid slot ID from " + bid.placementCode + ". Discarding slot");
	            continue;
	          }
	
	          sizeID++;
	          var size = {
	            width: bid.sizes[j][0],
	            height: bid.sizes[j][1]
	          };
	
	          var slotName = usingSizeSpecificSiteID ? String(slotID) : slotID + '_' + sizeID;
	          slotIdMap[slotName] = bid;
	
	          //Doesn't need the if(primary_request) conditional since we are using the mergeSlotInto function which is safe
	          cygnus_index_args.slots = mergeSlotInto({
	            id: slotName,
	            width: size.width,
	            height: size.height,
	            siteID: siteID || cygnus_index_args.siteID
	          }, cygnus_index_args.slots);
	
	          if (bid.params.tier2SiteID) {
	            var tier2SiteID = Number(bid.params.tier2SiteID);
	            if (typeof tier2SiteID !== 'undefined' && !tier2SiteID) {
	              continue;
	            }
	
	            cygnus_index_args.slots = mergeSlotInto({
	              id: 'T1_' + slotName,
	              width: size.width,
	              height: size.height,
	              siteID: tier2SiteID
	            }, cygnus_index_args.slots);
	          }
	
	          if (bid.params.tier3SiteID) {
	            var tier3SiteID = Number(bid.params.tier3SiteID);
	            if (typeof tier3SiteID !== 'undefined' && !tier3SiteID) {
	              continue;
	            }
	
	            cygnus_index_args.slots = mergeSlotInto({
	              id: 'T2_' + slotName,
	              width: size.width,
	              height: size.height,
	              siteID: tier3SiteID
	            }, cygnus_index_args.slots);
	          }
	        }
	      }
	    }
	
	    if (cygnus_index_args.slots.length > 20) {
	      utils.logError('Too many unique sizes on slots, will use the first 20.', ADAPTER_NAME);
	    }
	
	    //bidmanager.setExpectedBidsCount(ADAPTER_CODE, expectedBids);
	    adloader.loadScript(cygnus_index_start());
	
	    var responded = false;
	
	    // Handle response
	    window.cygnus_index_ready_state = function () {
	      if (responded) {
	        return;
	      }
	      responded = true;
	
	      try {
	        var indexObj = _IndexRequestData.targetIDToBid;
	        var lookupObj = cygnus_index_args;
	
	        // Grab all the bids for each slot
	        for (var adSlotId in slotIdMap) {
	          var bidObj = slotIdMap[adSlotId];
	          var adUnitCode = bidObj.placementCode;
	
	          var bids = [];
	
	          // Grab the bid for current slot
	          for (var cpmAndSlotId in indexObj) {
	            var match = /^(T\d_)?(.+)_(\d+)$/.exec(cpmAndSlotId);
	            // if parse fail, move to next bid
	            if (!match) {
	              utils.logError("Unable to parse " + cpmAndSlotId + ", skipping slot", ADAPTER_NAME);
	              continue;
	            }
	            var tier = match[1] || '';
	            var slotID = match[2];
	            var currentCPM = match[3];
	
	            var slotObj = getSlotObj(cygnus_index_args, tier + slotID);
	            // Bid is for the current slot
	            if (slotID === adSlotId) {
	              var bid = bidfactory.createBid(1);
	              bid.cpm = currentCPM / 100;
	              bid.ad = indexObj[cpmAndSlotId][0];
	              bid.bidderCode = ADAPTER_CODE;
	              bid.width = slotObj.width;
	              bid.height = slotObj.height;
	              bid.siteID = slotObj.siteID;
	              if (_typeof(_IndexRequestData.targetIDToResp) === 'object' && _typeof(_IndexRequestData.targetIDToResp[cpmAndSlotId]) === 'object' && typeof _IndexRequestData.targetIDToResp[cpmAndSlotId].dealID !== 'undefined') {
	                if (typeof _IndexRequestData.targetAggregate['private'][adUnitCode] === 'undefined') _IndexRequestData.targetAggregate['private'][adUnitCode] = [];
	                bid.dealId = _IndexRequestData.targetIDToResp[cpmAndSlotId].dealID;
	                _IndexRequestData.targetAggregate['private'][adUnitCode].push(slotID + "_" + _IndexRequestData.targetIDToResp[cpmAndSlotId].dealID);
	              } else {
	                if (typeof _IndexRequestData.targetAggregate['open'][adUnitCode] === 'undefined') _IndexRequestData.targetAggregate['open'][adUnitCode] = [];
	                _IndexRequestData.targetAggregate['open'][adUnitCode].push(slotID + "_" + currentCPM);
	              }
	              bids.push(bid);
	            }
	          }
	
	          var currentBid = undefined;
	
	          if (bids.length > 0) {
	            // Add all bid responses
	            for (var i = 0; i < bids.length; i++) {
	              bidmanager.addBidResponse(adUnitCode, bids[i]);
	            }
	            // No bids for expected bid, pass bid
	          } else {
	            var bid = bidfactory.createBid(2);
	            bid.bidderCode = ADAPTER_CODE;
	            currentBid = bid;
	            bidmanager.addBidResponse(adUnitCode, currentBid);
	          }
	        }
	      } catch (e) {
	        utils.logError('Error calling index adapter', ADAPTER_NAME, e);
	        logErrorBidResponse();
	      } finally {
	        // ensure that previous targeting mapping is cleared
	        _IndexRequestData.targetIDToBid = {};
	      }
	
	      //slotIdMap is used to determine which slots will be bid on in a given request.
	      //Therefore it needs to be blanked after the request is handled, else we will submit 'bids' for the wrong ads.
	      slotIdMap = {};
	    };
	  }
	
	  /*
	  Function in order to add a slot into the list if it hasn't been created yet, else it returns the same list.
	  */
	  function mergeSlotInto(slot, slotList) {
	    for (var i = 0; i < slotList.length; i++) {
	      if (slot.id === slotList[i].id) {
	        return slotList;
	      }
	    }
	    slotList.push(slot);
	    return slotList;
	  }
	
	  function getSlotObj(obj, id) {
	    var arr = obj.slots;
	    var returnObj = {};
	    utils._each(arr, function (value) {
	      if (value.id === id) {
	        returnObj = value;
	      }
	    });
	
	    return returnObj;
	  }
	
	  function logErrorBidResponse() {
	    //no bid response
	    var bid = bidfactory.createBid(2);
	    bid.bidderCode = ADAPTER_CODE;
	
	    //log error to first add unit
	    bidmanager.addBidResponse(firstAdUnitCode, bid);
	  }
	
	  return {
	    callBids: _callBids
	  };
	};
	
	module.exports = IndexExchangeAdapter;

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var adloader = __webpack_require__(13);
	var utils = __webpack_require__(2);
	var CONSTANTS = __webpack_require__(3);
	
	var InnityAdapter = function InnityAdapter() {
	
	  function _callBids(params) {
	    var bidURL,
	        bids = params.bids || [],
	        requestURL = window.location.protocol + '//as.innity.com/synd/?cb=' + new Date().getTime() + '&ver=2&hb=1&output=js&';
	    for (var i = 0; i < bids.length; i++) {
	      var requestParams = {},
	          bid = bids[i];
	      requestParams.pub = bid.params.pub;
	      requestParams.zone = bid.params.zone;
	      // Page URL
	      requestParams.url = utils.getTopWindowUrl();
	      // Sizes
	      var parseSized = utils.parseSizesInput(bid.sizes),
	          arrSize = parseSized[0].split('x');
	      requestParams.width = arrSize[0];
	      requestParams.height = arrSize[1];
	      // Callback function
	      requestParams.callback = "pbjs._doInnityCallback";
	      // Callback ID
	      requestParams.callback_uid = bid.bidId;
	      // Load Bidder URL
	      bidURL = requestURL + utils.parseQueryStringParameters(requestParams);
	      utils.logMessage('Innity.prebid, Bid ID: ' + bid.bidId + ', Pub ID: ' + bid.params.pub + ', Zone ID: ' + bid.params.zone + ', URL: ' + bidURL);
	      adloader.loadScript(bidURL);
	    }
	  }
	
	  pbjs._doInnityCallback = function (response) {
	    var bidObject,
	        bidRequest,
	        callbackID,
	        libURL = window.location.protocol + "//cdn.innity.net/frame_util.js";
	    callbackID = response.callback_uid;
	    bidRequest = utils.getBidRequest(callbackID);
	    if (response.cpm > 0) {
	      bidObject = bidfactory.createBid(CONSTANTS.STATUS.GOOD, bidRequest);
	      bidObject.bidderCode = 'innity';
	      bidObject.cpm = parseFloat(response.cpm) / 100;
	      bidObject.ad = '<script src="' + libURL + '"></script>' + response.tag;
	      bidObject.width = response.width;
	      bidObject.height = response.height;
	    } else {
	      bidObject = bidfactory.createBid(CONSTANTS.STATUS.NO_BID, bidRequest);
	      bidObject.bidderCode = 'innity';
	      utils.logMessage('No Bid response from Innity request: ' + callbackID);
	    }
	    bidmanager.addBidResponse(bidRequest.placementCode, bidObject);
	  };
	
	  return {
	    callBids: _callBids
	  };
	};
	
	module.exports = InnityAdapter;

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var adloader = __webpack_require__(13);
	
	function _qs(key, value) {
	  return encodeURIComponent(key) + '=' + encodeURIComponent(value);
	}
	
	function _makeBidResponse(placementCode, bid) {
	  var bidResponse = bidfactory.createBid(bid !== undefined ? 1 : 2);
	  bidResponse.bidderCode = 'kruxlink';
	  if (bid !== undefined) {
	    bidResponse.cpm = bid.price;
	    bidResponse.ad = bid.adm;
	    bidResponse.width = bid.w;
	    bidResponse.height = bid.h;
	  }
	  bidmanager.addBidResponse(placementCode, bidResponse);
	}
	
	function _makeCallback(id, placements) {
	  var callback = '_kruxlink_' + id;
	  pbjs[callback] = function (response) {
	    // Clean up our callback
	    delete pbjs[callback];
	
	    // Add in the bid respones
	    if (response.seatbid !== undefined) {
	      for (var i = 0; i < response.seatbid.length; i++) {
	        var seatbid = response.seatbid[i];
	        if (seatbid.bid !== undefined) {
	          for (var j = 0; j < seatbid.bid.length; j++) {
	            var bid = seatbid.bid[j];
	            if (bid.impid !== undefined) {
	              _makeBidResponse(placements[bid.impid], bid);
	              delete placements[bid.impid];
	            }
	          }
	        }
	      }
	    }
	
	    // Add any no-bids remaining
	    for (var impid in placements) {
	      if (placements.hasOwnProperty(impid)) {
	        _makeBidResponse(placements[impid]);
	      }
	    }
	  };
	
	  return 'pbjs.' + callback;
	}
	
	function _callBids(params) {
	  var impids = [];
	  var placements = {};
	
	  var bids = params.bids || [];
	  for (var i = 0; i < bids.length; i++) {
	    var bidRequest = bids[i];
	    var bidRequestParams = bidRequest.params || {};
	    var impid = bidRequestParams.impid;
	    placements[impid] = bidRequest.placementCode;
	
	    impids.push(impid);
	  }
	
	  var callback = _makeCallback(params.bidderRequestId, placements);
	  var qs = [_qs('id', params.bidderRequestId), _qs('u', window.location.href), _qs('impid', impids.join(',')), _qs('calltype', 'pbd'), _qs('callback', callback)];
	  var url = 'https://link.krxd.net/hb?' + qs.join('&');
	
	  adloader.loadScript(url);
	}
	
	module.exports = function KruxAdapter() {
	  return {
	    callBids: _callBids
	  };
	};

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _constants = __webpack_require__(3);
	
	var bidfactory = __webpack_require__(10); /*jshint loopfunc: true */
	
	var bidmanager = __webpack_require__(11);
	var adloader = __webpack_require__(13);
	
	var GetIntentAdapter = function GetIntentAdapter() {
	  var headerBiddingStaticJS = window.location.protocol + '//cdn.adhigh.net/adserver/hb.js';
	
	  function _callBids(params) {
	    if (typeof window.gi_hb === 'undefined') {
	      adloader.loadScript(headerBiddingStaticJS, function () {
	        bid(params);
	      }, true);
	    } else {
	      bid(params);
	    }
	  }
	
	  function addOptional(params, request, props) {
	    for (var i = 0; i < props.length; i++) {
	      if (params.hasOwnProperty(props[i])) {
	        request[props[i]] = params[props[i]];
	      }
	    }
	  }
	
	  function bid(params) {
	    var bids = params.bids || [];
	    for (var i = 0; i < bids.length; i++) {
	      var bidRequest = bids[i];
	      var request = {
	        pid: bidRequest.params.pid, // required
	        tid: bidRequest.params.tid, // required
	        known: bidRequest.params.known || 1,
	        is_video: bidRequest.mediaType === 'video',
	        video: bidRequest.params.video || {},
	        size: bidRequest.sizes[0].join("x")
	      };
	      addOptional(bidRequest.params, request, ['cur', 'floor']);
	      (function (r, br) {
	        window.gi_hb.makeBid(r, function (bidResponse) {
	          if (bidResponse.no_bid === 1) {
	            var nobid = bidfactory.createBid(_constants.STATUS.NO_BID);
	            nobid.bidderCode = br.bidder;
	            bidmanager.addBidResponse(br.placementCode, nobid);
	          } else {
	            var bid = bidfactory.createBid(_constants.STATUS.GOOD);
	            var size = bidResponse.size.split('x');
	            bid.bidderCode = br.bidder;
	            bid.cpm = bidResponse.cpm;
	            bid.width = size[0];
	            bid.height = size[1];
	            if (br.mediaType === 'video') {
	              bid.vastUrl = bidResponse.vast_url;
	              bid.descriptionUrl = bidResponse.vast_url;
	            } else {
	              bid.ad = bidResponse.ad;
	            }
	            bidmanager.addBidResponse(br.placementCode, bid);
	          }
	        });
	      })(request, bidRequest);
	    }
	  }
	
	  return {
	    callBids: _callBids
	  };
	};
	
	module.exports = GetIntentAdapter;

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _utils = __webpack_require__(2);
	
	var utils = _interopRequireWildcard(_utils);
	
	var _adapter = __webpack_require__(14);
	
	var _adapter2 = _interopRequireDefault(_adapter);
	
	var _ajax = __webpack_require__(21);
	
	var _bidmanager = __webpack_require__(11);
	
	var _bidmanager2 = _interopRequireDefault(_bidmanager);
	
	var _bidfactory = __webpack_require__(10);
	
	var _bidfactory2 = _interopRequireDefault(_bidfactory);
	
	var _constants = __webpack_require__(3);
	
	var _url = __webpack_require__(22);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	 * @type {{IA_JS: string, ADAPTER_NAME: string, V: string, RECTANGLE_SIZE: {W: number, H: number}, SPOT_TYPES: {INTERSTITIAL: string, RECTANGLE: string, FLOATING: string, BANNER: string}, DISPLAY_AD: number, ENDPOINT_URL: string, EVENTS_ENDPOINT_URL: string, RESPONSE_HEADERS_NAME: {PRICING_VALUE: string, AD_H: string, AD_W: string}}}
	 */
	var CONSTANTS = {
	  ADAPTER_NAME: 'inneractive',
	  V: 'IA-JS-HB-PBJS-1.0',
	  RECTANGLE_SIZE: { W: 300, H: 250 },
	
	  SPOT_TYPES: {
	    INTERSTITIAL: 'interstitial',
	    RECTANGLE: 'rectangle',
	    FLOATING: 'floating',
	    BANNER: 'banner'
	  },
	
	  DISPLAY_AD: 20,
	  ENDPOINT_URL: '//ad-tag.inner-active.mobi/simpleM2M/requestJsonAd',
	  EVENTS_ENDPOINT_URL: '//vast-events.inner-active.mobi/Event',
	  RESPONSE_HEADERS_NAME: {
	    PRICING_VALUE: 'X-IA-Pricing-Value',
	    AD_H: 'X-IA-Ad-Height',
	    AD_W: 'X-IA-Ad-Width'
	  }
	};
	
	var iaRef = void 0;
	try {
	  iaRef = window.top.document.referrer;
	} catch (e) {
	  iaRef = window.document.referrer;
	}
	
	/**
	 * gloable util functions
	 * @type {{defaultsQsParams: {v: (string|string), page: string, mw: boolean, hb: string}, stringToCamel: (function(*)), objectToCamel: (function(*=))}}
	 */
	var Helpers = {
	  defaultsQsParams: { v: CONSTANTS.V, page: encodeURIComponent(utils.getTopWindowUrl()), mw: true, hb: 'prebidjs' },
	  /**
	   * Change string format from underscore to camelcase (e.g., APP_ID to appId)
	   * @param str: string
	   * @returns string
	   */
	  stringToCamel: function stringToCamel(str) {
	    if (str.indexOf('_') === -1) {
	      var first = str.charAt(0);
	      if (first !== first.toLowerCase()) {
	        str = str.toLowerCase();
	      }
	      return str;
	    }
	
	    str = str.toLowerCase();
	    return str.replace(/(\_[a-z])/g, function ($1) {
	      return $1.toUpperCase().replace('_', '');
	    });
	  },
	
	
	  /**
	   * Change all object keys string format from underscore to camelcase (e.g., {'APP_ID' : ...} to {'appId' : ...})
	   * @param params: object
	   * @returns object
	   */
	  objectToCamel: function objectToCamel(params) {
	    var _this = this;
	
	    Object.keys(params).forEach(function (key) {
	      var keyCamelCase = _this.stringToCamel(key);
	      if (keyCamelCase !== key) {
	        params[keyCamelCase] = params[key];
	        delete params[key];
	      }
	    });
	    return params;
	  }
	};
	
	/**
	 * Tracking pixels for events
	 * @type {{fire: (function(*=))}}
	 */
	var Tracker = {
	  /**
	   * Creates a tracking pixel
	   * @param urls: Array<String>
	   */
	  fire: function fire(urls) {
	    urls.forEach(function (url) {
	      return url && (new Image(1, 1).src = encodeURI(url));
	    });
	  }
	};
	
	/**
	 * Analytics
	 * @type {{errorEventName: string, pageProtocol: string, getPageProtocol: (function(): string), getEventUrl: (function(*, *=)), reportEvent: (function(string, Object)), defaults: {v: (string|string), page: string, mw: boolean, hb: string}, eventQueryStringParams: (function(Object): string), createTrackingPixel: (function(string))}}
	 */
	var Reporter = {
	  /**
	   * @private
	   */
	  errorEventName: 'HBPreBidError',
	  pageProtocol: '',
	
	  /**
	   * Gets the page protocol based on the <code>document.location.protocol</code>
	   * The returned string is either <code>http://</code> or <code>https://</code>
	   * @returns {string}
	   */
	  getPageProtocol: function getPageProtocol() {
	    if (!this.pageProtocol) {
	      this.pageProtocol = 'http:' === utils.getTopWindowLocation().protocol ? 'http:' : 'https:';
	    }
	    return this.pageProtocol;
	  },
	  getEventUrl: function getEventUrl(evtName, extraDetails) {
	    var eventsEndpoint = CONSTANTS.EVENTS_ENDPOINT_URL + '?table=' + (evtName === this.errorEventName ? 'mbwError' : 'mbwEvent');
	    var queryStringParams = this.eventQueryStringParams(extraDetails);
	    var appId = extraDetails && extraDetails.appId;
	    var queryStringParamsWithAID = queryStringParams + '&aid=' + appId + '_' + evtName + '_other&evtName=' + evtName;
	    return eventsEndpoint + '&' + queryStringParamsWithAID;
	  },
	
	
	  /**
	   * Reports an event to IA's servers.
	   * @param {string} evtName - event name as string.
	   * @param {object} extraDetails - e.g., a JS exception JSON object.
	   * @param shouldSendOnlyToNewEndpoint
	   */
	  reportEvent: function reportEvent(evtName, extraDetails) {
	    var url = this.getEventUrl(evtName, extraDetails);
	    this.createTrackingPixel(url);
	  },
	
	  defaults: Helpers.defaultsQsParams,
	
	  /**
	   * Ia Event Reporting Query String Parameters, not including App Id.
	   * @param {object} extraDetails - e.g., a JS exception JSON object.
	   * @return {string} IA event contcatenated queryString parameters.
	   */
	  eventQueryStringParams: function eventQueryStringParams(extraDetails) {
	    var toQS = _extends({}, this.defaults, { realAppId: extraDetails && extraDetails.appId, timestamp: Date.now() });
	    return (0, _url.formatQS)(toQS);
	  },
	
	
	  /**
	   * Creates a tracking pixel by prepending the page's protocol to the URL sent as the param.
	   * @param {string} urlWithoutProtocol - the URL to send the tracking pixel to, without the protocol as a prefix.
	   */
	  createTrackingPixel: function createTrackingPixel(urlWithoutProtocol) {
	    Tracker.fire([this.getPageProtocol() + urlWithoutProtocol]);
	  }
	};
	
	/**
	 * Url generator - generates a request URL
	 * @type {{defaultsParams: *, serverParamNameBySettingParamName: {referrer: string, keywords: string, appId: string, portal: string, age: string, gender: string, isSecured: (boolean|null)}, toServerParams: (function(*)), unwantedValues: *[], getUrlParams: (function(*=))}}
	 */
	var Url = {
	  defaultsParams: _extends({}, Helpers.defaultsQsParams, { f: CONSTANTS.DISPLAY_AD, fs: false, ref: iaRef }),
	  serverParamNameBySettingParamName: {
	    referrer: 'ref',
	    keywords: 'k',
	    appId: 'aid',
	    portal: 'po',
	    age: 'a',
	    gender: 'g'
	  },
	  unwantedValues: ['', null, undefined],
	
	  /**
	   * Maps publisher params to server params
	   * @param params: object {k:v}
	   * @returns object {k:v}
	   */
	  toServerParams: function toServerParams(params) {
	    var serverParams = {};
	    for (var paramName in params) {
	      if (params.hasOwnProperty(paramName) && this.serverParamNameBySettingParamName.hasOwnProperty(paramName)) {
	        serverParams[this.serverParamNameBySettingParamName[paramName]] = params[paramName];
	      } else {
	        serverParams[paramName] = params[paramName];
	      }
	    }
	
	    serverParams.isSecured = Reporter.getPageProtocol() === 'https:' || null;
	    return serverParams;
	  },
	
	
	  /**
	   * Prepare querty string to ad server
	   * @param params: object {k:v}
	   * @returns : object {k:v}
	   */
	  getUrlParams: function getUrlParams(params) {
	    var serverParams = this.toServerParams(params);
	    var toQueryString = _extends({}, this.defaultsParams, serverParams);
	    for (var paramName in toQueryString) {
	      if (toQueryString.hasOwnProperty(paramName) && this.unwantedValues.indexOf(toQueryString[paramName]) !== -1) {
	        delete toQueryString[paramName];
	      }
	    }
	    toQueryString.fs = params.spotType === CONSTANTS.SPOT_TYPES.INTERSTITIAL;
	
	    if (params.spotType === CONSTANTS.SPOT_TYPES.RECTANGLE) {
	      toQueryString.rw = CONSTANTS.RECTANGLE_SIZE.W;
	      toQueryString.rh = CONSTANTS.RECTANGLE_SIZE.H;
	    }
	
	    if (typeof pbjs !== 'undefined') {
	      toQueryString.bco = pbjs.cbTimeout || pbjs.bidderTimeout;
	    }
	
	    toQueryString.timestamp = Date.now();
	    delete toQueryString.qa;
	    return toQueryString;
	  }
	};
	
	/**
	 * Http helper to extract metadata
	 * @type {{headers: *[], getBidHeaders: (function(*))}}
	 */
	var Http = {
	  headers: [CONSTANTS.RESPONSE_HEADERS_NAME.PRICING_VALUE, CONSTANTS.RESPONSE_HEADERS_NAME.AD_H, CONSTANTS.RESPONSE_HEADERS_NAME.AD_W],
	
	  /**
	   * Extract headers data
	   * @param xhr: XMLHttpRequest
	   * @returns {}
	   */
	  getBidHeaders: function getBidHeaders(xhr) {
	    var headersData = {};
	    this.headers.forEach(function (headerName) {
	      return headersData[headerName] = xhr.getResponseHeader(headerName);
	    });
	    return headersData;
	  }
	};
	
	/**
	 * InnerActiveAdapter for requesting bids
	 * @class
	 */
	
	var InnerActiveAdapter = function () {
	  function InnerActiveAdapter() {
	    _classCallCheck(this, InnerActiveAdapter);
	
	    this.iaAdapter = _adapter2['default'].createNew(CONSTANTS.ADAPTER_NAME);
	    this.bidByBidId = {};
	  }
	
	  /**
	   * validate if bid request is valid
	   * @param adSettings: object
	   * @returns {boolean}
	   * @private
	   */
	
	
	  _createClass(InnerActiveAdapter, [{
	    key: '_isValidRequest',
	    value: function _isValidRequest(adSettings) {
	      if (adSettings && adSettings.appId && adSettings.spotType) {
	        return true;
	      }
	      utils.logError('bid requires appId');
	      return false;
	    }
	
	    /**
	     * Store the bids in a Map object (k: bidId, v: bid)to check later if won
	     * @param bid
	     * @returns bid object
	     * @private
	     */
	
	  }, {
	    key: '_storeBidRequestDetails',
	    value: function _storeBidRequestDetails(bid) {
	      this.bidByBidId[bid.bidId] = bid;
	      return bid;
	    }
	
	    /**
	     * @param bidStatus: int ("STATUS": {"GOOD": 1,"NO_BID": 2})
	     * @param bidResponse: object
	     * @returns {type[]}
	     * @private
	     */
	
	  }, {
	    key: '_getBidDetails',
	    value: function _getBidDetails(bidStatus, bidResponse, bidId) {
	      var bid = _bidfactory2['default'].createBid(bidStatus, bidResponse);
	      bid.code = CONSTANTS.ADAPTER_NAME;
	      bid.bidderCode = bid.code;
	      if (bidStatus === _constants.STATUS.GOOD) {
	        bid = _extends(bid, bidResponse);
	        this._setBidCpm(bid, bidId);
	      }
	      return bid;
	    }
	  }, {
	    key: '_setBidCpm',
	    value: function _setBidCpm(bid, bidId) {
	      var storedBid = this.bidByBidId[bidId];
	      if (storedBid) {
	        bid.cpm = storedBid.params && storedBid.params.qa && storedBid.params.qa.cpm || bid.cpm;
	        bid.cpm = bid.cpm !== null && !isNaN(bid.cpm) ? parseFloat(bid.cpm) : 0.0;
	      }
	    }
	
	    /**
	     * Validate if response is valid
	     * @param responseAsJson : object
	     * @param headersData: {}
	     * @returns {boolean}
	     * @private
	     */
	
	  }, {
	    key: '_isValidBidResponse',
	    value: function _isValidBidResponse(responseAsJson, headersData) {
	      return responseAsJson && responseAsJson.ad && responseAsJson.ad.html && headersData && headersData[CONSTANTS.RESPONSE_HEADERS_NAME.PRICING_VALUE] > 0;
	    }
	
	    /**
	     * When response is received
	     * @param response: string(json format)
	     * @param xhr: XMLHttpRequest
	     * @param bidId: string
	     * @private
	     */
	
	  }, {
	    key: '_onResponse',
	    value: function _onResponse(response, xhr, bidId) {
	      var bid = this.bidByBidId[bidId];
	
	      var _bid$sizes$ = _slicedToArray(bid.sizes[0], 2),
	          w = _bid$sizes$[0],
	          h = _bid$sizes$[1];
	
	      var size = { w: w, h: h };
	      var responseAsJson = void 0;
	      var headersData = Http.getBidHeaders(xhr);
	      try {
	        responseAsJson = JSON.parse(response);
	      } catch (error) {
	        utils.logError(error);
	      }
	
	      if (!this._isValidBidResponse(responseAsJson, headersData)) {
	        var errorMessage = 'response failed for ' + CONSTANTS.ADAPTER_NAME + ' adapter';
	        utils.logError(errorMessage);
	        var passback = responseAsJson && responseAsJson.config && responseAsJson.config.passback;
	        if (passback) {
	          Tracker.fire([passback]);
	        }
	        Reporter.reportEvent('HBPreBidNoAd', bid.params);
	        return _bidmanager2['default'].addBidResponse(bid.placementCode, this._getBidDetails(_constants.STATUS.NO_BID));
	      }
	      var bidResponse = {
	        cpm: headersData[CONSTANTS.RESPONSE_HEADERS_NAME.PRICING_VALUE] * 1000,
	        width: parseFloat(headersData[CONSTANTS.RESPONSE_HEADERS_NAME.AD_W]) || size.w,
	        ad: this._getAd(responseAsJson.ad.html, responseAsJson.config.tracking, bid.params),
	        height: parseFloat(headersData[CONSTANTS.RESPONSE_HEADERS_NAME.AD_H]) || size.h
	      };
	      var auctionBid = this._getBidDetails(_constants.STATUS.GOOD, bidResponse, bidId);
	      bid.adId = auctionBid.adId;
	      this.bidByBidId[bidId] = bid;
	      _bidmanager2['default'].addBidResponse(bid.placementCode, auctionBid);
	    }
	
	    /**
	     * Returns the ad HTML template
	     * @param adHtml: string {ad server creative}
	     * @param tracking: object {impressions, clicks}
	     * @param bidParams: object
	     * @returns {string}: create template
	     * @private
	     */
	
	  }, {
	    key: '_getAd',
	    value: function _getAd(adHtml, tracking, bidParams) {
	
	      var impressionsHtml = '';
	      if (tracking && Array.isArray(tracking.impressions)) {
	        var impressions = tracking.impressions;
	        impressions.push(Reporter.getEventUrl('HBPreBidImpression', bidParams, false));
	        impressions.forEach(function (impression) {
	          return impression && (impressionsHtml += utils.createTrackPixelHtml(impression));
	        });
	      }
	      adHtml = impressionsHtml + adHtml.replace(/<a /g, '<a target="_blank" ');
	      var clicks = tracking && Array.isArray(tracking.clicks) && tracking.clicks;
	      if (clicks && Array.isArray(clicks)) {
	        clicks.push(Reporter.getEventUrl('HBPreBidClick', bidParams, false));
	      }
	      var adTemplate = '\n      <html>\n        <head>\n            <script type=\'text/javascript\'>inDapIF=true;</script>\n        </head>\n        <body style=\'margin : 0; padding: 0;\'>\n            <div id="iaAdContainer">' + adHtml + '</div>\n            <script type=\'text/javascript\'>\n                var iaAdContainer = document.getElementById(\'iaAdContainer\');\n                if(iaAdContainer){\n                    var clicks = \'' + clicks + '\';\n                    if(clicks){\n                      clicks = clicks.split(\',\');\n                      iaAdContainer.addEventListener(\'click\', function onIaContainerClick(){\n                          clicks.forEach(function forEachClick(click){\n                              if(click){\n                                  (new Image(1,1)).src = encodeURI(click);\n                              }\n                          });\n                      });\n                    }\n                }\n            </script>\n        </body>\n      </html>';
	      return adTemplate;
	    }
	    /**
	     * Adjust bid params to ia-ad-server params
	     * @param bid: object
	     * @private
	     */
	
	  }, {
	    key: '_toIaBidParams',
	    value: function _toIaBidParams(bid) {
	      var bidParamsWithCustomParams = _extends({}, bid.params, bid.params.customParams);
	      delete bidParamsWithCustomParams.customParams;
	      bid.params = Helpers.objectToCamel(bidParamsWithCustomParams);
	    }
	
	    /**
	     * Prebid executes for stating an auction
	     * @param bidRequest: object
	     */
	
	  }, {
	    key: 'callBids',
	    value: function callBids(bidRequest) {
	      var _this2 = this;
	
	      var bids = bidRequest.bids || [];
	      bids.forEach(function (bid) {
	        return _this2._toIaBidParams(bid);
	      });
	      bids.filter(function (bid) {
	        return _this2._isValidRequest(bid.params);
	      }).map(function (bid) {
	        return _this2._storeBidRequestDetails(bid);
	      }).forEach(function (bid) {
	        return (0, _ajax.ajax)(_this2._getEndpointUrl(bid.params), function (response, xhr) {
	          return _this2._onResponse(response, xhr, bid.bidId);
	        }, Url.getUrlParams(bid.params), { method: 'GET' });
	      });
	    }
	  }, {
	    key: '_getEndpointUrl',
	    value: function _getEndpointUrl(params) {
	      return params && params.qa && params.qa.url || Reporter.getPageProtocol() + CONSTANTS.ENDPOINT_URL;
	    }
	  }, {
	    key: '_getStoredBids',
	    value: function _getStoredBids() {
	      var storedBids = [];
	      for (var bidId in this.bidByBidId) {
	        if (this.bidByBidId.hasOwnProperty(bidId)) {
	          storedBids.push(this.bidByBidId[bidId]);
	        }
	      }
	      return storedBids;
	    }
	
	    /**
	     * Return internal object - testing
	     * @returns {{Reporter: {errorEventName: string, pageProtocol: string, getPageProtocol: (function(): string), getEventUrl: (function(*, *=)), reportEvent: (function(string, Object)), defaults: {v: (string|string), page: string, mw: boolean, hb: string}, eventQueryStringParams: (function(Object): string), createTrackingPixel: (function(string))}}}
	     * @private
	     */
	
	  }], [{
	    key: '_getUtils',
	    value: function _getUtils() {
	      return { Reporter: Reporter };
	    }
	
	    /**
	     * Creates new instance of InnerActiveAdapter for prebid auction
	     * @returns {InnerActiveAdapter}
	     */
	
	  }, {
	    key: 'createNew',
	    value: function createNew() {
	      return new InnerActiveAdapter();
	    }
	  }]);
	
	  return InnerActiveAdapter;
	}();
	
	module.exports = InnerActiveAdapter;

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _adapter = __webpack_require__(14);
	
	var _adapter2 = _interopRequireDefault(_adapter);
	
	var _bidfactory = __webpack_require__(10);
	
	var _bidfactory2 = _interopRequireDefault(_bidfactory);
	
	var _bidmanager = __webpack_require__(11);
	
	var _bidmanager2 = _interopRequireDefault(_bidmanager);
	
	var _utils = __webpack_require__(2);
	
	var utils = _interopRequireWildcard(_utils);
	
	var _ajax = __webpack_require__(21);
	
	var _constants = __webpack_require__(3);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	var ENDPOINT = '//bidder.komoona.com/v1/GetSBids';
	
	function KomoonaAdapter() {
	
	  var baseAdapter = _adapter2['default'].createNew('komoona');
	  var bidRequests = {};
	
	  /* Prebid executes this function when the page asks to send out bid requests */
	  baseAdapter.callBids = function (bidRequest) {
	    var bids = bidRequest.bids || [];
	    var tags = bids.filter(function (bid) {
	      return valid(bid);
	    }).map(function (bid) {
	      // map request id to bid object to retrieve adUnit code in callback
	      bidRequests[bid.bidId] = bid;
	
	      var tag = {};
	      tag.sizes = bid.sizes;
	      tag.uuid = bid.bidId;
	      tag.placementid = bid.params.placementId;
	      tag.hbid = bid.params.hbid;
	
	      return tag;
	    });
	
	    if (!utils.isEmpty(tags)) {
	      var payload = JSON.stringify({ bids: [].concat(_toConsumableArray(tags)) });
	
	      (0, _ajax.ajax)(ENDPOINT, handleResponse, payload, {
	        contentType: 'text/plain',
	        withCredentials: true
	      });
	    }
	  };
	
	  /* Notify Prebid of bid responses so bids can get in the auction */
	  function handleResponse(response) {
	    var parsed = void 0;
	
	    try {
	      parsed = JSON.parse(response);
	    } catch (error) {
	      utils.logError(error);
	    }
	
	    if (!parsed || parsed.error) {
	      var errorMessage = 'in response for ' + baseAdapter.getBidderCode() + ' adapter';
	      if (parsed && parsed.error) {
	        errorMessage += ': ' + parsed.error;
	      }
	      utils.logError(errorMessage);
	
	      // signal this response is complete
	      Object.keys(bidRequests).map(function (bidId) {
	        return bidRequests[bidId].placementCode;
	      }).forEach(function (placementCode) {
	        _bidmanager2['default'].addBidResponse(placementCode, createBid(_constants.STATUS.NO_BID));
	      });
	
	      return;
	    }
	
	    parsed.bids.forEach(function (tag) {
	      var status = void 0;
	      if (tag.cpm > 0 && tag.creative) {
	        status = _constants.STATUS.GOOD;
	      } else {
	        status = _constants.STATUS.NO_BID;
	      }
	
	      tag.bidId = tag.uuid; // bidfactory looks for bidId on requested bid
	      var bid = createBid(status, tag);
	      var placement = bidRequests[bid.adId].placementCode;
	
	      _bidmanager2['default'].addBidResponse(placement, bid);
	    });
	  }
	
	  /* Check that a bid has required paramters */
	  function valid(bid) {
	    if (bid.params.placementId && bid.params.hbid) {
	      return bid;
	    } else {
	      utils.logError('bid requires placementId and hbid params');
	    }
	  }
	
	  /* Create and return a bid object based on status and tag */
	  function createBid(status, tag) {
	    var bid = _bidfactory2['default'].createBid(status, tag);
	    bid.code = baseAdapter.getBidderCode();
	    bid.bidderCode = baseAdapter.getBidderCode();
	
	    if (status === _constants.STATUS.GOOD) {
	      bid.cpm = tag.cpm;
	      bid.width = tag.width;
	      bid.height = tag.height;
	      bid.ad = tag.creative;
	    }
	
	    return bid;
	  }
	
	  return {
	    createNew: KomoonaAdapter.createNew,
	    callBids: baseAdapter.callBids,
	    setBidderCode: baseAdapter.setBidderCode
	  };
	}
	
	KomoonaAdapter.createNew = function () {
	  return new KomoonaAdapter();
	};
	
	module.exports = KomoonaAdapter;

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var utils = __webpack_require__(2);
	var adloader = __webpack_require__(13);
	
	var LifestreetAdapter = function LifestreetAdapter() {
	  var BIDDER_CODE = 'lifestreet';
	  var ADAPTER_VERSION = 'prebidJS-1.0';
	  var SLOTS_LOAD_MAP = {};
	  var PREBID_REQUEST_MESSAGE = 'LSMPrebid Request';
	  var PREBID_RESPONSE_MESSAGE = 'LSMPrebid Response';
	
	  function _callBids(params) {
	    utils._each(params.bids, function (bid) {
	      var jstagUrl = bid.params.jstag_url;
	      var slot = bid.params.slot;
	      var adkey = bid.params.adkey;
	      var adSize = bid.params.ad_size;
	      var timeout = 700;
	      if (bid.params.timeout) {
	        timeout = bid.params.timeout;
	      }
	      var shouldRequest = false;
	      if (jstagUrl && jstagUrl.length > 0 && slot && slot.length > 0 && adkey && adkey.length > 0 && adSize && adSize.length > 0) {
	        var adSizeArray = adSize.split('x');
	        for (var i = 0; i < adSizeArray.length; ++i) {
	          adSizeArray[i] = +adSizeArray[i];
	        }
	        if (bid.sizes && bid.sizes instanceof Array && bid.sizes.length > 0 && adSizeArray.length > 1) {
	          bid.sizes = !(bid.sizes[0] instanceof Array) ? [bid.sizes] : bid.sizes;
	          for (var _i = 0; _i < bid.sizes.length; ++_i) {
	            var size = bid.sizes[_i];
	            if (size.length > 1) {
	              if (size[0] === adSizeArray[0] && size[1] === adSizeArray[1]) {
	                shouldRequest = true;
	                break;
	              }
	            }
	          }
	        } else {
	          shouldRequest = true;
	        }
	      }
	      if (shouldRequest) {
	        _callJSTag(bid, jstagUrl, timeout);
	      } else {
	        _addSlotBidResponse(bid, 0, null, 0, 0);
	      }
	    });
	  }
	
	  function _callJSTag(bid, jstagUrl, timeout) {
	    adloader.loadScript(jstagUrl, function () {
	      /*global LSM_Slot */
	      if (LSM_Slot && typeof LSM_Slot === 'function') {
	        var slotTagParams = {
	          _preload: 'wait',
	          _hb_request: ADAPTER_VERSION,
	          _timeout: timeout,
	          _onload: function _onload(slot, action, cpm, width, height) {
	            if (slot.state() !== 'error') {
	              var slotName = slot.getSlotObjectName();
	              pbjs[slotName] = slot;
	              if (slotName && !SLOTS_LOAD_MAP[slotName]) {
	                SLOTS_LOAD_MAP[slotName] = true;
	                var ad = _constructLSMAd(jstagUrl, slotName);
	                _addSlotBidResponse(bid, cpm, ad, width, height);
	              } else {
	                slot.show();
	              }
	            } else {
	              _addSlotBidResponse(bid, 0, null, 0, 0);
	            }
	          }
	        };
	        for (var property in bid.params) {
	          if (property === 'jstag_url' || property === 'timeout') {
	            continue;
	          }
	          if (bid.params.hasOwnProperty(property)) {
	            slotTagParams[property] = bid.params[property];
	          }
	        }
	        /*jshint newcap: false */
	        LSM_Slot(slotTagParams);
	        window.addEventListener('message', function (ev) {
	          var key = ev.message ? 'message' : 'data';
	          var object = {};
	          try {
	            object = JSON.parse(ev[key]);
	          } catch (e) {
	            return;
	          }
	          if (object.message && object.message === PREBID_REQUEST_MESSAGE && object.slotName && window.pbjs[object.slotName]) {
	            ev.source.postMessage(JSON.stringify({
	              message: PREBID_RESPONSE_MESSAGE,
	              slotObject: window.pbjs[object.slotName]
	            }), '*');
	            window.pbjs[object.slotName].destroy();
	            window.pbjs[object.slotName] = null;
	          }
	        }, false);
	      } else {
	        _addSlotBidResponse(bid, 0, null, 0, 0);
	      }
	    });
	  }
	
	  function _addSlotBidResponse(bid, cpm, ad, width, height) {
	    var hasResponse = cpm && ad && ad.length > 0;
	    var bidObject = bidfactory.createBid(hasResponse ? 1 : 2, bid);
	    bidObject.bidderCode = BIDDER_CODE;
	    if (hasResponse) {
	      bidObject.cpm = cpm;
	      bidObject.ad = ad;
	      bidObject.width = width;
	      bidObject.height = height;
	    }
	    bidmanager.addBidResponse(bid.placementCode, bidObject);
	  }
	
	  function _constructLSMAd(jsTagUrl, slotName) {
	    if (jsTagUrl && slotName) {
	      return '<div id="LSM_AD"></div>\n             <script type="text/javascript" src=\'' + jsTagUrl + '\'></script>\n             <script>\n              function receivedLSMMessage(ev) {\n                var key = ev.message ? \'message\' : \'data\';\n                var object = {};\n                try {\n                  object = JSON.parse(ev[key]);\n                } catch (e) {\n                  return;\n                }\n                if (object.message === \'' + PREBID_RESPONSE_MESSAGE + '\' && object.slotObject) {\n                  var slot  = object.slotObject;\n                  slot.__proto__ = slotapi.Slot.prototype;\n                  slot.getProperties()[\'_onload\'] = function(slot) {\n                    if (slot.state() !== \'error\') {\n                      slot.show();\n                    }\n                  };\n                  window[slot.getSlotObjectName()] = slot;\n                  slot.showInContainer(document.getElementById("LSM_AD"));\n                }\n              }\n              window.addEventListener(\'message\', receivedLSMMessage, false);\n              window.parent.postMessage(JSON.stringify({\n                message: \'' + PREBID_REQUEST_MESSAGE + '\',\n                slotName: \'' + slotName + '\'\n              }), \'*\');\n            </script>';
	    }
	    return null;
	  }
	
	  return {
	    callBids: _callBids
	  };
	};
	
	module.exports = LifestreetAdapter;

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var adloader = __webpack_require__(13);
	var constants = __webpack_require__(3);
	
	module.exports = function () {
	  function inIframe() {
	    try {
	      return window.self !== window.top && !window.mantis_link;
	    } catch (e) {
	      return true;
	    }
	  }
	
	  function isDesktop(ignoreTouch) {
	    var scope = function scope(win) {
	      var width = win.innerWidth || win.document.documentElement.clientWidth || win.document.body.clientWidth;
	      var supportsTouch = !ignoreTouch && ('ontouchstart' in window || navigator.msMaxTouchPoints);
	
	      return !supportsTouch && (!width || width >= (window.mantis_breakpoint || 768));
	    };
	
	    if (inIframe()) {
	      try {
	        return scope(window.top);
	      } catch (ex) {}
	    }
	
	    return scope(window);
	  }
	
	  function isSendable(val) {
	    if (val === null || val === undefined) {
	      return false;
	    }
	
	    if (typeof val === 'string') {
	      return !(!val || /^\s*$/.test(val));
	    }
	
	    if (typeof val === 'number') {
	      return !isNaN(val);
	    }
	
	    return true;
	  }
	
	  function isObject(value) {
	    return Object.prototype.toString.call(value) === '[object Object]';
	  }
	
	  function isAmp() {
	    return _typeof(window.context) === "object" && (window.context.tagName === "AMP-AD" || window.context.tagName === "AMP-EMBED");
	  }
	
	  function isSecure() {
	    return document.location.protocol === "https:";
	  }
	
	  function isArray(value) {
	    return Object.prototype.toString.call(value) === '[object Array]';
	  }
	
	  function jsonp(callback) {
	    if (!window.mantis_jsonp) {
	      window.mantis_jsonp = [];
	    }
	
	    window.mantis_jsonp.push(callback);
	
	    return 'mantis_jsonp[' + (window.mantis_jsonp.length - 1) + ']';
	  }
	
	  function jsonToQuery(data, chain, form) {
	    if (!data) {
	      return null;
	    }
	
	    var parts = form || [];
	
	    for (var key in data) {
	      var queryKey = key;
	
	      if (chain) {
	        queryKey = chain + '[' + key + ']';
	      }
	
	      var val = data[key];
	
	      if (isArray(val)) {
	        for (var index = 0; index < val.length; index++) {
	          var akey = queryKey + '[' + index + ']';
	          var aval = val[index];
	
	          if (isObject(aval)) {
	            jsonToQuery(aval, akey, parts);
	          } else if (isSendable(aval)) {
	            parts.push(akey + '=' + encodeURIComponent(aval));
	          }
	        }
	      } else if (isObject(val)) {
	        jsonToQuery(val, queryKey, parts);
	      } else if (isSendable(val)) {
	        parts.push(queryKey + '=' + encodeURIComponent(val));
	      }
	    }
	
	    return parts.join('&');
	  }
	
	  function buildMantisUrl(path, data, domain) {
	    var params = {
	      referrer: document.referrer,
	      tz: new Date().getTimezoneOffset(),
	      buster: new Date().getTime(),
	      secure: isSecure()
	    };
	
	    if (!inIframe() || isAmp()) {
	      params.mobile = !isAmp() && isDesktop(true) ? 'false' : 'true';
	    }
	
	    if (window.mantis_uuid) {
	      params.uuid = window.mantis_uuid;
	    } else if (window.localStorage) {
	      var localUuid = window.localStorage.getItem('mantis:uuid');
	
	      if (localUuid) {
	        params.uuid = localUuid;
	      }
	    }
	
	    if (!inIframe()) {
	      try {
	        params.title = window.top.document.title;
	        params.referrer = window.top.document.referrer;
	        params.url = window.top.document.location.href;
	      } catch (ex) {}
	    } else {
	      params.iframe = true;
	    }
	
	    if (isAmp()) {
	      if (!params.url && window.context.canonicalUrl) {
	        params.url = window.context.canonicalUrl;
	      }
	
	      if (!params.url && window.context.location) {
	        params.url = window.context.location.href;
	      }
	
	      if (!params.referrer && window.context.referrer) {
	        params.referrer = window.context.referrer;
	      }
	    }
	
	    Object.keys(data || {}).forEach(function (key) {
	      params[key] = data[key];
	    });
	
	    var query = jsonToQuery(params);
	
	    return (window.mantis_domain === undefined ? domain || 'https://mantodea.mantisadnetwork.com' : window.mantis_domain) + path + '?' + query;
	  }
	
	  var Prebid = function Prebid(bidfactory, bidmanager, adloader, constants) {
	    return {
	      callBids: function callBids(params) {
	        var property = null;
	
	        params.bids.some(function (bid) {
	          if (bid.params.property) {
	            property = bid.params.property;
	
	            return true;
	          }
	        });
	
	        var url = {
	          jsonp: jsonp(function (resp) {
	            params.bids.forEach(function (bid) {
	              var ad = resp.ads[bid.bidId];
	
	              var bidObject;
	
	              if (ad) {
	                bidObject = bidfactory.createBid(constants.STATUS.GOOD);
	                bidObject.bidderCode = 'mantis';
	                bidObject.cpm = ad.cpm;
	                bidObject.ad = ad.html;
	                bidObject.width = ad.width;
	                bidObject.height = ad.height;
	              } else {
	                bidObject = bidfactory.createBid(constants.STATUS.NO_BID);
	                bidObject.bidderCode = 'mantis';
	              }
	
	              bidmanager.addBidResponse(bid.placementCode, bidObject);
	            });
	          }),
	          property: property,
	          bids: params.bids.map(function (bid) {
	            return {
	              bidId: bid.bidId,
	              config: bid.params,
	              sizes: bid.sizes.map(function (size) {
	                return { width: size[0], height: size[1] };
	              })
	            };
	          }),
	          version: 1
	        };
	
	        adloader.loadScript(buildMantisUrl('/website/prebid', url));
	      }
	    };
	  };
	
	  return new Prebid(bidfactory, bidmanager, adloader, constants);
	};

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var adloader = __webpack_require__(13);
	var CONSTANTS = __webpack_require__(3);
	var utils = __webpack_require__(2);
	
	var OpenxAdapter = function OpenxAdapter() {
	  var BIDDER_CODE = 'openx';
	  var BIDDER_CONFIG = 'hb_pb';
	  var startTime = void 0;
	
	  var pdNode = null;
	
	  pbjs.oxARJResponse = function (oxResponseObj) {
	    var adUnits = oxResponseObj.ads.ad;
	    if (oxResponseObj.ads && oxResponseObj.ads.pixels) {
	      makePDCall(oxResponseObj.ads.pixels);
	    }
	
	    if (!adUnits) {
	      adUnits = [];
	    }
	
	    var bids = pbjs._bidsRequested.find(function (bidSet) {
	      return bidSet.bidderCode === 'openx';
	    }).bids;
	    for (var i = 0; i < bids.length; i++) {
	      var bid = bids[i];
	      var auid = null;
	      var adUnit = null;
	      // find the adunit in the response
	      for (var j = 0; j < adUnits.length; j++) {
	        adUnit = adUnits[j];
	        if (String(bid.params.unit) === String(adUnit.adunitid) && adUnitHasValidSizeFromBid(adUnit, bid) && !adUnit.used) {
	          auid = adUnit.adunitid;
	          break;
	        }
	      }
	
	      var beaconParams = {
	        bd: +new Date() - startTime,
	        br: '0', // maybe 0, t, or p
	        bt: pbjs.cbTimeout || pbjs.bidderTimeout, // For the timeout per bid request
	        bs: window.location.hostname
	      };
	
	      // no fill :(
	      if (!auid || !adUnit.pub_rev) {
	        addBidResponse(null, bid);
	        continue;
	      }
	      adUnit.used = true;
	
	      beaconParams.br = beaconParams.bt < beaconParams.bd ? 't' : 'p';
	      beaconParams.bp = adUnit.pub_rev;
	      beaconParams.ts = adUnit.ts;
	      addBidResponse(adUnit, bid);
	      buildBoPixel(adUnit.creative[0], beaconParams);
	    }
	  };
	
	  function getViewportDimensions(isIfr) {
	    var width = void 0,
	        height = void 0,
	        tWin = window,
	        tDoc = document,
	        docEl = tDoc.documentElement,
	        body = void 0;
	
	    if (isIfr) {
	      try {
	        tWin = window.top;
	        tDoc = window.top.document;
	      } catch (e) {
	        return;
	      }
	      docEl = tDoc.documentElement;
	      body = tDoc.body;
	
	      width = tWin.innerWidth || docEl.clientWidth || body.clientWidth;
	      height = tWin.innerHeight || docEl.clientHeight || body.clientHeight;
	    } else {
	      docEl = tDoc.documentElement;
	      width = tWin.innerWidth || docEl.clientWidth;
	      height = tWin.innerHeight || docEl.clientHeight;
	    }
	
	    return width + 'x' + height;
	  }
	
	  function makePDCall(pixelsUrl) {
	    var pdFrame = utils.createInvisibleIframe();
	    var name = 'openx-pd';
	    pdFrame.setAttribute("id", name);
	    pdFrame.setAttribute("name", name);
	    var rootNode = document.body;
	
	    if (!rootNode) {
	      return;
	    }
	
	    pdFrame.src = pixelsUrl;
	
	    if (pdNode) {
	      pdNode.parentNode.replaceChild(pdFrame, pdNode);
	      pdNode = pdFrame;
	    } else {
	      pdNode = rootNode.appendChild(pdFrame);
	    }
	  }
	
	  function addBidResponse(adUnit, bid) {
	    var bidResponse = bidfactory.createBid(adUnit ? CONSTANTS.STATUS.GOOD : CONSTANTS.STATUS.NO_BID, bid);
	    bidResponse.bidderCode = BIDDER_CODE;
	
	    if (adUnit) {
	      var creative = adUnit.creative[0];
	      bidResponse.ad = adUnit.html;
	      bidResponse.cpm = Number(adUnit.pub_rev) / 1000;
	      bidResponse.ad_id = adUnit.adid;
	      if (adUnit.deal_id) {
	        bidResponse.dealId = adUnit.deal_id;
	      }
	      if (creative) {
	        bidResponse.width = creative.width;
	        bidResponse.height = creative.height;
	      }
	    }
	    bidmanager.addBidResponse(bid.placementCode, bidResponse);
	  }
	
	  function buildQueryStringFromParams(params) {
	    for (var key in params) {
	      if (params.hasOwnProperty(key)) {
	        if (!params[key]) {
	          delete params[key];
	        }
	      }
	    }
	    return utils._map(Object.keys(params), function (key) {
	      return key + '=' + params[key];
	    }).join('&');
	  }
	
	  function buildBoPixel(creative, params) {
	    var img = new Image();
	    var recordPixel = creative.tracking.impression;
	    var boBase = recordPixel.match(/([^?]+\/)ri\?/);
	
	    if (boBase) {
	      img.src = boBase[1] + 'bo?' + buildQueryStringFromParams(params);
	    }
	  }
	
	  function adUnitHasValidSizeFromBid(adUnit, bid) {
	    var sizes = utils.parseSizesInput(bid.sizes);
	    var sizeLength = sizes && sizes.length || 0;
	    var found = false;
	    var creative = adUnit.creative && adUnit.creative[0];
	    var creative_size = String(creative.width) + 'x' + String(creative.height);
	
	    if (utils.isArray(sizes)) {
	      for (var i = 0; i < sizeLength; i++) {
	        var size = sizes[i];
	        if (String(size) === String(creative_size)) {
	          found = true;
	          break;
	        }
	      }
	    }
	    return found;
	  }
	
	  function buildRequest(bids, params, delDomain) {
	    if (!utils.isArray(bids)) {
	      return;
	    }
	
	    params.auid = utils._map(bids, function (bid) {
	      return bid.params.unit;
	    }).join('%2C');
	    params.aus = utils._map(bids, function (bid) {
	      return utils.parseSizesInput(bid.sizes).join(',');
	    }).join('|');
	
	    bids.forEach(function (bid) {
	      for (var customParam in bid.params.customParams) {
	        if (bid.params.customParams.hasOwnProperty(customParam)) {
	          params["c." + customParam] = bid.params.customParams[customParam];
	        }
	      }
	    });
	
	    params.callback = 'window.pbjs.oxARJResponse';
	    var queryString = buildQueryStringFromParams(params);
	
	    adloader.loadScript('//' + delDomain + '/w/1.0/arj?' + queryString);
	  }
	
	  function callBids(params) {
	    var isIfr = void 0,
	        bids = params.bids || [],
	        currentURL = window.parent !== window ? document.referrer : window.location.href;
	    currentURL = currentURL && encodeURIComponent(currentURL);
	    try {
	      isIfr = window.self !== window.top;
	    } catch (e) {
	      isIfr = false;
	    }
	    if (bids.length === 0) {
	      return;
	    }
	
	    var delDomain = bids[0].params.delDomain;
	
	    startTime = new Date(params.start);
	
	    buildRequest(bids, {
	      ju: currentURL,
	      jr: currentURL,
	      ch: document.charSet || document.characterSet,
	      res: screen.width + 'x' + screen.height + 'x' + screen.colorDepth,
	      ifr: isIfr,
	      tz: startTime.getTimezoneOffset(),
	      tws: getViewportDimensions(isIfr),
	      ee: 'api_sync_write',
	      ef: 'bt%2Cdb',
	      be: 1,
	      bc: BIDDER_CONFIG
	    }, delDomain);
	  }
	
	  return {
	    callBids: callBids
	  };
	};
	
	module.exports = OpenxAdapter;

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var CONSTANTS = __webpack_require__(3);
	var utils = __webpack_require__(2);
	var bidmanager = __webpack_require__(11);
	var bidfactory = __webpack_require__(10);
	var adloader = __webpack_require__(13);
	var Adapter = __webpack_require__(14);
	
	var PiximediaAdapter = function PiximediaAdapter() {
	  var PREBID_URL = '//static.adserver.pm/prebid';
	  var baseAdapter = Adapter.createNew('piximedia');
	  var bidStash = {};
	
	  var tryAppendPixiQueryString = function tryAppendPixiQueryString(url, name, value) {
	    return url + "/" + encodeURIComponent(name) + "=" + value;
	  };
	
	  baseAdapter.callBids = function callBidsPiximedia(params) {
	    utils._each(params.bids, function (bid) {
	
	      // valid bids must include a siteId and an placementId
	      if (bid.placementCode && bid.sizes && bid.params && bid.params.siteId && bid.params.placementId) {
	
	        var sizes = bid.params.hasOwnProperty('sizes') ? bid.params.sizes : bid.sizes;
	        sizes = utils.parseSizesInput(sizes);
	
	        var cbid = utils.getUniqueIdentifierStr();
	
	        // we allow overriding the URL in the params
	        var url = bid.params.prebidUrl || PREBID_URL;
	
	        // params are passed to the Piximedia endpoint, including custom params
	        for (var key in bid.params) {
	          /* istanbul ignore else */
	          if (bid.params.hasOwnProperty(key)) {
	            var value = bid.params[key];
	            switch (key) {
	              case "siteId":
	                url = tryAppendPixiQueryString(url, 'site_id', encodeURIComponent(value));
	                break;
	
	              case "placementId":
	                url = tryAppendPixiQueryString(url, 'placement_id', encodeURIComponent(value));
	                break;
	
	              case "dealId":
	                url = tryAppendPixiQueryString(url, 'l_id', encodeURIComponent(value));
	                break;
	
	              case "sizes":
	              case "prebidUrl":
	                break;
	
	              default:
	                if (typeof value === "function") {
	                  url = tryAppendPixiQueryString(url, key, encodeURIComponent((value(baseAdapter, params, bid) || "").toString()));
	                } else {
	                  url = tryAppendPixiQueryString(url, key, encodeURIComponent((value || "").toString()));
	                }
	                break;
	            }
	          }
	        }
	
	        url = tryAppendPixiQueryString(url, 'jsonp', 'pbjs.handlePiximediaCallback');
	        url = tryAppendPixiQueryString(url, 'sizes', encodeURIComponent(sizes.join(",")));
	        url = tryAppendPixiQueryString(url, 'cbid', encodeURIComponent(cbid));
	        url = tryAppendPixiQueryString(url, 'rand', String(Math.floor(Math.random() * 1000000000)));
	
	        bidStash[cbid] = {
	          'bidObj': bid,
	          'url': url,
	          'start': new Date().getTime()
	        };
	        utils.logMessage('[Piximedia] Dispatching header Piximedia to URL ' + url);
	        adloader.loadScript(url);
	      }
	    });
	  };
	
	  /*
	   * Piximedia's bidResponse should look like:
	   *
	   * {
	   *   'foundbypm': true,            // a Boolean, indicating if an ad was found
	   *   'currency': 'EUR',        // the currency, as a String
	   *   'cpm': 1.99,              // the win price as a Number, in currency
	   *   'dealId': null,           // or string value of winning deal ID
	   *   'width': 300,             // width in pixels of winning ad
	   *   'height': 250,            // height in pixels of winning ad
	   *   'html': 'tag_here'        // HTML tag to load if we are picked
	   * }
	   *
	   */
	  pbjs.handlePiximediaCallback = function (bidResponse) {
	    if (bidResponse && bidResponse.hasOwnProperty("foundbypm")) {
	      var stash = bidStash[bidResponse.cbid]; // retrieve our stashed data, by using the cbid
	      var bid;
	
	      if (stash) {
	        var bidObj = stash.bidObj;
	        var timelapsed = new Date().getTime();
	        timelapsed = timelapsed - stash.start;
	
	        if (bidResponse.foundbypm && bidResponse.width && bidResponse.height && bidResponse.html && bidResponse.cpm && bidResponse.currency) {
	
	          /* we have a valid ad to display */
	          bid = bidfactory.createBid(CONSTANTS.STATUS.GOOD);
	          bid.bidderCode = bidObj.bidder;
	          bid.width = bidResponse.width;
	          bid.height = bidResponse.height;
	          bid.ad = bidResponse.html;
	          bid.cpm = bidResponse.cpm;
	          bid.currency = bidResponse.currency;
	
	          if (bidResponse.dealId) {
	            bid.dealId = bidResponse.dealId;
	          } else {
	            bid.dealId = null;
	          }
	
	          bidmanager.addBidResponse(bidObj.placementCode, bid);
	
	          utils.logMessage('[Piximedia] Registered bidresponse from URL ' + stash.url + ' (time: ' + String(timelapsed) + ')');
	          utils.logMessage('[Piximedia] ======> BID placementCode: ' + bidObj.placementCode + ' CPM: ' + String(bid.cpm) + ' ' + bid.currency + ' Format: ' + String(bid.width) + 'x' + String(bid.height));
	        } else {
	
	          /* we have no ads to display */
	          bid = bidfactory.createBid(CONSTANTS.STATUS.NO_BID);
	          bid.bidderCode = bidObj.bidder;
	          bidmanager.addBidResponse(bidObj.placementCode, bid);
	
	          utils.logMessage('[Piximedia] Registered BLANK bidresponse from URL ' + stash.url + ' (time: ' + String(timelapsed) + ')');
	          utils.logMessage('[Piximedia] ======> NOBID placementCode: ' + bidObj.placementCode);
	        }
	
	        // We should no longer need this stashed object, so drop reference:
	        bidStash[bidResponse.cbid] = null;
	      } else {
	        utils.logMessage("[Piximedia] Couldn't find stash for cbid=" + bidResponse.cbid);
	      }
	    }
	  };
	
	  // return an object with PiximediaAdapter methods
	  return {
	    callBids: baseAdapter.callBids,
	    setBidderCode: baseAdapter.setBidderCode,
	    getBidderCode: baseAdapter.getBidderCode
	  };
	};
	
	module.exports = PiximediaAdapter;

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(2);
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	
	/**
	 * Adapter for requesting bids from Pubmatic.
	 *
	 * @returns {{callBids: _callBids}}
	 * @constructor
	 */
	var PubmaticAdapter = function PubmaticAdapter() {
	
	  var bids;
	  var _pm_pub_id;
	  var _pm_optimize_adslots = [];
	  var iframe = void 0;
	
	  function _callBids(params) {
	    bids = params.bids;
	    _pm_optimize_adslots = [];
	    for (var i = 0; i < bids.length; i++) {
	      var bid = bids[i];
	      //bidmanager.pbCallbackMap['' + bid.params.adSlot] = bid;
	      _pm_pub_id = _pm_pub_id || bid.params.publisherId;
	      _pm_optimize_adslots.push(bid.params.adSlot);
	    }
	
	    // Load pubmatic script in an iframe, because they call document.write
	    _getBids();
	  }
	
	  function _getBids() {
	
	    //create the iframe
	    iframe = utils.createInvisibleIframe();
	
	    var elToAppend = document.getElementsByTagName('head')[0];
	
	    //insert the iframe into document
	    elToAppend.insertBefore(iframe, elToAppend.firstChild);
	
	    var iframeDoc = utils.getIframeDocument(iframe);
	    iframeDoc.write(_createRequestContent());
	    iframeDoc.close();
	  }
	
	  function _createRequestContent() {
	    var content = '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"' + ' "http://www.w3.org/TR/html4/loose.dtd"><html><head><base target="_top" /><scr' + 'ipt>inDapIF=true;</scr' + 'ipt></head>';
	    content += '<body>';
	    content += '<scr' + 'ipt>';
	    content += '' + 'window.pm_pub_id  = "%%PM_PUB_ID%%";' + 'window.pm_optimize_adslots     = [%%PM_OPTIMIZE_ADSLOTS%%];' + 'window.pm_async_callback_fn = "window.parent.pbjs.handlePubmaticCallback";';
	    content += '</scr' + 'ipt>';
	
	    var map = {};
	    map.PM_PUB_ID = _pm_pub_id;
	    map.PM_OPTIMIZE_ADSLOTS = _pm_optimize_adslots.map(function (adSlot) {
	      return "'" + adSlot + "'";
	    }).join(',');
	
	    content += '<scr' + 'ipt src="https://ads.pubmatic.com/AdServer/js/gshowad.js"></scr' + 'ipt>';
	    content += '<scr' + 'ipt>';
	    content += '</scr' + 'ipt>';
	    content += '</body></html>';
	    content = utils.replaceTokenInString(content, map, '%%');
	
	    return content;
	  }
	
	  pbjs.handlePubmaticCallback = function () {
	    var bidDetailsMap = {};
	    var progKeyValueMap = {};
	    try {
	      bidDetailsMap = iframe.contentWindow.bidDetailsMap;
	      progKeyValueMap = iframe.contentWindow.progKeyValueMap;
	    } catch (e) {
	      utils.logError(e, 'Error parsing Pubmatic response');
	    }
	
	    var i;
	    var adUnit;
	    var adUnitInfo;
	    var bid;
	    var bidResponseMap = bidDetailsMap || {};
	    var bidInfoMap = progKeyValueMap || {};
	    var dimensions;
	
	    for (i = 0; i < bids.length; i++) {
	      var adResponse;
	      bid = bids[i].params;
	
	      adUnit = bidResponseMap[bid.adSlot] || {};
	
	      // adUnitInfo example: bidstatus=0;bid=0.0000;bidid=39620189@320x50;wdeal=
	
	      // if using DFP GPT, the params string comes in the format:
	      // "bidstatus;1;bid;5.0000;bidid;hb_test@468x60;wdeal;"
	      // the code below detects and handles this.
	      if (bidInfoMap[bid.adSlot] && bidInfoMap[bid.adSlot].indexOf('=') === -1) {
	        bidInfoMap[bid.adSlot] = bidInfoMap[bid.adSlot].replace(/([a-z]+);(.[^;]*)/ig, '$1=$2');
	      }
	
	      adUnitInfo = (bidInfoMap[bid.adSlot] || '').split(';').reduce(function (result, pair) {
	        var parts = pair.split('=');
	        result[parts[0]] = parts[1];
	        return result;
	      }, {});
	
	      if (adUnitInfo.bidstatus === '1') {
	        dimensions = adUnitInfo.bidid.split('@')[1].split('x');
	        adResponse = bidfactory.createBid(1);
	        adResponse.bidderCode = 'pubmatic';
	        adResponse.adSlot = bid.adSlot;
	        adResponse.cpm = Number(adUnitInfo.bid);
	        adResponse.ad = unescape(adUnit.creative_tag); // jshint ignore:line
	        adResponse.ad += utils.createTrackPixelIframeHtml(decodeURIComponent(adUnit.tracking_url));
	        adResponse.width = dimensions[0];
	        adResponse.height = dimensions[1];
	        adResponse.dealId = adUnitInfo.wdeal;
	
	        bidmanager.addBidResponse(bids[i].placementCode, adResponse);
	      } else {
	        // Indicate an ad was not returned
	        adResponse = bidfactory.createBid(2);
	        adResponse.bidderCode = 'pubmatic';
	        bidmanager.addBidResponse(bids[i].placementCode, adResponse);
	      }
	    }
	  };
	
	  return {
	    callBids: _callBids
	  };
	};
	
	module.exports = PubmaticAdapter;

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var consts = __webpack_require__(3);
	var utils = __webpack_require__(2);
	var d = document;
	var SCRIPT = 'script';
	var PARAMS = 'params';
	var SIZES = 'sizes';
	var SIZE = 'size';
	var CPM = 'cpm';
	var AD = 'ad';
	var WIDTH = 'width';
	var HEIGHT = 'height';
	var PUB_ZONE = 'pub_zone';
	var GROSS_PRICE = 'gross_price';
	var RESOURCE = 'resource';
	var DETAIL = 'detail';
	var BIDDER_CODE_RESPONSE_KEY = 'bidderCode';
	var BIDDER_CODE = 'pubgears';
	var SCRIPT_ID = 'pg-header-tag';
	var ATTRIBUTE_PREFIX = 'data-bsm-';
	var SLOT_LIST_ATTRIBUTE = 'slot-list';
	var PUBLISHER_ATTRIBUTE = 'pub';
	var FLAG_ATTRIBUTE = 'flag';
	var PLACEMENT_CODE = 'placementCode';
	var BID_ID = 'bidId';
	var PUBLISHER_PARAM = 'publisherName';
	var PUB_ZONE_PARAM = 'pubZone';
	var BID_RECEIVED_EVENT_NAME = 'onBidResponse';
	var SLOT_READY_EVENT_NAME = 'onResourceComplete';
	var CREATIVE_TEMPLATE = decodeURIComponent("%3Cscript%3E%0A(function(define)%7B%0Adefine(function(a)%7B%0A%09var%20id%3D%20%22pg-ad-%22%20%2B%20Math.floor(Math.random()%20*%201e10)%2C%20d%3D%20document%0A%09d.write(\'%3Cdiv%20id%3D%22\'%2Bid%2B\'%22%3E%3C%2Fdiv%3E\')%0A%09a.push(%7B%0A%09%09pub%3A%20\'%25%25PUBLISHER_NAME%25%25\'%2C%0A%09%09pub_zone%3A%20\'%25%25PUB_ZONE%25%25\'%2C%0A%09%09sizes%3A%20%5B\'%25%25SIZE%25%25\'%5D%2C%0A%09%09flag%3A%20true%2C%0A%09%09container%3A%20d.getElementById(id)%2C%0A%09%7D)%3B%0A%7D)%7D)(function(f)%7Bvar%20key%3D\'uber_imps\'%2Ca%3Dthis%5Bkey%5D%3Dthis%5Bkey%5D%7C%7C%5B%5D%3Bf(a)%3B%7D)%3B%0A%3C%2Fscript%3E%0A%3Cscript%20src%3D%22%2F%2Fc.pubgears.com%2Ftags%2Fb%22%3E%3C%2Fscript%3E%0A");
	var TAG_URL = '//c.pubgears.com/tags/h';
	var publisher = '';
	
	module.exports = PubGearsAdapter;
	
	function PubGearsAdapter() {
	  var proxy = null;
	  var pendingSlots = {};
	  var initialized = false;
	
	  this.callBids = callBids;
	
	  function callBids(params) {
	    var bids = params[consts.JSON_MAPPING.PL_BIDS];
	    var slots = bids.map(getSlotFromBidParam);
	    if (slots.length <= 0) return;
	    publisher = bids[0][PARAMS][PUBLISHER_PARAM];
	
	    bids.forEach(function (bid) {
	
	      var name = getSlotFromBidParam(bid);
	      pendingSlots[name] = bid;
	    });
	
	    proxy = proxy || getScript(SCRIPT_ID) || makeScript(slots, publisher, SCRIPT_ID, TAG_URL);
	    if (!initialized) registerEventListeners(proxy);
	    initialized = true;
	  }
	  function loadScript(script) {
	    var anchor = function (scripts) {
	      return scripts[scripts.length - 1];
	    }(d.getElementsByTagName(SCRIPT));
	
	    return anchor.parentNode.insertBefore(script, anchor);
	  }
	  function getSlotFromBidParam(bid) {
	    var size = getSize(bid);
	    var params = bid[PARAMS];
	    var slotName = params[PUB_ZONE_PARAM];
	    return [slotName, size].join('@');
	  }
	  function getSlotFromResource(resource) {
	    var size = resource[SIZE];
	    var key = [resource[PUB_ZONE], size].join('@');
	    return key;
	  }
	  function getSize(bid) {
	    var sizes = bid[SIZES];
	    var size = Array.isArray(sizes[0]) ? sizes[0] : sizes;
	    return size.join('x');
	  }
	  function makeScript(slots, publisher, id, url) {
	    var script = d.createElement(SCRIPT);
	    script.src = url;
	    script.id = id;
	    script.setAttribute(ATTRIBUTE_PREFIX + SLOT_LIST_ATTRIBUTE, slots.join(' '));
	    script.setAttribute(ATTRIBUTE_PREFIX + FLAG_ATTRIBUTE, 'true');
	    script.setAttribute(ATTRIBUTE_PREFIX + PUBLISHER_ATTRIBUTE, publisher);
	
	    return loadScript(script);
	  }
	  function getScript(id) {
	    return d.getElementById(id);
	  }
	  function registerEventListeners(script) {
	    script.addEventListener(BID_RECEIVED_EVENT_NAME, onBid, true);
	    script.addEventListener(SLOT_READY_EVENT_NAME, onComplete, true);
	  }
	  function onBid(event) {
	    var data = event[DETAIL];
	    var slotKey = getSlotFromResource(data[RESOURCE]);
	    var bidRequest = pendingSlots[slotKey];
	    var adUnitCode = bidRequest[PLACEMENT_CODE];
	    var bid = null;
	
	    if (bidRequest) {
	      bid = buildResponse(data, bidRequest);
	      bidmanager.addBidResponse(adUnitCode, bid);
	      utils.logMessage('adding bid respoonse to "' + adUnitCode + '" for bid request "' + bidRequest[BID_ID] + '"');
	    } else {
	      utils.logError('Cannot get placement id for slot "' + slotKey + '"');
	    }
	  }
	  function buildResponse(eventData, bidRequest) {
	    var resource = eventData[RESOURCE];
	    var dims = resource[SIZE].split('x');
	    var price = Number(eventData[GROSS_PRICE]);
	    var status = isNaN(price) || price <= 0 ? 2 : 1;
	
	    var response = bidfactory.createBid(status, bidRequest);
	    response[BIDDER_CODE_RESPONSE_KEY] = BIDDER_CODE;
	
	    if (status !== 1) return response;
	
	    response[AD] = getCreative(resource);
	
	    response[CPM] = price / 1e3;
	    response[WIDTH] = dims[0];
	    response[HEIGHT] = dims[1];
	    return response;
	  }
	  function getCreative(resource) {
	    var token = '%%';
	    var creative = CREATIVE_TEMPLATE;
	    var replacementValues = {
	      publisher_name: publisher,
	      pub_zone: resource[PUB_ZONE],
	      size: resource[SIZE]
	    };
	    return utils.replaceTokenInString(creative, replacementValues, token);
	  }
	  function onComplete(event) {
	    var data = event[DETAIL];
	    var slotKey = getSlotFromResource(data[RESOURCE]);
	    delete pendingSlots[slotKey];
	  }
	}

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var adloader = __webpack_require__(13);
	var utils = __webpack_require__(2);
	
	var PulsePointAdapter = function PulsePointAdapter() {
	
	  var getJsStaticUrl = window.location.protocol + '//tag-st.contextweb.com/getjs.static.js';
	  var bidUrl = window.location.protocol + '//bid.contextweb.com/header/tag';
	
	  function _callBids(params) {
	    if (typeof window.pp === 'undefined') {
	      adloader.loadScript(getJsStaticUrl, function () {
	        bid(params);
	      }, true);
	    } else {
	      bid(params);
	    }
	  }
	
	  function bid(params) {
	    var bids = params.bids;
	    for (var i = 0; i < bids.length; i++) {
	      var bidRequest = bids[i];
	      requestBid(bidRequest);
	    }
	  }
	
	  function requestBid(bidRequest) {
	    try {
	      var ppBidRequest = new window.pp.Ad(bidRequestOptions(bidRequest));
	      ppBidRequest.display();
	    } catch (e) {
	      //register passback on any exceptions while attempting to fetch response.
	      utils.logError('pulsepoint.requestBid', 'ERROR', e);
	      bidResponseAvailable(bidRequest);
	    }
	  }
	
	  function bidRequestOptions(bidRequest) {
	    var callback = bidResponseCallback(bidRequest);
	    var options = {
	      cn: 1,
	      ca: window.pp.requestActions.BID,
	      cu: bidUrl,
	      adUnitId: bidRequest.placementCode,
	      callback: callback
	    };
	    for (var param in bidRequest.params) {
	      if (bidRequest.params.hasOwnProperty(param)) {
	        options[param] = bidRequest.params[param];
	      }
	    }
	    return options;
	  }
	
	  function bidResponseCallback(bid) {
	    return function (bidResponse) {
	      bidResponseAvailable(bid, bidResponse);
	    };
	  }
	
	  function bidResponseAvailable(bidRequest, bidResponse) {
	    if (bidResponse) {
	      var adSize = bidRequest.params.cf.toUpperCase().split('X');
	      var bid = bidfactory.createBid(1, bidRequest);
	      bid.bidderCode = bidRequest.bidder;
	      bid.cpm = bidResponse.bidCpm;
	      bid.ad = bidResponse.html;
	      bid.width = adSize[0];
	      bid.height = adSize[1];
	      bidmanager.addBidResponse(bidRequest.placementCode, bid);
	    } else {
	      var passback = bidfactory.createBid(2, bidRequest);
	      passback.bidderCode = bidRequest.bidder;
	      bidmanager.addBidResponse(bidRequest.placementCode, passback);
	    }
	  }
	
	  return {
	    callBids: _callBids
	  };
	};
	
	module.exports = PulsePointAdapter;

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _bidfactory = __webpack_require__(10);
	
	var _bidmanager = __webpack_require__(11);
	
	var _utils = __webpack_require__(2);
	
	var _ajax = __webpack_require__(21);
	
	var _constants = __webpack_require__(3);
	
	function PulsePointLiteAdapter() {
	
	  var bidUrl = window.location.protocol + '//bid.contextweb.com/header/tag?';
	  var ajaxOptions = {
	    method: 'GET',
	    withCredentials: true,
	    contentType: 'text/plain'
	  };
	
	  function _callBids(bidderRequest) {
	    bidderRequest.bids.forEach(function (bidRequest) {
	      try {
	        var params = _extends({}, environment(), bidRequest.params);
	        var url = bidUrl + Object.keys(params).map(function (k) {
	          return k + '=' + encodeURIComponent(params[k]);
	        }).join('&');
	        (0, _ajax.ajax)(url, function (bidResponse) {
	          bidResponseAvailable(bidRequest, bidResponse);
	        }, null, ajaxOptions);
	      } catch (e) {
	        //register passback on any exceptions while attempting to fetch response.
	        (0, _utils.logError)('pulsepoint.requestBid', 'ERROR', e);
	        bidResponseAvailable(bidRequest);
	      }
	    });
	  }
	
	  function environment() {
	    return {
	      cn: 1,
	      ca: 'BID',
	      tl: 1,
	      'if': 0,
	      cwu: (0, _utils.getTopWindowLocation)().href,
	      cwr: referrer(),
	      dw: document.documentElement.clientWidth,
	      cxy: document.documentElement.clientWidth + ',' + document.documentElement.clientHeight,
	      tz: new Date().getTimezoneOffset(),
	      ln: navigator.language || navigator.browserLanguage || navigator.userLanguage || navigator.systemLanguage
	    };
	  }
	
	  function referrer() {
	    try {
	      return window.top.document.referrer;
	    } catch (e) {
	      return document.referrer;
	    }
	  }
	
	  function bidResponseAvailable(bidRequest, rawResponse) {
	    if (rawResponse) {
	      var bidResponse = parse(rawResponse);
	      if (bidResponse) {
	        var adSize = bidRequest.params.cf.toUpperCase().split('X');
	        var bid = (0, _bidfactory.createBid)(_constants.STATUS.GOOD, bidRequest);
	        bid.bidderCode = bidRequest.bidder;
	        bid.cpm = bidResponse.bidCpm;
	        bid.ad = bidResponse.html;
	        bid.width = adSize[0];
	        bid.height = adSize[1];
	        (0, _bidmanager.addBidResponse)(bidRequest.placementCode, bid);
	        return;
	      }
	    }
	    var passback = (0, _bidfactory.createBid)(_constants.STATUS.NO_BID, bidRequest);
	    passback.bidderCode = bidRequest.bidder;
	    (0, _bidmanager.addBidResponse)(bidRequest.placementCode, passback);
	  }
	
	  function parse(rawResponse) {
	    try {
	      return JSON.parse(rawResponse);
	    } catch (ex) {
	      (0, _utils.logError)('pulsepoint.safeParse', 'ERROR', ex);
	      return null;
	    }
	  }
	
	  return {
	    callBids: _callBids
	  };
	}
	
	module.exports = PulsePointLiteAdapter;

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(2);
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var ajax = __webpack_require__(21);
	var CONSTANTS = __webpack_require__(3);
	var QUANTCAST_CALLBACK_URL = 'http://global.qc.rtb.quantserve.com:8080/qchb';
	
	var QuantcastAdapter = function QuantcastAdapter() {
	
	  var BIDDER_CODE = 'quantcast';
	
	  var DEFAULT_BID_FLOOR = 0.0000000001;
	  var bidRequests = {};
	
	  var returnEmptyBid = function returnEmptyBid(bidId) {
	    var bidRequested = utils.getBidRequest(bidId);
	    if (!utils.isEmpty(bidRequested)) {
	      var bid = bidfactory.createBid(CONSTANTS.STATUS.NO_BID, bidRequested);
	      bid.bidderCode = BIDDER_CODE;
	      bidmanager.addBidResponse(bidRequested.placementCode, bid);
	    }
	    return;
	  };
	
	  //expose the callback to the global object:
	  pbjs.handleQuantcastCB = function (responseText) {
	    if (utils.isEmpty(responseText)) {
	      return;
	    }
	    var response = null;
	    try {
	      response = JSON.parse(responseText);
	    } catch (e) {
	      // Malformed JSON
	      utils.logError("Malformed JSON received from server - can't do anything here");
	      return;
	    }
	
	    if (response === null || !response.hasOwnProperty('bids') || utils.isEmpty(response.bids)) {
	      utils.logError("Sub-optimal JSON received from server - can't do anything here");
	      return;
	    }
	
	    for (var i = 0; i < response.bids.length; i++) {
	      var seatbid = response.bids[i];
	      var key = seatbid.placementCode;
	      var request = bidRequests[key];
	      if (request === null || request === undefined) {
	        return returnEmptyBid(seatbid.placementCode);
	      }
	      // This line is required since this is the field
	      // that bidfactory.createBid looks for
	      request.bidId = request.imp[0].placementCode;
	      var responseBid = bidfactory.createBid(CONSTANTS.STATUS.GOOD, request);
	
	      responseBid.cpm = seatbid.cpm;
	      responseBid.ad = seatbid.ad;
	      responseBid.height = seatbid.height;
	      responseBid.width = seatbid.width;
	      responseBid.bidderCode = response.bidderCode;
	      responseBid.requestId = request.requestId;
	      responseBid.bidderCode = BIDDER_CODE;
	
	      bidmanager.addBidResponse(request.bidId, responseBid);
	    }
	  };
	
	  function callBids(params) {
	    var bids = params.bids || [];
	    if (bids.length === 0) {
	      return;
	    }
	
	    var referrer = utils.getTopWindowUrl();
	    var loc = utils.getTopWindowLocation();
	    var domain = loc.hostname;
	    var publisherId = 0;
	
	    publisherId = '' + bids[0].params.publisherId;
	    utils._each(bids, function (bid) {
	      var key = bid.placementCode;
	      var bidSizes = [];
	      utils._each(bid.sizes, function (size) {
	        bidSizes.push({
	          'width': size[0],
	          'height': size[1]
	        });
	      });
	
	      bidRequests[key] = bidRequests[key] || {
	        'publisherId': publisherId,
	        'requestId': bid.bidId,
	        'bidId': bid.bidId,
	        'site': {
	          'page': loc.href,
	          'referrer': referrer,
	          'domain': domain
	        },
	        'imp': [{
	
	          'banner': {
	            'battr': bid.params.battr,
	            'sizes': bidSizes
	          },
	          'placementCode': bid.placementCode,
	          'bidFloor': bid.params.bidFloor || DEFAULT_BID_FLOOR
	        }]
	      };
	
	      utils._each(bidRequests, function (bidRequest) {
	        ajax.ajax(QUANTCAST_CALLBACK_URL, pbjs.handleQuantcastCB, JSON.stringify(bidRequest), {
	          method: 'POST',
	          withCredentials: true
	        });
	      });
	    });
	  }
	
	  // Export the `callBids` function, so that Prebid.js can execute
	  // this function when the page asks to send out bid requests.
	  return {
	    callBids: callBids,
	    QUANTCAST_CALLBACK_URL: QUANTCAST_CALLBACK_URL
	  };
	};
	
	exports.createNew = function () {
	  return new QuantcastAdapter();
	};
	
	module.exports = QuantcastAdapter;

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var _ajax = __webpack_require__(21);
	
	var bidmanager = __webpack_require__(11),
	    bidfactory = __webpack_require__(10),
	    CONSTANTS = __webpack_require__(3);
	
	module.exports = function (bidManager, global, loader) {
	
	  var version = "0.9.0.0",
	      defaultZone = "1r",
	      defaultPath = "mvo",
	      debug = false,
	      requestCompleted = false,
	      placementCodes = {},
	      loadStart,
	      configuredPlacements = [],
	      fat = /(^v|(\.0)+$)/gi;
	
	  if (typeof global === "undefined") global = window;
	
	  if (typeof bidManager === "undefined") bidManager = bidmanager;
	
	  if (typeof loader === "undefined") loader = _ajax.ajax;
	
	  function applyMacros(txt, values) {
	    return txt.replace(/\{([^\}]+)\}/g, function (match) {
	      var v = values[match.replace(/[\{\}]/g, "").toLowerCase()];
	      if (typeof v !== "undefined") return v;
	      return match;
	    });
	  }
	
	  function load(bidParams, url, callback) {
	    loader(url, function (responseText, response) {
	      if (response.status === 200) callback(200, "success", response.responseText);else callback(-1, "http error " + response.status, response.responseText);
	    }, false, { method: "GET", withCredentials: true });
	  }
	
	  function flashInstalled() {
	    var n = global.navigator,
	        p = n.plugins,
	        m = n.mimeTypes,
	        t = "application/x-shockwave-flash",
	        x = global.ActiveXObject;
	
	    if (p && p["Shockwave Flash"] && m && m[t] && m[t].enabledPlugin) return true;
	
	    if (x) {
	      try {
	        if (new global.ActiveXObject("ShockwaveFlash.ShockwaveFlash")) return true;
	      } catch (e) {}
	    }
	
	    return false;
	  }
	
	  var bidderCode = "rhythmone";
	
	  function attempt(valueFunction, defaultValue) {
	    try {
	      return valueFunction();
	    } catch (ex) {}
	    return defaultValue;
	  }
	
	  function logToConsole(txt) {
	    if (debug) console.log(txt);
	  }
	
	  function getBidParameters(bids) {
	    for (var i = 0; i < bids.length; i++) {
	      if (_typeof(bids[i].params) === "object" && bids[i].params.placementId) return bids[i].params;
	    }return null;
	  }
	
	  function noBids(params) {
	    for (var i = 0; i < params.bids.length; i++) {
	      if (params.bids[i].success !== 1) {
	        logToConsole("registering nobid for slot " + params.bids[i].placementCode);
	        var bid = bidfactory.createBid(CONSTANTS.STATUS.NO_BID);
	        bid.bidderCode = bidderCode;
	        bidmanager.addBidResponse(params.bids[i].placementCode, bid);
	      }
	    }
	  }
	
	  function getRMPURL(bidParams, bids) {
	    var endpoint = "//tag.1rx.io/rmp/{placementId}/0/{path}?z={zone}",
	        query = [];
	
	    if (typeof bidParams.endpoint === "string") endpoint = bidParams.endpoint;
	
	    if (typeof bidParams.zone === "string") defaultZone = bidParams.zone;
	
	    if (typeof bidParams.path === "string") defaultPath = bidParams.path;
	
	    if (bidParams.debug === true) debug = true;
	
	    if (bidParams.trace === true) query.push("trace=true");
	
	    endpoint = applyMacros(endpoint, {
	      placementid: bidParams.placementId,
	      zone: defaultZone,
	      path: defaultPath
	    });
	
	    function p(k, v) {
	      if (v instanceof Array) v = v.join(",");
	      if (typeof v !== "undefined") query.push(encodeURIComponent(k) + "=" + encodeURIComponent(v));
	    }
	
	    p("domain", attempt(function () {
	      var d = global.document.location.ancestorOrigins;
	      if (d && d.length > 0) return d[d.length - 1];
	      return global.top.document.location.hostname; // try/catch is in the attempt function
	    }, ""));
	    p("title", attempt(function () {
	      return global.top.document.title;
	    }, "")); // try/catch is in the attempt function
	    p("url", attempt(function () {
	      var l;
	      try {
	        l = global.top.document.location.href.toString();
	      } // try/catch is in the attempt function
	      catch (ex) {
	        l = global.document.location.href.toString();
	      }
	      return l;
	    }, ""));
	    p("dsh", global.screen ? global.screen.height : "");
	    p("dsw", global.screen ? global.screen.width : "");
	    p("tz", new Date().getTimezoneOffset());
	    p("dtype", /(ios|ipod|ipad|iphone|android)/i.test(global.navigator.userAgent) ? 1 : /(smart[-]?tv|hbbtv|appletv|googletv|hdmi|netcast\.tv|viera|nettv|roku|\bdtv\b|sonydtv|inettvbrowser|\btv\b)/i.test(global.navigator.userAgent) ? 3 : 2);
	    p("flash", flashInstalled() ? 1 : 0);
	
	    var heights = [],
	        widths = [],
	        floors = [],
	        mediaTypes = [],
	        i = 0;
	
	    configuredPlacements = [];
	
	    p("hbv", global.pbjs.version.replace(fat, "") + "," + version.replace(fat, ""));
	
	    for (; i < bids.length; i++) {
	
	      var th = [],
	          tw = [];
	
	      if (bids[i].sizes.length > 0 && typeof bids[i].sizes[0] === "number") bids[i].sizes = [bids[i].sizes];
	
	      for (var j = 0; j < bids[i].sizes.length; j++) {
	        tw.push(bids[i].sizes[j][0]);
	        th.push(bids[i].sizes[j][1]);
	      }
	      configuredPlacements.push(bids[i].placementCode);
	      heights.push(th.join("|"));
	      widths.push(tw.join("|"));
	      mediaTypes.push(/video/i.test(bids[i].mediaType) ? "v" : "d");
	      floors.push(0);
	    }
	
	    p("imp", configuredPlacements);
	    p("w", widths);
	    p("h", heights);
	    p("floor", floors);
	    p("t", mediaTypes);
	
	    endpoint += "&" + query.join("&");
	
	    return endpoint;
	  }
	
	  function sendAuditBeacon(placementId) {
	    var data = {
	      doc_version: 1,
	      doc_type: "Prebid Audit",
	      placement_id: placementId
	    },
	        ao = document.location.ancestorOrigins,
	        q = [],
	        u = "//hbevents.1rx.io/audit?",
	        i = new Image();
	
	    if (ao && ao.length > 0) {
	      data.ancestor_origins = ao[ao.length - 1];
	    }
	
	    data.popped = window.opener !== null ? 1 : 0;
	    data.framed = window.top === window ? 0 : 1;
	
	    try {
	      data.url = window.top.document.location.href.toString();
	    } catch (ex) {
	      data.url = window.document.location.href.toString();
	    }
	
	    var prebid_instance = global.pbjs;
	
	    data.prebid_version = prebid_instance.version.replace(fat, "");
	    data.response_ms = new Date().getTime() - loadStart;
	    data.placement_codes = configuredPlacements.join(",");
	    data.bidder_version = version;
	    data.prebid_timeout = prebid_instance.cbTimeout || prebid_instance.bidderTimeout;
	
	    for (var k in data) {
	      q.push(encodeURIComponent(k) + "=" + encodeURIComponent(_typeof(data[k]) === "object" ? JSON.stringify(data[k]) : data[k]));
	    }
	
	    q.sort();
	    i.src = u + q.join("&");
	  }
	
	  this.callBids = function (params) {
	
	    var slotMap = {},
	        bidParams = getBidParameters(params.bids);
	
	    debug = bidParams !== null && bidParams.debug === true;
	
	    if (bidParams === null) {
	      noBids(params);
	      return;
	    }
	
	    for (var i = 0; i < params.bids.length; i++) {
	      slotMap[params.bids[i].placementCode] = params.bids[i];
	    }loadStart = new Date().getTime();
	    load(bidParams, getRMPURL(bidParams, params.bids), function (code, msg, txt) {
	
	      // send quality control beacon here
	      sendAuditBeacon(bidParams.placementId);
	
	      requestCompleted = true;
	
	      logToConsole("response text: " + txt);
	
	      if (code !== -1) {
	        try {
	          var result = JSON.parse(txt),
	              registerBid = function registerBid(bid) {
	
	            slotMap[bid.impid].success = 1;
	
	            var pbResponse = bidfactory.createBid(CONSTANTS.STATUS.GOOD),
	                placementCode = slotMap[bid.impid].placementCode;
	
	            placementCodes[placementCode] = false;
	
	            pbResponse.bidderCode = bidderCode;
	            pbResponse.cpm = parseFloat(bid.price);
	            pbResponse.width = bid.w;
	            pbResponse.height = bid.h;
	
	            if (/video/i.test(slotMap[bid.impid].mediaType)) {
	              pbResponse.mediaType = "video";
	              pbResponse.vastUrl = bid.nurl;
	              pbResponse.descriptionUrl = bid.nurl;
	            } else pbResponse.ad = bid.adm;
	
	            logToConsole("registering bid " + placementCode + " " + JSON.stringify(pbResponse));
	
	            bidManager.addBidResponse(placementCode, pbResponse);
	          };
	
	          for (i = 0; result.seatbid && i < result.seatbid.length; i++) {
	            for (var j = 0; result.seatbid[i].bid && j < result.seatbid[i].bid.length; j++) {
	              registerBid(result.seatbid[i].bid[j]);
	            }
	          }
	        } catch (ex) {}
	      }
	
	      // if no bids are successful, inform prebid
	      noBids(params);
	    });
	
	    logToConsole("version: " + version);
	  };
	};

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var _adapter = __webpack_require__(14);
	
	var Adapter = _interopRequireWildcard(_adapter);
	
	var _bidfactory = __webpack_require__(10);
	
	var _bidfactory2 = _interopRequireDefault(_bidfactory);
	
	var _bidmanager = __webpack_require__(11);
	
	var _bidmanager2 = _interopRequireDefault(_bidmanager);
	
	var _utils = __webpack_require__(2);
	
	var utils = _interopRequireWildcard(_utils);
	
	var _ajax = __webpack_require__(21);
	
	var _constants = __webpack_require__(3);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }
	
	var RUBICON_BIDDER_CODE = 'rubicon';
	
	// use deferred function call since version isn't defined yet at this point
	function getIntegration() {
	  return 'pbjs_lite_' + pbjs.version;
	}
	
	function isSecure() {
	  return location.protocol === 'https:';
	}
	
	// use protocol relative urls for http or https
	var FASTLANE_ENDPOINT = '//fastlane.rubiconproject.com/a/api/fastlane.json';
	var VIDEO_ENDPOINT = '//fastlane-adv.rubiconproject.com/v1/auction/video';
	
	var TIMEOUT_BUFFER = 500;
	
	var sizeMap = {
	  1: '468x60',
	  2: '728x90',
	  8: '120x600',
	  9: '160x600',
	  10: '300x600',
	  15: '300x250',
	  16: '336x280',
	  19: '300x100',
	  31: '980x120',
	  32: '250x360',
	  33: '180x500',
	  35: '980x150',
	  37: '468x400',
	  38: '930x180',
	  43: '320x50',
	  44: '300x50',
	  48: '300x300',
	  54: '300x1050',
	  55: '970x90',
	  57: '970x250',
	  58: '1000x90',
	  59: '320x80',
	  61: '1000x1000',
	  65: '640x480',
	  67: '320x480',
	  68: '1800x1000',
	  72: '320x320',
	  73: '320x160',
	  78: '980x240',
	  79: '980x300',
	  80: '980x400',
	  83: '480x300',
	  94: '970x310',
	  96: '970x210',
	  101: '480x320',
	  102: '768x1024',
	  103: '480x280',
	  113: '1000x300',
	  117: '320x100',
	  125: '800x250',
	  126: '200x600'
	};
	utils._each(sizeMap, function (item, key) {
	  return sizeMap[item] = key;
	});
	
	function RubiconAdapter() {
	
	  function _callBids(bidderRequest) {
	    var bids = bidderRequest.bids || [];
	
	    bids.forEach(function (bid) {
	      try {
	        // Video endpoint only accepts POST calls
	        if (bid.mediaType === 'video') {
	          (0, _ajax.ajax)(VIDEO_ENDPOINT, {
	            success: bidCallback,
	            error: bidError
	          }, buildVideoRequestPayload(bid, bidderRequest), {
	            withCredentials: true
	          });
	        } else {
	          (0, _ajax.ajax)(buildOptimizedCall(bid), {
	            success: bidCallback,
	            error: bidError
	          }, undefined, {
	            withCredentials: true
	          });
	        }
	      } catch (err) {
	        utils.logError('Error sending rubicon request for placement code ' + bid.placementCode, null, err);
	        addErrorBid();
	      }
	
	      function bidCallback(responseText) {
	        try {
	          utils.logMessage('XHR callback function called for ad ID: ' + bid.bidId);
	          handleRpCB(responseText, bid);
	        } catch (err) {
	          if (typeof err === 'string') {
	            utils.logWarn(err + ' when processing rubicon response for placement code ' + bid.placementCode);
	          } else {
	            utils.logError('Error processing rubicon response for placement code ' + bid.placementCode, null, err);
	          }
	          addErrorBid();
	        }
	      }
	
	      function bidError(err, xhr) {
	        utils.logError('Request for rubicon responded with:', xhr.status, err);
	        addErrorBid();
	      }
	
	      function addErrorBid() {
	        var badBid = _bidfactory2['default'].createBid(_constants.STATUS.NO_BID, bid);
	        badBid.bidderCode = bid.bidder;
	        _bidmanager2['default'].addBidResponse(bid.placementCode, badBid);
	      }
	    });
	  }
	
	  function _getScreenResolution() {
	    return [window.screen.width, window.screen.height].join('x');
	  }
	
	  function buildVideoRequestPayload(bid, bidderRequest) {
	    bid.startTime = new Date().getTime();
	
	    var params = bid.params;
	
	    if (!params || _typeof(params.video) !== 'object') {
	      throw 'Invalid Video Bid';
	    }
	
	    var size = void 0;
	    if (params.video.playerWidth && params.video.playerHeight) {
	      size = [params.video.playerWidth, params.video.playerHeight];
	    } else if (Array.isArray(bid.sizes) && bid.sizes.length > 0 && Array.isArray(bid.sizes[0]) && bid.sizes[0].length > 1) {
	      size = bid.sizes[0];
	    } else {
	      throw 'Invalid Video Bid - No size provided';
	    }
	
	    var postData = {
	      page_url: !params.referrer ? utils.getTopWindowUrl() : params.referrer,
	      resolution: _getScreenResolution(),
	      account_id: params.accountId,
	      integration: getIntegration(),
	      timeout: bidderRequest.timeout - (Date.now() - bidderRequest.auctionStart + TIMEOUT_BUFFER),
	      stash_creatives: true,
	      ae_pass_through_parameters: params.video.aeParams,
	      slots: []
	    };
	
	    // Define the slot object
	    var slotData = {
	      site_id: params.siteId,
	      zone_id: params.zoneId,
	      position: params.position || 'btf',
	      floor: parseFloat(params.floor) > 0.01 ? params.floor : 0.01,
	      element_id: bid.placementCode,
	      name: bid.placementCode,
	      language: params.video.language,
	      width: size[0],
	      height: size[1]
	    };
	
	    // check and add inventory, keywords, visitor and size_id data
	    if (params.video.size_id) {
	      slotData.size_id = params.video.size_id;
	    } else {
	      throw 'Invalid Video Bid - Invalid Ad Type!';
	    }
	
	    if (params.inventory && _typeof(params.inventory) === 'object') {
	      slotData.inventory = params.inventory;
	    }
	
	    if (params.keywords && Array.isArray(params.keywords)) {
	      slotData.keywords = params.keywords;
	    }
	
	    if (params.visitor && _typeof(params.visitor) === 'object') {
	      slotData.visitor = params.visitor;
	    }
	
	    postData.slots.push(slotData);
	
	    return JSON.stringify(postData);
	  }
	
	  function buildOptimizedCall(bid) {
	    bid.startTime = new Date().getTime();
	
	    var _bid$params = bid.params,
	        accountId = _bid$params.accountId,
	        siteId = _bid$params.siteId,
	        zoneId = _bid$params.zoneId,
	        position = _bid$params.position,
	        floor = _bid$params.floor,
	        keywords = _bid$params.keywords,
	        visitor = _bid$params.visitor,
	        inventory = _bid$params.inventory,
	        userId = _bid$params.userId,
	        pageUrl = _bid$params.referrer;
	
	    // defaults
	
	    floor = (floor = parseFloat(floor)) > 0.01 ? floor : 0.01;
	    position = position || 'btf';
	
	    // use rubicon sizes if provided, otherwise adUnit.sizes
	    var parsedSizes = RubiconAdapter.masSizeOrdering(Array.isArray(bid.params.sizes) ? bid.params.sizes.map(function (size) {
	      return (sizeMap[size] || '').split('x');
	    }) : bid.sizes);
	
	    if (parsedSizes.length < 1) {
	      throw 'no valid sizes';
	    }
	
	    if (!/^\d+$/.test(accountId)) {
	      throw 'invalid accountId provided';
	    }
	
	    // using array to honor ordering. if order isn't important (it shouldn't be), an object would probably be preferable
	    var queryString = ['account_id', accountId, 'site_id', siteId, 'zone_id', zoneId, 'size_id', parsedSizes[0], 'alt_size_ids', parsedSizes.slice(1).join(',') || undefined, 'p_pos', position, 'rp_floor', floor, 'rp_secure', isSecure() ? '1' : '0', 'tk_flint', getIntegration(), 'p_screen_res', _getScreenResolution(), 'kw', keywords, 'tk_user_key', userId];
	
	    if (visitor !== null && (typeof visitor === 'undefined' ? 'undefined' : _typeof(visitor)) === 'object') {
	      utils._each(visitor, function (item, key) {
	        return queryString.push('tg_v.' + key, item);
	      });
	    }
	
	    if (inventory !== null && (typeof inventory === 'undefined' ? 'undefined' : _typeof(inventory)) === 'object') {
	      utils._each(inventory, function (item, key) {
	        return queryString.push('tg_i.' + key, item);
	      });
	    }
	
	    queryString.push('rand', Math.random(), 'rf', !pageUrl ? utils.getTopWindowUrl() : pageUrl);
	
	    return queryString.reduce(function (memo, curr, index) {
	      return index % 2 === 0 && queryString[index + 1] !== undefined ? memo + curr + '=' + encodeURIComponent(queryString[index + 1]) + '&' : memo;
	    }, FASTLANE_ENDPOINT + '?').slice(0, -1); // remove trailing &
	  }
	
	  var _renderCreative = function _renderCreative(script, impId) {
	    return '<html>\n<head><script type=\'text/javascript\'>inDapIF=true;</script></head>\n<body style=\'margin : 0; padding: 0;\'>\n<!-- Rubicon Project Ad Tag -->\n<div data-rp-impression-id=\'' + impId + '\'>\n<script type=\'text/javascript\'>' + script + '</script>\n</div>\n</body>\n</html>';
	  };
	
	  function handleRpCB(responseText, bidRequest) {
	    var responseObj = JSON.parse(responseText),
	        // can throw
	    ads = responseObj.ads,
	        adResponseKey = bidRequest.placementCode;
	
	    // check overall response
	    if ((typeof responseObj === 'undefined' ? 'undefined' : _typeof(responseObj)) !== 'object' || responseObj.status !== 'ok') {
	      throw 'bad response';
	    }
	
	    // video ads array is wrapped in an object
	    if (bidRequest.mediaType === 'video' && (typeof ads === 'undefined' ? 'undefined' : _typeof(ads)) === 'object') {
	      ads = ads[adResponseKey];
	    }
	
	    // check the ad response
	    if (!Array.isArray(ads) || ads.length < 1) {
	      throw 'invalid ad response';
	    }
	
	    // if there are multiple ads, sort by CPM
	    ads = ads.sort(_adCpmSort);
	
	    ads.forEach(function (ad) {
	      if (ad.status !== 'ok') {
	        throw 'bad ad status';
	      }
	
	      //store bid response
	      //bid status is good (indicating 1)
	      var bid = _bidfactory2['default'].createBid(_constants.STATUS.GOOD, bidRequest);
	      bid.creative_id = ad.ad_id;
	      bid.bidderCode = bidRequest.bidder;
	      bid.cpm = ad.cpm || 0;
	      bid.dealId = ad.deal;
	      if (bidRequest.mediaType === 'video') {
	        bid.width = bidRequest.params.video.playerWidth;
	        bid.height = bidRequest.params.video.playerHeight;
	        bid.vastUrl = ad.creative_depot_url;
	        bid.descriptionUrl = ad.impression_id;
	        bid.impression_id = ad.impression_id;
	      } else {
	        bid.ad = _renderCreative(ad.script, ad.impression_id);
	
	        var _sizeMap$ad$size_id$s = sizeMap[ad.size_id].split('x').map(function (num) {
	          return Number(num);
	        });
	
	        var _sizeMap$ad$size_id$s2 = _slicedToArray(_sizeMap$ad$size_id$s, 2);
	
	        bid.width = _sizeMap$ad$size_id$s2[0];
	        bid.height = _sizeMap$ad$size_id$s2[1];
	      }
	
	      // add server-side targeting
	      bid.rubiconTargeting = (Array.isArray(ad.targeting) ? ad.targeting : []).reduce(function (memo, item) {
	        memo[item.key] = item.values[0];
	        return memo;
	      }, { 'rpfl_elemid': bidRequest.placementCode });
	
	      try {
	        _bidmanager2['default'].addBidResponse(bidRequest.placementCode, bid);
	      } catch (err) {
	        utils.logError('Error from addBidResponse', null, err);
	      }
	    });
	  }
	
	  function _adCpmSort(adA, adB) {
	    return (adB.cpm || 0.0) - (adA.cpm || 0.0);
	  }
	
	  return _extends(Adapter.createNew(RUBICON_BIDDER_CODE), {
	    callBids: _callBids,
	    createNew: RubiconAdapter.createNew
	  });
	}
	
	RubiconAdapter.masSizeOrdering = function (sizes) {
	  var MAS_SIZE_PRIORITY = [15, 2, 9];
	
	  return utils.parseSizesInput(sizes)
	  // map sizes while excluding non-matches
	  .reduce(function (result, size) {
	    var mappedSize = parseInt(sizeMap[size], 10);
	    if (mappedSize) {
	      result.push(mappedSize);
	    }
	    return result;
	  }, []).sort(function (first, second) {
	    // sort by MAS_SIZE_PRIORITY priority order
	    var firstPriority = MAS_SIZE_PRIORITY.indexOf(first),
	        secondPriority = MAS_SIZE_PRIORITY.indexOf(second);
	
	    if (firstPriority > -1 || secondPriority > -1) {
	      if (firstPriority === -1) {
	        return 1;
	      }
	      if (secondPriority === -1) {
	        return -1;
	      }
	      return firstPriority - secondPriority;
	    }
	
	    // and finally ascending order
	    return first - second;
	  });
	};
	
	RubiconAdapter.createNew = function () {
	  return new RubiconAdapter();
	};
	
	module.exports = RubiconAdapter;

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _adapter = __webpack_require__(14);
	
	var Adapter = _interopRequireWildcard(_adapter);
	
	var _bidfactory = __webpack_require__(10);
	
	var _bidfactory2 = _interopRequireDefault(_bidfactory);
	
	var _bidmanager = __webpack_require__(11);
	
	var _bidmanager2 = _interopRequireDefault(_bidmanager);
	
	var _utils = __webpack_require__(2);
	
	var utils = _interopRequireWildcard(_utils);
	
	var _ajax = __webpack_require__(21);
	
	var _constants = __webpack_require__(3);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }
	
	var SMARTYADS_BIDDER_CODE = 'smartyads';
	
	var sizeMap = {
	  1: '468x60',
	  2: '728x90',
	  8: '120x600',
	  9: '160x600',
	  10: '300x600',
	  15: '300x250',
	  16: '336x280',
	  19: '300x100',
	  43: '320x50',
	  44: '300x50',
	  48: '300x300',
	  54: '300x1050',
	  55: '970x90',
	  57: '970x250',
	  58: '1000x90',
	  59: '320x80',
	  61: '1000x1000',
	  65: '640x480',
	  67: '320x480',
	  68: '1800x1000',
	  72: '320x320',
	  73: '320x160',
	  83: '480x300',
	  94: '970x310',
	  96: '970x210',
	  101: '480x320',
	  102: '768x1024',
	  113: '1000x300',
	  117: '320x100',
	  125: '800x250',
	  126: '200x600'
	};
	
	utils._each(sizeMap, function (item, key) {
	  return sizeMap[item] = key;
	});
	
	function SmartyadsAdapter() {
	
	  function _callBids(bidderRequest) {
	
	    var bids = bidderRequest.bids || [];
	
	    bids.forEach(function (bid) {
	      try {
	        (0, _ajax.ajax)(buildOptimizedCall(bid), bidCallback, undefined, { withCredentials: true });
	      } catch (err) {
	        utils.logError('Error sending smartyads request for placement code ' + bid.placementCode, null, err);
	      }
	
	      function bidCallback(responseText) {
	
	        try {
	          utils.logMessage('XHR callback function called for ad ID: ' + bid.bidId);
	          handleRpCB(responseText, bid);
	        } catch (err) {
	          if (typeof err === "string") {
	            utils.logWarn(err + ' when processing smartyads response for placement code ' + bid.placementCode);
	          } else {
	            utils.logError('Error processing smartyads response for placement code ' + bid.placementCode, null, err);
	          }
	
	          //indicate that there is no bid for this placement
	          var badBid = _bidfactory2['default'].createBid(_constants.STATUS.NO_BID, bid);
	          badBid.bidderCode = bid.bidder;
	          badBid.error = err;
	          _bidmanager2['default'].addBidResponse(bid.placementCode, badBid);
	        }
	      }
	    });
	  }
	
	  function buildOptimizedCall(bid) {
	
	    bid.startTime = new Date().getTime();
	
	    // use smartyads sizes if provided, otherwise adUnit.sizes
	    var parsedSizes = SmartyadsAdapter.masSizeOrdering(Array.isArray(bid.params.sizes) ? bid.params.sizes.map(function (size) {
	      return (sizeMap[size] || '').split('x');
	    }) : bid.sizes);
	
	    if (parsedSizes.length < 1) {
	      throw "no valid sizes";
	    }
	
	    var secure;
	    if (window.location.protocol !== 'http:') {
	      secure = 1;
	    } else {
	      secure = 0;
	    }
	
	    var host = window.location.host,
	        page = window.location.pathname,
	        language = navigator.language,
	        deviceWidth = window.screen.width,
	        deviceHeight = window.screen.height;
	
	    var queryString = ['banner_id', bid.params.banner_id, 'size_ad', parsedSizes[0], 'alt_size_ad', parsedSizes.slice(1).join(',') || undefined, 'host', host, "page", page, "language", language, "deviceWidth", deviceWidth, "deviceHeight", deviceHeight, "secure", secure, "bidId", bid.bidId, "checkOn", 'rf'];
	
	    return queryString.reduce(function (memo, curr, index) {
	      return index % 2 === 0 && queryString[index + 1] !== undefined ? memo + curr + '=' + encodeURIComponent(queryString[index + 1]) + '&' : memo;
	    }, '//ssp-nj.webtradehub.com/?').slice(0, -1);
	  }
	
	  function handleRpCB(responseText, bidRequest) {
	
	    var ad = JSON.parse(responseText); // can throw
	
	    var bid = _bidfactory2['default'].createBid(_constants.STATUS.GOOD, bidRequest);
	    bid.creative_id = ad.ad_id;
	    bid.bidderCode = bidRequest.bidder;
	    bid.cpm = ad.cpm || 0;
	    bid.ad = ad.adm;
	    bid.width = ad.width;
	    bid.height = ad.height;
	    bid.dealId = ad.deal;
	
	    _bidmanager2['default'].addBidResponse(bidRequest.placementCode, bid);
	  }
	
	  return _extends(Adapter.createNew(SMARTYADS_BIDDER_CODE), { // SMARTYADS_BIDDER_CODE smartyads
	    callBids: _callBids,
	    createNew: SmartyadsAdapter.createNew
	  });
	}
	
	SmartyadsAdapter.masSizeOrdering = function (sizes) {
	
	  var MAS_SIZE_PRIORITY = [15, 2, 9];
	
	  return utils.parseSizesInput(sizes)
	  // map sizes while excluding non-matches
	  .reduce(function (result, size) {
	    var mappedSize = parseInt(sizeMap[size], 10);
	    if (mappedSize) {
	      result.push(mappedSize);
	    }
	    return result;
	  }, []).sort(function (first, second) {
	    // sort by MAS_SIZE_PRIORITY priority order
	    var firstPriority = MAS_SIZE_PRIORITY.indexOf(first),
	        secondPriority = MAS_SIZE_PRIORITY.indexOf(second);
	
	    if (firstPriority > -1 || secondPriority > -1) {
	      if (firstPriority === -1) {
	        return 1;
	      }
	      if (secondPriority === -1) {
	        return -1;
	      }
	      return firstPriority - secondPriority;
	    }
	
	    return first - second;
	  });
	};
	
	SmartyadsAdapter.createNew = function () {
	  return new SmartyadsAdapter();
	};
	
	module.exports = SmartyadsAdapter;

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _adapter = __webpack_require__(14);
	
	var Adapter = _interopRequireWildcard(_adapter);
	
	var _bidfactory = __webpack_require__(10);
	
	var _bidfactory2 = _interopRequireDefault(_bidfactory);
	
	var _bidmanager = __webpack_require__(11);
	
	var _bidmanager2 = _interopRequireDefault(_bidmanager);
	
	var _utils = __webpack_require__(2);
	
	var utils = _interopRequireWildcard(_utils);
	
	var _ajax = __webpack_require__(21);
	
	var _constants = __webpack_require__(3);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }
	
	var BIDDER_CODE = 'huddledmasses';
	
	var sizeObj = {
	  1: '468x60',
	  2: '728x90',
	  10: '300x600',
	  15: '300x250',
	  19: '300x100',
	  43: '320x50',
	  44: '300x50',
	  48: '300x300',
	  54: '300x1050',
	  55: '970x90',
	  57: '970x250',
	  58: '1000x90',
	  59: '320x80',
	  65: '640x480',
	  67: '320x480',
	  72: '320x320',
	  73: '320x160',
	  83: '480x300',
	  94: '970x310',
	  96: '970x210',
	  101: '480x320',
	  102: '768x1024',
	  113: '1000x300',
	  117: '320x100',
	  118: '800x250',
	  119: '200x600'
	};
	
	utils._each(sizeObj, function (item, key) {
	  return sizeObj[item] = key;
	});
	
	function HuddledMassesAdapter() {
	  function _callBids(bidderRequest) {
	    var bids = bidderRequest.bids || [];
	
	    bids.forEach(function (bid) {
	      function bidCallback(responseText) {
	        try {
	          utils.logMessage('XHR callback function called for ad ID: ' + bid.bidId);
	          handleRpCB(responseText, bid);
	        } catch (err) {
	          if (typeof err === "string") {
	            utils.logWarn(err + ' when processing huddledmasses response for placement code ' + bid.placementCode);
	          } else {
	            utils.logError('Error processing huddledmasses response for placement code ' + bid.placementCode, null, err);
	          }
	          var badBid = _bidfactory2['default'].createBid(_constants.STATUS.NO_BID, bid);
	          badBid.bidderCode = bid.bidder;
	          badBid.error = err;
	          _bidmanager2['default'].addBidResponse(bid.placementCode, badBid);
	        }
	      }
	
	      try {
	        (0, _ajax.ajax)(buildOptimizedCall(bid), bidCallback, undefined, { withCredentials: true });
	      } catch (err) {
	        utils.logError('Error sending huddledmasses request for placement code ' + bid.placementCode, null, err);
	      }
	    });
	  }
	
	  function buildOptimizedCall(bid) {
	    bid.startTime = new Date().getTime();
	
	    var parsedSizes = HuddledMassesAdapter.masSizeOrdering(Array.isArray(bid.params.sizes) ? bid.params.sizes.map(function (size) {
	      return (sizeObj[size] || '').split('x');
	    }) : bid.sizes);
	
	    if (parsedSizes.length < 1) {
	      throw "no valid sizes";
	    }
	
	    var secure = 0;
	    if (window.location.protocol !== 'http:') {
	      secure = 1;
	    }
	
	    var host = window.location.host;
	    var page = window.location.pathname;
	    var language = navigator.language;
	    var deviceWidth = window.screen.width;
	    var deviceHeight = window.screen.height;
	
	    var queryString = ['banner_id', bid.params.placement_id, 'size_ad', parsedSizes[0], 'alt_size_ad', parsedSizes.slice(1).join(',') || [], 'host', host, "page", page, "language", language, "deviceWidth", deviceWidth, "deviceHeight", deviceHeight, "secure", secure, "bidId", bid.bidId, "checkOn", 'rf'];
	
	    return queryString.reduce(function (memo, curr, index) {
	      return index % 2 === 0 && queryString[index + 1] !== undefined ? memo + curr + '=' + encodeURIComponent(queryString[index + 1]) + '&' : memo;
	    }, '//huddledmassessupply.com/?').slice(0, -1);
	  }
	
	  function handleRpCB(responseText, bidRequest) {
	    var ad = JSON.parse(responseText);
	
	    var bid = _bidfactory2['default'].createBid(_constants.STATUS.GOOD, bidRequest);
	    bid.creative_id = ad.ad_id;
	    bid.bidderCode = bidRequest.bidder;
	    bid.cpm = ad.cpm || 0;
	    bid.ad = ad.adm;
	    bid.width = ad.width;
	    bid.height = ad.height;
	    bid.dealId = ad.deal;
	
	    _bidmanager2['default'].addBidResponse(bidRequest.placementCode, bid);
	  }
	
	  return _extends(Adapter.createNew(BIDDER_CODE), { // BIDDER_CODE huddledmasses
	    callBids: _callBids,
	    createNew: HuddledMassesAdapter.createNew
	  });
	}
	
	HuddledMassesAdapter.masSizeOrdering = function (sizes) {
	  var MAS_SIZE_PRIORITY = [15, 2, 9];
	  return utils.parseSizesInput(sizes).reduce(function (result, size) {
	    var mappedSize = parseInt(sizeObj[size], 10);
	    if (mappedSize) {
	      result.push(mappedSize);
	    }
	    return result;
	  }, []).sort(function (first, second) {
	    var firstPriority = MAS_SIZE_PRIORITY.indexOf(first);
	    var secondPriority = MAS_SIZE_PRIORITY.indexOf(second);
	
	    if (firstPriority > -1 || secondPriority > -1) {
	      if (firstPriority === -1) {
	        return 1;
	      }
	      if (secondPriority === -1) {
	        return -1;
	      }
	      return firstPriority - secondPriority;
	    }
	
	    return first - second;
	  });
	};
	
	HuddledMassesAdapter.createNew = function () {
	  return new HuddledMassesAdapter();
	};
	
	module.exports = HuddledMassesAdapter;

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var utils = __webpack_require__(2);
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var adloader = __webpack_require__(13);
	var url = __webpack_require__(22);
	
	var SmartAdServer = function SmartAdServer() {
	  var generateCallback = function generateCallback(bid) {
	    var callbackId = "sas_" + utils.getUniqueIdentifierStr();
	    pbjs[callbackId] = function (adUnit) {
	      var bidObject;
	      if (adUnit) {
	        utils.logMessage("[SmartAdServer] bid response for placementCode " + bid.placementCode);
	        bidObject = bidfactory.createBid(1);
	        bidObject.bidderCode = 'smartadserver';
	        bidObject.cpm = adUnit.cpm;
	        bidObject.currency = adUnit.currency;
	        bidObject.ad = adUnit.ad;
	        bidObject.width = adUnit.width;
	        bidObject.height = adUnit.height;
	        bidObject.dealId = adUnit.dealId;
	        bidmanager.addBidResponse(bid.placementCode, bidObject);
	      } else {
	        utils.logMessage("[SmartAdServer] no bid response for placementCode " + bid.placementCode);
	        bidObject = bidfactory.createBid(2);
	        bidObject.bidderCode = 'smartadserver';
	        bidmanager.addBidResponse(bid.placementCode, bidObject);
	      }
	    };
	    return callbackId;
	  };
	
	  return {
	    callBids: function callBids(params) {
	      for (var i = 0; i < params.bids.length; i++) {
	        var bid = params.bids[i];
	        var adCall = url.parse(bid.params.domain);
	        adCall.pathname = "/prebid";
	        adCall.search = {
	          "pbjscbk": "pbjs." + generateCallback(bid),
	          "siteid": bid.params.siteId,
	          "pgid": bid.params.pageId,
	          "fmtid": bid.params.formatId,
	          "ccy": bid.params.currency || "USD",
	          "tgt": encodeURIComponent(bid.params.target || ''),
	          "tag": bid.placementCode,
	          "sizes": bid.sizes.map(function (size) {
	            return size[0] + "x" + size[1];
	          }).join(","),
	          "async": 1
	        };
	        adloader.loadScript(url.format(adCall));
	      }
	    }
	  };
	};
	
	module.exports = SmartAdServer;

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _utils = __webpack_require__(2);
	
	var CONSTANTS = __webpack_require__(3);
	var utils = __webpack_require__(2);
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var adloader = __webpack_require__(13);
	
	var sekindoUMAdapter;
	sekindoUMAdapter = function sekindoUMAdapter() {
	
	  function _callBids(params) {
	    var bids = params.bids;
	    var bidsCount = bids.length;
	
	    var pubUrl = null;
	    if (parent !== window) pubUrl = document.referrer;else pubUrl = window.location.href;
	
	    for (var i = 0; i < bidsCount; i++) {
	      var bidReqeust = bids[i];
	      var callbackId = bidReqeust.bidId;
	      _requestBids(bidReqeust, callbackId, pubUrl);
	      //store a reference to the bidRequest from the callback id
	      //bidmanager.pbCallbackMap[callbackId] = bidReqeust;
	    }
	  }
	
	  pbjs.sekindoCB = function (callbackId, response) {
	    var bidObj = (0, _utils.getBidRequest)(callbackId);
	    if (typeof response !== 'undefined' && typeof response.cpm !== 'undefined') {
	      var bid = [];
	      if (bidObj) {
	        var bidCode = bidObj.bidder;
	        var placementCode = bidObj.placementCode;
	
	        if (response.cpm !== undefined && response.cpm > 0) {
	
	          bid = bidfactory.createBid(CONSTANTS.STATUS.GOOD);
	          bid.callback_uid = callbackId;
	          bid.bidderCode = bidCode;
	          bid.creative_id = response.adId;
	          bid.cpm = parseFloat(response.cpm);
	          bid.ad = response.ad;
	          bid.width = response.width;
	          bid.height = response.height;
	
	          bidmanager.addBidResponse(placementCode, bid);
	        } else {
	          bid = bidfactory.createBid(CONSTANTS.STATUS.NO_BID);
	          bid.callback_uid = callbackId;
	          bid.bidderCode = bidCode;
	          bidmanager.addBidResponse(placementCode, bid);
	        }
	      }
	    } else {
	      if (bidObj) {
	        utils.logMessage('No prebid response for placement ' + bidObj.placementCode);
	      } else {
	        utils.logMessage('sekindoUM callback general error');
	      }
	    }
	  };
	
	  function _requestBids(bid, callbackId, pubUrl) {
	    //determine tag params
	    var spaceId = utils.getBidIdParameter('spaceId', bid.params);
	    var subId = utils.getBidIdParameter('subId', bid.params);
	    var bidfloor = utils.getBidIdParameter('bidfloor', bid.params);
	    var protocol = 'https:' === document.location.protocol ? 's' : '';
	    var scriptSrc = 'http' + protocol + '://hb.sekindo.com/live/liveView.php?';
	
	    scriptSrc = utils.tryAppendQueryString(scriptSrc, 's', spaceId);
	    scriptSrc = utils.tryAppendQueryString(scriptSrc, 'subId', subId);
	    scriptSrc = utils.tryAppendQueryString(scriptSrc, 'pubUrl', pubUrl);
	    scriptSrc = utils.tryAppendQueryString(scriptSrc, 'hbcb', callbackId);
	    scriptSrc = utils.tryAppendQueryString(scriptSrc, 'hbver', '3');
	    scriptSrc = utils.tryAppendQueryString(scriptSrc, 'hbobj', 'pbjs');
	    scriptSrc = utils.tryAppendQueryString(scriptSrc, 'dcpmflr', bidfloor);
	    scriptSrc = utils.tryAppendQueryString(scriptSrc, 'hbto', pbjs.bidderTimeout);
	    scriptSrc = utils.tryAppendQueryString(scriptSrc, 'protocol', protocol);
	
	    adloader.loadScript(scriptSrc);
	  }
	
	  return {
	    callBids: _callBids
	  };
	};
	
	module.exports = sekindoUMAdapter;

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _adapter = __webpack_require__(14);
	
	var _adapter2 = _interopRequireDefault(_adapter);
	
	var _bidfactory = __webpack_require__(10);
	
	var _bidfactory2 = _interopRequireDefault(_bidfactory);
	
	var _bidmanager = __webpack_require__(11);
	
	var _bidmanager2 = _interopRequireDefault(_bidmanager);
	
	var _utils = __webpack_require__(2);
	
	var utils = _interopRequireWildcard(_utils);
	
	var _ajax = __webpack_require__(21);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	var ServerBidAdapter = function ServerBidAdapter() {
	
	  var baseAdapter = _adapter2['default'].createNew('serverbid');
	
	  var BASE_URI = '//e.serverbid.com/api/v2';
	
	  var sizeMap = [null, "120x90", "120x90", "468x60", "728x90", "300x250", "160x600", "120x600", "300x100", "180x150", "336x280", "240x400", "234x60", "88x31", "120x60", "120x240", "125x125", "220x250", "250x250", "250x90", "0x0", "200x90", "300x50", "320x50", "320x480", "185x185", "620x45", "300x125", "800x250"];
	
	  var bidIds = [];
	
	  baseAdapter.callBids = function (params) {
	
	    if (params && params.bids && utils.isArray(params.bids) && params.bids.length) {
	
	      var data = {
	        placements: [],
	        time: Date.now(),
	        user: {},
	        url: utils.getTopWindowUrl(),
	        referrer: document.referrer,
	        enableBotFiltering: true,
	        includePricingData: true
	      };
	
	      var bids = params.bids || [];
	      for (var i = 0; i < bids.length; i++) {
	        var bid = bids[i];
	
	        bidIds.push(bid.bidId);
	
	        var bid_data = {
	          networkId: bid.params.networkId,
	          siteId: bid.params.siteId,
	          zoneIds: bid.params.zoneIds,
	          campaignId: bid.params.campaignId,
	          flightId: bid.params.flightId,
	          adId: bid.params.adId,
	          divName: bid.bidId,
	          adTypes: bid.adTypes || getSize(bid.sizes)
	        };
	
	        if (bid_data.networkId && bid_data.siteId) {
	          data.placements.push(bid_data);
	        }
	      }
	
	      if (data.placements.length) {
	        (0, _ajax.ajax)(BASE_URI, _responseCallback, JSON.stringify(data), { method: 'POST', withCredentials: true, contentType: 'application/json' });
	      }
	    }
	  };
	
	  function _responseCallback(result) {
	
	    var bid = void 0;
	    var bidId = void 0;
	    var bidObj = void 0;
	    var bidCode = void 0;
	    var placementCode = void 0;
	
	    try {
	      result = JSON.parse(result);
	    } catch (error) {
	      utils.logError(error);
	    }
	
	    for (var i = 0; i < bidIds.length; i++) {
	
	      bidId = bidIds[i];
	      bidObj = utils.getBidRequest(bidId);
	      bidCode = bidObj.bidder;
	      placementCode = bidObj.placementCode;
	
	      if (result) {
	        var decision = result.decisions && result.decisions[bidId];
	        var price = decision && decision.pricing && decision.pricing.clearPrice;
	
	        if (decision && price) {
	          bid = _bidfactory2['default'].createBid(1, bidObj);
	          bid.bidderCode = bidCode;
	          bid.cpm = price;
	          bid.width = decision.width;
	          bid.height = decision.height;
	          bid.ad = retrieveAd(decision);
	        } else {
	          bid = _bidfactory2['default'].createBid(2, bidObj);
	          bid.bidderCode = bidCode;
	        }
	      } else {
	        bid = _bidfactory2['default'].createBid(2, bidObj);
	        bid.bidderCode = bidCode;
	      }
	      _bidmanager2['default'].addBidResponse(placementCode, bid);
	    }
	  }
	
	  function retrieveAd(decision) {
	    return decision.contents && decision.contents[0] && decision.contents[0].body + utils.createTrackPixelHtml(decision.impressionUrl);
	  }
	
	  function getSize(sizes) {
	    var result = [];
	    sizes.forEach(function (size) {
	      var index = sizeMap.indexOf(size[0] + "x" + size[1]);
	      if (index >= 0) {
	        result.push(index);
	      }
	    });
	    return result;
	  }
	
	  // Export the `callBids` function, so that Prebid.js can execute
	  // this function when the page asks to send out bid requests.
	  return {
	    callBids: baseAdapter.callBids
	  };
	};
	
	ServerBidAdapter.createNew = function () {
	  return new ServerBidAdapter();
	};
	
	module.exports = ServerBidAdapter;

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var adloader = __webpack_require__(13);
	var utils = __webpack_require__(2);
	
	var SonobiAdapter = function SonobiAdapter() {
	  var keymakerAssoc = {}; //  Remember placement codes for callback mapping
	  var bidReqAssoc = {}; //  Remember bids for bid complete reporting
	
	  function _phone_in(request) {
	    var trinity = 'https://apex.go.sonobi.com/trinity.js?key_maker=';
	    var adSlots = request.bids || [];
	    var bidderRequestId = request.bidderRequestId;
	    var ref = window.frameElement ? '&ref=' + encodeURI(top.location.host || document.referrer) : '';
	    adloader.loadScript(trinity + JSON.stringify(_keymaker(adSlots)) + '&cv=' + _operator(bidderRequestId) + ref);
	  }
	
	  function _keymaker(adSlots) {
	    var keyring = {};
	    utils._each(adSlots, function (bidRequest) {
	      if (bidRequest.params) {
	        //  Optional
	        var floor = bidRequest.params.floor ? bidRequest.params.floor : null;
	        //  Mandatory
	        var slotIdentifier = bidRequest.params.ad_unit ? bidRequest.params.ad_unit : bidRequest.params.placement_id ? bidRequest.params.placement_id : null;
	        var sizes = bidRequest.params.sizes ? bidRequest.params.sizes : bidRequest.sizes || null;
	        sizes = utils.parseSizesInput(sizes).toString();
	
	        if (utils.isEmpty(sizes)) {
	          utils.logError('Sonobi adapter expects sizes for ' + bidRequest.placementCode);
	        }
	
	        var bidId = bidRequest.bidId;
	
	        var args = sizes ? floor ? sizes + '|f=' + floor : sizes : floor ? 'f=' + floor : '';
	        if (/^[\/]?[\d]+[[\/].+[\/]?]?$/.test(slotIdentifier)) {
	          slotIdentifier = slotIdentifier.charAt(0) === '/' ? slotIdentifier : '/' + slotIdentifier;
	          keyring[slotIdentifier + '|' + bidId] = args;
	          keymakerAssoc[slotIdentifier + '|' + bidId] = bidRequest.placementCode;
	          bidReqAssoc[bidRequest.placementCode] = bidRequest;
	        } else if (/^[0-9a-fA-F]{20}$/.test(slotIdentifier) && slotIdentifier.length === 20) {
	          keyring[bidId] = slotIdentifier + '|' + args;
	          keymakerAssoc[bidId] = bidRequest.placementCode;
	          bidReqAssoc[bidRequest.placementCode] = bidRequest;
	        } else {
	          keymakerAssoc[bidId] = bidRequest.placementCode;
	          bidReqAssoc[bidRequest.placementCode] = bidRequest;
	          _failure(bidRequest.placementCode);
	          utils.logError('The ad unit code or Sonobi Placement id for slot ' + bidRequest.placementCode + ' is invalid');
	        }
	      }
	    });
	    return keyring;
	  }
	
	  function _operator(bidderRequestId) {
	    var cb_name = "sbi_" + bidderRequestId;
	    window[cb_name] = _trinity;
	    return cb_name;
	  }
	
	  function _trinity(response) {
	    var slots = response.slots || {};
	    var sbi_dc = response.sbi_dc || '';
	    utils._each(slots, function (bid, slot_id) {
	      var placementCode = keymakerAssoc[slot_id];
	      if (bid.sbi_aid && bid.sbi_mouse && bid.sbi_size) {
	        _success(placementCode, sbi_dc, bid);
	      } else {
	        _failure(placementCode);
	      }
	      delete keymakerAssoc[slot_id];
	    });
	  }
	
	  function _seraph(placementCode) {
	    var theOne = bidReqAssoc[placementCode];
	    delete bidReqAssoc[placementCode];
	    return theOne;
	  }
	
	  function _success(placementCode, sbi_dc, bid) {
	    var goodBid = bidfactory.createBid(1, _seraph(placementCode));
	    if (bid.sbi_dozer) {
	      goodBid.dealId = bid.sbi_dozer;
	    }
	    goodBid.bidderCode = 'sonobi';
	    goodBid.ad = _creative(sbi_dc, bid.sbi_aid);
	    goodBid.cpm = Number(bid.sbi_mouse);
	    goodBid.width = Number(bid.sbi_size.split('x')[0]) || 1;
	    goodBid.height = Number(bid.sbi_size.split('x')[1]) || 1;
	    bidmanager.addBidResponse(placementCode, goodBid);
	  }
	
	  function _failure(placementCode) {
	    var failBid = bidfactory.createBid(2, _seraph(placementCode));
	    failBid.bidderCode = 'sonobi';
	    bidmanager.addBidResponse(placementCode, failBid);
	  }
	
	  function _creative(sbi_dc, sbi_aid) {
	    var src = 'https://' + sbi_dc + 'apex.go.sonobi.com/sbi.js?aid=' + sbi_aid + '&as=null';
	    return '<script type="text/javascript" src="' + src + '"></script>';
	  }
	
	  return {
	    callBids: _phone_in,
	    formRequest: _keymaker,
	    parseResponse: _trinity,
	    success: _success,
	    failure: _failure
	  };
	};
	
	module.exports = SonobiAdapter;

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var CONSTANTS = __webpack_require__(3);
	var utils = __webpack_require__(2);
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var adloader = __webpack_require__(13);
	
	/**
	 * Adapter for requesting bids from Sovrn
	 */
	var SovrnAdapter = function SovrnAdapter() {
	  var sovrnUrl = 'ap.lijit.com/rtb/bid';
	
	  function _callBids(params) {
	    var sovrnBids = params.bids || [];
	
	    _requestBids(sovrnBids);
	  }
	
	  function _requestBids(bidReqs) {
	    // build bid request object
	    var domain = window.location.host;
	    var page = window.location.pathname + location.search + location.hash;
	
	    var sovrnImps = [];
	
	    //build impression array for sovrn
	    utils._each(bidReqs, function (bid) {
	      var tagId = utils.getBidIdParameter('tagid', bid.params);
	      var bidFloor = utils.getBidIdParameter('bidfloor', bid.params);
	      var adW = 0;
	      var adH = 0;
	
	      //sovrn supports only one size per tagid, so we just take the first size if there are more
	      //if we are a 2 item array of 2 numbers, we must be a SingleSize array
	      var bidSizes = Array.isArray(bid.params.sizes) ? bid.params.sizes : bid.sizes;
	      var sizeArrayLength = bidSizes.length;
	      if (sizeArrayLength === 2 && typeof bidSizes[0] === 'number' && typeof bidSizes[1] === 'number') {
	        adW = bidSizes[0];
	        adH = bidSizes[1];
	      } else {
	        adW = bidSizes[0][0];
	        adH = bidSizes[0][1];
	      }
	
	      var imp = {
	        id: bid.bidId,
	        banner: {
	          w: adW,
	          h: adH
	        },
	        tagid: tagId,
	        bidfloor: bidFloor
	      };
	      sovrnImps.push(imp);
	    });
	
	    // build bid request with impressions
	    var sovrnBidReq = {
	      id: utils.getUniqueIdentifierStr(),
	      imp: sovrnImps,
	      site: {
	        domain: domain,
	        page: page
	      }
	    };
	
	    var scriptUrl = '//' + sovrnUrl + '?callback=window.pbjs.sovrnResponse' + '&src=' + CONSTANTS.REPO_AND_VERSION + '&br=' + encodeURIComponent(JSON.stringify(sovrnBidReq));
	    adloader.loadScript(scriptUrl);
	  }
	
	  function addBlankBidResponses(impidsWithBidBack) {
	    var missing = pbjs._bidsRequested.find(function (bidSet) {
	      return bidSet.bidderCode === 'sovrn';
	    });
	    if (missing) {
	      missing = missing.bids.filter(function (bid) {
	        return impidsWithBidBack.indexOf(bid.bidId) < 0;
	      });
	    } else {
	      missing = [];
	    }
	
	    missing.forEach(function (bidRequest) {
	      // Add a no-bid response for this bid request.
	      var bid = {};
	      bid = bidfactory.createBid(2, bidRequest);
	      bid.bidderCode = 'sovrn';
	      bidmanager.addBidResponse(bidRequest.placementCode, bid);
	    });
	  }
	
	  //expose the callback to the global object:
	  pbjs.sovrnResponse = function (sovrnResponseObj) {
	    // valid object?
	    if (sovrnResponseObj && sovrnResponseObj.id) {
	      // valid object w/ bid responses?
	      if (sovrnResponseObj.seatbid && sovrnResponseObj.seatbid.length !== 0 && sovrnResponseObj.seatbid[0].bid && sovrnResponseObj.seatbid[0].bid.length !== 0) {
	        var impidsWithBidBack = [];
	        sovrnResponseObj.seatbid[0].bid.forEach(function (sovrnBid) {
	
	          var responseCPM;
	          var placementCode = '';
	          var id = sovrnBid.impid;
	          var bid = {};
	
	          // try to fetch the bid request we sent Sovrn
	          var bidObj = pbjs._bidsRequested.find(function (bidSet) {
	            return bidSet.bidderCode === 'sovrn';
	          }).bids.find(function (bid) {
	            return bid.bidId === id;
	          });
	
	          if (bidObj) {
	            placementCode = bidObj.placementCode;
	            bidObj.status = CONSTANTS.STATUS.GOOD;
	
	            //place ad response on bidmanager._adResponsesByBidderId
	            responseCPM = parseFloat(sovrnBid.price);
	
	            if (responseCPM !== 0) {
	              sovrnBid.placementCode = placementCode;
	              sovrnBid.size = bidObj.sizes;
	              var responseAd = sovrnBid.adm;
	
	              // build impression url from response
	              var responseNurl = '<img src="' + sovrnBid.nurl + '">';
	
	              //store bid response
	              //bid status is good (indicating 1)
	              bid = bidfactory.createBid(1, bidObj);
	              bid.creative_id = sovrnBid.id;
	              bid.bidderCode = 'sovrn';
	              bid.cpm = responseCPM;
	
	              //set ad content + impression url
	              // sovrn returns <script> block, so use bid.ad, not bid.adurl
	              bid.ad = decodeURIComponent(responseAd + responseNurl);
	
	              // Set width and height from response now
	              bid.width = parseInt(sovrnBid.w);
	              bid.height = parseInt(sovrnBid.h);
	
	              bidmanager.addBidResponse(placementCode, bid);
	              impidsWithBidBack.push(id);
	            }
	          }
	        });
	
	        addBlankBidResponses(impidsWithBidBack);
	      } else {
	        //no response data for all requests
	        addBlankBidResponses([]);
	      }
	    } else {
	      //no response data for all requests
	      addBlankBidResponses([]);
	    }
	  }; // sovrnResponse
	
	  return {
	    callBids: _callBids
	  };
	};
	
	module.exports = SovrnAdapter;

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var adloader = __webpack_require__(13);
	
	var SpringServeAdapter;
	SpringServeAdapter = function SpringServeAdapter() {
	
	  function buildSpringServeCall(bid) {
	
	    var spCall = window.location.protocol + '//bidder.springserve.com/display/hbid?';
	
	    //get width and height from bid attribute
	    var size = bid.sizes[0];
	    var width = size[0];
	    var height = size[1];
	
	    spCall += '&w=';
	    spCall += width;
	    spCall += '&h=';
	    spCall += height;
	
	    var params = bid.params;
	
	    //maps param attributes to request parameters
	    var requestAttrMap = {
	      sp: 'supplyPartnerId',
	      imp_id: 'impId'
	    };
	
	    for (var property in requestAttrMap) {
	      if (requestAttrMap.hasOwnProperty && params.hasOwnProperty(requestAttrMap[property])) {
	        spCall += '&';
	        spCall += property;
	        spCall += '=';
	
	        //get property from params and include it in request
	        spCall += params[requestAttrMap[property]];
	      }
	    }
	
	    var domain = window.location.hostname;
	
	    //override domain when testing
	    if (params.hasOwnProperty('test') && params.test === true) {
	      spCall += '&debug=true';
	      domain = 'test.com';
	    }
	
	    spCall += '&domain=';
	    spCall += domain;
	    spCall += '&callback=pbjs.handleSpringServeCB';
	
	    return spCall;
	  }
	
	  function _callBids(params) {
	    var bids = params.bids || [];
	    for (var i = 0; i < bids.length; i++) {
	      var bid = bids[i];
	      //bidmanager.pbCallbackMap[bid.params.impId] = params;
	      adloader.loadScript(buildSpringServeCall(bid));
	    }
	  }
	
	  pbjs.handleSpringServeCB = function (responseObj) {
	    if (responseObj && responseObj.seatbid && responseObj.seatbid.length > 0 && responseObj.seatbid[0].bid[0] !== undefined) {
	      //look up the request attributs stored in the bidmanager
	      var responseBid = responseObj.seatbid[0].bid[0];
	      //var requestObj = bidmanager.getPlacementIdByCBIdentifer(responseBid.impid);
	      var requestBids = pbjs._bidsRequested.find(function (bidSet) {
	        return bidSet.bidderCode === 'springserve';
	      });
	      if (requestBids && requestBids.bids.length > 0) {
	        requestBids = requestBids.bids.filter(function (bid) {
	          return bid.params && bid.params.impId === responseBid.impid;
	        });
	      } else {
	        requestBids = [];
	      }
	      var bid = bidfactory.createBid(1);
	      var placementCode;
	
	      //assign properties from the original request to the bid object
	      for (var i = 0; i < requestBids.length; i++) {
	        var bidRequest = requestBids[i];
	        if (bidRequest.bidder === 'springserve') {
	          placementCode = bidRequest.placementCode;
	          var size = bidRequest.sizes[0];
	          bid.width = size[0];
	          bid.height = size[1];
	        }
	      }
	
	      if (requestBids[0]) {
	        bid.bidderCode = requestBids[0].bidder;
	      }
	
	      if (responseBid.hasOwnProperty('price') && responseBid.hasOwnProperty('adm')) {
	        //assign properties from the response to the bid object
	        bid.cpm = responseBid.price;
	        bid.ad = responseBid.adm;
	      } else {
	        //make object for invalid bid response
	        bid = bidfactory.createBid(2);
	        bid.bidderCode = 'springserve';
	      }
	
	      bidmanager.addBidResponse(placementCode, bid);
	    }
	  };
	
	  // Export the callBids function, so that prebid.js can execute this function
	  // when the page asks to send out bid requests.
	  return {
	    callBids: _callBids,
	    buildSpringServeCall: buildSpringServeCall
	  };
	};
	
	module.exports = SpringServeAdapter;

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var utils = __webpack_require__(2);
	var adloader_1 = __webpack_require__(13);
	var ROOT_URL = "//cdn.thoughtleadr.com/v4/";
	var BID_AVAILABLE = 1;
	
	var ThoughtleadrAdapter = function () {
	  function ThoughtleadrAdapter() {}
	
	  ThoughtleadrAdapter.prototype.callBids = function (params) {
	    if (!window.tldr || !window.tldr.requestPrebid) {
	      var rootUrl = ROOT_URL;
	      if (window.tldr && window.tldr.config && window.tldr.config.root_url) {
	        rootUrl = window.tldr.config.root_url;
	      }
	      adloader_1.loadScript(rootUrl + "page.js", this.handleBids.bind(this, params), true);
	    } else {
	      this.handleBids(params);
	    }
	  };
	
	  ThoughtleadrAdapter.prototype.handleBids = function (params) {
	    var bids = (params.bids || []).filter(function (bid) {
	      return ThoughtleadrAdapter.valid(bid);
	    });
	
	    for (var _i = 0, bids_1 = bids; _i < bids_1.length; _i++) {
	      var bid = bids_1[_i];
	      this.requestPlacement(bid);
	    }
	  };
	
	  ThoughtleadrAdapter.prototype.requestPlacement = function (bid) {
	    var _this = this;
	    var rid = utils.generateUUID(null);
	    var size = ThoughtleadrAdapter.getSizes(bid.sizes);
	
	    window.tldr.requestPrebid(bid.params.placementId, rid).then(function (params) {
	      if (!params || !params.bid) {
	        utils.logError("invalid response from tldr.requestPrebid", undefined, undefined);
	        return;
	      }
	
	      _this.receiver = function (ev) {
	        if (ev.origin === location.origin && ev.data && ev.data.TLDR_REQUEST && ev.data.TLDR_REQUEST.rid === rid) {
	          ev.source.postMessage({ TLDR_RESPONSE: { config: params.config, rid: rid } }, location.origin);
	        }
	        _this.stopListen();
	      };
	      window.addEventListener("message", _this.receiver, false);
	      setTimeout(function () {
	        return _this.stopListen();
	      }, 5000);
	
	      var bidObject;
	      if (params.bid.code === BID_AVAILABLE) {
	        bidObject = bidfactory.createBid(params.bid.code);
	        bidObject.bidderCode = 'thoughtleadr';
	        bidObject.cpm = params.bid.cpm;
	        bidObject.ad = params.bid.ad;
	        bidObject.width = size.width;
	        bidObject.height = size.height;
	      } else {
	        bidObject = bidfactory.createBid(params.bid.code);
	        bidObject.bidderCode = 'thoughtleadr';
	      }
	      bidmanager.addBidResponse(bid.placementCode, bidObject);
	    });
	  };
	
	  ThoughtleadrAdapter.prototype.stopListen = function () {
	    if (this.receiver) {
	      window.removeEventListener("message", this.receiver);
	      this.receiver = undefined;
	    }
	  };
	
	  ThoughtleadrAdapter.valid = function (bid) {
	    return !!(bid && bid.params && typeof bid.params.placementId === "string");
	  };
	
	  ThoughtleadrAdapter.getSizes = function (sizes) {
	    var first = sizes[0];
	    if (Array.isArray(first)) {
	      return ThoughtleadrAdapter.getSizes(first);
	    }
	    return {
	      width: sizes[0],
	      height: sizes[1]
	    };
	  };
	  return ThoughtleadrAdapter;
	}();
	
	module.exports = ThoughtleadrAdapter;

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var Adapter = __webpack_require__(14);
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var adloader = __webpack_require__(13);
	
	var StickyAdsTVAdapter = function StickyAdsTVAdapter() {
	
	  var STICKYADS_BIDDERCODE = 'stickyadstv';
	  var MUSTANG_URL = "//cdn.stickyadstv.com/mustang/mustang.min.js";
	  var INTEXTROLL_URL = "//cdn.stickyadstv.com/prime-time/intext-roll.min.js";
	  var SCREENROLL_URL = "//cdn.stickyadstv.com/prime-time/screen-roll.min.js";
	
	  var topMostWindow = getTopMostWindow();
	  topMostWindow.stickyadstv_cache = {};
	
	  function _callBids(params) {
	
	    var bids = params.bids || [];
	    for (var i = 0; i < bids.length; i++) {
	      var bid = bids[i];
	      // Send out bid request for each bid given its tag IDs and query strings
	
	      if (bid.placementCode && bid.params.zoneId) {
	        sendBidRequest(bid);
	      } else {
	        console.warn("StickyAdsTV: Missing mandatory field(s).");
	      }
	    }
	  }
	
	  function sendBidRequest(bid) {
	
	    var placementCode = bid.placementCode;
	
	    var integrationType = bid.params.format ? bid.params.format : "inbanner";
	    var urltoLoad = MUSTANG_URL;
	
	    if (integrationType === "intext-roll") {
	      urltoLoad = INTEXTROLL_URL;
	    }
	    if (integrationType === "screen-roll") {
	      urltoLoad = SCREENROLL_URL;
	    }
	
	    var bidRegistered = false;
	    adloader.loadScript(urltoLoad, function () {
	
	      getBid(bid, function (bidObject) {
	
	        if (!bidRegistered) {
	          bidRegistered = true;
	          bidmanager.addBidResponse(placementCode, bidObject);
	        }
	      });
	    }, true);
	  }
	
	  function getBid(bid, callback) {
	    var zoneId = bid.params.zoneId || bid.params.zone; //accept both
	    var size = getBiggerSize(bid.sizes);
	
	    var vastLoader = new window.com.stickyadstv.vast.VastLoader();
	    bid.vast = topMostWindow.stickyadstv_cache[bid.placementCode] = vastLoader.getVast();
	
	    var vastCallback = {
	      onSuccess: bind(function () {
	
	        //'this' is the bid request here
	        var bidRequest = this;
	
	        var adHtml = formatAdHTML(bidRequest, size);
	        var price = extractPrice(bidRequest.vast);
	
	        callback(formatBidObject(bidRequest, true, price, adHtml, size[0], size[1]));
	      }, bid),
	      onError: bind(function () {
	        var bidRequest = this;
	        callback(formatBidObject(bidRequest, false));
	      }, bid)
	    };
	
	    var config = {
	      zoneId: zoneId,
	      playerSize: size[0] + "x" + size[1],
	      vastUrlParams: bid.params.vastUrlParams,
	      componentId: "prebid-sticky" + (bid.params.format ? "-" + bid.params.format : "")
	    };
	
	    if (bid.params.format === "screen-roll") {
	      //in screenroll case we never use the original div size.
	      config.playerSize = window.com.stickyadstv.screenroll.getPlayerSize();
	    }
	
	    vastLoader.load(config, vastCallback);
	  }
	
	  function getBiggerSize(array) {
	    var result = [1, 1];
	    for (var i = 0; i < array.length; i++) {
	      if (array[i][0] * array[i][1] > result[0] * result[1]) {
	        result = array[i];
	      }
	    }
	    return result;
	  }
	
	  var formatInBannerHTML = function formatInBannerHTML(bid, size) {
	    var placementCode = bid.placementCode;
	
	    var divHtml = "<div id=\"stickyadstv_prebid_target\"></div>";
	
	    var script = "<script type='text/javascript'>" +
	    //get the top most accessible window
	    "var topWindow = (function(){var res=window; try{while(top != res){if(res.parent.location.href.length)res=res.parent;}}catch(e){}return res;})();" + "var vast =  topWindow.stickyadstv_cache[\"" + placementCode + "\"];" + "var config = {" + "  preloadedVast:vast," + "  autoPlay:true" + "};" + "var ad = new topWindow.com.stickyadstv.vpaid.Ad(document.getElementById(\"stickyadstv_prebid_target\"),config);" + "ad.initAd(" + size[0] + "," + size[1] + ",\"\",0,\"\",\"\");" + "</script>";
	
	    return divHtml + script;
	  };
	
	  var formatIntextHTML = function formatIntextHTML(bid) {
	    var placementCode = bid.placementCode;
	
	    var config = bid.params;
	
	    //default placement if no placement is set
	    if (!config.hasOwnProperty("domId") && !config.hasOwnProperty("auto") && !config.hasOwnProperty("p") && !config.hasOwnProperty("article")) {
	      config.domId = placementCode;
	    }
	
	    var script = "<script type='text/javascript'>" +
	    //get the top most accessible window
	    "var topWindow = (function(){var res=window; try{while(top != res){if(res.parent.location.href.length)res=res.parent;}}catch(e){}return res;})();" + "var vast =  topWindow.stickyadstv_cache[\"" + placementCode + "\"];" + "var config = {" + "  preloadedVast:vast";
	
	    for (var key in config) {
	      //dont' send format parameter
	      //neither zone nor vastUrlParams value as Vast is already loaded
	      if (config.hasOwnProperty(key) && key !== "format" && key !== "zone" && key !== "zoneId" && key !== "vastUrlParams") {
	
	        script += "," + key + ":\"" + config[key] + "\"";
	      }
	    }
	    script += "};" + "topWindow.com.stickyadstv.intextroll.start(config);" + "</script>";
	
	    return script;
	  };
	
	  var formatScreenRollHTML = function formatScreenRollHTML(bid) {
	    var placementCode = bid.placementCode;
	
	    var config = bid.params;
	
	    var script = "<script type='text/javascript'>" +
	
	    //get the top most accessible window
	    "var topWindow = (function(){var res=window; try{while(top != res){if(res.parent.location.href.length)res=res.parent;}}catch(e){}return res;})();" + "var vast =  topWindow.stickyadstv_cache[\"" + placementCode + "\"];" + "var config = {" + "  preloadedVast:vast";
	
	    for (var key in config) {
	      //dont' send format parameter
	      //neither zone nor vastUrlParams values as Vast is already loaded
	      if (config.hasOwnProperty(key) && key !== "format" && key !== "zone" && key !== "zoneId" && key !== "vastUrlParams") {
	
	        script += "," + key + ":\"" + config[key] + "\"";
	      }
	    }
	    script += "};" + "topWindow.com.stickyadstv.screenroll.start(config);" + "</script>";
	
	    return script;
	  };
	
	  function formatAdHTML(bid, size) {
	
	    var integrationType = bid.params.format;
	
	    var html = "";
	    if (integrationType === "intext-roll") {
	      html = formatIntextHTML(bid);
	    } else if (integrationType === "screen-roll") {
	      html = formatScreenRollHTML(bid);
	    } else {
	      html = formatInBannerHTML(bid, size);
	    }
	
	    return html;
	  }
	
	  function extractPrice(vast) {
	    var priceData = vast.getPricing();
	
	    if (!priceData) {
	      console.warn("StickyAdsTV: Bid pricing Can't be retreived. You may need to enable pricing on you're zone. Please get in touch with your sticky contact.");
	    }
	
	    return priceData;
	  }
	
	  function formatBidObject(bidRequest, valid, priceData, html, width, height) {
	    var bidObject;
	    if (valid && priceData) {
	      // valid bid response
	      bidObject = bidfactory.createBid(1, bidRequest);
	      bidObject.bidderCode = bidRequest.bidder;
	      bidObject.cpm = priceData.price;
	      bidObject.currencyCode = priceData.currency;
	      bidObject.ad = html;
	      bidObject.width = width;
	      bidObject.height = height;
	    } else {
	      // invalid bid response
	      bidObject = bidfactory.createBid(2, bidRequest);
	      bidObject.bidderCode = bidRequest.bidder;
	    }
	    return bidObject;
	  }
	
	  /**
	  * returns the top most accessible window
	  */
	  function getTopMostWindow() {
	    var res = window;
	
	    try {
	      while (top !== res) {
	        if (res.parent.location.href.length) res = res.parent;
	      }
	    } catch (e) {}
	
	    return res;
	  }
	
	  /* Create a function bound to a given object (assigning `this`, and arguments,
	   * optionally). Binding with arguments is also known as `curry`.
	   * Delegates to **ECMAScript 5**'s native `Function.bind` if available.
	   * We check for `func.bind` first, to fail fast when `func` is undefined.
	   *
	   * @param {function} func
	   * @param {optional} context
	   * @param {...any} var_args 
	   * @return {function}
	   */
	  var bind = function bind(func, context) {
	
	    return function () {
	      return func.apply(context, arguments);
	    };
	  };
	
	  return _extends(Adapter.createNew(STICKYADS_BIDDERCODE), {
	    callBids: _callBids,
	    formatBidObject: formatBidObject,
	    formatAdHTML: formatAdHTML,
	    getBiggerSize: getBiggerSize,
	    getBid: getBid,
	    getTopMostWindow: getTopMostWindow,
	    createNew: StickyAdsTVAdapter.createNew //enable alias feature (to be used for freewheel-ssp alias)
	  });
	};
	
	StickyAdsTVAdapter.createNew = function () {
	  return new StickyAdsTVAdapter();
	};
	
	module.exports = StickyAdsTVAdapter;

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(2);
	var adloader = __webpack_require__(13);
	var bidmanager = __webpack_require__(11);
	var bidfactory = __webpack_require__(10);
	
	/* TripleLift bidder factory function
	*  Use to create a TripleLiftAdapter object
	*/
	
	var TripleLiftAdapter = function TripleLiftAdapter() {
	
	  function _callBids(params) {
	    var tlReq = params.bids;
	    var bidsCount = tlReq.length;
	
	    // set expected bids count for callback execution
	    // bidmanager.setExpectedBidsCount('triplelift',bidsCount);
	
	    for (var i = 0; i < bidsCount; i++) {
	      var bidRequest = tlReq[i];
	      var callbackId = bidRequest.bidId;
	      adloader.loadScript(buildTLCall(bidRequest, callbackId));
	      // store a reference to the bidRequest from the callback id
	      // bidmanager.pbCallbackMap[callbackId] = bidRequest;
	    }
	  }
	
	  function buildTLCall(bid, callbackId) {
	    //determine tag params
	    var inventoryCode = utils.getBidIdParameter('inventoryCode', bid.params);
	    var floor = utils.getBidIdParameter('floor', bid.params);
	
	    // build our base tag, based on if we are http or https
	    var tlURI = '//tlx.3lift.com/header/auction?';
	    var tlCall = document.location.protocol + tlURI;
	
	    tlCall = utils.tryAppendQueryString(tlCall, 'callback', 'pbjs.TLCB');
	    tlCall = utils.tryAppendQueryString(tlCall, 'lib', 'prebid');
	    tlCall = utils.tryAppendQueryString(tlCall, 'v', '0.24.0-pre');
	    tlCall = utils.tryAppendQueryString(tlCall, 'callback_id', callbackId);
	    tlCall = utils.tryAppendQueryString(tlCall, 'inv_code', inventoryCode);
	    tlCall = utils.tryAppendQueryString(tlCall, 'floor', floor);
	
	    // indicate whether flash support exists
	    tlCall = utils.tryAppendQueryString(tlCall, 'fe', isFlashEnabled());
	
	    // sizes takes a bit more logic
	    var sizeQueryString = utils.parseSizesInput(bid.sizes);
	    if (sizeQueryString) {
	      tlCall += 'size=' + sizeQueryString + '&';
	    }
	
	    // append referrer
	    var referrer = utils.getTopWindowUrl();
	    tlCall = utils.tryAppendQueryString(tlCall, 'referrer', referrer);
	
	    // remove the trailing "&"
	    if (tlCall.lastIndexOf('&') === tlCall.length - 1) {
	      tlCall = tlCall.substring(0, tlCall.length - 1);
	    }
	
	    // @if NODE_ENV='debug'
	    utils.logMessage('tlCall request built: ' + tlCall);
	    // @endif
	
	    // append a timer here to track latency
	    bid.startTime = new Date().getTime();
	
	    return tlCall;
	  }
	
	  function isFlashEnabled() {
	    var hasFlash = 0;
	    try {
	      // check for Flash support in IE
	      var fo = new window.ActiveXObject('ShockwaveFlash.ShockwaveFlash');
	      if (fo) {
	        hasFlash = 1;
	      }
	    } catch (e) {
	      if (navigator.mimeTypes && navigator.mimeTypes['application/x-shockwave-flash'] !== undefined && navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {
	        hasFlash = 1;
	      }
	    }
	    return hasFlash;
	  }
	
	  // expose the callback to the global object:
	  pbjs.TLCB = function (tlResponseObj) {
	    if (tlResponseObj && tlResponseObj.callback_id) {
	      var bidObj = utils.getBidRequest(tlResponseObj.callback_id);
	      var placementCode = bidObj && bidObj.placementCode;
	
	      // @if NODE_ENV='debug'
	      if (bidObj) {
	        utils.logMessage('JSONP callback function called for inventory code: ' + bidObj.params.inventoryCode);
	      }
	      // @endif
	
	      var bid = [];
	      if (tlResponseObj && tlResponseObj.cpm && tlResponseObj.cpm !== 0) {
	
	        bid = bidfactory.createBid(1, bidObj);
	        bid.bidderCode = 'triplelift';
	        bid.cpm = tlResponseObj.cpm;
	        bid.ad = tlResponseObj.ad;
	        bid.width = tlResponseObj.width;
	        bid.height = tlResponseObj.height;
	        bid.dealId = tlResponseObj.deal_id;
	        bidmanager.addBidResponse(placementCode, bid);
	      } else {
	        // no response data
	        // @if NODE_ENV='debug'
	        if (bidObj) {
	          utils.logMessage('No prebid response from TripleLift for inventory code: ' + bidObj.params.inventoryCode);
	        }
	        // @endif
	        bid = bidfactory.createBid(2, bidObj);
	        bid.bidderCode = 'triplelift';
	        bidmanager.addBidResponse(placementCode, bid);
	      }
	    } else {
	      // no response data
	      // @if NODE_ENV='debug'
	      utils.logMessage('No prebid response for placement %%PLACEMENT%%');
	      // @endif
	    }
	  };
	
	  return {
	    callBids: _callBids
	
	  };
	};
	module.exports = TripleLiftAdapter;

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _utils = __webpack_require__(2);
	
	var CONSTANTS = __webpack_require__(3);
	var utils = __webpack_require__(2);
	var adloader = __webpack_require__(13);
	var bidmanager = __webpack_require__(11);
	var bidfactory = __webpack_require__(10);
	var Adapter = __webpack_require__(14);
	
	var TwengaAdapter;
	TwengaAdapter = function TwengaAdapter() {
	  var baseAdapter = Adapter.createNew('twenga');
	
	  baseAdapter.callBids = function (params) {
	    for (var i = 0; i < params.bids.length; i++) {
	      var bidRequest = params.bids[i];
	      var callbackId = bidRequest.bidId;
	      adloader.loadScript(buildBidCall(bidRequest, callbackId));
	    }
	  };
	
	  function buildBidCall(bid, callbackId) {
	
	    var bidUrl = '//rtb.t.c4tw.net/Bid?';
	    bidUrl = utils.tryAppendQueryString(bidUrl, 's', 'h');
	    bidUrl = utils.tryAppendQueryString(bidUrl, 'callback', 'pbjs.handleTwCB');
	    bidUrl = utils.tryAppendQueryString(bidUrl, 'callback_uid', callbackId);
	    bidUrl = utils.tryAppendQueryString(bidUrl, 'referrer', utils.getTopWindowUrl());
	    if (bid.params) {
	      for (var key in bid.params) {
	        var value = bid.params[key];
	        switch (key) {
	          case 'placementId':
	            key = 'id';break;
	          case 'siteId':
	            key = 'sid';break;
	          case 'publisherId':
	            key = 'pid';break;
	          case 'currency':
	            key = 'cur';break;
	          case 'bidFloor':
	            key = 'min';break;
	          case 'country':
	            key = 'gz';break;
	        }
	        bidUrl = utils.tryAppendQueryString(bidUrl, key, value);
	      }
	    }
	
	    var sizes = utils.parseSizesInput(bid.sizes);
	    if (sizes.length > 0) {
	      bidUrl = utils.tryAppendQueryString(bidUrl, 'size', sizes.join(','));
	    }
	
	    bidUrl += 'ta=1';
	
	    // @if NODE_ENV='debug'
	    utils.logMessage('bid request built: ' + bidUrl);
	
	    // @endif
	
	    //append a timer here to track latency
	    bid.startTime = new Date().getTime();
	
	    return bidUrl;
	  }
	
	  //expose the callback to the global object:
	  pbjs.handleTwCB = function (bidResponseObj) {
	
	    var bidCode;
	
	    if (bidResponseObj && bidResponseObj.callback_uid) {
	
	      var responseCPM;
	      var id = bidResponseObj.callback_uid;
	      var placementCode = '';
	      var bidObj = (0, _utils.getBidRequest)(id);
	      if (bidObj) {
	
	        bidCode = bidObj.bidder;
	
	        placementCode = bidObj.placementCode;
	
	        bidObj.status = CONSTANTS.STATUS.GOOD;
	      }
	
	      // @if NODE_ENV='debug'
	      utils.logMessage('JSONP callback function called for ad ID: ' + id);
	
	      // @endif
	      var bid = [];
	      if (bidResponseObj.result && bidResponseObj.result.cpm && bidResponseObj.result.cpm !== 0 && bidResponseObj.result.ad) {
	
	        var result = bidResponseObj.result;
	
	        responseCPM = parseInt(result.cpm, 10);
	
	        //CPM response from /Bid is dollar/cent multiplied by 10000
	        //in order to avoid using floats
	        //switch CPM to "dollar/cent"
	        responseCPM = responseCPM / 10000;
	
	        var ad = result.ad.replace('%%WP%%', result.cpm);
	
	        //store bid response
	        //bid status is good (indicating 1)
	        bid = bidfactory.createBid(1, bidObj);
	        bid.creative_id = result.creative_id;
	        bid.bidderCode = bidCode;
	        bid.cpm = responseCPM;
	        if (ad && (ad.lastIndexOf('http', 0) === 0 || ad.lastIndexOf('//', 0) === 0)) bid.adUrl = ad;else bid.ad = ad;
	        bid.width = result.width;
	        bid.height = result.height;
	
	        bidmanager.addBidResponse(placementCode, bid);
	      } else {
	        //no response data
	        // @if NODE_ENV='debug'
	        utils.logMessage('No prebid response from Twenga for placement code ' + placementCode);
	
	        // @endif
	        //indicate that there is no bid for this placement
	        bid = bidfactory.createBid(2, bidObj);
	        bid.bidderCode = bidCode;
	        bidmanager.addBidResponse(placementCode, bid);
	      }
	    } else {
	      //no response data
	      // @if NODE_ENV='debug'
	      utils.logMessage('No prebid response for placement %%PLACEMENT%%');
	
	      // @endif
	    }
	  };
	
	  return {
	    callBids: baseAdapter.callBids,
	    setBidderCode: baseAdapter.setBidderCode,
	    createNew: TwengaAdapter.createNew,
	    buildBidCall: buildBidCall
	  };
	};
	
	TwengaAdapter.createNew = function () {
	  return new TwengaAdapter();
	};
	
	module.exports = TwengaAdapter;

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	/**
	 * @overview Yieldbot sponsored Prebid.js adapter.
	 * @author elljoh
	 */
	var adloader = __webpack_require__(13);
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var utils = __webpack_require__(2);
	
	/**
	 * Adapter for requesting bids from Yieldbot.
	 *
	 * @returns {Object} Object containing implementation for invocation in {@link module:adaptermanger.callBids}
	 * @class
	 */
	var YieldbotAdapter = function YieldbotAdapter() {
	
	  window.ybotq = window.ybotq || [];
	
	  var ybotlib = {
	    BID_STATUS: {
	      PENDING: 0,
	      AVAILABLE: 1,
	      EMPTY: 2
	    },
	    definedSlots: [],
	    pageLevelOption: false,
	    /**
	     * Builds the Yieldbot creative tag.
	     *
	     * @param {String} slot - The slot name to bid for
	     * @param {String} size - The dimenstions of the slot
	     * @private
	     */
	    buildCreative: function buildCreative(slot, size) {
	      return '<script type="text/javascript" src="//cdn.yldbt.com/js/yieldbot.intent.js"></script>' + '<script type="text/javascript">var ybotq = ybotq || [];' + 'ybotq.push(function () {yieldbot.renderAd(\'' + slot + ':' + size + '\');});</script>';
	    },
	    /**
	     * Bid response builder.
	     *
	     * @param {Object} slotCriteria  - Yieldbot bid criteria
	     * @private
	     */
	    buildBid: function buildBid(slotCriteria) {
	      var bid = {};
	
	      if (slotCriteria && slotCriteria.ybot_ad && slotCriteria.ybot_ad !== 'n') {
	
	        bid = bidfactory.createBid(ybotlib.BID_STATUS.AVAILABLE);
	
	        bid.cpm = parseInt(slotCriteria.ybot_cpm) / 100.0 || 0; // Yieldbot CPM bids are in cents
	
	        var szArr = slotCriteria.ybot_size ? slotCriteria.ybot_size.split('x') : [0, 0];
	        var slot = slotCriteria.ybot_slot || '';
	        var sizeStr = slotCriteria.ybot_size || ''; // Creative template needs the dimensions string
	
	        bid.width = szArr[0] || 0;
	        bid.height = szArr[1] || 0;
	
	        bid.ad = ybotlib.buildCreative(slot, sizeStr);
	
	        // Add Yieldbot parameters to allow publisher bidderSettings.yieldbot specific targeting
	        for (var k in slotCriteria) {
	          bid[k] = slotCriteria[k];
	        }
	      } else {
	        bid = bidfactory.createBid(ybotlib.BID_STATUS.EMPTY);
	      }
	
	      bid.bidderCode = 'yieldbot';
	      return bid;
	    },
	    /**
	     * Yieldbot implementation of {@link module:adaptermanger.callBids}
	     * @param {Object} params - Adapter bid configuration object
	     * @private
	     */
	    callBids: function callBids(params) {
	
	      var bids = params.bids || [];
	      var ybotq = window.ybotq || [];
	
	      ybotlib.pageLevelOption = false;
	
	      ybotq.push(function () {
	        var yieldbot = window.yieldbot;
	
	        ybotlib.definedSlots = [];
	        utils._each(bids, function (v) {
	          var bid = v;
	          var psn = bid.params && bid.params.psn || 'ERROR_DEFINE_YB_PSN';
	          var slot = bid.params && bid.params.slot || 'ERROR_DEFINE_YB_SLOT';
	
	          yieldbot.pub(psn);
	          yieldbot.defineSlot(slot, { sizes: bid.sizes || [] });
	          ybotlib.definedSlots.push(bid.bidId);
	        });
	        yieldbot.enableAsync();
	        if (yieldbot._initialized !== true) {
	          yieldbot.go();
	        } else {
	          yieldbot.nextPageview();
	        }
	      });
	      ybotq.push(function () {
	        ybotlib.handleUpdateState();
	      });
	      adloader.loadScript('//cdn.yldbt.com/js/yieldbot.intent.js', null, true);
	    },
	    /**
	     * Yieldbot bid request callback handler.
	     *
	     * @see {@link YieldbotAdapter~_callBids}
	     * @private
	     */
	    handleUpdateState: function handleUpdateState() {
	      var yieldbot = window.yieldbot;
	      utils._each(ybotlib.definedSlots, function (v) {
	        var ybRequest;
	        var adapterConfig;
	
	        ybRequest = pbjs._bidsRequested.find(function (bidderRequest) {
	          return bidderRequest.bidderCode === 'yieldbot';
	        });
	
	        adapterConfig = ybRequest && ybRequest.bids ? ybRequest.bids.find(function (bid) {
	          return bid.bidId === v;
	        }) : null;
	
	        if (adapterConfig && adapterConfig.params && adapterConfig.params.slot) {
	          var placementCode = adapterConfig.placementCode || 'ERROR_YB_NO_PLACEMENT';
	          var criteria = yieldbot.getSlotCriteria(adapterConfig.params.slot);
	          var bid = ybotlib.buildBid(criteria);
	
	          bidmanager.addBidResponse(placementCode, bid);
	        }
	      });
	    }
	  };
	  return {
	    callBids: ybotlib.callBids
	  };
	};
	
	module.exports = YieldbotAdapter;

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var CONSTANTS = __webpack_require__(3);
	var utils = __webpack_require__(2);
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var adloader = __webpack_require__(13);
	
	var defaultPlacementForBadBid = null;
	
	/**
	 * Adapter for requesting bids from NginAd
	 */
	var NginAdAdapter = function NginAdAdapter() {
	
	  var rtbServerDomain = 'placeholder.for.nginad.server.com';
	
	  function _callBids(params) {
	    var nginadBids = params.bids || [];
	
	    // De-dupe by tagid then issue single bid request for all bids
	    _requestBids(_getUniqueTagids(nginadBids));
	  }
	
	  // filter bids to de-dupe them?
	  function _getUniqueTagids(bids) {
	    var key;
	    var map = {};
	    var PubZoneIds = [];
	
	    for (key in bids) {
	      map[utils.getBidIdParameter('pzoneid', bids[key].params)] = bids[key];
	    }
	
	    for (key in map) {
	      if (map.hasOwnProperty(key)) {
	        PubZoneIds.push(map[key]);
	      }
	    }
	
	    return PubZoneIds;
	  }
	
	  function getWidthAndHeight(bid) {
	
	    var adW = null;
	    var adH = null;
	
	    var sizeArrayLength = bid.sizes.length;
	    if (sizeArrayLength === 2 && typeof bid.sizes[0] === 'number' && typeof bid.sizes[1] === 'number') {
	      adW = bid.sizes[0];
	      adH = bid.sizes[1];
	    } else {
	      adW = bid.sizes[0][0];
	      adH = bid.sizes[0][1];
	    }
	
	    return [adW, adH];
	  }
	
	  function _requestBids(bidReqs) {
	    // build bid request object
	    var domain = window.location.host;
	    var page = window.location.pathname + location.search + location.hash;
	
	    var nginadImps = [];
	
	    //assign the first adUnit (placement) for bad bids;
	    defaultPlacementForBadBid = bidReqs[0].placementCode;
	
	    //build impression array for nginad
	    utils._each(bidReqs, function (bid) {
	      var tagId = utils.getBidIdParameter('pzoneid', bid.params);
	      var bidFloor = utils.getBidIdParameter('bidfloor', bid.params);
	
	      var whArr = getWidthAndHeight(bid);
	
	      var imp = {
	        id: bid.bidId,
	        banner: {
	          w: whArr[0],
	          h: whArr[1]
	        },
	        tagid: tagId,
	        bidfloor: bidFloor
	      };
	
	      nginadImps.push(imp);
	      //bidmanager.pbCallbackMap[imp.id] = bid;
	
	      rtbServerDomain = bid.params.nginadDomain;
	    });
	
	    // build bid request with impressions
	    var nginadBidReq = {
	      id: utils.getUniqueIdentifierStr(),
	      imp: nginadImps,
	      site: {
	        domain: domain,
	        page: page
	      }
	    };
	
	    var scriptUrl = window.location.protocol + '//' + rtbServerDomain + '/bid/rtb?callback=window.pbjs.nginadResponse' + '&br=' + encodeURIComponent(JSON.stringify(nginadBidReq));
	
	    adloader.loadScript(scriptUrl);
	  }
	
	  function handleErrorResponse(bidReqs, defaultPlacementForBadBid) {
	    //no response data
	    if (defaultPlacementForBadBid === null) {
	      // no id with which to create an dummy bid
	      return;
	    }
	
	    var bid = bidfactory.createBid(2);
	    bid.bidderCode = 'nginad';
	    bidmanager.addBidResponse(defaultPlacementForBadBid, bid);
	  }
	
	  //expose the callback to the global object:
	  pbjs.nginadResponse = function (nginadResponseObj) {
	    var bid = {};
	    var key;
	
	    // valid object?
	    if (!nginadResponseObj || !nginadResponseObj.id) {
	      return handleErrorResponse(nginadResponseObj, defaultPlacementForBadBid);
	    }
	
	    if (!nginadResponseObj.seatbid || nginadResponseObj.seatbid.length === 0 || !nginadResponseObj.seatbid[0].bid || nginadResponseObj.seatbid[0].bid.length === 0) {
	      return handleErrorResponse(nginadResponseObj, defaultPlacementForBadBid);
	    }
	
	    for (key in nginadResponseObj.seatbid[0].bid) {
	
	      var nginadBid = nginadResponseObj.seatbid[0].bid[key];
	
	      var responseCPM;
	      var placementCode = '';
	      var id = nginadBid.impid;
	
	      // try to fetch the bid request we sent NginAd
	      /*jshint -W083 */
	      var bidObj = pbjs._bidsRequested.find(function (bidSet) {
	        return bidSet.bidderCode === 'nginad';
	      }).bids.find(function (bid) {
	        return bid.bidId === id;
	      });
	      if (!bidObj) {
	        return handleErrorResponse(nginadBid, defaultPlacementForBadBid);
	      }
	
	      placementCode = bidObj.placementCode;
	      bidObj.status = CONSTANTS.STATUS.GOOD;
	
	      //place ad response on bidmanager._adResponsesByBidderId
	      responseCPM = parseFloat(nginadBid.price);
	
	      if (responseCPM === 0) {
	        handleErrorResponse(nginadBid, id);
	      }
	
	      nginadBid.placementCode = placementCode;
	      nginadBid.size = bidObj.sizes;
	      var responseAd = nginadBid.adm;
	
	      //store bid response
	      //bid status is good (indicating 1)
	      bid = bidfactory.createBid(1);
	      bid.creative_id = nginadBid.Id;
	      bid.bidderCode = 'nginad';
	      bid.cpm = responseCPM;
	
	      //The bid is a mock bid, the true bidding process happens after the publisher tag is called
	      bid.ad = decodeURIComponent(responseAd);
	
	      var whArr = getWidthAndHeight(bidObj);
	      bid.width = whArr[0];
	      bid.height = whArr[1];
	
	      bidmanager.addBidResponse(placementCode, bid);
	    }
	  }; // nginadResponse
	
	  return {
	    callBids: _callBids
	  };
	};
	
	module.exports = NginAdAdapter;

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var CONSTANTS = __webpack_require__(3);
	var utils = __webpack_require__(2);
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var adloader = __webpack_require__(13);
	
	/**
	 * Adapter for requesting bids from Brightcom
	 */
	var BrightcomAdapter = function BrightcomAdapter() {
	
	  // Set Brightcom Bidder URL
	  var brightcomUrl = 'hb.iselephant.com/auc/ortb';
	
	  // Define the bidder code
	  var brightcomBidderCode = 'brightcom';
	
	  // Define the callback function
	  var brightcomCallbackFunction = 'window.pbjs=window.pbjs||window.parent.pbjs||window.top.pbjs;window.pbjs.brightcomResponse';
	
	  // Manage the requested and received ad units' codes, to know which are invalid (didn't return)
	  var reqAdUnitsCode = [],
	      resAdUnitsCode = [];
	
	  function _callBids(params) {
	
	    var bidRequests = params.bids || [];
	
	    // Get page data
	    var siteDomain = window.location.host;
	    var sitePage = window.location.href;
	
	    // Prepare impressions object
	    var brightcomImps = [];
	
	    // Prepare a variable for publisher id
	    var pubId = '';
	
	    // Go through the requests and build array of impressions
	    utils._each(bidRequests, function (bid) {
	
	      // Get impression details
	      var tagId = utils.getBidIdParameter('tagId', bid.params);
	      var ref = utils.getBidIdParameter('ref', bid.params);
	      var adWidth = 0;
	      var adHeight = 0;
	
	      // If no publisher id is set, use the current
	      if (pubId === '') {
	        // Get the current publisher id (if it doesn't exist, it'll return '')
	        pubId = utils.getBidIdParameter('pubId', bid.params);
	      }
	
	      // Brightcom supports only 1 size per impression
	      // Check if the array contains 1 size or array of sizes
	      if (bid.sizes.length === 2 && typeof bid.sizes[0] === 'number' && typeof bid.sizes[1] === 'number') {
	        // The array contains 1 size (the items are the values)
	        adWidth = bid.sizes[0];
	        adHeight = bid.sizes[1];
	      } else {
	        // The array contains array of sizes, use the first size
	        adWidth = bid.sizes[0][0];
	        adHeight = bid.sizes[0][1];
	      }
	
	      // Build the impression
	      var imp = {
	        id: utils.getUniqueIdentifierStr(),
	        banner: {
	          w: adWidth,
	          h: adHeight
	        },
	        tagid: tagId
	      };
	
	      // If ref exists, create it (in the "ext" object)
	      if (ref !== '') {
	        imp.ext = {
	          refoverride: ref
	        };
	      }
	
	      // Add current impression to collection
	      brightcomImps.push(imp);
	      // Add mapping to current bid via impression id
	      //bidmanager.pbCallbackMap[imp.id] = bid;
	
	      // Add current ad unit's code to tracking
	      reqAdUnitsCode.push(bid.placementCode);
	    });
	
	    // Build the bid request
	    var brightcomBidReq = {
	      id: utils.getUniqueIdentifierStr(),
	      imp: brightcomImps,
	      site: {
	        publisher: {
	          id: pubId
	        },
	        domain: siteDomain,
	        page: sitePage
	      }
	    };
	
	    // Add timeout data, if available
	    var PREBID_TIMEOUT = PREBID_TIMEOUT || 0;
	    var curTimeout = PREBID_TIMEOUT;
	    if (curTimeout > 0) {
	      brightcomBidReq.tmax = curTimeout;
	    }
	
	    // Define the bid request call URL
	    var bidRequestCallUrl = 'https://' + brightcomUrl + '?callback=' + encodeURIComponent(brightcomCallbackFunction) + '&request=' + encodeURIComponent(JSON.stringify(brightcomBidReq));
	
	    // Add the call to get the bid
	    adloader.loadScript(bidRequestCallUrl);
	  }
	
	  //expose the callback to the global object:
	  pbjs.brightcomResponse = function (brightcomResponseObj) {
	
	    var bid = {};
	
	    // Make sure response is valid
	    if (brightcomResponseObj && brightcomResponseObj.id && brightcomResponseObj.seatbid && brightcomResponseObj.seatbid.length !== 0 && brightcomResponseObj.seatbid[0].bid && brightcomResponseObj.seatbid[0].bid.length !== 0) {
	
	      // Go through the received bids
	      brightcomResponseObj.seatbid[0].bid.forEach(function (curBid) {
	
	        // Get the bid request data
	        var bidRequest = pbjs._bidsRequested.find(function (bidSet) {
	          return bidSet.bidderCode === 'brightcom';
	        }).bids[0]; // this assumes a single request only
	
	        // Make sure the bid exists
	        if (bidRequest) {
	
	          var placementCode = bidRequest.placementCode;
	          bidRequest.status = CONSTANTS.STATUS.GOOD;
	
	          curBid.placementCode = placementCode;
	          curBid.size = bidRequest.sizes;
	
	          // Get the creative
	          var responseCreative = curBid.adm;
	          // Build the NURL element
	          var responseNurl = '<img src="' + curBid.nurl + '" width="1" height="1" style="display:none" />';
	          // Build the ad to display:
	          var responseAd = decodeURIComponent(responseCreative + responseNurl);
	
	          // Create a valid bid
	          bid = bidfactory.createBid(1);
	
	          // Set the bid data
	          bid.creative_id = curBid.Id;
	          bid.bidderCode = brightcomBidderCode;
	          bid.cpm = parseFloat(curBid.price);
	
	          // Brightcom tag is in <script> block, so use bid.ad, not bid.adurl
	          bid.ad = responseAd;
	
	          // Since Brightcom currently supports only 1 size, if multiple sizes are provided - take the first
	          var adWidth, adHeight;
	          if (bidRequest.sizes.length === 2 && typeof bidRequest.sizes[0] === 'number' && typeof bidRequest.sizes[1] === 'number') {
	            // Only one size is provided
	            adWidth = bidRequest.sizes[0];
	            adHeight = bidRequest.sizes[1];
	          } else {
	            // And array of sizes is provided. Take the first.
	            adWidth = bidRequest.sizes[0][0];
	            adHeight = bidRequest.sizes[0][1];
	          }
	
	          // Set the ad's width and height
	          bid.width = adWidth;
	          bid.height = adHeight;
	
	          // Add the bid
	          bidmanager.addBidResponse(placementCode, bid);
	
	          // Add current ad unit's code to tracking
	          resAdUnitsCode.push(placementCode);
	        }
	      });
	    }
	
	    // Define all unreceived ad unit codes as invalid (if Brightcom don't want to bid on an impression, it won't include it in the response)
	    for (var i = 0; i < reqAdUnitsCode.length; i++) {
	      var adUnitCode = reqAdUnitsCode[i];
	      // Check if current ad unit code was NOT received
	      if (resAdUnitsCode.indexOf(adUnitCode) === -1) {
	        // Current ad unit wasn't returned. Define it as invalid.
	        bid = bidfactory.createBid(2);
	        bid.bidderCode = brightcomBidderCode;
	        bidmanager.addBidResponse(adUnitCode, bid);
	      }
	    }
	  };
	
	  return {
	    callBids: _callBids
	  };
	};
	
	module.exports = BrightcomAdapter;

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var bidfactory = __webpack_require__(10),
	    bidmanager = __webpack_require__(11),
	    utils = __webpack_require__(2),
	    adloader = __webpack_require__(13);
	
	var WideOrbitAdapter = function WideOrbitAdapter() {
	  var pageImpression = 'JSAdservingMP.ashx?pc={pc}&pbId={pbId}&clk=&exm=&jsv=1.0&tsv=1.0&cts={cts}&arp=0&fl=0&vitp=&vit=&jscb=window.pbjs.handleWideOrbitCallback&url={referrer}&fp=&oid=&exr=&mraid=&apid=&apbndl=&mpp=0&uid=&cb={cb}&hb=1',
	      pageRepeatCommonParam = '&gid{o}={gid}&pp{o}=&clk{o}=&rpos{o}={rpos}&ecpm{o}={ecpm}&ntv{o}=&ntl{o}=&adsid{o}=',
	      pageRepeatParamId = '&pId{o}={pId}&rank{o}={rank}',
	      pageRepeatParamNamed = '&wsName{o}={wsName}&wName{o}={wName}&rank{o}={rank}&bfDim{o}={width}x{height}&subp{o}={subp}',
	      base = window.location.protocol + '//p{pbId}.atemda.com/',
	      bids,
	      adapterName = 'wideorbit';
	
	  function _fixParamNames(param) {
	    if (!param) {
	      return;
	    }
	
	    var properties = ['site', 'page', 'width', 'height', 'rank', 'subPublisher', 'ecpm', 'atf', 'pId', 'pbId', 'referrer'],
	        prop;
	
	    utils._each(properties, function (correctName) {
	      for (prop in param) {
	        if (param.hasOwnProperty(prop) && prop.toLowerCase() === correctName.toLowerCase()) {
	          param[correctName] = param[prop];
	          break;
	        }
	      }
	    });
	  }
	
	  function _setParam(str, param, value) {
	    var pattern = new RegExp('{' + param + '}', 'g');
	
	    if (value === true) {
	      value = 1;
	    }
	    if (value === false) {
	      value = 0;
	    }
	    return str.replace(pattern, value);
	  }
	
	  function _setParams(str, keyValuePairs) {
	    utils._each(keyValuePairs, function (keyValuePair) {
	      str = _setParam(str, keyValuePair[0], keyValuePair[1]);
	    });
	    return str;
	  }
	
	  function _setCommonParams(pos, params) {
	    return _setParams(pageRepeatCommonParam, [['o', pos], ['gid', encodeURIComponent(params.tagId)], ['rpos', params.atf ? 1001 : 0], ['ecpm', params.ecpm || '']]);
	  }
	
	  function _getRankParam(rank, pos) {
	    return rank || pos;
	  }
	
	  function _setupIdPlacementParameters(pos, params) {
	    return _setParams(pageRepeatParamId, [['o', pos], ['pId', params.pId], ['rank', _getRankParam(params.rank, pos)]]);
	  }
	
	  function _setupNamedPlacementParameters(pos, params) {
	    return _setParams(pageRepeatParamNamed, [['o', pos], ['wsName', encodeURIComponent(decodeURIComponent(params.site))], ['wName', encodeURIComponent(decodeURIComponent(params.page))], ['width', params.width], ['height', params.height], ['subp', params.subPublisher ? encodeURIComponent(decodeURIComponent(params.subPublisher)) : ''], ['rank', _getRankParam(params.rank, pos)]]);
	  }
	
	  function _setupAdCall(publisherId, placementCount, placementsComponent, referrer) {
	    return _setParams(base + pageImpression, [['pbId', publisherId], ['pc', placementCount], ['cts', new Date().getTime()], ['cb', Math.floor(Math.random() * 100000000)], ['referrer', encodeURIComponent(referrer || '')]]) + placementsComponent;
	  }
	
	  function _setupPlacementParameters(pos, params) {
	    var commonParams = _setCommonParams(pos, params);
	
	    if (params.pId) {
	      return _setupIdPlacementParameters(pos, params) + commonParams;
	    }
	
	    return _setupNamedPlacementParameters(pos, params) + commonParams;
	  }
	
	  function _callBids(params) {
	    var publisherId,
	        bidUrl = '',
	        i,
	        referrer;
	
	    bids = params.bids || [];
	
	    for (i = 0; i < bids.length; i++) {
	      var requestParams = bids[i].params;
	
	      requestParams.tagId = bids[i].placementCode;
	
	      _fixParamNames(requestParams);
	
	      publisherId = requestParams.pbId;
	      referrer = referrer || requestParams.referrer;
	      bidUrl += _setupPlacementParameters(i, requestParams);
	    }
	
	    bidUrl = _setupAdCall(publisherId, bids.length, bidUrl, referrer);
	
	    utils.logMessage('Calling WO: ' + bidUrl);
	
	    adloader.loadScript(bidUrl);
	  }
	
	  function _processUserMatchings(userMatchings) {
	    var headElem = document.getElementsByTagName('head')[0],
	        createdElem;
	
	    utils._each(userMatchings, function (userMatching) {
	      createdElem = undefined;
	      switch (userMatching.Type) {
	        case 'redirect':
	          createdElem = document.createElement('img');
	          break;
	        case 'iframe':
	          createdElem = utils.createInvisibleIframe();
	          break;
	        case 'js':
	          createdElem = document.createElement('script');
	          createdElem.type = 'text/javascript';
	          createdElem.async = true;
	          break;
	      }
	      if (createdElem) {
	        createdElem.src = decodeURIComponent(userMatching.Url);
	        headElem.insertBefore(createdElem, headElem.firstChild);
	      }
	    });
	  }
	
	  function _getBidResponse(id, placements) {
	    var i;
	
	    for (i = 0; i < placements.length; i++) {
	      if (placements[i].ExtPlacementId === id) {
	        return placements[i];
	      }
	    }
	  }
	
	  function _isUrl(scr) {
	    return scr.slice(0, 6) === "http:/" || scr.slice(0, 7) === "https:/" || scr.slice(0, 2) === "//";
	  }
	
	  function _buildAdCode(placement) {
	    var adCode = placement.Source,
	        pixelTag;
	
	    utils._each(placement.TrackingCodes, function (trackingCode) {
	      if (_isUrl(trackingCode)) {
	        pixelTag = '<img src="' + trackingCode + '" width="0" height="0" style="position:absolute"></img>';
	      } else {
	        pixelTag = trackingCode;
	      }
	      adCode = pixelTag + adCode;
	    });
	
	    return adCode;
	  }
	
	  window.pbjs = window.pbjs || {};
	  window.pbjs.handleWideOrbitCallback = function (response) {
	    var bidResponse, bidObject;
	
	    utils.logMessage('WO response. Placements: ' + response.Placements.length);
	
	    _processUserMatchings(response.UserMatchings);
	
	    utils._each(bids, function (bid) {
	      bidResponse = _getBidResponse(bid.placementCode, response.Placements);
	
	      if (bidResponse && bidResponse.Type === 'DirectHTML') {
	        bidObject = bidfactory.createBid(1);
	        bidObject.cpm = bidResponse.Bid;
	        bidObject.ad = _buildAdCode(bidResponse);
	        bidObject.width = bidResponse.Width;
	        bidObject.height = bidResponse.Height;
	      } else {
	        bidObject = bidfactory.createBid(2);
	      }
	
	      bidObject.bidderCode = adapterName;
	      bidmanager.addBidResponse(bid.placementCode, bidObject);
	    });
	  };
	
	  return {
	    callBids: _callBids
	  };
	};
	
	module.exports = WideOrbitAdapter;

/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var adloader = __webpack_require__(13);
	var utils = __webpack_require__(2);
	
	var JCMAdapter = function JCMAdapter() {
	
	  window.pbjs = window.pbjs || {};
	  window.pbjs.processJCMResponse = function (JCMResponse) {
	    if (JCMResponse) {
	      var JCMRespObj = JSON.parse(JCMResponse);
	      if (JCMRespObj) {
	        var bids = JCMRespObj.bids;
	        for (var i = 0; i < bids.length; i++) {
	          var bid = bids[i];
	          var bidObject;
	          if (bid.cpm > 0) {
	            bidObject = bidfactory.createBid(1);
	            bidObject.bidderCode = 'jcm';
	            bidObject.cpm = bid.cpm;
	            bidObject.ad = decodeURIComponent(bid.ad.replace(/\+/g, '%20'));
	            bidObject.width = bid.width;
	            bidObject.height = bid.height;
	            bidmanager.addBidResponse(utils.getBidRequest(bid.callbackId).placementCode, bidObject);
	          } else {
	            bidObject = bidfactory.createBid(2);
	            bidObject.bidderCode = 'jcm';
	            bidmanager.addBidResponse(utils.getBidRequest(bid.callbackId).placementCode, bidObject);
	          }
	        }
	      }
	    }
	  };
	
	  function _callBids(params) {
	
	    var BidRequest = {
	      bids: []
	    };
	
	    for (var i = 0; i < params.bids.length; i++) {
	
	      var adSizes = "";
	      var bid = params.bids[i];
	      for (var x = 0; x < bid.sizes.length; x++) {
	        adSizes += utils.parseGPTSingleSizeArray(bid.sizes[x]);
	        if (x !== bid.sizes.length - 1) {
	          adSizes += ',';
	        }
	      }
	
	      BidRequest.bids.push({
	        "callbackId": bid.bidId,
	        "siteId": bid.params.siteId,
	        "adSizes": adSizes
	      });
	    }
	
	    var JSONStr = JSON.stringify(BidRequest);
	    var reqURL = document.location.protocol + "//media.adfrontiers.com/pq?t=hb&bids=" + encodeURIComponent(JSONStr);
	    adloader.loadScript(reqURL);
	  }
	
	  return {
	    callBids: _callBids
	  };
	};
	
	module.exports = JCMAdapter;

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var adloader = __webpack_require__(13);
	var utils = __webpack_require__(2);
	
	var UnderdogMediaAdapter = function UnderdogMediaAdapter() {
	
	  var UDM_ADAPTER_VERSION = '1.0.0';
	  var getJsStaticUrl = window.location.protocol + '//udmserve.net/udm/img.fetch?tid=1;dt=9;callback=pbjs.handleUnderdogMediaCB;';
	  var bidParams = {};
	
	  function _callBids(params) {
	    bidParams = params;
	    var sizes = [];
	    var siteId = 0;
	
	    bidParams.bids.forEach(function (bidParam) {
	      sizes = utils.flatten(sizes, utils.parseSizesInput(bidParam.sizes));
	      siteId = bidParam.params.siteId;
	    });
	    adloader.loadScript(getJsStaticUrl + "sid=" + siteId + ";sizes=" + sizes.join(","), null, false);
	  }
	
	  function _callback(response) {
	
	    var mids = response.mids;
	    bidParams.bids.forEach(function (bidParam) {
	
	      var filled = false;
	      mids.forEach(function (mid) {
	
	        if (mid.useCount > 0) {
	          return;
	        }
	        if (!mid.useCount) {
	          mid.useCount = 0;
	        }
	        var size_not_found = true;
	        utils.parseSizesInput(bidParam.sizes).forEach(function (size) {
	          if (size === mid.width + 'x' + mid.height) {
	            size_not_found = false;
	          }
	        });
	        if (size_not_found) {
	          return;
	        }
	
	        var bid = bidfactory.createBid(1, bidParam);
	        bid.bidderCode = bidParam.bidder;
	        bid.width = mid.width;
	        bid.height = mid.height;
	
	        bid.cpm = parseFloat(mid.cpm);
	        if (bid.cpm <= 0) {
	          return;
	        }
	        mid.useCount++;
	        bid.ad = mid.ad_code_html;
	        bid.ad = _makeNotification(bid, mid, bidParam) + bid.ad;
	        if (!(bid.ad || bid.adUrl)) {
	          return;
	        }
	        bidmanager.addBidResponse(bidParam.placementCode, bid);
	        filled = true;
	      });
	      if (!filled) {
	        var nobid = bidfactory.createBid(2, bidParam);
	        nobid.bidderCode = bidParam.bidder;
	        bidmanager.addBidResponse(bidParam.placementCode, nobid);
	      }
	    });
	  }
	
	  pbjs.handleUnderdogMediaCB = _callback;
	
	  function _makeNotification(bid, mid, bidParam) {
	
	    var url = mid.notification_url;
	
	    url += UDM_ADAPTER_VERSION;
	    url += ";cb=" + Math.random();
	    url += ";qqq=" + 1 / bid.cpm;
	    url += ";hbt=" + pbjs.bidderTimeout;
	    url += ';style=adapter';
	    url += ';vis=' + encodeURIComponent(document.visibilityState);
	
	    url += ';traffic_info=' + encodeURIComponent(JSON.stringify(_getUrlVars()));
	    if (bidParam.params.subId) {
	      url += ';subid=' + encodeURIComponent(bidParam.params.subId);
	    }
	    return "<script async src=\"" + url + "\"></script>";
	  }
	
	  function _getUrlVars() {
	    var vars = {};
	    var hash;
	    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	    for (var i = 0; i < hashes.length; i++) {
	      hash = hashes[i].split('=');
	      if (!hash[0].match(/^utm/)) {
	        continue;
	      }
	      vars[hash[0]] = hash[1].substr(0, 150);
	    }
	    return vars;
	  }
	
	  return {
	    callBids: _callBids
	  };
	};
	
	module.exports = UnderdogMediaAdapter;

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var CONSTANTS = __webpack_require__(3);
	var utils = __webpack_require__(2);
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var adloader = __webpack_require__(13);
	
	var defaultPlacementForBadBid = null;
	var bidderName = 'memeglobal';
	/**
	 * Adapter for requesting bids from Meme Global Media Group
	 * OpenRTB compatible
	 */
	var MemeGlobalAdapter = function MemeGlobalAdapter() {
	  var bidder = 'stinger.memeglobal.com/api/v1/services/prebid';
	
	  function _callBids(params) {
	    var bids = params.bids;
	
	    if (!bids) return;
	
	    // assign the first adUnit (placement) for bad bids;
	    defaultPlacementForBadBid = bids[0].placementCode;
	
	    for (var i = 0; i < bids.length; i++) {
	      _requestBid(bids[i]);
	    }
	  }
	
	  function _requestBid(bidReq) {
	    // build bid request object
	    var domain = window.location.host;
	    var page = window.location.host + window.location.pathname + location.search + location.hash;
	
	    var tagId = utils.getBidIdParameter('tagid', bidReq.params);
	    var bidFloor = Number(utils.getBidIdParameter('bidfloor', bidReq.params));
	    var adW = 0;
	    var adH = 0;
	
	    var bidSizes = Array.isArray(bidReq.params.sizes) ? bidReq.params.sizes : bidReq.sizes;
	    var sizeArrayLength = bidSizes.length;
	    if (sizeArrayLength === 2 && typeof bidSizes[0] === 'number' && typeof bidSizes[1] === 'number') {
	      adW = bidSizes[0];
	      adH = bidSizes[1];
	    } else {
	      adW = bidSizes[0][0];
	      adH = bidSizes[0][1];
	    }
	
	    // build bid request with impressions
	    var bidRequest = {
	      id: utils.getUniqueIdentifierStr(),
	      imp: [{
	        id: bidReq.bidId,
	        banner: {
	          w: adW,
	          h: adH
	        },
	        tagid: bidReq.placementCode,
	        bidfloor: bidFloor
	      }],
	      site: {
	        domain: domain,
	        page: page,
	        publisher: {
	          id: tagId
	        }
	      }
	    };
	
	    var scriptUrl = '//' + bidder + '?callback=window.pbjs.mgres' + '&src=' + CONSTANTS.REPO_AND_VERSION + '&br=' + encodeURIComponent(JSON.stringify(bidRequest));
	    adloader.loadScript(scriptUrl);
	  }
	
	  function getBidSetForBidder() {
	    return pbjs._bidsRequested.find(function (bidSet) {
	      return bidSet.bidderCode === bidderName;
	    });
	  }
	
	  // expose the callback to the global object:
	  pbjs.mgres = function (bidResp) {
	
	    // valid object?
	    if (!bidResp || !bidResp.id || !bidResp.seatbid || bidResp.seatbid.length === 0 || !bidResp.seatbid[0].bid || bidResp.seatbid[0].bid.length === 0) {
	      return;
	    }
	
	    bidResp.seatbid[0].bid.forEach(function (bidderBid) {
	      var responseCPM;
	      var placementCode = '';
	
	      var bidSet = getBidSetForBidder();
	      var bidRequested = bidSet.bids.find(function (b) {
	        return b.bidId === bidderBid.impid;
	      });
	      if (bidRequested) {
	        var bidResponse = bidfactory.createBid(1);
	        placementCode = bidRequested.placementCode;
	        bidRequested.status = CONSTANTS.STATUS.GOOD;
	        responseCPM = parseFloat(bidderBid.price);
	        if (responseCPM === 0) {
	          var bid = bidfactory.createBid(2);
	          bid.bidderCode = bidderName;
	          bidmanager.addBidResponse(placementCode, bid);
	          return;
	        }
	        bidResponse.placementCode = placementCode;
	        bidResponse.size = bidRequested.sizes;
	        var responseAd = bidderBid.adm;
	        var responseNurl = '<img src="' + bidderBid.nurl + '" height="0px" width="0px" style="display: none;">';
	        bidResponse.creative_id = bidderBid.id;
	        bidResponse.bidderCode = bidderName;
	        bidResponse.cpm = responseCPM;
	        bidResponse.ad = decodeURIComponent(responseAd + responseNurl);
	        bidResponse.width = parseInt(bidderBid.w);
	        bidResponse.height = parseInt(bidderBid.h);
	        bidmanager.addBidResponse(placementCode, bidResponse);
	      }
	    });
	  };
	
	  return {
	    callBids: _callBids
	  };
	};
	
	module.exports = MemeGlobalAdapter;

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var adloader = __webpack_require__(13);
	
	var CriteoAdapter = function CriteoAdapter() {
	
	  var _publisherTagUrl = window.location.protocol + '//static.criteo.net/js/ld/publishertag.js';
	  var _bidderCode = 'criteo';
	  var _profileId = 125;
	
	  function _callBids(params) {
	    if (!window.criteo_pubtag || window.criteo_pubtag instanceof Array) {
	      // publisherTag not loaded yet
	
	      _pushBidRequestEvent(params);
	      adloader.loadScript(_publisherTagUrl, function () {}, true);
	    } else {
	      // publisherTag already loaded
	      _pushBidRequestEvent(params);
	    }
	  }
	
	  // send bid request to criteo direct bidder handler
	  function _pushBidRequestEvent(params) {
	
	    // if we want to be fully asynchronous, we must first check window.criteo_pubtag in case publishertag.js is not loaded yet.
	    window.Criteo = window.Criteo || {};
	    window.Criteo.events = window.Criteo.events || [];
	
	    // generate the bidding event
	    var biddingEventFunc = function biddingEventFunc() {
	
	      var bids = params.bids || [];
	
	      var slots = [];
	
	      var isAudit = false;
	
	      // build slots before sending one multi-slots bid request
	      for (var i = 0; i < bids.length; i++) {
	        var bid = bids[i];
	        slots.push(new Criteo.PubTag.DirectBidding.DirectBiddingSlot(bid.placementCode, bid.params.zoneId, undefined, bid.transactionId));
	
	        isAudit |= bid.params.audit !== undefined;
	      }
	
	      var biddingEvent = new Criteo.PubTag.DirectBidding.DirectBiddingEvent(_profileId, new Criteo.PubTag.DirectBidding.DirectBiddingUrlBuilder(isAudit), slots, _callbackSuccess(slots), _callbackError(slots), _callbackError(slots) // timeout handled as error
	      );
	
	      // process the event as soon as possible
	      window.criteo_pubtag.push(biddingEvent);
	    };
	
	    window.Criteo.events.push(biddingEventFunc);
	  }
	
	  function parseBidResponse(bidsResponse) {
	    try {
	      return JSON.parse(bidsResponse);
	    } catch (error) {
	      return {};
	    }
	  }
	
	  function isNoBidResponse(jsonbidsResponse) {
	    return jsonbidsResponse.slots === undefined;
	  }
	
	  function _callbackSuccess(slots) {
	    return function (bidsResponse) {
	      var jsonbidsResponse = parseBidResponse(bidsResponse);
	
	      if (isNoBidResponse(jsonbidsResponse)) return _callbackError(slots)();
	
	      for (var i = 0; i < slots.length; i++) {
	        var bidResponse = null;
	
	        // look for the matching bid response
	        for (var j = 0; j < jsonbidsResponse.slots.length; j++) {
	          if (jsonbidsResponse.slots[j] && jsonbidsResponse.slots[j].impid === slots[i].impId) {
	            bidResponse = jsonbidsResponse.slots.splice(j, 1)[0];
	            break;
	          }
	        }
	
	        // register the bid response
	        var bidObject;
	        if (bidResponse) {
	          bidObject = bidfactory.createBid(1);
	          bidObject.bidderCode = _bidderCode;
	          bidObject.cpm = bidResponse.cpm;
	          bidObject.ad = bidResponse.creative;
	          bidObject.width = bidResponse.width;
	          bidObject.height = bidResponse.height;
	        } else {
	          bidObject = _invalidBidResponse();
	        }
	        bidmanager.addBidResponse(slots[i].impId, bidObject);
	      }
	    };
	  }
	
	  function _callbackError(slots) {
	    return function () {
	      for (var i = 0; i < slots.length; i++) {
	        bidmanager.addBidResponse(slots[i].impId, _invalidBidResponse());
	      }
	    };
	  }
	
	  function _invalidBidResponse() {
	    var bidObject = bidfactory.createBid(2);
	    bidObject.bidderCode = _bidderCode;
	    return bidObject;
	  }
	
	  return {
	    callBids: _callBids
	  };
	};
	
	module.exports = CriteoAdapter;

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(2);
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var adloader = __webpack_require__(13);
	
	var CentroAdapter = function CentroAdapter() {
	  var baseUrl = '//t.brand-server.com/hb',
	      devUrl = '//staging.brand-server.com/hb',
	      bidderCode = 'centro',
	      handlerPrefix = 'adCentroHandler_',
	      LOG_ERROR_MESS = {
	    noUnit: 'Bid has no unit',
	    noAdTag: 'Bid has missmatch format.',
	    noBid: 'Response has no bid.',
	    anotherCode: 'Bid has another bidderCode - ',
	    undefBid: 'Bid is undefined',
	    unitNum: 'Requested unit is '
	  };
	
	  function _makeHandler(handlerName, unit, placementCode) {
	    return function (response) {
	      try {
	        delete window[handlerName];
	      } catch (err) {
	        //catching for old IE
	        window[handlerName] = undefined;
	      }
	      _responseProcessing(response, unit, placementCode);
	    };
	  }
	
	  function _sendBidRequest(bid) {
	    var placementCode = bid.placementCode,
	        size = bid.sizes && bid.sizes[0];
	
	    bid = bid.params;
	    if (!bid.unit) {
	      //throw exception, or call utils.logError
	      utils.logError(LOG_ERROR_MESS.noUnit, bidderCode);
	      return;
	    }
	    var query = ['s=' + bid.unit, 'adapter=prebid']; //,'url=www.abc15.com','sz=320x50'];
	    var isDev = bid.unit.toString() === '28136';
	
	    query.push('url=' + encodeURIComponent(bid.page_url || location.href));
	    //check size format
	    if (size instanceof Array && size.length === 2 && typeof size[0] === 'number' && typeof size[1] === 'number') {
	      query.push('sz=' + size.join('x'));
	    }
	    //make handler name for JSONP request
	    var handlerName = handlerPrefix + bid.unit + size.join('x') + encodeURIComponent(placementCode);
	    query.push('callback=' + encodeURIComponent('window["' + handlerName + '"]'));
	
	    //maybe is needed add some random parameter to disable cache
	    //query.push('r='+Math.round(Math.random() * 1e5));
	
	    window[handlerName] = _makeHandler(handlerName, bid.unit, placementCode);
	
	    adloader.loadScript((document.location.protocol === 'https:' ? 'https:' : 'http:') + (isDev ? devUrl : baseUrl) + '?' + query.join('&'));
	  }
	
	  /*
	   "sectionID": 7302,
	   "height": 250,
	   "width": 300,
	   "value": 3.2,
	   "adTag":''
	   */
	  function _responseProcessing(resp, unit, placementCode) {
	    var bidObject;
	    var bid = resp && resp.bid || resp;
	
	    if (bid && bid.adTag && bid.sectionID && bid.sectionID.toString() === unit.toString()) {
	      bidObject = bidfactory.createBid(1);
	      bidObject.cpm = bid.value;
	      bidObject.ad = bid.adTag;
	      bidObject.width = bid.width;
	      bidObject.height = bid.height;
	    } else {
	      //throw exception, or call utils.logError with resp.statusMessage
	      utils.logError(LOG_ERROR_MESS.unitNum + unit + '. ' + (bid ? bid.statusMessage || LOG_ERROR_MESS.noAdTag : LOG_ERROR_MESS.noBid), bidderCode);
	      bidObject = bidfactory.createBid(2);
	    }
	    bidObject.bidderCode = bidderCode;
	    bidmanager.addBidResponse(placementCode, bidObject);
	  }
	
	  /*
	   {
	   bidderCode: "centro",
	   bids: [
	   {
	   unit:  '3242432',
	   page_url: "http://",
	   size: [300, 250]
	   */
	  function _callBids(params) {
	    var bid,
	        bids = params.bids || [];
	    for (var i = 0; i < bids.length; i++) {
	      bid = bids[i];
	      if (bid && bid.bidder === bidderCode) {
	        _sendBidRequest(bid);
	      }
	    }
	  }
	
	  return {
	    callBids: _callBids
	  };
	};
	
	module.exports = CentroAdapter;

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _utils = __webpack_require__(2);
	
	var CONSTANTS = __webpack_require__(3);
	var utils = __webpack_require__(2);
	var adloader = __webpack_require__(13);
	var bidmanager = __webpack_require__(11);
	var bidfactory = __webpack_require__(10);
	
	var XhbAdapter = function XhbAdapter() {
	
	  var _defaultBidderSettings = {
	    alwaysUseBid: true,
	    adserverTargeting: [{
	      key: 'hb_xhb_deal',
	      val: function val(bidResponse) {
	        return bidResponse.dealId;
	      }
	    }, {
	      key: 'hb_xhb_adid',
	      val: function val(bidResponse) {
	        return bidResponse.adId;
	      }
	    }]
	  };
	  bidmanager.registerDefaultBidderSetting('xhb', _defaultBidderSettings);
	
	  function buildJPTCall(bid, callbackId) {
	    //determine tag params
	    var placementId = utils.getBidIdParameter('placementId', bid.params);
	    var inventoryCode = utils.getBidIdParameter('invCode', bid.params);
	    var referrer = utils.getBidIdParameter('referrer', bid.params);
	    var altReferrer = utils.getBidIdParameter('alt_referrer', bid.params);
	
	    //Always use https
	    var jptCall = 'https://ib.adnxs.com/jpt?';
	
	    jptCall = utils.tryAppendQueryString(jptCall, 'callback', 'pbjs.handleXhbCB');
	    jptCall = utils.tryAppendQueryString(jptCall, 'callback_uid', callbackId);
	    jptCall = utils.tryAppendQueryString(jptCall, 'id', placementId);
	    jptCall = utils.tryAppendQueryString(jptCall, 'code', inventoryCode);
	
	    //sizes takes a bit more logic
	    var sizeQueryString = '';
	    var parsedSizes = utils.parseSizesInput(bid.sizes);
	
	    //combine string into proper querystring for impbus
	    var parsedSizesLength = parsedSizes.length;
	    if (parsedSizesLength > 0) {
	      //first value should be "size"
	      sizeQueryString = 'size=' + parsedSizes[0];
	      if (parsedSizesLength > 1) {
	        //any subsequent values should be "promo_sizes"
	        sizeQueryString += '&promo_sizes=';
	        for (var j = 1; j < parsedSizesLength; j++) {
	          sizeQueryString += parsedSizes[j] += ',';
	        }
	        //remove trailing comma
	        if (sizeQueryString && sizeQueryString.charAt(sizeQueryString.length - 1) === ',') {
	          sizeQueryString = sizeQueryString.slice(0, sizeQueryString.length - 1);
	        }
	      }
	    }
	
	    if (sizeQueryString) {
	      jptCall += sizeQueryString + '&';
	    }
	
	    //append custom attributes:
	    var paramsCopy = _extends({}, bid.params);
	
	    //delete attributes already used
	    delete paramsCopy.placementId;
	    delete paramsCopy.invCode;
	    delete paramsCopy.query;
	    delete paramsCopy.referrer;
	    delete paramsCopy.alt_referrer;
	
	    //get the reminder
	    var queryParams = utils.parseQueryStringParameters(paramsCopy);
	
	    //append
	    if (queryParams) {
	      jptCall += queryParams;
	    }
	
	    //append referrer
	    if (referrer === '') {
	      referrer = utils.getTopWindowUrl();
	    }
	
	    jptCall = utils.tryAppendQueryString(jptCall, 'referrer', referrer);
	    jptCall = utils.tryAppendQueryString(jptCall, 'alt_referrer', altReferrer);
	
	    //remove the trailing "&"
	    if (jptCall.lastIndexOf('&') === jptCall.length - 1) {
	      jptCall = jptCall.substring(0, jptCall.length - 1);
	    }
	
	    return jptCall;
	  }
	
	  //expose the callback to the global object:
	  pbjs.handleXhbCB = function (jptResponseObj) {
	    var bidCode = void 0;
	
	    if (jptResponseObj && jptResponseObj.callback_uid) {
	
	      var responseCPM = void 0;
	      var id = jptResponseObj.callback_uid;
	      var placementCode = '';
	      var bidObj = (0, _utils.getBidRequest)(id);
	      if (bidObj) {
	        bidCode = bidObj.bidder;
	        placementCode = bidObj.placementCode;
	        //set the status
	        bidObj.status = CONSTANTS.STATUS.GOOD;
	      }
	
	      var bid = [];
	      if (jptResponseObj.result && jptResponseObj.result.ad && jptResponseObj.result.ad !== '') {
	        responseCPM = 0.00;
	
	        //store bid response
	        //bid status is good (indicating 1)
	        var adId = jptResponseObj.result.creative_id;
	        bid = bidfactory.createBid(CONSTANTS.STATUS.GOOD, bidObj);
	        bid.creative_id = adId;
	        bid.bidderCode = bidCode;
	        bid.cpm = responseCPM;
	        bid.adUrl = jptResponseObj.result.ad;
	        bid.width = jptResponseObj.result.width;
	        bid.height = jptResponseObj.result.height;
	        bid.dealId = '99999999';
	
	        bidmanager.addBidResponse(placementCode, bid);
	      } else {
	        //no response data
	        //indicate that there is no bid for this placement
	        bid = bidfactory.createBid(2);
	        bid.bidderCode = bidCode;
	        bidmanager.addBidResponse(placementCode, bid);
	      }
	    }
	  };
	
	  function _callBids(params) {
	    var bids = params.bids || [];
	    for (var i = 0; i < bids.length; i++) {
	      var bid = bids[i];
	      var callbackId = bid.bidId;
	      adloader.loadScript(buildJPTCall(bid, callbackId));
	    }
	  }
	
	  // Export the callBids function, so that prebid.js can execute
	  // this function when the page asks to send out bid requests.
	  return {
	    callBids: _callBids
	  };
	};
	
	module.exports = XhbAdapter;

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(2);
	var bidmanager = __webpack_require__(11);
	var bidfactory = __webpack_require__(10);
	var ajax = __webpack_require__(21).ajax;
	
	var STR_BIDDER_CODE = "sharethrough";
	var STR_VERSION = "1.2.0";
	
	var SharethroughAdapter = function SharethroughAdapter() {
	
	  var str = {};
	  str.STR_BTLR_HOST = document.location.protocol + "//btlr.sharethrough.com";
	  str.STR_BEACON_HOST = document.location.protocol + "//b.sharethrough.com/butler?";
	  str.placementCodeSet = {};
	  str.ajax = ajax;
	
	  function _callBids(params) {
	    var bids = params.bids;
	
	    // cycle through bids
	    for (var i = 0; i < bids.length; i += 1) {
	      var bidRequest = bids[i];
	      str.placementCodeSet[bidRequest.placementCode] = bidRequest;
	      var scriptUrl = _buildSharethroughCall(bidRequest);
	      str.ajax(scriptUrl, _createCallback(bidRequest), undefined, { withCredentials: true });
	    }
	  }
	
	  function _createCallback(bidRequest) {
	    return function (bidResponse) {
	      _strcallback(bidRequest, bidResponse);
	    };
	  }
	
	  function _buildSharethroughCall(bid) {
	    var pkey = utils.getBidIdParameter('pkey', bid.params);
	
	    var host = str.STR_BTLR_HOST;
	
	    var url = host + "/header-bid/v1?";
	    url = utils.tryAppendQueryString(url, 'bidId', bid.bidId);
	    url = utils.tryAppendQueryString(url, 'placement_key', pkey);
	    url = appendEnvFields(url);
	
	    return url;
	  }
	
	  function _strcallback(bidObj, bidResponse) {
	    try {
	      bidResponse = JSON.parse(bidResponse);
	      var bidId = bidResponse.bidId;
	      var bid = bidfactory.createBid(1, bidObj);
	      bid.bidderCode = STR_BIDDER_CODE;
	      bid.cpm = bidResponse.creatives[0].cpm;
	      var size = bidObj.sizes[0];
	      bid.width = size[0];
	      bid.height = size[1];
	      bid.adserverRequestId = bidResponse.adserverRequestId;
	      str.placementCodeSet[bidObj.placementCode].adserverRequestId = bidResponse.adserverRequestId;
	
	      bid.pkey = utils.getBidIdParameter('pkey', bidObj.params);
	
	      var windowLocation = 'str_response_' + bidId;
	      var bidJsonString = JSON.stringify(bidResponse);
	      bid.ad = '<div data-str-native-key="' + bid.pkey + '" data-stx-response-name=\'' + windowLocation + '\'>\n                </div>\n                <script>var ' + windowLocation + ' = ' + bidJsonString + '</script>\n                <script src="//native.sharethrough.com/assets/sfp-set-targeting.js"></script>\n                <script type=\'text/javascript\'>\n                (function() {\n                    var sfp_js = document.createElement(\'script\');\n                    sfp_js.src = "//native.sharethrough.com/assets/sfp.js";\n                    sfp_js.type = \'text/javascript\';\n                    sfp_js.charset = \'utf-8\';\n                    try {\n                        window.top.document.getElementsByTagName(\'body\')[0].appendChild(sfp_js);\n                    } catch (e) {\n                      console.log(e);\n                    }\n                })();\n                </script>';
	      bidmanager.addBidResponse(bidObj.placementCode, bid);
	    } catch (e) {
	      _handleInvalidBid(bidObj);
	    }
	  }
	
	  function _handleInvalidBid(bidObj) {
	    var bid = bidfactory.createBid(2, bidObj);
	    bidmanager.addBidResponse(bidObj.placementCode, bid);
	  }
	
	  function appendEnvFields(url) {
	    url = utils.tryAppendQueryString(url, 'hbVersion', '0.24.0-pre');
	    url = utils.tryAppendQueryString(url, 'strVersion', STR_VERSION);
	    url = utils.tryAppendQueryString(url, 'hbSource', 'prebid');
	
	    return url;
	  }
	
	  return {
	    callBids: _callBids,
	    str: str
	  };
	};
	
	module.exports = SharethroughAdapter;

/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var CONSTANTS = __webpack_require__(3);
	var utils = __webpack_require__(2);
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var adloader = __webpack_require__(13);
	
	var RoxotAdapter = function RoxotAdapter() {
	  var roxotUrl = "r.rxthdr.com";
	
	  pbjs.roxotResponseHandler = roxotResponseHandler;
	
	  return {
	    callBids: _callBids
	  };
	
	  function _callBids(bidReqs) {
	    utils.logInfo('callBids roxot adapter invoking');
	
	    var domain = window.location.host;
	    var page = window.location.pathname + location.search + location.hash;
	
	    var roxotBidReqs = {
	      id: utils.getUniqueIdentifierStr(),
	      bids: bidReqs,
	      site: {
	        domain: domain,
	        page: page
	      }
	    };
	
	    var scriptUrl = '//' + roxotUrl + '?callback=pbjs.roxotResponseHandler' + '&src=' + CONSTANTS.REPO_AND_VERSION + '&br=' + encodeURIComponent(JSON.stringify(roxotBidReqs));
	
	    adloader.loadScript(scriptUrl);
	  }
	
	  function roxotResponseHandler(roxotResponseObject) {
	    utils.logInfo('roxotResponseHandler invoking');
	    var placements = [];
	
	    if (isResponseInvalid()) {
	      return fillPlacementEmptyBid();
	    }
	
	    roxotResponseObject.bids.forEach(pushRoxotBid);
	    var allBidResponse = fillPlacementEmptyBid(placements);
	    utils.logInfo('roxotResponse handler finish');
	
	    return allBidResponse;
	
	    function isResponseInvalid() {
	      return !roxotResponseObject || !roxotResponseObject.bids || !Array.isArray(roxotResponseObject.bids) || roxotResponseObject.bids.length <= 0;
	    }
	
	    function pushRoxotBid(roxotBid) {
	      var placementCode = '';
	
	      var bidReq = pbjs._bidsRequested.find(function (bidSet) {
	        return bidSet.bidderCode === 'roxot';
	      }).bids.find(function (bid) {
	        return bid.bidId === roxotBid.bidId;
	      });
	
	      if (!bidReq) {
	        return pushErrorBid(placementCode);
	      }
	
	      bidReq.status = CONSTANTS.STATUS.GOOD;
	
	      placementCode = bidReq.placementCode;
	      placements.push(placementCode);
	
	      var cpm = roxotBid.cpm;
	      var responseNurl = '<img src="' + roxotBid.nurl + '">';
	
	      if (!cpm) {
	        return pushErrorBid(placementCode);
	      }
	
	      var bid = bidfactory.createBid(1, bidReq);
	
	      bid.creative_id = roxotBid.id;
	      bid.bidderCode = 'roxot';
	      bid.cpm = cpm;
	      bid.ad = decodeURIComponent(roxotBid.adm + responseNurl);
	      bid.width = parseInt(roxotBid.w);
	      bid.height = parseInt(roxotBid.h);
	
	      bidmanager.addBidResponse(placementCode, bid);
	    }
	
	    function fillPlacementEmptyBid(places) {
	      pbjs._bidsRequested.find(function (bidSet) {
	        return bidSet.bidderCode === 'roxot';
	      }).bids.forEach(fillIfNotFilled);
	
	      function fillIfNotFilled(bid) {
	        if (utils.contains(places, bid.placementCode)) {
	          return null;
	        }
	
	        pushErrorBid(bid);
	      }
	    }
	
	    function pushErrorBid(bidRequest) {
	      var bid = bidfactory.createBid(2, bidRequest);
	      bid.bidderCode = 'roxot';
	      bidmanager.addBidResponse(bidRequest.placementCode, bid);
	    }
	  }
	};
	
	module.exports = RoxotAdapter;

/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var CONSTANTS = __webpack_require__(3);
	var utils = __webpack_require__(2);
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var adloader = __webpack_require__(13);
	
	var VertozAdapter = function VertozAdapter() {
	
	  var BASE_URI = '//banner.vrtzads.com/vzhbidder/bid?';
	  var BIDDER_NAME = 'vertoz';
	  var QUERY_PARAM_KEY = 'q';
	
	  function _callBids(params) {
	    var bids = params.bids || [];
	
	    for (var i = 0; i < bids.length; i++) {
	      var bid = bids[i];
	      var slotBidId = utils.getValue(bid, 'bidId');
	      var cb = Math.round(new Date().getTime() / 1000);
	      var vzEndPoint = BASE_URI;
	      var reqParams = bid.params || {};
	      var placementId = utils.getValue(reqParams, 'placementId');
	
	      if (utils.isEmptyStr(placementId)) {
	        utils.logError('missing params:', BIDDER_NAME, 'Enter valid vzPlacementId');
	        return;
	      }
	
	      var reqSrc = utils.getTopWindowLocation().href;
	      var vzReq = {
	        _vzPlacementId: placementId,
	        _rqsrc: reqSrc,
	        _cb: cb,
	        _slotBidId: slotBidId
	      };
	      var queryParamValue = JSON.stringify(vzReq);
	      vzEndPoint = utils.tryAppendQueryString(vzEndPoint, QUERY_PARAM_KEY, queryParamValue);
	      adloader.loadScript(vzEndPoint);
	    }
	  }
	
	  pbjs.vzResponse = function (vertozResponse) {
	    var bidRespObj = vertozResponse;
	    var bidObject;
	    var reqBidObj = utils.getBidRequest(bidRespObj.slotBidId);
	
	    if (bidRespObj.cpm) {
	      bidObject = bidfactory.createBid(CONSTANTS.STATUS.GOOD, reqBidObj);
	      bidObject.cpm = Number(bidRespObj.cpm);
	      bidObject.ad = bidRespObj.ad + utils.createTrackPixelHtml(decodeURIComponent(bidRespObj.nurl));
	      bidObject.width = bidRespObj.adWidth;
	      bidObject.height = bidRespObj.adHeight;
	    } else {
	      var respStatusText = bidRespObj.statusText;
	      bidObject = bidfactory.createBid(CONSTANTS.STATUS.NO_BID, reqBidObj);
	      utils.logMessage(respStatusText);
	    }
	
	    var adSpaceId = reqBidObj.placementCode;
	    bidObject.bidderCode = BIDDER_NAME;
	    bidmanager.addBidResponse(adSpaceId, bidObject);
	  };
	  return { callBids: _callBids };
	};
	
	module.exports = VertozAdapter;

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _utils = __webpack_require__(2);
	
	var utils = __webpack_require__(2);
	var adloader = __webpack_require__(13);
	var bidmanager = __webpack_require__(11);
	var bidfactory = __webpack_require__(10);
	var WS_ADAPTER_VERSION = '1.0.2';
	
	function WidespaceAdapter() {
	  var useSSL = 'https:' === document.location.protocol,
	      baseURL = (useSSL ? 'https:' : 'http:') + '//engine.widespace.com/map/engine/hb/dynamic?',
	      callbackName = 'pbjs.widespaceHandleCB';
	
	  function _callBids(params) {
	    var bids = params && params.bids || [];
	
	    for (var i = 0; i < bids.length; i++) {
	      var bid = bids[i],
	          callbackUid = bid.bidId,
	          sid = bid.params.sid,
	          currency = bid.params.cur || bid.params.currency;
	
	      //Handle Sizes string
	      var sizeQueryString = '';
	      var parsedSizes = utils.parseSizesInput(bid.sizes);
	
	      sizeQueryString = parsedSizes.reduce(function (prev, curr) {
	        return prev ? prev + ',' + curr : curr;
	      }, sizeQueryString);
	
	      var requestURL = baseURL;
	      requestURL = utils.tryAppendQueryString(requestURL, 'hb.ver', WS_ADAPTER_VERSION);
	
	      var _params = {
	        'hb': '1',
	        'hb.name': 'prebidjs',
	        'hb.callback': callbackName,
	        'hb.callbackUid': callbackUid,
	        'hb.sizes': sizeQueryString,
	        'hb.currency': currency,
	        'sid': sid
	      };
	
	      requestURL += '#';
	
	      var paramKeys = Object.keys(_params);
	
	      for (var k = 0; k < paramKeys.length; k++) {
	        var key = paramKeys[k];
	        requestURL += key + '=' + _params[key] + '&';
	      }
	
	      // Expose the callback
	      pbjs.widespaceHandleCB = window[callbackName] = handleCallback;
	
	      adloader.loadScript(requestURL);
	    }
	  }
	
	  //Handle our callback
	  var handleCallback = function handleCallback(bidsArray) {
	    if (!bidsArray) {
	      return;
	    }
	
	    var bidObject,
	        bidCode = 'widespace';
	
	    for (var i = 0, l = bidsArray.length; i < l; i++) {
	      var bid = bidsArray[i],
	          placementCode = '',
	          validSizes = [];
	
	      bid.sizes = { height: bid.height, width: bid.width };
	
	      var inBid = (0, _utils.getBidRequest)(bid.callbackUid);
	
	      if (inBid) {
	        bidCode = inBid.bidder;
	        placementCode = inBid.placementCode;
	        validSizes = inBid.sizes;
	      }
	
	      if (bid && bid.callbackUid && bid.status !== 'noad' && verifySize(bid.sizes, validSizes)) {
	        bidObject = bidfactory.createBid(1);
	        bidObject.bidderCode = bidCode;
	        bidObject.cpm = bid.cpm;
	        bidObject.cur = bid.currency;
	        bidObject.creative_id = bid.adId;
	        bidObject.ad = bid.code;
	        bidObject.width = bid.width;
	        bidObject.height = bid.height;
	        bidmanager.addBidResponse(placementCode, bidObject);
	      } else {
	        bidObject = bidfactory.createBid(2);
	        bidObject.bidderCode = bidCode;
	        bidmanager.addBidResponse(placementCode, bidObject);
	      }
	    }
	
	    function verifySize(bid, validSizes) {
	      for (var j = 0, k = validSizes.length; j < k; j++) {
	        if (bid.width === validSizes[j][0] && bid.height === validSizes[j][1]) {
	          return true;
	        }
	      }
	      return false;
	    }
	  };
	
	  return {
	    callBids: _callBids
	  };
	}
	
	module.exports = WidespaceAdapter;

/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var Ajax = __webpack_require__(21);
	var utils = __webpack_require__(2);
	
	/**
	 * Adapter for requesting bids from Admixer.
	 *
	 * @returns {{callBids: _callBids,responseCallback: _responseCallback}}
	 */
	var AdmixerAdapter = function AdmixerAdapter() {
	  var invUrl = '//inv-nets.admixer.net/prebid.aspx';
	
	  function _callBids(data) {
	    var bids = data.bids || [];
	    for (var i = 0, ln = bids.length; i < ln; i++) {
	      var bid = bids[i];
	      var params = {
	        'sizes': utils.parseSizesInput(bid.sizes).join('-'),
	        'zone': bid.params && bid.params.zone,
	        'callback_uid': bid.placementCode
	      };
	      if (params.zone) {
	        _requestBid(invUrl, params);
	      } else {
	        var bidObject = bidfactory.createBid(2);
	        bidObject.bidderCode = 'admixer';
	        bidmanager.addBidResponse(params.callback_uid, bidObject);
	      }
	    }
	  }
	
	  function _requestBid(url, params) {
	    Ajax.ajax(url, _responseCallback, params, { method: 'GET', withCredentials: true });
	  }
	
	  function _responseCallback(adUnit) {
	    try {
	      adUnit = JSON.parse(adUnit);
	    } catch (_error) {
	      adUnit = { result: { cpm: 0 } };
	      utils.logError(_error);
	    }
	    var adUnitCode = adUnit.callback_uid;
	    var bid = adUnit.result;
	    var bidObject;
	    if (bid.cpm > 0) {
	      bidObject = bidfactory.createBid(1);
	      bidObject.bidderCode = 'admixer';
	      bidObject.cpm = bid.cpm;
	      bidObject.ad = bid.ad;
	      bidObject.width = bid.width;
	      bidObject.height = bid.height;
	    } else {
	      bidObject = bidfactory.createBid(2);
	      bidObject.bidderCode = 'admixer';
	    }
	    bidmanager.addBidResponse(adUnitCode, bidObject);
	  }
	
	  return {
	    callBids: _callBids,
	    responseCallback: _responseCallback
	  };
	};
	
	module.exports = AdmixerAdapter;

/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var CONSTANTS = __webpack_require__(3);
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var adloader = __webpack_require__(13);
	var Ajax = __webpack_require__(21);
	var utils = __webpack_require__(2);
	
	/**
	 * Adapter for requesting bids from Atomx.
	 *
	 * @returns {{callBids: _callBids, responseCallback: _responseCallback}}
	 */
	var AtomxAdapter = function AtomxAdapter() {
	  function _callBids(data) {
	    if (!window.atomx_prebid) {
	      adloader.loadScript(window.location.protocol + '//s.ato.mx/b.js', function () {
	        _bid(data);
	      }, true);
	    } else {
	      _bid(data);
	    }
	  }
	
	  function _bid(data) {
	    var url = window.atomx_prebid();
	    var bids = data.bids || [];
	    for (var i = 0, ln = bids.length; i < ln; i++) {
	      var bid = bids[i];
	      if (bid.params && bid.params.id) {
	        Ajax.ajax(url, _responseCallback.bind(this, bid), {
	          id: bid.params.id,
	          size: utils.parseSizesInput(bid.sizes)[0],
	          prebid: bid.placementCode
	        }, { method: 'GET' });
	      } else {
	        var bidObject = bidfactory.createBid(CONSTANTS.STATUS.NO_BID, bid);
	        bidObject.bidderCode = 'atomx';
	        bidmanager.addBidResponse(bid.placementCode, bidObject);
	      }
	    }
	  }
	
	  function _responseCallback(bid, data) {
	    var bidObject;
	    try {
	      data = JSON.parse(data);
	
	      if (data.cpm && data.cpm > 0) {
	        bidObject = bidfactory.createBid(CONSTANTS.STATUS.GOOD, bid);
	        bidObject.bidderCode = 'atomx';
	        bidObject.cpm = data.cpm * 1000;
	        if (data.adm) {
	          bidObject.ad = data.adm;
	        } else {
	          bidObject.adUrl = data.url;
	        }
	        bidObject.width = data.width;
	        bidObject.height = data.height;
	        bidmanager.addBidResponse(bid.placementCode, bidObject);
	        return;
	      }
	    } catch (_error) {
	      utils.logError(_error);
	    }
	
	    bidObject = bidfactory.createBid(CONSTANTS.STATUS.NO_BID, bid);
	    bidObject.bidderCode = 'atomx';
	    bidmanager.addBidResponse(bid.placementCode, bidObject);
	  }
	
	  return {
	    callBids: _callBids,
	    responseCallback: _responseCallback
	  };
	};
	
	module.exports = AtomxAdapter;

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	//v0.0.1
	
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var adloader = __webpack_require__(13);
	var utils = __webpack_require__(2);
	
	var TapSenseAdapter = function TapSenseAdapter() {
	  var version = "0.0.1";
	  var creativeSizes = ["320x50"];
	  var validParams = ["ufid", "refer", "ad_unit_id", //required
	  "device_id", "lat", "long", "user", //required
	  "price_floor", "test"];
	  var SCRIPT_URL = "https://ads04.tapsense.com/ads/headerad";
	  var bids = void 0;
	  pbjs.tapsense = {};
	  function _callBids(params) {
	    bids = params.bids || [];
	    for (var i = 0; i < bids.length; i++) {
	      var bid = bids[i];
	      var isValidSize = false;
	      if (!bid.sizes || !bid.params.user || !bid.params.ad_unit_id) {
	        return;
	      }
	      var parsedSizes = utils.parseSizesInput(bid.sizes);
	      for (var k = 0; k < parsedSizes.length; k++) {
	        if (creativeSizes.indexOf(parsedSizes[k]) > -1) {
	          isValidSize = true;
	          break;
	        }
	      }
	      if (isValidSize) {
	        var queryString = '?price=true&jsonp=1&callback=pbjs.tapsense.callback_with_price_' + bid.bidId + '&version=' + version + '&';
	        pbjs.tapsense['callback_with_price_' + bid.bidId] = generateCallback(bid.bidId);
	        var keys = Object.keys(bid.params);
	        for (var j = 0; j < keys.length; j++) {
	          if (validParams.indexOf(keys[j]) < 0) continue;
	          queryString += encodeURIComponent(keys[j]) + "=" + encodeURIComponent(bid.params[keys[j]]) + "&";
	        }
	        _requestBids(SCRIPT_URL + queryString);
	      }
	    }
	  }
	
	  function generateCallback(bidId) {
	    return function tapsenseCallback(response, price) {
	      var bidObj = void 0;
	      if (response && price) {
	        var bidReq = utils.getBidRequest(bidId);
	        if (response.status.value === "ok" && response.count_ad_units > 0) {
	          bidObj = bidfactory.createBid(1, bidObj);
	          bidObj.cpm = price;
	          bidObj.width = response.width;
	          bidObj.height = response.height;
	          bidObj.ad = response.ad_units[0].html;
	        } else {
	          bidObj = bidfactory.createBid(2, bidObj);
	        }
	        bidObj.bidderCode = bidReq.bidder;
	        bidmanager.addBidResponse(bidReq.placementCode, bidObj);
	      } else {
	        utils.logMessage('No prebid response');
	      }
	    };
	  }
	
	  function _requestBids(scriptURL) {
	    adloader.loadScript(scriptURL);
	  }
	
	  return {
	    callBids: _callBids
	  };
	};
	
	module.exports = TapSenseAdapter;

/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _utils = __webpack_require__(2);
	
	var CONSTANTS = __webpack_require__(3);
	var utils = __webpack_require__(2);
	var adloader = __webpack_require__(13);
	var bidmanager = __webpack_require__(11);
	var bidfactory = __webpack_require__(10);
	var Adapter = __webpack_require__(14);
	
	var BID_REQUEST_BASE_URL = "https://in-appadvertising.com/api/bidRequest?";
	var USER_SYNC_URL = "https://in-appadvertising.com/api/userSync.js";
	
	var TrionAdapter;
	TrionAdapter = function TrionAdapter() {
	  var baseAdapter = Adapter.createNew('trion');
	  var userTag = null;
	
	  baseAdapter.callBids = function (params) {
	    var bids = params.bids || [];
	
	    if (!bids.length) {
	      return;
	    }
	
	    if (!window.TRION_INT) {
	      adloader.loadScript(USER_SYNC_URL, function () {
	        userTag = window.TRION_INT || {};
	        userTag.pubId = utils.getBidIdParameter('pubId', bids[0].params);
	        userTag.sectionId = utils.getBidIdParameter('sectionId', bids[0].params);
	        if (!userTag.to) {
	          getBids(bids);
	        } else {
	          setTimeout(function () {
	            getBids(bids);
	          }, userTag.to);
	        }
	      }, true);
	    } else {
	      userTag = window.TRION_INT;
	      getBids(bids);
	    }
	  };
	
	  function getBids(bids) {
	    if (!userTag.int_t) {
	      userTag.int_t = window.TR_INT_T || -1;
	    }
	
	    for (var i = 0; i < bids.length; i++) {
	      var bidRequest = bids[i];
	      var bidId = bidRequest.bidId;
	      adloader.loadScript(buildTrionUrl(bidRequest, bidId));
	    }
	  }
	
	  function buildTrionUrl(bid, bidId) {
	    var pubId = utils.getBidIdParameter('pubId', bid.params);
	    var sectionId = utils.getBidIdParameter('sectionId', bid.params);
	    var re = utils.getBidIdParameter('re', bid.params);
	    var url = window.location.href;
	    var sizes = utils.parseSizesInput(bid.sizes).join(',');
	
	    var trionUrl = BID_REQUEST_BASE_URL;
	
	    trionUrl = utils.tryAppendQueryString(trionUrl, 'callback', 'pbjs.handleTrionCB');
	    trionUrl = utils.tryAppendQueryString(trionUrl, 'bidId', bidId);
	    trionUrl = utils.tryAppendQueryString(trionUrl, 'pubId', pubId);
	    trionUrl = utils.tryAppendQueryString(trionUrl, 'sectionId', sectionId);
	    trionUrl = utils.tryAppendQueryString(trionUrl, 're', re);
	    if (url) {
	      trionUrl += 'url=' + url + '&';
	    }
	    if (sizes) {
	      trionUrl += 'sizes=' + sizes + '&';
	    }
	    if (userTag) {
	      trionUrl += 'tag=' + encodeURIComponent(JSON.stringify(userTag)) + '&';
	    }
	
	    //remove the trailing "&"
	    if (trionUrl.lastIndexOf('&') === trionUrl.length - 1) {
	      trionUrl = trionUrl.substring(0, trionUrl.length - 1);
	    }
	
	    return trionUrl;
	  }
	
	  //expose the callback to the global object:
	  pbjs.handleTrionCB = function (trionResponseObj) {
	    var bid;
	    var bidObj = {};
	    var placementCode = '';
	
	    if (trionResponseObj && trionResponseObj.bidId) {
	      var bidCode;
	      var bidId = trionResponseObj.bidId;
	      var result = trionResponseObj && trionResponseObj.result;
	
	      bidObj = (0, _utils.getBidRequest)(bidId);
	      if (bidObj) {
	        bidCode = bidObj.bidder;
	        placementCode = bidObj.placementCode;
	      }
	
	      if (result && result.cpm && result.placeBid && result.ad) {
	        var cpm = parseInt(result.cpm, 10) / 100;
	        bid = bidfactory.createBid(CONSTANTS.STATUS.GOOD, bidObj);
	        bid.bidderCode = bidCode;
	        bid.cpm = cpm;
	        bid.ad = result.ad;
	        bid.width = result.width;
	        bid.height = result.height;
	      }
	    }
	    if (!bid) {
	      bid = bidfactory.createBid(CONSTANTS.STATUS.NO_BID, bidObj);
	    }
	    bidmanager.addBidResponse(placementCode, bid);
	  };
	
	  return {
	    callBids: baseAdapter.callBids,
	    setBidderCode: baseAdapter.setBidderCode,
	    createNew: TrionAdapter.createNew,
	    buildTrionUrl: buildTrionUrl
	  };
	};
	
	TrionAdapter.createNew = function () {
	  return new TrionAdapter();
	};
	
	module.exports = TrionAdapter;

/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _adapter = __webpack_require__(14);
	
	var _adapter2 = _interopRequireDefault(_adapter);
	
	var _bidfactory = __webpack_require__(10);
	
	var _bidfactory2 = _interopRequireDefault(_bidfactory);
	
	var _bidmanager = __webpack_require__(11);
	
	var _bidmanager2 = _interopRequireDefault(_bidmanager);
	
	var _utils = __webpack_require__(2);
	
	var utils = _interopRequireWildcard(_utils);
	
	var _ajax = __webpack_require__(21);
	
	var _constants = __webpack_require__(3);
	
	var _cookie = __webpack_require__(85);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	var TYPE = 's2s';
	var cookiePersistMessage = 'Your browser may be blocking 3rd party cookies. By clicking on this page you allow Prebid Server and other advertising partners to place cookies to help us advertise. You can opt out of their cookies <a href="https://www.appnexus.com/en/company/platform-privacy-policy#choices" target="_blank">here</a>.';
	var cookiePersistUrl = '//ib.adnxs.com/seg?add=1&redir=';
	/**
	 * Bidder adapter for Prebid Server
	 */
	function PrebidServer() {
	
	  var baseAdapter = _adapter2['default'].createNew('prebidServer');
	  var config = void 0;
	
	  baseAdapter.setConfig = function (s2sconfig) {
	    config = s2sconfig;
	  };
	
	  /* Prebid executes this function when the page asks to send out bid requests */
	  baseAdapter.callBids = function (bidRequest) {
	
	    var requestJson = {
	      account_id: config.accountId,
	      tid: bidRequest.tid,
	      max_bids: config.maxBids,
	      timeout_millis: config.timeout,
	      url: utils.getTopWindowUrl(),
	      prebid_version: '0.24.0-pre',
	      ad_units: bidRequest.ad_units.filter(hasSizes)
	    };
	
	    var payload = JSON.stringify(requestJson);
	    (0, _ajax.ajax)(config.endpoint, handleResponse, payload, {
	      contentType: 'text/plain',
	      withCredentials: true
	    });
	  };
	
	  // at this point ad units should have a size array either directly or mapped so filter for that
	  function hasSizes(unit) {
	    return unit.sizes && unit.sizes.length;
	  }
	
	  /* Notify Prebid of bid responses so bids can get in the auction */
	  function handleResponse(response) {
	    var result = void 0;
	    try {
	      result = JSON.parse(response);
	
	      if (result.status === 'OK') {
	        if (result.bidder_status) {
	          result.bidder_status.forEach(function (bidder) {
	            if (bidder.no_bid) {
	              // store a "No Bid" bid response
	
	              var bidObject = _bidfactory2['default'].createBid(_constants.STATUS.NO_BID, {
	                bidId: bidder.bid_id
	              });
	              bidObject.adUnitCode = bidder.ad_unit;
	              bidObject.bidderCode = bidder.bidder;
	              _bidmanager2['default'].addBidResponse(bidObject.adUnitCode, bidObject);
	            }
	            if (bidder.no_cookie) {
	              // if no cookie is present then no bids were made, we don't store a bid response
	              (0, _cookie.queueSync)({ bidder: bidder.bidder, url: bidder.usersync.url, type: bidder.usersync.type });
	            }
	          });
	        }
	        if (result.bids) {
	          result.bids.forEach(function (bidObj) {
	            var bidRequest = utils.getBidRequest(bidObj.bid_id);
	            var cpm = bidObj.price;
	            var status = void 0;
	            if (cpm !== 0) {
	              status = _constants.STATUS.GOOD;
	            } else {
	              status = _constants.STATUS.NO_BID;
	            }
	
	            var bidObject = _bidfactory2['default'].createBid(status, bidRequest);
	            bidObject.creative_id = bidObj.creative_id;
	            bidObject.bidderCode = bidObj.bidder;
	            bidObject.cpm = cpm;
	            bidObject.ad = bidObj.adm;
	            bidObject.width = bidObj.width;
	            bidObject.height = bidObj.height;
	
	            _bidmanager2['default'].addBidResponse(bidObj.code, bidObject);
	          });
	        }
	      } else if (result.status === 'no_cookie') {
	        //cookie sync
	        (0, _cookie.persist)(cookiePersistUrl, cookiePersistMessage);
	      }
	    } catch (error) {
	      utils.logError(error);
	    }
	
	    if (!result || result.status && result.status.includes('Error')) {
	      utils.logError('error parsing response: ', result.status);
	    }
	  }
	
	  return {
	    setConfig: baseAdapter.setConfig,
	    createNew: PrebidServer.createNew,
	    callBids: baseAdapter.callBids,
	    setBidderCode: baseAdapter.setBidderCode,
	    type: TYPE
	  };
	}
	
	PrebidServer.createNew = function () {
	  return new PrebidServer();
	};
	
	module.exports = PrebidServer;

/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _utils = __webpack_require__(2);
	
	var utils = _interopRequireWildcard(_utils);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }
	
	var cookie = exports;
	
	
	var queue = [];
	
	function fireSyncs() {
	  queue.forEach(function (obj) {
	    utils.logMessage('Invoking cookie sync for bidder: ' + obj.bidder);
	    if (obj.type === 'iframe') {
	      utils.insertCookieSyncIframe(obj.url, false);
	    } else {
	      utils.insertPixel(obj.url);
	    }
	  });
	  //empty queue.
	  queue.length = 0;
	}
	
	/**
	 * Add this bidder to the queue for sync
	 * @param  {String} bidder bidder code
	 * @param  {String} url    optional URL for invoking cookie sync if provided.
	 */
	cookie.queueSync = function (_ref) {
	  var bidder = _ref.bidder,
	      url = _ref.url,
	      type = _ref.type;
	
	  queue.push({ bidder: bidder, url: url, type: type });
	};
	
	/**
	 * Fire cookie sync URLs previously queued
	 * @param  {number} timeout time in ms to delay in sending
	 */
	cookie.syncCookies = function (timeout) {
	  if (timeout) {
	    setTimeout(fireSyncs, timeout);
	  } else {
	    fireSyncs();
	  }
	};
	
	cookie.persist = function (url, msgHtml) {
	  if (!utils.isSafariBrowser()) {
	    return;
	  }
	  linkOverride(url);
	  displayFooter(msgHtml);
	};
	
	function linkOverride(url) {
	  for (var i = 0; i < document.links.length; i++) {
	    var link = document.links[i];
	    link.href = url + encodeURIComponent(link.href);
	  }
	}
	
	function displayFooter(msgHtml) {
	  // https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie#Example_3_Do_something_only_once
	  if (document.cookie.replace(/(?:(?:^|.*;\s*)pbsCookiePersistFooter\s*\=\s*([^;]*).*$)|^.*$/, '$1') !== 'true') {
	    document.body.appendChild(createFooter(msgHtml));
	    document.cookie = 'pbsCookiePersistFooter=true; expires=Fri, 31 Dec 9999 23:59:59 GMT';
	  }
	}
	
	function createFooter(msgHtml) {
	  var footer = document.createElement('div');
	  footer.style.background = '#D3D3D3';
	  footer.style.color = '#555';
	  footer.style.boxShadow = '0 -1px 2px rgba(0, 0, 0, 0.2)';
	  footer.style.fontFamily = 'sans-serif';
	  footer.style.lineHeight = '1.5';
	  footer.style.position = 'fixed';
	  footer.style.bottom = '0';
	  footer.style.left = '0';
	  footer.style.right = '0';
	  footer.style.width = '100%';
	  footer.style.padding = '1em 0';
	  footer.style.zindex = '1000';
	
	  var footerText = document.createElement('p');
	  footerText.style.margin = '0 2em';
	  footerText.innerHTML = msgHtml;
	  footer.appendChild(footerText);
	
	  return footer;
	}

/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var bidfactory = __webpack_require__(10);
	var bidmanager = __webpack_require__(11);
	var adloader = __webpack_require__(13);
	var utils = __webpack_require__(2);
	var ADSUPPLY_CODE = 'adsupply';
	
	var AdSupplyAdapter = function AdSupplyAdapter() {
	  function _validateParams(params) {
	    if (!params || !params.siteId || !params.zoneId || !params.endpointUrl || !params.clientId) {
	      return false;
	    }
	
	    if (typeof params.zoneId !== 'number' || params.zoneId <= 0) {
	      return false;
	    }
	
	    return true;
	  }
	
	  function _getRequestUrl(bid) {
	    var referrerUrl = encodeURIComponent(window.document.referrer);
	    var rand = encodeURIComponent(Math.floor(Math.random() * 100000 + 1));
	    var time = encodeURIComponent(new Date().getTimezoneOffset());
	    return '//' + bid.params.endpointUrl + '/banner.engine?id=' + bid.params.siteId + '&z=' + bid.params.zoneId + '&rand=' + rand + '&ver=async' + '&time=' + time + '&referrerurl=' + referrerUrl + '&abr=false' + '&hbt=1&cid=' + encodeURIComponent(bid.params.clientId);
	  }
	
	  pbjs.adSupplyResponseHandler = function (bidId) {
	    if (!bidId) return;
	
	    var bidRequest = utils.getBidRequest(bidId);
	
	    if (!bidRequest || !bidRequest.params) return;
	
	    var clientId = bidRequest.params.clientId;
	    var zoneProp = 'b' + bidRequest.params.zoneId;
	
	    if (!window[clientId] || !window[clientId][zoneProp]) return;
	
	    var media = window[clientId][zoneProp].Media;
	
	    if (!media) return;
	
	    if (!media.Url || !media.Ecpm || typeof media.Ecpm !== 'number' || media.Ecpm <= 0) {
	      var noFillbject = bidfactory.createBid(2, bidRequest);
	      noFillbject.bidderCode = ADSUPPLY_CODE;
	      bidmanager.addBidResponse(bidRequest.placementCode, noFillbject);
	    } else {
	      var bidObject = bidfactory.createBid(1, bidRequest);
	      bidObject.bidderCode = ADSUPPLY_CODE;
	      bidObject.cpm = media.Ecpm;
	      bidObject.ad = '<iframe style="z-index: 5000001; margin: 0px; padding: 0px; border: none; width: ' + media.Width + 'px; height: ' + media.Height + 'px; " src="//' + bidRequest.params.endpointUrl + media.Url + '"></iframe>';
	      bidObject.width = media.Width;
	      bidObject.height = media.Height;
	      bidmanager.addBidResponse(bidRequest.placementCode, bidObject);
	    }
	  };
	
	  function _makeCallBackHandler(bidId) {
	    return function () {
	      pbjs.adSupplyResponseHandler(bidId);
	    };
	  }
	
	  function _callBids(params) {
	    var bids = params.bids || [];
	    for (var i = 0; i < bids.length; i++) {
	      var bid = bids[i];
	      if (!_validateParams(bid.params)) continue;
	
	      var clientId = bid.params.clientId;
	      var zoneProp = 'b' + bid.params.zoneId;
	      window[clientId] = window[clientId] || {};
	      window.window[clientId][zoneProp] = window.window[clientId][zoneProp] || {};
	      window.window[clientId][zoneProp].Media = {};
	
	      var requestUrl = _getRequestUrl(bid);
	      adloader.loadScript(requestUrl, _makeCallBackHandler(bid.bidId));
	    }
	  }
	
	  return {
	    callBids: _callBids
	  };
	};
	
	module.exports = AdSupplyAdapter;

/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	/** @module polyfill
	Misc polyfills
	*/
	/*jshint -W121 */
	__webpack_require__(88);
	__webpack_require__(121);
	__webpack_require__(126);
	
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
	Number.isInteger = Number.isInteger || function (value) {
	  return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
	};

/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(89);
	module.exports = __webpack_require__(92).Array.find;

/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
	var $export = __webpack_require__(90)
	  , $find   = __webpack_require__(108)(5)
	  , KEY     = 'find'
	  , forced  = true;
	// Shouldn't skip holes
	if(KEY in [])Array(1)[KEY](function(){ forced = false; });
	$export($export.P + $export.F * forced, 'Array', {
	  find: function find(callbackfn/*, that = undefined */){
	    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});
	__webpack_require__(120)(KEY);

/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(91)
	  , core      = __webpack_require__(92)
	  , hide      = __webpack_require__(93)
	  , redefine  = __webpack_require__(103)
	  , ctx       = __webpack_require__(106)
	  , PROTOTYPE = 'prototype';
	
	var $export = function(type, name, source){
	  var IS_FORCED = type & $export.F
	    , IS_GLOBAL = type & $export.G
	    , IS_STATIC = type & $export.S
	    , IS_PROTO  = type & $export.P
	    , IS_BIND   = type & $export.B
	    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE]
	    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
	    , expProto  = exports[PROTOTYPE] || (exports[PROTOTYPE] = {})
	    , key, own, out, exp;
	  if(IS_GLOBAL)source = name;
	  for(key in source){
	    // contains in native
	    own = !IS_FORCED && target && target[key] !== undefined;
	    // export native or passed
	    out = (own ? target : source)[key];
	    // bind timers to global for call from export context
	    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
	    // extend global
	    if(target)redefine(target, key, out, type & $export.U);
	    // export
	    if(exports[key] != out)hide(exports, key, exp);
	    if(IS_PROTO && expProto[key] != out)expProto[key] = out;
	  }
	};
	global.core = core;
	// type bitmap
	$export.F = 1;   // forced
	$export.G = 2;   // global
	$export.S = 4;   // static
	$export.P = 8;   // proto
	$export.B = 16;  // bind
	$export.W = 32;  // wrap
	$export.U = 64;  // safe
	$export.R = 128; // real proto method for `library` 
	module.exports = $export;

/***/ },
/* 91 */
/***/ function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ },
/* 92 */
/***/ function(module, exports) {

	var core = module.exports = {version: '2.4.0'};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	var dP         = __webpack_require__(94)
	  , createDesc = __webpack_require__(102);
	module.exports = __webpack_require__(98) ? function(object, key, value){
	  return dP.f(object, key, createDesc(1, value));
	} : function(object, key, value){
	  object[key] = value;
	  return object;
	};

/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	var anObject       = __webpack_require__(95)
	  , IE8_DOM_DEFINE = __webpack_require__(97)
	  , toPrimitive    = __webpack_require__(101)
	  , dP             = Object.defineProperty;
	
	exports.f = __webpack_require__(98) ? Object.defineProperty : function defineProperty(O, P, Attributes){
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if(IE8_DOM_DEFINE)try {
	    return dP(O, P, Attributes);
	  } catch(e){ /* empty */ }
	  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
	  if('value' in Attributes)O[P] = Attributes.value;
	  return O;
	};

/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(96);
	module.exports = function(it){
	  if(!isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ },
/* 96 */
/***/ function(module, exports) {

	module.exports = function(it){
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = !__webpack_require__(98) && !__webpack_require__(99)(function(){
	  return Object.defineProperty(__webpack_require__(100)('div'), 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(99)(function(){
	  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 99 */
/***/ function(module, exports) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(96)
	  , document = __webpack_require__(91).document
	  // in old IE typeof document.createElement is 'object'
	  , is = isObject(document) && isObject(document.createElement);
	module.exports = function(it){
	  return is ? document.createElement(it) : {};
	};

/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.1 ToPrimitive(input [, PreferredType])
	var isObject = __webpack_require__(96);
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	module.exports = function(it, S){
	  if(!isObject(it))return it;
	  var fn, val;
	  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  throw TypeError("Can't convert object to primitive value");
	};

/***/ },
/* 102 */
/***/ function(module, exports) {

	module.exports = function(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	};

/***/ },
/* 103 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(91)
	  , hide      = __webpack_require__(93)
	  , has       = __webpack_require__(104)
	  , SRC       = __webpack_require__(105)('src')
	  , TO_STRING = 'toString'
	  , $toString = Function[TO_STRING]
	  , TPL       = ('' + $toString).split(TO_STRING);
	
	__webpack_require__(92).inspectSource = function(it){
	  return $toString.call(it);
	};
	
	(module.exports = function(O, key, val, safe){
	  var isFunction = typeof val == 'function';
	  if(isFunction)has(val, 'name') || hide(val, 'name', key);
	  if(O[key] === val)return;
	  if(isFunction)has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
	  if(O === global){
	    O[key] = val;
	  } else {
	    if(!safe){
	      delete O[key];
	      hide(O, key, val);
	    } else {
	      if(O[key])O[key] = val;
	      else hide(O, key, val);
	    }
	  }
	// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
	})(Function.prototype, TO_STRING, function toString(){
	  return typeof this == 'function' && this[SRC] || $toString.call(this);
	});

/***/ },
/* 104 */
/***/ function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function(it, key){
	  return hasOwnProperty.call(it, key);
	};

/***/ },
/* 105 */
/***/ function(module, exports) {

	var id = 0
	  , px = Math.random();
	module.exports = function(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(107);
	module.exports = function(fn, that, length){
	  aFunction(fn);
	  if(that === undefined)return fn;
	  switch(length){
	    case 1: return function(a){
	      return fn.call(that, a);
	    };
	    case 2: return function(a, b){
	      return fn.call(that, a, b);
	    };
	    case 3: return function(a, b, c){
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function(/* ...args */){
	    return fn.apply(that, arguments);
	  };
	};

/***/ },
/* 107 */
/***/ function(module, exports) {

	module.exports = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ },
/* 108 */
/***/ function(module, exports, __webpack_require__) {

	// 0 -> Array#forEach
	// 1 -> Array#map
	// 2 -> Array#filter
	// 3 -> Array#some
	// 4 -> Array#every
	// 5 -> Array#find
	// 6 -> Array#findIndex
	var ctx      = __webpack_require__(106)
	  , IObject  = __webpack_require__(109)
	  , toObject = __webpack_require__(111)
	  , toLength = __webpack_require__(113)
	  , asc      = __webpack_require__(115);
	module.exports = function(TYPE, $create){
	  var IS_MAP        = TYPE == 1
	    , IS_FILTER     = TYPE == 2
	    , IS_SOME       = TYPE == 3
	    , IS_EVERY      = TYPE == 4
	    , IS_FIND_INDEX = TYPE == 6
	    , NO_HOLES      = TYPE == 5 || IS_FIND_INDEX
	    , create        = $create || asc;
	  return function($this, callbackfn, that){
	    var O      = toObject($this)
	      , self   = IObject(O)
	      , f      = ctx(callbackfn, that, 3)
	      , length = toLength(self.length)
	      , index  = 0
	      , result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined
	      , val, res;
	    for(;length > index; index++)if(NO_HOLES || index in self){
	      val = self[index];
	      res = f(val, index, O);
	      if(TYPE){
	        if(IS_MAP)result[index] = res;            // map
	        else if(res)switch(TYPE){
	          case 3: return true;                    // some
	          case 5: return val;                     // find
	          case 6: return index;                   // findIndex
	          case 2: result.push(val);               // filter
	        } else if(IS_EVERY)return false;          // every
	      }
	    }
	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
	  };
	};

/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(110);
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ },
/* 110 */
/***/ function(module, exports) {

	var toString = {}.toString;
	
	module.exports = function(it){
	  return toString.call(it).slice(8, -1);
	};

/***/ },
/* 111 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.13 ToObject(argument)
	var defined = __webpack_require__(112);
	module.exports = function(it){
	  return Object(defined(it));
	};

/***/ },
/* 112 */
/***/ function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ },
/* 113 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.15 ToLength
	var toInteger = __webpack_require__(114)
	  , min       = Math.min;
	module.exports = function(it){
	  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

/***/ },
/* 114 */
/***/ function(module, exports) {

	// 7.1.4 ToInteger
	var ceil  = Math.ceil
	  , floor = Math.floor;
	module.exports = function(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

/***/ },
/* 115 */
/***/ function(module, exports, __webpack_require__) {

	// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
	var speciesConstructor = __webpack_require__(116);
	
	module.exports = function(original, length){
	  return new (speciesConstructor(original))(length);
	};

/***/ },
/* 116 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(96)
	  , isArray  = __webpack_require__(117)
	  , SPECIES  = __webpack_require__(118)('species');
	
	module.exports = function(original){
	  var C;
	  if(isArray(original)){
	    C = original.constructor;
	    // cross-realm fallback
	    if(typeof C == 'function' && (C === Array || isArray(C.prototype)))C = undefined;
	    if(isObject(C)){
	      C = C[SPECIES];
	      if(C === null)C = undefined;
	    }
	  } return C === undefined ? Array : C;
	};

/***/ },
/* 117 */
/***/ function(module, exports, __webpack_require__) {

	// 7.2.2 IsArray(argument)
	var cof = __webpack_require__(110);
	module.exports = Array.isArray || function isArray(arg){
	  return cof(arg) == 'Array';
	};

/***/ },
/* 118 */
/***/ function(module, exports, __webpack_require__) {

	var store      = __webpack_require__(119)('wks')
	  , uid        = __webpack_require__(105)
	  , Symbol     = __webpack_require__(91).Symbol
	  , USE_SYMBOL = typeof Symbol == 'function';
	
	var $exports = module.exports = function(name){
	  return store[name] || (store[name] =
	    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
	};
	
	$exports.store = store;

/***/ },
/* 119 */
/***/ function(module, exports, __webpack_require__) {

	var global = __webpack_require__(91)
	  , SHARED = '__core-js_shared__'
	  , store  = global[SHARED] || (global[SHARED] = {});
	module.exports = function(key){
	  return store[key] || (store[key] = {});
	};

/***/ },
/* 120 */
/***/ function(module, exports, __webpack_require__) {

	// 22.1.3.31 Array.prototype[@@unscopables]
	var UNSCOPABLES = __webpack_require__(118)('unscopables')
	  , ArrayProto  = Array.prototype;
	if(ArrayProto[UNSCOPABLES] == undefined)__webpack_require__(93)(ArrayProto, UNSCOPABLES, {});
	module.exports = function(key){
	  ArrayProto[UNSCOPABLES][key] = true;
	};

/***/ },
/* 121 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(122);
	module.exports = __webpack_require__(92).Array.includes;

/***/ },
/* 122 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// https://github.com/tc39/Array.prototype.includes
	var $export   = __webpack_require__(90)
	  , $includes = __webpack_require__(123)(true);
	
	$export($export.P, 'Array', {
	  includes: function includes(el /*, fromIndex = 0 */){
	    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});
	
	__webpack_require__(120)('includes');

/***/ },
/* 123 */
/***/ function(module, exports, __webpack_require__) {

	// false -> Array#indexOf
	// true  -> Array#includes
	var toIObject = __webpack_require__(124)
	  , toLength  = __webpack_require__(113)
	  , toIndex   = __webpack_require__(125);
	module.exports = function(IS_INCLUDES){
	  return function($this, el, fromIndex){
	    var O      = toIObject($this)
	      , length = toLength(O.length)
	      , index  = toIndex(fromIndex, length)
	      , value;
	    // Array#includes uses SameValueZero equality algorithm
	    if(IS_INCLUDES && el != el)while(length > index){
	      value = O[index++];
	      if(value != value)return true;
	    // Array#toIndex ignores holes, Array#includes - not
	    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
	      if(O[index] === el)return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

/***/ },
/* 124 */
/***/ function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(109)
	  , defined = __webpack_require__(112);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ },
/* 125 */
/***/ function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(114)
	  , max       = Math.max
	  , min       = Math.min;
	module.exports = function(index, length){
	  index = toInteger(index);
	  return index < 0 ? max(index + length, 0) : min(index, length);
	};

/***/ },
/* 126 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(127);
	module.exports = __webpack_require__(92).Object.assign;

/***/ },
/* 127 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.1 Object.assign(target, source)
	var $export = __webpack_require__(90);
	
	$export($export.S + $export.F, 'Object', {assign: __webpack_require__(128)});

/***/ },
/* 128 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// 19.1.2.1 Object.assign(target, source, ...)
	var getKeys  = __webpack_require__(129)
	  , gOPS     = __webpack_require__(133)
	  , pIE      = __webpack_require__(134)
	  , toObject = __webpack_require__(111)
	  , IObject  = __webpack_require__(109)
	  , $assign  = Object.assign;
	
	// should work with symbols and should have deterministic property order (V8 bug)
	module.exports = !$assign || __webpack_require__(99)(function(){
	  var A = {}
	    , B = {}
	    , S = Symbol()
	    , K = 'abcdefghijklmnopqrst';
	  A[S] = 7;
	  K.split('').forEach(function(k){ B[k] = k; });
	  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
	}) ? function assign(target, source){ // eslint-disable-line no-unused-vars
	  var T     = toObject(target)
	    , aLen  = arguments.length
	    , index = 1
	    , getSymbols = gOPS.f
	    , isEnum     = pIE.f;
	  while(aLen > index){
	    var S      = IObject(arguments[index++])
	      , keys   = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S)
	      , length = keys.length
	      , j      = 0
	      , key;
	    while(length > j)if(isEnum.call(S, key = keys[j++]))T[key] = S[key];
	  } return T;
	} : $assign;

/***/ },
/* 129 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)
	var $keys       = __webpack_require__(130)
	  , enumBugKeys = __webpack_require__(132);
	
	module.exports = Object.keys || function keys(O){
	  return $keys(O, enumBugKeys);
	};

/***/ },
/* 130 */
/***/ function(module, exports, __webpack_require__) {

	var has          = __webpack_require__(104)
	  , toIObject    = __webpack_require__(124)
	  , arrayIndexOf = __webpack_require__(123)(false)
	  , IE_PROTO     = __webpack_require__(131)('IE_PROTO');
	
	module.exports = function(object, names){
	  var O      = toIObject(object)
	    , i      = 0
	    , result = []
	    , key;
	  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while(names.length > i)if(has(O, key = names[i++])){
	    ~arrayIndexOf(result, key) || result.push(key);
	  }
	  return result;
	};

/***/ },
/* 131 */
/***/ function(module, exports, __webpack_require__) {

	var shared = __webpack_require__(119)('keys')
	  , uid    = __webpack_require__(105);
	module.exports = function(key){
	  return shared[key] || (shared[key] = uid(key));
	};

/***/ },
/* 132 */
/***/ function(module, exports) {

	// IE 8- don't enum bug keys
	module.exports = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');

/***/ },
/* 133 */
/***/ function(module, exports) {

	exports.f = Object.getOwnPropertySymbols;

/***/ },
/* 134 */
/***/ function(module, exports) {

	exports.f = {}.propertyIsEnumerable;

/***/ },
/* 135 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.listenMessagesFromCreative = listenMessagesFromCreative;
	
	var _events = __webpack_require__(8);
	
	var _events2 = _interopRequireDefault(_events);
	
	var _constants = __webpack_require__(3);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	/* Secure Creatives
	  Provides support for rendering creatives into cross domain iframes such as SafeFrame to prevent
	   access to a publisher page from creative payloads.
	 */
	
	var BID_WON = _constants.EVENTS.BID_WON;
	
	function listenMessagesFromCreative() {
	  addEventListener('message', receiveMessage, false);
	}
	
	function receiveMessage(ev) {
	  var key = ev.message ? 'message' : 'data';
	  var data = {};
	  try {
	    data = JSON.parse(ev[key]);
	  } catch (e) {
	    return;
	  }
	
	  if (data.adId) {
	    var adObject = pbjs._bidsReceived.find(function (bid) {
	      return bid.adId === data.adId;
	    });
	
	    if (data.message === 'Prebid Request') {
	      sendAdToCreative(adObject, data.adServerDomain, ev.source);
	      _events2['default'].emit(BID_WON, adObject);
	    }
	  }
	}
	
	function sendAdToCreative(adObject, remoteDomain, source) {
	  var adId = adObject.adId,
	      ad = adObject.ad,
	      adUrl = adObject.adUrl,
	      width = adObject.width,
	      height = adObject.height;
	
	
	  if (adId) {
	    resizeRemoteCreative(adObject);
	    source.postMessage(JSON.stringify({
	      message: 'Prebid Response',
	      ad: ad,
	      adUrl: adUrl,
	      adId: adId,
	      width: width,
	      height: height
	    }), remoteDomain);
	  }
	}
	
	function resizeRemoteCreative(_ref) {
	  var adUnitCode = _ref.adUnitCode,
	      width = _ref.width,
	      height = _ref.height;
	
	  var iframe = document.getElementById(window.googletag.pubads().getSlots().find(function (slot) {
	    return slot.getAdUnitPath() === adUnitCode || slot.getSlotElementId() === adUnitCode;
	  }).getSlotElementId()).querySelector('iframe');
	
	  iframe.width = '' + width;
	  iframe.height = '' + height;
	}

/***/ },
/* 136 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _url = __webpack_require__(22);
	
	var _targeting = __webpack_require__(137);
	
	//Adserver parent class
	var AdServer = function AdServer(attr) {
	  this.name = attr.adserver;
	  this.code = attr.code;
	  this.getWinningBidByCode = function () {
	    return (0, _targeting.getWinningBids)(this.code)[0];
	  };
	};
	
	//DFP ad server
	exports.dfpAdserver = function (options, urlComponents) {
	  var adserver = new AdServer(options);
	  adserver.urlComponents = urlComponents;
	
	  var dfpReqParams = {
	    'env': 'vp',
	    'gdfp_req': '1',
	    'impl': 's',
	    'unviewed_position_start': '1'
	  };
	
	  var dfpParamsWithVariableValue = ['output', 'iu', 'sz', 'url', 'correlator', 'description_url', 'hl'];
	
	  var getCustomParams = function getCustomParams(targeting) {
	    return encodeURIComponent((0, _url.formatQS)(targeting));
	  };
	
	  adserver.appendQueryParams = function () {
	    var bid = adserver.getWinningBidByCode();
	    if (bid) {
	      this.urlComponents.search.description_url = encodeURIComponent(bid.descriptionUrl);
	      this.urlComponents.search.cust_params = getCustomParams(bid.adserverTargeting);
	      this.urlComponents.search.correlator = Date.now();
	    }
	  };
	
	  adserver.verifyAdserverTag = function () {
	    for (var key in dfpReqParams) {
	      if (!this.urlComponents.search.hasOwnProperty(key) || this.urlComponents.search[key] !== dfpReqParams[key]) {
	        return false;
	      }
	    }
	    for (var i in dfpParamsWithVariableValue) {
	      if (!this.urlComponents.search.hasOwnProperty(dfpParamsWithVariableValue[i])) {
	        return false;
	      }
	    }
	    return true;
	  };
	
	  return adserver;
	};

/***/ },
/* 137 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _utils = __webpack_require__(2);
	
	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	
	var bidmanager = __webpack_require__(11);
	var utils = __webpack_require__(2);
	var CONSTANTS = __webpack_require__(3);
	
	var targeting = exports;
	var pbTargetingKeys = [];
	
	targeting.resetPresetTargeting = function () {
	  if ((0, _utils.isGptPubadsDefined)()) {
	    window.googletag.pubads().getSlots().forEach(function (slot) {
	      pbTargetingKeys.forEach(function (key) {
	        // reset only registered adunits
	        pbjs.adUnits.find(function (unit) {
	          if (unit.code === slot.getAdUnitPath() || unit.code === slot.getSlotElementId()) {
	            slot.setTargeting(key, null);
	          }
	        });
	      });
	    });
	  }
	};
	
	targeting.getAllTargeting = function (adUnitCode) {
	  var adUnitCodes = adUnitCode && adUnitCode.length ? [adUnitCode] : pbjs._adUnitCodes;
	
	  // Get targeting for the winning bid. Add targeting for any bids that have
	  // `alwaysUseBid=true`. If sending all bids is enabled, add targeting for losing bids.
	  var targeting = getWinningBidTargeting(adUnitCodes).concat(getAlwaysUseBidTargeting(adUnitCodes)).concat(pbjs._sendAllBids ? getBidLandscapeTargeting(adUnitCodes) : []);
	
	  //store a reference of the targeting keys
	  targeting.map(function (adUnitCode) {
	    Object.keys(adUnitCode).map(function (key) {
	      adUnitCode[key].map(function (targetKey) {
	        if (pbTargetingKeys.indexOf(Object.keys(targetKey)[0]) === -1) {
	          pbTargetingKeys = Object.keys(targetKey).concat(pbTargetingKeys);
	        }
	      });
	    });
	  });
	  return targeting;
	};
	
	targeting.setTargeting = function (targetingConfig) {
	  window.googletag.pubads().getSlots().forEach(function (slot) {
	    targetingConfig.filter(function (targeting) {
	      return Object.keys(targeting)[0] === slot.getAdUnitPath() || Object.keys(targeting)[0] === slot.getSlotElementId();
	    }).forEach(function (targeting) {
	      return targeting[Object.keys(targeting)[0]].forEach(function (key) {
	        key[Object.keys(key)[0]].map(function (value) {
	          utils.logMessage('Attempting to set key value for slot: ' + slot.getSlotElementId() + ' key: ' + Object.keys(key)[0] + ' value: ' + value);
	          return value;
	        }).forEach(function (value) {
	          slot.setTargeting(Object.keys(key)[0], value);
	        });
	      });
	    });
	  });
	};
	
	targeting.getWinningBids = function (adUnitCode) {
	  // use the given adUnitCode as a filter if present or all adUnitCodes if not
	  var adUnitCodes = adUnitCode ? [adUnitCode] : pbjs._adUnitCodes;
	
	  return pbjs._bidsReceived.filter(function (bid) {
	    return adUnitCodes.includes(bid.adUnitCode);
	  }).filter(function (bid) {
	    return bid.cpm > 0;
	  }).map(function (bid) {
	    return bid.adUnitCode;
	  }).filter(_utils.uniques).map(function (adUnitCode) {
	    return pbjs._bidsReceived.filter(function (bid) {
	      return bid.adUnitCode === adUnitCode ? bid : null;
	    }).reduce(_utils.getHighestCpm, {
	      adUnitCode: adUnitCode,
	      cpm: 0,
	      adserverTargeting: {},
	      timeToRespond: 0
	    });
	  });
	};
	
	targeting.setTargetingForAst = function () {
	  var targeting = pbjs.getAdserverTargeting();
	  Object.keys(targeting).forEach(function (targetId) {
	    return Object.keys(targeting[targetId]).forEach(function (key) {
	      utils.logMessage('Attempting to set targeting for targetId: ' + targetId + ' key: ' + key + ' value: ' + targeting[targetId][key]);
	      //setKeywords supports string and array as value
	      if (utils.isStr(targeting[targetId][key]) || utils.isArray(targeting[targetId][key])) {
	        var keywordsObj = {};
	        var input = 'hb_adid';
	        var nKey = key.substring(0, input.length) === input ? key.toUpperCase() : key;
	        keywordsObj[nKey] = targeting[targetId][key];
	        window.apntag.setKeywords(targetId, keywordsObj);
	      }
	    });
	  });
	};
	
	function getWinningBidTargeting() {
	  var winners = targeting.getWinningBids();
	  var standardKeys = getStandardKeys();
	
	  winners = winners.map(function (winner) {
	    return _defineProperty({}, winner.adUnitCode, Object.keys(winner.adserverTargeting).filter(function (key) {
	      return typeof winner.sendStandardTargeting === "undefined" || winner.sendStandardTargeting || standardKeys.indexOf(key) === -1;
	    }).map(function (key) {
	      return _defineProperty({}, key.substring(0, 20), [winner.adserverTargeting[key]]);
	    }));
	  });
	
	  return winners;
	}
	
	function getStandardKeys() {
	  return bidmanager.getStandardBidderAdServerTargeting() // in case using a custom standard key set
	  .map(function (targeting) {
	    return targeting.key;
	  }).concat(CONSTANTS.TARGETING_KEYS).filter(_utils.uniques); // standard keys defined in the library.
	}
	
	/**
	 * Get custom targeting keys for bids that have `alwaysUseBid=true`.
	 */
	function getAlwaysUseBidTargeting(adUnitCodes) {
	  var standardKeys = getStandardKeys();
	  return pbjs._bidsReceived.filter(_utils.adUnitsFilter.bind(this, adUnitCodes)).map(function (bid) {
	    if (bid.alwaysUseBid) {
	      return _defineProperty({}, bid.adUnitCode, Object.keys(bid.adserverTargeting).map(function (key) {
	        // Get only the non-standard keys of the losing bids, since we
	        // don't want to override the standard keys of the winning bid.
	        if (standardKeys.indexOf(key) > -1) {
	          return;
	        }
	
	        return _defineProperty({}, key.substring(0, 20), [bid.adserverTargeting[key]]);
	      }).filter(function (key) {
	        return key;
	      }));
	    }
	  }).filter(function (bid) {
	    return bid;
	  }); // removes empty elements in array;
	}
	
	function getBidLandscapeTargeting(adUnitCodes) {
	  var standardKeys = CONSTANTS.TARGETING_KEYS;
	
	  return pbjs._bidsReceived.filter(_utils.adUnitsFilter.bind(this, adUnitCodes)).map(function (bid) {
	    if (bid.adserverTargeting) {
	      return _defineProperty({}, bid.adUnitCode, getTargetingMap(bid, standardKeys.filter(function (key) {
	        return typeof bid.adserverTargeting[key] !== 'undefined';
	      }) // mainly for possibly
	      // unset hb_deal
	      ));
	    }
	  }).filter(function (bid) {
	    return bid;
	  }); // removes empty elements in array
	}
	
	function getTargetingMap(bid, keys) {
	  return keys.map(function (key) {
	    return _defineProperty({}, (key + '_' + bid.bidderCode).substring(0, 20), [bid.adserverTargeting[key]]);
	  });
	}
	
	targeting.isApntagDefined = function () {
	  if (window.apntag && utils.isFn(window.apntag.setKeywords)) {
	    return true;
	  }
	};

/***/ }
/******/ ]);
//# sourceMappingURL=prebid.js.map