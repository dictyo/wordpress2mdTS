import {Main} from "../../src/main";
import {FileReader, FileWriter, StringReader} from "../../src/proto/IO";
import {LOG} from "../../src/proto/Logging";
import * as path from "path";


describe('Plain text', () => {
    it("can't be parsed", () => {
        const out: Main = new Main(new StringReader("test"), new FileWriter(""));
        return out.init()
            .catch(reason => expect(reason.toString()).toContain('Non-whitespace before'));
    });
});

describe('Wordpress-XML', () => {
    const wpStub = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\n" +
        "<rss version=\"2.0\"\n" +
        "     xmlns:excerpt=\"http://wordpress.org/export/1.2/excerpt/\"\n" +
        "     xmlns:content=\"http://purl.org/rss/1.0/modules/content/\"\n" +
        "     xmlns:wfw=\"http://wellformedweb.org/CommentAPI/\"\n" +
        "     xmlns:dc=\"http://purl.org/dc/elements/1.1/\"\n" +
        "     xmlns:wp=\"http://wordpress.org/export/1.2/\"\n" +
        ">\n" +
        "    <channel>\n" +
        "\n" +
        "        <wp:author>\n" +
        "            <wp:author_id>1</wp:author_id>\n" +
        "        </wp:author>\n" +
        "\n" +
        "\n" +
        "        <generator>https://wordpress.org/?v=4.9.3</generator>" +
        "    </channel>\n" +
        "</rss>\n" +

        it('can be  parsed (stub)', () => {
            const out: Main = new Main(
                new FileReader(path.resolve(__dirname)+"/../data-samples/beitrag.xml"),
                new FileWriter(path.resolve(__dirname)+"/../tmp"));
            return out.init()
                .then(postGenerator => {
                    const numberOfPosts = postGenerator.posts.length;
                    expect(numberOfPosts).toBe(0);
                })
                .catch(reason => LOG.error(reason.toString()));
        });
});

describe('Wordpress-posts', () => {
    const out: Main = new Main(
        new FileReader(path.resolve(__dirname)+"/../data-samples/beitrag.xml"),
        new FileWriter(path.resolve(__dirname)+"/../tmp"));
    const generatorPomise = out.init();

    it('can be  parsed (one)', () => {
            generatorPomise.then(generator => {
                const item = generator.next().value;
                expect(item.id).toBeGreaterThan(0);
                expect(item.title).toBeTruthy();
                //breaking the promise-chain knowingly
                item.createPostContents()
                    .then(md => {
                        LOG.info("\n" + md);
                        expect(md).toBeTruthy();
                    })
                    .catch(reason => LOG.error(reason.toString()));
                item.writeMarkdown();
            });
    });
    it('can be  parsed (many)', () => {
        generatorPomise.then(generator => {
            while (generator.hasNext()){
                const item = generator.next().value;
                expect(item.id).toBeGreaterThan(0);
                expect(item.title).toBeTruthy();
                //breaking the promise-chain knowingly
                item.createPostContents()
                    .then(md => {
                        LOG.info("\n" + md);
                        expect(md).toBeTruthy();
                    })
                    .catch(reason => LOG.error(reason.toString()));
                item.writeMarkdown();
            }
        });
    });

});