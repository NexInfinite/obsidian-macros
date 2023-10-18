import { App, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface PluginSettings {
	mySetting: string;
	exampleMacro: {"value": string, "macroString": string, "macro": Array<String>, "enabled": boolean}
}

const DEFAULT_SETTINGS: PluginSettings = {
	mySetting: 'default',
	exampleMacro: {"value": "ß", "macroString": "ctrl+alt+l", "macro": ["ctrl", "alt", "left"], "enabled": true},
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
				if (this.keyPresses.length < 5) {
					this.keyPresses.push(event)
				} else {
					this.keyPresses.pop()
					this.keyPresses.push(event)
				}
				statusBarItemEl.setText(`Pressed ${event.key}`);
				console.log(this.keyPresses);
			}
		})
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
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
