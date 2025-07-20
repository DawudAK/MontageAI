import ffmpeg
import whisper
import os
import tempfile

def transcribe_audio(video_path):
    # Convert video to wav
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_wav:
        wav_path = tmp_wav.name
    (
        ffmpeg
        .input(video_path)
        .output(wav_path, format='wav', acodec='pcm_s16le', ac=1, ar='16000')
        .overwrite_output()
        .run(quiet=True)
    )
    # Load whisper model
    model = whisper.load_model('base')
    result = model.transcribe(wav_path, word_timestamps=True)
    transcript = result['text']
    segments = []
    for seg in result['segments']:
        segments.append({
            'start': seg['start'],
            'end': seg['end'],
            'text': seg['text']
        })
    os.remove(wav_path)
    return transcript, segments
