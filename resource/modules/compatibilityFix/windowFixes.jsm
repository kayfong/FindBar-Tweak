/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 1.1.25

Modules.LOADMODULE = function() {
	if(!viewSource && !FITFull) {
		AddonManager.getAddonByID('autopager@mozilla.org', function(addon) {
			Modules.loadIf('compatibilityFix/autopager', (addon && addon.isActive));
		});

		AddonManager.getAddonByID('{73a6fe31-595d-460b-a920-fcc0f8843232}', function(addon) {
			Modules.loadIf('compatibilityFix/noScript', (addon && addon.isActive));
		});

		AddonManager.getAddonByID('{c07d1a49-9894-49ff-a594-38960ede8fb9}', function(addon) {
			Modules.loadIf('compatibilityFix/UpdateScanner', (addon && addon.isActive));
		});

		AddonManager.getAddonByID("unloadtab@firefox.ext", function(addon) {
			Modules.loadIf('compatibilityFix/UnloadTab', (addon && addon.isActive));
		});

		AddonManager.getAddonByID("{d3c46ca0-999d-11da-a72b-0800200c9a66}", function(addon) {
			Modules.loadIf('compatibilityFix/autoUnloadTab', (addon && addon.isActive));
		});

		Modules.load('compatibilityFix/InstantFox');
		Modules.load('compatibilityFix/theFoxOnlyBetter');
	}

	AddonManager.getAddonByID('clearfields@alex.alexander.googlepages.com', function(addon) {
		Modules.loadIf('compatibilityFix/ClearFields', (addon && addon.isActive));
	});

	AddonManager.getAddonByID('findlist@fewlinx.com', function(addon) {
		Modules.loadIf('compatibilityFix/findlist', (addon && addon.isActive));
	});

	AddonManager.getAddonByID('vimperator@mozdev.org', function(addon) {
		Modules.loadIf('compatibilityFix/vimperator', (addon && addon.isActive));
	});
};

Modules.UNLOADMODULE = function() {
	Modules.unload('compatibilityFix/vimperator');
	Modules.unload('compatibilityFix/findlist');
	Modules.unload('compatibilityFix/ClearFields');

	Modules.unload('compatibilityFix/autoUnloadTab');
	Modules.unload('compatibilityFix/UnloadTab');
	Modules.unload('compatibilityFix/UpdateScanner');
	Modules.unload('compatibilityFix/noScript');
	Modules.unload('compatibilityFix/autopager');
	Modules.unload('compatibilityFix/InstantFox');
	Modules.unload('compatibilityFix/theFoxOnlyBetter');
};
