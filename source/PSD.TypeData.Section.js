PSD.TypeData.Section = function (conf, array){
	this.length   = 0;
	this.array    = [];
	this.data     = {};
	this.parse(conf, array);
};
PSD.TypeData.Section.prototype = new PSD.TypeData();
PSD.TypeData.Section.prototype.get = function(name){
	return this.data[name];
};
PSD.TypeData.Section.prototype.parseLength = function(length, passed){
	if (typeof length === 'string') {
		if (length == 'remain' && this.get('length')) {
			length = this.get('length').toUint8() - (passed || 0);
		} else {
			length = this.get(length).toUint8();
		}
	} else if (typeof length === 'function') {
		length = length(this);
	}
	return length;
};
PSD.TypeData.Section.prototype.parseRepeat = function(repeat, passed){
	if (typeof repeat === 'string') {
		repeat = this.get(repeat).toUint8();
	} else if (typeof repeat === 'function') {
		repeat = repeat(this);
	}
	return repeat;
};
PSD.TypeData.Section.prototype.parseType = function(type){
	if (typeof type === 'function') {
		type = type(this);
	}
	return type;
};
PSD.TypeData.Section.prototype.parseChildren = function(children){
	if (typeof children === 'function') {
		children = children(children);
	}
	return children;
};
PSD.TypeData.Section.prototype.parse = function(conf, array){
	if (conf && array) {
		var _passed = 0;

		if (conf.children) {
			conf.children.forEach((function(_conf){
				var _length = this.parseLength(_conf.length, _passed);
				var _end = undefined;
				if (typeof _length === 'number') {
					_end = _passed + _length;
				}

				var _type     = this.parseType(_conf.type);
				var _children = this.parseType(_conf.children);
				var _repeat   = _conf.repeat ? this.parseRepeat(_conf.repeat, _passed) : 0;
				var _data = new PSD.TypeData[_type](
					{
						name     : _conf.name,
						length   : _length,
						children : _children,
						repeat   : _repeat,
						charset  : _conf.charset
					},
					array.slice(_passed, _end)
				);

				this.data[_conf.name] = _data;
				_passed += _data.length;
			}).bind(this));
		}

		if (this.get('length')) {
			this.length = this.get('length').getValue() + this.get('length').length;
		} else {
			this.length = _passed;
		}

		this.array = array.slice(0, this.length);
	}
};
PSD.TypeData.Section.prototype.toObject = function(){
	var _data = {};
	for (var _name in this.data) {
		_data[_name] = this.get(_name).toObject();
	}
	return _data;
};
