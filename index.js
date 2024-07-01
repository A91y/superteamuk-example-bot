const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(bodyParser.json());

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const admins = ['TELEGRAM_ADMIN_ID'];

const welcomeMessage = `
Welcome to SuperteamUK! We're here to help you learn, earn, and build on the Solana blockchain. Let's get you started.
`;

const orientationIntro = `
We'll guide you through the basics of SuperteamUK and help you choose the right pathway for your goals. Ready to begin?
`;

const pathwayIntro = `
SuperteamUK offers three main pathways to help you succeed:
- Builder: Learn how to code on Solana and accelerate your skills with our developer resources.
- Entrepreneur: Support for founders to build and scale ventures within the Solana ecosystem.
- Creator: Empowerment for artists, designers, and content creators to find their voice and build a community of collectors, clients, and supporters.
Which pathway are you interested in?
`;

const pathways = {
  Builder: `
You've chosen the Builder Pathway! Here's how we can help you:
- Weekly Developer Relations Calls
- Quarterly Bootcamps
- Bi-Annual Hackathons
- Access to contracts and job opportunities
Ready to dive deeper?
`,
  Entrepreneur: `
You've chosen the Entrepreneur Pathway! Here's how we can help you:
- Support for founders
- Networking opportunities
- Access to investors
- Business development resources
Ready to dive deeper?
`,
  Creator: `
You've chosen the Creator Pathway! Here's how we can help you:
- Workshops and tutorials
- Networking events
- Opportunities to showcase your work
- Support from a community of like-minded individuals
Ready to dive deeper?
`,
};

const adminMenu = {
  contentUpdates: `
Select the section to edit:
- FAQs
- Pathways
- Events
  `,
  broadcasts: `
Type your broadcast message:
  `,
  groupManagement: `
Select an option:
- Create New Group
- Edit Existing Group
  `
};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const isGroupChat = msg.chat.type !== 'private';

  if (isGroupChat) {
    bot.sendMessage(chatId, 'Hello group members! If you want to start the orientation, please click the button below.', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Start Here', callback_data: 'get_started' }]
        ]
      }
    });
  } else {
    bot.sendMessage(chatId, welcomeMessage, {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Get Started', callback_data: 'get_started' }]
        ]
      }
    });
  }
});

bot.onText(/\/adminlogin/, (msg) => {
  const chatId = msg.chat.id;
  if (admins.includes(msg.from.id.toString())) {
    bot.sendMessage(chatId, 'Welcome, Admin!', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Content Updates', callback_data: 'admin_content_updates' }],
          [{ text: 'Broadcasts', callback_data: 'admin_broadcasts' }],
          [{ text: 'Group Management', callback_data: 'admin_group_management' }]
        ]
      }
    });
  } else {
    bot.sendMessage(chatId, 'You do not have permission to access admin commands.');
  }
});

bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === 'get_started') {
    bot.sendMessage(chatId, orientationIntro, {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Yes, I\'m ready!', callback_data: 'yes_ready' }],
          [{ text: 'No, tell me more.', callback_data: 'tell_me_more' }]
        ]
      }
    });
  } else if (data === 'yes_ready') {
    bot.sendMessage(chatId, pathwayIntro, {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Builder Pathway', callback_data: 'pathway_builder' }],
          [{ text: 'Entrepreneur Pathway', callback_data: 'pathway_entrepreneur' }],
          [{ text: 'Creator Pathway', callback_data: 'pathway_creator' }]
        ]
      }
    });
  } else if (data === 'pathway_builder' || data === 'pathway_entrepreneur' || data === 'pathway_creator') {
    const pathway = data.split('_')[1];
    bot.sendMessage(chatId, pathways[pathway.charAt(0).toUpperCase() + pathway.slice(1)], {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Learn More', callback_data: `learn_more_${pathway}` }],
          [{ text: 'Back to Pathways', callback_data: 'yes_ready' }]
        ]
      }
    });
  } else if (data.startsWith('learn_more_')) {
    const pathway = data.split('_')[2];
    const details = {
      builder: `
- Developer Relations Calls: Join our regular calls to stay updated on the latest in Solana. [Join Call Link]
- Bootcamps: Enroll in our in-depth workshops to gain hands-on experience. [Bootcamp Details]
- Hackathons: Participate in bi-annual events to test your skills and collaborate. [Hackathon Info]
- Job Opportunities: Connect with clients and employers in the Solana ecosystem. [Job Board]
What would you like to explore first?
      `,
      entrepreneur: `
- Mentorship Programs: Access experienced mentors to guide your startup. [Mentorship Link]
- Funding Opportunities: Apply for grants and funding. [Funding Details]
- Networking Events: Meet other founders and potential partners. [Events Link]
What would you like to explore first?
      `,
      creator: `
- Workshops: Participate in creative workshops. [Workshop Details]
- Showcases: Display your work at our events. [Showcase Info]
- Community Support: Join our community and collaborate. [Community Link]
What would you like to explore first?
      `
    };
    bot.sendMessage(chatId, details[pathway], {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Join Developer Call', callback_data: 'join_call' }],
          [{ text: 'Explore Bootcamps', callback_data: 'explore_bootcamps' }],
          [{ text: 'Learn About Hackathons', callback_data: 'learn_hackathons' }],
          [{ text: 'View Job Opportunities', callback_data: 'view_jobs' }]
        ]
      }
    });
  } else if (data === 'admin_content_updates') {
    bot.sendMessage(chatId, adminMenu.contentUpdates, {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'FAQs', callback_data: 'edit_faqs' }],
          [{ text: 'Pathways', callback_data: 'edit_pathways' }],
          [{ text: 'Events', callback_data: 'edit_events' }]
        ]
      }
    });
  } else if (data === 'admin_broadcasts') {
    bot.sendMessage(chatId, adminMenu.broadcasts);

    // Listen for the next message from the admin
    bot.once('message', (msg) => {
      const broadcastMessage = msg.text;
      bot.sendMessage(chatId, `Broadcast message sent: ${broadcastMessage}`);
      // Send the broadcast message to all admins :: Can be updated later
      admins.forEach((admin) => {
        bot.sendMessage(admin, broadcastMessage);
      });
    });
  } else if (data === 'admin_group_management') {
    bot.sendMessage(chatId, adminMenu.groupManagement, {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Create New Group', callback_data: 'create_group' }],
          [{ text: 'Edit Existing Group', callback_data: 'edit_group' }]
        ]
      }
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
