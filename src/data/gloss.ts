import { deepCopy } from "src/utils";


export interface IGlossOptionStyles {
    surface: string[];
    gloss: string[];
    tags: string[];
    extra: string[];
}

export interface IGlossOptions {
    altSpaces: boolean;
    tsekTokenAssist: boolean;
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
    boxOverride: "box" | "nobox" | null;
}

export interface IGlossData {
    options: IGlossOptions;
    containerClasses: string[];
    boxModeOverride: "off" | "on" | "auto" | null;
    number: IGlossNumber;
    label: IGlossLevelCell;
    preamble: IGlossLevelCell;
    elements: IGlossElement[];
    translation: IGlossLevelCell[];
    source: IGlossLevelCell;
}


export const getDefaultGlossOptions = (): IGlossOptions => ({
    altSpaces: false,
    tsekTokenAssist: true,
    styles: {
        surface: [],
        gloss: [],
        tags: [],
        extra: [],
    },
});

export const createGlossElement = (): IGlossElement => ({
    levels: [],
    tokenClasses: [],
    boxOverride: null,
});

export const createGlossLevelCell = (text = "", classes: string[] = []): IGlossLevelCell => ({
    nodes: [{ type: "text", text }],
    classes,
});

export const createGlossData = (options?: IGlossOptions): IGlossData => ({
    options: deepCopy(options) ?? getDefaultGlossOptions(),
    containerClasses: [],
    boxModeOverride: null,
    number: {
        value: "",
    },
    label: createGlossLevelCell(),
    preamble: createGlossLevelCell(),
    translation: [],
    source: createGlossLevelCell(),
    elements: [],
});
