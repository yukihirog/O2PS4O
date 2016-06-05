O2PS4O.Event = function (conf) {
	this.type                      = '';
	this.target                    = null;
	this.currentTarget             = null;
	this.eventPhase                = 0;
	this.bubbles                   = false;
	this.cancelable                = true;
	this.timeStamp                 = 0;
	this.defaultPrevented          = false;
	this.isTrusted                 = true;
	this.propagateStopped          = false;
	this.propagateStoppedImmediate = false;
	this.detail                    = null;
	this.init(conf);
};
O2PS4O.Event.prototype.init = function(conf){
	this.timeStamp = Date.now();

	if (conf) {
		if (conf.target) {
			this.target = conf.target;
		}
		if (conf.detail) {
			this.detail = conf.detail;
		}
	}

	this.eventPhase = 1;
};
O2PS4O.Event.prototype.stopPropagation = function(){
	this.propagateStopped = true;
};
O2PS4O.Event.prototype.stopImmediatePropagation = function(){
	this.propagateStoppedImmediate = true;
};
O2PS4O.Event.prototype.preventDefault = function(){
	this.defaultPrevented = true;
};
