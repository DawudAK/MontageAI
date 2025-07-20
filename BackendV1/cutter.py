import ffmpeg
import tempfile
import os

def cut_video_segments(input_path, segments, output_path):
    temp_files = []
    try:
        for i, seg in enumerate(segments):
            temp_file = tempfile.NamedTemporaryFile(suffix='.mp4', delete=False)
            temp_files.append(temp_file.name)
            (
                ffmpeg
                .input(input_path, ss=seg['start'], to=seg['end'])
                .output(temp_file.name, codec='copy')
                .overwrite_output()
                .run(quiet=True)
            )
        # Concatenate segments
        with tempfile.NamedTemporaryFile('w', suffix='.txt', delete=False) as concat_list:
            for f in temp_files:
                concat_list.write(f"file '{f}'\n")
            concat_list_path = concat_list.name
        (
            ffmpeg
            .input(concat_list_path, format='concat', safe=0)
            .output(output_path, c='copy')
            .overwrite_output()
            .run(quiet=True)
        )
    finally:
        for f in temp_files:
            if os.path.exists(f):
                os.remove(f)
        if 'concat_list_path' in locals() and os.path.exists(concat_list_path):
            os.remove(concat_list_path)
