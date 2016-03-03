"use strict";


export function* enumerate(iterable) {
    var i = 0;

    for (let obj of iterable) {
        yield [i++, obj];
    }
}


function FirstError(failure, index) {
    this.message = "PromiseList first error";
    this.failure = failure;
    this.index = index;
}
FirstError.prototype = new Error;
FirstError.prototype.name = "FirstError";


export function PromiseList(promisesList, fireOnOneCallback=false,
                            fireOnOneErrback=false) {

    return new Promise(function (resolve, reject) {

        var promises = Array.from(promisesList);
        var results = new Array(promises.length);
        var finishedCount = 0;

        function cb(result, index, succeeded) {
            results[index] = [succeeded, result];
            finishedCount++;
            if (succeeded && fireOnOneCallback) {
                resolve([result, index]);
            } else if (!succeeded && fireOnOneErrback) {
                reject(new FirstError(result, index));
            } else if (results.length == finishedCount) {
                resolve(results);
            }
        }

        if (results.length === 0) {
            resolve(results);
        }

        for (let [i, promise] of enumerate(promises)) {
            promise.then(result => cb(result, i, true),
                         result => cb(result, i, false));
        }
    });
}


export function check(error, ...errorTypes) {
    for (let type of errorTypes) {
        if (error instanceof type) {
            return true;
        }
    }
    return false;
}


export function trap(error, ...errorTypes) {
    if (!check(error, ...errorTypes)) {
        throw error;
    }
}


export function execute(func, ...args) {
    try {
        var result = func(...args);
        if (result instanceof Promise) {
            return result;
        }
        return Promise.resolve(result);
    }
    catch(e) {
        return Promise.reject(e);
    }
}
