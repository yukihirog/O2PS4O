function PSD(array){
	this.data = {};
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
							switch (section.get('id').getValue()) {
								case 1000:
									// (Obsolete--Photoshop 2.0 only ) Contains five 2-byte values: number of channels, rows, columns, depth, and mode
									return 'Section';
								break;
								case 1005:
									// ResolutionInfo structure. See Appendix A in Photoshop API Guide.pdf.
									return 'Raw';
								break;
								case 1011:
									// Print flags. A series of one-byte boolean values (see Page Setup dialog): labels, crop marks, color bars, registration marks, negative, flip, interpolate, caption, print flags.
									return 'Section';
								break;
								case 1013:
									// Color halftoning information
									return 'Raw';
								break;
								case 1016:
									// Color transfer functions
									return 'Raw';
								break;
								case 1024:
									// Layer state information. 2 bytes containing the index of target layer (0 = bottom layer).
									return 'Uint8';
								break;
								case 1026:
									// Layers group information. 2 bytes per layer containing a group ID for the dragging groups. Layers in a group have the same group ID.
									return 'SectionArray';
								break;
								case 1032:
									// (Photoshop 4.0) Grid and guides information. See See Grid and guides resource format.
									return 'Section';
								break;
								case 1033:
									// (Photoshop 4.0) Thumbnail resource for Photoshop 4.0 only. See See Thumbnail resource format.
									return 'Section';
								break;
								case 1036:
									// (Photoshop 5.0) Thumbnail resource (supersedes resource 1033). See See Thumbnail resource format.
									return 'Section';
								break;
								case 1037:
									// (Photoshop 5.0) Global Angle. 4 bytes that contain an integer between 0 and 359, which is the global lighting angle for effects layer. If not present, assumed to be 30.
									return 'Uint8';
								break;
								case 1039:
									// (Photoshop 5.0) ICC Profile. The raw bytes of an ICC (International Color Consortium) format profile. See ICC1v42_2006-05.pdf in the Documentation folder and icProfileHeader.h in Sample Code\Common\Includes .
									return 'Raw';
								break;
								case 1044:
									// (Photoshop 5.0) Document-specific IDs seed number. 4 bytes: Base value, starting at which layer IDs will be generated (or a greater value if existing IDs already exceed it). Its purpose is to avoid the case where we add layers, flatten, save, open, and then add more layers that end up with the same IDs as the first set.
									return 'Uint8';
								break;
								case 1049:
									// (Photoshop 6.0) Global Altitude. 4 byte entry for altitude
									return 'Uint8';
								break;
								case 1050:
									// (Photoshop 6.0) Slices. See See Slices resource format.
									return 'Section';
								break;
								case 1054:
									// (Photoshop 6.0) URL List. 4 byte count of URLs, followed by 4 byte long, 4 byte ID, and Unicode string for each count.
									return 'Section';
								break;
								case 1057:
									// (Photoshop 6.0) Version Info. 4 bytes version, 1 byte hasRealMergedData , Unicode string: writer name, Unicode string: reader name, 4 bytes file version.
									return 'Section';
								break;
								case 1058:
									// (Photoshop 7.0) EXIF data 1. See http://www.kodak.com/global/plugins/acrobat/en/service/digCam/exifStandard2.pdf
									return 'Raw';
								break;
								case 1060:
									// (Photoshop 7.0) XMP metadata. File info as XML description. See http://www.adobe.com/devnet/xmp/
									return 'String';
								break;
								case 1061:
									// (Photoshop 7.0) Caption digest. 16 bytes: RSA Data Security, MD5 message-digest algorithm
									return 'Raw';
								break;
								case 1062:
									// (Photoshop 7.0) Print scale. 2 bytes style (0 = centered, 1 = size to fit, 2 = user defined). 4 bytes x location (floating point). 4 bytes y location (floating point). 4 bytes scale (floating point)
									return 'Section';
								break;
								case 1064:
									// (Photoshop CS) Pixel Aspect Ratio. 4 bytes (version = 1 or 2), 8 bytes double, x / y of a pixel. Version 2, attempting to correct values for NTSC and PAL, previously off by a factor of approx. 5%.
									return 'Section';
								break;
								case 1069:
									// (Photoshop CS2) Layer Selection ID(s). 2 bytes count, following is repeated for each count: 4 bytes layer ID
									return 'Section';
								break;
								case 1072:
									// (Photoshop CS2) Layer Group(s) Enabled ID. 1 byte for each layer in the document, repeated by length of the resource. NOTE: Layer groups have start and end markers
									return 'SectionArray';
								break;
								case 1082:
									// (Photoshop CS5) Print Information. 4 bytes (descriptor version = 16), Descriptor (see See Descriptor structure) Information about the current print settings in the document. The color management options.
									return 'Section';
								break;
								case 1083:
									// (Photoshop CS5) Print Style. 4 bytes (descriptor version = 16), Descriptor (see See Descriptor structure) Information about the current print style in the document. The printing marks, labels, ornaments, etc.
									return 'Section';
								break;
								case 1084:
									// (Photoshop CS5) Macintosh NSPrintInfo. Variable OS specific info for Macintosh. NSPrintInfo. It is recommened that you do not interpret or use this data.
									return 'Raw';
								break;
								case 10000:
									// Print flags information. 2 bytes version ( = 1), 1 byte center crop marks, 1 byte ( = 0), 4 bytes bleed width value, 2 bytes bleed width scale.
									return 'Section';
								break;
							}
							return 'Raw';
						},
						children : function(section){
							switch (section.get('id').getValue()) {
								case 1000:
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
								case 1011:
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
								case 1026:
									return [
										{
											name   : 'groupId',
											length : 2,
											type   : 'Uint8'
										}
									];
								break;
								case 1032:
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
								case 1033:
								case 1036:
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
								case 1050:
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
								case 1054:
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
								case 1057:
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
								case 1062:
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
								case 1064:
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
								case 1069:
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
								case 1072:
									return [
										{
											name   : 'id',
											length : 1,
											type   : 'Uint8'
										}
									];
								break;
								case 1082:
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
								case 1083:
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
								case 10000:
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
							return null;
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
