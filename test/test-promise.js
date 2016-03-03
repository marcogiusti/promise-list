"use strict";

import test from "ava";


test(function testFilterResult(t) {
    function double(value) {
        return value * 2
    }

    function cb(value) {
        t.same(value, 4);
    }
    var promise = Promise.resolve(2);
    promise.then(double).then(cb);
    return promise;
});


test(function testCatch(t) {
    var promise = Promise.reject(new Error("fail"))
    return promise.catch(e => 42).then(v => t.same(v, 42));
});


test(function passthruError(t) {
    return;
    var err = new Error("fail");
    var promise = Promise.reject(err);
    return promise.catch(e => e).then(v => t.is(v, err));
});
