# Gemini
import google.generativeai as genai
from IPython.display import Markdown

# System and Environment
import os   
from dotenv import load_dotenv
from pathlib import Path

# Spotipy
import spotipy
from spotipy.oauth2 import SpotifyOAuth

# Load Environment Variables
env_path = os.path.join(os.path.dirname(__file__), "../../middleware/.env")
env_path = os.path.abspath(env_path)  

load_dotenv(env_path)

CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

print(CLIENT_ID)


# Classify vibes based on range (default = short term)
def classify_vibes(time_range: str="short_term"):
    """Classify user's top tracks into vibes using Gemini"""
    sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        redirect_uri=REDIRECT_URI,
        scope="user-top-read"
    ))
    
    # Get top tracks
    top_tracks = sp.current_user_top_tracks(limit=50, time_range=time_range)
    
    # Prepare Gemini model
    vibe_model = genai.GenerativeModel('gemini-1.5-flash')
    
    # Prepare track information
    track_summary = "\n".join([
        f"- {track['name']} by {track['artists'][0]['name']}" 
        for track in top_tracks['items']
    ])
    
    prompt = f"""
    Analyze these songs and identify the top 6 dominant vibes with percentages:
    {track_summary}

    VIBE OPTIONS (choose ONLY these exact names):
    1. Chill 
    2. Energetic 
    3. Melancholy
    4. Romantic
    5. Confident
    6. Nostalgic
    7. Artsy
    8. Dark
    9. Rage
    10. Futuristic
    11. Party
    12. Ambient
    13. Spiritual
    14. Dreamy
    15. Rebellious
    16. Carefree
    17. Classy
    18. Cinematic
    19. Theatrical
    20. Alternative

    RESPONSE FORMAT (must follow exactly):
    Chill:45, Energetic:30, Melancholy:25

    Rules:
    - Only use the provided vibe names
    - Percentages must sum to 100
    - Include exactly 6 vibes
    - No additional text or explanation
    """
    
    try:
        response = vibe_model.generate_content(prompt)
        print(f"Gemini raw response: {response.text}")
        
        # Parse the response
        vibe_dict = {}
        for pair in response.text.strip().split(","):
            if ":" in pair:
                parts = pair.split(":")
                if len(parts) == 2:
                    vibe = parts[0].strip()
                    percent = parts[1].strip()
                    if percent.isdigit():
                        vibe_dict[vibe] = int(percent)
        
        # Validate we got 3 vibes summing to 100
        if len(vibe_dict) == 3 and sum(vibe_dict.values()) == 100:
            return vibe_dict
        else:
            print("Invalid format from Gemini, using fallback")
            return {"Chill": 40, "Energetic": 35, "Romantic": 25}
            
    except Exception as e:
        print(f"Error analyzing vibes: {e}")
        return {"Chill": 0, "Energetic": 0, "Romantic": 0}  # Fallback


if __name__ == "__main__":
    print("Testing vibe classification...")
    for time_range in ["short_term", "medium_term", "long_term"]:
        print(f"\nTesting time range: {time_range}")
        vibes = classify_vibes(time_range)
        print("Detected vibes:", vibes)
