import json
import math
import sys

keys = set(['segments', 'height', 'radius'])

def make_point(index, radius, segments):
  return {
    "x": radius * math.cos(2 * math.pi * index / segments),
    "y": 0,
    "z": radius * math.sin(2 * math.pi * index / segments)
  }

def make_triangle(height, radius, segments, cur_segment):
  return [
    {"x": 0, "y": height, "z":0},
    make_point(cur_segment, radius, segments),
    make_point(cur_segment+1, radius, segments),
  ]

def calculate_cone(params):
  return [make_triangle(params["height"], params["radius"], params["segments"], i) for i in range(params["segments"])]

def is_valid_params(params):
  for key in keys:
    if key not in params or math.isnan(float(params[key])):
      sys.stderr.write('error')
      return False
  return True


while True:
  msg_json = sys.stdin.readline()
  msg = json.loads(msg_json)

  if "content" not in msg or "id" not in msg:
    sys.stderr.write('error')

  params = msg["content"]

  if (not is_valid_params(params)):
      continue  

  triangles = calculate_cone(params)
  sys.stdout.write(json.dumps({
    "id": msg["id"],
    "content": triangles
    }))
  sys.stdout.flush()

