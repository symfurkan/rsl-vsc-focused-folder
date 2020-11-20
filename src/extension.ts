import * as vscode from "vscode";
import { focusedFolderTreeView } from "./focusedFolderTreeView";

export function activate(context: vscode.ExtensionContext) {
	const treeView = new focusedFolderTreeView(
		context,
		vscode.workspace.workspaceFolders
	);

	vscode.window.registerTreeDataProvider("focusedFolderView", treeView);
	context.subscriptions.push(
		...[
			vscode.commands.registerCommand(
				"focusedFolderView.focusFolder",
				(args) => {
					treeView.selectFolder(vscode.Uri.parse(args.path));
				}
			),
			vscode.commands.registerCommand("focusedFolderView.refresh", (args) => {
				treeView.refresh();
			}),
			vscode.commands.registerCommand("focusedFolderView.openFile", (file) =>
				vscode.commands.executeCommand("vscode.open", file.resourceUri)
			),
		]
	);
}

export function deactivate() {}
