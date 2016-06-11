O2PS4O.Panel.Menu = function(conf){
	this.node     = null;
	this.contents = {};
	this._events   = null;
	this.init(conf || this.conf);
};
O2PS4O.Panel.Menu.prototype = new O2PS4O.Panel();
O2PS4O.Panel.Menu.prototype.conf = {
	group : 'menu',
	template : [
		'<div class="panel O2PS4O-panel-menu">',
		'<ul class="panel-content"></ul>',
		'</div>'
	].join(''),
	events : [
		{
			type : 'create',
			func : 'onCreate'
		},
		{
			type : 'parsed',
			func : 'onParsed'
		}
	],
	nodeEvents : [
	],
	publicEvents : {
	}
};
O2PS4O.Panel.Menu.prototype.initChildren = function(){
	var constructor = O2PS4O.Panel.Menu;
	for (var name in constructor) {
		if (constructor.hasOwnProperty(name)) {
			this.add(name, new constructor[name]());
		}
	}
};
O2PS4O.Panel.Menu.prototype.add = function(name, menu){
	var list = this.node.querySelector('.panel-content');
	list.appendChild(menu.node);

	var handler = this.onEvent.bind(this);
	var events = menu.conf.publicEvents;
	if (events) {
		for (var type in events) {
			if (type !== 'create' && events.hasOwnProperty(type)) {
				menu.on(type, handler);
				this.conf.publicEvents[type] = true;
			}
		}
	}

	this.contents[name] = menu;

	menu.trigger('create');
};
O2PS4O.Panel.Menu.prototype.onCreate = function(e){
	this.initChildren();
};
O2PS4O.Panel.Menu.prototype.onParsed = function(e, psd){
	for (var name in this.contents) {
		if (this.contents.hasOwnProperty(name)) {
			this.contents[name].trigger(e, psd);
		}
	}
};
O2PS4O.Panel.Menu.prototype.onEvent = function(e, data){
	this.trigger(e, data);
};
