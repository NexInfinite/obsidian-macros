import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface PluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
	mySetting: 'default'
}

export default class ObsidianMacrosPlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon("dice", "Greet", () => {
			new Notice("Hello World :3");
			new Notice("If you're seeing this then I may have forgotten to delete it")
		});

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		
		this.addSettingTab(new SettingsTab(this.app, this));
		
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
			statusBarItemEl.setText('Pasted {}');
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
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
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
