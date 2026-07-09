# Violence Detection Alert System

This directory contains the deployment and inference module of the Violence Detection System. It uses a pre-trained LSTM model to detect violence in videos and sends real-time alerts via Telegram.

## Files in this Directory
- **`Alert.ipynb`**: The main Jupyter Notebook containing the inference logic, video processing, and Telegram alerting code.
- **`best_lstm_model_final.keras`**: The trained Keras model file used for prediction.
- **`V_12.mp4`**: A sample video file for testing the system.

## Setup & Usage

### Prerequisites
- Python 3.x
- Dependencies listed in `../requirements.txt`
- A Telegram Bot Token and Chat ID.

### Running Locally
1.  **Install Dependencies**:
    Ensure you have installed the requirements from the root directory:
    ```bash
    pip install -r ../requirements.txt
    ```

2.  **Configure Telegram**:
    - **Get Token**: Create a bot using [BotFather](https://t.me/botfather) on Telegram to get your API Token.
    - **Get Chat ID**: Start a chat with your bot or add it to a group, then get the Chat ID (you can use bots like `@userinfobot` or check updates via API).

3.  **Run the Notebook**:
    - Open `Alert.ipynb` in Jupyter Notebook or VS Code.
    - Locate the `print_results` function call.
    - Replace the placeholder values with your actual `telegram_token` and `telegram_chat_id`.
    - Run the cells to start processing the video.

### Running on Google Colab
You can also run this system on Google Colab using the link below:
[Open in Colab](https://colab.research.google.com/drive/1m5a3-YJE4q1-3KTBQr2v-cKFfQWnfok4?usp=drive_link)

**Steps for Colab:**
1.  Open the link above.
2.  Upload `best_lstm_model_final.keras` and your video file to the Colab runtime.
3.  Replace the `telegram_token` and `telegram_chat_id` in the code.
4.  Run the cells.

## How to Get Telegram Token
1.  Open Telegram and search for **BotFather**.
2.  Send `/newbot` to create a new bot.
3.  Follow the instructions to name your bot.
4.  BotFather will provide you with an **API Token**. Copy this token.

## How to Get Chat ID
1.  Start a chat with your new bot (search for its username and click Start).
2.  Send a message to the bot (e.g., "Hello").
3.  Open the following URL in your browser (replace `<YOUR_BOT_TOKEN>` with your actual token):
    `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4.  Look for the `"chat":{"id":` field in the JSON response. This number is your **Chat ID**.