moduleAid.VERSION = '1.0.0';

this.__defineGetter__('mainWindow', function() { return $('main-window'); });
this.__defineGetter__('gBrowser', function() { return window.gBrowser; });
this.__defineGetter__('browser', function() { return $('browser'); });
this.__defineGetter__('browserPanel', function() { return $('browser-panel'); });
this.__defineGetter__('contentDocument', function() { return (gBrowser.mCurrentBrowser.contentDocument) ? gBrowser.mCurrentBrowser.contentDocument : null; });
this.getComputedStyle = function(el) { return window.getComputedStyle(el); };

this.moveTopStyle = {
	maxWidth: 0,
	left: 0,
	top: 0
};
this.lwthemeImage = null;
this.MIN_LEFT = 20;
this.MIN_RIGHT = 30;

this.browserPanelResized = function() {
	timerAid.init('browserPanelResized', function() {
		dispatch(browserPanel, { type: 'browserPanelResized', cancelable: false });
	}, 0);
};

this.delayMoveTop = function() {
	timerAid.init('delayMoveTop', moveTop, 0);
};

// Handles the position of the findbar
this.moveTop = function() {
	if(gFindBar.hidden) { return; }
	
	// If the 'layer' attribute isn't removed the findbar will lockup constantly (I have no idea what this attribute does though...)
	//findbartweak.bottombox.removeAttribute('layer');
	
	moveTopStyle = {};
	var computedStyle = {
		findbar: 	getComputedStyle(gFindBar),
		//bottombox: getComputedStyle($('browser-bottombox')),
		appcontent: getComputedStyle($('appcontent')),
		borderend: getComputedStyle($('browser-border-end')),
		navigatortoolbox: getComputedStyle($('navigator-toolbox')),
		browser: getComputedStyle(browser)
	};
	
	// Determining the position of the Findbar is a pain...
	var doneAppContent = false;
	moveTopStyle.maxWidth = -MIN_RIGHT -MIN_LEFT;
	moveTopStyle.left = MIN_LEFT;
	
	// Compatibility with TreeStyleTab
	if($('TabsToolbar').getAttribute('treestyletab-tabbar-position') == 'left') {
		moveTopStyle.left += $('TabsToolbar').clientWidth;
	} else if($('TabsToolbar').getAttribute('treestyletab-tabbar-position') == 'right') {
		moveTopStyle.maxWidth -= $('TabsToolbar').clientWidth;
	}
	
	for(var i=0; i<browser.childNodes.length; i++) {
		if(browser.childNodes[i].id != 'appcontent') {
			if(browser.childNodes[i].nodeName == 'splitter') { continue; }
			
			// Compatibility with OmniSidebar
			if((browser.childNodes[i].classList.contains('sidebar-box') && browser.childNodes[i].getAttribute('renderabove'))
			|| browser.childNodes[i].classList.contains('omnisidebar_switch')) { continue; }
			
			// AiOS sets 'direction' property to 'rtl' when sidebar is on the right;
			// this accounts for that and for anything else that might do the same
			if(computedStyle.browser.getPropertyValue('direction') == 'ltr' || doneAppContent) {
				moveTopStyle.left += browser.childNodes[i].clientWidth;
				moveTopStyle.left += parseFloat(getComputedStyle(browser.childNodes[i]).getPropertyValue('border-left-width'));
				moveTopStyle.left += parseFloat(getComputedStyle(browser.childNodes[i]).getPropertyValue('border-right-width'));
			}
		} else {
			moveTopStyle.maxWidth += $('appcontent').clientWidth;
			moveTopStyle.maxWidth += parseFloat(computedStyle.appcontent.getPropertyValue('border-left-width'));
			moveTopStyle.maxWidth += parseFloat(computedStyle.appcontent.getPropertyValue('border-right-width'));
			
			// Always account for the scrollbar wether it's visible or not
			/*moveTopStyle.reachedBorder = true;
			if(gBrowser.mCurrentBrowser.contentDocument.documentElement.scrollHeight > gBrowser.mCurrentBrowser.contentDocument.documentElement.clientHeight) {
				moveTopStyle.maxWidth -= SCROLLBAR_WIDTH;
				moveTopStyle.reachedBorder = false;
			}*/
			
			/* Don't forget this part afterwards
			if(panel._hasHighlightGrid
			&& !grid.hasAttribute('hidden')
			&& !prefAid.gridInScrollbar) {
				moveTopStyle.maxWidth -= grid.getAttribute('width');
				if(!splitter.hasAttribute('hidden')) {
					moveTopStyle.maxWidth -= 4;
				}
				//moveTopStyle.reachedBorder = false;
			}*/
			
			// It never reaches the border because it always compensates for the scrollbar,
			// so I'm commenting this part, if I change my mind later I'll always have this here
			/*if(moveTopStyle.reachedBorder && browser.childNodes[i+1].id == 'browser-border-end') {
				moveTopStyle.maxWidth += $('browser-border-end').clientWidth;
				moveTopStyle.maxWidth += parseFloat(computedStyle.borderend.getPropertyValue('border-left-width'));
				moveTopStyle.maxWidth += parseFloat(computedStyle.borderend.getPropertyValue('border-right-width'));
				
				if(mainWindow.getAttribute('sizemode') != 'normal') {
					moveTopStyle.maxWidth += parseFloat(computedStyle.findbar.getPropertyValue('border-right-width'));
				}
			}*/
			
			if(computedStyle.browser.getPropertyValue('direction') == 'ltr') {
				break;
			}
			
			doneAppContent = true;
		}
	}
			
	moveTopStyle.top = -1; // Move the find bar one pixel up so it covers the toolbox borders, giving it a more seamless look
	if(mainWindow.getAttribute('sizemode') != 'fullscreen') {
		if($('titlebar')) {				
			moveTopStyle.top += $('titlebar').clientHeight;
			moveTopStyle.top += parseFloat(getComputedStyle($('titlebar')).getPropertyValue('margin-bottom'));
		}	
	}
	else if($('fullscr-toggler').getAttribute('collapsed') != 'true') {
		moveTopStyle.top += $('fullscr-toggler').clientHeight;
	}
	moveTopStyle.top += $('navigator-toolbox').clientHeight;
	moveTopStyle.top += parseFloat(computedStyle.navigatortoolbox.getPropertyValue('border-top-width'));
	moveTopStyle.top += parseFloat(computedStyle.navigatortoolbox.getPropertyValue('border-bottom-width'));
	moveTopStyle.top += parseFloat(computedStyle.navigatortoolbox.getPropertyValue('margin-top'));
	
	// Unload current stylesheet if it's been loaded
	styleAid.unload('topFindBar');
	styleAid.unload('topFindBarCorners');
	
	var sscode = '/*FindBar Tweak CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("chrome://browser/content/browser.xul") {\n';
	sscode += '	#FindToolbar[movetotop] {\n';
	sscode += '		max-width: ' + moveTopStyle.maxWidth + 'px;\n';
	sscode += '		left: ' + moveTopStyle.left + 'px;\n';
	sscode += '		top: ' + moveTopStyle.top + 'px;\n';
	sscode += '	}';
	sscode += '}';
	
	styleAid.load('topFindBar', sscode, true);
	
	if(gFindBar.scrollLeftMax > 0) {
		var sscode = '/*FindBar Tweak CSS declarations of variable values*/\n';
		sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
		sscode += '@-moz-document url("chrome://browser/content/browser.xul") {\n';
		sscode += '	#FindToolbar[movetotop]:after {\n';
		sscode += '		margin-left: -' + gFindBar.scrollLeftMax + 'px;\n';
		sscode += '	}';
		sscode += '}';
		styleAid.load('topFindBarCorners', sscode, true);
	}
	
	// Bugfix (a bit ugly, I know) to force the corners to redraw on changing tabs or resizing windows
	var sscode = '/*FindBar Tweak CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("chrome://browser/content/browser.xul") {\n';
	sscode += '	#FindToolbar[movetotop]:before, #FindToolbar[movetotop]:after { display: none; }\n';
	sscode += '}';
	styleAid.load('tempRedrawBorders', sscode, true);
	aSync(function() {
		styleAid.unload('tempRedrawBorders');
	}, 10);
	
	findPersonaPosition();
};

