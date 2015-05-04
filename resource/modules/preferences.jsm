Modules.VERSION = '1.4.0';

this.inPreferences = true;

this.previewSights = function(box, style) {
	Modules.load('sights');
	
	var bSights = sights.get();
	if(!bSights.groups) { bSights.groups = new Map(); }
	
	// Hide the current sights
	sights.remove(bSights, 0);
	
	var dimensions = box.getBoundingClientRect();
	sights.build(
		{ sights: bSights },
		{
			group: 0,
			centerX: dimensions.left +(dimensions.width /2),
			centerY: dimensions.top +(dimensions.height /2),
			current: true,
			style: style
		}
	);
};

this.resetNativePrefs = function() {
	Prefs.reset('typeaheadfind');
	Prefs.reset('timeout');
	Prefs.reset('prefillwithselection');
	Prefs.reset('eat_space_to_next_word');
	Prefs.reset('stop_at_punctuation');
	Prefs.reset('textHighlightForeground');
	Prefs.reset('textHighlightBackground');
	Prefs.reset('textSelectForeground');
	Prefs.reset('textSelectBackgroundAttention');
	
	$('pref-typeaheadfind').value = $('pref-typeaheadfind').valueFromPreferences;
	$('pref-timeout').value = $('pref-timeout').valueFromPreferences;
	$('pref-FAYTprefill').value = $('pref-FAYTprefill').valueFromPreferences;
	$('pref-layoutEatSpaces').value = $('pref-layoutEatSpaces').valueFromPreferences;
	$('pref-layoutStopAtPunctuation').value = $('pref-layoutStopAtPunctuation').valueFromPreferences;
	$('pref-highlightColor').value = $('pref-highlightColor').valueFromPreferences;
	$('pref-selectColor').value = $('pref-selectColor').valueFromPreferences;
};

this.openReleaseNotesTab = function(aWindow) {
	aWindow.gBrowser.selectedTab = aWindow.gBrowser.addTab('about:'+objPathString);
	aWindow.gBrowser.selectedTab.loadOnStartup = true; // for Tab Mix Plus
};

this.openReleaseNotes = function(e) {
	if(e.type == 'click' && e.which != 1) { return; }
	if(e.type == 'keypress' && e.keycode != e.DOM_VK_RETURN) { return; }
	
	if(window.opener && window.opener instanceof window.opener.ChromeWindow && window.opener.gBrowser) {
		openReleaseNotesTab(window.opener);
	} else {
		Windows.callOnMostRecent(openReleaseNotesTab, 'navigator:browser');
	}
	
	e.preventDefault();
	e.stopPropagation();
};

Modules.LOADMODULE = function() {
	fillVersion($('addonVersion'));
	
	Listeners.add($('releaseNotesLink'), 'keypress', openReleaseNotes, true);
	Listeners.add($('releaseNotesLink'), 'click', openReleaseNotes, true);
};

Modules.UNLOADMODULE = function() {
	Modules.unload('sights');
};
