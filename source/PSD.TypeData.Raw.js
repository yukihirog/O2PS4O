PSD.TypeData.Raw = function (conf, array){
	this.length = 0;
	this.array  = [];
	this.parse(conf, array);
};
PSD.TypeData.Raw.prototype = new PSD.TypeData();
