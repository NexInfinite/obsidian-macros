import { App, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

let MAX_KEYS_STORED = 5

interface MacroSetting {
	value: string,
	macroString: string,
	macro: Array<String>,
	enabled: boolean
}

interface PluginSettings {
	exampleMacro: MacroSetting
}

const SETTINGS: PluginSettings = {
	exampleMacro: {value: "agh", macroString: "ctrl+shift+alt", macro: ["ctrl", "shift", "alt"], enabled: true},
}

export default class ObsidianMacrosPlugin extends Plugin {
	settings: PluginSettings;
	keyPresses: Array<KeyboardEvent>

	async onload() {
		console.log("LOADED OBSIDIAN MACROS");
		console.log("PRIVACY NOTICE: This plugin can see your last keypresses but everything is stored locally!")

		await this.loadSettings();
		this.addSettingTab(new SettingsTab(this.app, this));
		const statusBarItemEl = this.addStatusBarItem();
		
		this.addRibbonIcon("keyboard", "Obsidian Macros Welcome", () => {
			new Notice("Hello World :3");
			new Notice("If you're seeing this then I may have forgotten to delete it")
		});
		
		this.keyPresses = []
		this.registerDomEvent(document, "keydown", (event: KeyboardEvent) => {
			if (this.settings.exampleMacro.value) {
				if (this.keyPresses.length < MAX_KEYS_STORED) {
					this.keyPresses.push(event)
				} else {
					this.keyPresses.shift()
					this.keyPresses.push(event)
				}

				checkMacroMatch(this.settings.exampleMacro.macro, this.keyPresses);
				console.log(this.keyPresses);
			}
		})
	}

	async loadSettings() {
		this.settings = Object.assign({}, SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SettingsTab extends PluginSettingTab {
	plugin: ObsidianMacrosPlugin;

	constructor(app: App, plugin: ObsidianMacrosPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();

		let heading = document.createElement("h1");
		let help = document.createElement("p");
		heading.innerHTML = "Macros";
		help.innerHTML = "NOTE: Max macro amount is 5 keys";
		help.style.fontSize = "1rem";
		help.style.color = "orangered";
		containerEl.appendChild(heading);
		containerEl.appendChild(help);

		new Setting(containerEl)
			.setName("Macro Example")
			.setDesc("Example macro before customizability")
			.addText(text => text
				.setPlaceholder("Enter something to paste")
				.setValue(this.plugin.settings.exampleMacro.value)
				.onChange(async (value) => {
					this.plugin.settings.exampleMacro.value = value;
					await this.plugin.saveSettings();
				}))
			.addText(text => text
				.setPlaceholder("Enter a hotkey binding ('ctrl+shift+z' for example)")
				.setValue(this.plugin.settings.exampleMacro.macroString)
				.onChange(async (value) => {
					this.plugin.settings.exampleMacro.macroString = value;
					this.plugin.settings.exampleMacro.macro = value.split("+");
					await this.plugin.saveSettings();
				}))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.exampleMacro.enabled)
				.onChange(async (value) => {
					this.plugin.settings.exampleMacro.enabled = value;
					await this.plugin.saveSettings();
				}));
	}
}

function checkMacroMatch(macro: Array<String>, keyHistory: KeyboardEvent[]) {
	for (let key = 0; key < keyHistory.length; key++) {
		if (keyHistory.length - key >= macro.length) {
			let valid = true;
			for (let macroKey = 0; macroKey < macro.length; macroKey++) {
				if (macro[macroKey].toLowerCase() != keyHistory[key + macroKey].key.toLowerCase()) {
					valid = false;
					break;
				}
			}
			if (valid) 
				return true;
		}
	}
	return false;
}