(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["log4js2"] = factory();
	else
		root["log4js2"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	exports.__esModule = true;
	exports.configure = configure;
	exports.addAppender = addAppender;
	exports.append = append;
	exports.getApplicationInfo = getApplicationInfo;
	exports.getLogger = getLogger;
	exports.setLogLevel = setLogLevel;
	// istanbul ignore next

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

	/**
	 * log4js <https://github.com/anigenero/log4js>
	 *
	 * Copyright 2016 Robin Schultz <http://cunae.com>
	 * Released under the MIT License
	 */

	var _formatter = __webpack_require__(1);

	var formatter = _interopRequireWildcard(_formatter);

	var _loggerLogger = __webpack_require__(6);

	var _constLogLevel = __webpack_require__(3);

	var LogLevel = _interopRequireWildcard(_constLogLevel);

	var _appendersConsoleAppender = __webpack_require__(8);

	var consoleAppender = _interopRequireWildcard(_appendersConsoleAppender);

	/**
	 * Holds the definition for the appender closure
	 *
	 * @typedef {{ append : function (number, LOG_EVENT), isActive : function(),
	 *          setLogLevel : function(number), setTagLayout : function(string) }}
	 */
	var APPENDER;

	/**
	 * @typedef {{ allowAppenderInjection : boolean, appenders : Array.<APPENDER>,
	 * 			application : Object, loggers : Array.<LOGGER>, tagLayout : string }}
	 */
	var CONFIG_PARAMS;

	/**
	 * Holds the definition for the log event object
	 *
	 * @typedef {{ error : Error, message : string, properties : Object,
	 *          timestamp : string }}
	 */
	var LOG_EVENT;

	/**
	 * @typedef {{ logLevel : number }}
	 */
	var LOGGER;

	/** @const */
	var DEFAULT_CONFIG = {
		tagLayout: '%d{HH:mm:ss} [%level] %logger - %message',
		appenders: ['consoleAppender'],
		loggers: [{
			logLevel: LogLevel.INFO
		}],
		allowAppenderInjection: true
	};

	/** @type {Array.<APPENDER>} */
	var appenders_ = [];
	/** @type {?CONFIG_PARAMS} */
	var configuration_ = null;
	/** @type {boolean} */
	var finalized_ = false;
	/** @type {Object} */
	var loggers_ = {};

	exports.LogLevel = LogLevel;

	/**
	 * Configures the logger
	 *
	 * @function
	 *
	 * @params {CONFIG_PARAMS} config
	 */

	function configure(config) {

		if (finalized_) {
			append(LogLevel.ERROR, 'Could not configure. LogUtility already in use');
			return;
		}

		configureAppenders_(config.appenders, function () {

			configureLoggers_(config.loggers);

			if (config.tagLayout) {
				formatter.preCompile(config.tagLayout);
				for (var logKey in loggers_) {
					if (loggers_.hasOwnProperty(logKey)) {
						for (var key in loggers_[logKey]) {
							if (loggers_[logKey].hasOwnProperty(key)) {
								loggers_[logKey][key].setTagLayout(config.tagLayout);
							}
						}
					}
				}
			}

			configuration_ = config;
		});
	}

	var configureAppenders_ = function configureAppenders_(appenders, callback) {

		if (appenders instanceof Array) {
			var count = appenders.length;
			for (var i = 0; i < count; i++) {
				callback();
			}
		}
	};

	var configureLoggers_ = function configureLoggers_(loggers) {

		if (!(loggers instanceof Array)) {
			throw new Error("Invalid loggers");
		}

		var count = loggers.length;
		for (var i = 0; i < count; i++) {

			if (!loggers[i].tag) {
				loggers_['main'] = getLoggers_(loggers[i].logLevel);
			} else {
				loggers_[loggers[i].tag] = getLoggers_(loggers[i].logLevel);
			}
		}
	};

	var getLoggers_ = function getLoggers_(logLevel) {

		var logger;
		var loggers = [];
		var count = appenders_.length;
		while (count--) {
			logger = appenders_[count]();
			logger.setLogLevel(logLevel);
			loggers.push(logger);
		}

		return loggers;
	};

	/**
	 * Adds an appender to the appender queue. If the stack is finalized, and
	 * the allowAppenderInjection is set to false, then the event will not be
	 * appended
	 *
	 * @function
	 *
	 * @params {APPENDER} appender
	 */

	function addAppender(appender) {

		if (finalized_ && !configuration_.allowAppenderInjection) {
			console.error('Cannot add appender when configuration finalized');
			return;
		}

		validateAppender_(appender);
		appenders_.push(appender);
	}

	/**
	 * Validates that the appender
	 *
	 * @function
	 *
	 * @params {APPENDER} appender
	 */
	var validateAppender_ = function validateAppender_(appender) {

		if (appender == null || typeof appender !== 'function') {
			throw new Error('Invalid appender: not an function');
		}

		var appenderObj = appender();

		var appenderMethods = ['append', 'getName', 'isActive', 'setLogLevel', 'setTagLayout'];
		for (var key in appenderMethods) {
			if (appenderMethods.hasOwnProperty(key) && appenderObj[appenderMethods[key]] == undefined || typeof appenderObj[appenderMethods[key]] != 'function') {
				throw new Error('Invalid appender: missing method: ' + appenderMethods[key]);
			}
		}

		if (configuration_ instanceof Object && configuration_.tagLayout) {
			appenderObj.setTagLayout(configuration_.tagLayout);
		}
	};

	/**
	 * Appends the log event
	 *
	 * @function
	 *
	 * @param {Object} loggingEvent
	 */

	function append(loggingEvent) {

		// finalize the configuration to make sure no other appenders are injected (if set)
		finalized_ = true;

		var loggers;
		if (loggers_[loggingEvent.logger]) {
			loggers = loggers_[loggingEvent.logger];
		} else {
			loggers = loggers_['main'];
		}

		var count = loggers.length;
		while (count--) {
			if (loggers[count].isActive(loggingEvent.level)) {
				loggers[count].append(loggingEvent);
			}
		}
	}

	/**
	 * @private
	 * @function
	 *
	 * @param {number} level
	 */
	var validateLevel_ = function validateLevel_(level) {

		for (var key in LogLevel) {
			if (level === LogLevel[key]) {
				return;
			}
		}

		throw new Error('Invalid log level: ' + level);
	};

	/**
	 * Gets the application information from the configuration
	 * @return {Object}
	 */

	function getApplicationInfo() {
		if (configuration_.application != null) {
			return configuration_.application;
		} else {
			return null;
		}
	}

	/**
	 * Handles creating the logger and returning it
	 * @param {string} context
	 * @return {Logger}
	 */

	function getLogger(context) {

		// we need to initialize if we haven't
		if (configuration_ === null) {
			configure(DEFAULT_CONFIG);
		}

		return new _loggerLogger.Logger(context, {
			append: append
		});
	}

	/**
	 * Sets the log level for all loggers
	 * @param {number} logLevel
	 */

	function setLogLevel(logLevel) {

		validateLevel_(logLevel);

		for (var logKey in loggers_) {
			if (loggers_.hasOwnProperty(logKey)) {
				for (var key in loggers_[logKey]) {
					if (loggers_[logKey].hasOwnProperty(key)) {
						loggers_[logKey][key].setLogLevel(logLevel);
					}
				}
			}
		}
	}

	addAppender(consoleAppender.ConsoleAppender);
	//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sb2dNYW5hZ2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt5QkFPMkIsYUFBYTs7SUFBNUIsU0FBUzs7NEJBQ0UsaUJBQWlCOzs2QkFDZCxrQkFBa0I7O0lBQWhDLFFBQVE7O3dDQUVhLDZCQUE2Qjs7SUFBbEQsZUFBZTs7Ozs7Ozs7QUFRM0IsSUFBSSxRQUFRLENBQUM7Ozs7OztBQU1iLElBQUksYUFBYSxDQUFDOzs7Ozs7OztBQVFsQixJQUFJLFNBQVMsQ0FBQzs7Ozs7QUFLZCxJQUFJLE1BQU0sQ0FBQzs7O0FBR1gsSUFBTSxjQUFjLEdBQUc7QUFDdEIsVUFBUyxFQUFHLDBDQUEwQztBQUN0RCxVQUFTLEVBQUcsQ0FBRSxpQkFBaUIsQ0FBRTtBQUNqQyxRQUFPLEVBQUcsQ0FBRTtBQUNYLFVBQVEsRUFBRyxRQUFRLENBQUMsSUFBSTtFQUN4QixDQUFFO0FBQ0gsdUJBQXNCLEVBQUcsSUFBSTtDQUM3QixDQUFDOzs7QUFHRixJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7O0FBRXBCLElBQUksY0FBYyxHQUFHLElBQUksQ0FBQzs7QUFFMUIsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDOztBQUV2QixJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7O1FBRVYsUUFBUSxHQUFSLFFBQVE7Ozs7Ozs7Ozs7QUFTVCxTQUFTLFNBQVMsQ0FBQyxNQUFNLEVBQUU7O0FBRWpDLEtBQUksVUFBVSxFQUFFO0FBQ2YsUUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsZ0RBQWdELENBQUMsQ0FBQztBQUN6RSxTQUFPO0VBQ1A7O0FBRUQsb0JBQW1CLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxZQUFZOztBQUVqRCxtQkFBaUIsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRWxDLE1BQUksTUFBTSxDQUFDLFNBQVMsRUFBRTtBQUNyQixZQUFTLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENB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QUMsRUFBRTtBQUN6QyxhQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQzVDO0lBQ0Q7R0FDRDtFQUNEO0NBRUQ7O0FBRUQsV0FBVyxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQyIsImZpbGUiOiJsb2dNYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIGxvZzRqcyA8aHR0cHM6Ly9naXRodWIuY29tL2FuaWdlbmVyby9sb2c0anM+XHJcbiAqXHJcbiAqIENvcHlyaWdodCAyMDE2IFJvYmluIFNjaHVsdHogPGh0dHA6Ly9jdW5hZS5jb20+XHJcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCAqIGFzIGZvcm1hdHRlciBmcm9tICcuL2Zvcm1hdHRlcic7XHJcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gJy4vbG9nZ2VyL2xvZ2dlcic7XHJcbmltcG9ydCAqIGFzIExvZ0xldmVsIGZyb20gJy4vY29uc3QvbG9nTGV2ZWwnO1xyXG5cclxuaW1wb3J0ICogYXMgY29uc29sZUFwcGVuZGVyIGZyb20gJy4vYXBwZW5kZXJzL2NvbnNvbGVBcHBlbmRlcic7XHJcblxyXG4vKipcclxuICogSG9sZHMgdGhlIGRlZmluaXRpb24gZm9yIHRoZSBhcHBlbmRlciBjbG9zdXJlXHJcbiAqXHJcbiAqIEB0eXBlZGVmIHt7IGFwcGVuZCA6IGZ1bmN0aW9uIChudW1iZXIsIExPR19FVkVOVCksIGlzQWN0aXZlIDogZnVuY3Rpb24oKSxcclxuICogICAgICAgICAgc2V0TG9nTGV2ZWwgOiBmdW5jdGlvbihudW1iZXIpLCBzZXRUYWdMYXlvdXQgOiBmdW5jdGlvbihzdHJpbmcpIH19XHJcbiAqL1xyXG52YXIgQVBQRU5ERVI7XHJcblxyXG4vKipcclxuICogQHR5cGVkZWYge3sgYWxsb3dBcHBlbmRlckluamVjdGlvbiA6IGJvb2xlYW4sIGFwcGVuZGVycyA6IEFycmF5LjxBUFBFTkRFUj4sXHJcbiAqIFx0XHRcdGFwcGxpY2F0aW9uIDogT2JqZWN0LCBsb2dnZXJzIDogQXJyYXkuPExPR0dFUj4sIHRhZ0xheW91dCA6IHN0cmluZyB9fVxyXG4gKi9cclxudmFyIENPTkZJR19QQVJBTVM7XHJcblxyXG4vKipcclxuICogSG9sZHMgdGhlIGRlZmluaXRpb24gZm9yIHRoZSBsb2cgZXZlbnQgb2JqZWN0XHJcbiAqXHJcbiAqIEB0eXBlZGVmIHt7IGVycm9yIDogRXJyb3IsIG1lc3NhZ2UgOiBzdHJpbmcsIHByb3BlcnRpZXMgOiBPYmplY3QsXHJcbiAqICAgICAgICAgIHRpbWVzdGFtcCA6IHN0cmluZyB9fVxyXG4gKi9cclxudmFyIExPR19FVkVOVDtcclxuXHJcbi8qKlxyXG4gKiBAdHlwZWRlZiB7eyBsb2dMZXZlbCA6IG51bWJlciB9fVxyXG4gKi9cclxudmFyIExPR0dFUjtcclxuXHJcbi8qKiBAY29uc3QgKi9cclxuY29uc3QgREVGQVVMVF9DT05GSUcgPSB7XHJcblx0dGFnTGF5b3V0IDogJyVke0hIOm1tOnNzfSBbJWxldmVsXSAlbG9nZ2VyIC0gJW1lc3NhZ2UnLFxyXG5cdGFwcGVuZGVycyA6IFsgJ2NvbnNvbGVBcHBlbmRlcicgXSxcclxuXHRsb2dnZXJzIDogWyB7XHJcblx0XHRsb2dMZXZlbCA6IExvZ0xldmVsLklORk9cclxuXHR9IF0sXHJcblx0YWxsb3dBcHBlbmRlckluamVjdGlvbiA6IHRydWVcclxufTtcclxuXHJcbi8qKiBAdHlwZSB7QXJyYXkuPEFQUEVOREVSPn0gKi9cclxudmFyIGFwcGVuZGVyc18gPSBbXTtcclxuLyoqIEB0eXBlIHs/Q09ORklHX1BBUkFNU30gKi9cclxudmFyIGNvbmZpZ3VyYXRpb25fID0gbnVsbDtcclxuLyoqIEB0eXBlIHtib29sZWFufSAqL1xyXG52YXIgZmluYWxpemVkXyA9IGZhbHNlO1xyXG4vKiogQHR5cGUge09iamVjdH0gKi9cclxudmFyIGxvZ2dlcnNfID0ge307XHJcblxyXG5leHBvcnQge0xvZ0xldmVsfTtcclxuXHJcbi8qKlxyXG4gKiBDb25maWd1cmVzIHRoZSBsb2dnZXJcclxuICpcclxuICogQGZ1bmN0aW9uXHJcbiAqXHJcbiAqIEBwYXJhbXMge0NPTkZJR19QQVJBTVN9IGNvbmZpZ1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNvbmZpZ3VyZShjb25maWcpIHtcclxuXHJcblx0aWYgKGZpbmFsaXplZF8pIHtcclxuXHRcdGFwcGVuZChMb2dMZXZlbC5FUlJPUiwgJ0NvdWxkIG5vdCBjb25maWd1cmUuIExvZ1V0aWxpdHkgYWxyZWFkeSBpbiB1c2UnKTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblxyXG5cdGNvbmZpZ3VyZUFwcGVuZGVyc18oY29uZmlnLmFwcGVuZGVycywgZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdGNvbmZpZ3VyZUxvZ2dlcnNfKGNvbmZpZy5sb2dnZXJzKTtcclxuXHJcblx0XHRpZiAoY29uZmlnLnRhZ0xheW91dCkge1xyXG5cdFx0XHRmb3JtYXR0ZXIucHJlQ29tcGlsZShjb25maWcudGFnTGF5b3V0KTtcclxuXHRcdFx0Zm9yICh2YXIgbG9nS2V5IGluIGxvZ2dlcnNfKSB7XHJcblx0XHRcdFx0aWYgKGxvZ2dlcnNfLmhhc093blByb3BlcnR5KGxvZ0tleSkpIHtcclxuXHRcdFx0XHRcdGZvciAodmFyIGtleSBpbiBsb2dnZXJzX1tsb2dLZXldKSB7XHJcblx0XHRcdFx0XHRcdGlmIChsb2dnZXJzX1tsb2dLZXldLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuXHRcdFx0XHRcdFx0XHRsb2dnZXJzX1tsb2dLZXldW2tleV0uc2V0VGFnTGF5b3V0KGNvbmZpZy50YWdMYXlvdXQpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Y29uZmlndXJhdGlvbl8gPSBjb25maWc7XHJcblxyXG5cdH0pO1xyXG5cclxufVxyXG5cclxudmFyIGNvbmZpZ3VyZUFwcGVuZGVyc18gPSBmdW5jdGlvbiAoYXBwZW5kZXJzLCBjYWxsYmFjaykge1xyXG5cclxuXHRpZiAoYXBwZW5kZXJzIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuXHRcdHZhciBjb3VudCA9IGFwcGVuZGVycy5sZW5ndGg7XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcclxuXHRcdFx0Y2FsbGJhY2soKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG59O1xyXG5cclxudmFyIGNvbmZpZ3VyZUxvZ2dlcnNfID0gZnVuY3Rpb24gKGxvZ2dlcnMpIHtcclxuXHJcblx0aWYgKCEobG9nZ2VycyBpbnN0YW5jZW9mIEFycmF5KSkge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBsb2dnZXJzXCIpO1xyXG5cdH1cclxuXHJcblx0dmFyIGNvdW50ID0gbG9nZ2Vycy5sZW5ndGg7XHJcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XHJcblxyXG5cdFx0aWYgKCFsb2dnZXJzW2ldLnRhZykge1xyXG5cdFx0XHRsb2dnZXJzX1snbWFpbiddID0gZ2V0TG9nZ2Vyc18obG9nZ2Vyc1tpXS5sb2dMZXZlbCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRsb2dnZXJzX1tsb2dnZXJzW2ldLnRhZ10gPSBnZXRMb2dnZXJzXyhsb2dnZXJzW2ldLmxvZ0xldmVsKTtcclxuXHRcdH1cclxuXHJcblx0fVxyXG5cclxufTtcclxuXHJcbnZhciBnZXRMb2dnZXJzXyA9IGZ1bmN0aW9uIChsb2dMZXZlbCkge1xyXG5cclxuXHR2YXIgbG9nZ2VyO1xyXG5cdHZhciBsb2dnZXJzID0gW107XHJcblx0dmFyIGNvdW50ID0gYXBwZW5kZXJzXy5sZW5ndGg7XHJcblx0d2hpbGUgKGNvdW50LS0pIHtcclxuXHRcdGxvZ2dlciA9IGFwcGVuZGVyc19bY291bnRdKCk7XHJcblx0XHRsb2dnZXIuc2V0TG9nTGV2ZWwobG9nTGV2ZWwpO1xyXG5cdFx0bG9nZ2Vycy5wdXNoKGxvZ2dlcik7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gbG9nZ2VycztcclxuXHJcbn07XHJcblxyXG4vKipcclxuICogQWRkcyBhbiBhcHBlbmRlciB0byB0aGUgYXBwZW5kZXIgcXVldWUuIElmIHRoZSBzdGFjayBpcyBmaW5hbGl6ZWQsIGFuZFxyXG4gKiB0aGUgYWxsb3dBcHBlbmRlckluamVjdGlvbiBpcyBzZXQgdG8gZmFsc2UsIHRoZW4gdGhlIGV2ZW50IHdpbGwgbm90IGJlXHJcbiAqIGFwcGVuZGVkXHJcbiAqXHJcbiAqIEBmdW5jdGlvblxyXG4gKlxyXG4gKiBAcGFyYW1zIHtBUFBFTkRFUn0gYXBwZW5kZXJcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBhZGRBcHBlbmRlcihhcHBlbmRlcikge1xyXG5cclxuXHRpZiAoZmluYWxpemVkXyAmJiAhY29uZmlndXJhdGlvbl8uYWxsb3dBcHBlbmRlckluamVjdGlvbikge1xyXG5cdFx0Y29uc29sZS5lcnJvcignQ2Fubm90IGFkZCBhcHBlbmRlciB3aGVuIGNvbmZpZ3VyYXRpb24gZmluYWxpemVkJyk7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cclxuXHR2YWxpZGF0ZUFwcGVuZGVyXyhhcHBlbmRlcik7XHJcblx0YXBwZW5kZXJzXy5wdXNoKGFwcGVuZGVyKTtcclxuXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgdGhhdCB0aGUgYXBwZW5kZXJcclxuICpcclxuICogQGZ1bmN0aW9uXHJcbiAqXHJcbiAqIEBwYXJhbXMge0FQUEVOREVSfSBhcHBlbmRlclxyXG4gKi9cclxudmFyIHZhbGlkYXRlQXBwZW5kZXJfID0gZnVuY3Rpb24gKGFwcGVuZGVyKSB7XHJcblxyXG5cdGlmIChhcHBlbmRlciA9PSBudWxsIHx8IHR5cGVvZiBhcHBlbmRlciAhPT0gJ2Z1bmN0aW9uJykge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGFwcGVuZGVyOiBub3QgYW4gZnVuY3Rpb24nKTtcclxuXHR9XHJcblxyXG5cdHZhciBhcHBlbmRlck9iaiA9IGFwcGVuZGVyKCk7XHJcblxyXG5cdHZhciBhcHBlbmRlck1ldGhvZHMgPSBbJ2FwcGVuZCcsICdnZXROYW1lJywgJ2lzQWN0aXZlJywgJ3NldExvZ0xldmVsJywgJ3NldFRhZ0xheW91dCddO1xyXG5cdGZvciAodmFyIGtleSBpbiBhcHBlbmRlck1ldGhvZHMpIHtcclxuXHRcdGlmIChhcHBlbmRlck1ldGhvZHMuaGFzT3duUHJvcGVydHkoa2V5KSAmJiBhcHBlbmRlck9ialthcHBlbmRlck1ldGhvZHNba2V5XV0gPT0gdW5kZWZpbmVkIHx8XHJcblx0XHRcdHR5cGVvZiBhcHBlbmRlck9ialthcHBlbmRlck1ldGhvZHNba2V5XV0gIT0gJ2Z1bmN0aW9uJykge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYXBwZW5kZXI6IG1pc3NpbmcgbWV0aG9kOiAnICsgYXBwZW5kZXJNZXRob2RzW2tleV0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0aWYgKGNvbmZpZ3VyYXRpb25fIGluc3RhbmNlb2YgT2JqZWN0ICYmIGNvbmZpZ3VyYXRpb25fLnRhZ0xheW91dCkge1xyXG5cdFx0YXBwZW5kZXJPYmouc2V0VGFnTGF5b3V0KGNvbmZpZ3VyYXRpb25fLnRhZ0xheW91dCk7XHJcblx0fVxyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBBcHBlbmRzIHRoZSBsb2cgZXZlbnRcclxuICpcclxuICogQGZ1bmN0aW9uXHJcbiAqXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBsb2dnaW5nRXZlbnRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBhcHBlbmQobG9nZ2luZ0V2ZW50KSB7XHJcblxyXG5cdC8vIGZpbmFsaXplIHRoZSBjb25maWd1cmF0aW9uIHRvIG1ha2Ugc3VyZSBubyBvdGhlciBhcHBlbmRlcnMgYXJlIGluamVjdGVkIChpZiBzZXQpXHJcblx0ZmluYWxpemVkXyA9IHRydWU7XHJcblxyXG5cdHZhciBsb2dnZXJzO1xyXG5cdGlmIChsb2dnZXJzX1tsb2dnaW5nRXZlbnQubG9nZ2VyXSkge1xyXG5cdFx0bG9nZ2VycyA9IGxvZ2dlcnNfW2xvZ2dpbmdFdmVudC5sb2dnZXJdO1xyXG5cdH0gZWxzZSB7XHJcblx0XHRsb2dnZXJzID0gbG9nZ2Vyc19bJ21haW4nXTtcclxuXHR9XHJcblxyXG5cdHZhciBjb3VudCA9IGxvZ2dlcnMubGVuZ3RoO1xyXG5cdHdoaWxlIChjb3VudC0tKSB7XHJcblx0XHRpZiAobG9nZ2Vyc1tjb3VudF0uaXNBY3RpdmUobG9nZ2luZ0V2ZW50LmxldmVsKSkge1xyXG5cdFx0XHRsb2dnZXJzW2NvdW50XS5hcHBlbmQobG9nZ2luZ0V2ZW50KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG59XHJcblxyXG4vKipcclxuICogQHByaXZhdGVcclxuICogQGZ1bmN0aW9uXHJcbiAqXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBsZXZlbFxyXG4gKi9cclxudmFyIHZhbGlkYXRlTGV2ZWxfID0gZnVuY3Rpb24gKGxldmVsKSB7XHJcblxyXG5cdGZvciAodmFyIGtleSBpbiBMb2dMZXZlbCkge1xyXG5cdFx0aWYgKGxldmVsID09PSBMb2dMZXZlbFtrZXldKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHRocm93IG5ldyBFcnJvcignSW52YWxpZCBsb2cgbGV2ZWw6ICcgKyBsZXZlbCk7XHJcblxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdldHMgdGhlIGFwcGxpY2F0aW9uIGluZm9ybWF0aW9uIGZyb20gdGhlIGNvbmZpZ3VyYXRpb25cclxuICogQHJldHVybiB7T2JqZWN0fVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEFwcGxpY2F0aW9uSW5mbygpIHtcclxuXHRpZiAoY29uZmlndXJhdGlvbl8uYXBwbGljYXRpb24gIT0gbnVsbCkge1xyXG5cdFx0cmV0dXJuIGNvbmZpZ3VyYXRpb25fLmFwcGxpY2F0aW9uO1xyXG5cdH0gZWxzZSB7XHJcblx0XHRyZXR1cm4gbnVsbDtcclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBIYW5kbGVzIGNyZWF0aW5nIHRoZSBsb2dnZXIgYW5kIHJldHVybmluZyBpdFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dFxyXG4gKiBAcmV0dXJuIHtMb2dnZXJ9XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9nZ2VyKGNvbnRleHQpIHtcclxuXHJcblx0Ly8gd2UgbmVlZCB0byBpbml0aWFsaXplIGlmIHdlIGhhdmVuJ3RcclxuXHRpZiAoY29uZmlndXJhdGlvbl8gPT09IG51bGwpIHtcclxuXHRcdGNvbmZpZ3VyZShERUZBVUxUX0NPTkZJRyk7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gbmV3IExvZ2dlcihjb250ZXh0LCB7XHJcblx0XHRhcHBlbmQ6IGFwcGVuZFxyXG5cdH0pO1xyXG5cclxufVxyXG5cclxuLyoqXHJcbiAqIFNldHMgdGhlIGxvZyBsZXZlbCBmb3IgYWxsIGxvZ2dlcnNcclxuICogQHBhcmFtIHtudW1iZXJ9IGxvZ0xldmVsXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2V0TG9nTGV2ZWwobG9nTGV2ZWwpIHtcclxuXHJcblx0dmFsaWRhdGVMZXZlbF8obG9nTGV2ZWwpO1xyXG5cclxuXHRmb3IgKHZhciBsb2dLZXkgaW4gbG9nZ2Vyc18pIHtcclxuXHRcdGlmIChsb2dnZXJzXy5oYXNPd25Qcm9wZXJ0eShsb2dLZXkpKSB7XHJcblx0XHRcdGZvciAodmFyIGtleSBpbiBsb2dnZXJzX1tsb2dLZXldKSB7XHJcblx0XHRcdFx0aWYgKGxvZ2dlcnNfW2xvZ0tleV0uaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG5cdFx0XHRcdFx0bG9nZ2Vyc19bbG9nS2V5XVtrZXldLnNldExvZ0xldmVsKGxvZ0xldmVsKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG59XHJcblxyXG5hZGRBcHBlbmRlcihjb25zb2xlQXBwZW5kZXIuQ29uc29sZUFwcGVuZGVyKTsiXX0=


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	exports.__esModule = true;
	exports.preCompile = preCompile;
	exports.format = format;
	// istanbul ignore next

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

	/**
	 * log4js <https://github.com/anigenero/log4js>
	 *
	 * Copyright 2016-present Robin Schultz <http://cunae.com>
	 * Released under the MIT License
	 */

	var _dateFormatter = __webpack_require__(2);

	var _constLogLevel = __webpack_require__(3);

	var logLevel = _interopRequireWildcard(_constLogLevel);

	/** @type {Object} */
	var compiledLayouts_ = {};

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {LOG_EVENT} logEvent
	 * @param {Array.<string>} params
	 *
	 * @return {string}
	 */
	var formatLogger_ = function formatLogger_(logEvent, params) {
		return logEvent.logger;
	};

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {LOG_EVENT} logEvent
	 * @param {Array.<string>} params
	 *
	 * @return {string}
	 */
	var formatDate_ = function formatDate_(logEvent, params) {
		return _dateFormatter.dateFormat(new Date(), params[0]);
	};

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {LOG_EVENT} logEvent
	 * @param {Array.<string>} params
	 *
	 * @return {string}
	 */
	var formatException_ = function formatException_(logEvent, params) {
		var message = '';
		if (logEvent.error != null) {

			if (logEvent.error.stack != undefined) {
				var stacks = logEvent.error.stack.split(/\n/g);
				for (var key in stacks) {
					message += '\t' + stacks[key] + '\n';
				}
			} else if (logEvent.error.message != null && logEvent.error.message != '') {
				message += '\t';
				message += logEvent.error.name + ': ' + logEvent.error.message;
				message += '\n';
			}
		}
		return message;
	};

	/**
	 *
	 */
	var formatFile_ = function formatFile_(logEvent, params) {
		if (logEvent.file === null) {
			getFileDetails_(logEvent);
		}
		return logEvent.file;
	};

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {LOG_EVENT} logEvent
	 * @param {Array.<string>} params
	 *
	 * @return {string}
	 */
	var formatLineNumber_ = function formatLineNumber_(logEvent, params) {
		if (logEvent.lineNumber === null) {
			getFileDetails_(logEvent);
		}
		return '' + logEvent.lineNumber;
	};

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {LOG_EVENT} logEvent
	 * @param {Array.<string>} params
	 *
	 * @return {string}
	 */
	var formatMapMessage_ = function formatMapMessage_(logEvent, params) {
		var message = null;
		if (logEvent.properties) {

			message = [];
			for (var key in logEvent.properties) {
				if (params[0]) {
					if (params[0] == key) {
						message.push(logEvent.properties[key]);
					}
				} else {
					message.push('{' + key + ',' + logEvent.properties[key] + '}');
				}
			}

			return '{' + message.join(',') + '}';
		}
		return message;
	};

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {LOG_EVENT} logEvent
	 * @param {Array.<string>} params
	 *
	 * @return {string}
	 */
	var formatLogMessage_ = function formatLogMessage_(logEvent, params) {
		return logEvent.message;
	};

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {LOG_EVENT} logEvent
	 * @param {Array.<string>} params
	 *
	 * @return {string}
	 */
	var formatMethodName_ = function formatMethodName_(logEvent, params) {
		return getFunctionName_(logEvent.method);
	};

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {LOG_EVENT} logEvent
	 * @param {Array.<string>} params
	 *
	 * @return {string}
	 */
	var formatLineSeparator_ = function formatLineSeparator_(logEvent, params) {
		return '\n';
	};

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {LOG_EVENT} logEvent
	 * @param {Array.<string>} params
	 *
	 * @return {string}
	 */
	var formatLevel_ = function formatLevel_(logEvent, params) {
		if (logEvent.level == logLevel.FATAL) {
			return 'FATAL';
		} else if (logEvent.level == logLevel.ERROR) {
			return 'ERROR';
		} else if (logEvent.level == logLevel.WARN) {
			return 'WARN';
		} else if (logEvent.level == logLevel.INFO) {
			return 'INFO';
		} else if (logEvent.level == logLevel.DEBUG) {
			return 'DEBUG';
		} else if (logEvent.level == logLevel.TRACE) {
			return 'TRACE';
		}
	};

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {LOG_EVENT} logEvent
	 * @param {Array.<string>} params
	 *
	 * @return {string}
	 */
	var formatRelative_ = function formatRelative_(logEvent, params) {
		return '' + logEvent.relative;
	};

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {LOG_EVENT} logEvent
	 * @param {Array.<string>} params
	 *
	 * @return {string}
	 */
	var formatSequenceNumber_ = function formatSequenceNumber_(logEvent, params) {
		return '' + logEvent.sequence;
	};

	var formatters_ = {
		'c|logger': formatLogger_,
		'd|date': formatDate_,
		'ex|exception|throwable': formatException_,
		'F|file': formatFile_,
		'K|map|MAP': formatMapMessage_,
		'L|line': formatLineNumber_,
		'm|msg|message': formatLogMessage_,
		'M|method': formatMethodName_,
		'n': formatLineSeparator_,
		'p|level': formatLevel_,
		'r|relative': formatRelative_,
		'sn|sequenceNumber': formatSequenceNumber_
	};

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {string} layout
	 *
	 * @return {string}
	 */
	var getCompiledLayout_ = function getCompiledLayout_(layout) {

		if (compiledLayouts_[layout] != undefined) {
			return compiledLayouts_[layout];
		}

		return compileLayout_(layout);
	};

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {string} layout
	 *
	 * @return {string}
	 */
	var compileLayout_ = function compileLayout_(layout) {

		var index = layout.indexOf('%');
		var currentFormatString = '';
		var formatter = [];

		if (index != 0) {
			formatter.push(layout.substring(0, index));
		}

		do {

			var startIndex = index;
			var endIndex = index = layout.indexOf('%', index + 1);

			if (endIndex < 0) {
				currentFormatString = layout.substring(startIndex);
			} else {
				currentFormatString = layout.substring(startIndex, endIndex);
			}

			formatter.push(getFormatterObject_(currentFormatString));
		} while (index > -1);

		compiledLayouts_[layout] = formatter;

		return formatter;
	};

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {string} formatString
	 *
	 * @return {?string}
	 */
	var getFormatterObject_ = function getFormatterObject_(formatString) {

		var commandRegex = /%([a-z,A-Z]+)(?=\{|)/;
		var result = commandRegex.exec(formatString);
		if (result != null && result.length == 2) {

			var formatter = getFormatterFunction_(result[1]);
			if (formatter == null) {
				return null;
			}

			var params = getFormatterParams_(formatString);

			var after = '';
			var endIndex = formatString.lastIndexOf('}');
			if (endIndex != -1) {
				after = formatString.substring(endIndex + 1);
			} else {
				after = formatString.substring(result.index + result[1].length + 1);
			}

			return {
				formatter: formatter,
				params: params,
				after: after
			};
		}

		return formatString;
	};

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {string} command
	 *
	 * @return {?string}
	 */
	var getFormatterFunction_ = function getFormatterFunction_(command) {

		var regex;
		for (var key in formatters_) {
			regex = new RegExp('^' + key + '$');
			if (regex.exec(command) != null) {
				return formatters_[key];
			}
		}

		return null;
	};

	/**
	 * @private
	 * @function
	 *
	 * @param {string} command
	 *
	 * @return {string}
	 */
	var getFormatterParams_ = function getFormatterParams_(command) {

		var params = [];
		var result = command.match(/\{([^\}]*)(?=\})/g);
		if (result != null) {
			for (var i = 0; i < result.length; i++) {
				params.push(result[i].substring(1));
			}
		}

		return params;
	};

	/**
	 * @private
	 * @function
	 *
	 * @param {Array.<function|string>} formatter
	 * @param {LOG_EVENT} logEvent
	 *
	 * @return {string}
	 */
	var formatLogEvent_ = function formatLogEvent_(formatter, logEvent) {

		var response;
		var message = '';
		var count = formatter.length;
		for (var i = 0; i < count; i++) {
			if (formatter[i] !== null) {

				if (formatter[i] instanceof Object) {

					response = formatter[i].formatter(logEvent, formatter[i].params);
					if (response != null) {
						message += response;
					}
					message += formatter[i].after;
				} else {
					message += formatter[i];
				}
			}
		}

		return message.trim();
	};

	function getFileDetails_(logEvent) {

		if (logEvent.logErrorStack !== undefined) {

			var parts = logEvent.logErrorStack.stack.split(/\n/g);
			var file = parts[3];
			file = file.replace(/at (.*\(|)(file|http|https|)(\:|)(\/|)*/, '');
			file = file.replace(')', '');
			file = file.replace(typeof location !== 'undefined' ? location.host : '', '').trim();

			var fileParts = file.split(/\:/g);

			logEvent.column = fileParts.pop();
			logEvent.lineNumber = fileParts.pop();

			if (true) {
				var path = __webpack_require__(4);
				var appDir = path.dirname(__webpack_require__.c[0].filename);
				logEvent.filename = fileParts.join(':').replace(appDir, '').replace(/(\\|\/)/, '');
			} else {
				logEvent.filename = fileParts.join(':');
			}
		} else {

			logEvent.column = '?';
			logEvent.filename = 'anonymous';
			logEvent.lineNumber = '?';
		}
	}

	/**
	 * @function
	 *
	 * @param {function} func
	 *
	 * @return {string}
	 */
	function getFunctionName_(func) {

		if (typeof func !== 'function') {
			return 'anonymous';
		}

		var functionName = func.toString();
		functionName = functionName.substring('function '.length);
		functionName = functionName.substring(0, functionName.indexOf('('));

		return functionName !== '' ? functionName : 'anonymous';
	}

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {string} layout
	 *
	 * @return {string}
	 */

	function preCompile(layout) {
		getCompiledLayout_(layout);
	}

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {string} layout
	 * @param {LOG_EVENT} logEvent
	 *
	 * @return {string}
	 */

	function format(layout, logEvent) {
		return formatLogEvent_(getCompiledLayout_(layout), logEvent);
	}
	//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mb3JtYXR0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7NkJBTzJCLGlCQUFpQjs7NkJBQ2xCLGtCQUFrQjs7SUFBaEMsUUFBUTs7O0FBR3BCLElBQUksZ0JBQWdCLEdBQUcsRUFBRSxDQUFDOzs7Ozs7Ozs7OztBQVcxQixJQUFJLGFBQWEsR0FBRyxTQUFoQixhQUFhLENBQVksUUFBUSxFQUFFLE1BQU0sRUFBRTtBQUM5QyxRQUFPLFFBQVEsQ0FBQyxNQUFNLENBQUM7Q0FDdkIsQ0FBQzs7Ozs7Ozs7Ozs7QUFXRixJQUFJLFdBQVcsR0FBRyxTQUFkLFdBQVcsQ0FBWSxRQUFRLEVBQUUsTUFBTSxFQUFFO0FBQzVDLFFBQU8sMEJBQVcsSUFBSSxJQUFJLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN6QyxDQUFDOzs7Ozs7Ozs7OztBQVdGLElBQUksZ0JBQWdCLEdBQUcsU0FBbkIsZ0JBQWdCLENBQVksUUFBUSxFQUFFLE1BQU0sRUFBRTtBQUNqRCxLQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDakIsS0FBSSxRQUFRLENBQUMsS0FBSyxJQUFJLElBQUksRUFBRTs7QUFFM0IsTUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxTQUFTLEVBQUU7QUFDdEMsT0FBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQy9DLFFBQU0sSUFBSSxHQUFHLElBQUksTUFBTSxFQUFFO0FBQ3hCLFdBQU8sSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztJQUNyQztHQUNELE1BQU0sSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sSUFBSSxJQUFJLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksRUFBRSxFQUFFO0FBQzFFLFVBQU8sSUFBSSxJ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Ozs7O0FBV00sU0FBUyxNQUFNLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRTtBQUN4QyxRQUFPLGVBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztDQUM3RCIsImZpbGUiOiJmb3JtYXR0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogbG9nNGpzIDxodHRwczovL2dpdGh1Yi5jb20vYW5pZ2VuZXJvL2xvZzRqcz5cclxuICpcclxuICogQ29weXJpZ2h0IDIwMTYtcHJlc2VudCBSb2JpbiBTY2h1bHR6IDxodHRwOi8vY3VuYWUuY29tPlxyXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQgeyBkYXRlRm9ybWF0IH0gZnJvbSAnLi9kYXRlRm9ybWF0dGVyJztcclxuaW1wb3J0ICogYXMgbG9nTGV2ZWwgZnJvbSAnLi9jb25zdC9sb2dMZXZlbCc7XHJcblxyXG4vKiogQHR5cGUge09iamVjdH0gKi9cclxudmFyIGNvbXBpbGVkTGF5b3V0c18gPSB7fTtcclxuXHJcbi8qKlxyXG4gKiBAZnVuY3Rpb25cclxuICogQG1lbWJlck9mIGZvcm1hdHRlclxyXG4gKlxyXG4gKiBAcGFyYW0ge0xPR19FVkVOVH0gbG9nRXZlbnRcclxuICogQHBhcmFtIHtBcnJheS48c3RyaW5nPn0gcGFyYW1zXHJcbiAqXHJcbiAqIEByZXR1cm4ge3N0cmluZ31cclxuICovXHJcbnZhciBmb3JtYXRMb2dnZXJfID0gZnVuY3Rpb24obG9nRXZlbnQsIHBhcmFtcykge1xyXG5cdHJldHVybiBsb2dFdmVudC5sb2dnZXI7XHJcbn07XHJcblxyXG4vKipcclxuICogQGZ1bmN0aW9uXHJcbiAqIEBtZW1iZXJPZiBmb3JtYXR0ZXJcclxuICpcclxuICogQHBhcmFtIHtMT0dfRVZFTlR9IGxvZ0V2ZW50XHJcbiAqIEBwYXJhbSB7QXJyYXkuPHN0cmluZz59IHBhcmFtc1xyXG4gKlxyXG4gKiBAcmV0dXJuIHtzdHJpbmd9XHJcbiAqL1xyXG52YXIgZm9ybWF0RGF0ZV8gPSBmdW5jdGlvbihsb2dFdmVudCwgcGFyYW1zKSB7XHJcblx0cmV0dXJuIGRhdGVGb3JtYXQobmV3IERhdGUoKSwgcGFyYW1zWzBdKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBAZnVuY3Rpb25cclxuICogQG1lbWJlck9mIGZvcm1hdHRlclxyXG4gKlxyXG4gKiBAcGFyYW0ge0xPR19FVkVOVH0gbG9nRXZlbnRcclxuICogQHBhcmFtIHtBcnJheS48c3RyaW5nPn0gcGFyYW1zXHJcbiAqXHJcbiAqIEByZXR1cm4ge3N0cmluZ31cclxuICovXHJcbnZhciBmb3JtYXRFeGNlcHRpb25fID0gZnVuY3Rpb24obG9nRXZlbnQsIHBhcmFtcykge1xyXG5cdHZhciBtZXNzYWdlID0gJyc7XHJcblx0aWYgKGxvZ0V2ZW50LmVycm9yICE9IG51bGwpIHtcclxuXHJcblx0XHRpZiAobG9nRXZlbnQuZXJyb3Iuc3RhY2sgIT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdHZhciBzdGFja3MgPSBsb2dFdmVudC5lcnJvci5zdGFjay5zcGxpdCgvXFxuL2cpO1xyXG5cdFx0XHRmb3IgKCB2YXIga2V5IGluIHN0YWNrcykge1xyXG5cdFx0XHRcdG1lc3NhZ2UgKz0gJ1xcdCcgKyBzdGFja3Nba2V5XSArICdcXG4nO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2UgaWYgKGxvZ0V2ZW50LmVycm9yLm1lc3NhZ2UgIT0gbnVsbCAmJiBsb2dFdmVudC5lcnJvci5tZXNzYWdlICE9ICcnKSB7XHJcblx0XHRcdG1lc3NhZ2UgKz0gJ1xcdCc7XHJcblx0XHRcdG1lc3NhZ2UgKz0gbG9nRXZlbnQuZXJyb3IubmFtZSArICc6ICcgKyBsb2dFdmVudC5lcnJvci5tZXNzYWdlO1xyXG5cdFx0XHRtZXNzYWdlICs9ICdcXG4nO1xyXG5cdFx0fVxyXG5cclxuXHR9XHJcblx0cmV0dXJuIG1lc3NhZ2U7XHJcbn07XHJcblxyXG4vKipcclxuICpcclxuICovXHJcbnZhciBmb3JtYXRGaWxlXyA9IGZ1bmN0aW9uKGxvZ0V2ZW50LCBwYXJhbXMpIHtcclxuXHRpZiAobG9nRXZlbnQuZmlsZSA9PT0gbnVsbCkge1xyXG5cdFx0Z2V0RmlsZURldGFpbHNfKGxvZ0V2ZW50KTtcclxuXHR9XHJcblx0cmV0dXJuIGxvZ0V2ZW50LmZpbGU7XHJcbn07XHJcblxyXG4vKipcclxuICogQGZ1bmN0aW9uXHJcbiAqIEBtZW1iZXJPZiBmb3JtYXR0ZXJcclxuICpcclxuICogQHBhcmFtIHtMT0dfRVZFTlR9IGxvZ0V2ZW50XHJcbiAqIEBwYXJhbSB7QXJyYXkuPHN0cmluZz59IHBhcmFtc1xyXG4gKlxyXG4gKiBAcmV0dXJuIHtzdHJpbmd9XHJcbiAqL1xyXG52YXIgZm9ybWF0TGluZU51bWJlcl8gPSBmdW5jdGlvbihsb2dFdmVudCwgcGFyYW1zKSB7XHJcblx0aWYgKGxvZ0V2ZW50LmxpbmVOdW1iZXIgPT09IG51bGwpIHtcclxuXHRcdGdldEZpbGVEZXRhaWxzXyhsb2dFdmVudCk7XHJcblx0fVxyXG5cdHJldHVybiAnJyArIGxvZ0V2ZW50LmxpbmVOdW1iZXI7XHJcbn07XHJcblxyXG4vKipcclxuICogQGZ1bmN0aW9uXHJcbiAqIEBtZW1iZXJPZiBmb3JtYXR0ZXJcclxuICpcclxuICogQHBhcmFtIHtMT0dfRVZFTlR9IGxvZ0V2ZW50XHJcbiAqIEBwYXJhbSB7QXJyYXkuPHN0cmluZz59IHBhcmFtc1xyXG4gKlxyXG4gKiBAcmV0dXJuIHtzdHJpbmd9XHJcbiAqL1xyXG52YXIgZm9ybWF0TWFwTWVzc2FnZV8gPSBmdW5jdGlvbihsb2dFdmVudCwgcGFyYW1zKSB7XHJcblx0dmFyIG1lc3NhZ2UgPSBudWxsO1xyXG5cdGlmIChsb2dFdmVudC5wcm9wZXJ0aWVzKSB7XHJcblxyXG5cdFx0bWVzc2FnZSA9IFtdO1xyXG5cdFx0Zm9yICggdmFyIGtleSBpbiBsb2dFdmVudC5wcm9wZXJ0aWVzKSB7XHJcblx0XHRcdGlmIChwYXJhbXNbMF0pIHtcclxuXHRcdFx0XHRpZiAocGFyYW1zWzBdID09IGtleSkge1xyXG5cdFx0XHRcdFx0bWVzc2FnZS5wdXNoKGxvZ0V2ZW50LnByb3BlcnRpZXNba2V5XSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdG1lc3NhZ2UucHVzaCgneycgKyBrZXkgKyAnLCcgKyBsb2dFdmVudC5wcm9wZXJ0aWVzW2tleV0gKyAnfScpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuICd7JyArIG1lc3NhZ2Uuam9pbignLCcpICsgJ30nO1xyXG5cclxuXHR9XHJcblx0cmV0dXJuIG1lc3NhZ2U7XHJcbn07XHJcblxyXG4vKipcclxuICogQGZ1bmN0aW9uXHJcbiAqIEBtZW1iZXJPZiBmb3JtYXR0ZXJcclxuICpcclxuICogQHBhcmFtIHtMT0dfRVZFTlR9IGxvZ0V2ZW50XHJcbiAqIEBwYXJhbSB7QXJyYXkuPHN0cmluZz59IHBhcmFtc1xyXG4gKlxyXG4gKiBAcmV0dXJuIHtzdHJpbmd9XHJcbiAqL1xyXG52YXIgZm9ybWF0TG9nTWVzc2FnZV8gPSBmdW5jdGlvbihsb2dFdmVudCwgcGFyYW1zKSB7XHJcblx0cmV0dXJuIGxvZ0V2ZW50Lm1lc3NhZ2U7XHJcbn07XHJcblxyXG4vKipcclxuICogQGZ1bmN0aW9uXHJcbiAqIEBtZW1iZXJPZiBmb3JtYXR0ZXJcclxuICpcclxuICogQHBhcmFtIHtMT0dfRVZFTlR9IGxvZ0V2ZW50XHJcbiAqIEBwYXJhbSB7QXJyYXkuPHN0cmluZz59IHBhcmFtc1xyXG4gKlxyXG4gKiBAcmV0dXJuIHtzdHJpbmd9XHJcbiAqL1xyXG52YXIgZm9ybWF0TWV0aG9kTmFtZV8gPSBmdW5jdGlvbihsb2dFdmVudCwgcGFyYW1zKSB7XHJcblx0cmV0dXJuIGdldEZ1bmN0aW9uTmFtZV8obG9nRXZlbnQubWV0aG9kKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBAZnVuY3Rpb25cclxuICogQG1lbWJlck9mIGZvcm1hdHRlclxyXG4gKlxyXG4gKiBAcGFyYW0ge0xPR19FVkVOVH0gbG9nRXZlbnRcclxuICogQHBhcmFtIHtBcnJheS48c3RyaW5nPn0gcGFyYW1zXHJcbiAqXHJcbiAqIEByZXR1cm4ge3N0cmluZ31cclxuICovXHJcbnZhciBmb3JtYXRMaW5lU2VwYXJhdG9yXyA9IGZ1bmN0aW9uKGxvZ0V2ZW50LCBwYXJhbXMpIHtcclxuXHRyZXR1cm4gJ1xcbic7XHJcbn07XHJcblxyXG4vKipcclxuICogQGZ1bmN0aW9uXHJcbiAqIEBtZW1iZXJPZiBmb3JtYXR0ZXJcclxuICpcclxuICogQHBhcmFtIHtMT0dfRVZFTlR9IGxvZ0V2ZW50XHJcbiAqIEBwYXJhbSB7QXJyYXkuPHN0cmluZz59IHBhcmFtc1xyXG4gKlxyXG4gKiBAcmV0dXJuIHtzdHJpbmd9XHJcbiAqL1xyXG52YXIgZm9ybWF0TGV2ZWxfID0gZnVuY3Rpb24obG9nRXZlbnQsIHBhcmFtcykge1xyXG5cdGlmIChsb2dFdmVudC5sZXZlbCA9PSBsb2dMZXZlbC5GQVRBTCkge1xyXG5cdFx0cmV0dXJuICdGQVRBTCc7XHJcblx0fSBlbHNlIGlmIChsb2dFdmVudC5sZXZlbCA9PSBsb2dMZXZlbC5FUlJPUikge1xyXG5cdFx0cmV0dXJuICdFUlJPUic7XHJcblx0fSBlbHNlIGlmIChsb2dFdmVudC5sZXZlbCA9PSBsb2dMZXZlbC5XQVJOKSB7XHJcblx0XHRyZXR1cm4gJ1dBUk4nO1xyXG5cdH0gZWxzZSBpZiAobG9nRXZlbnQubGV2ZWwgPT0gbG9nTGV2ZWwuSU5GTykge1xyXG5cdFx0cmV0dXJuICdJTkZPJztcclxuXHR9IGVsc2UgaWYgKGxvZ0V2ZW50LmxldmVsID09IGxvZ0xldmVsLkRFQlVHKSB7XHJcblx0XHRyZXR1cm4gJ0RFQlVHJztcclxuXHR9IGVsc2UgaWYgKGxvZ0V2ZW50LmxldmVsID09IGxvZ0xldmVsLlRSQUNFKSB7XHJcblx0XHRyZXR1cm4gJ1RSQUNFJztcclxuXHR9XHJcbn07XHJcblxyXG4vKipcclxuICogQGZ1bmN0aW9uXHJcbiAqIEBtZW1iZXJPZiBmb3JtYXR0ZXJcclxuICpcclxuICogQHBhcmFtIHtMT0dfRVZFTlR9IGxvZ0V2ZW50XHJcbiAqIEBwYXJhbSB7QXJyYXkuPHN0cmluZz59IHBhcmFtc1xyXG4gKlxyXG4gKiBAcmV0dXJuIHtzdHJpbmd9XHJcbiAqL1xyXG52YXIgZm9ybWF0UmVsYXRpdmVfID0gZnVuY3Rpb24obG9nRXZlbnQsIHBhcmFtcykge1xyXG5cdHJldHVybiAnJyArIGxvZ0V2ZW50LnJlbGF0aXZlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBmdW5jdGlvblxyXG4gKiBAbWVtYmVyT2YgZm9ybWF0dGVyXHJcbiAqXHJcbiAqIEBwYXJhbSB7TE9HX0VWRU5UfSBsb2dFdmVudFxyXG4gKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+fSBwYXJhbXNcclxuICpcclxuICogQHJldHVybiB7c3RyaW5nfVxyXG4gKi9cclxudmFyIGZvcm1hdFNlcXVlbmNlTnVtYmVyXyA9IGZ1bmN0aW9uKGxvZ0V2ZW50LCBwYXJhbXMpIHtcclxuXHRyZXR1cm4gJycgKyBsb2dFdmVudC5zZXF1ZW5jZTtcclxufTtcclxuXHJcbnZhciBmb3JtYXR0ZXJzXyA9IHtcclxuXHQnY3xsb2dnZXInIDogZm9ybWF0TG9nZ2VyXyxcclxuXHQnZHxkYXRlJyA6IGZvcm1hdERhdGVfLFxyXG5cdCdleHxleGNlcHRpb258dGhyb3dhYmxlJyA6IGZvcm1hdEV4Y2VwdGlvbl8sXHJcblx0J0Z8ZmlsZScgOiBmb3JtYXRGaWxlXyxcclxuXHQnS3xtYXB8TUFQJyA6IGZvcm1hdE1hcE1lc3NhZ2VfLFxyXG5cdCdMfGxpbmUnIDogZm9ybWF0TGluZU51bWJlcl8sXHJcblx0J218bXNnfG1lc3NhZ2UnIDogZm9ybWF0TG9nTWVzc2FnZV8sXHJcblx0J018bWV0aG9kJyA6IGZvcm1hdE1ldGhvZE5hbWVfLFxyXG5cdCduJyA6IGZvcm1hdExpbmVTZXBhcmF0b3JfLFxyXG5cdCdwfGxldmVsJyA6IGZvcm1hdExldmVsXyxcclxuXHQncnxyZWxhdGl2ZScgOiBmb3JtYXRSZWxhdGl2ZV8sXHJcblx0J3NufHNlcXVlbmNlTnVtYmVyJyA6IGZvcm1hdFNlcXVlbmNlTnVtYmVyX1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBmdW5jdGlvblxyXG4gKiBAbWVtYmVyT2YgZm9ybWF0dGVyXHJcbiAqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBsYXlvdXRcclxuICpcclxuICogQHJldHVybiB7c3RyaW5nfVxyXG4gKi9cclxudmFyIGdldENvbXBpbGVkTGF5b3V0XyA9IGZ1bmN0aW9uKGxheW91dCkge1xyXG5cclxuXHRpZiAoY29tcGlsZWRMYXlvdXRzX1tsYXlvdXRdICE9IHVuZGVmaW5lZCkge1xyXG5cdFx0cmV0dXJuIGNvbXBpbGVkTGF5b3V0c19bbGF5b3V0XTtcclxuXHR9XHJcblxyXG5cdHJldHVybiBjb21waWxlTGF5b3V0XyhsYXlvdXQpO1xyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBAZnVuY3Rpb25cclxuICogQG1lbWJlck9mIGZvcm1hdHRlclxyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbGF5b3V0XHJcbiAqXHJcbiAqIEByZXR1cm4ge3N0cmluZ31cclxuICovXHJcbnZhciBjb21waWxlTGF5b3V0XyA9IGZ1bmN0aW9uKGxheW91dCkge1xyXG5cclxuXHR2YXIgaW5kZXggPSBsYXlvdXQuaW5kZXhPZignJScpO1xyXG5cdHZhciBjdXJyZW50Rm9ybWF0U3RyaW5nID0gJyc7XHJcblx0dmFyIGZvcm1hdHRlciA9IFtdO1xyXG5cclxuXHRpZiAoaW5kZXggIT0gMCkge1xyXG5cdFx0Zm9ybWF0dGVyLnB1c2gobGF5b3V0LnN1YnN0cmluZygwLCBpbmRleCkpO1xyXG5cdH1cclxuXHJcblx0ZG8ge1xyXG5cclxuXHRcdHZhciBzdGFydEluZGV4ID0gaW5kZXg7XHJcblx0XHR2YXIgZW5kSW5kZXggPSBpbmRleCA9IGxheW91dC5pbmRleE9mKCclJywgaW5kZXggKyAxKTtcclxuXHJcblx0XHRpZiAoZW5kSW5kZXggPCAwKSB7XHJcblx0XHRcdGN1cnJlbnRGb3JtYXRTdHJpbmcgPSBsYXlvdXQuc3Vic3RyaW5nKHN0YXJ0SW5kZXgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Y3VycmVudEZvcm1hdFN0cmluZyA9IGxheW91dC5zdWJzdHJpbmcoc3RhcnRJbmRleCwgZW5kSW5kZXgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZvcm1hdHRlci5wdXNoKGdldEZvcm1hdHRlck9iamVjdF8oY3VycmVudEZvcm1hdFN0cmluZykpO1xyXG5cclxuXHR9IHdoaWxlIChpbmRleCA+IC0xKTtcclxuXHJcblx0Y29tcGlsZWRMYXlvdXRzX1tsYXlvdXRdID0gZm9ybWF0dGVyO1xyXG5cclxuXHRyZXR1cm4gZm9ybWF0dGVyO1xyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBAZnVuY3Rpb25cclxuICogQG1lbWJlck9mIGZvcm1hdHRlclxyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gZm9ybWF0U3RyaW5nXHJcbiAqXHJcbiAqIEByZXR1cm4gez9zdHJpbmd9XHJcbiAqL1xyXG52YXIgZ2V0Rm9ybWF0dGVyT2JqZWN0XyA9IGZ1bmN0aW9uKGZvcm1hdFN0cmluZykge1xyXG5cclxuXHR2YXIgY29tbWFuZFJlZ2V4ID0gLyUoW2EteixBLVpdKykoPz1cXHt8KS87XHJcblx0dmFyIHJlc3VsdCA9IGNvbW1hbmRSZWdleC5leGVjKGZvcm1hdFN0cmluZyk7XHJcblx0aWYgKHJlc3VsdCAhPSBudWxsICYmIHJlc3VsdC5sZW5ndGggPT0gMikge1xyXG5cclxuXHRcdHZhciBmb3JtYXR0ZXIgPSBnZXRGb3JtYXR0ZXJGdW5jdGlvbl8ocmVzdWx0WzFdKTtcclxuXHRcdGlmIChmb3JtYXR0ZXIgPT0gbnVsbCkge1xyXG5cdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgcGFyYW1zID0gZ2V0Rm9ybWF0dGVyUGFyYW1zXyhmb3JtYXRTdHJpbmcpO1xyXG5cclxuXHRcdHZhciBhZnRlciA9ICcnO1xyXG5cdFx0dmFyIGVuZEluZGV4ID0gZm9ybWF0U3RyaW5nLmxhc3RJbmRleE9mKCd9Jyk7XHJcblx0XHRpZiAoZW5kSW5kZXggIT0gLTEpIHtcclxuXHRcdFx0YWZ0ZXIgPSBmb3JtYXRTdHJpbmcuc3Vic3RyaW5nKGVuZEluZGV4ICsgMSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRhZnRlciA9IGZvcm1hdFN0cmluZy5zdWJzdHJpbmcocmVzdWx0LmluZGV4ICsgcmVzdWx0WzFdLmxlbmd0aCArIDEpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGZvcm1hdHRlciA6IGZvcm1hdHRlcixcclxuXHRcdFx0cGFyYW1zIDogcGFyYW1zLFxyXG5cdFx0XHRhZnRlciA6IGFmdGVyXHJcblx0XHR9O1xyXG5cclxuXHR9XHJcblxyXG5cdHJldHVybiBmb3JtYXRTdHJpbmc7XHJcblxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBmdW5jdGlvblxyXG4gKiBAbWVtYmVyT2YgZm9ybWF0dGVyXHJcbiAqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb21tYW5kXHJcbiAqXHJcbiAqIEByZXR1cm4gez9zdHJpbmd9XHJcbiAqL1xyXG52YXIgZ2V0Rm9ybWF0dGVyRnVuY3Rpb25fID0gZnVuY3Rpb24oY29tbWFuZCkge1xyXG5cclxuXHR2YXIgcmVnZXg7XHJcblx0Zm9yICggdmFyIGtleSBpbiBmb3JtYXR0ZXJzXykge1xyXG5cdFx0cmVnZXggPSBuZXcgUmVnRXhwKCdeJyArIGtleSArICckJyk7XHJcblx0XHRpZiAocmVnZXguZXhlYyhjb21tYW5kKSAhPSBudWxsKSB7XHJcblx0XHRcdHJldHVybiBmb3JtYXR0ZXJzX1trZXldO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cmV0dXJuIG51bGw7XHJcblxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBmdW5jdGlvblxyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gY29tbWFuZFxyXG4gKlxyXG4gKiBAcmV0dXJuIHtzdHJpbmd9XHJcbiAqL1xyXG52YXIgZ2V0Rm9ybWF0dGVyUGFyYW1zXyA9IGZ1bmN0aW9uKGNvbW1hbmQpIHtcclxuXHJcblx0dmFyIHBhcmFtcyA9IFtdO1xyXG5cdHZhciByZXN1bHQgPSBjb21tYW5kLm1hdGNoKC9cXHsoW15cXH1dKikoPz1cXH0pL2cpO1xyXG5cdGlmIChyZXN1bHQgIT0gbnVsbCkge1xyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByZXN1bHQubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0cGFyYW1zLnB1c2gocmVzdWx0W2ldLnN1YnN0cmluZygxKSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gcGFyYW1zO1xyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAZnVuY3Rpb25cclxuICpcclxuICogQHBhcmFtIHtBcnJheS48ZnVuY3Rpb258c3RyaW5nPn0gZm9ybWF0dGVyXHJcbiAqIEBwYXJhbSB7TE9HX0VWRU5UfSBsb2dFdmVudFxyXG4gKlxyXG4gKiBAcmV0dXJuIHtzdHJpbmd9XHJcbiAqL1xyXG52YXIgZm9ybWF0TG9nRXZlbnRfID0gZnVuY3Rpb24oZm9ybWF0dGVyLCBsb2dFdmVudCkge1xyXG5cclxuXHR2YXIgcmVzcG9uc2U7XHJcblx0dmFyIG1lc3NhZ2UgPSAnJztcclxuXHR2YXIgY291bnQgPSBmb3JtYXR0ZXIubGVuZ3RoO1xyXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xyXG5cdFx0aWYgKGZvcm1hdHRlcltpXSAhPT0gbnVsbCkge1xyXG5cclxuXHRcdFx0aWYgKGZvcm1hdHRlcltpXSBpbnN0YW5jZW9mIE9iamVjdCkge1xyXG5cclxuXHRcdFx0XHRyZXNwb25zZSA9IGZvcm1hdHRlcltpXS5mb3JtYXR0ZXIobG9nRXZlbnQsIGZvcm1hdHRlcltpXS5wYXJhbXMpO1xyXG5cdFx0XHRcdGlmIChyZXNwb25zZSAhPSBudWxsKSB7XHJcblx0XHRcdFx0XHRtZXNzYWdlICs9IHJlc3BvbnNlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRtZXNzYWdlICs9IGZvcm1hdHRlcltpXS5hZnRlcjtcclxuXHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0bWVzc2FnZSArPSBmb3JtYXR0ZXJbaV07XHJcblx0XHRcdH1cclxuXHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gbWVzc2FnZS50cmltKCk7XHJcblxyXG59O1xyXG5cclxuZnVuY3Rpb24gZ2V0RmlsZURldGFpbHNfKGxvZ0V2ZW50KSB7XHJcblxyXG5cdGlmIChsb2dFdmVudC5sb2dFcnJvclN0YWNrICE9PSB1bmRlZmluZWQpIHtcclxuXHJcblx0XHRsZXQgcGFydHMgPSBsb2dFdmVudC5sb2dFcnJvclN0YWNrLnN0YWNrLnNwbGl0KC9cXG4vZyk7XHJcblx0XHRsZXQgZmlsZSA9IHBhcnRzWzNdO1xyXG5cdFx0ZmlsZSA9IGZpbGUucmVwbGFjZSgvYXQgKC4qXFwofCkoZmlsZXxodHRwfGh0dHBzfCkoXFw6fCkoXFwvfCkqLywgJycpO1xyXG5cdFx0ZmlsZSA9IGZpbGUucmVwbGFjZSgnKScsICcnKTtcclxuXHRcdGZpbGUgPSBmaWxlLnJlcGxhY2UoKHR5cGVvZiBsb2NhdGlvbiAhPT0gJ3VuZGVmaW5lZCcpID8gbG9jYXRpb24uaG9zdCA6ICcnLCAnJykudHJpbSgpO1xyXG5cclxuXHRcdGxldCBmaWxlUGFydHMgPSBmaWxlLnNwbGl0KC9cXDovZyk7XHJcblxyXG5cdFx0bG9nRXZlbnQuY29sdW1uID0gZmlsZVBhcnRzLnBvcCgpO1xyXG5cdFx0bG9nRXZlbnQubGluZU51bWJlciA9IGZpbGVQYXJ0cy5wb3AoKTtcclxuXHJcblx0XHRpZiAodHlwZW9mIGRlZmluZSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuXHRcdFx0bGV0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XHJcblx0XHRcdGxldCBhcHBEaXIgPSBwYXRoLmRpcm5hbWUocmVxdWlyZS5tYWluLmZpbGVuYW1lKTtcclxuXHRcdFx0bG9nRXZlbnQuZmlsZW5hbWUgPSBmaWxlUGFydHMuam9pbignOicpLnJlcGxhY2UoYXBwRGlyLCAnJykucmVwbGFjZSgvKFxcXFx8XFwvKS8sICcnKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGxvZ0V2ZW50LmZpbGVuYW1lID0gZmlsZVBhcnRzLmpvaW4oJzonKTtcclxuXHRcdH1cclxuXHJcblx0fSBlbHNlIHtcclxuXHJcblx0XHRsb2dFdmVudC5jb2x1bW4gPSAnPyc7XHJcblx0XHRsb2dFdmVudC5maWxlbmFtZSA9ICdhbm9ueW1vdXMnO1xyXG5cdFx0bG9nRXZlbnQubGluZU51bWJlciA9ICc/JztcclxuXHJcblx0fVxyXG5cclxufVxyXG5cclxuLyoqXHJcbiAqIEBmdW5jdGlvblxyXG4gKlxyXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBmdW5jXHJcbiAqXHJcbiAqIEByZXR1cm4ge3N0cmluZ31cclxuICovXHJcbmZ1bmN0aW9uIGdldEZ1bmN0aW9uTmFtZV8oZnVuYykge1xyXG5cclxuXHRpZiAodHlwZW9mIGZ1bmMgIT09ICdmdW5jdGlvbicpIHtcclxuXHRcdHJldHVybiAnYW5vbnltb3VzJztcclxuXHR9XHJcblxyXG5cdGxldCBmdW5jdGlvbk5hbWUgPSBmdW5jLnRvU3RyaW5nKCk7XHJcblx0ZnVuY3Rpb25OYW1lID0gZnVuY3Rpb25OYW1lLnN1YnN0cmluZygnZnVuY3Rpb24gJy5sZW5ndGgpO1xyXG5cdGZ1bmN0aW9uTmFtZSA9IGZ1bmN0aW9uTmFtZS5zdWJzdHJpbmcoMCwgZnVuY3Rpb25OYW1lLmluZGV4T2YoJygnKSk7XHJcblxyXG5cdHJldHVybiAoZnVuY3Rpb25OYW1lICE9PSAnJykgPyBmdW5jdGlvbk5hbWUgOiAnYW5vbnltb3VzJztcclxuXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBAZnVuY3Rpb25cclxuICogQG1lbWJlck9mIGZvcm1hdHRlclxyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbGF5b3V0XHJcbiAqXHJcbiAqIEByZXR1cm4ge3N0cmluZ31cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwcmVDb21waWxlKGxheW91dCkge1xyXG5cdGdldENvbXBpbGVkTGF5b3V0XyhsYXlvdXQpO1xyXG59XHJcblxyXG4vKipcclxuICogQGZ1bmN0aW9uXHJcbiAqIEBtZW1iZXJPZiBmb3JtYXR0ZXJcclxuICpcclxuICogQHBhcmFtIHtzdHJpbmd9IGxheW91dFxyXG4gKiBAcGFyYW0ge0xPR19FVkVOVH0gbG9nRXZlbnRcclxuICpcclxuICogQHJldHVybiB7c3RyaW5nfVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdChsYXlvdXQsIGxvZ0V2ZW50KSB7XHJcblx0cmV0dXJuIGZvcm1hdExvZ0V2ZW50XyhnZXRDb21waWxlZExheW91dF8obGF5b3V0KSwgbG9nRXZlbnQpO1xyXG59Il19


/***/ },
/* 2 */
/***/ function(module, exports) {

	exports.__esModule = true;
	exports.dateFormat = dateFormat;
	/**
	 * log4js <https://github.com/anigenero/log4js>
	 *
	 * Copyright 2016-present Robin Schultz <http://cunae.com>
	 * Released under the MIT License
	 */

	var i18n = {
		dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
		monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
	};

	var TOKEN = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g;
	var TIMEZONE = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
	var TIMEZONE_CLIP = /[^-+\dA-Z]/g;

	/**
	 * Pads numbers in the date format
	 *
	 * @param value
	 * @param length
	 *
	 * @returns {?string}
	 */
	function pad(value, length) {
		value = String(value);
		length = length || 2;
		while (value.length < length) {
			value = "0" + value;
		}
		return value;
	}

	function dateFormat(date, mask, utc) {

		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date(date) : new Date();
		if (isNaN(date)) {
			throw SyntaxError("invalid date");
		}

		mask = String(mask || 'yyyy-mm-dd HH:MM:ss,S');

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var _ = utc ? "getUTC" : "get";
		var d = date[_ + "Date"]();
		var D = date[_ + "Day"]();
		var m = date[_ + "Month"]();
		var y = date[_ + "FullYear"]();
		var H = date[_ + "Hours"]();
		var M = date[_ + "Minutes"]();
		var s = date[_ + "Seconds"]();
		var L = date[_ + "Milliseconds"]();
		var o = utc ? 0 : date.getTimezoneOffset();
		var flags = {
			d: d,
			dd: pad(d),
			ddd: i18n.dayNames[D],
			dddd: i18n.dayNames[D + 7],
			M: m + 1,
			MM: pad(m + 1),
			MMM: i18n.monthNames[m],
			MMMM: i18n.monthNames[m + 12],
			yy: String(y).slice(2),
			yyyy: y,
			h: H % 12 || 12,
			hh: pad(H % 12 || 12),
			H: H,
			HH: pad(H),
			m: M,
			mm: pad(M),
			s: s,
			ss: pad(s),
			S: pad(L, 1),
			t: H < 12 ? "a" : "p",
			tt: H < 12 ? "am" : "pm",
			T: H < 12 ? "A" : "P",
			TT: H < 12 ? "AM" : "PM",
			Z: utc ? "UTC" : (String(date).match(TIMEZONE) || [""]).pop().replace(TIMEZONE_CLIP, ""),
			o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4)
		};

		return mask.replace(TOKEN, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	}
	//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kYXRlRm9ybWF0dGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQU9BLElBQUksSUFBSSxHQUFHO0FBQ1YsU0FBUSxFQUFHLENBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQy9FLFNBQVMsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUU7QUFDM0QsV0FBVSxFQUFHLENBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQzNFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUMzRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBRTtDQUNuRSxDQUFDOztBQUVGLElBQU0sS0FBSyxHQUFHLGdFQUFnRSxDQUFDO0FBQy9FLElBQU0sUUFBUSxHQUFHLHNJQUFzSSxDQUFDO0FBQ3hKLElBQU0sYUFBYSxHQUFHLGFBQWEsQ0FBQzs7Ozs7Ozs7OztBQVVwQyxTQUFTLEdBQUcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFO0FBQzNCLE1BQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdEIsT0FBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLENBQUM7QUFDckIsUUFBTyxLQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sRUFBRTtBQUM3QixPQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQztFQUNwQjtBQUNELFFBQU8sS0FBSyxDQUFDO0NBQ2I7O0FBRU0sU0FBUyxVQUFVLENBQUUsSUFBSSxF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QztFQUM1RCxDQUFDLENBQUM7Q0FFSCIsImZpbGUiOiJkYXRlRm9ybWF0dGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIGxvZzRqcyA8aHR0cHM6Ly9naXRodWIuY29tL2FuaWdlbmVyby9sb2c0anM+XHJcbiAqXHJcbiAqIENvcHlyaWdodCAyMDE2LXByZXNlbnQgUm9iaW4gU2NodWx0eiA8aHR0cDovL2N1bmFlLmNvbT5cclxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlXHJcbiAqL1xyXG5cclxubGV0IGkxOG4gPSB7XHJcblx0ZGF5TmFtZXMgOiBbIFwiU3VuXCIsIFwiTW9uXCIsIFwiVHVlXCIsIFwiV2VkXCIsIFwiVGh1XCIsIFwiRnJpXCIsIFwiU2F0XCIsIFwiU3VuZGF5XCIsIFwiTW9uZGF5XCIsXHJcblx0XHRcIlR1ZXNkYXlcIiwgXCJXZWRuZXNkYXlcIiwgXCJUaHVyc2RheVwiLCBcIkZyaWRheVwiLCBcIlNhdHVyZGF5XCIgXSxcclxuXHRtb250aE5hbWVzIDogWyBcIkphblwiLCBcIkZlYlwiLCBcIk1hclwiLCBcIkFwclwiLCBcIk1heVwiLCBcIkp1blwiLCBcIkp1bFwiLCBcIkF1Z1wiLCBcIlNlcFwiLFxyXG5cdFx0XCJPY3RcIiwgXCJOb3ZcIiwgXCJEZWNcIiwgXCJKYW51YXJ5XCIsIFwiRmVicnVhcnlcIiwgXCJNYXJjaFwiLCBcIkFwcmlsXCIsIFwiTWF5XCIsIFwiSnVuZVwiLFxyXG5cdFx0XCJKdWx5XCIsIFwiQXVndXN0XCIsIFwiU2VwdGVtYmVyXCIsIFwiT2N0b2JlclwiLCBcIk5vdmVtYmVyXCIsIFwiRGVjZW1iZXJcIiBdXHJcbn07XHJcblxyXG5jb25zdCBUT0tFTiA9IC9kezEsNH18bXsxLDR9fHl5KD86eXkpP3woW0hoTXNUdF0pXFwxP3xbTGxvU1pdfFwiW15cIl0qXCJ8J1teJ10qJy9nO1xyXG5jb25zdCBUSU1FWk9ORSA9IC9cXGIoPzpbUE1DRUFdW1NEUF1UfCg/OlBhY2lmaWN8TW91bnRhaW58Q2VudHJhbHxFYXN0ZXJufEF0bGFudGljKSAoPzpTdGFuZGFyZHxEYXlsaWdodHxQcmV2YWlsaW5nKSBUaW1lfCg/OkdNVHxVVEMpKD86Wy0rXVxcZHs0fSk/KVxcYi9nO1xyXG5jb25zdCBUSU1FWk9ORV9DTElQID0gL1teLStcXGRBLVpdL2c7XHJcblxyXG4vKipcclxuICogUGFkcyBudW1iZXJzIGluIHRoZSBkYXRlIGZvcm1hdFxyXG4gKlxyXG4gKiBAcGFyYW0gdmFsdWVcclxuICogQHBhcmFtIGxlbmd0aFxyXG4gKlxyXG4gKiBAcmV0dXJucyB7P3N0cmluZ31cclxuICovXHJcbmZ1bmN0aW9uIHBhZCh2YWx1ZSwgbGVuZ3RoKSB7XHJcblx0dmFsdWUgPSBTdHJpbmcodmFsdWUpO1xyXG5cdGxlbmd0aCA9IGxlbmd0aCB8fCAyO1xyXG5cdHdoaWxlICh2YWx1ZS5sZW5ndGggPCBsZW5ndGgpIHtcclxuXHRcdHZhbHVlID0gXCIwXCIgKyB2YWx1ZTtcclxuXHR9XHJcblx0cmV0dXJuIHZhbHVlO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZGF0ZUZvcm1hdCAoZGF0ZSwgbWFzaywgdXRjKSB7XHJcblxyXG5cdC8vIFlvdSBjYW4ndCBwcm92aWRlIHV0YyBpZiB5b3Ugc2tpcCBvdGhlciBhcmdzICh1c2UgdGhlIFwiVVRDOlwiIG1hc2sgcHJlZml4KVxyXG5cdGlmIChhcmd1bWVudHMubGVuZ3RoID09IDEgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGRhdGUpID09IFwiW29iamVjdCBTdHJpbmddXCIgJiYgIS9cXGQvLnRlc3QoZGF0ZSkpIHtcclxuXHRcdG1hc2sgPSBkYXRlO1xyXG5cdFx0ZGF0ZSA9IHVuZGVmaW5lZDtcclxuXHR9XHJcblxyXG5cdC8vIFBhc3NpbmcgZGF0ZSB0aHJvdWdoIERhdGUgYXBwbGllcyBEYXRlLnBhcnNlLCBpZiBuZWNlc3NhcnlcclxuXHRkYXRlID0gZGF0ZSA/IG5ldyBEYXRlKGRhdGUpIDogbmV3IERhdGU7XHJcblx0aWYgKGlzTmFOKGRhdGUpKSB7XHJcblx0XHR0aHJvdyBTeW50YXhFcnJvcihcImludmFsaWQgZGF0ZVwiKTtcclxuXHR9XHJcblxyXG5cdG1hc2sgPSBTdHJpbmcobWFzayB8fCAneXl5eS1tbS1kZCBISDpNTTpzcyxTJyk7XHJcblxyXG5cdC8vIEFsbG93IHNldHRpbmcgdGhlIHV0YyBhcmd1bWVudCB2aWEgdGhlIG1hc2tcclxuXHRpZiAobWFzay5zbGljZSgwLCA0KSA9PSBcIlVUQzpcIikge1xyXG5cdFx0bWFzayA9IG1hc2suc2xpY2UoNCk7XHJcblx0XHR1dGMgPSB0cnVlO1xyXG5cdH1cclxuXHJcblx0bGV0IF8gPSB1dGMgPyBcImdldFVUQ1wiIDogXCJnZXRcIjtcclxuXHRsZXQgZCA9IGRhdGVbXyArIFwiRGF0ZVwiXSgpO1xyXG5cdGxldCBEID0gZGF0ZVtfICsgXCJEYXlcIl0oKTtcclxuXHRsZXQgbSA9IGRhdGVbXyArIFwiTW9udGhcIl0oKTtcclxuXHRsZXQgeSA9IGRhdGVbXyArIFwiRnVsbFllYXJcIl0oKTtcclxuXHRsZXQgSCA9IGRhdGVbXyArIFwiSG91cnNcIl0oKTtcclxuXHRsZXQgTSA9IGRhdGVbXyArIFwiTWludXRlc1wiXSgpO1xyXG5cdGxldCBzID0gZGF0ZVtfICsgXCJTZWNvbmRzXCJdKCk7XHJcblx0bGV0IEwgPSBkYXRlW18gKyBcIk1pbGxpc2Vjb25kc1wiXSgpO1xyXG5cdGxldCBvID0gdXRjID8gMCA6IGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcclxuXHRsZXQgZmxhZ3MgPSB7XHJcblx0XHRkIDogZCxcclxuXHRcdGRkIDogcGFkKGQpLFxyXG5cdFx0ZGRkIDogaTE4bi5kYXlOYW1lc1tEXSxcclxuXHRcdGRkZGQgOiBpMThuLmRheU5hbWVzW0QgKyA3XSxcclxuXHRcdE0gOiBtICsgMSxcclxuXHRcdE1NIDogcGFkKG0gKyAxKSxcclxuXHRcdE1NTSA6IGkxOG4ubW9udGhOYW1lc1ttXSxcclxuXHRcdE1NTU0gOiBpMThuLm1vbnRoTmFtZXNbbSArIDEyXSxcclxuXHRcdHl5IDogU3RyaW5nKHkpLnNsaWNlKDIpLFxyXG5cdFx0eXl5eSA6IHksXHJcblx0XHRoIDogSCAlIDEyIHx8IDEyLFxyXG5cdFx0aGggOiBwYWQoSCAlIDEyIHx8IDEyKSxcclxuXHRcdEggOiBILFxyXG5cdFx0SEggOiBwYWQoSCksXHJcblx0XHRtIDogTSxcclxuXHRcdG1tIDogcGFkKE0pLFxyXG5cdFx0cyA6IHMsXHJcblx0XHRzcyA6IHBhZChzKSxcclxuXHRcdFMgOiBwYWQoTCwgMSksXHJcblx0XHR0IDogSCA8IDEyID8gXCJhXCIgOiBcInBcIixcclxuXHRcdHR0IDogSCA8IDEyID8gXCJhbVwiIDogXCJwbVwiLFxyXG5cdFx0VCA6IEggPCAxMiA/IFwiQVwiIDogXCJQXCIsXHJcblx0XHRUVCA6IEggPCAxMiA/IFwiQU1cIiA6IFwiUE1cIixcclxuXHRcdFogOiB1dGMgPyBcIlVUQ1wiIDogKFN0cmluZyhkYXRlKS5tYXRjaChUSU1FWk9ORSkgfHwgWyBcIlwiIF0pLnBvcCgpLnJlcGxhY2UoVElNRVpPTkVfQ0xJUCwgXCJcIiksXHJcblx0XHRvIDogKG8gPiAwID8gXCItXCIgOiBcIitcIikgKyBwYWQoTWF0aC5mbG9vcihNYXRoLmFicyhvKSAvIDYwKSAqIDEwMCArIE1hdGguYWJzKG8pICUgNjAsIDQpXHJcblx0fTtcclxuXHJcblx0cmV0dXJuIG1hc2sucmVwbGFjZShUT0tFTiwgZnVuY3Rpb24oJDApIHtcclxuXHRcdHJldHVybiAkMCBpbiBmbGFncyA/IGZsYWdzWyQwXSA6ICQwLnNsaWNlKDEsICQwLmxlbmd0aCAtIDEpO1xyXG5cdH0pO1xyXG5cclxufVxyXG4iXX0=


/***/ },
/* 3 */
/***/ function(module, exports) {

	exports.__esModule = true;
	/**
	 * log4js <https://github.com/anigenero/log4js>
	 *
	 * Copyright 2016-present Robin Schultz <http://cunae.com>
	 * Released under the MIT License
	 */

	var OFF = 0;
	exports.OFF = OFF;
	var FATAL = 100;
	exports.FATAL = FATAL;
	var ERROR = 200;
	exports.ERROR = ERROR;
	var WARN = 300;
	exports.WARN = WARN;
	var INFO = 400;
	exports.INFO = INFO;
	var DEBUG = 500;
	exports.DEBUG = DEBUG;
	var TRACE = 600;
	exports.TRACE = TRACE;
	var ALL = 2147483647;
	exports.ALL = ALL;
	//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb25zdC9sb2dMZXZlbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQU9PLElBQU0sR0FBRyxHQUFHLENBQUMsQ0FBQzs7QUFDZCxJQUFNLEtBQUssR0FBRyxHQUFHLENBQUM7O0FBQ2xCLElBQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQzs7QUFDbEIsSUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDOztBQUNqQixJQUFNLElBQUksR0FBRyxHQUFHLENBQUM7O0FBQ2pCLElBQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQzs7QUFDbEIsSUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDOztBQUNsQixJQUFNLEdBQUcsR0FBRyxVQUFVLENBQUMiLCJmaWxlIjoibG9nTGV2ZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogbG9nNGpzIDxodHRwczovL2dpdGh1Yi5jb20vYW5pZ2VuZXJvL2xvZzRqcz5cclxuICpcclxuICogQ29weXJpZ2h0IDIwMTYtcHJlc2VudCBSb2JpbiBTY2h1bHR6IDxodHRwOi8vY3VuYWUuY29tPlxyXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2VcclxuICovXHJcblxyXG5leHBvcnQgY29uc3QgT0ZGID0gMDtcclxuZXhwb3J0IGNvbnN0IEZBVEFMID0gMTAwO1xyXG5leHBvcnQgY29uc3QgRVJST1IgPSAyMDA7XHJcbmV4cG9ydCBjb25zdCBXQVJOID0gMzAwO1xyXG5leHBvcnQgY29uc3QgSU5GTyA9IDQwMDtcclxuZXhwb3J0IGNvbnN0IERFQlVHID0gNTAwO1xyXG5leHBvcnQgY29uc3QgVFJBQ0UgPSA2MDA7XHJcbmV4cG9ydCBjb25zdCBBTEwgPSAyMTQ3NDgzNjQ3O1xyXG4iXX0=


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// resolves . and .. elements in a path array with directory names there
	// must be no slashes, empty elements, or device names (c:\) in the array
	// (so also no leading and trailing slashes - it does not distinguish
	// relative and absolute paths)
	function normalizeArray(parts, allowAboveRoot) {
	  // if the path tries to go above the root, `up` ends up > 0
	  var up = 0;
	  for (var i = parts.length - 1; i >= 0; i--) {
	    var last = parts[i];
	    if (last === '.') {
	      parts.splice(i, 1);
	    } else if (last === '..') {
	      parts.splice(i, 1);
	      up++;
	    } else if (up) {
	      parts.splice(i, 1);
	      up--;
	    }
	  }

	  // if the path is allowed to go above the root, restore leading ..s
	  if (allowAboveRoot) {
	    for (; up--; up) {
	      parts.unshift('..');
	    }
	  }

	  return parts;
	}

	// Split a filename into [root, dir, basename, ext], unix version
	// 'root' is just a slash, or nothing.
	var splitPathRe =
	    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
	var splitPath = function(filename) {
	  return splitPathRe.exec(filename).slice(1);
	};

	// path.resolve([from ...], to)
	// posix version
	exports.resolve = function() {
	  var resolvedPath = '',
	      resolvedAbsolute = false;

	  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
	    var path = (i >= 0) ? arguments[i] : process.cwd();

	    // Skip empty and invalid entries
	    if (typeof path !== 'string') {
	      throw new TypeError('Arguments to path.resolve must be strings');
	    } else if (!path) {
	      continue;
	    }

	    resolvedPath = path + '/' + resolvedPath;
	    resolvedAbsolute = path.charAt(0) === '/';
	  }

	  // At this point the path should be resolved to a full absolute path, but
	  // handle relative paths to be safe (might happen when process.cwd() fails)

	  // Normalize the path
	  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
	    return !!p;
	  }), !resolvedAbsolute).join('/');

	  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
	};

	// path.normalize(path)
	// posix version
	exports.normalize = function(path) {
	  var isAbsolute = exports.isAbsolute(path),
	      trailingSlash = substr(path, -1) === '/';

	  // Normalize the path
	  path = normalizeArray(filter(path.split('/'), function(p) {
	    return !!p;
	  }), !isAbsolute).join('/');

	  if (!path && !isAbsolute) {
	    path = '.';
	  }
	  if (path && trailingSlash) {
	    path += '/';
	  }

	  return (isAbsolute ? '/' : '') + path;
	};

	// posix version
	exports.isAbsolute = function(path) {
	  return path.charAt(0) === '/';
	};

	// posix version
	exports.join = function() {
	  var paths = Array.prototype.slice.call(arguments, 0);
	  return exports.normalize(filter(paths, function(p, index) {
	    if (typeof p !== 'string') {
	      throw new TypeError('Arguments to path.join must be strings');
	    }
	    return p;
	  }).join('/'));
	};


	// path.relative(from, to)
	// posix version
	exports.relative = function(from, to) {
	  from = exports.resolve(from).substr(1);
	  to = exports.resolve(to).substr(1);

	  function trim(arr) {
	    var start = 0;
	    for (; start < arr.length; start++) {
	      if (arr[start] !== '') break;
	    }

	    var end = arr.length - 1;
	    for (; end >= 0; end--) {
	      if (arr[end] !== '') break;
	    }

	    if (start > end) return [];
	    return arr.slice(start, end - start + 1);
	  }

	  var fromParts = trim(from.split('/'));
	  var toParts = trim(to.split('/'));

	  var length = Math.min(fromParts.length, toParts.length);
	  var samePartsLength = length;
	  for (var i = 0; i < length; i++) {
	    if (fromParts[i] !== toParts[i]) {
	      samePartsLength = i;
	      break;
	    }
	  }

	  var outputParts = [];
	  for (var i = samePartsLength; i < fromParts.length; i++) {
	    outputParts.push('..');
	  }

	  outputParts = outputParts.concat(toParts.slice(samePartsLength));

	  return outputParts.join('/');
	};

	exports.sep = '/';
	exports.delimiter = ':';

	exports.dirname = function(path) {
	  var result = splitPath(path),
	      root = result[0],
	      dir = result[1];

	  if (!root && !dir) {
	    // No dirname whatsoever
	    return '.';
	  }

	  if (dir) {
	    // It has a dirname, strip trailing slash
	    dir = dir.substr(0, dir.length - 1);
	  }

	  return root + dir;
	};


	exports.basename = function(path, ext) {
	  var f = splitPath(path)[2];
	  // TODO: make this comparison case-insensitive on windows?
	  if (ext && f.substr(-1 * ext.length) === ext) {
	    f = f.substr(0, f.length - ext.length);
	  }
	  return f;
	};


	exports.extname = function(path) {
	  return splitPath(path)[3];
	};

	function filter (xs, f) {
	    if (xs.filter) return xs.filter(f);
	    var res = [];
	    for (var i = 0; i < xs.length; i++) {
	        if (f(xs[i], i, xs)) res.push(xs[i]);
	    }
	    return res;
	}

	// String.prototype.substr - negative index don't work in IE8
	var substr = 'ab'.substr(-1) === 'b'
	    ? function (str, start, len) { return str.substr(start, len) }
	    : function (str, start, len) {
	        if (start < 0) start = str.length + start;
	        return str.substr(start, len);
	    }
	;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ },
