import { IGlossData, InlineNode, IGlossLevelCell, IGlossElement } from "src/data/gloss";
import { BoxTokenMode, getDefaultAlignMarkers } from "src/data/settings";
import { PluginSettingsWrapper } from "src/settings/wrapper";
import { sanitizeClassNames } from "src/utils";

import { formatWhitespace, getLevelMetadata, getStyleClasses, getStyleKind, renderBlock } from "./helpers";


interface IFormatFlags {
    useNbsp?: boolean;
    glaSpaces?: boolean;
    useMarkup?: boolean;
}

export class GlossRenderer {
    constructor(private settings: PluginSettingsWrapper) { }

    renderErrors(target: HTMLElement, errors: string[]) {
        target.empty();

        for (const error of errors) {
            renderBlock(target, { kind: "error", text: error });
        }
    }

    renderGloss(target: HTMLElement, data: IGlossData) {
        const { styles, altSpaces, useMarkup } = data.options;
        const {
            compactMode,
            centerTokens,
            boxTokens,
            translationRendering,
            wrapBehavior,
            tokenGap,
            boxPaddingBlock,
            boxPaddingInline,
            boxBorderWidth,
            boxBorderRadius,
            baseFontScale,
            translationFontScale,
            lineHeight,
            maxWidth,
        } = this.settings.get();

        target.empty();

        const container = target.createDiv({
            cls: [
                getStyleKind(""),
                ...(compactMode ? ["ling-opt-compact"] : []),
                ...(centerTokens ? ["ling-opt-center"] : []),
                ...(wrapBehavior === "nowrap" ? ["ling-opt-nowrap"] : []),
            ],
        });

        this.applyContainerStyles(container, {
            tokenGap,
            boxPaddingBlock,
            boxPaddingInline,
            boxBorderWidth,
            boxBorderRadius,
            baseFontScale,
            translationFontScale,
            lineHeight,
            maxWidth,
        });

        renderBlock(container, {
            kind: "number",
            text: data.number.value,
            always: true,
            format: (text) => formatWhitespace(text, true),
        });

        const gloss = container.createDiv({
            cls: [getStyleKind("body"), ...getStyleClasses(styles.global)]
        });

        renderBlock(gloss, {
            kind: "label",
            text: data.label,
        });

        renderBlock(gloss, {
            kind: "preamble",
            cls: styles.preamble,
            text: data.preamble,
            format: (text) => this.formatText(text, { useMarkup }),
        });

        if (data.elements.length > 0) {
            const elements = gloss.createDiv({ cls: getStyleKind("elements") });

            const alignMarkers = this.getAlignMarkers();

            for (const elementData of data.elements) {
                const { levels } = elementData;
                const boxToken = this.shouldBoxToken(elementData, boxTokens);
                const element = elements.createDiv({
                    cls: [
                        getStyleKind("element"),
                        ...this.getTokenClassNames(elementData.tokenClasses ?? []),
                        ...(boxToken ? ["ling-opt-tokenbox"] : []),
                    ],
                });

                if (alignMarkers) {
                    const levelCell = levels[this.settings.get("alignLevel")];
                    const level = levelCell ? this.getCellText(levelCell) : "";

                    const isLeft = alignMarkers.some(mark => level.startsWith(mark));
                    const isRight = alignMarkers.some(mark => level.endsWith(mark));

                    if (isLeft && !isRight) {
                        element.addClass(getStyleKind("align-left"));
                    } else if (!isLeft && isRight) {
                        element.addClass(getStyleKind("align-right"));
                    } else if (this.settings.get("alignCenter")) {
                        // Center align if either none or both sides have a marker
                        element.addClass(getStyleKind("align-center"));
                    }
                }

                for (const [levelNo, level] of levels.entries()) {
                    const [levelKind, styleKey] = getLevelMetadata(levelNo);

                    // Alternative whitespace syntax only for level-A elements
                    const glaSpaces = altSpaces && levelNo === 0;

                    renderBlock(element, {
                        kind: levelKind,
                        cls: styles[styleKey],
                        extraCls: this.getCellClassNames(level.classes),
                        text: this.getCellText(level),
                        always: true,
                        format: (text) => this.formatInlineText(text, level, {
                            useMarkup: useMarkup && levelNo === 0,
                            glaSpaces,
                            useNbsp: true,
                        }),
                    });
                }
            }
        }

        if (data.translation.length > 0 || data.source.length > 0) {
            const postamble = gloss.createDiv({ cls: getStyleKind("postamble") });

            if (data.translation.length > 0) {
                const translations = translationRendering === "paragraph"
                    ? [data.translation.join(" ")]
                    : data.translation;

                for (const translation of translations) {
                    renderBlock(postamble, {
                        kind: "translation",
                        cls: styles.translation,
                        text: translation,
                        format: (text) => this.formatText(text, { useMarkup }),
                    });
                }
            }

            renderBlock(postamble, {
                kind: "source",
                cls: styles.source,
                text: data.source,
            });
        }

        if (!gloss.hasChildNodes()) {
            return this.renderErrors(target, ["this gloss contains no elements"]);
        }
    }

