import * as fs from "fs-extra";
import * as path from 'path';
import {LOG} from "./Logging";

export class FileWriter {
    outpath: string;
    constructor(outpath: string) {
        this.outpath = outpath;
        this._createPath(this.outpath);
    }

    write(subdir: string, filename: string, md: string) {
        const thePath = path.join(this.outpath, subdir);
        this._createPath(thePath);
        fs.writeFileSync(path.join(thePath, filename), md, "utf-8");
    }

    _createPath(path: string): void {
        if (!fs.pathExistsSync(path)) {
            fs.mkdirSync(path);
        }
    }
}

export class FileReader implements ContentProvider {
    inpath: string;

    constructor(inpath: string) {
        this.inpath = path.normalize(inpath);
        fs.pathExists(this.inpath).then(exists => {if (!exists) {throw new Error("No InPath: " + this.inpath);}});
    }

    getContent(): Promise<string> {
        return fs.readFile(this.inpath, "UTF-8");
    }
}

export class StringReader implements ContentProvider {
    input: Promise<string>;

    constructor(input: string) {
        this.input = Promise.resolve(input);
    }

    getContent(): Promise<string> {
        return this.input;
    }
}

export interface ContentProvider {
    getContent(): Promise<string>;
}