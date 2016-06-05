O2PS4O.Panel = function(conf){
	this.node = null;
	this._events = null;
	this.init(conf);
};
O2PS4O.Panel.prototype.conf = {
	group    : 'info',
	template : '<div class="panel"></div>',
	events   : []
};
O2PS4O.Panel.prototype.init = function(conf){
	if (conf) {
		this.initNode(conf);

		if (conf.events) {
			this.initEvents(conf.events);
		}
	}
};
O2PS4O.Panel.prototype.initNode = function(conf){
	var temp = document.createElement('div');
	temp.innerHTML = conf.template;

	this.node = temp.querySelector('*');
};
O2PS4O.Panel.prototype.initEvents = function(events){
	if (events) {
		for (var i = 0, n = events.length; i < n; i++) {
			var event = events[i];
			var func = event.func;
			if (typeof func === 'string') {
				func = this[func].bind(this);
			}
			this.on(event.type, func);
		}
	}
};
O2PS4O.Panel.prototype.on = function(type, func){
	if (!this._events) {
		this._events = {};
	}
	if (!this._events[type]) {
		this._events[type] = [];
	}
	this._events[type].push(func);
};
O2PS4O.Panel.prototype.off = function(type, func){
	var _ret = [];
	if (!this._events || !this._events[type]) {
		return _ret;
	}
	var _funcs = this._events[type];
	for (var i = 0, n = _funcs.length; i < n; i++) {
		if (_funcs[i] === func) {
			_ret = _ret.concat(_funcs.splice(i, 1));
			i--;
		}
	}
	return _ret;
};
O2PS4O.Panel.prototype.createEvent = function(type, data){
	return new O2PS4O.Event({
		type : type,
		target : this,
		detail : data
	});
};
O2PS4O.Panel.prototype.trigger = function(type, data){
	if (!this._events || !this._events[type]) {
		return _ret;
	}

	var _e = this.createEvent(type, data);
	_e.currentTarget = this;

	var _funcs = this._events[type];
	for (var i = 0, n = _funcs.length; i < n; i++) {
		_funcs[i](_e, data);
		if (_e.propagateStoppedImmediate) {
			break;
		}
	}
};
