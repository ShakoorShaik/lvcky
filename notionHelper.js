require('dotenv').config();
const { Client } = require("@notionhq/client");

class NotionHelper {
    constructor() {
        this.notion = new Client({ auth: process.env.NOTION_API});
        this.parentPageId = process.env.PARENT_PAGE_ID;
        this.databaseId = process.env.NOTION_DATABASE_ID;
    }

    async createLifeOSDatabase() {
        try {
            const response = await this.notion.databases.create({
                parent: { type: "page_id", page_id: this.parentPageId },
                title: [{ type: "text", text: { content: "Life OS: Daily Logs" } }],
                properties: {
                    "Date": { type: "title", title: {} },
                    "Mood": { select: { options: [
                        { name: "Excellent", color: "green" },
                        { name: "Good", color: "blue" },
                        { name: "Neutral", color: "gray" }
                    ]}},
                    "Habit: Exercise": { checkbox: {} },
                    "Habit: Reading": { checkbox: {} },
                    "Focus of the Day": { rich_text: {} }
                }
            });
            console.log("SUCCESS: Database Created:", response.url);
            return response.id;
        } catch (error) {
            console.error("ERROR creating database:", error.body);
        }
    }

    async createDailyLog(dateStr, focus) {
        return await this.notion.pages.create({
            parent: { database_id: this.databaseId },
            properties: {
                "Date": { title: [{ text: { content: dateStr } }] },
                "Focus of the Day": { rich_text: [{ text: { content: focus } }] }
            }
        });
    }
}

module.exports = { NotionHelper };