import { deepCopy } from "src/utils";


export interface IGlossOptionStyles {
    global: string[];
    levelA: string[];
    levelB: string[];
    levelC: string[];
    levelX: string[];
    preamble: string[];
    translation: string[];
    source: string[];
}

export interface IGlossOptions {
    useMarkup: boolean;
    altSpaces: boolean;
    styles: IGlossOptionStyles;
}

export type InlineNode =
    | { type: "text"; text: string }
    | { type: "wikiLink"; target: string; label: string }
    | { type: "footnoteRef"; id: string };

export interface IGlossLevelCell {
    nodes: InlineNode[];
    classes: string[];
}

export interface IGlossNumber {
    value: string;
}

export interface IGlossElement {
    levels: IGlossLevelCell[];
    tokenClasses: string[];
}

export interface IGlossData {
    nlevel: boolean;
    options: IGlossOptions;
    number: IGlossNumber;
    label: string;
    preamble: string;
    elements: IGlossElement[];
    translation: string[];
    source: string;
}


export const getDefaultGlossOptions = (): IGlossOptions => ({
    useMarkup: true,
    altSpaces: false,
    styles: {
        global: [],
        levelA: [],
        levelB: [],
        levelC: [],
        levelX: [],
        preamble: [],
        translation: [],
        source: [],
    },
});

export const createGlossElement = (): IGlossElement => ({
    levels: [],
    tokenClasses: [],
});

export const createGlossLevelCell = (text = "", classes: string[] = []): IGlossLevelCell => ({
    nodes: [{ type: "text", text }],
    classes,
});

export const createGlossData = (nlevel: boolean, options?: IGlossOptions): IGlossData => ({
    nlevel,
    options: deepCopy(options) ?? getDefaultGlossOptions(),
    number: {
        value: "",
    },
    label: "",
    preamble: "",
    translation: [],
    source: "",
    elements: [],
});
