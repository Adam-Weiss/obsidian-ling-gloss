import { PluginSettingTab, Plugin, Setting } from "obsidian";

import { IGlossOptions, IGlossOptionStyles } from "src/data/gloss";
import { BoxTokenMode, GlossAlignMode, GlossDefaultSyntax, TranslationRendering, WrapBehavior } from "src/data/settings";
import { KeysOfType, sanitizeCssClasses } from "src/utils";

import { makeDesc } from "./helpers";
import { PluginSettingsWrapper } from "./wrapper";


export class PluginSettingsTab extends PluginSettingTab {
    constructor(plugin: Plugin, private settings: PluginSettingsWrapper) {
        super(plugin.app, plugin);
    }

    display() {
        this.containerEl.empty();

        this.addDefaultSyntaxSettings();
        this.addAlignModeSettings();
        this.addTranslationSettings();
        this.addBoxSettings();
        this.addFormattingSettings();
        this.addSwitchSettings();
        this.addStyleSettings();
    }

    private addDefaultSyntaxSettings() {
        const { defaultSyntax } = this.settings.get();

        new Setting(this.containerEl)
            .setName("Default syntax")
            .setDesc("Treat gloss code blocks as either the regular \\gla/\\glb syntax or the alternative \\gl (n-level) syntax.")
            .addDropdown(component => {
                component
                    .addOptions({
                        gloss: "gloss",
                        ngloss: "ngloss",
                    })
                    .setValue(defaultSyntax)
                    .onChange(async value => {
                        await this.settings.update({
                            defaultSyntax: value as GlossDefaultSyntax,
                        });
                    });
            });
    }

    private addAlignModeSettings() {
        const { alignMode, alignCenter, alignLevel, alignCustom } = this.settings.get();

        new Setting(this.containerEl)
            .setName("Align gloss elements")
            .setDesc(makeDesc(desc => {
                desc.appendText("Horizontal alignment of gloss elements that have certain marker characters on either side.");
                desc.createEl("br");
                desc.appendText("The default markers are: ");
                desc.createEl("code", { text: "-" });
                desc.appendText(" (hyphen), ");
                desc.createEl("code", { text: "=" });
                desc.appendText(" (equals sign), ");
                desc.createEl("code", { text: "~" });
                desc.appendText(" (tilde).");
            }))
            .addDropdown(component => {
                component
                    .addOptions({
                        none: "No alignment",
                        default: "Default markers",
                        custom: "Custom markers",
                    })
                    .setValue(alignMode)
                    .onChange(async value => {
                        await this.settings.update({
                            alignMode: value as GlossAlignMode,
                        });
                    });
            });

        new Setting(this.containerEl)
            .setName("Default center alignment")
            .setDesc("Center align gloss elements which do not have any alignment markers on either side.")
            .addToggle(component => {
                component
                    .setValue(alignCenter)
                    .onChange(async value => {
                        await this.settings.update({
                            alignCenter: value,
                        });
                    });
            });

        new Setting(this.containerEl)
            .setName("Gloss line for alignment")
            .setDesc("The line on which gloss elements are checked for the selected alignment markers.")
            .addDropdown(component => {
                component
                    .addOptions({
                        0: "Level A",
                        1: "Level B",
                        2: "Level C",
                    })
                    .setValue(alignLevel.toFixed(0))
                    .onChange(async value => {
                        await this.settings.update({
                            alignLevel: Number(value),
                        });
                    });
            });

        new Setting(this.containerEl)
            .setName("Custom alignment markers")
            .setDesc(makeDesc(desc => {
                desc.appendText("Space separated list of custom marker characters for gloss element alignment.");
                desc.createEl("br");
                desc.appendText("Only has an effect when the gloss element alignment is set to “Custom markers”.");
            }))
            .addText(component => {
                component
                    .setValue(alignCustom.join(" "))
                    .onChange(async value => {
                        await this.settings.update({
                            alignCustom: value.split(/\s+/),
                        });
                    });
            });
    }

