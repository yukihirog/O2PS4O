PSD.TypeData.String = function (conf, array){
	this.length  = 0;
	this.array   = [];
	this.charset = 'utf-8';
	this.parse(conf, array);
};
PSD.TypeData.String.prototype = new PSD.TypeData();
PSD.TypeData.String.prototype.parse = function(conf, array){
	if (conf && array) {
		this.length  = this.parseLength(conf.length);
		this.array   = array;
		this.charset = conf.charset || this.charset;
	}
};
PSD.TypeData.String.prototype.getValue = function(charset){
	return this.toString(charset || this.charset);
};
PSD.TypeData.String.prototype.toObject = function(charset){
	return this.getValue(charset);
};
