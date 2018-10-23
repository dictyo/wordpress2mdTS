//Thanks to https://github.com/ytechie/wordpress-to-markdown/blob/master/convert.js
import {FileReader, FileWriter} from "./proto/IO";
import {Main} from "./main";
import * as path from "path";
import {Env} from "./proto/Env";

const ENV: Env = new Env();
const root = process.argv[2]; //linux-style win path, e.g. /c/tmp/...

ENV.add('OUT_PATH',root+"/md_generated");
ENV.add('IN_PATH', root+"/wp_xml/beitraege.xml");

// const root = path.dirname(require.main!.filename)+"/../../../..");

const main: Main = new Main(new FileReader(ENV.IN_PATH), new FileWriter(ENV.OUT_PATH));
const generatorPromise = main.init();
generatorPromise.then(generator => {
    while (generator.hasNext()){
        const item = generator.next().value;
        item.writeMarkdown();
    }
});