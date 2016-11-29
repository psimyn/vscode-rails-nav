'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { dirname, join, basename } from 'path';
//import * as inf from 'inflection';

enum FileType {
    Controller = 1,
    Model,
    Layout,
    View,
    Helper,
    Javascript,
    StyleSheet,
    Rspec,
    Test
}

class RailsHelper {
    private fileName: String;
    private filePath: String;
    private fileType: FileType;
    private filePatten: String;
    public constructor(file_path: String, file_name: String) {
        this.fileName = file_name;
        this.filePath = file_path;
        this.dectFileType();
    }

    private paths = [
        "app/controllers",
        "app/models",
        "app/views",
        "app/views/layouts",
        "app/helpers",
        "app/assets/javascripts",
        "app/assets/stylesheets",
    ];

    private patterns = [
        "app/controllers/PTN*",
        "app/models/PTN*",
        "app/views/PTN/**",
        "app/views/layouts/PTN*",
        "app/helpers/PTN*",
        "app/assets/javascripts/PTN*",
        "app/assets/javascripts/PTN/**",
        "app/assets/stylesheets/PTN*",
        "app/assets/stylesheets/PTN/**",
    ]


    public searchPaths() {
        var res = [];
        this.patterns.forEach(e => {
            var p = e.replace("PTN", this.filePatten.toString());
            res.push(p);
        });
        return res;
    }
    private dectFileType() {
        if (this.filePath.indexOf("app/controllers/") >= 0) {
            this.fileType = FileType.Controller
            this.filePatten = this.fileName.replace(/_controller\.rb$/, "");
        } else if (this.filePath.indexOf("app/models/") >= 0) {
            this.fileType = FileType.Model
            //TODO singleure to 
            this.filePatten = this.fileName.replace(/\.rb$/, "");
        } else if (this.filePath.indexOf("app/views/layouts/") >= 0) {
            this.fileType = FileType.Layout
            this.filePatten = this.fileName.replace(/\..*?\..*?$/, "");
        } else if (this.filePath.indexOf("app/views/") >= 0) {
            this.fileType = FileType.View
            this.filePatten = this.filePath.replace("app/views/", '').replace(/\/$/, '');
        } else if (this.filePath.indexOf("app/helpers/") >= 0) {
            this.fileType = FileType.Helper
            this.filePatten = this.fileName.replace(/_helper\.rb$/, "");
        } else if (this.filePath.indexOf("app/assets/javascripts/") >= 0) {
            this.fileType = FileType.Javascript
            this.filePatten = this.fileName.replace(/\.js$/, "").replace(/\..*?\..*?$/, "");
        } else if (this.filePath.indexOf("app/assets/stylesheets/") >= 0) {
            this.fileType = FileType.StyleSheet
            this.filePatten = this.fileName.replace(/\.css$/, "").replace(/\..*?\..*?$/, "");
        } else if (this.filePath.indexOf("/spec/") >= 0) {
            this.fileType = FileType.Rspec
        } else if (this.filePath.indexOf("/test/") >= 0) {
            this.fileType = FileType.Test
        }
    }

    public items = [];
    private gen_list(arr: Array<String>) {
        var cur = arr.pop();

        var _self = this;
        vscode.workspace.findFiles(cur.toString(), null).then((res) => {
            res.forEach(i => {
                var fn = vscode.workspace.asRelativePath(i);
                //var pic = { label: fn, detail: "c: ${fn}" };
                _self.items.push(fn);
            });
            if (arr.length > 0) {
                _self.gen_list(arr);
            }
            else {
                this.showQuickPick(_self.items);
            }
        });

    }

    public showQuickPick(items: any) {
        const p = vscode.window.showQuickPick(items, { placeHolder: "Select File", matchOnDetail: true });
        p.then(value => {
            const fn = vscode.Uri.parse('file://' + join(vscode.workspace.rootPath, value));
            vscode.workspace.openTextDocument(fn).then(doc => {
                return vscode.window.showTextDocument(doc);
            });
        })
    }

    public showFileList(paths: Array<String>) {
        return this.gen_list(paths.slice())
    }
}



// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "rails" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.rails', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        //vscode.window.showInformationMessage('Hello World!');

        var relativeFileName = vscode.workspace.asRelativePath(vscode.window.activeTextEditor.document.fileName);
        var fileName = basename(relativeFileName);
        var filePath = dirname(relativeFileName) + "/";

        var rh = new RailsHelper(filePath, fileName);

        //var item = []
        var res = rh.showFileList(rh.searchPaths());

        /*
        rh.searchPaths().forEach(e => {
            //var pic = { label: e, detail: "c: ${e}" };
            //item.push(pic);
            item.push(e);
        });
        var res = vscode.workspace.findFiles("app/views/items/**", null).then((res) => {
            //vscode.window.showInformationMessage(res[0].toString());
            res.forEach(i => {
                var fn = vscode.workspace.asRelativePath(i);
                var pic = { label: fn, detail: "c: ${fn}" };
                item.push(fn);
            });
            return item;
        });
        */
        //vscode.window.showQuickPick(item, { placeHolder: "Select Action", matchOnDetail: true });
        //vscode.window.showQuickPick(rh.items, { placeHolder: "Select Action", matchOnDetail: true });
    });

    context.subscriptions.push(disposable);
}
// this method is called when your extension is deactivated
export function deactivate() {
}