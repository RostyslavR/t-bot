require("dotenv").config();

const { Telegraf } = require("telegraf");
const axios = require("axios");

const BASE_URL = "https://api.openweathermap.org/data/2.5/";
const ENDPOINT = "weather?";
const { BOT_TOKEN, OWEATHER_APIKEY } = process.env;

const params = new URLSearchParams({
  appid: OWEATHER_APIKEY,
  q: "",
  units: "metric",
});

const strToQStr = (str) => {
  // replacing spaces between words with a comma (",") and removing all other spaces//
  return str.trim().replace(/ {2,}/g, " ").replace(/ /g, ",");
};

const toTextualDescription = (degree) => {
  if (degree > 337.5) return "Northerly";
  if (degree > 292.5) return "North Westerly";
  if (degree > 247.5) return "Westerly";
  if (degree > 202.5) return "South Westerly";
  if (degree > 157.5) return "Southerly";
  if (degree > 122.5) return "South Easterly";
  if (degree > 67.5) return "Easterly";
  if (degree > 22.5) {
    return "North Easterly";
  }
  return "Northerly";
};

const bot = new Telegraf(BOT_TOKEN);

// bot.start((ctx) => ctx.reply('Welcome'));
// bot.help((ctx) => ctx.reply('Send me a sticker'));
// bot.on('sticker', (ctx) => ctx.reply('👍'));
// bot.hears('hi', (ctx) => ctx.reply('Hey there'));
// bot.launch();

bot.start((ctx) =>
  ctx.reply(`Hello, ${ctx.message.from.first_name}! Send me your geolocation`)
);

bot.hears("hi", (ctx) => ctx.reply("Hey there"));
bot.hears("hello", (ctx) =>
  ctx.reply(`Hello, ${ctx.message.from.first_name}!`)
);
bot.hears("about", (ctx) =>
  ctx.reply(
    "I'm a small bot and can't do anything yet. ) Help me learn how to do something, please. "
  )
);

bot.on("message", async (ctx) => {
  // console.log(ctx.message);
  if (ctx.message.text) {
    params.set("q", strToQStr(ctx.message.text));
    const weatherAPIUrl = `${BASE_URL}${ENDPOINT}${params}`;
    // console.log(weatherAPIUrl);
    try {
      const {
        data: { name, main, weather, wind },
      } = await axios.get(weatherAPIUrl);
      ctx.reply(
        `${name}: 
         ${weather[0].main}, ${weather[0].description},
         ${main.temp} °C, feels like: ${main.feels_like}°С,
         wind: ${toTextualDescription(wind.deg)} ${wind.speed}m/s `
      );
    } catch (err) {
      console.log(err.code);
      ctx.reply(`Error: ${err.response.data.message}`);
    }
  }
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
