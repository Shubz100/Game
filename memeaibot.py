import os
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
import google.generativeai as genai

# Initialize Gemini AI (using environment variables)
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
TELEGRAM_TOKEN = os.environ.get("TELEGRAM_TOKEN")

# Configure genai
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-pro')

# Trading bot system prompt
SYSTEM_PROMPT = """You are a professional meme coin trading signal analyzer. Your role is to analyze trading signals and provide quick, concise responses.

Analysis Rules:
1. Extract the coin name if mentioned (including chain, e.g., SOL)
2. Find the contract address (CA) - typically after /solana/ in dexscreener links
3. Analyze the overall signal sentiment

Response Format (exactly as shown):
Coin: [coin_name] ([chain]) or "Not Found"
CA: [contract_address]
Signal: [Choose one: BUY, RISKY/BUY, DON'T BUY]

Signal Analysis Guidelines:
- BUY: Clear positive indicators, good volume, strong floor
- RISKY/BUY: Mixed signals or cautionary notes present
- DON'T BUY: Negative indicators or high-risk warnings

Rules:
- If no contract address found, respond "CA: Not Found"
- Be extremely concise - no additional commentary
- Don't include any disclaimers or warnings
- If the message isn't a trading signal, respond with "Not a trading signal"
- Extract CA from dexscreener links using format: /solana/[CA]"""

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    welcome_message = "ð Meme Coin Signal Bot Active! Send me trading signals to analyze."
    await update.message.reply_text(welcome_message)

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    help_text = """
ð¯ Trading Signal Bot Commands:
/start - Start the bot
/help - Show this help message

Send any trading signal and I'll analyze it instantly!
Format of response:
Coin: [coin_name] ([chain])
CA: [contract_address]
Signal: [BUY/RISKY/DON'T BUY]
"""
    await update.message.reply_text(help_text)

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        user_message = update.message.text
        prompt = f"{SYSTEM_PROMPT}\n\nAnalyze this trading signal:\n{user_message}"
        response = model.generate_content(prompt)
        await update.message.reply_text(response.text)
    except Exception as e:
        print(f"Error: {e}")  # Print the error for debugging in Railway logs
        error_message = "Error processing signal. Please try again."
        await update.message.reply_text(error_message)

def main():
    application = Application.builder().token(TELEGRAM_TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    print("ð Trading Signal Bot Online!")
    application.run_polling()

if __name__ == "__main__":
    main()
