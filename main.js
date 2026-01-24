const { NotionHelper } = require("./notionHelper");
const helper = new NotionHelper();

async function init() {
    console.log("🍀 lvcky Life OS: Deploying Full Suite...");

    try {
        const { goalsDbId, tasksDbId, logsDbId, reviewDbId } = await helper.createSystemArchitecture();
        
        console.log("🌱 Seeding Onboarding Data...");
        const onboardingGoal = await helper.notion.pages.create({
            parent: { database_id: goalsDbId },
            properties: {
                "Goal Name": { title: [{ text: { content: "2026 Mastery" } }] },
                "Level": { select: { name: "Year" } }
            }
        });

        const today = new Date().toISOString().split('T')[0];

        // Seed Task
        await helper.notion.pages.create({
            parent: { database_id: tasksDbId },
            properties: {
                "Task": { title: [{ text: { content: "Launch lvcky Reflection Suite" } }] },
                "Deadline": { date: { start: today } },
                "Goal": { relation: [{ id: onboardingGoal.id }] }
            }
        });

        // Seed Monthly Review
        await helper.notion.pages.create({
            parent: { database_id: reviewDbId },
            properties: {
                "Month": { title: [{ text: { content: "January 2026" } }] },
                "Date": { date: { start: today } },
                "Life Score": { select: { name: "⭐⭐⭐⭐⭐" } },
                "Narrative Review": { rich_text: [{ text: { content: "System live. Ready to track progress." } }] }
            }
        });

        await helper.syncGoalProgress(goalsDbId, tasksDbId);
        console.log("\n🚀 SYSTEM DEPLOYED SUCCESSFULLY!");
    } catch (error) {
        console.error("❌ Critical Failure:", error.body || error);
    }
}

init();