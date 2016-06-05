O2PS4O.Panel.Menu = function(conf){
	this.node = null;
	this._events = null;
	this.init(conf || this.conf);
};
O2PS4O.Panel.Menu.prototype = new O2PS4O.Panel();
O2PS4O.Panel.Menu.prototype.conf = {
	group : 'menu',
	template : [
		'<div class="panel O2PS4O-panel-menu">',
		'<ul>',
		'<li data-func="fileopen"><label tab-index="0"><span class="menu-title">ファイルを開く</span><span class="menu-input"><input type="file"></label></li>',
		'</ul>',
		'</div>'
	].join(''),
	events : [
		{
			type : 'create',
			func : 'onCreate'
		}
	],
	nodeEvents : [
	]
};
O2PS4O.Panel.Menu.prototype.initInput = function(){
	var label = this.node.querySelector('[data-func="fileopen"] label');
	var inputContainer = label.querySelector('.menu-input');
	var input = label.querySelector('input');
	if (input) {
		inputContainer.removeChild(input);
	}

	input = document.createElement('input');
	input.setAttribute('type', 'file');
	inputContainer.appendChild(input);
	input.addEventListener('change', this.onChange.bind(this));
};
O2PS4O.Panel.Menu.prototype.onChange = function(e){
	var blob = e.target.files[0];
	this.trigger('fileopen', blob);
	this.initInput();
};
O2PS4O.Panel.Menu.prototype.onCreate = function(e){
	this.initInput();
};