    private addSwitchSettings() {
        new Setting(this.containerEl)
            .setName("Feature switches")
            .setDesc(makeDesc(desc => {
                desc.appendText("Default feature switch settings for all glosses.");
                desc.createEl("br");
                desc.appendText("To unset the enabled ones, the ");
                desc.createEl("code", { text: " \\set*" });
                desc.appendText(" command can be used.");
            }))
            .setHeading();

        this.addSwitchSettingByKey("altSpaces", "Alternate spaces", "glaspaces");
        this.addSwitchSettingByKey("useMarkup", "Inline links/footnote refs", "markup");
    }

    private addTranslationSettings() {
        const { translationRendering } = this.settings.get();

        new Setting(this.containerEl)
            .setName("Translation rendering")
            .setDesc("Controls how multiple \\ft lines are displayed in the postamble.")
            .addDropdown(component => {
                component
                    .addOptions({
                        stacked: "Stacked lines",
                        paragraph: "Paragraph",
                    })
                    .setValue(translationRendering)
                    .onChange(async value => {
                        await this.settings.update({
                            translationRendering: value as TranslationRendering,
                        });
                    });
            });
    }

    private addBoxSettings() {
        const {
            boxTokens,
            tokenGap,
            boxPaddingBlock,
            boxPaddingInline,
            boxBorderWidth,
            boxBorderRadius,
        } = this.settings.get();

        new Setting(this.containerEl)
            .setName("Boxed tokens")
            .setHeading();

        new Setting(this.containerEl)
            .setName("Boxing mode")
            .setDesc("Set the default boxing behavior for tokens.")
            .addDropdown(component => {
                component
                    .addOptions({
                        off: "Off",
                        on: "On (all tokens)",
                        auto: "Auto (box multiline tokens only)",
                    })
                    .setValue(boxTokens)
                    .onChange(async value => {
                        await this.settings.update({
                            boxTokens: value as BoxTokenMode,
                        });
                    });
            });

        this.addNumberSetting({
            name: "Token gap",
            description: "Spacing between gloss tokens (em).",
            value: tokenGap,
            onUpdate: value => this.settings.update({ tokenGap: value }),
        });

        this.addNumberSetting({
            name: "Box padding (vertical)",
            description: "Vertical padding inside boxed tokens (em).",
            value: boxPaddingBlock,
            onUpdate: value => this.settings.update({ boxPaddingBlock: value }),
        });

        this.addNumberSetting({
            name: "Box padding (horizontal)",
            description: "Horizontal padding inside boxed tokens (em).",
            value: boxPaddingInline,
            onUpdate: value => this.settings.update({ boxPaddingInline: value }),
        });

        this.addNumberSetting({
            name: "Box border thickness",
            description: "Border thickness for boxed tokens (px).",
            value: boxBorderWidth,
            onUpdate: value => this.settings.update({ boxBorderWidth: value }),
        });

        this.addNumberSetting({
            name: "Box border radius",
            description: "Border radius for boxed tokens (px).",
            value: boxBorderRadius,
            onUpdate: value => this.settings.update({ boxBorderRadius: value }),
        });
    }

    private addFormattingSettings() {
        const {
            compactMode,
            centerTokens,
            baseFontScale,
            translationFontScale,
            lineHeight,
            wrapBehavior,
            maxWidth,
        } = this.settings.get();

        new Setting(this.containerEl)
            .setName("Formatting")
            .setHeading();

        new Setting(this.containerEl)
            .setName("Compact mode")
            .setDesc("Reduce spacing between gloss lines and tokens.")
            .addToggle(component => {
                component
                    .setValue(compactMode)
                    .onChange(async value => {
                        await this.settings.update({
                            compactMode: value,
                        });
                    });
            });

        new Setting(this.containerEl)
            .setName("Center token text")
            .setDesc("Center-align text inside each gloss token.")
            .addToggle(component => {
                component
                    .setValue(centerTokens)
                    .onChange(async value => {
                        await this.settings.update({
                            centerTokens: value,
                        });
                    });
            });

        this.addNumberSetting({
            name: "Base font scale",
            description: "Scale the base font size for gloss blocks (1 = 100%).",
            value: baseFontScale,
            onUpdate: value => this.settings.update({ baseFontScale: value }),
        });

        this.addNumberSetting({
            name: "Translation font scale",
            description: "Scale the font size for translation lines (1 = 100%).",
            value: translationFontScale,
            onUpdate: value => this.settings.update({ translationFontScale: value }),
        });

        this.addNumberSetting({
            name: "Line spacing",
            description: "Line height for gloss tokens (0 = theme default).",
            value: lineHeight,
            onUpdate: value => this.settings.update({ lineHeight: value }),
        });

        new Setting(this.containerEl)
            .setName("Wrap behavior")
            .setDesc("Wrap tokens to the next line or keep them on a single row.")
            .addDropdown(component => {
                component
                    .addOptions({
                        wrap: "Wrap",
                        nowrap: "No wrap (horizontal scroll)",
                    })
                    .setValue(wrapBehavior)
                    .onChange(async value => {
                        await this.settings.update({
                            wrapBehavior: value as WrapBehavior,
                        });
                    });
            });

        this.addNumberSetting({
            name: "Max width",
            description: "Limit gloss block width on wide screens (rem, 0 = no limit).",
            value: maxWidth,
            onUpdate: value => this.settings.update({ maxWidth: value }),
        });
    }

