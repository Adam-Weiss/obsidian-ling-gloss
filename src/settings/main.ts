import { PluginSettingTab, Plugin, Setting } from "obsidian";

import { IGlossOptionStyles } from "src/data/gloss";
import { BoxTokenMode, GlossAlignMode, ParticleSpaceWidth, TranslationRendering, WrapBehavior } from "src/data/settings";
import { sanitizeCssClasses } from "src/utils";

import { makeDesc } from "./helpers";
import { PluginSettingsWrapper } from "./wrapper";


export class PluginSettingsTab extends PluginSettingTab {
    constructor(plugin: Plugin, private settings: PluginSettingsWrapper) {
        super(plugin.app, plugin);
    }

    display() {
        this.containerEl.empty();

        this.addAlignModeSettings();
        this.addTranslationSettings();
        this.addBoxSettings();
        this.addFormattingSettings();
        this.addTibetanSettings();
        this.addStyleSettings();
    }

    private addAlignModeSettings() {
        const { alignMode, alignCenter, alignLevel, alignCustom } = this.settings.get();

        new Setting(this.containerEl)
            .setName("Align gloss elements")
            .setDesc("Horizontal alignment of gloss elements based on marker characters.")
            .addDropdown(component => {
                component
                    .addOptions({
                        none: "No alignment",
                        default: "Default markers",
                        custom: "Custom markers",
                    })
                    .setValue(alignMode)
                    .onChange(async value => {
                        await this.settings.update({ alignMode: value as GlossAlignMode });
                    });
            });

        new Setting(this.containerEl)
            .setName("Default center alignment")
            .setDesc("Center align tokens that have no alignment markers.")
            .addToggle(component => {
                component.setValue(alignCenter).onChange(async value => {
                    await this.settings.update({ alignCenter: value });
                });
            });

        new Setting(this.containerEl)
            .setName("Gloss line for alignment")
            .setDesc("Choose which rendered line is inspected for alignment markers.")
            .addDropdown(component => {
                component
                    .addOptions({
                        0: "Surface",
                        1: "Gloss",
                        2: "Tags",
                        3: "Extra",
                    })
                    .setValue(alignLevel.toFixed(0))
                    .onChange(async value => {
                        await this.settings.update({ alignLevel: Number(value) });
                    });
            });

        new Setting(this.containerEl)
            .setName("Custom alignment markers")
            .setDesc("Space-separated custom marker characters (used only in Custom markers mode).")
            .addText(component => {
                component.setValue(alignCustom.join(" ")).onChange(async value => {
                    await this.settings.update({ alignCustom: value.split(/\s+/).filter(Boolean) });
                });
            });
    }

    private addTranslationSettings() {
        const { translationRendering } = this.settings.get();

        new Setting(this.containerEl)
            .setName("Translation rendering")
            .setDesc("Render translation lines as separate lines or as one paragraph.")
            .addDropdown(component => {
                component
                    .addOptions({
                        stacked: "Stacked lines",
                        paragraph: "Paragraph",
                    })
                    .setValue(translationRendering)
                    .onChange(async value => {
                        await this.settings.update({ translationRendering: value as TranslationRendering });
                    });
            });
    }

    private addBoxSettings() {
        const { boxTokens, tokenGap, boxPaddingBlock, boxPaddingInline, boxBorderWidth, boxBorderRadius } = this.settings.get();

        new Setting(this.containerEl).setName("Boxed tokens").setHeading();

        new Setting(this.containerEl)
            .setName("Boxing mode")
            .setDesc("Default token boxing mode. Per-gloss \\box and per-token {#box}/{#nobox} can override this.")
            .addDropdown(component => {
                component
                    .addOptions({
                        off: "Off",
                        on: "On (all tokens)",
                        auto: "Auto (multiline tokens)",
                    })
                    .setValue(boxTokens)
                    .onChange(async value => {
                        await this.settings.update({ boxTokens: value as BoxTokenMode });
                    });
            });

        this.addNumberSetting("Token gap", "Spacing between gloss tokens (em).", tokenGap, value => this.settings.update({ tokenGap: value }));
        this.addNumberSetting("Box padding (vertical)", "Vertical padding inside boxed tokens (em).", boxPaddingBlock, value => this.settings.update({ boxPaddingBlock: value }));
        this.addNumberSetting("Box padding (horizontal)", "Horizontal padding inside boxed tokens (em).", boxPaddingInline, value => this.settings.update({ boxPaddingInline: value }));
        this.addNumberSetting("Box border thickness", "Border thickness for boxed tokens (px).", boxBorderWidth, value => this.settings.update({ boxBorderWidth: value }));
        this.addNumberSetting("Box border radius", "Border radius for boxed tokens (px).", boxBorderRadius, value => this.settings.update({ boxBorderRadius: value }));
    }

