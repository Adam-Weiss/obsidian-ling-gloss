import { IGlossOptions, getDefaultGlossOptions } from "./gloss";


export type GlossAlignMode = "none" | "default" | "custom";
export type GlossDefaultSyntax = "gloss" | "ngloss";
export type TranslationRendering = "stacked" | "paragraph";
export type BoxTokenMode = "off" | "on" | "auto";
export type WrapBehavior = "wrap" | "nowrap";

export interface IPluginSettings {
    alignMode: GlossAlignMode;
    alignCenter: boolean;
    alignLevel: number;
    alignCustom: string[];
    defaultSyntax: GlossDefaultSyntax;
    translationRendering: TranslationRendering;
    compactMode: boolean;
    boxTokens: BoxTokenMode;
    centerTokens: boolean;
    tokenGap: number;
    boxPaddingBlock: number;
    boxPaddingInline: number;
    boxBorderWidth: number;
    boxBorderRadius: number;
    baseFontScale: number;
    translationFontScale: number;
    lineHeight: number;
    wrapBehavior: WrapBehavior;
    maxWidth: number;
    gloss: IGlossOptions;
}


export const getDefaultAlignMarkers = (): string[] => (["-", "=", "~"]);

export const getDefaultPluginSettings = (): IPluginSettings => ({
    alignMode: "none",
    alignCenter: false,
    alignLevel: 0,
    alignCustom: getDefaultAlignMarkers(),
    defaultSyntax: "gloss",
    translationRendering: "stacked",
    compactMode: false,
    boxTokens: "off",
    centerTokens: false,
    tokenGap: 1,
    boxPaddingBlock: 0.25,
    boxPaddingInline: 0.4,
    boxBorderWidth: 1,
    boxBorderRadius: 4,
    baseFontScale: 1,
    translationFontScale: 1,
    lineHeight: 0,
    wrapBehavior: "wrap",
    maxWidth: 0,
    gloss: getDefaultGlossOptions(),
});
