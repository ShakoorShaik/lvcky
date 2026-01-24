require('dotenv').config();
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_API});

async function launchLvcky() {
    console.log("🍀 Engineering lvcky Life OS...");

    try {
        const response = await notion.databases.create({
            parent: { 
                type: "page_id", 
                page_id: process.env.PARENT_PAGE_ID 
            },
            title: [{ 
                type: "text", 
                text: { content: "lvcky: 2026 Command Center" } 
            }],
            properties: {
                "Day": { title: {} },
                "Status": { 
                    status: { 
                        options: [
                            { name: "Focusing", color: "blue" },
                            { name: "Completed", color: "green" }
                        ]
                    }
                },
                "Deep Work": { checkbox: {} },
                "Wins of the Day": { rich_text: {} }
            }
        });

        console.log("Success! lvcky system is online.");
        console.log("View it here:", response.url);
        console.log("Database ID for your records:", response.id);
    } catch (error) {
        console.error("❌ Launch Failed:", error.body);
    }
}

launchLvcky();