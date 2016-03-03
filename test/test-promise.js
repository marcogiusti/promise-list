"use strict";

import test from "ava";


test(function testFilterResult(t) {
    var promise = Promise.resolve(2);
    return promise.then(v => v * 2).then(v => t.same(v, 4), f => t.fail());
});


test(function testCatch(t) {
    var promise = Promise.reject(new Error("fail"))
    return promise.catch(e => 42).then(v => t.same(v, 42), f => t.fail());
});


test(function passthruError(t) {
    // Passing through the error is considered a success.
    var err = new Error("fail");
    var promise = Promise.reject(err);
    return promise.catch(e => e).then(v => t.is(v, err), f => t.fail());
});


test(function testChainPromiseFail(t) {
    var err = new Error("fail");
    return Promise.resolve().then(r => Promise.reject(err))
        .then(r => t.fail(), f => t.is(f, err));
});