/* 5 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	exports.__esModule = true;
	exports.Logger = Logger;
	// istanbul ignore next

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

	/**
	 * log4js <https://github.com/anigenero/log4js>
	 *
	 * Copyright 2016-present Robin Schultz <http://cunae.com>
	 * Released under the MIT License
	 */

	var _utility = __webpack_require__(7);

	var utility = _interopRequireWildcard(_utility);

	var _constLogLevel = __webpack_require__(3);

	var logLevel = _interopRequireWildcard(_constLogLevel);

	function Logger(context, appenderObj) {

		/** @typeof {number} */
		var relative_ = new Date().getTime();
		/** @typeof {number} */
		var logSequence_ = 1;

		// Get the context
		if (typeof context != 'string') {

			if (typeof context == 'function') {
				context = utility.getFunctionName(context);
			} else if (typeof context == 'object') {
				context = utility.getFunctionName(context.constructor);
				if (context == 'Object') {
					context = 'anonymous';
				}
			} else {
				context = 'anonymous';
			}
		}

		/** @type {string} */
		var logContext_ = context;

		/**
	  * Logs an error event
	  */
		this.error = function () {
			appenderObj.append(constructLogEvent_(logLevel.ERROR, arguments));
		};

		/**
	  * Logs a warning
	  */
		this.warn = function () {
			appenderObj.append(constructLogEvent_(logLevel.WARN, arguments));
		};

		/**
	  * Logs an info level event
	  */
		this.info = function () {
			appenderObj.append(constructLogEvent_(logLevel.INFO, arguments));
		};

		/**
	  * Logs a debug event
	  */
		this.debug = function () {
			appenderObj.append(constructLogEvent_(logLevel.DEBUG, arguments));
		};

		/**
	  * Logs a trace event
	  */
		this.trace = function () {
			appenderObj.append(constructLogEvent_(logLevel.TRACE, arguments));
		};

		/**
	  * @function
	  *
	  * @param {number} level
	  * @param {Array} args
	  *
	  * @return {LOG_EVENT}
	  */
		function constructLogEvent_(level, args) {

			var error = new Error();
			var loggingEvent = {
				error: null,
				logErrorStack: error,
				file: null,
				level: level,
				lineNumber: null,
				logger: logContext_,
				message: '',
				method: args.callee.caller,
				properties: undefined,
				relative: new Date().getTime() - relative_,
				sequence: logSequence_++
			};

			var messageStubs = 0;
			for (var i = 0; i < args.length; i++) {

				if (i === 0) {
					loggingEvent.message = args[i];
					var stubs = /\{\}/g.exec(loggingEvent.message);
					messageStubs = stubs instanceof Array ? stubs.length : 0;
				} else if (messageStubs > 0) {
					loggingEvent.message = loggingEvent.message.replace(/\{\}/, args[i]);
					messageStubs--;
				} else if (args[i] instanceof Error) {
					loggingEvent.error = args[i];
				} else {
					loggingEvent.properties = args[i];
				}
			}

			return loggingEvent;
		}

		return this;
	}
	//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sb2dnZXIvbG9nZ2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7dUJBT3lCLFlBQVk7O0lBQXpCLE9BQU87OzZCQUNPLG1CQUFtQjs7SUFBakMsUUFBUTs7QUFFYixTQUFTLE1BQU0sQ0FBQyxPQUFPLEVBQUUsV0FBVyxFQUFFOzs7QUFHNUMsS0FBSSxTQUFTLEdBQUcsQUFBQyxJQUFJLElBQUksRUFBRSxDQUFFLE9BQU8sRUFBRSxDQUFDOztBQUV2QyxLQUFJLFlBQVksR0FBRyxDQUFDLENBQUM7OztBQUdyQixLQUFJLE9BQU8sT0FBTyxJQUFJLFFBQVEsRUFBRTs7QUFFL0IsTUFBSSxPQUFPLE9BQU8sSUFBSSxVQUFVLEVBQUU7QUFDakMsVUFBTyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDM0MsTUFBTSxJQUFJLE9BQU8sT0FBTyxJQUFJLFFBQVEsRUFBRTtBQUN0QyxVQUFPLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDdkQsT0FBSSxPQUFPLElBQUksUUFBUSxFQUFFO0FBQ3hCLFdBQU8sR0FBRyxXQUFXLENBQUM7SUFDdEI7R0FDRCxNQUFNO0FBQ04sVUFBTyxHQUFHLFdBQVcsQ0FBQztHQUN0QjtFQUVEOzs7QUFHRCxLQUFJLFdBQVcsR0FBRyxPQUFPLENBQUM7Ozs7O0FBSzFCLEtBQUksQ0FBQyxLQUFLLEdBQUcsWUFBVztBQUN2QixhQUFXLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztFQUNsRSxDQUFDOzs7OztBQUtGLEtBQUksQ0FBQyxJQUFJLEdBQUcsWUFBVztBQUN0QixhQUFXLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztFQUNqRSxDQUFDOzs7OztBQUtGLEtBQUksQ0FBQyxJQUFJLEdBQUcsWUFBVztBQUN0QixhQUFXLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztFQUNqRSxDQUFDOzs7OztBQUtGLEtBQUksQ0FBQyxLQUFLLEdBQUcsWUFBVztBQUN2QixhQUFXLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztFQUNsRSxDQUFDOzs7OztBQUtGLEtBQUksQ0FBQyxLQUFLLEdBQUcsWUFBVztBQUN2QixhQUFXLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztFQUNsRSxDQUFDOzs7Ozs7Ozs7O0FBVUYsVUFBUyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFOztBQUV4QyxNQUFJLEtBQUssR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO0FBQ3hCLE1BQUksWUFBWSxHQUFHO0FBQ2xCLFFBQUssRUFBRyxJQUFJO0FBQ1osZ0JBQWEsRUFBRyxLQUFLO0FBQ3JCLE9BQUksRUFBRyxJQUFJO0FBQ1gsUUFBSyxFQUFHLEtBQUs7QUFDYixhQUFVLEVBQUcsSUFBSTtBQUNqQixTQUFNLEVBQUcsV0FBVztBQUNwQixVQUFPLEVBQUcsRUFBRTtBQUNaLFNBQU0sRUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU07QUFDM0IsYUFBVSxFQUFHLFNBQVM7QUFDdEIsV0FBUSxFQUFHLEFBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBRSxPQUFPLEVBQUUsR0FBRyxTQUFTO0FBQzdDLFdBQVEsRUFBRyxZQUFZLEVBQUU7R0FDekIsQ0FBQzs7QUFFRixNQUFJLFlBQVksR0FBRyxDQUFDLENBQUM7QUFDckIsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7O0FBRXJDLE9BQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUNaLGdCQUFZLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvQixRQUFJLEtBQUssR0FBRyxBQUFDLE9BQU8sQ0FBRSxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2pELGdCQUFZLEdBQUcsQUFBQyxLQUFLLFlBQVksS0FBSyxHQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQzNELE1BQU0sSUFBSSxZQUFZLEdBQUcsQ0FBQyxFQUFFO0FBQzVCLGdCQUFZLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyRSxnQkFBWSxFQUFFLENBQUM7SUFDZixNQUFNLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxZQUFZLEtBQUssRUFBRTtBQUNwQyxnQkFBWSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0IsTUFBTTtBQUNOLGdCQUFZLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsQztHQUVEOztBQUVELFNBQU8sWUFBWSxDQUFDO0VBRXBCOztBQUVELFFBQU8sSUFBSSxDQUFDO0NBRVoiLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIGxvZzRqcyA8aHR0cHM6Ly9naXRodWIuY29tL2FuaWdlbmVyby9sb2c0anM+XHJcbiAqXHJcbiAqIENvcHlyaWdodCAyMDE2LXByZXNlbnQgUm9iaW4gU2NodWx0eiA8aHR0cDovL2N1bmFlLmNvbT5cclxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0ICogYXMgdXRpbGl0eSBmcm9tICcuLi91dGlsaXR5JztcclxuaW1wb3J0ICogYXMgbG9nTGV2ZWwgZnJvbSAnLi4vY29uc3QvbG9nTGV2ZWwnO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIExvZ2dlcihjb250ZXh0LCBhcHBlbmRlck9iaikge1xyXG5cclxuXHQvKiogQHR5cGVvZiB7bnVtYmVyfSAqL1xyXG5cdGxldCByZWxhdGl2ZV8gPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpO1xyXG5cdC8qKiBAdHlwZW9mIHtudW1iZXJ9ICovXHJcblx0bGV0IGxvZ1NlcXVlbmNlXyA9IDE7XHJcblxyXG5cdC8vIEdldCB0aGUgY29udGV4dFxyXG5cdGlmICh0eXBlb2YgY29udGV4dCAhPSAnc3RyaW5nJykge1xyXG5cclxuXHRcdGlmICh0eXBlb2YgY29udGV4dCA9PSAnZnVuY3Rpb24nKSB7XHJcblx0XHRcdGNvbnRleHQgPSB1dGlsaXR5LmdldEZ1bmN0aW9uTmFtZShjb250ZXh0KTtcclxuXHRcdH0gZWxzZSBpZiAodHlwZW9mIGNvbnRleHQgPT0gJ29iamVjdCcpIHtcclxuXHRcdFx0Y29udGV4dCA9IHV0aWxpdHkuZ2V0RnVuY3Rpb25OYW1lKGNvbnRleHQuY29uc3RydWN0b3IpO1xyXG5cdFx0XHRpZiAoY29udGV4dCA9PSAnT2JqZWN0Jykge1xyXG5cdFx0XHRcdGNvbnRleHQgPSAnYW5vbnltb3VzJztcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Y29udGV4dCA9ICdhbm9ueW1vdXMnO1xyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xyXG5cdGxldCBsb2dDb250ZXh0XyA9IGNvbnRleHQ7XHJcblxyXG5cdC8qKlxyXG5cdCAqIExvZ3MgYW4gZXJyb3IgZXZlbnRcclxuXHQgKi9cclxuXHR0aGlzLmVycm9yID0gZnVuY3Rpb24oKSB7XHJcblx0XHRhcHBlbmRlck9iai5hcHBlbmQoY29uc3RydWN0TG9nRXZlbnRfKGxvZ0xldmVsLkVSUk9SLCBhcmd1bWVudHMpKTtcclxuXHR9O1xyXG5cclxuXHQvKipcclxuXHQgKiBMb2dzIGEgd2FybmluZ1xyXG5cdCAqL1xyXG5cdHRoaXMud2FybiA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0YXBwZW5kZXJPYmouYXBwZW5kKGNvbnN0cnVjdExvZ0V2ZW50Xyhsb2dMZXZlbC5XQVJOLCBhcmd1bWVudHMpKTtcclxuXHR9O1xyXG5cclxuXHQvKipcclxuXHQgKiBMb2dzIGFuIGluZm8gbGV2ZWwgZXZlbnRcclxuXHQgKi9cclxuXHR0aGlzLmluZm8gPSBmdW5jdGlvbigpIHtcclxuXHRcdGFwcGVuZGVyT2JqLmFwcGVuZChjb25zdHJ1Y3RMb2dFdmVudF8obG9nTGV2ZWwuSU5GTywgYXJndW1lbnRzKSk7XHJcblx0fTtcclxuXHJcblx0LyoqXHJcblx0ICogTG9ncyBhIGRlYnVnIGV2ZW50XHJcblx0ICovXHJcblx0dGhpcy5kZWJ1ZyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0YXBwZW5kZXJPYmouYXBwZW5kKGNvbnN0cnVjdExvZ0V2ZW50Xyhsb2dMZXZlbC5ERUJVRywgYXJndW1lbnRzKSk7XHJcblx0fTtcclxuXHJcblx0LyoqXHJcblx0ICogTG9ncyBhIHRyYWNlIGV2ZW50XHJcblx0ICovXHJcblx0dGhpcy50cmFjZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0YXBwZW5kZXJPYmouYXBwZW5kKGNvbnN0cnVjdExvZ0V2ZW50Xyhsb2dMZXZlbC5UUkFDRSwgYXJndW1lbnRzKSk7XHJcblx0fTtcclxuXHJcblx0LyoqXHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge251bWJlcn0gbGV2ZWxcclxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcmdzXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIHtMT0dfRVZFTlR9XHJcblx0ICovXHJcblx0ZnVuY3Rpb24gY29uc3RydWN0TG9nRXZlbnRfKGxldmVsLCBhcmdzKSB7XHJcblxyXG5cdFx0bGV0IGVycm9yID0gbmV3IEVycm9yKCk7XHJcblx0XHRsZXQgbG9nZ2luZ0V2ZW50ID0ge1xyXG5cdFx0XHRlcnJvciA6IG51bGwsXHJcblx0XHRcdGxvZ0Vycm9yU3RhY2sgOiBlcnJvcixcclxuXHRcdFx0ZmlsZSA6IG51bGwsXHJcblx0XHRcdGxldmVsIDogbGV2ZWwsXHJcblx0XHRcdGxpbmVOdW1iZXIgOiBudWxsLFxyXG5cdFx0XHRsb2dnZXIgOiBsb2dDb250ZXh0XyxcclxuXHRcdFx0bWVzc2FnZSA6ICcnLFxyXG5cdFx0XHRtZXRob2QgOiBhcmdzLmNhbGxlZS5jYWxsZXIsXHJcblx0XHRcdHByb3BlcnRpZXMgOiB1bmRlZmluZWQsXHJcblx0XHRcdHJlbGF0aXZlIDogKG5ldyBEYXRlKCkpLmdldFRpbWUoKSAtIHJlbGF0aXZlXyxcclxuXHRcdFx0c2VxdWVuY2UgOiBsb2dTZXF1ZW5jZV8rK1xyXG5cdFx0fTtcclxuXHJcblx0XHRsZXQgbWVzc2FnZVN0dWJzID0gMDtcclxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xyXG5cclxuXHRcdFx0aWYgKGkgPT09IDApIHtcclxuXHRcdFx0XHRsb2dnaW5nRXZlbnQubWVzc2FnZSA9IGFyZ3NbaV07XHJcblx0XHRcdFx0bGV0IHN0dWJzID0gKC9cXHtcXH0vZykuZXhlYyhsb2dnaW5nRXZlbnQubWVzc2FnZSk7XHJcblx0XHRcdFx0bWVzc2FnZVN0dWJzID0gKHN0dWJzIGluc3RhbmNlb2YgQXJyYXkpID8gc3R1YnMubGVuZ3RoIDogMDtcclxuXHRcdFx0fSBlbHNlIGlmIChtZXNzYWdlU3R1YnMgPiAwKSB7XHJcblx0XHRcdFx0bG9nZ2luZ0V2ZW50Lm1lc3NhZ2UgPSBsb2dnaW5nRXZlbnQubWVzc2FnZS5yZXBsYWNlKC9cXHtcXH0vLCBhcmdzW2ldKTtcclxuXHRcdFx0XHRtZXNzYWdlU3R1YnMtLTtcclxuXHRcdFx0fSBlbHNlIGlmIChhcmdzW2ldIGluc3RhbmNlb2YgRXJyb3IpIHtcclxuXHRcdFx0XHRsb2dnaW5nRXZlbnQuZXJyb3IgPSBhcmdzW2ldO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGxvZ2dpbmdFdmVudC5wcm9wZXJ0aWVzID0gYXJnc1tpXTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gbG9nZ2luZ0V2ZW50O1xyXG5cclxuXHR9XHJcblxyXG5cdHJldHVybiB0aGlzO1xyXG5cclxufVxyXG4iXX0=


