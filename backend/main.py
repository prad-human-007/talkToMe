from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
import os
load_dotenv()


# Example of accessing an environment variable
# api_key = os.getenv("API_KEY")

app = FastAPI()
client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))

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

class MessageRequest(BaseModel):
    message: str

@app.post("/getreply")
async def get_reply(request: MessageRequest):
    user_message = request.message
    
    stream = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a Chef Trainer."},
            {"role": "user", "content": user_message},
        ],
        # stream=True
    )
    reply = stream.choices[0].message.content
  
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