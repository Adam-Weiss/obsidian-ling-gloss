import { IGlossData, createGlossData, createGlossElement, createGlossLevelCell } from "src/data/gloss";
import { IToken, ICommand } from "src/data/parser";
import { PluginSettingsWrapper } from "src/settings/wrapper";
import { Result, resultOk, resultErr, arrayFill, sanitizeClassNames } from "src/utils";

import { paramsJoin, paramsOne, checkNoValues, checkValueSimple, gatherValuesQuoted } from "./helpers";
import { tokenize } from "./tokenize";


const TibetanRegex = /[\u0F00-\u0FFF]/;

export class GlossParser {
    private commandTable: Record<string, (data: IGlossData, params: IToken[], commandName: { base: string; classes: string[] }) => void> = {
        ex: (data, params, commandName) => data.preamble = createGlossLevelCell(paramsJoin(params), commandName.classes),
        ft: (data, params, commandName) => data.translation.push(createGlossLevelCell(paramsJoin(params), commandName.classes)),
        lbl: (data, params, commandName) => data.label = createGlossLevelCell(paramsJoin(params), commandName.classes),
        src: (data, params, commandName) => data.source = createGlossLevelCell(paramsJoin(params), commandName.classes),
        num: (data, params, commandName) => data.number = { value: paramsOne(params) },
        gl: (data, params, _) => this.handleMultiGlossCommand(data, params),
        style: (data, params, _) => data.containerClasses.push(...sanitizeClassNames(params.map(param => param.value))),
        box: (data, params, _) => this.handleBoxCommand(data, params),
    };

    constructor (private settings: PluginSettingsWrapper) { }

    parse(input: string): Result<IGlossData> {
        const tokenized = tokenize(input);
        if (!tokenized.success) return resultErr(tokenized.errors);

        const glossData = createGlossData(this.settings.get("gloss"));

        const procErrors = this.processCommands(tokenized.data, glossData);
        if (procErrors !== null) return resultErr(procErrors);

        return resultOk(glossData);
    }

    private processCommands(commands: ICommand[], data: IGlossData): string[] | null {
        let errors: string[] | null = null;

        for (const command of commands) {
            try {
                const commandName = parseCommandName(command.name);
                const action = this.commandTable[commandName.base];
                if (action == null) throw "command “@@” is not known";

                action(data, command.params, commandName);
            } catch (error) {
                error = `${error} (line ${command.lineNo})`
                    .replace("@@", command.name)
                    .replace("@1", command.params[0]?.value ?? "");

                errors ??= [];
                errors.push(error);
            }
        }

        return errors;
    }

    private handleMultiGlossCommand(data: IGlossData, params: IToken[]) {
        checkNoValues(params);
        checkValueSimple(params.first(), "invalid gloss element");

        const mergedParams = mergeClassSuffixTokens(params);
        const bits = gatherValuesQuoted(mergedParams);
        const maxLevel = bits.reduce((acc, el) => Math.max(acc, el.length), 0);

        arrayFill(data.elements, bits.length, () => createGlossElement());

        for (const [index, elem] of data.elements.entries()) {
            const tokenBits = bits[index] ?? [];
            const tokenValue = tokenBits[0] ?? "";
            const tokenParsed = parseTokenClasses(tokenValue);

            elem.tokenClasses = tokenParsed.classes;
            if (tokenParsed.boxOverride) {
                elem.boxOverride = tokenParsed.boxOverride;
            }

            arrayFill(elem.levels, maxLevel, () => createGlossLevelCell());
            elem.levels[0] = createGlossLevelCell(this.maybeAssistTsekToken(tokenParsed.text, data.options.tsekTokenAssist));

            for (let levelIndex = 1; levelIndex < maxLevel; levelIndex += 1) {
                const cellValue = tokenBits[levelIndex] ?? "";
                const cellParsed = parseTokenClasses(cellValue);
                elem.levels[levelIndex] = createGlossLevelCell(cellParsed.text, cellParsed.classes);
                if (cellParsed.boxOverride) {
                    elem.boxOverride = cellParsed.boxOverride;
                }
            }
        }
    }

    private maybeAssistTsekToken(token: string, enabled: boolean): string {
        if (!enabled) return token;
        if (!TibetanRegex.test(token)) return token;
        if (token.includes(" ")) return token;

        const tsekCount = (token.match(/་/g) ?? []).length;
        if (tsekCount < 2) return token;

        return token.replace(/་/g, "་ ").trim();
    }

    private handleBoxCommand(data: IGlossData, params: IToken[]) {
        const mode = paramsOne(params).toLowerCase();
        if (mode !== "on" && mode !== "off" && mode !== "auto") {
            throw "unknown box mode “@1”";
        }

        data.boxModeOverride = mode;
    }
}

const parseCommandName = (command: string): { base: string; classes: string[] } => {
    const match = command.match(/^([a-z]+)(\{([^}]*)\})?$/i);
    if (match == null) return { base: command, classes: [] };

    return {
        base: match[1].toLowerCase(),
        classes: sanitizeClassNames((match[3] ?? "").split(",").map(cls => cls.trim())),
    };
};

const parseTokenClasses = (value: string): { text: string; classes: string[]; boxOverride: "box" | "nobox" | null } => {
    const match = value.match(/^(.*)\{([^}]*)\}$/);
    if (match == null) {
        return { text: value, classes: [], boxOverride: null };
    }

    const text = match[1];
    const classList = match[2].split(",").map(cls => cls.trim()).filter(cls => cls.length > 0);
    const { classes, boxOverride } = extractBoxOverride(classList);

    return {
        text,
        classes: sanitizeClassNames(classes),
        boxOverride,
    };
};

const extractBoxOverride = (classes: string[]): { classes: string[]; boxOverride: "box" | "nobox" | null } => {
    let boxOverride: "box" | "nobox" | null = null;
    const remaining: string[] = [];

    for (const cls of classes) {
        const normalized = cls.toLowerCase();
        if (normalized === "#box") {
            boxOverride = "box";
            continue;
        }
        if (normalized === "#nobox") {
            boxOverride = "nobox";
            continue;
        }
        remaining.push(cls);
    }

    return { classes: remaining, boxOverride };
};

const mergeClassSuffixTokens = (params: IToken[]): IToken[] => {
    const merged: IToken[] = [];

    for (const param of params) {
        if (
            param.type === "simple"
            && param.value.startsWith("{")
            && param.value.endsWith("}")
            && merged.length > 0
        ) {
            merged[merged.length - 1].value += param.value;
            continue;
        }

        merged.push({ ...param });
    }

    return merged;
};
