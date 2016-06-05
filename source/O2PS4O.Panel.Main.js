O2PS4O.Panel.Main = function(conf){
	this.node = null;
	this._events = null;
	this.init(conf || this.conf);
};
O2PS4O.Panel.Main.prototype = new O2PS4O.Panel();
O2PS4O.Panel.Main.prototype.conf = {
	group : 'main',
	template : [
		'<canvas class="panel O2PS4O-panel-canvas"></canvas>'
	].join(''),
	events : [
		{
			type : 'parsed',
			func : 'onParsed'
		}
	]
};
O2PS4O.Panel.Main.prototype.initCanvas = function(psd){
	if (psd) {
		psd.initCanvas(this.node);
	}
};
O2PS4O.Panel.Main.prototype.draw = function(psd){
	this.clear();
	if (psd) {
		psd.draw(this.node);
	}
};
O2PS4O.Panel.Main.prototype.drawCanvas = function(canvas){
	var context = this.node.getContext('2d');
	context.drawImage(
		canvas,
		parseFloat(canvas.getAttribute('data-left') || 0, 10),
		parseFloat(canvas.getAttribute('data-top') || 0, 10)
	);
};
O2PS4O.Panel.Main.prototype.clear = function(){
	var context = this.node.getContext('2d');
	context.clearRect(0, 0, this.node.width, this.node.height);
};
O2PS4O.Panel.Main.prototype.onParsed = function(e, psd){
	this.initCanvas(psd);
};
