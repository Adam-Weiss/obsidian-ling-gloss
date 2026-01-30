import { IGlossOptions, getDefaultGlossOptions } from "./gloss";


export type GlossAlignMode = "none" | "default" | "custom";
export type GlossDefaultSyntax = "gloss" | "ngloss";
export type TranslationRendering = "stacked" | "paragraph";

export interface IPluginSettings {
    alignMode: GlossAlignMode;
    alignCenter: boolean;
    alignLevel: number;
    alignCustom: string[];
    defaultSyntax: GlossDefaultSyntax;
    translationRendering: TranslationRendering;
    compactMode: boolean;
    boxTokens: boolean;
    centerTokens: boolean;
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
    boxTokens: false,
    centerTokens: false,
    gloss: getDefaultGlossOptions(),
});
