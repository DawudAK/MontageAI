import os
import google.generativeai as genai
from dotenv import load_dotenv
import json
from utils import convert_to_seconds

load_dotenv()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

def extract_cut_ranges(transcript, prompt):
    if not GEMINI_API_KEY:
        raise ValueError('GEMINI_API_KEY not set in .env')
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-pro')
    user_input = f"""
    Transcript:
    {transcript}
    
    User Prompt:
    {prompt}
    
    Please return a JSON list of objects with 'start' and 'end' fields (in seconds or HH:MM:SS), representing the relevant video segments.
    """
    response = model.generate_content(user_input)
    # Try to extract JSON from response
    try:
        data = json.loads(response.text)
    except Exception:
        # Try to extract JSON substring
        import re
        match = re.search(r'\[.*\]', response.text, re.DOTALL)
        if match:
            data = json.loads(match.group(0))
        else:
            raise ValueError('Could not parse Gemini response as JSON')
    # Convert times to seconds
    cut_ranges = []
    for seg in data:
        start = convert_to_seconds(seg['start'])
        end = convert_to_seconds(seg['end'])
        cut_ranges.append({'start': start, 'end': end})
    return cut_ranges
