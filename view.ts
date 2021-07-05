import { EventRef, ItemView, Vault, Workspace, WorkspaceLeaf, TFile, TAbstractFile } from 'obsidian';
import { VIEW_TYPE_PROVISIONS } from './constants';

export default class ProvisionsView extends ItemView {
	linkedLeaf: WorkspaceLeaf;
	vault: Vault;
	workspace: Workspace;
	emptyDiv: HTMLDivElement

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
		this.vault = this.app.vault;
		this.workspace = this.app.workspace;

	}

	getViewType(): string {
		return VIEW_TYPE_PROVISIONS;
	}

	getDisplayText(): string {
		return "Provisions";
	}
	
	async onOpen(): Promise<void> {
		console.log('we have opened a window maybe');
		
		// set up the provisions view workspace
		let {contentEl} = this;	
		var board = contentEl.createDiv();
		board.addClass('provisions-board');

		// grab all the files so we can find things later
		const allFiles = await this.app.vault.getAllLoadedFiles();

		const pantryFileContents = await this.app.vault.adapter.read('Pantry.md');
		// Parse the contents of the pantry file
		const lines = pantryFileContents.split('\n');

		let color = '.misc';
		let imagePath = '';
	
		for (let line of lines) {
			switch( line.charAt(0)) {
				case '':
					break;
				case '#':
					switch (line.charAt(3)) {
						case 'L':
							// replace these with classes in the css file
							color = '.leftovers';
							break;
						case 'P':
							color = '.protein';
							break;
						case 'V':
							color = '.veg';
							break;
						case 'C':
							color = '.carbs';
							break;
						case 'F':
							color = '.fruit';
							break;
						case 'S':
							color = '.seasoning';
							break;
					}
					break;
				case 'F':
					color = '.freezer';
					break;
				case '-':
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
						if (imagePath) console.log(imagePath);

						var imageBubble = board.createDiv();
						imageBubble.addClass('draggable-bubble');
						var image = contentEl.createEl('img');
						image.src = this.vault.adapter.getResourcePath(imagePath);
						//let imageFileObj = this.app.vault.getAbstractFileByPath(imagePath);
						imageBubble.appendChild(image);
						break;
					}
			}

/*
			var bubble2 = board.createDiv();
			bubble2.addClass('draggable-bubble');
			var image2 = contentEl.createEl('img');
			image2.src = 'media/chimichurri.png';
			bubble2.appendChild(image2);
			//testDiv.removeClass('test');
*/
		
		}
	}
}
