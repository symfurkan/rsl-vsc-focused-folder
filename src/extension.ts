import * as vscode from "vscode";
import { focusedFolderTreeView } from "./focusedFolderTreeView";

export function activate(context: vscode.ExtensionContext) {
	const treeView = new focusedFolderTreeView(
		context,
		vscode.workspace.workspaceFolders
	);

	vscode.window.registerTreeDataProvider(
		"rsl-vsc-focused-folder.focusedFolderView",
		treeView
	);
	context.subscriptions.push(
		...[
			vscode.commands.registerCommand(`focusFolder`, (args) => {
				//console.log(args, vscode.Uri.parse(args.fsPath));
				treeView.selectFolder(vscode.Uri.parse(args.fsPath));
			}),
			vscode.commands.registerCommand(`refresh`, (args) => {
				treeView.refresh();
			}),
			vscode.commands.registerCommand(`openFile`, (file) =>
				vscode.commands.executeCommand("vscode.open", file.resourceUri)
			),
		]
	);
}

export function deactivate() {}
