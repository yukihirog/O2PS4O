PSD.TypeData.RLE = function (conf, array){
	this.length = 0;
	this.array  = [];
	this.parse(conf, array);
};
PSD.TypeData.RLE.prototype = new PSD.TypeData();
PSD.TypeData.RLE.prototype.getValue = function(){
	var _ret = [];
	var _array = this.array;
	for (var i = 0, n = _array.length; i < n;) {

		var _repeat = (new PSD.TypeData.Int8({}, [_array[i]])).getValue();
		i++;

		if (_repeat < 0) {
			_repeat = -1 * _repeat + 1;
			var _data   = _array[i] || 0;
			i++;
			for (var _count = 0; _count < _repeat; _count++) {
				_ret.push(_data);
			}
		} else {
			_repeat = _repeat + 1;
			for (var _count = 0; _count < _repeat; _count++) {
				var _data   = _array[i] || 0;
				i++;
				_ret.push(_data);
			}
		}
	}
	return _ret;
};
