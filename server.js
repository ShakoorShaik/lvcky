require('dotenv').config();
const express = require('express');
const { Client } = require("@notionhq/client");
const OpenAI = require("openai");

const app = express();
const notion = new Client({ auth: process.env.NOTION_API });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json());
app.use(express.static('public'));

// 1. OpenAI Task Suggestion Logic
app.post('/suggest-tasks', async (req, res) => {
    try {
        const { goal } = req.body;
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { 
                    role: "system", 
                    content: "You are a systems engineer. When given a goal, return a JSON array containing exactly 5 short, actionable task strings. Do not include markdown formatting or extra text." 
                },
                { 
                    role: "user", 
                    content: `Break down this goal into building blocks: "${goal}"` 
                }
            ],
            // Forces the model to output a valid JSON object/array
            response_format: { type: "json_object" } 
        });

        let content = completion.choices[0].message.content;
        
        // CLEANING ENGINE: Removes markdown backticks if the AI includes them
        const cleanJson = content.replace(/```json|```/g, "").trim();
        
        // Extract the array (Handling the case where AI might wrap it in a key)
        const parsedData = JSON.parse(cleanJson);
        const tasks = Array.isArray(parsedData) ? parsedData : Object.values(parsedData)[0];
        
        res.json({ tasks });
    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ error: "Intelligence engine failed to parse." });
    }
});

// 2. Notion Integration Logic
app.post('/add-to-notion', async (req, res) => {
    const { goal, tasks, priority, deadline } = req.body;

    try {
        // Create the Goal Page
        const goalPage = await notion.pages.create({
            parent: { database_id: process.env.GOALS_DB_ID },
            properties: {
                "Goal Name": { title: [{ text: { content: goal } }] },
                "Level": { select: { name: "Month" } }
            }
        });

        // Create the Action Tasks
        for (const taskName of tasks) {
            await notion.pages.create({
                parent: { database_id: process.env.TASKS_DB_ID },
                properties: {
                    "Task": { title: [{ text: { content: taskName } }] },
                    "Priority": { select: { name: priority } },
                    "Deadline": { date: { start: deadline } },
                    "Goal": { relation: [{ id: goalPage.id }] }
                }
            });
        }
        res.json({ success: true });
    } catch (e) {
        console.error("Notion Integration Error:", e);
        res.status(500).json({ error: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 lvcky Search Bar Live`));