this.findPersonaPosition = function() {
	if(mainWindow.getAttribute('lwtheme') != 'true') {
		prefAid.lwthemebgImage = '';
		prefAid.lwthemebgWidth = 0;
		prefAid.lwthemecolor = '';
		prefAid.lwthemebgColor = '';
		stylePersonaFindBar();
		return;
	}
	
	var windowStyle = window.getComputedStyle(mainWindow);
	if(prefAid.lwthemebgImage != windowStyle.getPropertyValue('background-image') && windowStyle.getPropertyValue('background-image') != 'none') {
		prefAid.lwthemebgImage = windowStyle.getPropertyValue('background-image');
		prefAid.lwthemecolor = windowStyle.getPropertyValue('color');
		prefAid.lwthemebgColor = windowStyle.getPropertyValue('background-color');
		prefAid.lwthemebgWidth = 0;
		
		lwthemeImage = new window.Image();
		lwthemeImage.onload = function() { findPersonaWidth(); };
		lwthemeImage.src = prefAid.lwthemebgImage.substr(5, prefAid.lwthemebgImage.length - 8);
		return;
	}
	
	stylePersonaFindBar();
};

this.findPersonaWidth = function() {
	if(prefAid.lwthemebgWidth == 0 && lwthemeImage.naturalWidth != 0) {
		prefAid.lwthemebgWidth = lwthemeImage.naturalWidth;
	}
	
	if(prefAid.lwthemebgWidth != 0) {
		stylePersonaFindBar();
	}
};

