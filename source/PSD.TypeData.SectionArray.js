PSD.TypeData.SectionArray = function (conf, array){
	this.length   = 0;
	this.array    = [];
	this.data     = {};
	this.parse(conf, array);
};
PSD.TypeData.SectionArray.prototype = new PSD.TypeData();
PSD.TypeData.SectionArray.prototype.get = function(name){
	return this.data[name];
};
PSD.TypeData.SectionArray.prototype.parseLength = function(length){
	if (typeof length === 'string') {
		length = this.get(length).toUint8();
	} else if (typeof length === 'function') {
		length = length(this);
	}
	return length;
};
PSD.TypeData.SectionArray.prototype.parseRepeat = function(repeat){
	if (typeof repeat === 'string') {
		repeat = this.get(repeat).toUint8();
	} else if (typeof repeat === 'function') {
		repeat = length(repeat);
	}
	return repeat;
};
PSD.TypeData.SectionArray.prototype.parse = function(conf, array){
	if (conf && array) {

		var _passed = 0;
		var _index  = 0;
		var _repeat = conf.repeat ? this.parseRepeat(conf.repeat) : null;

		if (typeof _repeat != 'number') {
			this.length = this.parseLength(conf.length);
		}

		if (conf.children) {
			if (typeof _repeat == 'number') {
				while (_index < _repeat) {
					var _child = new PSD.TypeData.Section({
						children : conf.children
					}, array.slice(_passed));
					this.data[_index] = _child;
					_passed += _child.length;
if (isNaN(_passed)) {
//	console.log(conf.name, _child, _child.length);
}
					_index++;
				}
			} else if (this.length) {
				while (_passed < this.length) {
					var _child = new PSD.TypeData.Section({
						children : conf.children
					}, array.slice(_passed));
					this.data[_index] = _child;
					_passed += _child.length;
					_index++;
				}
			}
		}

		if (this.get('length')) {
			this.length = this.get('length').getValue() + this.get('length').length;
		} else {
			this.length = _passed;
		}
if (isNaN(this.length)) {
//	console.log(conf.name, this.length, _passed);
}
		this.array = array.slice(0, this.length);
	}
};
PSD.TypeData.SectionArray.prototype.toObject = function(){
	var _data = {};
	for (var _name in this.data) {
		_data[_name] = this.get(_name).toObject();
	}
	return _data;
};
