import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface PluginSettings {
	mySetting: string;
	exampleMacro: string;
	exampleMacroHotkey: string;
	exampleMacroToggled: boolean;
}

const DEFAULT_SETTINGS: PluginSettings = {
	mySetting: 'default',
	exampleMacro: "ß",
	exampleMacroHotkey: "ctrl+alt+l",
	exampleMacroToggled: true
}

export default class ObsidianMacrosPlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon("keyboard", "Obsidian Macros Welcome", () => {
			new Notice("Hello World :3");
			new Notice("If you're seeing this then I may have forgotten to delete it")
		});

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		
		this.addSettingTab(new SettingsTab(this.app, this));
		
		this.registerDomEvent(document, "keydown", (event: KeyboardEvent) => {
			if (this.settings.exampleMacroToggled) {
				statusBarItemEl.setText(`Pressed ${event.key}`);
				console.log("key", event);
			}
		})
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	console.log('click', evt);
		// 	statusBarItemEl.setText('Pasted {}');
		// });
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

		new Setting(containerEl)
			.setName("Macro Example")
			.setDesc("Example macro before customizability")
			.addText(text => text
				.setPlaceholder("Enter something to paste")
				.setValue(this.plugin.settings.exampleMacro)
				.onChange(async (value) => {
					this.plugin.settings.exampleMacro = value;
					await this.plugin.saveSettings();
				}))
			.addText(text => text
				.setPlaceholder("Enter a hotkey binding ('ctrl+shift+z' for example)")
				.setValue(this.plugin.settings.exampleMacroHotkey)
				.onChange(async (value) => {
					this.plugin.settings.exampleMacroHotkey = value;
					await this.plugin.saveSettings();
				}))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.exampleMacroToggled)
				.onChange(async (value) => {
					this.plugin.settings.exampleMacroToggled = value;
					await this.plugin.saveSettings();
				}));
	}
}
