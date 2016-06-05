O2PS4O.Panel.Layer = function(conf){
	this.node = null;
	this._events = null;
	this.init(conf || this.conf);
};
O2PS4O.Panel.Layer.prototype = new O2PS4O.Panel();
O2PS4O.Panel.Layer.prototype.conf = {
	group : 'info',
	template : [
		'<section class="panel O2PS4O-panel-layer">',
		'<header class="panel-header">',
		'<h1 class="panel-title">レイヤー</h1>',
		'</header>',
		'<div class="panel-body">',
		'<ul class="content-layers">',
		'<template>',
		'<li class="layer-item" tab-index="0">',
		'<section>',
		'<h1 class="layer-name"></h1>',
		'<figure class="layer-thumb"></figure>',
		'</section>',
		'</li>',
		'</template>',
		'</ul>',
		'<!-- /panel-body --></div>',
		'<!-- /O2PS4O-panel-layer --></section>'
	].join(''),
	events : [
		{
			type : 'parsed',
			func : 'onParsed'
		}
	],
	nodeEvents : [
		{
			type : 'click',
			func : 'onClick'
		}
	]
};
O2PS4O.Panel.Layer.prototype.reset = function(psd){
	this.clear();

	if (psd) {
		var layers = psd
			.get('LayerAndMaskInformationSection')
			.get('LayerInfo')
			.get('LayerRecords')
			.toObject()
		;

		for (var i in layers) {
			if (layers.hasOwnProperty(i)) {
				this.add(psd, parseInt(i, 10), layers[i]);
			}
		}
	}
};
O2PS4O.Panel.Layer.prototype.clear = function(){
	var layerPanelTree = this.node.querySelector('.content-layers');
	var items = layerPanelTree.querySelectorAll('.layer-item');
	if (items) {
		for (var i = 0, n = items.length; i < n; i++) {
			layerPanelTree.removeChild(items[i]);
		}
	}
};
O2PS4O.Panel.Layer.prototype.add = function(psd, layerIndex, layerRecord){
	var layerPanelTree = this.node.querySelector('.content-layers');
	var node = layerPanelTree.querySelector('template').content.cloneNode(true);

	node.querySelector('.layer-name').innerText = layerRecord.name;

	var canvas = psd.getLayerImage(layerIndex);
	if (canvas) {
		node.querySelector('.layer-thumb').appendChild(canvas);
	}

	layerPanelTree.insertBefore(node, layerPanelTree.firstChild);
};
O2PS4O.Panel.Layer.prototype.onParsed = function(e, psd){
	this.reset(psd);
};
O2PS4O.Panel.Layer.prototype.onClick = function(e){
	var target = e.target;
	while (target && (target.nodeType == 1 && target.getAttribute('class') !== 'layer-item')) {
		target = target.parentNode;
	}
	if (target) {
		var flag = target.getAttribute('data-hidden') == 'true';
		target.setAttribute('data-hidden', !flag);
		this.trigger('change');
	}
};
