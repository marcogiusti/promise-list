PromiseList is an extension to Promise.all() and Promise.race() and,
more generally, a series of utilities around Promises.

Documentation
=============

`Promise.all()` returns a `Promise` that succeeds only if *all* the
`Promise`s succeed and `Promise.race()` returns a `Promise` that
succeeds when *any* `Promise` succeeds. This extension add a new
function that returns a `Promise` that succeeds when *all* the
`Promise`s finished, no matter if they succeed or not.

Example 1: return all the results
---------------------------------

Without any optional arguments, `PromiseList` always succeeds. The result
is a list of `[succeed, result]` pairs, where `succeed` is a boolean
indicating if the related `Promise` succeeded or not, and `result` is
the related result.

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

Another example using [Array.map][map] and [Array.filter][filter]:

```javascript
var urls = [/*...*/];
var pl = PromiseList(urls.map(retrievePage))
    .then(results => results.filter([succeed, v] => succeed))
    .then(results => results.forEach(parsePage))
```

[map]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
[filter]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter

Example 2: mimic Promise.all()
------------------------------

`PromiseList` resolves if all the `Promise`s resolve or rejects if one
of them rejects.

From [Mozilla's MDN][promise.all]:

> Returns a promise that either resolves when all of the promises in the
> iterable argument have resolved or rejects as soon as one of the
> promises in the iterable argument rejects. If the returned promise
> resolves, it is resolved with an array of the values from the resolved
> promises in the iterable. If the returned promise rejects, it is
> rejected with the reason from the promise in the iterable that
> rejected. This method can be useful for aggregating results of
> multiple promises together.

The error, in case of failure, is always an instance of `FirstError`.

```javascript
var p1 = Promise.resolv("1");
var p2 = Promise.reject(new Error("fail"));
var p3 = Promise.resolv("3");
var pl = PromiseList([p1, p2, p3], false, true).then(cb, eb);
// eb(err) [=> err.failure === new Error("fail")]
```

[promise.all]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all

Example 3: mimic Promise.race()
-------------------------------

From [Mozilla's MDN][promise.race]:

> Returns a promise that resolves or rejects as soon as one of the
> promises in the iterable resolves or rejects, with the value or reason
> from that promise.

```javascript
var p1 = new Promise((res, rej) => {});  // don't resolv or reject
var p2 = Promise.resolv("2");
var p3 = Promise.reject(new Error("fail"));
var pl = PromiseList([p1, p2, p3], true, true).then(cb, eb);
// cb(["2", 1])
```

[promise.race]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race

Example 4: resolve with the first successful Promise
----------------------------------------------------

```javascript
var p1 = Promise((res, rej) => {});  // don't resolv or reject
var p2 = Promise.reject(new Error("fail"));
var p3 = Promise.resolv("3");
var pl = PromiseList([p1, p2, p3], true, false).then(cb);
// cb(["3", 2])
```

trap()
------

`trap()` is an utility to filter errors in a promise's catch clause.
Consider this code:

```javascript
try {
    doStuff();
}
catch(e) {
    if (e instanceof IOError) {
        handleIOError(e);
    } else if (e instanceof TypeError) {
        handleTypeError(e);
    } else {
        throw e;
    }
}
```

Translated to asynchronous code with `Promise`s and `trap()` became:

```javascript
function onIOError(failure) {
    trap(failure, IOError);
    handleIOError(failure);
}
function onTypeError(failure) {
    trap(failure, TypeError);
    handleTypeError(failure);
}
var promise = doStuff().catch(onIOError).catch(onTypeError);
```

execute()
---------

Execute a function and return a `Promise`:

```javascript
function func1() {
    return "sync";
}
execute(func1).then(v => v === "sync");
```

This function is useful if it is not known if a certain function returns
a `Promise` or not.

```javascript
function func1() {
    return "sync";
}
function func2() {
    return Promise.resolve("async");
}
var promises = [func1, func2].map(f => f());
PromiseList(promises).then(r => console.log(r));
```

vim: tw=72
