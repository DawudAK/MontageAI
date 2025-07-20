from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from whisper_transcriber import transcribe_audio
from gemini_editor import extract_cut_ranges
from cutter import cut_video_segments
from visual_analyser import extract_frames
import os
import tempfile
import json
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = 'backend/uploads'
OUTPUT_DIR = 'backend/outputs'

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.get('/health')
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "ai_available": bool(os.getenv('GEMINI_API_KEY')),
        "message": "Montage AI Backend is running"
    }

@app.post('/process')
async def process_video(file: UploadFile = File(...), prompt: str = Form(...)):
    # Save uploaded file
    input_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(input_path, 'wb') as f:
        f.write(await file.read())
    # Transcribe
    transcript, segments = transcribe_audio(input_path)
    # Extract cut ranges
    cut_ranges = extract_cut_ranges(transcript, prompt)
    # Cut video
    output_path = os.path.join(OUTPUT_DIR, f'cut_{file.filename}')
    cut_video_segments(input_path, cut_ranges, output_path)
    # Return file
    return FileResponse(output_path, media_type='video/mp4', filename=f'cut_{file.filename}')

@app.post('/analyze-video')
async def analyze_video(file: UploadFile = File(...), script_content: str = Form(None)):
    """Analyze video for scenes using AI with optional script information"""
    print(f"🎬 Received video analysis request for: {file.filename}")
    if script_content:
        print(f"📝 Script provided: {len(script_content)} characters")
    try:
        # Save uploaded file temporarily
        input_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(input_path, 'wb') as f:
            f.write(await file.read())
        
        # Extract frames for analysis
        with tempfile.TemporaryDirectory() as temp_dir:
            frame_count = extract_frames(input_path, temp_dir, every_n=30)
            
            # Transcribe audio for context
            transcript, segments = transcribe_audio(input_path)
            
            # Use Gemini to analyze scenes based on transcript, script, and frame info
            print(f"📊 Extracted {frame_count} frames and {len(segments)} transcript segments")
            scenes = await analyze_scenes_with_ai(transcript, segments, frame_count, script_content)
            
            # Clean up uploaded file
            os.remove(input_path)
            
            print(f"✅ Analysis complete: {len(scenes)} scenes detected")
            return {
                "success": True,
                "scenes": scenes,
                "transcript": transcript,
                "metadata": {
                    "frame_count": frame_count,
                    "duration": segments[-1]['end'] if segments else 0
                }
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

async def analyze_scenes_with_ai(transcript: str, segments: list, frame_count: int, script_content: str = None):
    """Use Gemini AI to analyze scenes based on transcript, script, and visual information"""
    try:
        import google.generativeai as genai
        from dotenv import load_dotenv
        
        load_dotenv()
        GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
        
        if not GEMINI_API_KEY:
            print("⚠️  GEMINI_API_KEY not set - using fallback scene detection")
            # Fallback to basic scene detection
            return generate_basic_scenes(segments)
        
        print("🤖 Using Gemini AI for scene analysis...")
        
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-pro')
        
        # Create analysis prompt with script information if available
        script_info = ""
        if script_content:
            script_info = f"""
        Script Information:
        {script_content}
        
        Use the script to understand the intended narrative structure, scene order, and story flow.
        Match the detected scenes to the script's intended sequence and pacing.
        """
        
        analysis_prompt = f"""
        Analyze this video transcript and provide intelligent scene detection:
        
        Transcript: {transcript}
        Number of segments: {len(segments)}
        Frame count: {frame_count}
        {script_info}
        
        Please return a JSON array of scenes with the following structure:
        [
            {{
                "id": "scene_1",
                "startTime": 0,
                "endTime": 15,
                "description": "Scene description based on content and script",
                "confidence": 0.9,
                "tags": ["action", "dialogue", "establishing"],
                "type": "action|dialogue|establishing|closeup|wide|transition|highlight",
                "mood": "energetic|calm|dramatic|funny|serious|romantic",
                "narrative_order": 1,
                "story_importance": "high|medium|low"
            }}
        ]
        
        Instructions:
        1. Base the analysis on the transcript content, segment timing, and video characteristics
        2. If script is provided, use it to determine proper scene order and narrative flow
        3. Identify key story beats, character introductions, and plot progression
        4. Consider pacing, emotional arcs, and story structure
        5. Order scenes chronologically based on the actual video timeline
        6. Assign narrative_order based on story progression (1, 2, 3, etc.)
        7. Determine story_importance based on plot significance
        """
        
        response = model.generate_content(analysis_prompt)
        
        # Try to parse JSON response
        try:
            import re
            # Extract JSON from response
            json_match = re.search(r'\[.*\]', response.text, re.DOTALL)
            if json_match:
                scenes = json.loads(json_match.group(0))
                print("✅ Successfully parsed AI-generated scenes")
                return scenes
            else:
                print("⚠️  Could not extract JSON from AI response, using fallback")
                return generate_basic_scenes(segments)
        except Exception as parse_error:
            print(f"⚠️  JSON parsing failed: {parse_error}, using fallback")
            return generate_basic_scenes(segments)
            
    except Exception as e:
        print(f"❌ AI analysis failed: {e}")
        print("🔄 Falling back to basic scene detection...")
        return generate_basic_scenes(segments)

def generate_basic_scenes(segments: list):
    """Generate basic scenes based on transcript segments"""
    scenes = []
    
    if not segments:
        # Fallback scenes if no transcript
        scenes = [
            {
                "id": "scene_1",
                "startTime": 0,
                "endTime": 30,
                "description": "Opening sequence",
                "confidence": 0.7,
                "tags": ["opening", "establishing"],
                "type": "establishing",
                "mood": "calm"
            },
            {
                "id": "scene_2", 
                "startTime": 30,
                "endTime": 90,
                "description": "Main content",
                "confidence": 0.8,
                "tags": ["main", "content"],
                "type": "action",
                "mood": "energetic"
            }
        ]
    else:
        # Create scenes based on transcript segments
        for i, segment in enumerate(segments):
            scene = {
                "id": f"scene_{i+1}",
                "startTime": segment['start'],
                "endTime": segment['end'],
                "description": f"Scene {i+1}: {segment['text'][:50]}...",
                "confidence": 0.8,
                "tags": ["dialogue", "content"],
                "type": "dialogue",
                "mood": "serious"
            }
            scenes.append(scene)
    
    return scenes

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
