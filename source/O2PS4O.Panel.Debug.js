O2PS4O.Panel.Debug = function(conf){
	this.node = null;
	this._events = null;
	this.init(conf || this.conf);
};
O2PS4O.Panel.Debug.prototype = new O2PS4O.Panel();
O2PS4O.Panel.Debug.prototype.conf = {
	group : 'info',
	template : [
		'<div class="panel O2PS4O-panel-debug"></div>'
	].join(''),
	events : [
		{
			type : 'parsed',
			func : 'onParsed'
		}
	]
};
O2PS4O.Panel.Debug.prototype.clear = function(){
	this.node.innerHTML = '';
};
O2PS4O.Panel.Debug.prototype.echo = function(){
	var data = psd.toObject();

	var container = this.node;

	var ul = document.createElement('ul');
	container.appendChild(ul);
	container = ul;

	function dig(path, container, data){
		for (var name in data) {
			var li = document.createElement('li');
			container.appendChild(li);

			var div = document.createElement('div');
			div.setAttribute('title', path);
			li.appendChild(div);
			div.appendChild(document.createTextNode(name + ' : '));

			if (typeof data[name] !== 'object') {
				div.appendChild(document.createTextNode(data[name]));
			} else {
				div.appendChild(document.createTextNode('(' + data[name].constructor.name + ')'));

				if (data[name] instanceof Array || data[name] instanceof Uint8Array || data[name] instanceof Int8Array) {
					div.appendChild(document.createTextNode('[' + data[name].length + ']'));
				}

				div.setAttribute('aria-expanded', 'false');

				var ul = document.createElement('ul');
				li.appendChild(ul);

				div.appendChild(ul);

				arguments.callee(path + '.' + name, ul, data[name]);
			}
		}
	};

	dig('PSD', container, data);
};
O2PS4O.Panel.Debug.prototype.onParsed = function(e, psd){
	this.clear();
	this.echo(psd);
};
