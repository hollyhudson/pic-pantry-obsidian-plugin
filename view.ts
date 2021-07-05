import { EventRef, ItemView, Vault, Workspace, WorkspaceLeaf, TFile, TAbstractFile } from 'obsidian';
import { VIEW_TYPE_PROVISIONS } from './constants';

export default class ProvisionsView extends ItemView {
	linkedLeaf: WorkspaceLeaf;
	vault: Vault;
	workspace: Workspace;
	emptyDiv: HTMLDivElement;

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
							color = 'leftovers';
							break;
						case 'P':
							color = 'protein';
							break;
						case 'V':
							color = 'veg';
							break;
						case 'C':
							color = 'carbs';
							break;
						case 'F':
							color = 'fruit';
							break;
						case 'S':
							color = 'seasoning';
							break;
					}
					break;
				case 'F':
					color = 'freezer';
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
						imageBubble.addClass(color);
						var image = contentEl.createEl('img');
						image.src = this.vault.adapter.getResourcePath(imagePath);
						if (image.width > image.height) {
							image.addClass('landscape');
						} else {
							image.addClass('portrait');
						}
						imageBubble.appendChild(image);
						break;
					}
			}
		}

		board.querySelectorAll(".draggable-bubble")
			.forEach((dragItem) => addDrag(dragItem));

		function addDrag(dragItem) {
			let active = false;
			let currentX: number;
			let currentY: number;
			let initialX: number;
			let initialY: number;
			let xOffset: number = 0;
			let yOffset: number = 0;

			dragItem.addEventListener("touchstart", dragStart, false);
			dragItem.addEventListener("touchend", dragEnd, false);
			dragItem.addEventListener("touchmove", drag, false);

			dragItem.addEventListener("mousedown", dragStart, false);
			dragItem.addEventListener("mouseup", dragEnd, false);
			dragItem.addEventListener("mousemove", drag, false);
		
			function dragStart(e) {
				if (e.type === "touchstart") {
					initialX = e.touches[0].clientX - xOffset;
					initialY = e.touches[0].clientY - yOffset;
				} else {
					initialX = e.clientX - xOffset;
					initialY = e.clientY - yOffset;
				}
	
				active = true;
			}
	
			function dragEnd(e) {
				initialX = currentX;
				initialY = currentY;
	
				active = false;
			}
	
			function drag(e) {
				if (!active) return;
   		
				e.preventDefault();
      	
				if (e.type === "touchmove") {
					currentX = e.touches[0].clientX - initialX;
					currentY = e.touches[0].clientY - initialY;
				} else {
					currentX = e.clientX - initialX;
					currentY = e.clientY - initialY;
				}
	
				xOffset = currentX;
				yOffset = currentY;
		
				setTranslate(currentX, currentY, dragItem);
			}
	
			function setTranslate(xPos: number, yPos: number, el) {
				el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
			}
		}
	}
}
