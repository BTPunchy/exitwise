import os
import json
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from typing import List

from models.trip import TripRequest, TripResponse, TripRouteStep, POI, Location
from db import init_db, close_db, get_pois_near_station, get_station_exits

app = FastAPI(title="ExitWise AI Planner Service")

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    # Using Gemini 1.5 Flash for fast, JSON-structured responses
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None
    print("WARNING: GEMINI_API_KEY not set. Reverting to mock data if called.")

@app.on_event("startup")
async def startup_event():
    await init_db()

@app.on_event("shutdown")
async def shutdown_event():
    await close_db()

@app.get("/health")
def health_check():
    return {"status": "ok", "gemini_configured": model is not None}

@app.post("/plan", response_model=TripResponse)
async def plan_trip(request: TripRequest):
    is_explorer = request.travel_mode.lower() == "explorer"

    # Fetch real POIs from the database near the destination block
    # We use a 1km radius limit to gather candidates
    candidates = await get_pois_near_station(
        station_id=request.end_station_id, 
        max_distance=1000, 
        max_budget=request.budget
    )
    
    exits = await get_station_exits(station_id=request.end_station_id)

    # If Gemini is not configured or we found no POIs, fallback to basic logic
    if not model or not candidates:
        return handle_fallback(request, is_explorer, candidates)

    # Construct the Prompt Context
    system_instruction = """
    You are an expert local guide for the MRT system in Bangkok, Thailand. 
    Your goal is to create an exact JSON itinerary matching the user's constraints and 'travel_mode'.
    
    Available Modes:
    1. 'lazy': Provide the absolute shortest walk to exactly ONE highly-rated place (like a cafe or close restaurant).
    2. 'explorer': Provide a 2-3 stop walking tour (e.g., eat -> shop -> sightsee) utilizing more budget and walking time, but staying within the limits.
    
    Return pure JSON matching this schema:
    {
       "recommended_exit": "string (e.g., 'Exit 2')",
       "route_steps": [
          { "instructions": "string", "distance": int (meters), "duration": int (seconds) }
       ],
       "suggested_pois": [
          { "id": int, "name": "string", "category": "string", "price_level": int, "location": {"lat": float, "lng": float} }
       ],
       "estimated_total_cost": int (baht)
    }
    """

    user_prompt = f"""
    User Constraints:
    - Mode: {request.travel_mode}
    - Budget: {request.budget} Baht
    - Max Walking Distance: {request.max_walking_distance} meters
    
    Available Station Exits:
    {json.dumps(exits, indent=2)}

    Available Nearby POIs (only suggest from this list!):
    {json.dumps(candidates, indent=2)}
    
    Generate the JSON itinerary according to the schema. 
    Ensure total distance across route_steps <= max walking distance.
    Ensure estimated_total_cost <= budget.
    Return ONLY valid JSON.
    """

    try:
        response = model.generate_content(
            system_instruction + "\n\n" + user_prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json"
            )
        )
        
        # Parse the JSON response
        data = json.loads(response.text)
        
        # Validate and return via Pydantic
        return TripResponse(**data)
        
    except Exception as e:
        print(f"Gemini API Error: {e}")
        # Graceful fallback if AI fails
        return handle_fallback(request, is_explorer, candidates)


def handle_fallback(request: TripRequest, is_explorer: bool, candidates: List[dict]):
    """Fallback if Gemini fails or is unconfigured returns basic mock data from the DB"""
    if not candidates:
        candidates = [
            {"id": 1, "name": "Closest Cafe", "category": "cafe", "price_level": 2, "lat": 13.7563, "lng": 100.5018}
        ]
        
    suggested_pois = []
    if is_explorer and len(candidates) > 1:
        # Take up to 3 for explorer
        for c in candidates[:3]:
            suggested_pois.append(
                POI(id=c["id"], name=c["name"], category=c["category"], price_level=c.get("price_level", 1), location=Location(lat=c["lat"], lng=c["lng"]))
            )
    else:
        # Take just 1 for lazy
        c = candidates[0]
        suggested_pois.append(
            POI(id=c["id"], name=c["name"], category=c["category"], price_level=c.get("price_level", 1), location=Location(lat=c["lat"], lng=c["lng"]))
        )

    route_steps = [TripRouteStep(instructions="Walk to " + suggested_pois[0].name, distance=200, duration=150)]
    
    return TripResponse(
        recommended_exit="Exit 1",
        route_steps=route_steps,
        suggested_pois=suggested_pois,
        estimated_total_cost=request.budget // 2
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