    private addFormattingSettings() {
        const { compactMode, centerTokens, baseFontScale, translationFontScale, lineHeight, wrapBehavior, maxWidth } = this.settings.get();

        new Setting(this.containerEl).setName("Formatting").setHeading();

        new Setting(this.containerEl)
            .setName("Compact mode")
            .setDesc("Reduce spacing between gloss lines and tokens.")
            .addToggle(component => component.setValue(compactMode).onChange(async value => this.settings.update({ compactMode: value })));

        new Setting(this.containerEl)
            .setName("Center token text")
            .setDesc("Center-align text inside each gloss token.")
            .addToggle(component => component.setValue(centerTokens).onChange(async value => this.settings.update({ centerTokens: value })));

        this.addNumberSetting("Base font scale", "Scale gloss font size (1 = 100%).", baseFontScale, value => this.settings.update({ baseFontScale: value }));
        this.addNumberSetting("Translation font scale", "Scale translation font size (1 = 100%).", translationFontScale, value => this.settings.update({ translationFontScale: value }));
        this.addNumberSetting("Line spacing", "Line height for gloss tokens (0 = theme default).", lineHeight, value => this.settings.update({ lineHeight: value }));

        new Setting(this.containerEl)
            .setName("Wrap behavior")
            .setDesc("Wrap tokens to the next line or keep them on one row.")
            .addDropdown(component => {
                component
                    .addOptions({ wrap: "Wrap", nowrap: "No wrap (horizontal scroll)" })
                    .setValue(wrapBehavior)
                    .onChange(async value => this.settings.update({ wrapBehavior: value as WrapBehavior }));
            });

        this.addNumberSetting("Max width", "Limit gloss block width (rem, 0 = no limit).", maxWidth, value => this.settings.update({ maxWidth: value }));
    }

    private addTibetanSettings() {
        const { particleSpacingAfterLinks, particleSpaceWidth, particleList, gloss } = this.settings.get();

        new Setting(this.containerEl).setName("Tibetan optimizations").setHeading();

        new Setting(this.containerEl)
            .setName("Particle spacing after links")
            .setDesc("Insert a small space before configured Tibetan particles after <<wiki links>> in Surface text.")
            .addToggle(component => component.setValue(particleSpacingAfterLinks).onChange(async value => this.settings.update({ particleSpacingAfterLinks: value })));

        new Setting(this.containerEl)
            .setName("Particle space width")
            .setDesc("Small space used before particles after links. Token-to-token spacing is still controlled by Token gap.")
            .addDropdown(component => {
                component
                    .addOptions({ hair: "Hair space (U+200A)", thin: "Thin space (U+2009)", normal: "Normal space (U+0020)" })
                    .setValue(particleSpaceWidth)
                    .onChange(async value => this.settings.update({ particleSpaceWidth: value as ParticleSpaceWidth }));
            });

        new Setting(this.containerEl)
            .setName("Particle list")
            .setDesc("Space-separated Tibetan particles that trigger extra spacing after links.")
            .addText(component => component.setValue(particleList.join(" ")).onChange(async value => this.settings.update({ particleList: value.split(/\s+/).filter(Boolean) })));

        new Setting(this.containerEl)
            .setName("Tibetan tsek token assist")
            .setDesc("Automatically split dense Tibetan Surface tokens at tsek characters while preserving the tsek in display.")
            .addToggle(component => component.setValue(gloss.tsekTokenAssist).onChange(async value => this.settings.update({ gloss: { tsekTokenAssist: value } })));
    }

    private addStyleSettings() {
        new Setting(this.containerEl)
            .setName("Default style classes")
            .setDesc(makeDesc(desc => {
                desc.appendText("These classes are used as defaults for rendered levels. Use ");
                desc.createEl("code", { text: "\\style" });
                desc.appendText(" for per-gloss container classes.");
            }))
            .setHeading();

        this.addStyleSettingByKey("surface", "Surface line classes");
        this.addStyleSettingByKey("gloss", "Gloss line classes");
        this.addStyleSettingByKey("tags", "Tags line classes");
        this.addStyleSettingByKey("extra", "Extra level classes");
    }

    private addStyleSettingByKey(style: keyof IGlossOptionStyles, label: string) {
        const { styles } = this.settings.get("gloss");

        new Setting(this.containerEl)
            .setName(label)
            .setDesc("Space-separated CSS class names.")
            .addText(component => {
                component
                    .setPlaceholder("class1 class2 ...")
                    .setValue(styles[style].join(" "))
                    .onChange(async value => {
                        await this.settings.update({ gloss: { styles: { [style]: sanitizeCssClasses(value.split(/\s+/)) } } });
                    });
                component.inputEl.addClass("ling-gloss-settings-wide");
            });
    }

    private addNumberSetting(name: string, description: string, value: number, onUpdate: (value: number) => Promise<void>) {
        new Setting(this.containerEl)
            .setName(name)
            .setDesc(description)
            .addText(component => {
                component.setValue(value.toString()).onChange(async newValue => {
                    const parsed = Number.parseFloat(newValue);
                    if (!Number.isNaN(parsed)) await onUpdate(parsed);
                });
                component.inputEl.addClass("ling-gloss-settings-wide");
            });
    }
}
