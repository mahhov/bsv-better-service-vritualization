'use strict';

var bsv = {};

var modes = { 'IGNORE': 0, 'RECORD': 1, 'REPLAY': 2 };
var modeResolve = void 0;
var modePromise = new Promise(function (resolve) {
    modeResolve = resolve;
});
var replayDelay = void 0;
var customReplayDelays = {};
var recordings = {};
var replayHistory = {};

bsv.setModeIgnore = function () {
    modeResolve(modes.IGNORE);
};

bsv.setModeRecord = function () {
    modeResolve(modes.RECORD);
};

bsv.setModeReplay = function () {
    modeResolve(modes.REPLAY);
};

bsv.setReplayDelay = function (delay) {
    replayDelay = delay;
};

bsv.setCustomReplayDelay = function (name, delay) {
    customReplayDelays[name] = delay;
};

bsv.export = bsv.exportClipboard = function () {
    copy(recordings);
};

bsv.exportObject = function () {
    return recordings;
};

bsv.exportString = function () {
    return JSON.stringify(recordings);
};

bsv.exportFile = function (fileName) {
    var dataString = 'data:text/json,' + JSON.stringify(recordings);
    var elem = document.createElement('a');
    elem.setAttribute('href', dataString);
    elem.setAttribute('download', fileName);
    elem.click();
    elem.remove();
};

bsv.import = function (recordingsJson) {
    recordings = recordingsJson;
};

bsv.registerPromise = function (name, object, method) {
    var oldMethod = object[method];

    object[method] = function () {
        var _this = this,
            _arguments = arguments;

        return modePromise.then(function (mode) {
            if (mode === modes.RECORD) {
                if (!recordings[name]) recordings[name] = [];

                var response = oldMethod.call.apply(oldMethod, [_this].concat(Array.prototype.slice.call(_arguments)));
                var recordArguments = _.map(_arguments, function (argument) {
                    return argument;
                });
                response.then(function (resolution) {
                    recordings[name].push({ 'arguments': recordArguments, 'resolution': resolution, 'resolved': true });
                }).catch(function (rejection) {
                    recordings[name].push({ 'arguments': recordArguments, 'rejection': rejection });
                });
                return response;
            } else if (mode === modes.REPLAY) {
                if (!recordings || !recordings[name] || !recordings[name].length) {
                    warning404(name);
                    return new Promise();
                }

                if (!replayHistory[name]) replayHistory[name] = 0;

                var index = replayHistory[name];
                replayHistory[name] < recordings[name].length - 1 && replayHistory[name]++;
                var recording = recordings[name][index];
                var delay = customReplayDelays[name] || replayDelay;
                console.log('invoking', name, 'with', delay, 'delay');

                if (!delay) return recording.resolved ? recording.resolution : Promise.reject(recording.rejection);else return new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        recording.resolved ? resolve(recording.resolution) : reject(recording.rejection);
                    }, delay);
                });
            } else return oldMethod.call.apply(oldMethod, [_this].concat(Array.prototype.slice.call(_arguments)));
        });
    };
};

var recordPromise = function recordPromise(name, object, field, oldMethod) {};

var replayPromise = function replayPromise(name, object, method, oldMethod) {};

// todo extract record and replay promise to external functions

bsv.registerField = function (name, object, field) {
    modePromise.then(function (mode) {
        if (mode === modes.RECORD) recordField(name, object, field);else if (mode === modes.REPLAY) replayField(name, object, field);
    });
};

var recordField = function recordField(name, object, field) {
    if (!recordings[name]) recordings[name] = {};

    recordings[name][field] = object[field];
};

var replayField = function replayField(name, object, field) {
    if (!object) warningNull(name);else if (!recordings || !recordings[name]) warning404(name);else object[field] = recordings[name][field];
};

var warningNull = function warningNull(name) {
    warning('null object', name);
};

var warning404 = function warning404(name, details) {
    warning('no recordings found for', name, details);
};

var warning = function warning(message, name, details) {
    console.error(message, name, details ? details : '');
};

window.bsv = bsv;

// todo
// replay based on arguments
// replace window.bsv = exports with babel