/***/ },
/* 7 */
/***/ function(module, exports) {

	exports.__esModule = true;
	exports.getFunctionName = getFunctionName;

	function getFunctionName(func) {

	    if (typeof func !== 'function') {
	        return 'anonymous';
	    }

	    var functionName = func.toString();
	    functionName = functionName.substring('function '.length);
	    functionName = functionName.substring(0, functionName.indexOf('('));

	    return functionName !== '' ? functionName : 'anonymous';
	}
	//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsaXR5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFPLFNBQVMsZUFBZSxDQUFDLElBQUksRUFBRTs7QUFFbEMsUUFBSSxPQUFPLElBQUksS0FBSyxVQUFVLEVBQUU7QUFDNUIsZUFBTyxXQUFXLENBQUM7S0FDdEI7O0FBRUQsUUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ25DLGdCQUFZLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDMUQsZ0JBQVksR0FBRyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7O0FBRXBFLFdBQU8sQUFBQyxZQUFZLEtBQUssRUFBRSxHQUFJLFlBQVksR0FBRyxXQUFXLENBQUM7Q0FFN0QiLCJmaWxlIjoidXRpbGl0eS5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBnZXRGdW5jdGlvbk5hbWUoZnVuYykge1xyXG5cclxuICAgIGlmICh0eXBlb2YgZnVuYyAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIHJldHVybiAnYW5vbnltb3VzJztcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZnVuY3Rpb25OYW1lID0gZnVuYy50b1N0cmluZygpO1xyXG4gICAgZnVuY3Rpb25OYW1lID0gZnVuY3Rpb25OYW1lLnN1YnN0cmluZygnZnVuY3Rpb24gJy5sZW5ndGgpO1xyXG4gICAgZnVuY3Rpb25OYW1lID0gZnVuY3Rpb25OYW1lLnN1YnN0cmluZygwLCBmdW5jdGlvbk5hbWUuaW5kZXhPZignKCcpKTtcclxuXHJcbiAgICByZXR1cm4gKGZ1bmN0aW9uTmFtZSAhPT0gJycpID8gZnVuY3Rpb25OYW1lIDogJ2Fub255bW91cyc7XHJcblxyXG59Il19


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	exports.__esModule = true;
	exports.ConsoleAppender = ConsoleAppender;
	// istanbul ignore next

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

	/**
	 * log4js <https://github.com/anigenero/log4js>
	 *
	 * Copyright 2016-present Robin Schultz <http://cunae.com>
	 * Released under the MIT License
	 */

	var _constLogLevel = __webpack_require__(3);

	var LogLevel = _interopRequireWildcard(_constLogLevel);

	var _formatter = __webpack_require__(1);

	var formatter = _interopRequireWildcard(_formatter);

	function ConsoleAppender() {

		/** @type {string} */
		var tagLayout_ = '%m';
		/** @type {number} */
		var logLevel_ = LogLevel.INFO;

		/**
	  * @function
	  *
	  * @param {LOG_EVENT} loggingEvent
	  */
		function append(loggingEvent) {
			if (loggingEvent.level <= logLevel_) {
				appendToConsole_(loggingEvent);
			}
		}

		/**
	  * @private
	  * @function
	  *
	  * @param {LOG_EVENT} loggingEvent
	  */
		function appendToConsole_(loggingEvent) {

			var message = formatter.format(tagLayout_, loggingEvent);

			if (loggingEvent.level == LogLevel.ERROR) {
				console.error(message, loggingEvent.error || null);
			} else if (loggingEvent.level == LogLevel.WARN) {
				console.warn(message);
			} else if (loggingEvent.level == LogLevel.INFO) {
				console.info(message);
			} else if (loggingEvent.level == LogLevel.DEBUG || loggingEvent.level == LogLevel.TRACE) {
				console.log(message);
			}
		}

		/**
	  * Gets the name of the logger
	  *
	  * @function
	  *
	  * @return {string}
	  */
		function getName() {
			return 'ConsoleAppender';
		}

		/**
	  * Returns true if the appender is active, else false
	  *
	  * @function
	  *
	  * @param {number} level
	  *
	  * @return {boolean}
	  */
		function isActive(level) {
			return level <= logLevel_;
		}

		/**
	  * @function
	  *
	  * @return {number}
	  */
		function getLogLevel() {
			return logLevel_;
		}

		/**
	  * @function
	  *
	  * @param {number} logLevel
	  */
		function setLogLevel(logLevel) {
			logLevel_ = logLevel;
		}

		/**
	  * @function
	  *
	  * @param {string} tagLayout
	  */
		function setTagLayout(tagLayout) {
			tagLayout_ = tagLayout;
		}

		return {
			append: append,
			getName: getName,
			isActive: isActive,
			getLogLevel: getLogLevel,
			setLogLevel: setLogLevel,
			setTagLayout: setTagLayout
		};
	}
	//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHBlbmRlcnMvY29uc29sZUFwcGVuZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7NkJBTzBCLG1CQUFtQjs7SUFBakMsUUFBUTs7eUJBQ08sY0FBYzs7SUFBN0IsU0FBUzs7QUFFZCxTQUFTLGVBQWUsR0FBRzs7O0FBR2pDLEtBQUksVUFBVSxHQUFHLElBQUksQ0FBQzs7QUFFdEIsS0FBSSxTQUFTLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQzs7Ozs7OztBQU85QixVQUFTLE1BQU0sQ0FBQyxZQUFZLEVBQUU7QUFDN0IsTUFBSSxZQUFZLENBQUMsS0FBSyxJQUFJLFNBQVMsRUFBRTtBQUNwQyxtQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztHQUMvQjtFQUNEOzs7Ozs7OztBQVFELFVBQVMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFOztBQUV2QyxNQUFJLE9BQU8sR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQzs7QUFFekQsTUFBSSxZQUFZLENBQUMsS0FBSyxJQUFJLFFBQVEsQ0FBQyxLQUFLLEVBQUU7QUFDekMsVUFBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUcsWUFBWSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUUsQ0FBQztHQUNyRCxNQUFNLElBQUksWUFBWSxDQUFDLEtBQUssSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFO0FBQy9DLFVBQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDdEIsTUFBTSxJQUFJLFlBQVksQ0FBQyxLQUFLLElBQUksUUFBUSxDQUFDLElBQUksRUFBRTtBQUMvQyxVQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0dBQ3RCLE1BQU0sSUFBSSxZQUFZLENBQUMsS0FBSyxJQUFJLFFBQVEsQ0FBQyxLQUFLLElBQzlDLFlBQVksQ0FBQyxLQUFLLElBQUksUUFBUSxDQUFDLEtBQUssRUFBRTtBQUN0QyxVQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0dBQ3JCO0VBRUQ7Ozs7Ozs7OztBQVNELFVBQVMsT0FBTyxHQUFHO0FBQ2xCLFNBQU8saUJBQWlCLENBQUM7RUFDekI7Ozs7Ozs7Ozs7O0FBV0QsVUFBUyxRQUFRLENBQUMsS0FBSyxFQUFFO0FBQ3hCLFNBQVEsS0FBSyxJQUFJLFNBQVMsQ0FBRTtFQUM1Qjs7Ozs7OztBQU9ELFVBQVMsV0FBVyxHQUFHO0FBQ3RCLFNBQU8sU0FBUyxDQUFDO0VBQ2pCOzs7Ozs7O0FBT0QsVUFBUyxXQUFXLENBQUMsUUFBUSxFQUFFO0FBQzlCLFdBQVMsR0FBRyxRQUFRLENBQUM7RUFDckI7Ozs7Ozs7QUFPRCxVQUFTLFlBQVksQ0FBQyxTQUFTLEVBQUU7QUFDaEMsWUFBVSxHQUFHLFNBQVMsQ0FBQztFQUN2Qjs7QUFFRCxRQUFPO0FBQ04sUUFBTSxFQUFHLE1BQU07QUFDZixTQUFPLEVBQUcsT0FBTztBQUNqQixVQUFRLEVBQUcsUUFBUTtBQUNuQixhQUFXLEVBQUcsV0FBVztBQUN6QixhQUFXLEVBQUcsV0FBVztBQUN6QixjQUFZLEVBQUcsWUFBWTtFQUMzQixDQUFDO0NBRUYiLCJmaWxlIjoiY29uc29sZUFwcGVuZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIGxvZzRqcyA8aHR0cHM6Ly9naXRodWIuY29tL2FuaWdlbmVyby9sb2c0anM+XHJcbiAqXHJcbiAqIENvcHlyaWdodCAyMDE2LXByZXNlbnQgUm9iaW4gU2NodWx0eiA8aHR0cDovL2N1bmFlLmNvbT5cclxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0ICogYXMgTG9nTGV2ZWwgZnJvbSAnLi4vY29uc3QvbG9nTGV2ZWwnO1xyXG5pbXBvcnQgKiBhcyBmb3JtYXR0ZXIgZnJvbSAnLi4vZm9ybWF0dGVyJztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBDb25zb2xlQXBwZW5kZXIoKSB7XHJcblxyXG5cdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xyXG5cdGxldCB0YWdMYXlvdXRfID0gJyVtJztcclxuXHQvKiogQHR5cGUge251bWJlcn0gKi9cclxuXHRsZXQgbG9nTGV2ZWxfID0gTG9nTGV2ZWwuSU5GTztcclxuXHJcblx0LyoqXHJcblx0ICogQGZ1bmN0aW9uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge0xPR19FVkVOVH0gbG9nZ2luZ0V2ZW50XHJcblx0ICovXHJcblx0ZnVuY3Rpb24gYXBwZW5kKGxvZ2dpbmdFdmVudCkge1xyXG5cdFx0aWYgKGxvZ2dpbmdFdmVudC5sZXZlbCA8PSBsb2dMZXZlbF8pIHtcclxuXHRcdFx0YXBwZW5kVG9Db25zb2xlXyhsb2dnaW5nRXZlbnQpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHByaXZhdGVcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7TE9HX0VWRU5UfSBsb2dnaW5nRXZlbnRcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBhcHBlbmRUb0NvbnNvbGVfKGxvZ2dpbmdFdmVudCkge1xyXG5cclxuXHRcdGxldCBtZXNzYWdlID0gZm9ybWF0dGVyLmZvcm1hdCh0YWdMYXlvdXRfLCBsb2dnaW5nRXZlbnQpO1xyXG5cclxuXHRcdGlmIChsb2dnaW5nRXZlbnQubGV2ZWwgPT0gTG9nTGV2ZWwuRVJST1IpIHtcclxuXHRcdFx0Y29uc29sZS5lcnJvcihtZXNzYWdlLCAobG9nZ2luZ0V2ZW50LmVycm9yIHx8IG51bGwpKTtcclxuXHRcdH0gZWxzZSBpZiAobG9nZ2luZ0V2ZW50LmxldmVsID09IExvZ0xldmVsLldBUk4pIHtcclxuXHRcdFx0Y29uc29sZS53YXJuKG1lc3NhZ2UpO1xyXG5cdFx0fSBlbHNlIGlmIChsb2dnaW5nRXZlbnQubGV2ZWwgPT0gTG9nTGV2ZWwuSU5GTykge1xyXG5cdFx0XHRjb25zb2xlLmluZm8obWVzc2FnZSk7XHJcblx0XHR9IGVsc2UgaWYgKGxvZ2dpbmdFdmVudC5sZXZlbCA9PSBMb2dMZXZlbC5ERUJVRyB8fFxyXG5cdFx0XHRsb2dnaW5nRXZlbnQubGV2ZWwgPT0gTG9nTGV2ZWwuVFJBQ0UpIHtcclxuXHRcdFx0Y29uc29sZS5sb2cobWVzc2FnZSk7XHJcblx0XHR9XHJcblxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogR2V0cyB0aGUgbmFtZSBvZiB0aGUgbG9nZ2VyXHJcblx0ICpcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKlxyXG5cdCAqIEByZXR1cm4ge3N0cmluZ31cclxuXHQgKi9cclxuXHRmdW5jdGlvbiBnZXROYW1lKCkge1xyXG5cdFx0cmV0dXJuICdDb25zb2xlQXBwZW5kZXInO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0cnVlIGlmIHRoZSBhcHBlbmRlciBpcyBhY3RpdmUsIGVsc2UgZmFsc2VcclxuXHQgKlxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IGxldmVsXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIHtib29sZWFufVxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGlzQWN0aXZlKGxldmVsKSB7XHJcblx0XHRyZXR1cm4gKGxldmVsIDw9IGxvZ0xldmVsXyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKlxyXG5cdCAqIEByZXR1cm4ge251bWJlcn1cclxuXHQgKi9cclxuXHRmdW5jdGlvbiBnZXRMb2dMZXZlbCgpIHtcclxuXHRcdHJldHVybiBsb2dMZXZlbF87XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAZnVuY3Rpb25cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBsb2dMZXZlbFxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIHNldExvZ0xldmVsKGxvZ0xldmVsKSB7XHJcblx0XHRsb2dMZXZlbF8gPSBsb2dMZXZlbDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEBmdW5jdGlvblxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtzdHJpbmd9IHRhZ0xheW91dFxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIHNldFRhZ0xheW91dCh0YWdMYXlvdXQpIHtcclxuXHRcdHRhZ0xheW91dF8gPSB0YWdMYXlvdXQ7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4ge1xyXG5cdFx0YXBwZW5kIDogYXBwZW5kLFxyXG5cdFx0Z2V0TmFtZSA6IGdldE5hbWUsXHJcblx0XHRpc0FjdGl2ZSA6IGlzQWN0aXZlLFxyXG5cdFx0Z2V0TG9nTGV2ZWwgOiBnZXRMb2dMZXZlbCxcclxuXHRcdHNldExvZ0xldmVsIDogc2V0TG9nTGV2ZWwsXHJcblx0XHRzZXRUYWdMYXlvdXQgOiBzZXRUYWdMYXlvdXRcclxuXHR9O1xyXG5cclxufVxyXG4iXX0=


/***/ }
/******/ ])
});
;