from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import json
import google.generativeai as genai
from datetime import datetime
import os
from dotenv import load_dotenv
import PIL.Image
import io

load_dotenv()

# Initialize Gemini AI with safety settings
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
generation_config = {
    "temperature": 0.7,
    "top_p": 0.8,
    "top_k": 40,
    "max_output_tokens": 2048,
}

# Initialize both text and multimodal models
text_model = genai.GenerativeModel('gemini-2.0-flash', generation_config=generation_config)
vision_model = genai.GenerativeModel('gemini-2.0-flash')

# Safety settings
safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
]

app = FastAPI(title="Adaptive GenAI System")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize separate chat histories
restaurant_chat_histories = {}
clinic_chat_histories = {}

# Models
class RestaurantQuery(BaseModel):
    query: str
    preferences: Optional[dict] = None
    session_id: str
    image_analysis: Optional[bool] = False

class ClinicQuery(BaseModel):
    query: str
    date: Optional[str] = None
    doctor: Optional[str] = None
    session_id: str

class ImageAnalysisRequest(BaseModel):
    query: str
    session_id: str

# Load datasets
def load_data():
    with open("data/restaurant_data.json", "r") as f:
        restaurant_data = json.load(f)
    with open("data/clinic_data.json", "r") as f:
        clinic_data = json.load(f)
    return restaurant_data, clinic_data

