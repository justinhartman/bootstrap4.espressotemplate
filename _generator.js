var vendorScriptMap = {
	bootstrap: 				'bootstrap.min.js',
	jquery:					'jquery-slim.min.js',
    popper:                 'popper.min.js',
    anchor:                 'anchor.min.js',
    clipboard:              'clipboard.min.js',
    holder:                 'holder.min.js'

};

generator.applyToOutputNode = function(outputFolderNode, inputFolderNode) {

	// Read config and set default values
	var config = generator.config || {};
	config.base = config.base || 'starter';
	config.serverExtras = !!config.serverExtras;
	config.ieTags = (config.ieTags === undefined) ? true : !!config.ieTags;
	config.ga = !!config.ga;
	config.ga_siteId = config.ga ? config.ga_siteId || '' : undefined;

	// Add common files from Bootstrap folder.
	var boilerplateInputNode = inputFolderNode.folderForPath('bootstrap');
	var boilerplateOutputNode = outputFolderNode.addFolderAtPath(boilerplateInputNode, './', OverwriteOnConflict);

    var excludePaths = [
        'examples/',
        'js/'
    ];
	if (!config.serverExtras) {
		excludePaths = excludePaths.concat([
            '.htaccess',
            '.gitignore',
            '.gitattributes',
            '.editorconfig',
            'humans.txt',
            'robots.txt'
        ]);
	}

    if (!config.ieTags) {
        excludePaths = excludePaths.concat([
            'css/browser-upgrade.css'
        ]);
    }

	excludePaths.forEach(function(excludePath) {
		var currentNode = null;

		if (excludePath.slice(-1) === '/') {
			currentNode = boilerplateInputNode.folderForPath(excludePath);
		}
		else {
			currentNode = boilerplateInputNode.fileForPath(excludePath);
		}

		boilerplateOutputNode.excludeNode(currentNode);
	});

	// Add vendor script libraries
	function addVendorScript(vendorFileName) {
		if (vendorFileName) {
			var vendorInputFile = inputFolderNode.fileForPath('vendor-scripts/' + vendorFileName);
			outputFolderNode.addFileAtPath(vendorInputFile, 'js/vendor/' + vendorFileName, OverwriteOnConflict);
		}
	};

    if (config.base !== 'grid') {
        addVendorScript(vendorScriptMap.bootstrap);
    	addVendorScript(vendorScriptMap.jquery);
    }

	if (config.base === 'starter' || config.base === 'jumbotron' || config.base === 'album' || config.base === 'pricing' || config.base === 'checkout' || config.base === 'product' || config.base === 'cover' || config.base === 'carousel') {
		addVendorScript(vendorScriptMap.popper);
	}

    if (config.base === 'album' || config.base === 'pricing' || config.base === 'checkout' || config.base === 'product' || config.base === 'carousel') {
		addVendorScript(vendorScriptMap.holder);
	}

	// Add template styles
	var styleInputFolderNode = inputFolderNode.folderForPath('templates/' + config.base);

	if (styleInputFolderNode !== null) {
		for (var i = 0, styleChildNodes = styleInputFolderNode.childNodes; i < styleChildNodes.length; i++) {
			var childNode = styleChildNodes[i];
			var childNodePath = childNode.path.split('/').slice(2).join('/');

			if (childNode.type === FolderNode) {
				outputFolderNode.addFolderAtPath(childNode, childNodePath);
			}
			else {
				outputFolderNode.addFileAtPath(childNode, childNodePath);
			}
		}
	}

	// Translate our configuration to the index page
	var boilerplateIndexNode = outputFolderNode.fileForPath('index.html');

	if (boilerplateIndexNode !== null) {
		// boilerplateIndexNode.assignVariable(config.polyfill, 'true');

		if (config.ieTags) {
			boilerplateIndexNode.assignVariable('ieTags', true);
		}

		if (config.ga) {
			boilerplateIndexNode.assignVariable('googleAnalytics', true);
		}

		if (config.ga_siteId) {
			boilerplateIndexNode.assignVariable('googleAnalyticsSiteID', config.ga_siteId);
		}
	}

	return true;
};
