O2PS4O.Panel.Menu.LayerSave = function(conf){
	this.node = null;
	this._events = null;
	this.init(conf || this.conf);
};
O2PS4O.Panel.Menu.LayerSave.prototype = new O2PS4O.Panel();
O2PS4O.Panel.Menu.LayerSave.prototype.conf = {
	group : '',
	template : [
		'<li data-func="layersave"><label tab-index="0"><span class="menu-title">レイヤーを保存</span></label></li>',
	].join(''),
	events : [
		{
			type : 'create',
			func : 'onCreate'
		}
	],
	nodeEvents : [
		{
			type : 'click',
			func : 'onClick'
		}
	],
	publicEvents : {
		'layersave' : true
	}
};
O2PS4O.Panel.Menu.LayerSave.prototype.onClick = function(e){
	this.trigger('layersave');
};
O2PS4O.Panel.Menu.LayerSave.prototype.onCreate = function(e){
};