this.stylePersonaFindBar = function() {
	// Unload current stylesheet if it's been loaded
	styleAid.unload('personaFindBar');
	
	if(prefAid.lwthemebgImage != '') {
		var sscode = '/*FindBar Tweak CSS declarations of variable values*/\n';
		sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
		sscode += '@-moz-document url("chrome://browser/content/browser.xul") {\n';
		sscode += '	#FindToolbar[movetotop]  {\n';
		sscode += '	  background-image: ' + prefAid.lwthemebgImage + ' !important;\n';
		sscode += '	  background-color: ' + prefAid.lwthemecolor + ' !important;\n';
		sscode += '	  color: ' + prefAid.lwthemecolor + ' !important;\n';
		// I have no idea where does the -1 come from, it's not the findbars own border
		sscode += '	  background-position: ' + (-moveTopStyle.left - (prefAid.lwthemebgWidth - mainWindow.clientWidth) -1) + 'px ' + (-moveTopStyle.top) + 'px !important;\n';
		sscode += '	  background-repeat: repeat !important;\n';
		sscode += '	  background-size: auto auto !important;\n';
		sscode += '	}\n';
		
		// There's just no way I can have rounded corners with personas
		sscode += '	#FindToolbar[movetotop]:before, #FindToolbar[movetotop]:after { display: none !important; }\n';
		
		sscode += '}';
		
		styleAid.load('personaFindBar', sscode, true);
	}
};

// Prevent the FindBar from being visible in chrome pages like the add-ons manager
this.hideOnChrome = function() {
	// Bugfix for Tree Style Tab (and possibly others): findbar is on the background after uncollapsing
	// So we do all this stuff aSync, should allow the window to repaint
	timerAid.init('hideOnChrome', function() {
		var beforeState = gFindBar.collapsed;
		hideIt(gFindBar, 
			$('cmd_find').getAttribute('disabled') != 'true'
			// Need to set this separately apparently, the find bar would only hide when switching to this tab after having been loaded, not upon loading the tab
			&& gBrowser.mCurrentBrowser.currentURI.spec != 'about:config'
			// No need to show the findbar in Speed Dial's window, it already had a display bug at startup which I already fixed, I'm preventing more bugs this way
			&& gBrowser.mCurrentBrowser.currentURI.spec != 'chrome://speeddial/content/speeddial.xul'
		);
		
		// Sometimes switching to the add-ons manager and then back to another tab, the find bar would be poorly positioned
		if(gFindBar.collapsed != beforeState) {
			moveTop();
		}
	}, 0);
};

