const { glob } = require("glob");
const { promisify } = require("util");

const globPromise = promisify(glob);

module.exports = async(client) => {
    const allApps = await globPromise(`${process.cwd()}/apps/*`);

    const arrayOfApps = [];
    allApps.map((value) => {
        const file = require(value);
        if (!file?.name) return;
        client.interactionCommands.set(file.name, file);

        if (["MESSAGE", "USER"].includes(file.type)) delete file.description;
        console.log(`[ ${file.name} ] app'i kayıt edildi.`)
        arrayOfApps.push(file);
    });
    client.on("ready", async () => {
        // Register for a single guild
        await client.guilds.cache.map((g) => {
            g.commands.set(arrayOfApps).catch((err) => {
                console.log(g.name + " Sunucusunda, APPS uygulamaları aktif edilemedi. Hata: " + err);
            })
        })
    });
}