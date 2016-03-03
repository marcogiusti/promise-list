Extension to Promise.all() and Promise.race()
=============================================

`Promise.all()` returns a `Promise` that succeeds only if *all* the
`Promise`s succeed and `Promise.race()` returns a `Promise` that
succeeds when *any* `Promise` succeeds. This extension add a new
function that returns a `Promise` that succeeds when *all* the
`Promise`s finished, no matter if they succeed or not.

Example 1: return all the results
---------------------------------

```javascript
    var p1 = Promise.resolv("1");
    var p2 = Promise.reject("2");
    var p3 = Promise.resolv("3");
    var pl = PromiseList([p1, p2, p3]).then(cb);

    function cb(results) {
        for (let [succeed, result] of results) {
            if (succeed) {
                doStuff(result);
            } else {
                // probably an instance of Error
                reportError(result);
            }
        }
    }
```

Another example.

```javascript

    var urls = [/*...*/];
    var pl = PromiseList(urls.map(retrievePage))
        .then(results => results.filter([succeed, v] => succeed))
        .then(results => results.forEach(parsePage))
```

Example 2: mimic Promise.all()
------------------------------

```javascript
    var p1 = Promise.resolv("1");
    var p2 = Promise.reject("2");
    var p3 = Promise.resolv("3");
    var pl = PromiseList([p1, p2, p3], false, true).then(cb);
```

Example 3: mimic Promise.race()
-------------------------------

```javascript
    var p1 = Promise.resolv("1");
    var p2 = Promise.reject("2");
    var p3 = Promise.resolv("3");
    var pl = PromiseList([p1, p2, p3], true, false).then(cb);
```

vim: tw=72
