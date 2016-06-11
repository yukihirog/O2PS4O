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
O2PS4O.Panel.Layer.prototype.save = function(psd, layerIndex){
	var layerRecord = psd.getLayerRecord(layerIndex);
	var canvas = psd.getLayerImage(layerIndex);
	if (canvas) {
		var ext      = 'png';
		var filename = layerRecord.name + '.' + ext;

		var fileType = 'image/' + ext;
		var url      = canvas.toDataURL(fileType);
		var data      = atob(url.split(',')[1]);

		var buffer  = new Uint8Array(data.length);
		for (var i = 0, n = data.length; i < n; i++) {
			buffer[i] = data.charCodeAt(i);
		}
		var blob = new Blob([buffer.buffer], { type : fileType });

		var objectURL = window.URL.createObjectURL(blob);
		var link = document.createElement("a");
		document.body.appendChild(link);
		link.href = objectURL;
		link.download = filename;
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(objectURL);

/*
		var formData = new FormData();
		formData.set('filename', filename);
		formData.set('data', blob);

		var method = 'post';
		var api    = '/api/save.php';
		var xhr = new XMLHttpRequest();
		xhr.open(method, api);
		xhr.overrideMimeType('application/json');
		xhr.addEventListener('load', function(e) {
			console.log(e);
			downloadFile(filename, filename);
		});
		xhr.send(formData);
*/
	}
};
O2PS4O.Panel.Layer.prototype.onParsed = function(e, psd){
	this.reset(psd);
};
O2PS4O.Panel.Layer.prototype.onClick = function(e){
	var target = e.target;
	while (target && (target.nodeType == 1 && target.getAttribute('class') !== 'layer-item')) {
		target = target.parentNode;
	}
	if (target && target.nodeType == 1 && target.getAttribute('class') === 'layer-item') {
		var flag = target.getAttribute('data-hidden') == 'true';
		target.setAttribute('data-hidden', !flag);
		this.trigger('change');
	}
};