    private getAlignMarkers(): string[] | null {
        switch (this.settings.get("alignMode")) {
            case "none": return null;
            case "default": return getDefaultAlignMarkers();
            case "custom": return this.settings.get("alignCustom");
        }
    }

    private formatText(text: string, format: IFormatFlags): string | DocumentFragment {
        return this.formatInlineText(text, { nodes: [{ type: "text", text }], classes: [] }, format);
    }

    private formatInlineText(text: string, cell: IGlossLevelCell, format: IFormatFlags): string | DocumentFragment {
        if (!format.useMarkup) {
            return this.formatPlainText(text, format);
        }

        const fragment = document.createDocumentFragment();
        const nodes = this.getInlineNodes(cell);

        for (const node of nodes) {
            switch (node.type) {
                case "text": {
                    const textNode = document.createTextNode(this.formatPlainText(node.text, format));
                    fragment.appendChild(textNode);
                    break;
                }
                case "wikiLink": {
                    const link = document.createElement("a");
                    link.classList.add("internal-link");
                    link.setAttribute("href", node.target);
                    link.setAttribute("data-href", node.target);
                    link.textContent = this.formatPlainText(node.label, format);
                    fragment.appendChild(link);
                    break;
                }
                case "footnoteRef": {
                    const sup = document.createElement("sup");
                    sup.classList.add("ling-footnote-ref");
                    sup.textContent = `[^${node.id}]`;
                    fragment.appendChild(sup);
                    break;
                }
            }
        }

        return fragment;
    }

    private formatPlainText(text: string, format: IFormatFlags): string {
        if (format.glaSpaces) {
            // Replace underscores with whitespace
            text = text.replace(/[_]+/, " ");
        }

        return formatWhitespace(text, format.useNbsp);
    }

    private getInlineNodes(cell: IGlossLevelCell): InlineNode[] {
        const nodes: InlineNode[] = [];

        for (const node of cell.nodes) {
            if (node.type === "text") {
                nodes.push(...parseInlineNodes(node.text));
            } else {
                nodes.push(node);
            }
        }

        return nodes;
    }

    private getCellText(cell: IGlossLevelCell): string {
        return cell.nodes.map(node => node.type === "text" ? node.text : "").join("");
    }

    private shouldBoxToken(element: IGlossElement, mode: BoxTokenMode): boolean {
        if (element.boxOverride === "box") return true;
        if (element.boxOverride === "nobox") return false;

        switch (mode) {
            case "on":
                return true;
            case "off":
                return false;
            case "auto":
                return this.isMultilineToken(element);
            default:
                return false;
        }
    }

    private isMultilineToken(element: IGlossElement): boolean {
        let nonEmptyLevels = 0;

        for (const level of element.levels) {
            if (this.getCellText(level).trim().length > 0) {
                nonEmptyLevels += 1;
                if (nonEmptyLevels > 1) return true;
            }
        }

        return false;
    }

