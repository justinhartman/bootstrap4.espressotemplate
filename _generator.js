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
	var config             = generator.config || {};
	config.base            = config.base || 'starter';
	config.serverExtras    = !!config.serverExtras;
	config.ieTags          = (config.ieTags === undefined) ? true : !!config.ieTags;
	config.ga              = !!config.ga;
	config.ga_siteId       = config.ga ? config.ga_siteId || '' : undefined;

    // An array of templates that get the Popper.js script.
    var includePopper = [
        'starter',
        'jumbotron',
        'album',
        'pricing',
        'checkout',
        'product',
        'cover',
        'carousel',
        'blog',
        'dashboard'
    ];

    // An array of templates that get the Holder script.
    var includeHolder = [
        'album',
        'pricing',
        'checkout',
        'product',
        'carousel',
        'blog'
    ];

    // An array of templates that are excluded from getting jQuery and Bootstrap
    // scripts.
    var excludeScripts = [
        'grid',
        'signin'
    ];

	// Add common files from the Bootstrap folder.
	var boilerplateInputNode  = inputFolderNode.folderForPath('bootstrap');
	var boilerplateOutputNode = outputFolderNode.addFolderAtPath(
        boilerplateInputNode, './', OverwriteOnConflict
    );

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
		} else {
			currentNode = boilerplateInputNode.fileForPath(excludePath);
		}

		boilerplateOutputNode.excludeNode(currentNode);
	});

	// Add vendor script libraries
	function addVendorScript(vendorFileName) {
		if (vendorFileName) {
			var vendorInputFile = inputFolderNode.fileForPath(
                'vendor-scripts/' + vendorFileName
            );
			outputFolderNode.addFileAtPath(
                vendorInputFile,
                'js/vendor/' + vendorFileName,
                OverwriteOnConflict
            );
		}
	};

    // Add jQuery and Bootstrap to templates that are not in the excludeScripts
    // array.
    if (!excludeScripts.includes(config.base)) {
        addVendorScript(vendorScriptMap.bootstrap);
    	addVendorScript(vendorScriptMap.jquery);
    }

    // Add Popper to templates that are in the includePopper array.
	if (includePopper.includes(config.base)) {
		addVendorScript(vendorScriptMap.popper);
	}

    // Add Holder to templates that are in the includeHolder array.
	if (includeHolder.includes(config.base)) {
		addVendorScript(vendorScriptMap.holder);
	}

	// Add template styles
	var styleInputFolderNode = inputFolderNode.folderForPath(
        'templates/' + config.base
    );

	if (styleInputFolderNode !== null) {
		for (var i = 0, styleChildNodes = styleInputFolderNode.childNodes; i < styleChildNodes.length; i++) {
			var childNode     = styleChildNodes[i];
			var childNodePath = childNode.path.split('/').slice(2).join('/');

			if (childNode.type === FolderNode) {
				outputFolderNode.addFolderAtPath(childNode, childNodePath);
			} else {
				outputFolderNode.addFileAtPath(childNode, childNodePath);
			}
		}
	}

	// Translate our configuration to the index page
	var boilerplateIndexNode = outputFolderNode.fileForPath('index.html');

	if (boilerplateIndexNode !== null) {
		if (config.ieTags) {
			boilerplateIndexNode.assignVariable('ieTags', true);
		}

		if (config.ga) {
			boilerplateIndexNode.assignVariable('googleAnalytics', true);
		}

		if (config.ga_siteId) {
			boilerplateIndexNode.assignVariable(
                'googleAnalyticsSiteID', config.ga_siteId
            );
		}
	}

	return true;
};
