(function () {
    let exports = {};

    let modes = {'IGNORE': 0, 'RECORD': 1, 'REPLAY': 2};

    let mode = modes.IGNORE;
    let recordings = {};
    let replayHistory;

    exports.setModeIgnore = () => {
        mode = modes.IGNORE;
    };

    exports.setModeRecord = () => {
        mode = modes.RECORD;
    };

    exports.setModeReplay = () => {
        mode = modes.REPLAY;
    };

    exports.export = fileName => {
        return recordings;
    };

    exports.exportString = fileName => {
        return JSON.stringify(recordings);
    };

    exports.exportFile = fileName => {
        let dataString = 'data:text/json,' + JSON.stringify(recordings);
        let elem = document.createElement('a');
        elem.setAttribute('href', dataString);
        elem.setAttribute('download', fileName);
        elem.click();
        elem.remove();
    };

    exports.import = recordingsJson => {
        recordings = recordingsJson;
    };

    exports.register = (name, object, method) => {
        if (mode === modes.RECORD)
            exports.record(name, object, method);
        else if (mode === modes.REPLAY)
            exports.replay(name, object, method);
    };

    exports.record = (name, object, method) => {
        if (!recordings[name])
            recordings[name] = [];

        let oldMethod = object[method];

        object[method] = function () {
            let response = oldMethod(...arguments);
            let recordArguments = _.map(arguments, argument => {
                return argument;
            });
            response.then(resolution => {
                recordings[name].push({'arguments': recordArguments, 'resolution': resolution});
            }).catch(rejection => {
                recordings[name].push({'arguments': recordArguments, 'rejection': rejection});
            });
            return response;
        };
    };

    exports.replay = (name, object, method) => {
        object[method] = () => {
            let index = replayHistory[name]++;
            let recording = recordings[name][index];
            return recording.resolution ? Promise.resolve(recording.resolution) : Promise.reject(recording.rejection);
        };
    };

    window.bsv = exports;
})();
