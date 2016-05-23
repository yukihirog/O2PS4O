PSD.TypeData.Uint8 = function (conf, array){
	this.length = 0;
	this.array  = [];
	this.parse(conf, array);
};
PSD.TypeData.Uint8.prototype = new PSD.TypeData();
PSD.TypeData.Uint8.prototype.getValue = function(){
	return this.toUint8();
};
