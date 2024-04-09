## Build a Live Table from Timeplus Query

In this [codesandbox](https://codesandbox.io/p/sandbox/winter-leftpad-nyrs8g), we show how to call Timeplus API in the frontend react application and show a live table using the query result stream. Also, this is a pure client side demo, no server side is involved, the client directly send query request to Timeplus Cloud.

### Wrapper of Timeplus Query

To make it easier to call the Timeplus API in JavaScript or TypeScript, we built a API wrapper leveraing `@fortaine/fetch-event-source` handling some lower level details that process the SSE protocols, so user can easiy run the query and handle the query result.

Here are the sample code to run a Timeplus Query using JavaScript/TypeScript

```javascript

const builder = new QueryBuilder();
builder
.withSQL('select * from stream_name')
.withOnRows((rows) => {
    // handle real-time query result here
    console.log('received rows', rows);
})
.withOnError((error) => {
    // handle query time error
    console.error('on error', error)
})
.withOnMetrics((metrics) => {
    // handle query metrics
    console.debug('received metrics', metrics)
})

const query = await builder.start();

// handle query error, for example, invalid query SQL
if (!(query instanceof Query)) {
    console.error("oops", query);
    return
}

// in case of query success, query.header contains the metadata of each columns of query result
console.table(query.header)

```

### Prepare query environment

Timeplus Query API is based on Server-Side Event, which will push the query result to the client in real-time. Refer to the [API doc](https://docs.timeplus.com/rest.html#tag/Queries-v1beta2/paths/~1v1beta2~1queries/post) here for more information.

To run a Timeplus Query, following information is required:
1. a query SQL string
2. Timeplus cloud address 
3. Timeplus workspace id
4. API Key

In this demo, these four inputs are created with UI input and bind to react state.

```javascript
const [env, setEnv] = useState({
host: "https://demo.timeplus.cloud",
tenant: "marketdata",
apiKey: "",
});

const [querySQL, setQuerySQL] = useState(
"SELECT * FROM mv_coinbase_tickers_extracted"
);
```

### Run Query

The runQuery function is triggerred when user click `run` button.

```javascript
const runQuery = async function() {
    if (currentQuery) {
        currentQuery.close();
    }

    SetEnv(env);
    let queryResultAll = [];
    const builder = new QueryBuilder();
    // handle query result here

    // start a query
    const query = await builder.start();
};

```


### Handle Query result

In case of query can be successfully submitted, a query object will be returned, which contains the metadata of the query result. the query object is saved to a react state which can be used to render table header explained later.

```
const query = await builder.start();
if (!(query instanceof Query)) {
    console.error("oops", query);
    return;
}
setCurrentQuery(query);
```

The API wrapper provide some functions to handle the realtime query result, query metrics or run time error, in this time, we only need process the query result using `withOnRows` function callback. Every time there is new streaming query result being emitted by Timeplus, `withOnRows` will be called with the `rows` containing an array of the query result.

```javascript
builder
.withSQL(querySQL)
.withOnRows((rows) => {
    // handle real-time query result 
    // keep all query resuslt history in a local variable
    queryResultAll = [...queryResultAll, ...rows]
    // set the display result to the latest 10 records
    // reverse the list to show latest result on top of table
    setQueryResult(queryResultAll.slice(-tableLimit).reverse());
});
```

In the above code, `queryResultAll` is a local variable to keep all historical query result, by calling `queryResultAll = [...queryResultAll, ...rows]`, we append the latest , real-time query result into `queryResultAll`. Note, as streaming result is unbounded, it is better to throw away some old data in production to avoid high memory consumption here.

For streaming live table display, in this sample, we only show the latest 10 result and keep the new data on the top of the table, that is why `queryResultAll.slice(-tableLimit).reverse()` is called here.


### Display Live Data in a Table

The last step is render the live table.

The table header can be renderred using the `currentQuery.header` which contains the name and type for each field of the query result table.

```javascript
<tr>
{currentQuery && currentQuery.header.map((e) => {
    return (<th>{e.name.toString()}</th>);
    })
}
</tr>
```

as we have saved the query result to be displayed into the state `queryResult`, we can build table content using this state object.

```javascript
{
    queryResult.map((row) => {
        return (<tr>
        {
            row.map((cell) => {
            return <td>{cell}</td>
            })
        }
        </tr>);
    })
}
```

The react will re-render the table every time the queryResult is being updated, so we now get a live table that keep showing the latest 10 results of the query result.







