import UndertaleModule from "..";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder";

const Command = new SlashCommandBuilder()
  .setName("textbox")
  .setDescription("Make a funny undertale textbox")
  .addStringOption((option) =>
    option
      .setName("content")
      .setDescription("The content of the textbox")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("characterurl")
      .setDescription("The character url to use, see /setcharacter help for more info")
      .setRequired(false)
  )
  .setFunction(async (interaction) => {
    await interaction.deferReply();

    const text = interaction.options.getString("content", true);
    const character = interaction.options.getString("characterurl", false);

    const image = await UndertaleModule.getUndertaleModule().generate({
      text,
      character: character || undefined,
    });
    
  });

export default Command;

// Use the "command" snippet to create a new command