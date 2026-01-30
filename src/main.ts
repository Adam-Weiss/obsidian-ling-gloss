import { Plugin } from "obsidian";

import { GlossParser } from "src/parser/main";
import { GlossRenderer } from "src/render/main";
import { PluginSettingsTab } from "src/settings/main";
import { PluginSettingsWrapper } from "src/settings/wrapper";


export default class LingGlossPlugin extends Plugin {
    settings = new PluginSettingsWrapper(this);
    parser = new GlossParser(this.settings);
    renderer = new GlossRenderer(this.settings);

    async onload() {
        await this.settings.load();

        this.addSettingTab(new PluginSettingsTab(this, this.settings));

        this.registerMarkdownCodeBlockProcessor("gloss", (src, el, _) => this.processGlossMarkdown(src, el, "gloss"));
        this.registerMarkdownCodeBlockProcessor("ngloss", (src, el, _) => this.processGlossMarkdown(src, el, "ngloss"));
    }

    private processGlossMarkdown(source: string, el: HTMLElement, tag: "gloss" | "ngloss") {
        const defaultSyntax = this.settings.get("defaultSyntax");
        const nlevel = tag === "ngloss" || (tag === "gloss" && defaultSyntax === "ngloss");
        const glossData = this.parser.parse(source, nlevel);

        if (glossData.success) {
            this.renderer.renderGloss(el, glossData.data);
        } else {
            this.renderer.renderErrors(el, glossData.errors);
        }
    }
}
