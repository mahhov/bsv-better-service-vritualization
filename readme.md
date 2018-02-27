# BSV Better Service Virtualization

## About

Record and replay fields and methods.

## Usage Example

```

// set to either record or replay mode
if (mockData) {
    bsv.setModeReplay(replayDelay);
    bsv.import(mockData);
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

`bsv.setModeIgnore()` will ignore all subsequent registers.

`bsv.setModeRecord()` will record all subsequent registers.

`bsv.setModeReplay(delay)` will replay all subsequent registers. Replays methods will be resolved or rejected after `delay` milliseconds.

## Exporting

`bsv.export()` (and alias `bsv.exportClipboard()`) copy to clipboard the recordings thus far.

`bsv.exportObject()` will return a javascript object of the recordings thus far.

`bsv.exportString()` will return a string representing the javascript object of the recordings thus far.

`bsv.exportFile()` will download a file containing a json representation of the recordings thus far.

## Importing

`bsv.import(recordingsJson)` takes in a javascript object such as one that was exported, and uses this object for replays.


## Recording Fields

Current field values at the time `bsv.registerField` is invoked are recorded.

## Replaying Fields

Field values are assigned at the time `bsv.registerField` is invoked.

## Recording Methods

Every time the method is invoked, the resolved or rejected promise is recorded.

## Replaying Methods

Each time the method is invoked, a recorded promise resolution or rejection is replayed. If `n` records exist, record `1` will be returned  for first invocation, then record `2`, ... record `n`. For invocations after the `n'`th invocation, record `n` will be returned.