declare module "turndown" {
  class TurndownService {
    constructor(options?: IOptions)

    addRule(key: string, rule: IRule): this;
    keep(filter: Filter): this;
    remove(filter: Filter): this;
    use(plugins: Plugin | Plugin[]): this;

    turndown(html: string | Node): string;
  }

  interface IOptions {
    headingStyle?: "setext" | "atx";
    hr?: string;
    bulletListMarker?: "-" | "+" | "*";
    emDelimiter?: "_" | "*";
    codeBlockStyle?: "indented" | "fenced";
    fence?: "```" | "~~~";
    strongDelimiter?: "__" | "**";
    linkStyle?: "inlined" | "referenced";
    linkReferenceStyle?: "full" | "collapsed" | "shortcut";

    keepReplacement?: ReplacementFunction;
    blankReplacement?: ReplacementFunction;
    defaultReplacement?: ReplacementFunction;
  }

  interface IRule {
    filter: Filter;
    replacement?: ReplacementFunction;
  }

  type Plugin = (service: TurndownService) => void;

  type Filter = TagName | TagName[] | FilterFunction;
  type FilterFunction = (node: HTMLElement, options: IOptions) => boolean;

  type ReplacementFunction = (
    content: string,
    node: HTMLElement,
    options: IOptions,
  ) => string;

  type Node = HTMLElement | Document | DocumentFragment;
  type TagName = keyof HTMLElementTagNameMap;

  export = TurndownService;
}