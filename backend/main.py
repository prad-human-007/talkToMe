from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from cerebras.cloud.sdk import Cerebras
from typing import List, Dict
from dotenv import load_dotenv
from supabase import create_client, Client
import os
import uuid
import jwt
import time
load_dotenv()

# Example of accessing an environment variable
# api_key = os.getenv("API_KEY")



app = FastAPI()
client = OpenAI( api_key=os.environ.get('OPENAI_API_KEY') )
cerebras_client = Cerebras( api_key=os.environ.get("CEREBRAS_API_KEY") )
origins = ["*"]

SUPABASE_JWT_SECRET = os.environ.get('SUPABASE_JWT_SECRET')
supabase_client: Client = create_client(os.environ.get('SUPABASE_URL'), os.environ.get('SUPABASE_KEY'))
try:
    supabase_client.auth.sign_in_with_password(
        {'email': os.environ.get('SUPABASE_EMAIL'), 'password': os.environ.get('SUPABASE_PASSWORD')}
    )
    print("Signed in to supabase")
except Exception as e:
    print(f"Error signing in to supabase: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

authenticated_users = []

@app.get("/")
def read_root():
    return {"Hello": "World"}

def decodeJWT(token):
    try:
        # print(f"Checking token: {token}")
        # print(f"SUPABASE_JWT_SECRET: {SUPABASE_JWT_SECRET}")
        decoded_token = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], audience="authenticated")
        return decoded_token
    except jwt.ExpiredSignatureError:
        return HTTPException(status_code=401, detail="Signature has expired")
    except jwt.InvalidTokenError:
        return HTTPException(status_code=401, detail="Invalid token")
    



class MessageRequest(BaseModel):
    message: List[Dict]
    username: str

@app.post("/getreply")
async def get_reply(
    request: MessageRequest,
    authorization: str = Header(None)
):
    if not authorization:
        print("No authorization header")
        raise HTTPException(status_code=401, detail="Unauthorized Access - No Authorization Header")
    else:
        token = authorization.split(" ")[1]
        user = decodeJWT(token)
        print(f"User from JWT: {user['sub']}")
        if(user['sub'] not in authenticated_users):
            response = supabase_client.table('user_roles').select('*').eq('user_id', user['sub']).execute()
            print(f"Role got from supabase: {response.data}")
            if(len(response.data) > 0): 
                if(response.data[0]['role'] != 'paid'):
                    print(f"Unauthorized Access - {user['sub']} - Not a paid user")
                    raise HTTPException(status_code=401, detail="Unauthorized Access - Not a paid user")
                else:
                    authenticated_users.append(user['sub'])


    user_message = request.message
    username = request.username
    # print(f"User Email {username}")
    # print(f"User Message: {user_message} ")

    start_time = time.time()

    chat_completion = cerebras_client.chat.completions.create (
        messages=user_message,
        model="llama3.1-8b",
    )

    end_time = time.time()
    elapsed_time = end_time - start_time
    print(f"Time taken for chat completion: {elapsed_time} seconds")

    reply = chat_completion.choices[0].message.content
  
    # print(f"User Message: {user_message} \n Reply: {reply}")
    return {"reply": reply}

@app.get("/getreply")
async def read_item(user_email: str):
    print(f"User Email {user_email}")
    response = "Response from openAI"
    return {"user_email": user_email}

@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}