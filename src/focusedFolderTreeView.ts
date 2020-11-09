import * as vscode from "vscode";

export class focusedFolderTreeView
	implements vscode.TreeDataProvider<FolderAndFile> {
	private _onDidChangeTreeData: vscode.EventEmitter<
		FolderAndFile | undefined | void
	> = new vscode.EventEmitter<FolderAndFile | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<
		FolderAndFile | undefined | void
	> = this._onDidChangeTreeData.event;
	private settings: {
		lastFocusOnLoad: boolean | undefined;
		lastFocused: string | undefined;
	} = {
		lastFocusOnLoad: false,
		lastFocused: "",
	};
	private selectedFolder?: vscode.Uri;
	constructor(
		private extensionContext: vscode.ExtensionContext,
		private workspaceRoot: readonly vscode.WorkspaceFolder[] | undefined
	) {
		this.getSettings();
		if (this.settings.lastFocusOnLoad && this.settings.lastFocused) {
			this.selectFolder(vscode.Uri.parse(this.settings.lastFocused));
		}
	}

	private getSettings() {
		this.settings = {
			lastFocusOnLoad: vscode.workspace
				.getConfiguration("focusedFolder")
				.get("lastFocusOnLoad"),
			lastFocused: this.workspaceRoot
				? this.extensionContext.workspaceState.get(
						"rsl-vsc-focused-folder.lastFocused"
				  )
				: this.extensionContext.globalState.get(
						"rsl-vsc-focused-folder.lastFocused"
				  ),
		};
	}

	private setLastFocused(uri: string) {
		if (this.workspaceRoot) {
			this.extensionContext.workspaceState.update(
				"rsl-vsc-focused-folder.lastFocused",
				uri
			);
		} else {
			this.extensionContext.globalState.update(
				"rsl-vsc-focused-folder.lastFocused",
				uri
			);
		}
	}

	private async recursiveFolder(uri: vscode.Uri) {
		const folderArray = await vscode.workspace.fs.readDirectory(uri);
		return folderArray
			.sort((a, b) => b[1] - a[1])
			.map((item) => {
				const [name, type] = item;
				const isDirectory =
					type === vscode.FileType.Directory
						? vscode.TreeItemCollapsibleState.Collapsed
						: vscode.TreeItemCollapsibleState.None;
				return new FolderAndFile(
					name,
					isDirectory,
					vscode.Uri.joinPath(uri, "/" + name)
				);
			});
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	async selectFolder(uri: vscode.Uri) {
		this.selectedFolder = uri;
		this.setLastFocused(uri.fsPath);
		//console.log(await vscode.workspace.fs.stat(uri));
		//console.log(await vscode.workspace.fs.readDirectory(uri));
		this.refresh();
	}

	async getTreeItem(element: FolderAndFile): Promise<vscode.TreeItem> {
		return element;
	}
	async getChildren(element?: FolderAndFile): Promise<FolderAndFile[]> {
		if (element) {
			return this.recursiveFolder(element.resourceUri);
		} else {
			return this.selectedFolder
				? this.recursiveFolder(this.selectedFolder)
				: Promise.resolve([]);
		}
	}
}

export class FolderAndFile extends vscode.TreeItem {
	resourceUri: vscode.Uri;
	command: vscode.Command = {
		arguments: [this],
		command: "rsl-vsc-focused-folder.focusedFolderView.openFile",
		title: this.label,
	};

	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		uri: vscode.Uri
	) {
		super(label, collapsibleState);
		this.tooltip = this.label;
		this.resourceUri = uri;
	}
}
