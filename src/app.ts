import { Env, Query, QueryBuilder, SetEnv } from './api';

const hostEnv = process.env.TIMEPLUS_ADDRESS;
const usernameEnv = process.env.TIMEPLUS_USERNAME;
const passwordEnv = process.env.TIMEPLUS_PASSWORD;

console.log(`connecting env ${hostEnv}`);

SetEnv({ host: hostEnv, username: usernameEnv, password: passwordEnv });

// A sample function to demostrate how to run a query and get its result.
// This endpoint leverages server-sent events so it requires some special handling.
async function runQuery() {
  console.log('running query to fetch result...');

  const builder = new QueryBuilder();
  builder
    .withSQL('select * from table(test_stream)')
    .withOnRows((rows) => {
      console.log('received rows', rows);
    })
    .withOnError((error) => {
      console.error('on error', error);
    })
    .withOnMetrics((metrics) => {
      console.debug('received metrics', metrics);
    });

  const query = await builder.start();

  if (!(query instanceof Query)) {
    console.error('oops', query);
    return;
  }

  console.log(
    `query ${query.id} is ${query.status} since ${new Date(
      query.startTime * 1000
    )}`
  );

  console.table(query.header);

  await new Promise((resolve) => setTimeout(resolve, 5000));

  query.close();
}

// A sample function to demotrate how to create a stream
async function createStream() {
  console.log('creating stream...');
  const url = Env().BuildUrl('v1beta2', 'streams');

  const createStreamBody = {
    name: 'test_stream',
    description: 'my first test stream',
    logstore_retention_bytes: 1024 * 1024 * 1024 * 10, // 10 GiB
    logstore_retention_ms: 1000 * 60 * 60 * 24 * 7, // 7 days
    mode: 'versioned_kv',
    primary_key: 'category',
    columns: [
      {
        name: 'category',
        type: 'string',
      },
      {
        name: 'value',
        type: 'int64',
      },
      {
        name: 'uuid',
        type: 'string',
      },
    ],
  };

  // fetch api in nodejs is experimental
  // @ts-ignore
  await fetch(url, {
    method: 'POST',
    headers: Env().AuthHeader(),
    body: JSON.stringify(createStreamBody),
  })
    // @ts-ignore
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    // @ts-ignore
    .then((body) => {
      console.log('stream created', body);
    });
}

// A sample function to demotrate how to ingest some sample events to the stream
async function ingestEvents() {
  console.log('ingesting sample events...');
  const url = [
    Env().BuildUrl('v1beta2', 'streams'),
    'test_stream',
    'ingest',
  ].join('/');

  const ingestBody = {
    columns: ['category', 'value', 'uuid'],
    data: [
      ['cat_1', 10, 'd0dab3a0-c1c3-4997-bf79-5c363835de43'],
      ['cat_2', 20, '2dd8823d-2d7b-4fc4-940c-70d6f29619c0'],
      ['cat_3', 30, 'b204922d-139b-4189-8f5d-95d82714114e'],
      ['cat_1', 11, 'ebd9f9ab-4df4-4269-81af-262303c4b375'],
    ],
  };

  // @ts-ignore
  await fetch(url, {
    method: 'POST',
    headers: Object.assign(
      {},
      {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      Env().AuthHeader()
    ),
    body: JSON.stringify(ingestBody),
  })
    // @ts-ignore
    .then(async (response) => {
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`HTTP error! Status: ${response.status} ${body}`);
      }
    });

  await new Promise((resolve) => setTimeout(resolve, 5000));
}

async function main() {
  await createStream();

  await ingestEvents();

  await runQuery();
}

main();
