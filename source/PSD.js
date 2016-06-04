function PSD(array){
	this.data   = {};
	this.length = 0;
	this.parse(array);
};
PSD.prototype.get = function(name){
	return this.data[name];
};
PSD.prototype.parse = function(array){
	var conf = this.config;
	if (conf && array) {
		var _passed = 0;
		conf.forEach((function(_conf){
			var _data = new PSD.TypeData[_conf.type](_conf, array.slice(_passed));
			this.data[_conf.name] = _data;
			_passed += this.data[_conf.name].length;
		}).bind(this));
	}
	this.length = this.getTotalBytes();
};
PSD.prototype.getTotalBytes = function(){
	var bytes = 0;
	for (var name in this.data) {
		if (this.data.hasOwnProperty(name)) {
			bytes += this.get(name).length;
		}
	}
	return bytes;
};
PSD.prototype.toObject = function(){
	var _data = {};
	for (var _name in this.data) {
		_data[_name] = this.get(_name).toObject();
	}
	return _data;
};
PSD.prototype.console = function(){
	console.log('PSD(Object): ', this.toObject());
	console.log('PSD: ', this);
};
PSD.prototype.getCanvasSize = function(){
	var _meta = this.get('FileHeaderSection');
	var _canvasSize = {
		width  : _meta.get('width').getValue(),
		height : _meta.get('height').getValue()
	};
	return _canvasSize;
};
PSD.prototype.draw = function(canvas){
	if (!canvas) {
		canvas = document.createElement('canvas');
	}

	var _meta = this.get('FileHeaderSection');
	var _canvasSize = this.getCanvasSize();
	canvas.setAttribute('width',  _canvasSize.width);
	canvas.setAttribute('height', _canvasSize.height);

	var _layers     = this.get('LayerAndMaskInformationSection');
	var _layerInfo  = _layers.get('LayerInfo');
	var _records    = _layerInfo.get('LayerRecords');

	var _channelImageData = _layerInfo.get('channelImageData').toObject();

	var context = canvas.getContext('2d');
	context.clearRect(0, 0, _canvasSize.width, _canvasSize.height);

	var _cursor = 0;
	for (var _layerIndex = 0, _layerCount = _layerInfo.get('layerCount').getValue(); _layerIndex < _layerCount; _layerIndex++) {
		var _record = _records.get(_layerIndex);

		var _layerRect = _record.get('rectangle').toObject();
		var _layerSize = {
			width  : _layerRect.right  - _layerRect.left,
			height : _layerRect.bottom - _layerRect.top
		};

		var _channelInfo = _record.get('ChannelInformation');
		var _channelConfigs = [];
		for (var _channelInfoIndex = 0, _channelInfoLength = _record.get('channels').getValue(); _channelInfoIndex < _channelInfoLength; _channelInfoIndex++) {
			var _channelConfigData = _channelInfo.get(_channelInfoIndex);
			_channelConfigs.push({
				id     : _channelConfigData.get('channelId').getValue(),
				length : _channelConfigData.get('lengthChannelData').getValue()
			});
		}

		var _canvasImageData  = context.createImageData(_layerSize.width, _layerSize.height);
		var _dataSource       = _channelImageData.imageData.slice(_cursor);

		for (var _layerPixelIndex = 0, _layerPixelLength = _layerSize.width * _layerSize.height; _layerPixelIndex < _layerPixelLength; _layerPixelIndex++) {
			for (var _channelConfigsIndex = 0, _channelConfigsLength = _channelConfigs.length; _channelConfigsIndex < _channelConfigsLength; _channelConfigsIndex++) {
				var _channelConfig = _channelConfigs[_channelConfigsIndex];
				var _rgbaIndex = 0;
				switch (_channelConfig.id) {
					case 0:
						_rgbaIndex = 0;
					break;
					case 1:
						_rgbaIndex = 1;
					break;
					case 2:
						_rgbaIndex = 2;
					break;
					case -129:
						_rgbaIndex = 3;
					break;
				}
				_canvasImageData.data[_rgbaIndex] = _dataSource[_cursor];
				_cursor += _channelConfig.length;
			}
		}

		context.putImageData(_canvasImageData, _layerRect.left, _layerRect.top);
	}

	return canvas;
};
PSD.prototype.config = [
	{
		name     : 'FileHeaderSection',
		type     : 'Section',
		children : [
			{
				name   : 'signature',
				length : 4,
				type   : 'String'
			},
			{
				name   : 'version',
				length : 2,
				type   : 'Uint8'
			},
			{
				name   : 'reserved',
				length : 6,
				type   : 'Uint8'
			},
			{
				name   : 'channels',
				length : 2,
				type   : 'Uint8'
			},
			{
				name   : 'height',
				length : 4,
				type   : 'Uint8'
			},
			{
				name   : 'width',
				length : 4,
				type   : 'Uint8'
			},
			{
				name   : 'depth',
				length : 2,
				type   : 'Uint8'
			},
			{
				name   : 'colorMode',
				length : 2,
				type   : 'Uint8'
			}
		]
	},
	{
		name   : 'ColorModeDataSection',
		type   : 'Section',
		children : [
			{
				name   : 'length',
				length : 4,
				type   : 'Uint8'
			},
			{
				name   : 'colorData',
				length : 'length',
				type   : 'Raw'
			}
		]
	},
	{
		name : 'ImageResourcesSection',
		type : 'Section',
		children : [
			{
				name   : 'length',
				length : 4,
				type   : 'Uint8'
			},
			{
				name     : 'ImageResourceBlocks',
				length   : 'length',
				type     : 'SectionArray',
				children : [
					{
						name   : 'signature',
						length : 4,
						type   : 'String'
					},
					{
						name   : 'id',
						length : 2,
						type   : 'Uint8'
					},
					{
						name   : 'nameLength',
						length : 1,
						type   : 'Uint8'
					},
					{
						name   : 'name',
						length : function(section){
							return section.get('nameLength').getValue() || 1;
						},
						type   : 'String',
						charset: 'sjis'
					},
					{
						name   : 'dataLength',
						length : 4,
						type   : 'Uint8'
					},
					{
						name   : 'data',
						length : 'dataLength',
						type   : function(section){
							var _id = section.get('id').getValue();
							var _range = function(_id, min, max){
								return (min <= _id && _id <= max) ? _id : false;
							};
							switch (_id) {
								// defined
								case 1000: // (Obsolete--Photoshop 2.0 only ) Contains five 2-byte values: number of channels, rows, columns, depth, and mode
									return 'Section';
								break;
								case 1001: // Macintosh print manager print info record
									return 'Raw';
								break;
								case 1003: // (Obsolete--Photoshop 2.0 only ) Indexed color table
									return 'Raw';
								break;
								case 1005: // ResolutionInfo structure. See Appendix A in Photoshop API Guide.pdf.
									return 'Raw';
								break;
								case 1006: // Names of the alpha channels as a series of Pascal strings.
									return 'SectionArray';
								break;
								case 1007: // (Obsolete) See ID 1077DisplayInfo structure. See Appendix A in Photoshop API Guide.pdf.
									return 'Raw';
								break;
								case 1008: // The caption as a Pascal string.
									return 'Section';
								break;
								case 1009: // Border information. Contains a fixed number (2 bytes real, 2 bytes fraction) for the border width, and 2 bytes for border units (1 = inches, 2 = cm, 3 = points, 4 = picas, 5 = columns).
									return 'Section';
								break;
								case 1010: // Background color. See See Color structure.
									return 'Section';
								break;
								case 1011: // Print flags. A series of one-byte boolean values (see Page Setup dialog): labels, crop marks, color bars, registration marks, negative, flip, interpolate, caption, print flags.
									return 'Section';
								break;
								case 1012: // Grayscale and multichannel halftoning information
									return 'Raw';
								break;
								case 1013: // Color halftoning information
									return 'Raw';
								break;
								case 1014: // Duotone halftoning information
									return 'Raw';
								break;
								case 1015: // Grayscale and multichannel transfer function
									return 'Raw';
								break;
								case 1016: // Color transfer functions
									return 'Raw';
								break;
								case 1017: // Duotone transfer functions
									return 'Raw';
								break;
								case 1018: // Duotone image information
									return 'Raw';
								break;
								case 1019: // Two bytes for the effective black and white values for the dot range
									return 'Raw';
								break;
								case 1020: // (Obsolete)
									return 'Raw';
								break;
								case 1021: // EPS options
									return 'Raw';
								break;
								case 1022: // Quick Mask information. 2 bytes containing Quick Mask channel ID; 1- byte boolean indicating whether the mask was initially empty.
									return 'Section';
								break;
								case 1023: // (Obsolete)
									return 'Raw';
								break;
								case 1024: // Layer state information. 2 bytes containing the index of target layer (0 = bottom layer).
									return 'Uint8';
								break;
								case 1025: // Working path (not saved). See See Path resource format.
									return 'Raw';
								break;
								case 1026: // Layers group information. 2 bytes per layer containing a group ID for the dragging groups. Layers in a group have the same group ID.
									return 'SectionArray';
								break;
								case 1027: // (Obsolete)
									return 'Raw';
								break;
								case 1028: // IPTC-NAA record. Contains the File Info... information. See the documentation in the IPTC folder of the Documentation folder.
									return 'Raw';
								break;
								case 1029: // Image mode for raw format files
									return 'Raw';
								break;
								case 1030: // JPEG quality. Private.
									return 'Raw';
								break;
								case 1032: // (Photoshop 4.0) Grid and guides information. See See Grid and guides resource format.
									return 'Section';
								break;
								case 1033: // (Photoshop 4.0) Thumbnail resource for Photoshop 4.0 only. See See Thumbnail resource format.
									return 'Section';
								break;
								case 1034: // (Photoshop 4.0) Copyright flag. Boolean indicating whether image is copyrighted. Can be set via Property suite or by user in File Info...
									return 'Raw';
								break;
								case 1035: // (Photoshop 4.0) URL. Handle of a text string with uniform resource locator. Can be set via Property suite or by user in File Info...
									return 'Raw';
								break;
								case 1036: // (Photoshop 5.0) Thumbnail resource (supersedes resource 1033). See See Thumbnail resource format.
									return 'Section';
								break;
								case 1037: // (Photoshop 5.0) Global Angle. 4 bytes that contain an integer between 0 and 359, which is the global lighting angle for effects layer. If not present, assumed to be 30.
									return 'Uint8';
								break;
								case 1038: // (Obsolete) See ID 1073 below. (Photoshop 5.0) Color samplers resource. See See Color samplers resource format.
									return 'Raw';
								break;
								case 1039: // (Photoshop 5.0) ICC Profile. The raw bytes of an ICC (International Color Consortium) format profile. See ICC1v42_2006-05.pdf in the Documentation folder and icProfileHeader.h in Sample Code\Common\Includes .
									return 'Raw';
								break;
								case 1040: // (Photoshop 5.0) Watermark. One byte.
									return 'Raw';
								break;
								case 1041: // (Photoshop 5.0) ICC Untagged Profile. 1 byte that disables any assumed profile handling when opening the file. 1 = intentionally untagged.
									return 'Raw';
								break;
								case 1042: // (Photoshop 5.0) Effects visible. 1-byte global flag to show/hide all the effects layer. Only present when they are hidden.
									return 'Raw';
								break;
								case 1043: // (Photoshop 5.0) Spot Halftone. 4 bytes for version, 4 bytes for length, and the variable length data.
									return 'Raw';
								break;
								case 1044: // (Photoshop 5.0) Document-specific IDs seed number. 4 bytes: Base value, starting at which layer IDs will be generated (or a greater value if existing IDs already exceed it). Its purpose is to avoid the case where we add layers, flatten, save, open, and then add more layers that end up with the same IDs as the first set.
									return 'Uint8';
								break;
								case 1045: // (Photoshop 5.0) Unicode Alpha Names. Unicode string
									return 'Raw';
								break;
								case 1046: // (Photoshop 6.0) Indexed Color Table Count. 2 bytes for the number of colors in table that are actually defined
									return 'Raw';
								break;
								case 1047: // (Photoshop 6.0) Transparency Index. 2 bytes for the index of transparent color, if any.
									return 'Raw';
								break;
								case 1049: // (Photoshop 6.0) Global Altitude. 4 byte entry for altitude
									return 'Uint8';
								break;
								case 1050: // (Photoshop 6.0) Slices. See See Slices resource format.
									return 'Section';
								break;
								case 1051: // (Photoshop 6.0) Workflow URL. Unicode string
									return 'Raw';
								break;
								case 1052: // (Photoshop 6.0) Jump To XPEP. 2 bytes major version, 2 bytes minor version, 4 bytes count. Following is repeated for count: 4 bytes block size, 4 bytes key, if key = 'jtDd' , then next is a Boolean for the dirty flag; otherwise it's a 4 byte entry for the mod date.
									return 'Raw';
								break;
								case 1053: // (Photoshop 6.0) Alpha Identifiers. 4 bytes of length, followed by 4 bytes each for every alpha identifier.
									return 'Raw';
								break;
								case 1054: // (Photoshop 6.0) URL List. 4 byte count of URLs, followed by 4 byte long, 4 byte ID, and Unicode string for each count.
									return 'Section';
								break;
								case 1057: // (Photoshop 6.0) Version Info. 4 bytes version, 1 byte hasRealMergedData , Unicode string: writer name, Unicode string: reader name, 4 bytes file version.
									return 'Section';
								break;
								case 1058: // (Photoshop 7.0) EXIF data 1. See http://www.kodak.com/global/plugins/acrobat/en/service/digCam/exifStandard2.pdf
									return 'Raw';
								break;
								case 1059: // (Photoshop 7.0) EXIF data 3. See http://www.kodak.com/global/plugins/acrobat/en/service/digCam/exifStandard2.pdf
									return 'Raw';
								break;
								case 1060: // (Photoshop 7.0) XMP metadata. File info as XML description. See http://www.adobe.com/devnet/xmp/
									return 'String';
								break;
								case 1061: // (Photoshop 7.0) Caption digest. 16 bytes: RSA Data Security, MD5 message-digest algorithm
									return 'Raw';
								break;
								case 1062: // (Photoshop 7.0) Print scale. 2 bytes style (0 = centered, 1 = size to fit, 2 = user defined). 4 bytes x location (floating point). 4 bytes y location (floating point). 4 bytes scale (floating point)
									return 'Section';
								break;
								case 1064: // (Photoshop CS) Pixel Aspect Ratio. 4 bytes (version = 1 or 2), 8 bytes double, x / y of a pixel. Version 2, attempting to correct values for NTSC and PAL, previously off by a factor of approx. 5%.
									return 'Section';
								break;
								case 1065: // (Photoshop CS) Layer Comps. 4 bytes (descriptor version = 16), Descriptor (see See Descriptor structure)
									return 'Raw';
								break;
								case 1066: // (Photoshop CS) Alternate Duotone Colors. 2 bytes (version = 1), 2 bytes count, following is repeated for each count: [ Color: 2 bytes for space followed by 4 * 2 byte color component ], following this is another 2 byte count, usually 256, followed by Lab colors one byte each for L, a, b. This resource is not read or used by Photoshop.
									return 'Raw';
								break;
								case 1067: // (Photoshop CS)Alternate Spot Colors. 2 bytes (version = 1), 2 bytes channel count, following is repeated for each count: 4 bytes channel ID, Color: 2 bytes for space followed by 4 * 2 byte color component. This resource is not read or used by Photoshop.
									return 'Raw';
								break;
								case 1069: // (Photoshop CS2) Layer Selection ID(s). 2 bytes count, following is repeated for each count: 4 bytes layer ID
									return 'Section';
								break;
								case 1070: // (Photoshop CS2) HDR Toning information
									return 'Raw';
								break;
								case 1071: // (Photoshop CS2) Print info
									return 'Raw';
								break;
								case 1072: // (Photoshop CS2) Layer Group(s) Enabled ID. 1 byte for each layer in the document, repeated by length of the resource. NOTE: Layer groups have start and end markers
									return 'SectionArray';
								break;
								case 1073: // (Photoshop CS3) Color samplers resource. Also see ID 1038 for old format. See See Color samplers resource format.
									return 'Raw';
								break;
								case 1074: // (Photoshop CS3) Measurement Scale. 4 bytes (descriptor version = 16), Descriptor (see See Descriptor structure)
									return 'Raw';
								break;
								case 1075: // (Photoshop CS3) Timeline Information. 4 bytes (descriptor version = 16), Descriptor (see See Descriptor structure)
									return 'Raw';
								break;
								case 1076: // (Photoshop CS3) Sheet Disclosure. 4 bytes (descriptor version = 16), Descriptor (see See Descriptor structure)
									return 'Raw';
								break;
								case 1077: // (Photoshop CS3) DisplayInfo structure to support floating point clors. Also see ID 1007. See Appendix A in Photoshop API Guide.pdf .
									return 'Raw';
								break;
								case 1078: // (Photoshop CS3) Onion Skins. 4 bytes (descriptor version = 16), Descriptor (see See Descriptor structure)
									return 'Raw';
								break;
								case 1080: // (Photoshop CS4) Count Information. 4 bytes (descriptor version = 16), Descriptor (see See Descriptor structure) Information about the count in the document. See the Count Tool.
									return 'Raw';
								break;
								case 1082: // (Photoshop CS5) Print Information. 4 bytes (descriptor version = 16), Descriptor (see See Descriptor structure) Information about the current print settings in the document. The color management options.
									return 'Section';
								break;
								case 1083: // (Photoshop CS5) Print Style. 4 bytes (descriptor version = 16), Descriptor (see See Descriptor structure) Information about the current print style in the document. The printing marks, labels, ornaments, etc.
									return 'Section';
								break;
								case 1084: // (Photoshop CS5) Macintosh NSPrintInfo. Variable OS specific info for Macintosh. NSPrintInfo. It is recommened that you do not interpret or use this data.
									return 'Raw';
								break;
								case 1085: // (Photoshop CS5) Windows DEVMODE. Variable OS specific info for Windows. DEVMODE. It is recommened that you do not interpret or use this data.
									return 'Raw';
								break;
								case 1086: // (Photoshop CS6) Auto Save File Path. Unicode string. It is recommened that you do not interpret or use this data.
									return 'Raw';
								break;
								case 1087: // (Photoshop CS6) Auto Save Format. Unicode string. It is recommened that you do not interpret or use this data.
									return 'Raw';
								break;
								case 1088: // (Photoshop CC) Path Selection State. 4 bytes (descriptor version = 16), Descriptor (see See Descriptor structure) Information about the current path selection state.
									return 'Raw';
								break;
								case _range(_id, 2000, 2997): // Path Information (saved paths). See See Path resource format.
									return 'Raw';
								break;
								case 2999: // Name of clipping path. See See Path resource format.
									return 'Raw';
								break;
								case 3000: // (Photoshop CC) Origin Path Info. 4 bytes (descriptor version = 16), Descriptor (see See Descriptor structure) Information about the origin path data.
									return 'Raw';
								break;
								case _range(_id, 4000, 4999): // Plug-In resource(s). Resources added by a plug-in. See the plug-in API found in the SDK documentation
									return 'Raw';
								break;
								case 7000: // Image Ready variables. XML representation of variables definition
									return 'Raw';
								break;
								case 7001: // Image Ready data sets
									return 'Raw';
								break;
								case 8000: // (Photoshop CS3) Lightroom workflow, if present the document is in the middle of a Lightroom workflow.
									return 'Raw';
								break;
								case 10000: // Print flags information. 2 bytes version ( = 1), 1 byte center crop marks, 1 byte ( = 0), 4 bytes bleed width value, 2 bytes bleed width scale.
									return 'Section';
								break;
							}
							// undefined
							return 'Raw';
						},
						children : function(section){
							var _id = section.get('id').getValue();
							switch (_id) {
								case 1000: // (Obsolete--Photoshop 2.0 only ) Contains five 2-byte values: number of channels, rows, columns, depth, and mode
									return [
										{
											name   : 'channels',
											length : 2,
											type   : 'Uint8'
										},
										{
											name   : 'rows',
											length : 2,
											type   : 'Uint8'
										},
										{
											name   : 'columns',
											length : 2,
											type   : 'Uint8'
										},
										{
											name   : 'depth',
											length : 2,
											type   : 'Uint8'
										},
										{
											name   : 'mode',
											length : 2,
											type   : 'Uint8'
										}
									];
								break;
								case 1006: // Names of the alpha channels as a series of Pascal strings.
									return [
										{
											name   : 'length',
											length : 1,
											type   : 'Uint8'
										},
										{
											name   : 'data',
											length : 'length',
											type   : 'String'
										}
									];
								break;
								case 1008: // The caption as a Pascal string.
									return [
										{
											name   : 'length',
											length : 1,
											type   : 'Uint8'
										},
										{
											name   : 'data',
											length : 'length',
											type   : 'String'
										}
									];
								break;
								case 1009: // Border information. Contains a fixed number (2 bytes real, 2 bytes fraction) for the border width, and 2 bytes for border units (1 = inches, 2 = cm, 3 = points, 4 = picas, 5 = columns).
									return [
										{
											name   : 'widthReal',
											length : 2,
											type   : 'Uint8'
										},
										{
											name   : 'widthFraction',
											length : 2,
											type   : 'Uint8'
										},
										{
											name   : 'units',
											length : 2,
											type   : 'Uint8'
										}
									];
								break;
								case 1010: // Background color. See See Color structure.
									return [
										{
											name   : 'colorSpace',
											length : 2,
											type   : 'Uint8'
										},
										{
											name   : 'actualColorData',
											length : 8,
											type   : 'Uint8'
										}
									];
								break;
								case 1011: // Print flags. A series of one-byte boolean values (see Page Setup dialog): labels, crop marks, color bars, registration marks, negative, flip, interpolate, caption, print flags.
									return [
										{
											name   : 'label',
											length : 1,
											type   : 'Uint8'
										},
										{
											name   : 'cropMarks',
											length : 1,
											type   : 'Uint8'
										},
										{
											name   : 'colorBars',
											length : 1,
											type   : 'Uint8'
										},
										{
											name   : 'registrationMarks',
											length : 1,
											type   : 'Uint8'
										},
										{
											name   : 'negative',
											length : 1,
											type   : 'Uint8'
										},
										{
											name   : 'flip',
											length : 1,
											type   : 'Uint8'
										},
										{
											name   : 'interpolate',
											length : 1,
											type   : 'Uint8'
										},
										{
											name   : 'caption',
											length : 1,
											type   : 'Uint8'
										},
										{
											name   : 'printFlags',
											length : 1,
											type   : 'Uint8'
										}
									];
								break;
								case 1022: // Quick Mask information. 2 bytes containing Quick Mask channel ID; 1- byte boolean indicating whether the mask was initially empty.
									return [
										{
											name   : 'channelId',
											length : 2,
											type   : 'Uint8'
										},
										{
											name   : 'isInitiallyEmpty',
											length : 1,
											type   : 'Uint8'
										}
									];
								break;
								case 1026: // Layers group information. 2 bytes per layer containing a group ID for the dragging groups. Layers in a group have the same group ID.
									return [
										{
											name   : 'groupId',
											length : 2,
											type   : 'Uint8'
										}
									];
								break;
								case 1032: // (Photoshop 4.0) Grid and guides information. See See Grid and guides resource format.
									return [
										{
											name   : 'version',
											length : 4,
											type   : 'Uint8'
										},
										{
											name   : 'documentSpecificGrids',
											length : 8,
											type   : 'Section',
											children : [
												{
													name   : 'horizontal',
													length : 4,
													type   : 'Uint8'
												},
												{
													name   : 'vertical',
													length : 4,
													type   : 'Uint8'
												}
											]
										},
										{
											name   : 'fGuideCount',
											length : 4,
											type   : 'Uint8'
										},
										{
											name   : 'GuideResourceBlock',
											repeat : function(section){
												return section.get('fGuideCount').getValue();
											},
											length : function(section){
												return 5 * section.get('fGuideCount').getValue();
											},
											type   : 'SectionArray',
											children: [
												{
													name   : 'coordinates',
													length : 4,
													type   : 'Uint8'
												},
												{
													name   : 'direction',
													length : 1,
													type   : 'Uint8'
												}
											]
										}
									];
								break;
								case 1033: // (Photoshop 4.0) Thumbnail resource for Photoshop 4.0 only. See See Thumbnail resource format.
								case 1036: // (Photoshop 5.0) Thumbnail resource (supersedes resource 1033). See See Thumbnail resource format.
									return [
										{
											name   : 'format',
											length : 4,
											type   : 'Uint8'
										},
										{
											name   : 'width',
											length : 4,
											type   : 'Uint8'
										},
										{
											name   : 'height',
											length : 4,
											type   : 'Uint8'
										},
										{
											name   : 'widthbytes',
											length : 4,
											type   : 'Uint8'
										},
										{
											name   : 'totalSize',
											length : 4,
											type   : 'Uint8'
										},
										{
											name   : 'sizeAfterCompression',
											length : 4,
											type   : 'Uint8'
										},
										{
											name   : 'bitsPerPixel',
											length : 2,
											type   : 'Uint8'
										},
										{
											name   : 'numberOfPlanes',
											length : 2,
											type   : 'Uint8'
										},
										{
											name   : 'data',
											type   : 'Raw'
										}
									];
								break;
								case 1050: // (Photoshop 6.0) Slices. See See Slices resource format.
									return [
										{
											name   : 'version',
											length : 4,
											type   : 'Uint8'
										},
//	if version 6
										{
											name   : 'bounding',
											length : function(section){
												if (section.get('version').getValue() == 6) {
													return 4 * 4;
												} else {
													return 0;
												}
											},
											type   : 'Section',
											children : [
												{
													name   : 'top',
													length : 4,
													type   : 'Uint8'
												},
												{
													name   : 'left',
													length : 4,
													type   : 'Uint8'
												},
												{
													name   : 'bottom',
													length : 4,
													type   : 'Uint8'
												},
												{
													name   : 'right',
													length : 4,
													type   : 'Uint8'
												}
											]
										},
										{
											name   : 'nameLength',
											length : function(section){
												if (section.get('version').getValue() == 6) {
													return 4;
												} else {
													return 0;
												}
											},
											type   : 'Uint8'
										},
										{
											name   : 'name',
											length : function(section){
												return section.get('nameLength').getValue() * 2;
											},
											type   : 'String'
										},
										{
											name   : 'count',
											length : function(section){
												if (section.get('version').getValue() == 6) {
													return 4;
												} else {
													return 0;
												}
											},
											type   : 'Uint8'
										},
										{
											name   : 'SliceResourceBlocks',
											repeat : 'count',
											type   : 'SectionArray',
											children : [
												{
													name   : 'id',
													length : 4,
													type   : 'Uint8'
												},
												{
													name   : 'groupId',
													length : 4,
													type   : 'Uint8'
												},
												{
													name   : 'origin',
													length : 4,
													type   : 'Uint8'
												},
												{
													name   : 'layerId',
													length : function(section){
														return section.get('origin').getValue() ? 4 : 0;
													},
													type   : 'Uint8'
												},
												{
													name   : 'nameLength',
													length : 4,
													type   : 'Uint8'
												},
												{
													name   : 'name',
													length : function(section){
														return section.get('nameLength').getValue() * 2;
													},
													type   : 'String'
												},
												{
													name   : 'type',
													length : 4,
													type   : 'Uint8'
												},
												{
													name   : 'position',
													length : 4 * 4,
													type   : 'Section',
													children : [
														{
															name   : 'left',
															length : 4,
															type   : 'Uint8'
														},
														{
															name   : 'top',
															length : 4,
															type   : 'Uint8'
														},
														{
															name   : 'right',
															length : 4,
															type   : 'Uint8'
														},
														{
															name   : 'bottom',
															length : 4,
															type   : 'Uint8'
														}
													]
												},
												{
													name   : 'urlLength',
													length : 4,
													type   : 'Uint8'
												},
												{
													name   : 'url',
													length : function(section){
														return section.get('urlLength').getValue() * 2;
													},
													type   : 'String'
												},
												{
													name   : 'targetLength',
													length : 4,
													type   : 'Uint8'
												},
												{
													name   : 'target',
													length : function(section){
														return section.get('targetLength').getValue() * 2;
													},
													type   : 'String'
												},
												{
													name   : 'messageLength',
													length : 4,
													type   : 'Uint8'
												},
												{
													name   : 'message',
													length : function(section){
														return section.get('messageLength').getValue() * 2;
													},
													type   : 'String'
												},
												{
													name   : 'altLength',
													length : 4,
													type   : 'Uint8'
												},
												{
													name   : 'alt',
													length : function(section){
														return section.get('altLength').getValue() * 2;
													},
													type   : 'String'
												},
												{
													name   : 'isHTML',
													length : 1,
													type   : 'Uint8'
												},
												{
													name   : 'cellTextLength',
													length : 4,
													type   : 'Uint8'
												},
												{
													name   : 'cellText',
													length : function(section){
														return section.get('cellTextLength').getValue() * 2;
													},
													type   : 'String'
												},
												{
													name   : 'horizontalAlignment',
													length : 4,
													type   : 'Uint8'
												},
												{
													name   : 'verticalAlignment',
													length : 4,
													type   : 'Uint8'
												},
												{
													name   : 'alphaColor',
													length : 1,
													type   : 'Uint8'
												},
												{
													name   : 'red',
													length : 1,
													type   : 'Uint8'
												},
												{
													name   : 'green',
													length : 1,
													type   : 'Uint8'
												},
												{
													name   : 'blue',
													length : 1,
													type   : 'Uint8'
												}
											]
										},
										{
											name   : 'descriptorVersion',
											length : 4,
											type   : 'Uint8'
										},
										{
											name   : 'Descriptor',
											type   : 'Raw'
										}
									];
								break;
								case 1054: // (Photoshop 6.0) URL List. 4 byte count of URLs, followed by 4 byte long, 4 byte ID, and Unicode string for each count.
									return [
										{
											name   : 'count',
											length : 4,
											type   : 'Uint8'
										},
										{
											name   : 'URL',
											repeat : 'count',
											type   : 'SectionArray',
											children: [
												{
													name   : 'length',
													length : 4,
													type   : 'Uint8'
												},
												{
													name   : 'id',
													length : 4,
													type   : 'Uint8'
												},
												{
													name   : 'string',
													length : 'length',
													type   : 'Raw' // Unicode string
												}
											]
										}
									];
								break;
								case 1057: // (Photoshop 6.0) Version Info. 4 bytes version, 1 byte hasRealMergedData , Unicode string: writer name, Unicode string: reader name, 4 bytes file version.
									return [
										{
											name   : 'version',
											length : 4,
											type   : 'Uint8'
										},
										{
											name   : 'hasRealMergedData',
											length : 1,
											type   : 'Uint8'
										},
										{
											name   : 'writerChars',
											length : 4,
											type   : 'Uint8'
										},
										{
											name   : 'writer',
											length : function(section){
												return section.get('writerChars').getValue() * 2;
											},
											type   : 'String'
										},
										{
											name   : 'readerChars',
											length : 4,
											type   : 'Uint8'
										},
										{
											name   : 'reader',
											length : function(section){
												return section.get('readerChars').getValue() * 2;
											},
											type   : 'String'
										},
										{
											name   : 'fileVersion',
											length : 4,
											type   : 'Uint8'
										}
									];
								break;
								case 1062: // (Photoshop 7.0) Print scale. 2 bytes style (0 = centered, 1 = size to fit, 2 = user defined). 4 bytes x location (floating point). 4 bytes y location (floating point). 4 bytes scale (floating point)
									return [
										{
											name   : 'style',
											length : 2,
											type   : 'Uint8'
										},
										{
											name   : 'xLocation',
											length : 4,
											type   : 'Uint8'
										},
										{
											name   : 'yLocation',
											length : 4,
											type   : 'Uint8'
										},
										{
											name   : 'scale',
											length : 4,
											type   : 'Uint8'
										}
									];
								break;
								case 1064: // (Photoshop CS) Pixel Aspect Ratio. 4 bytes (version = 1 or 2), 8 bytes double, x / y of a pixel. Version 2, attempting to correct values for NTSC and PAL, previously off by a factor of approx. 5%.
									return [
										{
											name   : 'version',
											length : 4,
											type   : 'Uint8'
										},
										{
											name   : 'double',
											length : 8,
											type   : 'Raw'
										}
									];
								break;
								case 1069: // (Photoshop CS2) Layer Selection ID(s). 2 bytes count, following is repeated for each count: 4 bytes layer ID
									return [
										{
											name   : 'count',
											length : 2,
											type   : 'Uint8'
										},
										{
											name   : 'layerIds',
											repeat : 'count',
											length : function(section){
												return 4 * section.get('count').getValue();
											},
											type   : 'SectionArray',
											children : [
												{
													name   : 'id',
													length : 4,
													type   : 'Uint8'
												}
											]
										}
									];
								break;
								case 1072: // (Photoshop CS2) Layer Group(s) Enabled ID. 1 byte for each layer in the document, repeated by length of the resource. NOTE: Layer groups have start and end markers
									return [
										{
											name   : 'id',
											length : 1,
											type   : 'Uint8'
										}
									];
								break;
								case 1082: // (Photoshop CS5) Print Information. 4 bytes (descriptor version = 16), Descriptor (see See Descriptor structure) Information about the current print settings in the document. The color management options.
									return [
										{
											name   : 'version',
											length : 4,
											type   : 'Uint8'
										},
										{
											name   : 'descriptor',
											type   : 'Raw'
										}
									];
								break;
								case 1083: // (Photoshop CS5) Print Style. 4 bytes (descriptor version = 16), Descriptor (see See Descriptor structure) Information about the current print style in the document. The printing marks, labels, ornaments, etc.
									return [
										{
											name   : 'version',
											length : 4,
											type   : 'Uint8'
										},
										{
											name   : 'descriptor',
											type   : 'Raw'
										}
									];
								break;
								case 10000: // Print flags information. 2 bytes version ( = 1), 1 byte center crop marks, 1 byte ( = 0), 4 bytes bleed width value, 2 bytes bleed width scale.
									return [
										{
											name   : 'version',
											length : 2,
											type   : 'Uint8'
										},
										{
											name   : 'centerCropMarks',
											length : 1,
											type   : 'Uint8'
										},
										{
											name   : 'zero',
											length : 1,
											type   : 'Uint8'
										},
										{
											name   : 'bleedWidthValue',
											length : 4,
											type   : 'Uint8'
										},
										{
											name   : 'bleedWidthScale',
											length : 2,
											type   : 'Uint8'
										}
									];
								break;
							}
							return [
								{
									name   : 'data',
									type   : 'Raw'
								}
							];
						}
					},
					{
						name   : 'padded',
						length : function(section){
							return section.get('dataLength').getValue() % 2;
						},
						type   : 'Raw'
					}
				]
			}
		]
	},
	{
		name : 'LayerAndMaskInformationSection',
		type   : 'Section',
		children : [
			{
				name   : 'length',
				length : 4,
				type   : 'Uint8'
			},
			{
				name     : 'LayerInfo',
				type     : 'Section',
				children : [
					{
						name   : 'length',
						length : 4,
						type   : 'Uint8'
					},
					{
						name   : 'layerCount',
						length : 2,
						type   : 'Int8'
					},
					{
						name   : 'LayerRecords',
						type   : 'SectionArray',
						repeat : 'layerCount',
						children : [
							{
								name   : 'rectangle',
								length : 4 * 4,
								type   : 'Section',
								children : [
									{
										name   : 'top',
										length : 4,
										type   : 'Uint8'
									},
									{
										name   : 'left',
										length : 4,
										type   : 'Uint8'
									},
									{
										name   : 'bottom',
										length : 4,
										type   : 'Uint8'
									},
									{
										name   : 'right',
										length : 4,
										type   : 'Uint8'
									}
								]
							},
							{
								name   : 'channels',
								length : 2,
								type   : 'Uint8'
							},
							{
								name   : 'ChannelInformation',
								length : function(section){
									return 6 * section.get('channels').getValue();
								},
								type   : 'SectionArray',
								repeat : 'channels',
								children : [
									{
										name   : 'channelId',
										length : 2,
										type   : 'Int8'
									},
									{
										name   : 'lengthChannelData',
										length : 4,
										type   : 'Uint8'
									},
								]
							},
							{
								name   : 'blendModeSignature',
								length : 4,
								type   : 'String'
							},
							{
								name   : 'blendModeKey',
								length : 4,
								type   : 'String'
							},
							{
								name   : 'opacity',
								length : 1,
								type   : 'Uint8'
							},
							{
								name   : 'clipping',
								length : 1,
								type   : 'Uint8'
							},
							{
								name   : 'flags',
								length : 1,
								type   : 'Uint8'
							},
							{
								name   : 'filler',
								length : 1,
								type   : 'Uint8'
							},
							{
								name   : 'extraLength',
								length : 4,
								type   : 'Uint8'
							},
							{
								name   : 'LayerMaskData',
								type   : 'Section',
								children : [
									{
										name   : 'length',
										length : 4,
										type   : 'Uint8'
									},
									{
										name   : 'rectangle',
										length : function(section){
											if (section.get('length').getValue()) {
												return 4 * 4;
											} else {
												return 0;
											}
										},
										type   : 'Section',
										children : [
											{
												name   : 'top',
												length : 4,
												type   : 'Uint8'
											},
											{
												name   : 'left',
												length : 4,
												type   : 'Uint8'
											},
											{
												name   : 'bottom',
												length : 4,
												type   : 'Uint8'
											},
											{
												name   : 'right',
												length : 4,
												type   : 'Uint8'
											}
										]
									},
									{
										name   : 'defaultColor',
										length : function(section){
											if (section.get('length').getValue()) {
												return 1;
											} else {
												return 0;
											}
										},
										type   : 'Uint8'
									},
									{
										name   : 'flags',
										length : function(section){
											if (section.get('length').getValue()) {
												return 1;
											} else {
												return 0;
											}
										},
										type   : 'Uint8'
									},
									{
										name   : 'maskParameters',
										length : function(section){
											if (section.get('flags').getValue() == 4) {
												return 1;
											} else {
												return 0;
											}
										},
										type   : 'Uint8'
									},
									{
										name   : 'maskParametersBitFlags',
										length : function(section){
											switch (section.get('maskParameters').getValue()) {
												case 0:
												case 2:
													return 1;
												break;
												case 1:
												case 3:
													return 8;
												break;
											}
										},
										type   : 'Uint8'
									},
									{
										name   : 'padding',
										length : function(section){
											if (section.get('length').getValue()) {
												return 2;
											} else {
												return 0;
											}
										},
										type   : 'Uint8'
									},
									{
										name   : 'realFlags',
										length : function(section){
											if (section.get('length').getValue()) {
												return 1;
											} else {
												return 0;
											}
										},
										type   : 'Uint8'
									},
									{
										name   : 'realUserMaskBackground',
										length : function(section){
											if (section.get('length').getValue()) {
												return 1;
											} else {
												return 0;
											}
										},
										type   : 'Uint8'
									},
									{
										name   : 'rectangle2',
										length : function(section){
											if (section.get('length').getValue()) {
												return 4 * 4;
											} else {
												return 0;
											}
										},
										type   : 'Section',
										children : [
											{
												name   : 'top',
												length : 4,
												type   : 'Uint8'
											},
											{
												name   : 'left',
												length : 4,
												type   : 'Uint8'
											},
											{
												name   : 'bottom',
												length : 4,
												type   : 'Uint8'
											},
											{
												name   : 'right',
												length : 4,
												type   : 'Uint8'
											}
										]
									}
								]
							},
							{
								name   : 'BlendingRanges',
								type   : 'Section',
								children : [
									{
										name   : 'length',
										length : 4,
										type   : 'Uint8'
									},
									{
										name   : 'grayBlendSource',
										length : 4,
										type   : 'Raw'
									},
									{
										name   : 'grayBlendDestinationRange',
										length : 4,
										type   : 'Raw'
									},
									{
										name   : 'Channels',
										length : function(section){
											return section.get('length').getValue()
												- section.get('grayBlendSource').length
												- section.get('grayBlendDestinationRange').length
											;
										},
										type   : 'SectionArray',
										children : [
											{
												name   : 'channelSourceRange',
												length : 4,
												type   : 'Raw'
											},
											{
												name   : 'channelDestinationRange',
												length : 4,
												type   : 'Raw'
											}
										]
									}
								]
							},
							{
								name   : 'nameLength',
								length : 1,
								type   : 'Uint8'
							},
							{
								name   : 'name',
								length : function(section){
									return section.get('nameLength').getValue() || 1;
								},
								type   : 'String',
								charset: 'sjis'
							},
							{
								name   : 'padded',
								length : function(section){
									return 4 - (section.get('nameLength').length + section.get('name').length) % 4;
								},
								type   : 'Raw'
							},
							{
								name     : 'AdditionalLayerInformation',
								type     : 'SectionArray',
								length   : function(section){
									return section.get('extraLength').getValue()
										- section.get('LayerMaskData').length
										- section.get('BlendingRanges').length
										- section.get('nameLength').length
										- section.get('name').length
										- section.get('padded').length
									;
								},
								children : [
									{
										name     : 'signature',
										length   : 4,
										type     : 'String'
									},
									{
										name     : 'key',
										length   : 4,
										type     : 'String'
									},
									{
										name     : 'dataLength',
										length   : 4,
										type     : 'Uint8'
									},
									{
										name     : 'data',
										length   : 'dataLength',
										type     : 'Raw'
									}
								]
							}
						]
					},
					{
						name     : 'channelImageData',
						length   : function(section){
							return section.get('length').getValue() - section.get('layerCount').length - section.get('LayerRecords').length;
						},
						type     : 'Section',
						children : [
							{
								name     : 'compressionMethod',
								length   : 2,
								type     : 'Uint8'
							},
							{
								name     : 'imageData',
								type     : 'Raw'
							}
						]
					}
				]
			},
			{
				name     : 'GlobalLayerMaskInfo',
				type     : 'Section',
				children : [
					{
						name   : 'length',
						length : 4,
						type   : 'Uint8'
					},
					{
						name   : 'overlayColorSpace',
						length : function(section){
							return section.get('length').getValue() ? 2 : 0;
						},
						type   : 'Raw'
					},
					{
						name   : 'colorComponents',
						length : function(section){
							return section.get('length').getValue() ? 8 : 0;
						},
						type   : 'Raw'
					},
					{
						name   : 'opacity',
						length : function(section){
							return section.get('length').getValue() ? 2 : 0;
						},
						type   : 'Uint8'
					},
					{
						name   : 'kind',
						length : function(section){
							return section.get('length').getValue() ? 1 : 0;
						},
						type   : 'Uint8'
					},
					{
						name   : 'filler',
						length : function(section){
							return section.get('length').getValue()
								?
									section.get('length').getValue()
									- section.get('colorSpace').length
									- section.get('colorComponents').length
									- section.get('opacity').length
									- section.get('kind').length
								:
									0
							;
						},
						type   : 'Raw'
					}
				]
			},
			{
				name     : 'AdditionalLayerInfo',
				type     : 'SectionArray',
				length   : 'remain',
				children : [
					{
						name     : 'signature',
						length   : 4,
						type     : 'String'
					},
					{
						name     : 'key',
						length   : 4,
						type     : 'String'
					},
					{
						name     : 'dataLength',
						length   : 4,
						type     : 'Uint8'
					},
					{
						name     : 'data',
						length   : 'dataLength',
						type     : 'Raw'
					}
				]
			}
		]
	},
	{
		name     : 'ImageDataSection',
		type     : 'Section',
		children : [
			{
				name     : 'compressionMethod',
				length   : 2,
				type     : 'Uint8'
			},
			{
				name     : 'imageData',
				type     : 'Raw'
			}
		]
	}
];
