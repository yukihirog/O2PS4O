PSD.TypeData = function (conf, array){
	this.length = 0;
	this.array  = [];
	this.parse(conf, array);
};
PSD.TypeData.prototype.parse = function(conf, array){
	if (conf && array) {
		this.length = this.parseLength(conf.length);
		this.array  = array;

		if (typeof this.length === 'undefined') {
			this.length = this.array.length;
		}
	}
};
PSD.TypeData.prototype.parseLength = function(length){
	if (typeof length === 'function') {
		length = length(this);
	}
	return length;
};
PSD.TypeData.prototype.toUint8 = function(){
	var data = new Uint8Array(this.array.slice().reverse());
	var value = 0;
	data.forEach(function(_value, _index){
		value += _value * Math.pow(256, _index);
	});
	return value;
};
PSD.TypeData.prototype.toInt8 = function(){
	var data = new Int8Array(this.array.slice().reverse());
	var value = 0;
	data.forEach(function(_value, _index){
		value += _value * Math.pow(128, _index);
	});
	return value;
};
PSD.TypeData.prototype.toString = function(charset){
	var decoder = new TextDecoder(charset || 'utf-8');
	var value = decoder.decode(this.array);
	return value;
};
PSD.TypeData.prototype.getValue = function(){
	return this.array;
};
PSD.TypeData.prototype.toObject = function(){
	return this.getValue();
};
