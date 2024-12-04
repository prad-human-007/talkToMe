from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from cerebras.cloud.sdk import Cerebras
from dotenv import load_dotenv
import os
import uuid
import time
load_dotenv()



# Example of accessing an environment variable
# api_key = os.getenv("API_KEY")

app = FastAPI()
client = OpenAI( api_key=os.environ.get('OPENAI_API_KEY') )
cerebras_client = Cerebras( api_key=os.environ.get("CEREBRAS_API_KEY") )
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"Hello": "World"}

database = {
    "prad": {
        "username": "Prad",
        "_id": uuid.uuid4().hex,
        "chats": [
            {
                'chatID': "1234",
                'messages': [
                    {"role": "system", "content": "You are a Chef Trainer."},
                    {"role": "user", "content": "user_message"},
                    {"role": "assisstant", "content": "assisstant_message"},
                    {"role": "user", "content": "user_message"}
                ],
            },
            {
                'chatID': "5623",
                'messages': [
                    {"role": "system", "content": "You are a Chef Trainer."},
                    {"role": "user", "content": "user_message"},
                    {"role": "assisstant", "content": "assisstant_message"},
                    {"role": "user", "content": "user_message"}
                ],
            }
        ]
    },
    "crack": {
        "username": "crack",
        "_id": uuid.uuid4().hex,
        "chats": [
            {
                'chatID': "2324",
                'messages': [
                    {"role": "system", "content": "You are a Chef Trainer."},
                    {"role": "user", "content": "user_message"},
                    {"role": "assisstant", "content": "assisstant_message"},
                    {"role": "user", "content": "user_message"}
                ],
            }
        ]
    }
}

class MessageRequest(BaseModel):
    message: str
    username: str

@app.post("/getreply")
async def get_reply(request: MessageRequest):
    user_message = request.message
    username = request.username
    print(f"User Email {username}")

    start_time = time.time()

    chat_completion = cerebras_client.chat.completions.create (
        messages=[
            { "role": "system", "content": "Always answer concise. You are an english teacher" },
            { "role": "user", "content": "Can you teach me english " }
        ],
        model="llama3.1-8b",
    )

    end_time = time.time()
    elapsed_time = end_time - start_time
    print(f"Time taken for chat completion: {elapsed_time} seconds")

    reply = chat_completion.choices[0].message.content
  
    print(f"User Message: {user_message} \n Reply: {reply}")
    return {"reply": reply}

@app.get("/getreply")
async def read_item(user_email: str):
    print(f"User Email {user_email}")
    response = "Response from openAI"
    return {"user_email": user_email}

@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}