import re

def convert_to_seconds(time_str):
    if isinstance(time_str, (int, float)):
        return float(time_str)
    if re.match(r'^\d+(\.\d+)?$', str(time_str)):
        return float(time_str)
    parts = re.split('[:.]', time_str)
    if len(parts) == 4:
        h, m, s, ms = parts
        return int(h)*3600 + int(m)*60 + int(s) + float('0.'+ms)
    elif len(parts) == 3:
        h, m, s = parts
        return int(h)*3600 + int(m)*60 + float(s)
    elif len(parts) == 2:
        m, s = parts
        return int(m)*60 + float(s)
    else:
        return 0.0

def format_time(seconds):
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = seconds % 60
    return f"{h:02}:{m:02}:{s:05.2f}"
