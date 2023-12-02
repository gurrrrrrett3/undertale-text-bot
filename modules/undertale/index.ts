import fetch from "node-fetch";
import { bot } from "../../core";
import Module from "../../core/base/module";
import { colors } from "./colors";
import { writeFileSync } from "fs";
import { Canvas, loadImage } from "@napi-rs/canvas";
import express from "express";


export default class UndertaleModule extends Module {
    public name = "undertale";
    public description = "No description provided";

    public static getUndertaleModule(): UndertaleModule {
        return bot.moduleLoader.getModule("undertale") as UndertaleModule;
    }

    public codes: Record<string, string> = {};


    public async generate(options: {
        text: string,
        character?: string,
    }) {

        const characterUrl = options.character ? this.getImageUrl(options.character) : undefined;

        const body = {
            text: this.colorReplacer(options.text),
            character: options.character ? "custom" : "none",
            expression: characterUrl,
            box: 'undertale',
            font: 'determination',
            size: "2",
            t: Math.round(Date.now() / 1000).toString(),
        } as {
            [key: string]: any
        }

        const url = 'https://www.demirramon.com/gen/undertale_text_box.png?' + new URLSearchParams(body).toString()

        console.log(url);

        const response = await fetch(url);

        return await response.buffer();
    }

    public getImageUrl(src: string) {
        const code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        this.codes[code] = src;
        const url = `${process.env.SERVER_URL}/${code}`;
        console.log(url);
        return url;
    }

    public colorReplacer(content: string) {

        /*
            color format
    
            text &green green text &white
            or
            text &#00FF00 green text &#FFFFFF
    
            gets replaced with
            
            text color: #00ff00 green text text=join color: #ffffff
        */


        let newContent: string = "";

        const sections = content.split("&");
        sections.forEach((section) => {
            let color: string = "";
            if (section.startsWith("#")) {
                color = section.substring(0, 7);
                section = section.substring(7);
            } else if (colors.includes(section.substring(0, section.indexOf(" ")))) {
                color = section.substring(0, section.indexOf(" "));
                section = section.substring(section.indexOf(" "));
            } else {
                color = "white";
            }

            newContent += ` color=${color} ${section.trim()} text=join `

        });

        console.log(newContent);

        return newContent;

    }

    public async formatImage(url: string) {
        const img = await loadImage(url);

        const canvas = new Canvas(img.width, img.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0);

        // make the image black and white
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;

        const r = 0.2126;
        const g = 0.7152;
        const b = 0.0722;

        const threshold = 0.5;

        for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] * r + data[i + 1] * g + data[i + 2] * b) / 255;

            const color = brightness > threshold ? 255 : 0;

            data[i] = color;
            data[i + 1] = color;
            data[i + 2] = color;
        }

        ctx.putImageData(imageData, 0, 0);

        return canvas.toBuffer("image/png")
    }

    override async onLoad(): Promise<boolean> {

        const app = express()
        
        app.get('/:code', async (req, res) => {
            const code = req.params.code;

            if (!this.codes[code]) {
                return res.status(404).send("Not found");
            }

            const url = this.codes[code];
            const img = await this.formatImage(url);

            res.setHeader('Content-Type', 'image/png');
            res.send(img);
        })

        app.listen(process.env.SERVER_PORT, () => {
            console.log(`Server listening on port ${process.env.SERVER_PORT}`);
        })

        console.log('test');

        const img = await this.generate({
            text: "text &green green text &white",
            character: "https://cdn.discordapp.com/avatars/232510731067588608/8006c30638a53f92abffacf46f390e6f.png?size=4096",
        });

        writeFileSync('./test.png', img);
        console.log('done');


        return true;
    }

}