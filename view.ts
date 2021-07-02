import { EventRef, ItemView, Vault, Workspace, WorkspaceLeaf, TFile } from 'obsidian';
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
		let {contentEl} = this;	
		contentEl.setText('hello?');
		//testDiv.innerHTML = 'yo!';
		//testDiv.addClass('test');
		//testDiv.removeClass('test');
		
	}
}
