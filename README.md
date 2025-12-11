## Overview

Welcome to Timeplus! This package contains some sample TypeScript code to demostorate how to access the REST API of Timeplus programmatically. Please check `src/app.ts` for the sample code.

For detailed documentation about the REST API, please visit https://docs.timeplus.com/rest.html.

This starter-kit is tested on nodejs **v19.7.0**.

## Install

```
npm install
```

## Config

to run the demo code, you can use env variable to point to a Timeplus Enterprise

```
export TIMEPLUS_USERNAME=proton
export TIMEPLUS_PASSWORD=proton@t+
export TIMEPLUS_ADDRESS=http://localhost:8000
```

you can create the api key in your timeplus console UI from personal settings.

## Run

```
npm start
```

## What is the demo code

in the demo code, it shows how to create a stream, and then ingest some data and the run a query to get those data in the stream.

### create stream

refer to https://docs.timeplus.com/rest.html#tag/Streams-v1beta2/paths/~1v1beta2~1streams/post

please note, in the sample, a key-version streaming is created, in case you want to create an append-only stream, remove those two fields `mode` and `primary_key` from the `createStreamBody`

### ingest

refer to https://docs.timeplus.com/rest.html#tag/Streams-v1beta2/paths/~1v1beta2~1streams~1%7Bname%7D~1ingest/post

### query

refer to https://docs.timeplus.com/rest.html#tag/Queries-v1beta2/paths/~1v1beta2~1queries/post

#### query metadata

some important query metadata are

- `query.id` the unique id of the query
- `query.status` the status of the query, `running`,`finished`,`failed`,`canceled`
- `query.startTime`,`query.endTime`
- `query.header` the column definition of the result table

```
┌─────────┬────────────┬────────────────────────┐
│ (index) │ name       │ type                   │
├─────────┼────────────┼────────────────────────┤
│ 0       │ 'category' │ 'string'               │
│ 1       │ 'value'    │ 'int64'                │
│ 2       │ 'uuid'     │ 'string'               │
│ 3       │ '\_tp_time'│ "datetime64(3, 'UTC')" │
└─────────┴────────────┴────────────────────────┘
```

#### query result

the query result have two different types of payloads, `data row` or `metrics`

for data row, it is an array of array:

```
[
  [
    'cat_1',
    11,
    'ebd9f9ab-4df4-4269-81af-262303c4b375',
    '2023-03-11T00:44:47.034Z'
  ],
  [
    'cat_2',
    20,
    '2dd8823d-2d7b-4fc4-940c-70d6f29619c0',
    '2023-03-11T00:44:47.034Z'
  ],
  [
    'cat_3',
    30,
    'b204922d-139b-4189-8f5d-95d82714114e',
    '2023-03-11T00:44:47.034Z'
  ]
]
```

for metrics , it is a json object:

```
{
  count: 3,
  eps: 3,
  processing_time: 1,
  last_event_time: 1678495492,
  response_time: 0,
  scanned_rows: 4,
  scanned_bytes: 300
}
```
