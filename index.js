const express = require("express");
const bodyParser = require("body-parser");
const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");
const constants = require("./constants");

dotenv.config();

const app = express();
app.use(bodyParser.json());

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const admins = ["TELEGRAM_ADMIN_ID"];

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const isGroupChat = msg.chat.type !== "private";

  if (isGroupChat) {
    bot.sendMessage(
      chatId,
      "Hello group members! If you want to start the orientation, please click the button below.",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Start Here", callback_data: "get_started" }],
          ],
        },
      }
    );
  } else {
    bot.sendMessage(chatId, constants.welcomeMessage, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Get Started", callback_data: "get_started" }],
        ],
      },
    });
  }
});

bot.onText(/\/adminlogin/, (msg) => {
  const chatId = msg.chat.id;
  if (admins.includes(msg.from.id.toString())) {
    bot.sendMessage(chatId, "Welcome, Admin!", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Content Updates", callback_data: "admin_content_updates" }],
          [{ text: "Broadcasts", callback_data: "admin_broadcasts" }],
          [
            {
              text: "Group Management",
              callback_data: "admin_group_management",
            },
          ],
        ],
      },
    });
  } else {
    bot.sendMessage(
      chatId,
      "You do not have permission to access admin commands."
    );
  }
});

bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === "get_started") {
    bot.sendMessage(chatId, constants.orientationIntro, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Yes, I'm ready!", callback_data: "yes_ready" }],
          [{ text: "No, tell me more.", callback_data: "tell_me_more" }],
        ],
      },
    });
  } else if (data === "yes_ready") {
    bot.sendMessage(chatId, constants.pathwayIntro, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Builder Pathway", callback_data: "pathway_builder" }],
          [
            {
              text: "Entrepreneur Pathway",
              callback_data: "pathway_entrepreneur",
            },
          ],
          [{ text: "Creator Pathway", callback_data: "pathway_creator" }],
        ],
      },
    });
  } else if (
    data === "pathway_builder" ||
    data === "pathway_entrepreneur" ||
    data === "pathway_creator"
  ) {
    const pathway = data.split("_")[1];
    bot.sendMessage(
      chatId,
      constants.pathways[pathway.charAt(0).toUpperCase() + pathway.slice(1)],
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Learn More", callback_data: `learn_more_${pathway}` }],
            [{ text: "Back to Pathways", callback_data: "yes_ready" }],
          ],
        },
      }
    );
  } else if (data.startsWith("learn_more_")) {
    const pathway = data.split("_")[2];
    bot.sendMessage(chatId, pathway_details[pathway], {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Join Developer Call", callback_data: "join_call" }],
          [{ text: "Explore Bootcamps", callback_data: "explore_bootcamps" }],
          [
            {
              text: "Learn About Hackathons",
              callback_data: "learn_hackathons",
            },
          ],
          [{ text: "View Job Opportunities", callback_data: "view_jobs" }],
        ],
      },
    });
  } else if (data === "admin_content_updates") {
    bot.sendMessage(chatId, constants.adminMenu.contentUpdates, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "FAQs", callback_data: "edit_faqs" }],
          [{ text: "Pathways", callback_data: "edit_pathways" }],
          [{ text: "Events", callback_data: "edit_events" }],
        ],
      },
    });
  } else if (data === "admin_broadcasts") {
    bot.sendMessage(chatId, constants.adminMenu.broadcasts);

    // Listen for the next message from the admin
    bot.once("message", (msg) => {
      const broadcastMessage = msg.text;
      bot.sendMessage(chatId, `Broadcast message sent: ${broadcastMessage}`);
      // Send the broadcast message to all admins :: Can be updated later
      admins.forEach((admin) => {
        bot.sendMessage(admin, broadcastMessage);
      });
    });
  } else if (data === "admin_group_management") {
    bot.sendMessage(chatId, constants.adminMenu.groupManagement, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Create New Group", callback_data: "create_group" }],
          [{ text: "Edit Existing Group", callback_data: "edit_group" }],
        ],
      },
    });
  }
});

bot.onText(/\/getid/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  bot.sendMessage(chatId, `Your user ID is: ${userId}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
