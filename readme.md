# BSV Better Service Virtualization

## About

Record and replay fields and methods.

## Usage Example

```

// set to either record or replay mode
if (mockData) {
    bsv.setModeReplay();
    bsv.import(mockData);
    bsv.setReplayDelay(500);
    bsv.setCustomReplayDelay('repository1.carData', 2500)
} else {
    bsv.setModeRecord();
}

// regsiter fields of interest
bsv.registerField('window', window, 'field1');
bsv.registerField('window', window, 'field2');
bsv.registerField('car', car, 'model');
bsv.registerField('car', car, 'year');

// register methods of interest
bsv.registerPromise('repository1.carData', repository1, 'getCarData');
bsv.registerPromise('repository1.motorcycleData', repository1, 'getMotorcycleData');
bsv.registerPromise('repository2.elevatorData', repository2, 'getElevatorData');

```

## Modes

`bsv.setModeIgnore()`

Registered fields will be neither modified nor recorded. Registered methods will go through unmodified and unrecorded.

`bsv.setModeRecord()`

Registered fields have their values recorded. Registered methods will have their resolution or rejection recorded.

`bsv.setModeReplay()`

Registered fields will have their values assigned per imported values. Registered methods will resolve or reject per imported records.

Notes:

1. Once a `setMode...` method is invoked, it should not be reset.

2. Until a mode is set, no action will be taken with `registerField` invocations. See note for _Fields_ section.

3. Until a mode is set, promises returned by registered methods will be unresolved and unrejected. See note for _Methods_ section.

## Delay

`setReplayDelay(delay)` sets default delay for replaying methods.

`setCustomReplayDelay(name, delay)` sets delay for replaying individual method.

## Exporting

`export()` (and alias `exportClipboard()`) copy to clipboard the recordings thus far.

`exportObject()` will return a javascript object of the recordings thus far.

`exportString()` will return a string representing the javascript object of the recordings thus far.

`exportFile()` will download a file containing a json representation of the recordings thus far.

## Importing

`import(recordingsJson)` takes in a javascript object such as one that was exported, and uses this object for replays.

## Fields

`registerField(name, object, field)`

Value of `object.field` is recorded or assigned by key `name`.

Note, for recording, value of the field at the time of invoking `registerField` will be recorded, unless mode is not yet set, in which case, value at the time mode is set will be recorded.

Note, for replaying, value will be assigned at the time of invoking `registerField`, unless mode is not yet set, in which case, value will be assigned when mode is set.

## Methods

`registerPromise(name, object, methodName)`

For record mode, every time the method is invoked, the resolved or rejected promise is recorded.

For replay mode, each time the method is invoked, a recorded promise resolution or rejection is replayed. If `n` records exist, record `1` will be returned  for first invocation, then record `2`, ... record `n`. For invocations after the `n'`th invocation, record `n` will be returned.

Note, if mode is not set, invocations of method will be unresolved and unrejected until a mode is set.

## Chrome Extension (ebsv-extension-better-service-virtualization)

You want to record and replay your web app requests but don't want to modify your production code base nor want to maintain a separate build process for production and lower environments? No worries, we have a chrome extension that allows you to inject your bsv config after your app is loaded but before it's executed (e.g., for angularjs, after angular context is created but before your main controller has ran).

Short url: goo.gl/ye4SVc

Full url: https://chrome.google.com/webstore/detail/ebsv-extension-better-ser/feodfapnkbdlhlcjeoijpcblmdlcmobm

### Config

The chrome extension tries to do most of the setup for you. For example, you will not have to worry about `setModeRecord`, `setModeReplay`, `import`, and such. The extension will provide a simple gui for you to manage when to record, which recording to replay, download & upload recordings (in order to edit or share them), etc. However, 
a `.js` file is still required in order to register which methods and fields you want to record and replay. For example, for an angularjs app, that would look something like:

```
angular.module('MyModule').run(function (carRepository) {
    bsv.registerPromise('makes', myRepository, 'getMakes');
    bsv.registerPromise('models', myRepository, 'getModels');
    bsv.registerPromise('years', myRepository, 'getYears');
});
```