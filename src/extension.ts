import * as vscode from "vscode";
import { focusedFolderTreeView, FolderAndFile } from "./focusedFolderTreeView";

export function activate(context: vscode.ExtensionContext) {
	const preCommandId = "rsl-vsc-focused-folder.focusedFolderView";
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
			vscode.commands.registerCommand(`${preCommandId}.focusFolder`, (args) => {
				//console.log(args, vscode.Uri.parse(args.fsPath));
				treeView.selectFolder(vscode.Uri.parse(args.fsPath));
			}),
			vscode.commands.registerCommand(`${preCommandId}.refresh`, (args) => {
				treeView.refresh();
			}),
			vscode.commands.registerCommand(`${preCommandId}.openFile`, (file) =>
				vscode.commands.executeCommand("vscode.open", file.resourceUri)
			),
		]
	);
}

export function deactivate() {}