this.hideOnChromeContentLoaded = function(e) {
	// this is the content document of the loaded page.
	var doc = e.originalTarget;
	if(doc instanceof window.HTMLDocument) {
		// is this an inner frame?
		// Find the root document:
		while(doc.defaultView.frameElement) {
			doc = doc.defaultView.frameElement.ownerDocument;
		}
		
		if(doc == contentDocument) {
			hideOnChrome();
		}
	}
};

// Tab progress listeners, handles opening and closing of pages and location changes
this.hideOnChromeProgressListener = {
	onLocationChange: function(aBrowser, webProgress, request, location) {
		// Frames don't need to trigger this
		if(webProgress.DOMWindow == aBrowser.contentWindow) {
			hideOnChromeHandleBrowser(aBrowser, 100);
		}
	},
	
	// Mostly handles some necessary browser tags
	onProgressChange: function(aBrowser, webProgress, request, curSelfProgress, maxSelfProgress, curTotalProgress, maxTotalProgress) {
		hideOnChromeHandleBrowser(aBrowser, curTotalProgress);
	}
};

this.hideOnChromeHandleBrowser = function(aBrowser, curTotalProgress) {
	// I found the > 3 to be the best value for comparison ( coming from onProgressChange() for aboutBlankCollapse() ), from a lot of trial and errors tests
	if(aBrowser == gBrowser.mCurrentBrowser && curTotalProgress > 3) {
		hideOnChrome();
	}
};

this.hideOnChromeAttrWatcher = function(obj, prop, oldVal, newVal) {
	if(oldVal != newVal) {
		hideOnChrome();
	}
};

moduleAid.LOADMODULE = function() {
	// We need this to be first to "remove" the findbar from the bottombox so we can use correct values below
	gFindBar.setAttribute('movetotop', 'true');
	
	listenerAid.add(browserPanel, 'resize', browserPanelResized);
	listenerAid.add(gFindBar, 'OpenedFindBar', moveTop);
	listenerAid.add(gFindBar, "UpdatedStatusFindBar", moveTop);
	
	// Register all opened tabs with a listener
	gBrowser.addTabsProgressListener(hideOnChromeProgressListener);
	listenerAid.add(gBrowser.tabContainer, "TabSelect", hideOnChrome, false);
	listenerAid.add(gBrowser, "DOMContentLoaded", hideOnChromeContentLoaded, false);
	objectWatcher.addAttributeWatcher($('cmd_find'), 'disabled', hideOnChromeAttrWatcher);
	
	// Reposition the findbar when the window resizes
	listenerAid.add(browserPanel, "browserPanelResized", delayMoveTop, false);
	
	// Compatibility with LessChrome HD
	listenerAid.add(window, "LessChromeShown", moveTop, false);
	listenerAid.add(window, "LessChromeHidden", moveTop, false);
	
	observerAid.add(findPersonaPosition, "lightweight-theme-changed");
	
	moveTop();
	hideOnChrome();
};

moduleAid.UNLOADMODULE = function() {
	observerAid.remove(findPersonaPosition, "lightweight-theme-changed");
	
	listenerAid.remove(browserPanel, "browserPanelResized", delayMoveTop, false);
	
	// Compatibility with LessChrome HD
	listenerAid.remove(window, "LessChromeShown", moveTop, false);
	listenerAid.remove(window, "LessChromeHidden", moveTop, false);
	
	objectWatcher.removeAttributeWatcher($('cmd_find'), 'disabled', hideOnChromeAttrWatcher);
	listenerAid.remove(gBrowser.tabContainer, "TabSelect", hideOnChrome, false);
	listenerAid.remove(gBrowser, "DOMContentLoaded", hideOnChromeContentLoaded, false);
	gBrowser.removeTabsProgressListener(hideOnChromeProgressListener);
	
	listenerAid.remove(gFindBar, 'OpenedFindBar', moveTop);
	listenerAid.remove(gFindBar, "UpdatedStatusFindBar", moveTop);
	listenerAid.remove(browserPanel, 'resize', browserPanelResized);
	
	gFindBar.removeAttribute('movetotop');
	
	if(UNLOADED || !prefAid.movetoTop) {
		styleAid.unload('personaFindBar');
		styleAid.unload('topFindBar');
	}
};
