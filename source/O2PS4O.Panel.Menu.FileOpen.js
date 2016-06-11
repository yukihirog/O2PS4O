O2PS4O.Panel.Menu.FileOpen = function(conf){
	this.node = null;
	this._events = null;
	this.init(conf || this.conf);
};
O2PS4O.Panel.Menu.FileOpen.prototype = new O2PS4O.Panel();
O2PS4O.Panel.Menu.FileOpen.prototype.conf = {
	group : '',
	template : [
		'<li data-func="fileopen"><label tab-index="0"><span class="menu-title">ファイルを開く</span><span class="menu-input"><input type="file"></span></label></li>',
	].join(''),
	events : [
		{
			type : 'create',
			func : 'onCreate'
		}
	],
	nodeEvents : [
	],
	publicEvents : {
		'fileopen' : true
	}
};
O2PS4O.Panel.Menu.FileOpen.prototype.initInput = function(){
	var label = this.node.querySelector('label');
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
O2PS4O.Panel.Menu.FileOpen.prototype.onChange = function(e){
	var blob = e.target.files[0];
	this.trigger('fileopen', blob);
	this.initInput();
};
O2PS4O.Panel.Menu.FileOpen.prototype.onCreate = function(e){
	this.initInput();
};