    private applyContainerStyles(
        container: HTMLElement,
        styles: {
            tokenGap: number;
            boxPaddingBlock: number;
            boxPaddingInline: number;
            boxBorderWidth: number;
            boxBorderRadius: number;
            baseFontScale: number;
            translationFontScale: number;
            lineHeight: number;
            maxWidth: number;
        }
    ) {
        container.style.setProperty("--ling-token-gap", `${styles.tokenGap}em`);
        container.style.setProperty("--ling-token-gap-compact", `${styles.tokenGap * 0.5}em`);
        container.style.setProperty("--ling-box-padding-block", `${styles.boxPaddingBlock}em`);
        container.style.setProperty("--ling-box-padding-inline", `${styles.boxPaddingInline}em`);
        container.style.setProperty("--ling-box-border-width", `${styles.boxBorderWidth}px`);
        container.style.setProperty("--ling-box-border-radius", `${styles.boxBorderRadius}px`);
        container.style.setProperty("--ling-font-scale", `${styles.baseFontScale}`);
        container.style.setProperty("--ling-translation-scale", `${styles.translationFontScale}`);

        if (styles.lineHeight > 0) {
            container.style.setProperty("--ling-line-height", `${styles.lineHeight}`);
        }

        container.style.setProperty(
            "--ling-max-width",
            styles.maxWidth > 0 ? `${styles.maxWidth}rem` : "100%"
        );
    }

    private getTokenClassNames(classes: string[]): string[] {
        return sanitizeClassNames(classes).map(cls => `ling-tok-${cls}`);
    }

    private getCellClassNames(classes: string[]): string[] {
        return sanitizeClassNames(classes).map(cls => `ling-cell-${cls}`);
    }
}

const parseInlineNodes = (text: string): InlineNode[] => {
    const nodes: InlineNode[] = [];
    let index = 0;

    while (index < text.length) {
        const wikiIndex = text.indexOf("[[", index);
        const footIndex = text.indexOf("[^", index);

        let nextIndex = -1;
        let kind: "wiki" | "footnote" | null = null;

        if (wikiIndex !== -1 && (footIndex === -1 || wikiIndex < footIndex)) {
            nextIndex = wikiIndex;
            kind = "wiki";
        } else if (footIndex !== -1) {
            nextIndex = footIndex;
            kind = "footnote";
        }

        if (nextIndex === -1) {
            nodes.push({ type: "text", text: text.slice(index) });
            break;
        }

        if (nextIndex > index) {
            nodes.push({ type: "text", text: text.slice(index, nextIndex) });
        }

        if (kind === "wiki") {
            const end = text.indexOf("]]", nextIndex + 2);
            if (end === -1) {
                nodes.push({ type: "text", text: text.slice(nextIndex) });
                break;
            }

            const content = text.slice(nextIndex + 2, end);
            const [target, label] = splitWikiContent(content);

            if (target.length === 0) {
                nodes.push({ type: "text", text: text.slice(nextIndex, end + 2) });
            } else {
                nodes.push({
                    type: "wikiLink",
                    target,
                    label: label.length > 0 ? label : target,
                });
            }

            index = end + 2;
        } else if (kind === "footnote") {
            const end = text.indexOf("]", nextIndex + 2);
            if (end === -1) {
                nodes.push({ type: "text", text: text.slice(nextIndex) });
                break;
            }

            const id = text.slice(nextIndex + 2, end);
            if (id.length === 0) {
                nodes.push({ type: "text", text: text.slice(nextIndex, end + 1) });
            } else {
                nodes.push({ type: "footnoteRef", id });
            }

            index = end + 1;
        }
    }

    return nodes;
};

const splitWikiContent = (content: string): [string, string] => {
    const splitIndex = content.indexOf("|");
    if (splitIndex === -1) return [content, ""];

    return [
        content.slice(0, splitIndex),
        content.slice(splitIndex + 1),
    ];
};
