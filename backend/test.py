from google import genai
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

# Create Gemini client
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

# Send prompt to Gemini
response = client.models.generate_content(
    model="models/gemini-3.1-flash-lite",
    contents="Reply with a simple hello message."
)

# Print response
print(response.text)