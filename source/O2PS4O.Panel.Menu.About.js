O2PS4O.Panel.Menu.About = function(conf){
	this.node = null;
	this._events = null;
	this.init(conf || this.conf);
};
O2PS4O.Panel.Menu.About.prototype = new O2PS4O.Panel();
O2PS4O.Panel.Menu.About.prototype.conf = {
	group : '',
	template : [
		'<li data-func="about"><a target="_blank" href="https://github.com/yukihirog/O2PS4O"><span class="menu-title">これ on Github</span></a></li>',
	].join(''),
	events : [
	],
	nodeEvents : [
	],
	publicEvents : {
	}
};
