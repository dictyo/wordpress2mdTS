//Thanks to https://github.com/ytechie/wordpress-to-markdown/blob/master/convert.js
import {Parser} from 'xml2js';
import {ContentProvider, FileWriter} from "./proto/IO";
import {LOG} from "./proto/Logging";
import {WordpressRss, MdPostGenerator} from "./md/MdPostGenerator";

export class Main {
    contentProvider: ContentProvider;
    postGenerator: MdPostGenerator;

    constructor(provider: ContentProvider, fileWriter: FileWriter) {
        this.contentProvider = provider;
        this.postGenerator = new MdPostGenerator(fileWriter);
    }


    init(){
        return this.contentProvider.getContent()
            .then(content => this.parseXML(content))
            .then(posts => {
                this.postGenerator.init(posts);
                return this.postGenerator;
            })
            .catch(e => {throw Error(e);});
    }

    protected parseXML(content: string): Promise<WordpressRss> {
        return new Promise((resolve, reject) => {
            const parser: Parser = new Parser();
            parser.parseString(content, (err: Error, result: WordpressRss) => {
                if (err) return reject(err);

                LOG.info('Parsing XML...');
                resolve(result);
            });
        });
    }
}