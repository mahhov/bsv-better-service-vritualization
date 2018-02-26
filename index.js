(function () {
    let exports = {};

    let modes = {'IGNORE': 0, 'RECORD': 1, 'REPLAY': 2};

    let mode = modes.IGNORE;
    let recordings = {};
    let replayHistory = {};

    exports.setModeIgnore = () => {
        mode = modes.IGNORE;
    };

    exports.setModeRecord = () => {
        mode = modes.RECORD;
    };

    exports.setModeReplay = () => {
        mode = modes.REPLAY;
    };

    exports.export = exports.exportClipboard = () => {
        copy(recordings);
    };

    exports.exportObject = () => {
        return recordings;
    };

    exports.exportString = () => {
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

    exports.registerPromise = (name, object, method) => {
        if (mode === modes.RECORD)
            recordPromise(name, object, method);
        else if (mode === modes.REPLAY)
            replayPromise(name, object, method);
    };

    let recordPromise = (name, object, method) => {
        if (!recordings[name])
            recordings[name] = [];

        let oldMethod = object[method];

        object[method] = function () {
            let response = oldMethod.call(this, ...arguments);
            let recordArguments = _.map(arguments, argument => {
                return argument;
            });
            response.then(resolution => {
                recordings[name].push({'arguments': recordArguments, 'resolution': resolution, 'resolved': true});
            }).catch(rejection => {
                recordings[name].push({'arguments': recordArguments, 'rejection': rejection});
            });
            return response;
        };
    };

    let replayPromise = (name, object, method) => {
        if (!replayHistory[name])
            replayHistory[name] = 0;

        object[method] = () => {
            let index = replayHistory[name];
            replayHistory[name] < recordings[name].length - 1 && replayHistory[name]++;
            let recording = recordings[name][index];
            return recording.resolved ? Promise.resolve(recording.resolution) : Promise.reject(recording.rejection);
        };
    };

    exports.registerField = (name, object, field) => {
        if (mode === modes.RECORD)
            recordField(name, object, field);
        else if (mode === modes.REPLAY)
            replayField(name, object, field);
    };

    let recordField = (name, object, field) => {
        if (!recordings[name])
            recordings[name] = {};

        recordings[name][field] = object[field];
    };

    let replayField = (name, object, field) => {
        object[field] = recordings[name][field];
    };

    window.bsv = exports;
})();

// todo
// use module export
// why is "surveyRepository.hasPendingCaMileageSurvey false
// json in seperate file