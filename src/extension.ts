import * as vscode from "vscode";
import { focusedFolderTreeView, FolderAndFile } from "./focusedFolderTreeView";

export function activate(context: vscode.ExtensionContext) {
	const preCommandId = "rsl-vsc-focused-folder.focusedFolderView";
	const treeView = new focusedFolderTreeView(vscode.workspace.workspaceFolders);

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
			vscode.commands.registerCommand(
				`${preCommandId}.openFile`,
				async (file: FolderAndFile) => {
					try {
						await vscode.window.showTextDocument(file.resourceUri);
					} catch (error) {
						vscode.window.showErrorMessage(
							"Focused Folder Extensions not yet support opened this file type"
						);
					}
				}
			),
		]
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}
