O2PS4O.Panel.Menu.LayerSave = function(conf){
	this.node = null;
	this._events = null;
	this.init(conf || this.conf);
};
O2PS4O.Panel.Menu.LayerSave.prototype = new O2PS4O.Panel();
O2PS4O.Panel.Menu.LayerSave.prototype.conf = {
	group : '',
	template : [
		'<li data-func="layersave"><label tab-index="0"><span class="menu-title">レイヤーを保存</span><select></select></label></li>',
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
		'layersave' : true
	}
};
O2PS4O.Panel.Menu.LayerSave.prototype.clear = function(){
	var select = this.node.querySelector('select');
	select.innerHTML = '';
	select.selectedIndex = -1;
};
O2PS4O.Panel.Menu.LayerSave.prototype.initLayers = function(layerRecords){
	this.clear();

	var select = this.node.querySelector('select');
	for (var i in layerRecords) {
		if (layerRecords.hasOwnProperty(i)) {
			var option = document.createElement('option');
			option.appendChild(document.createTextNode(layerRecords[i].name));
			option.setAttribute('value', i);
			select.appendChild(option);
		}
	}

	select.selectedIndex = -1;
};
O2PS4O.Panel.Menu.LayerSave.prototype.onSelect = function(e){
	var select = this.node.querySelector('select');
	this.trigger('layersave', select.selectedIndex);
	select.selectedIndex = -1;
	select.blur();
};
O2PS4O.Panel.Menu.LayerSave.prototype.onParsed = function(e, psd){
	var records = psd.getLayerRecords();
	this.initLayers(records);
};
O2PS4O.Panel.Menu.LayerSave.prototype.onCreate = function(e){
	this.clear();
	var select = this.node.querySelector('select');
	select.addEventListener('change', this.onSelect.bind(this));
};
