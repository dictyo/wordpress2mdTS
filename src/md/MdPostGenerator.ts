import * as fs from "fs-extra";
import * as mustache from "mustache";
import TurndownService = require("turndown");
import {LOG} from "../proto/Logging";
import * as path from "path";
import {FileWriter} from "../proto/IO";


export interface WordpressRss {
    rss: {
        channel: Array<{
            item: WordpressPost[];
        }>
    };
}

interface WordpressPost {
    title: string[];
    link: string[];
    ["excerpt:encoded"]: string[];
    guid: Array<{
        _: string;
        $: string;
    }>;
    ["wp:post_name"]: string[];
    ["wp:post_date"]: string[];
    category: Array<{
        _: string;
        $: {
            domain: string;
            nicename: string;
        };
    }>;
    ["content:encoded"]: string[];        //content:encoded
}

class MdPost {
    fileWriter: FileWriter;
    id: number;             //id
    name: string;           //'wp:post_name'
    slug: string;           //link
    title: string;
    teaser: string;         //excerpt:encoded
    pubDate: string;        //wp:post_date
    categories: string[];   //category domain="category"
    tags: string[];         //category domain="post_tag"
    content: string;        //content:encoded
    author: string;
    primarySlugCategory: string;
    // postContents?: Promise<string>;

    //"Daniel Tea";

    constructor(wp: WordpressPost, toMarkdown: TurndownService, fileWriter: FileWriter) {
        this.fileWriter = fileWriter;
        this.id = this.extractId(wp.guid);
        this.name = wp["wp:post_name"][0];
        LOG.info(`Creating new Post ${this.id}: ${this.name}`);
        this.title = wp.title[0];
        this.author = "Daniel Tea";
        this.teaser = wp["excerpt:encoded"][0];
        this.pubDate = wp["wp:post_date"][0];
        const categories = wp.category
            .filter(value => value.$.domain === "category");
        this.primarySlugCategory = categories[0].$.nicename;
        this.categories = categories.map(value => value._);
        this.tags =
            wp.category
                .filter(value => value.$.domain === "post_tag")
                .map(value => value._);
        this.content = toMarkdown.turndown(wp["content:encoded"][0]);
        this.slug = this.primarySlugCategory+"/"+this.name;

    }

    private extractId(theGuid: Array<{ _: string; $: string }>): number {
        const guid = theGuid[0]._;
        const id: RegExpMatchArray = guid.match(/^.*\?p=(\d+)$/) || [];
        return (id.length > 1) ? Number(id[1]) : 0;
    }

    protected createPostContents(): Promise<string> {
        // if (!!this.postContents) throw new Error("Wrong program flow!");
        return this.renderTemplate()
            .then(contents => {
                return contents.replace(/\r\n/g, "\n");
            });
        // return this.postContents;
    }
//         //Fix characters that markdown doesn't like
//         // smart single quotes and apostrophe
//         markdown = markdown.replace(/[\u2018|\u2019|\u201A]/g, "\'");
//         // smart double quotes
//         markdown = markdown.replace(/&quot;/g, "\"");
//         markdown = markdown.replace(/[\u201C|\u201D|\u201E]/g, "\"");
//         // ellipsis
//         markdown = markdown.replace(/\u2026/g, "...");
//         // dashes
//         markdown = markdown.replace(/[\u2013|\u2014]/g, "-");
//         // circumflex
//         markdown = markdown.replace(/\u02C6/g, "^");
//         // open angle bracket
//         markdown = markdown.replace(/\u2039/g, "<");
//         markdown = markdown.replace(/&lt;/g, "<");
//         // close angle bracket
//         markdown = markdown.replace(/\u203A/g, ">");
//         markdown = markdown.replace(/&gt;/g, ">");
//         // spaces
//         markdown = markdown.replace(/[\u02DC|\u00A0]/g, " ");
//         // ampersand
//         markdown = markdown.replace(/&amp;/g, "&");

    writeMarkdown(){
        this.createPostContents()
            .then(postContents => {
                const filename = this.name+".md";
                LOG.info(`Writing file ${path.join(this.primarySlugCategory,filename)}`);
                this.fileWriter.write(this.primarySlugCategory, filename, postContents);
            });
    }

    protected renderTemplate(): Promise<string> {
        return fs.readFile(
            __dirname + "/md_template.mustache",
            'UTF-8')
            .then((template: string) => {
                return mustache.render(template, this);
            })
            .catch(reason => {
                LOG.error(reason.toString());
                throw new Error("Error reading the template.");
            });
    }
}
export class MdPostGenerator implements Iterator<MdPost> {
    toMarkdown: TurndownService = new TurndownService();
    fileWriter: FileWriter;
    posts: WordpressPost[] = [];
    initialised = false;

    constructor(fileWriter: FileWriter) {
        this.fileWriter = fileWriter;
    }

    init(xml: WordpressRss) {
      this.posts = xml.rss.channel[0].item || 0;
      this.initialised = true;
    }

    hasNext(): boolean {
        if (! this.initialised) throw Error ("MdPostGenerator must be initialized calling init.");
        return this.posts.length > 0;
    }

    protected getNext(): IteratorResult<MdPost> {
        if (! this.initialised) throw Error ("MdPostGenerator must be initialized calling init.");
        if (this.posts.length > 1) {
            return {
                done: false,
                value: new MdPost(this.posts.pop()!, this.toMarkdown, this.fileWriter)
            };
        } else {
            return {
                done: true,
                value: new MdPost(this.posts.pop()!, this.toMarkdown, this.fileWriter)
            };
        }
    }

    next(value?: any): IteratorResult<MdPost> {
        return this.getNext();
    }

    return(value?: any): IteratorResult<MdPost> {
        return this.getNext();
    }

    throw(e?: any): IteratorResult<MdPost> {
        throw e;
    }
}