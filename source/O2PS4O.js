function O2PS4O(conf){
	this.node = null;
	this._events = null;
	this.panels = {};
	this.psd = null;
	this.init(conf);
};
O2PS4O.prototype.init = function(conf){
	if (conf) {
		if (conf.template) {
			this.initNode(conf.template.content.cloneNode(true));
			this.initPanel();
		}
	}
};
O2PS4O.prototype.initNode = function(node){
	var _node = document.createElement('div');
	_node.appendChild(node);
	this.node = _node;
	this.node.addEventListener('dragenter', this.onDragEnter.bind(this));
	this.node.addEventListener('dragover', this.onDragOver.bind(this));
	this.node.addEventListener('drop', this.onDrop.bind(this));
};
O2PS4O.prototype.onDragEnter = function(e){
	e.preventDefault();
	e.stopPropagation();
};
O2PS4O.prototype.onDragOver = function(e){
	e.preventDefault();
	e.stopPropagation();
};
O2PS4O.prototype.onDrop = function(e){
	e.preventDefault();
	e.stopPropagation();

	var blob = e.dataTransfer.files[0];
	if (blob) {
		this.parse(blob);
	}
};
O2PS4O.prototype.initPanel = function(){
	var panels = O2PS4O.Panel;
	for (var name in panels) {
		if (name !== 'prototype' && panels.hasOwnProperty(name)) {
			var panel = this.panels[name] = new panels[name]();
			var group = panel.conf.group;
			if (group) {
				var container = this.node.querySelector('[data-panel-group="' + group + '"]');
				if (container) {
					container.appendChild(panel.node);
				}
			}
			panel.trigger('create');
		}
	}

	if (this.panels.Menu) {
		this.panels.Menu.on('fileopen', this.onFileOpen.bind(this));
	}

	if (this.panels.Layer && this.panels.Main) {
		this.panels.Layer.on('change', this.onLayerChange.bind(this));
	}
};
O2PS4O.prototype.on = function(type, func){
	if (!this._events) {
		this._events = {};
	}
	if (!this._events[type]) {
		this._events[type] = [];
	}
	this._events[type].push(func);
};
O2PS4O.prototype.off = function(type, func){
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
O2PS4O.prototype.createEvent = function(type, data){
	return new O2PS4O.Event({
		type : type,
		target : this,
		detail : data
	});
};
O2PS4O.prototype.trigger = function(type, data){
	if (!this._events || !this._events[type]) {
		return;
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
O2PS4O.prototype.parse = function(blob){
	var reader = new FileReader();
	reader.addEventListener('load', this.onLoad.bind(this));
	reader.readAsArrayBuffer(blob);
};
O2PS4O.prototype.draw = function(){
	var main = this.panels.Main;
	main.clear();

	var layers = this.panels.Layer.node.querySelectorAll('.layer-item');
	for (var i = layers.length - 1; i >= 0; i--) {
		var layer = layers[i];
		if (layer.getAttribute('data-hidden') !== 'true') {
			var layerCanvas = layer.querySelector('.layer-thumb canvas');
			if (layerCanvas) {
				main.drawCanvas(layerCanvas);
			}
		}
	}
};
O2PS4O.prototype.onFileOpen = function(e, blob){
	this.parse(blob);
};
O2PS4O.prototype.onLoad = function(e){
	var buffer = e.target.result;
	var view = new DataView(buffer);
	var array = [];
	for (var i = 0, n = view.byteLength; i < n; i++) {
		array[i] = view.getUint8(i);
	}
	this.psd = new PSD(new Uint8Array(array));
	this.psd.console();
	window.psd = this.psd;

	document.body.setAttribute('class', 'result');

	for (var name in this.panels) {
		if (this.panels.hasOwnProperty(name)) {
			this.panels[name].trigger('parsed', this.psd);
		}
	}

	this.trigger('parsed', this.psd);

	this.draw();
};
O2PS4O.prototype.onLayerChange = function(e){
	this.draw();
};
