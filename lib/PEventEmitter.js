var EventEmitter = require('events').EventEmitter
    , util = require('util')
    , utils = require('./utils')
    , debug = require('debug')('PEventEmitter')

const DEFAULT_PRIORITY = 5;


var PEventEmitter = module.exports.PEventEmitter = function () {
    PEventEmitter.super_.call(this);

    this.coreEvents = {
        done: 'done',
        error: 'error'
    };

    this.events = {};
    this.eventList = [];

    this.eventListeners = {};

    this.waitEvents = {};
    this.waitTimeout = 5000;
    this.waitTimer = null;

    this.isFinalized = false;
}

util.inherits(PEventEmitter, EventEmitter);


PEventEmitter.prototype.checkListenerState = function () {
    if (this.isFinalized) {
        throw new Error('Listeners finalized');
    }
}

PEventEmitter.prototype.checkWaitTimer = function () {
    if (this.waitTimer === null && this.waitTimeout > 0) {
        debug('Setting waitTimer');
        var self = this;
        this.waitTimer = setTimeout(function () {
            throw new Error('Timeout waiting for event: ' + self.coreEvents.done);
        }, this.waitTimeout);
    }
}


PEventEmitter.prototype.hook = function (event, opts, fn) {
    this.checkListenerState();

    // function(event, fn)
    if (!fn && typeof opts === 'function') {
        fn = opts;
        opts = {};
    }

    if (typeof fn !== 'function') {
        throw new Error('Expected callback to be a function');
    }

    if (!~this.eventList.indexOf(event)) {
        throw new Error('Unrecognized event: ' + event);
    }

    var name = opts.name || '';
    var priority = (typeof opts.priority === 'number') ? opts.priority : DEFAULT_PRIORITY;
    var wait = (typeof opts.wait === 'boolean') ? opts.wait : false;

    if (!this.eventListeners[event]) {
        this.eventListeners[event] = [];
    }

    this.eventListeners[event].push({
        event: event,
        priority: priority,
        name: name,
        wait: wait,
        callback: fn
    });

    if (!wait) {
        return null;
    }

    var waitKey = (name + '-' + event + '-' + this.eventListeners[event].length);
    this.waitEvents[waitKey] = name;
    this.checkWaitTimer();
    return waitKey;
}


PEventEmitter.prototype.markDone = function (err, waitKey) {
    if (!waitKey) {
        return;
    }
    if (err) {
        this.emit(this.coreEvents.error, err, this.waitEvents[waitKey]);
    }
    delete this.waitEvents[waitKey];
    this.checkWaitComplete();
}


PEventEmitter.prototype.emitEvent = function () {
    var args = Array.prototype.slice.call(arguments) || [];
    args.push(this.markDone.bind(this));
    this.emit.apply(this, args);
}


PEventEmitter.prototype.checkWaitComplete = function () {
    if (Object.keys(this.waitEvents).length > 0) {
        return;
    }

    if (this.waitTimer !== null) {
        debug('Clearing waitTimer');
        clearTimeout(this.waitTimer);
    }

    this.emit(this.coreEvents.done);
}


PEventEmitter.prototype.finalizeListeners = function () {
    this.checkListenerState();

    if (typeof this.eventListeners !== 'object') {
        throw new Error('Invalid listeners');
    }

    var listeners = this.eventListeners;
    var self = this;

    this.eventList.forEach(function (ev) {
        var eventListeners = listeners[ev];
        if (eventListeners && eventListeners.length) {
            eventListeners.sort(function (o1, o2) {
                return o1.priority - o2.priority;
            });
            eventListeners.forEach(function (el) {
                self.on(el.event, el.callback);
            });
        }
    });

    this.isFinalized = true;
}


PEventEmitter.prototype.debug = function () {
    var eventListeners = this.eventListeners;
    this.eventList.forEach(function (k) {
        if (eventListeners[k]) {
            debug('%s: %s', k, eventListeners[k].map(function (v) {
                return v.name + ' (' + v.priority + ')';
            }));
        }
    });
}