# GenAI Helper Functions
async def get_ai_response(prompt: str, context: dict, system_role: str, session_id: str, 
                         chat_history: Optional[List[dict]] = None, mode: str = 'restaurant') -> str:
    try:
        # Include chat history in the prompt if available
        history_prompt = ""
        if chat_history:
            history_prompt = "\nPrevious conversation:\n" + "\n".join(
                f"User: {msg['user']}\nAssistant: {msg['assistant']}"
                for msg in chat_history[-3:]  # Include last 3 exchanges
            )

        full_prompt = f"""{system_role}

Context Information:
{json.dumps(context, indent=2)}

{history_prompt}

User Query: {prompt}

Please provide a response based on the above context."""

        chat = text_model.start_chat(history=[])
        response = chat.send_message(full_prompt)
        
        if not response.text:
            raise Exception("Empty response from AI model")
            
        # Store in appropriate chat history
        histories = restaurant_chat_histories if mode == 'restaurant' else clinic_chat_histories
        if session_id not in histories:
            histories[session_id] = []
        
        histories[session_id].append({
            "user": prompt,
            "assistant": response.text,
            "timestamp": datetime.now().isoformat()
        })
        
        return response.text
        
    except Exception as e:
        print(f"Error in get_ai_response: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

async def analyze_image(image: UploadFile, query: str) -> str:
    try:
        contents = await image.read()
        image_parts = [
            {
                "mime_type": image.content_type,
                "data": contents
            }
        ]
        
        prompt = f"Analyze this image and answer the following query: {query}"
        response = await vision_model.generate_content_async([prompt, image_parts[0]])
        return response.text
    except Exception as e:
        return f"Error analyzing image: {str(e)}"

# Enhanced restaurant query processing
async def process_restaurant_query(query: str, restaurant_data: dict, session_id: str) -> str:
    system_prompt = """You are an advanced restaurant assistant with capabilities in:
    1. Menu recommendations
    2. Dietary preferences handling
    3. Special requests processing
    4. Meal customization guidance
    5. Price and availability information
    
    Ensure all responses are friendly and helpful."""
    
    try:
        chat_history = restaurant_chat_histories.get(session_id, [])
        response = await get_ai_response(
            prompt=query,
            context={
                "menu": restaurant_data["menu_items"],
                "dietary_options": restaurant_data["dietary_options"]
            },
            system_role=system_prompt,
            session_id=session_id,
            chat_history=chat_history,
            mode='restaurant'
        )
        return response
    except Exception as e:
        # Fallback to basic processing if AI fails
        return process_basic_restaurant_query(query, restaurant_data)

# Enhanced clinic query processing
async def process_clinic_query(query: str, clinic_data: dict, session_id: str) -> str:
    system_prompt = """You are an advanced medical clinic assistant with capabilities in:
    1. Intelligent appointment scheduling
    2. Doctor availability optimization
    3. Service recommendations based on patient needs
    4. Wait time estimation
    5. Insurance and payment processing guidance
    
    Ensure all responses maintain medical privacy and professionalism."""
    
    try:
        chat_history = clinic_chat_histories.get(session_id, [])
        response = await get_ai_response(
            prompt=query,
            context={
                "doctors": clinic_data["doctors"],
                "services": clinic_data["services"]
            },
            system_role=system_prompt,
            session_id=session_id,
            chat_history=chat_history,
            mode='clinic'
        )
        return response
    except Exception as e:
        # Fallback to basic processing if AI fails
        return process_basic_clinic_query(query, clinic_data)

def process_basic_clinic_query(query: str, clinic_data: dict) -> str:
    query = query.lower()
    response = ""
    
    if "doctor" in query or "doctors" in query:
        doctors = clinic_data["doctors"]
        response = "Available doctors:\n" + "\n".join(
            f"- Dr. {doc['name']} ({doc['specialization']}) - Experience: {doc['experience']}, Languages: {', '.join(doc['languages'])}"
            for doc in doctors
        )
    elif "service" in query or "services" in query:
        services = clinic_data["services"]
        response = "Available services:\n" + "\n".join(
            f"- {service['name']}: {service['description']}"
            for service in services
        )
    elif "appointment" in query or "schedule" in query:
        response = "To schedule an appointment, please provide:\n" + \
                  "1. Preferred doctor or specialization\n" + \
                  "2. Preferred date\n" + \
                  "3. Preferred time slot"
    else:
        response = "I can help you with:\n" + \
                  "1. Finding a doctor\n" + \
                  "2. Learning about our services\n" + \
                  "3. Scheduling appointments\n" + \
                  "Please let me know what you need."
    
    return response

# Basic processing functions (fallback)
def process_basic_restaurant_query(query: str, restaurant_data: dict) -> str:
    query = query.lower()
    response = ""
    
    if "vegetarian" in query:
        veg_items = [item for item in restaurant_data["menu_items"] 
                    if item["vegetarian"]]
        response = "Vegetarian options:\n" + "\n".join(
            f"- {item['name']} (${item['price']}) - {item['description']}"
            for item in veg_items
        )
    elif "spicy" in query:
        spicy_items = [item for item in restaurant_data["menu_items"] 
                      if item.get("spicy_level", 0) > 0]
        response = "Spicy items:\n" + "\n".join(
            f"- {item['name']} (Spice level: {item['spicy_level']}) - ${item['price']}"
            for item in spicy_items
        )
    elif "combo" in query or "deal" in query:
        response = "Available combos:\n" + "\n".join(
            f"- {combo['name']} (${combo['price']} - Save ${combo['savings']})"
            for combo in restaurant_data["combos"]
        )
    else:
        response = "I can help you with:\n- Menu items\n- Dietary restrictions\n- Meal combos\n- Pricing"
    
    return "Basic response: " + response

# Routes
@app.get("/")
async def root():
    return {"message": "Welcome to the Adaptive GenAI System"}

@app.post("/restaurant/query")
async def restaurant_query(query: RestaurantQuery):
    restaurant_data, _ = load_data()
    if query.image_analysis:
        return {"response": "Please use the /analyze_menu_image endpoint for image analysis"}
    response = await process_restaurant_query(query.query, restaurant_data, query.session_id)
    return {"response": response}

@app.post("/clinic/query")
async def clinic_query(query: ClinicQuery):
    _, clinic_data = load_data()
    response = await process_clinic_query(query.query, clinic_data, query.session_id)
    return {"response": response}

@app.post("/analyze_menu_image")
async def analyze_menu_image(
    image: UploadFile = File(...),
    request: str = Form(...)
):
    try:
        request_data = json.loads(request)
        response = await analyze_image(image, request_data["query"])
        if request_data["session_id"] in restaurant_chat_histories:
            restaurant_chat_histories[request_data["session_id"]].append({
                "user": f"[Image Analysis] {request_data['query']}",
                "assistant": response,
                "timestamp": datetime.now().isoformat()
            })
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/chat_history/{mode}/{session_id}")
async def get_chat_history(mode: str, session_id: str):
    histories = restaurant_chat_histories if mode == 'restaurant' else clinic_chat_histories
    return histories.get(session_id, [])

@app.delete("/chat_history/{mode}/{session_id}")
async def delete_chat_history(mode: str, session_id: str):
    histories = restaurant_chat_histories if mode == 'restaurant' else clinic_chat_histories
    if session_id in histories:
        histories[session_id] = []
    return {"message": f"{mode.title()} chat history cleared successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
