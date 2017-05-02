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
	
	__webpack_require__(16);
	
	var _url = __webpack_require__(11);
	
	var _cpmBucketManager = __webpack_require__(14);
	
	var _secureCreatives = __webpack_require__(64);
	
	var _adloader = __webpack_require__(65);
	
	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	
	var pbjs = (0, _prebidGlobal.getGlobal)();
	var CONSTANTS = __webpack_require__(3);
	var utils = __webpack_require__(2);
	var bidmanager = __webpack_require__(13);
	var adaptermanager = __webpack_require__(5);
	var bidfactory = __webpack_require__(12);
	var events = __webpack_require__(8);
	var adserver = __webpack_require__(66);
	var targeting = __webpack_require__(67);
	
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
	pbjs.version = 'v0.22.2';
	utils.logInfo('Prebid.js v0.22.2 loaded');
	
	//create adUnit array
	pbjs.adUnits = pbjs.adUnits || [];
	
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
	      var adObject = pbjs._bidsReceived.find(function (bid) {
	        return bid.adId === id;
	      });
	      if (adObject) {
	        //save winning bids
	        pbjs._winningBids.push(adObject);
	
	        //emit 'bid won' event here
	        events.emit(BID_WON, adObject);
	
	        var height = adObject.height,
	            width = adObject.width,
	            ad = adObject.ad,
	            mediaType = adObject.mediaType,
	            url = adObject.adUrl,
	            renderer = adObject.renderer;
	
	
	        if (renderer && renderer.url) {
	          renderer.render(adObject);
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
	 * @return {string}     HTML snippet that contains the iframe src = set to `url`
	 */
	exports.createTrackPixelIframeHtml = function (url) {
	  if (!url) {
	    return '';
	  }
	
	  return '<iframe frameborder="0" allowtransparency="true" marginheight="0" marginwidth="0" width="0" hspace="0" vspace="0" height="0" style="height:0p;width:0p;display:none;" scrolling="no" src="' + encodeURI(url) + '"></iframe>';
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
		"REPO_AND_VERSION": "prebid_prebid_0.22.2",
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
		]
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
	        bidId: utils.getUniqueIdentifierStr(),
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
	
	var AudienceNetworkAdapter = __webpack_require__(9);
	exports.registerBidAdapter(new AudienceNetworkAdapter(), 'audienceNetwork');
	exports.videoAdapters = [];
	
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
	    if (_mapping.sizes) {
	      return _mapping.sizes;
	    }
	    return adUnit.sizes;
	  }
	  var sizes = '';
	  var mapping = adUnit.sizeMapping.find(function (sizeMapping) {
	    return width > sizeMapping.minWidth;
	  });
	  if (mapping && mapping.sizes) {
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
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /**
	                                                                                                                                                                                                                                                                               * @file AudienceNetwork adapter.
	                                                                                                                                                                                                                                                                               */
	
	
	var _ajax = __webpack_require__(10);
	
	var _bidfactory = __webpack_require__(12);
	
	var _bidmanager = __webpack_require__(13);
	
	var _constants = __webpack_require__(3);
	
	var _url = __webpack_require__(11);
	
	var _utils = __webpack_require__(2);
	
	var _adapter = __webpack_require__(15);
	
	var baseAdapter = (0, _adapter.createNew)('audienceNetwork');
	var setBidderCode = baseAdapter.setBidderCode;
	var getBidderCode = baseAdapter.getBidderCode;
	
	/**
	 * Does this bid request contain valid parameters?
	 * @param {Object} bid
	 * @returns {Boolean}
	 */
	var validateBidRequest = function validateBidRequest(bid) {
	  return _typeof(bid.params) === 'object' && typeof bid.params.placementId === 'string' && bid.params.placementId.length > 0 && Array.isArray(bid.sizes) && bid.sizes.length > 0;
	};
	
	/**
	 * Does this bid request contain valid sizes?
	 * @param {Object} bid
	 * @returns {Boolean}
	 */
	var validateBidRequestSizes = function validateBidRequestSizes(bid) {
	  bid.sizes = bid.sizes.map(flattenSize);
	  return bid.sizes.every(function (size) {
	    return ['native', 'fullwidth', '300x250', '320x50'].includes(size);
	  });
	};
	
	/**
	 * Flattens a 2-element [W, H] array as a 'WxH' string,
	 * otherwise passes value through.
	 * @params {Array|String} size
	 * @returns {String}
	 */
	var flattenSize = function flattenSize(size) {
	  return Array.isArray(size) && size.length === 2 ? size[0] + 'x' + size[1] : size;
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
	 * Is this a native advert size?
	 * @param {String} size
	 * @returns {Boolean}
	 */
	var isNative = function isNative(size) {
	  return ['native', 'fullwidth'].includes(size);
	};
	
	/**
	 * Generate ad HTML for injection into an iframe
	 * @param {String} placementId
	 * @param {String} size
	 * @param {String} bidId
	 * @returns {String} HTML
	 */
	var createAdHtml = function createAdHtml(placementId, size, bidId) {
	  var nativeStyle = isNative(size) ? '<script>window.onload=function(){if(parent){var o=document.getElementsByTagName("head")[0];var s=parent.document.getElementsByTagName("style");for(var i=0;i<s.length;i++)o.appendChild(s[i].cloneNode(true));}}</script>' : '';
	  var nativeContainer = isNative(size) ? '<div class="thirdPartyRoot"><a class="fbAdLink"><div class="fbAdMedia thirdPartyMediaClass"></div><div class="fbAdSubtitle thirdPartySubtitleClass"></div><div class="fbDefaultNativeAdWrapper"><div class="fbAdCallToAction thirdPartyCallToActionClass"></div><div class="fbAdTitle thirdPartyTitleClass"></div></div></a></div>' : '';
	  return '<html><head>' + nativeStyle + '</head><body><div style="display:none;position:relative;">\n   <script type="text/javascript">var data = {placementid:\'' + placementId + '\',format:\'' + size + '\',bidid:\'' + bidId + '\',onAdLoaded:function(e){console.log(\'Audience Network [' + placementId + '] ad loaded\');e.style.display = \'block\';},onAdError:function(c,m){console.log(\'Audience Network [' + placementId + '] error (\' + c + \') \' + m);}};\n   (function(a,b,c){var d="https://www.facebook.com",e=\'https://connect.facebook.net/en_US/fbadnw55.js\',f={iframeLoaded:true,xhrLoaded:true},g=a.data,h=function(){if(Date.now){return Date.now();}else return +new Date();},i=function(aa){var ba=d+"/audience_network/client_event",ca={cb:h(),event_name:"ADNW_ADERROR",ad_pivot_type:"audience_network_mobile_web",sdk_version:"5.5.web",app_id:g.placementid.split("_")[0],publisher_id:g.placementid.split("_")[1],error_message:aa},da=[];for(var ea in ca)da.push(encodeURIComponent(ea)+"="+encodeURIComponent(ca[ea]));var fa=ba+"?"+da.join("&"),ga=new XMLHttpRequest();ga.open("GET",fa,true);ga.send();if(g.onAdError)g.onAdError("1000","Internal error.");},j=function(){if(b.currentScript){return b.currentScript;}else{var aa=b.getElementsByTagName("script");return aa[aa.length-1];}},k=function(aa){try{return aa.document.referrer;}catch(ba){}return "";},l=function(){var aa=a,ba=[aa];try{while(aa!==aa.parent&&aa.parent.document)ba.push(aa=aa.parent);}catch(ca){}return ba.reverse();},m=function(){var aa=l();for(var ba=0;ba<aa.length;ba++){var ca=aa[ba],da=ca.ADNW||{};ca.ADNW=da;if(!ca.ADNW)continue;return da.v55=da.v55||{ads:[],window:ca};}throw new Error("no_writable_global");},n=function(aa){var ba=aa.indexOf("/",aa.indexOf("://")+3);if(ba===-1)return aa;return aa.substring(0,ba);},o=function(aa){return aa.location.href||k(aa);},p=function(aa){if(aa.sdkLoaded)return;var ba=aa.window.document,ca=ba.createElement("iframe");ca.name="fbadnw";ca.style.display="none";ba.body.appendChild(ca);var da=ca.contentDocument.createElement("script");da.src=e;da.async=true;ca.contentDocument.body.appendChild(da);aa.sdkLoaded=true;},q=function(aa){var ba=/^https?:\\/\\/www\\.google(\\.com?)?.\\w{2,3}$/;return !!aa.match(ba);},r=function(aa){return !!aa.match(/cdn.ampproject.org$/);},s=function(){var aa=c.ancestorOrigins||[],ba=aa[aa.length-1]||c.origin,ca=aa[aa.length-2]||c.origin;if(q(ba)&&r(ca)){return n(ca);}else return n(ba);},t=function(aa){try{return JSON.parse(aa);}catch(ba){i(ba.message);throw ba;}},u=function(aa,ba,ca){if(!aa.iframe){var da=ca.createElement("iframe");da.src=d+"/audiencenetwork/iframe/";da.style.display="none";ca.body.appendChild(da);aa.iframe=da;aa.iframeAppendedTime=h();aa.iframeData={};}ba.iframe=aa.iframe;ba.iframeData=aa.iframeData;ba.tagJsIframeAppendedTime=aa.iframeAppendedTime||0;},v=function(aa){var ba=d+"/audiencenetwork/xhr/?sdk=5.5.web";for(var ca in aa)if(typeof aa[ca]!=="function")ba+="&"+ca+"="+encodeURIComponent(aa[ca]);var da=new XMLHttpRequest();da.open("GET",ba,true);da.withCredentials=true;da.onreadystatechange=function(){if(da.readyState===4){var ea=t(da.response);aa.events.push({name:"xhrLoaded",source:aa.iframe.contentWindow,data:ea,postMessageTimestamp:h(),receivedTimestamp:h()});}};da.send();},w=function(aa,ba){var ca=d+"/audiencenetwork/xhriframe/?sdk=5.5.web";for(var da in ba)if(typeof ba[da]!=="function")ca+="&"+da+"="+encodeURIComponent(ba[da]);var ea=b.createElement("iframe");ea.src=ca;ea.style.display="none";b.body.appendChild(ea);ba.iframe=ea;ba.iframeData={};ba.tagJsIframeAppendedTime=h();},x=function(aa){var ba=function(event){try{var da=event.data;if(da.name in f)aa.events.push({name:da.name,source:event.source,data:da.data});}catch(ea){}},ca=aa.iframe.contentWindow.parent;ca.addEventListener("message",ba,false);},y=function(aa){if(aa.context&&aa.context.sourceUrl)return true;try{return !!JSON.parse(decodeURI(aa.name)).ampcontextVersion;}catch(ba){return false;}},z=function(aa){var ba=h(),ca=l()[0],da=j().parentElement,ea=ca!=a.top,fa=ca.$sf&&ca.$sf.ext,ga=o(ca),ha=m();p(ha);var ia={amp:y(ca),events:[],tagJsInitTime:ba,rootElement:da,iframe:null,tagJsIframeAppendedTime:ha.iframeAppendedTime||0,url:ga,domain:s(),channel:n(o(ca)),width:screen.width,height:screen.height,pixelratio:a.devicePixelRatio,placementindex:ha.ads.length,crossdomain:ea,safeframe:!!fa,placementid:g.placementid,format:g.format||"300x250",testmode:!!g.testmode,onAdLoaded:g.onAdLoaded,onAdError:g.onAdError};if(g.bidid)ia.bidid=g.bidid;if(ea){w(ha,ia);}else{u(ha,ia,ca.document);v(ia);}x(ia);ia.rootElement.dataset.placementid=ia.placementid;ha.ads.push(ia);};try{z();}catch(aa){i(aa.message||aa);throw aa;}})(window,document,location);\n </script>\n ' + nativeContainer + '</div></body></html>';
	};
	
	/**
	 * Creates a "good" Bid object with the given bid ID and CPM.
	 * @param {String} placementId
	 * @param {String} bidId
	 * @param {String} size
	 * @param {Number} cpmCents
	 * @returns {Object} Bid
	 */
	var createSuccessBidResponse = function createSuccessBidResponse(placementId, size, bidId, cpmCents) {
	  var bid = (0, _bidfactory.createBid)(_constants.STATUS.GOOD, { bidId: bidId });
	  // Prebid attributes
	  bid.bidderCode = getBidderCode();
	  bid.cpm = cpmCents / 100;
	  bid.ad = createAdHtml(placementId, size, bidId);
	  if (!isNative(size)) {
	    var _size$split$map = size.split('x').map(Number);
	
	    var _size$split$map2 = _slicedToArray(_size$split$map, 2);
	
	    bid.width = _size$split$map2[0];
	    bid.height = _size$split$map2[1];
	  }
	  // Audience Network attributes
	  bid.hb_bidder = 'fan';
	  bid.fb_bidid = bidId;
	  bid.fb_format = size;
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
	 * @param {Array} params.bids[].sizes - list of accepted advert sizes
	 * @param {Array|String} params.bids[].sizes[] - one of 'native', '300x250', '300x50', [300, 250], [300, 50]
	 * @returns {void}
	 */
	var callBids = function callBids(bidRequest) {
	  // Build lists of adUnitCodes, placementids and adformats
	  var adUnitCodes = [];
	  var placementids = [];
	  var adformats = [];
	  bidRequest.bids.filter(validateBidRequest).filter(validateBidRequestSizes).forEach(function (bid) {
	    return bid.sizes.forEach(function (size) {
	      adUnitCodes.push(bid.placementCode);
	      placementids.push(bid.params.placementId);
	      adformats.push(size);
	    });
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
	          return (0, _bidmanager.addBidResponse)(adUnitCodes[i], createSuccessBidResponse(bid.placement_id, adformats[i], bid.bid_id, bid.bid_price_cents));
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
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	exports.ajax = ajax;
	
	var _url = __webpack_require__(11);
	
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
/* 11 */
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
/* 12 */
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
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _utils = __webpack_require__(2);
	
	var _cpmBucketManager = __webpack_require__(14);
	
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
	
	function getBidderRequest(bidder, adUnitCode) {
	  return pbjs._bidsRequested.find(function (request) {
	    return request.bids.filter(function (bid) {
	      return bid.bidder === bidder && bid.placementCode === adUnitCode;
	    }).length > 0;
	  }) || { start: null, requestId: null };
	}
	
	/*
	 *   This function should be called to by the bidder adapter to register a bid response
	 */
	exports.addBidResponse = function (adUnitCode, bid) {
	  if (!adUnitCode) {
	    utils.logWarn('No adUnitCode supplied to addBidResponse, response discarded');
	    return;
	  }
	
	  if (bid) {
	    var _getBidderRequest = getBidderRequest(bid.bidderCode, adUnitCode),
	        requestId = _getBidderRequest.requestId,
	        start = _getBidderRequest.start;
	
	    _extends(bid, {
	      requestId: requestId,
	      responseTimestamp: timestamp(),
	      requestTimestamp: start,
	      cpm: bid.cpm || 0,
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
/* 14 */
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
/* 15 */
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
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	/** @module polyfill
	Misc polyfills
	*/
	/*jshint -W121 */
	__webpack_require__(17);
	__webpack_require__(50);
	__webpack_require__(55);
	
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
	Number.isInteger = Number.isInteger || function (value) {
	  return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
	};

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(18);
	module.exports = __webpack_require__(21).Array.find;

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
	var $export = __webpack_require__(19)
	  , $find   = __webpack_require__(37)(5)
	  , KEY     = 'find'
	  , forced  = true;
	// Shouldn't skip holes
	if(KEY in [])Array(1)[KEY](function(){ forced = false; });
	$export($export.P + $export.F * forced, 'Array', {
	  find: function find(callbackfn/*, that = undefined */){
	    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});
	__webpack_require__(49)(KEY);

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(20)
	  , core      = __webpack_require__(21)
	  , hide      = __webpack_require__(22)
	  , redefine  = __webpack_require__(32)
	  , ctx       = __webpack_require__(35)
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
/* 20 */
/***/ function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ },
/* 21 */
/***/ function(module, exports) {

	var core = module.exports = {version: '2.4.0'};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var dP         = __webpack_require__(23)
	  , createDesc = __webpack_require__(31);
	module.exports = __webpack_require__(27) ? function(object, key, value){
	  return dP.f(object, key, createDesc(1, value));
	} : function(object, key, value){
	  object[key] = value;
	  return object;
	};

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var anObject       = __webpack_require__(24)
	  , IE8_DOM_DEFINE = __webpack_require__(26)
	  , toPrimitive    = __webpack_require__(30)
	  , dP             = Object.defineProperty;
	
	exports.f = __webpack_require__(27) ? Object.defineProperty : function defineProperty(O, P, Attributes){
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
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(25);
	module.exports = function(it){
	  if(!isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ },
/* 25 */
/***/ function(module, exports) {

	module.exports = function(it){
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = !__webpack_require__(27) && !__webpack_require__(28)(function(){
	  return Object.defineProperty(__webpack_require__(29)('div'), 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(28)(function(){
	  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 28 */
/***/ function(module, exports) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(25)
	  , document = __webpack_require__(20).document
	  // in old IE typeof document.createElement is 'object'
	  , is = isObject(document) && isObject(document.createElement);
	module.exports = function(it){
	  return is ? document.createElement(it) : {};
	};

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.1 ToPrimitive(input [, PreferredType])
	var isObject = __webpack_require__(25);
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
/* 31 */
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
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(20)
	  , hide      = __webpack_require__(22)
	  , has       = __webpack_require__(33)
	  , SRC       = __webpack_require__(34)('src')
	  , TO_STRING = 'toString'
	  , $toString = Function[TO_STRING]
	  , TPL       = ('' + $toString).split(TO_STRING);
	
	__webpack_require__(21).inspectSource = function(it){
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
/* 33 */
/***/ function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function(it, key){
	  return hasOwnProperty.call(it, key);
	};

/***/ },
/* 34 */
/***/ function(module, exports) {

	var id = 0
	  , px = Math.random();
	module.exports = function(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(36);
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
/* 36 */
/***/ function(module, exports) {

	module.exports = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	// 0 -> Array#forEach
	// 1 -> Array#map
	// 2 -> Array#filter
	// 3 -> Array#some
	// 4 -> Array#every
	// 5 -> Array#find
	// 6 -> Array#findIndex
	var ctx      = __webpack_require__(35)
	  , IObject  = __webpack_require__(38)
	  , toObject = __webpack_require__(40)
	  , toLength = __webpack_require__(42)
	  , asc      = __webpack_require__(44);
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
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(39);
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ },
/* 39 */
/***/ function(module, exports) {

	var toString = {}.toString;
	
	module.exports = function(it){
	  return toString.call(it).slice(8, -1);
	};

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.13 ToObject(argument)
	var defined = __webpack_require__(41);
	module.exports = function(it){
	  return Object(defined(it));
	};

/***/ },
/* 41 */
/***/ function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.15 ToLength
	var toInteger = __webpack_require__(43)
	  , min       = Math.min;
	module.exports = function(it){
	  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

/***/ },
/* 43 */
/***/ function(module, exports) {

	// 7.1.4 ToInteger
	var ceil  = Math.ceil
	  , floor = Math.floor;
	module.exports = function(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
	var speciesConstructor = __webpack_require__(45);
	
	module.exports = function(original, length){
	  return new (speciesConstructor(original))(length);
	};

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(25)
	  , isArray  = __webpack_require__(46)
	  , SPECIES  = __webpack_require__(47)('species');
	
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
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	// 7.2.2 IsArray(argument)
	var cof = __webpack_require__(39);
	module.exports = Array.isArray || function isArray(arg){
	  return cof(arg) == 'Array';
	};

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	var store      = __webpack_require__(48)('wks')
	  , uid        = __webpack_require__(34)
	  , Symbol     = __webpack_require__(20).Symbol
	  , USE_SYMBOL = typeof Symbol == 'function';
	
	var $exports = module.exports = function(name){
	  return store[name] || (store[name] =
	    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
	};
	
	$exports.store = store;

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	var global = __webpack_require__(20)
	  , SHARED = '__core-js_shared__'
	  , store  = global[SHARED] || (global[SHARED] = {});
	module.exports = function(key){
	  return store[key] || (store[key] = {});
	};

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	// 22.1.3.31 Array.prototype[@@unscopables]
	var UNSCOPABLES = __webpack_require__(47)('unscopables')
	  , ArrayProto  = Array.prototype;
	if(ArrayProto[UNSCOPABLES] == undefined)__webpack_require__(22)(ArrayProto, UNSCOPABLES, {});
	module.exports = function(key){
	  ArrayProto[UNSCOPABLES][key] = true;
	};

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(51);
	module.exports = __webpack_require__(21).Array.includes;

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// https://github.com/tc39/Array.prototype.includes
	var $export   = __webpack_require__(19)
	  , $includes = __webpack_require__(52)(true);
	
	$export($export.P, 'Array', {
	  includes: function includes(el /*, fromIndex = 0 */){
	    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});
	
	__webpack_require__(49)('includes');

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	// false -> Array#indexOf
	// true  -> Array#includes
	var toIObject = __webpack_require__(53)
	  , toLength  = __webpack_require__(42)
	  , toIndex   = __webpack_require__(54);
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
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(38)
	  , defined = __webpack_require__(41);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(43)
	  , max       = Math.max
	  , min       = Math.min;
	module.exports = function(index, length){
	  index = toInteger(index);
	  return index < 0 ? max(index + length, 0) : min(index, length);
	};

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(56);
	module.exports = __webpack_require__(21).Object.assign;

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.1 Object.assign(target, source)
	var $export = __webpack_require__(19);
	
	$export($export.S + $export.F, 'Object', {assign: __webpack_require__(57)});

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// 19.1.2.1 Object.assign(target, source, ...)
	var getKeys  = __webpack_require__(58)
	  , gOPS     = __webpack_require__(62)
	  , pIE      = __webpack_require__(63)
	  , toObject = __webpack_require__(40)
	  , IObject  = __webpack_require__(38)
	  , $assign  = Object.assign;
	
	// should work with symbols and should have deterministic property order (V8 bug)
	module.exports = !$assign || __webpack_require__(28)(function(){
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
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)
	var $keys       = __webpack_require__(59)
	  , enumBugKeys = __webpack_require__(61);
	
	module.exports = Object.keys || function keys(O){
	  return $keys(O, enumBugKeys);
	};

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	var has          = __webpack_require__(33)
	  , toIObject    = __webpack_require__(53)
	  , arrayIndexOf = __webpack_require__(52)(false)
	  , IE_PROTO     = __webpack_require__(60)('IE_PROTO');
	
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
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	var shared = __webpack_require__(48)('keys')
	  , uid    = __webpack_require__(34);
	module.exports = function(key){
	  return shared[key] || (shared[key] = uid(key));
	};

/***/ },
/* 61 */
/***/ function(module, exports) {

	// IE 8- don't enum bug keys
	module.exports = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');

/***/ },
/* 62 */
/***/ function(module, exports) {

	exports.f = Object.getOwnPropertySymbols;

/***/ },
/* 63 */
/***/ function(module, exports) {

	exports.f = {}.propertyIsEnumerable;

/***/ },
/* 64 */
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
/* 65 */
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
	
	//track a impbus tracking pixel
	//TODO: Decide if tracking via AJAX is sufficent, or do we need to
	//run impression trackers via page pixels?
	exports.trackPixel = function (pixelUrl) {
	  var delimiter = void 0;
	  var trackingPixel = void 0;
	
	  if (!pixelUrl || typeof pixelUrl !== 'string') {
	    utils.logMessage('Missing or invalid pixelUrl.');
	    return;
	  }
	
	  delimiter = pixelUrl.indexOf('?') > 0 ? '&' : '?';
	
	  //add a cachebuster so we don't end up dropping any impressions
	  trackingPixel = pixelUrl + delimiter + 'rnd=' + Math.floor(Math.random() * 1E7);
	  new Image().src = trackingPixel;
	  return trackingPixel;
	};

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _url = __webpack_require__(11);
	
	var _targeting = __webpack_require__(67);
	
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
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _utils = __webpack_require__(2);
	
	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	
	var bidmanager = __webpack_require__(13);
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