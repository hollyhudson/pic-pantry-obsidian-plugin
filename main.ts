/*
Refrigerator by Kieu Thi Kim Cuong from the Noun Project
*/

import { App, Vault, Modal, Notice, Plugin, PluginSettingTab, Setting, addIcon, TFile, TAbstractFile, WorkspaceLeaf } from 'obsidian';
import { VIEW_TYPE_PROVISIONS } from './constants';
import ProvisionsView from './view';

interface ProvisionsViewSettings {
	mySetting: string;
}

/*
const DEFAULT_SETTINGS: ProvisionsViewSettings = {
	mySetting: 'default'
}
*/

export default class ProvisionsViewPlugin extends Plugin {
	//settings: ProvisionsViewSettings;
	private view: ProvisionsView;

	onunload(): void {
		this.app.workspace
			.getLeavesOfType(VIEW_TYPE_PROVISIONS)
			.forEach((leaf) => leaf.detach());
	}

	async onload() {
		console.log('loading Provisions View plugin');

		//await this.loadSettings();

		this.addRibbonIcon(
			'fridge',
			'Provisions View',
			this.makeProvisionsView
		);

		this.addStatusBarItem().setText('Status Bar Text');

		this.addCommand({
			id: 'provisions-view',
			name: 'Open Provisions View',
			callback: this.makeProvisionsView,
		});

		//this.addSettingTab(new SampleSettingTab(this.app, this));

		this.registerCodeMirror((cm: CodeMirror.Editor) => {
			console.log('codemirror', cm);
		});

		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

		this.registerView(
			VIEW_TYPE_PROVISIONS,
			(leaf: WorkspaceLeaf) => (this.view = new ProvisionsView(leaf))
		);
	}


	makeProvisionsView = async () => {

		this.initLeaf();

		// grab all the files so we can find things later
		const allFiles = await this.app.vault.getAllLoadedFiles();

		const pantryFileContents = await this.app.vault.adapter.read('Pantry.md');
		// Parse the contents of the pantry file
		const lines = pantryFileContents.split('\n');
		
		let color = 'grey';

		for (let line of lines) {
			switch (line.charAt(0)) {
				case '':
					break;
				case '#':
					switch (line.charAt(3)) {
						case 'L':
							// replace these with classes in the css file
							color = 'white';
							break;
						case 'P':
							color = 'blue';
							break;
						case 'V':
							color = 'green';
							break;
						case 'C':
							color = 'orange';
							break;
						case 'F':
							color = 'purple';
							break;
						case 'S':
							color = 'red';
							break;
					}
					break;
				case 'F':
					color = 'grey';
					break;
				case '-':
					let imagePath = '';
					if (line.charAt(3) == 'x') break;
			
					// extract the ingredient file name
					let ingredient = line.replace('- [ ] [[', '');
					ingredient = ingredient.replace(']]', '');	
					
					// find the file
					// because not all ingredients are in the pantry folder
					let ingredientFileContents = '';
					for (let currentFile of allFiles) {
						if (!currentFile.hasOwnProperty('basename')) continue;
						if (currentFile.basename == ingredient) {
							ingredientFileContents = await this.app.vault.adapter.read(currentFile.path);
						}
					}
					
					//extract the image file path from the ingredient file
					if (ingredientFileContents) {
						let ingredientLines = ingredientFileContents.split('\n');
						if (ingredientLines[0].charAt(0) != '!') break;
						let imageFileName = ingredientLines[0].replace('![[', '');
						imageFileName = imageFileName.replace(']]', '');
						imagePath = 'media/'.concat(imageFileName);
					}

					if (imagePath) console.log(imagePath);
					break;
			}
		}
	};

		
	initLeaf(): void {
		if (this.app.workspace.getLeavesOfType(VIEW_TYPE_PROVISIONS).length > 0) {
			return;
		}
		console.log("setting view state");
		this.app.workspace.getRightLeaf(true).setViewState({
			type: VIEW_TYPE_PROVISIONS,
		});
	}

/*
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
*/
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		let {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		let {contentEl} = this;
		contentEl.empty();
	}
}

/*
class SampleSettingTab extends PluginSettingTab {
	plugin: ProvisionsView;

	constructor(app: App, plugin: ProvisionsView) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue('')
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
*/

addIcon(
	'fridge', `<path fill="currentColor" stroke="currentColor" d="M28.9,1.4h-10c-4.7,0-8.5,3.8-8.5,8.5v34c0,0.8,0.7,1.5,1.5,1.5h24.1c0.8,0,1.5-0.7,1.5-1.5v-34C37.4,5.2,33.7,1.4,28.9,1.4  z M35.9,44.3h-24c-0.3,0-0.5-0.2-0.5-0.5v-23h25.1V44C36.4,44.1,36.2,44.3,35.9,44.3z M36.4,19.8h-25V9.9c0-4.1,3.4-7.5,7.5-7.5H29  c4.1,0,7.5,3.4,7.5,7.5v9.9H36.4z"/><path d="M14.6,12.9c-0.3,0-0.5,0.2-0.5,0.5v4c0,0.3,0.2,0.5,0.5,0.5s0.5-0.2,0.5-0.5v-4C15.1,13.1,14.9,12.9,14.6,12.9z"/><path d="M14.6,22.6c-0.3,0-0.5,0.2-0.5,0.5v4c0,0.3,0.2,0.5,0.5,0.5s0.5-0.2,0.5-0.5v-4C15.1,22.9,14.9,22.6,14.6,22.6z"/><path d="M13.9,46.5c0.3,0,0.5-0.2,0.5-0.5s-0.2-0.5-0.5-0.5h-1.3c-0.3,0-0.5,0.2-0.5,0.5s0.2,0.5,0.5,0.5H13.9z"/><path d="M35.2,46.5c0.3,0,0.5-0.2,0.5-0.5s-0.2-0.5-0.5-0.5h-1.3c-0.3,0-0.5,0.2-0.5,0.5s0.2,0.5,0.5,0.5H35.2z"/>`);
