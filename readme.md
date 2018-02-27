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

`bsv.setModeIgnore()` will ignore all subsequent registers.

`bsv.setModeRecord()` will record all subsequent registers.

`bsv.setModeReplay()` will replay all subsequent registers.

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

## Recording Fields

Current field values at the time `registerField` is invoked are recorded.

## Replaying Fields

Field values are assigned at the time `registerField` is invoked.

## Recording Methods

Every time the method is invoked, the resolved or rejected promise is recorded.

## Replaying Methods

Each time the method is invoked, a recorded promise resolution or rejection is replayed. If `n` records exist, record `1` will be returned  for first invocation, then record `2`, ... record `n`. For invocations after the `n'`th invocation, record `n` will be returned.