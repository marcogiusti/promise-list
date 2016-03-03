import test from "ava";
import "babel-register";
import "babel-polyfill";
import { enumerate, PromiseList, execute, check, trap } from "../index";


test(function testEnumerate(t) {
    t.same(Array.from(enumerate([1, 2, 3])), [[0, 1], [1, 2], [2, 3]]);
});


test(function testEnumerateString(t) {
    t.same(Array.from(enumerate("abc")), [[0, "a"], [1, "b"], [2, "c"]]);
});


test(function testPromisesList(t) {
    function cb(results) {
        t.same([
            results[0],
            results[1],
            results[2]
        ],
        [
            [true, "1"],
            [false, e],
            [true, "3"]
        ]);
    }

    var e = new Error("2");
    var p1, p2, p3, pl;

    p1 = Promise.resolve("1"),
    p2 = Promise.reject(e),
    p3 = Promise.resolve("3"),
    pl = PromiseList([p1, p2, p3]);
    return pl.then(cb, cb);
});


test(function testEmptyPromisesList(t) {
    var pl,
        cb = results => t.same(results, []);

    pl = PromiseList([]);
    return pl.then(cb, cb)
});


test(function testPromisesListFireOnOneError(t) {
    function eb(error) {
        t.same(error.failure, e);
        t.same(error.index, 1);
    }

    var p1, p2, p3, pl;
    var e = new Error("2");

    p1 = Promise.resolve("1");
    p2 = Promise.reject(e);
    p3 = new Promise((resolve, reject) => {});
    pl = PromiseList([p1, p2, p3], false, true, false);
    return pl.then(r => t.fail(), eb);
});


test(function testPromisesListFireOnOneCallback(t) {
    function cb(value) {
        t.same(value[0], "1");
        t.same(value[1], 1);
    }

    var p1, p2, p3, pl;
    var e = new Error("2");

    p1 = Promise.reject(e);
    p2 = Promise.resolve("1");
    p3 = new Promise((resolve, reject) => {});
    pl = PromiseList([p1, p2, p3], true, false, false);
    return pl.then(cb, r => t.fail());
});


test(function testExecuteSucceed(t) {
    var p = execute(() => "1");
    return p.then(v => t.same(v, "1"));
});


test(function testExecuteFail(t) {
    var e = new Error("fail");
    var p = execute(() => { throw e; });
    return p.then(v => t.fail(), f => t.same(f, e));
});


function GenericError(message) {
    this.message = message;
    this.stack = (new Error()).stack;
}
GenericError.prototype = new Error;
GenericError.prototype.name = "GenericError";


function AnotherError(message) {
    this.message = message;
    this.stack = (new Error()).stack;
}
AnotherError.prototype = new Error;
AnotherError.prototype.name = "AnotherError";


test(function testCheck(t) {
    var err = new GenericError("fail");
    t.true(check(err, AnotherError, Error));
    t.true(check(err, GenericError));
});


test(function testCheckFalse(t) {
    var err = new GenericError("fail");
    t.false(check(err, AnotherError));
});


test(function testTrap(t) {
    function f1() {
        var err = new GenericError("fail");
        trap(err, AnotherError, Error);
    }
    function f2() {
        var err = new GenericError("fail");
        trap(err, GenericError);
    }
    t.notThrows(f1);
    t.notThrows(f2);
});


test(function testDontTrap(t) {
    function f() {
        var err = new GenericError("fail");
        trap(err, AnotherError);
    }
    t.throws(f);
});


test(function testTrapChain(t) {
    function eb1(failure) {
        trap(failure, GenericError);
        t.fail("AnotherError trapped");
    }

    function eb2(failure) {
        trap(failure, AnotherError);
    }

    return Promise.reject(new AnotherError("fail"))
        .then(v => t.fail("Promise did not failed"), eb1)
        .then(v => t.fail("eb did not re-raise the exception"), eb2);
});
