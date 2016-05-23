PSD.TypeData.Int8 = function (conf, array){
	this.length = 0;
	this.array  = [];
	this.parse(conf, array);
};
PSD.TypeData.Int8.prototype = new PSD.TypeData();
PSD.TypeData.Int8.prototype.getValue = function(){
	return this.toInt8();
};
