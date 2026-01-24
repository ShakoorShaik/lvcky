const { NotionHelper } = require("./notionHelper");
const helper = new NotionHelper();

async function init() {
    console.log("Initializing Life OS System...");

    if (!process.env.NOTION_DATABASE_ID || process.env.NOTION_DATABASE_ID === 'null') {
        const newDbId = await helper.createLifeOSDatabase();
        console.log(`Update your .env with NOTION_DATABASE_ID=${newDbId}`);
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    try {
        await helper.createDailyLog(today, "Complete the Notion Hackathon Project");
        console.log(`SUCCESS: Logged entry for ${today}`);
    } catch (e) {
        console.log("Log for today might already exist or API error.");
    }
}

init();