    private addStyleSettings() {
        new Setting(this.containerEl)
            .setName("Style classes")
            .setDesc(makeDesc(desc => {
                desc.appendText("Default style classes for all glosses. The ");
                desc.createEl("code", { text: "\\set" });
                desc.appendText(" command will append to these.");
                desc.createEl("br");
                desc.appendText("To replace or remove these, the ");
                desc.createEl("code", { text: "\\set*" });
                desc.appendText(" command can be used instead.");
            }))
            .setHeading();

        this.addStyleSettingByKey("global", "Global styles", "style");
        this.addStyleSettingByKey("levelA", "Gloss level A", "glastyle");
        this.addStyleSettingByKey("levelB", "Gloss level B", "glbstyle");
        this.addStyleSettingByKey("levelC", "Gloss level C", "glcstyle");
        this.addStyleSettingByKey("levelX", "Other gloss levels", "glxstyle");
        this.addStyleSettingByKey("preamble", "Preamble/example text", "exstyle");
        this.addStyleSettingByKey("translation", "Translation text", "ftstyle");
        this.addStyleSettingByKey("source", "Gloss source", "srcstyle");
    }

    private addStyleSettingByKey(style: keyof IGlossOptionStyles, label: string, command: string) {
        const { styles } = this.settings.get("gloss");

        new Setting(this.containerEl)
            .setName(label)
            .setDesc(makeDesc(desc => {
                desc.appendText("Default style classes for the ");
                desc.createEl("code", { text: `\\set ${command}` });
                desc.appendText(" option.");
            }))
            .addText(component => {
                component
                    .setPlaceholder("class1 class2 ...")
                    .setValue(styles[style].join(" "))
                    .onChange(async value => {
                        await this.settings.update({
                            gloss: {
                                styles: {
                                    [style]: sanitizeCssClasses(value.split(/\s+/)),
                                }
                            }
                        });
                    });

                // Make the text field wider
                component.inputEl.addClass("ling-gloss-settings-wide");
            });
    }

    private addSwitchSettingByKey(flag: KeysOfType<IGlossOptions, boolean>, label: string, command: string) {
        const gloss = this.settings.get("gloss");

        new Setting(this.containerEl)
            .setName(label)
            .setDesc(makeDesc(desc => {
                desc.appendText("Default switch setting for the ");
                desc.createEl("code", { text: `\\set ${command}` });
                desc.appendText(" option.");
            }))
            .addToggle(component => {
                component
                    .setValue(gloss[flag])
                    .onChange(async value => {
                        await this.settings.update({
                            gloss: {
                                [flag]: value,
                            }
                        });
                    });
            });
    }

    private addNumberSetting(options: {
        name: string;
        description: string;
        value: number;
        onUpdate: (value: number) => Promise<void>;
    }) {
        new Setting(this.containerEl)
            .setName(options.name)
            .setDesc(options.description)
            .addText(component => {
                component
                    .setValue(options.value.toString())
                    .onChange(async value => {
                        const parsed = Number.parseFloat(value);
                        if (Number.isNaN(parsed)) return;
                        await options.onUpdate(parsed);
                    });

                component.inputEl.addClass("ling-gloss-settings-wide");
            });
    }
}
