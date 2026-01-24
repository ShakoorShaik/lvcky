require('dotenv').config();
const { Client } = require("@notionhq/client");

class NotionHelper {
    constructor() {
        this.notion = new Client({ auth: process.env.NOTION_API });
        this.parentPageId = process.env.PARENT_PAGE_ID;
    }

    async createSystemArchitecture() {
        console.log("🏗️  Engineering Relational Architecture + Reflection Engine...");

        const goalsDb = await this.notion.databases.create({
            parent: { type: "page_id", page_id: this.parentPageId },
            title: [{ type: "text", text: { content: "🎯 Goals & Vision" } }],
            properties: {
                "Goal Name": { title: {} },
                "Level": { select: { options: [
                    { name: "Year", color: "red" }, { name: "Quarter", color: "orange" },
                    { name: "Month", color: "blue" }, { name: "Week", color: "purple" }
                ]}},
                "Progress (%)": { number: { format: "percent" } },
                "Status": { status: {} }
            }
        });

        const tasksDb = await this.notion.databases.create({
            parent: { type: "page_id", page_id: this.parentPageId },
            title: [{ type: "text", text: { content: "⚡ Action Tasks" } }],
            properties: {
                "Task": { title: {} },
                "Priority": { select: { options: [
                    { name: "🔥 High", color: "red" }, { name: "⚡ Med", color: "yellow" }, { name: "☕ Low", color: "gray" }
                ]}},
                "Status": { status: {} },
                "Deadline": { date: {} },
                "Time-to-Deadline": {
                    formula: {
                        expression: 'if(empty(prop("Deadline")), "📅 No Date", if(dateBetween(prop("Deadline"), now(), "days") == 0, "📍 Due Today", if(dateBetween(prop("Deadline"), now(), "days") == 1, "🌅 Due Tomorrow", if(dateBetween(prop("Deadline"), now(), "days") == -1, "⏪ Due Yesterday", if(dateBetween(prop("Deadline"), now(), "days") < -1, "⚠️ Overdue", format(dateBetween(prop("Deadline"), now(), "days")) + " days left")))))'
                    }
                },
                "Goal": { relation: { database_id: goalsDb.id, single_property: {} } }
            }
        });

        const logsDb = await this.notion.databases.create({
            parent: { type: "page_id", page_id: this.parentPageId },
            title: [{ type: "text", text: { content: "📅 Daily Life Log" } }],
            properties: {
                "Entry": { title: {} },
                "Date": { date: {} },
                "Mood": { select: { options: [
                    { name: "🌟 Epic", color: "yellow" }, { name: "✅ Productive", color: "green" }, 
                    { name: "🔋 Charging", color: "blue" }, { name: "📉 Rough", color: "red" }
                ]}},
                "Daily Win": { rich_text: {} }
            }
        });

        // 4. Monthly Review Archive (Reflection Engine)
        const reviewDb = await this.notion.databases.create({
            parent: { type: "page_id", page_id: this.parentPageId },
            title: [{ type: "text", text: { content: "📔 Monthly Life Reviews" } }],
            properties: {
                "Month": { title: {} },
                "Date": { date: {} },
                "Life Score": { select: { options: [
                    { name: "⭐⭐⭐⭐⭐", color: "yellow" }, { name: "⭐⭐⭐⭐", color: "green" },
                    { name: "⭐⭐⭐", color: "blue" }, { name: "⭐⭐", color: "orange" }, { name: "⭐", color: "red" }
                ]}},
                "Narrative Review": { rich_text: {} }
            }
        });

        return { goalsDbId: goalsDb.id, tasksDbId: tasksDb.id, logsDbId: logsDb.id, reviewDbId: reviewDb.id };
    }

    async syncGoalProgress(goalDbId, tasksDbId) {
        console.log("🤖 Running Progress Intelligence Engine...");
        const goals = await this.notion.databases.query({ database_id: goalDbId });

        for (const goal of goals.results) {
            const linkedTasks = await this.notion.databases.query({
                database_id: tasksDbId,
                filter: { property: "Goal", relation: { contains: goal.id } }
            });

            const total = linkedTasks.results.length;
            const completed = linkedTasks.results.filter(t => t.properties?.Status?.status?.name === "Done").length;
            const percentage = total > 0 ? completed / total : 0;

            await this.notion.pages.update({
                page_id: goal.id,
                properties: { "Progress (%)": { number: percentage } }
            });
        }
        console.log("✅ All Systems Synced.");
    }
}

module.exports = { NotionHelper };