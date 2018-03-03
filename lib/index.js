'use strict';

(function () {
    var bsv = {};

    var modes = { 'IGNORE': 0, 'RECORD': 1, 'REPLAY': 2 };

    var mode = modes.IGNORE;
    var replayDelay = void 0;
    var customReplayDelays = {};
    var recordings = {};
    var replayHistory = {};

    bsv.setModeIgnore = function () {
        mode = modes.IGNORE;
    };

    bsv.setModeRecord = function () {
        mode = modes.RECORD;
    };

    bsv.setModeReplay = function () {
        mode = modes.REPLAY;
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
        if (mode === modes.RECORD) recordPromise(name, object, method);else if (mode === modes.REPLAY) replayPromise(name, object, method);
    };

    var recordPromise = function recordPromise(name, object, method) {
        if (!recordings[name]) recordings[name] = [];

        var oldMethod = object[method];

        object[method] = function () {
            var response = oldMethod.call.apply(oldMethod, [this].concat(Array.prototype.slice.call(arguments)));
            var recordArguments = _.map(arguments, function (argument) {
                return argument;
            });
            response.then(function (resolution) {
                recordings[name].push({ 'arguments': recordArguments, 'resolution': resolution, 'resolved': true });
            }).catch(function (rejection) {
                recordings[name].push({ 'arguments': recordArguments, 'rejection': rejection });
            });
            return response;
        };
    };

    var replayPromise = function replayPromise(name, object, method) {
        if (!object) {
            warningNull(name);
            return;
        }

        if (!replayHistory[name]) replayHistory[name] = 0;

        object[method] = function () {
            if (!recordings || !recordings[name]) {
                warning404(name);
                return Promise.reject();
            }

            var index = replayHistory[name];
            replayHistory[name] < recordings[name].length - 1 && replayHistory[name]++;
            var recording = recordings[name][index];
            if (!recording) {
                warning404(name, index);
                return Promise.reject();
            }

            var delay = customReplayDelays[name] || replayDelay;
            console.log('invoking', name, 'with', delay, 'delay');

            if (!delay) return recording.resolved ? Promise.resolve(recording.resolution) : Promise.reject(recording.rejection);else return recording.resolved ? new Promise(function (resolve) {
                setTimeout(resolve, delay, recording.resolution);
            }) : new Promise(function (resolve, reject) {
                setTimeout(reject, delay, recording.rejection);
            });
        };
    };

    bsv.registerField = function (name, object, field) {
        if (mode === modes.RECORD) recordField(name, object, field);else if (mode === modes.REPLAY) replayField(name, object, field);
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

    window.bsv = exports = bsv;
})();

// todo
// replay based on arguments
// replace window.bsv = exports with babel