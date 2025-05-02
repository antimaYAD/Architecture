# 🚀 MAIN EXECUTION FILE (ALL-IN-ONE WITH HELPER LOGIC)

import copy
import random
import matplotlib.pyplot as plt
from collections import defaultdict, Counter
import numpy as np
from shapely.geometry import LineString, Polygon

# ===================== CONFIG =====================
constraints = {
    'Master Bedroom': {'min_width': 6.89, 'min_height': 6.89},
    'Kitchen': {'min_width': 5.91, 'min_height': 5.91},
    'Living Room': {'min_width': 6.89, 'min_height': 6.89},
    'Bedroom': {'min_width': 6.89, 'min_height': 6.89},
    'Dining Room': {'min_width': 5, 'min_height': 5},
    'Foyer': {'min_width': 3.3, 'min_height': 3.3},
    'En suite Washroom': {'min_width': 3.3, 'min_height': 3.3},
    'Common Washroom': {'min_width': 3.3, 'min_height': 3.3},
    'Passage': {'min_width': 3.3 ,'min_height': 3.3},
    'Bathroom':{'min_width': 3.3, 'min_height': 3.3},
    'Washroom':{'min_width': 3.3, 'min_height': 3.3},
    'Study': {'min_width': 5, 'min_height': 5}
}

# ===================== HELPERS =====================
def truncate_to_two_decimals(val):
    return round(val, 2)

def wall_segments_to_rooms(wall_data):
    return {
        room: [[
            [seg['start']['x'], seg['start']['y']],
            [seg['end']['x'], seg['end']['y']]
        ] for seg in segments]
        for room, segments in wall_data.items()
    }

def get_room_dimensions(room_coords):
    x_vals = [p[0] for wall in room_coords for p in wall]
    y_vals = [p[1] for wall in room_coords for p in wall]
    return max(x_vals) - min(x_vals), max(y_vals) - min(y_vals)

def validate_existing_rooms(rooms):
    for room, coords in rooms.items():
        width, height = get_room_dimensions(coords)
        min_w = constraints.get(room, {}).get('min_width', 0)
        min_h = constraints.get(room, {}).get('min_height', 0)
        if width < min_w or height < min_h:
            return False, f"Room '{room}' violates minimum dimensions: width={width}, height={height}, expected at least {min_w}x{min_h}"
    return True, ""

def replace_near_values(rooms, threshold=0.2):
    all_vals = []
    for room, coords in rooms.items():
        for wall in coords:
            for point in wall:
                all_vals.append(tuple(point))
    for room, coords in rooms.items():
        for wall in coords:
            for point in wall:
                for ref_point in all_vals:
                    if np.linalg.norm(np.array(point) - np.array(ref_point)) < threshold:
                        point[0], point[1] = ref_point[0], ref_point[1]
    return rooms

def make_roomdata(rooms):
    metadata = {}
    for room, walls in rooms.items():
        for idx, wall in enumerate(walls):
            start, end = wall
            metadata.setdefault(room, {})[idx] = {
                'coordinates': [start.copy(), end.copy()],
                'wall_length': np.linalg.norm(np.array(start) - np.array(end)),
                'wall_type': 'vertical' if start[0] == end[0] else 'horizontal'
            }
    return metadata

def convert_all_rooms_to_walls(rooms, thickness=30):
    wall_segments = {}
    for room, coords in rooms.items():
        segments = []
        for wall in coords:
            start = {'x': wall[0][0], 'y': wall[0][1]}
            end = {'x': wall[1][0], 'y': wall[1][1]}
            segments.append({
                'start': start,
                'end': end,
                'thickness': thickness,
                'originalStart': start.copy(),
                'originalEnd': end.copy(),
                'length': ((end['x'] - start['x'])**2 + (end['y'] - start['y'])**2) ** 0.5
            })
        wall_segments[room] = segments
    return wall_segments

def find_and_calculate_overlaps(rooms):
    overlaps = {}
    for r1, walls1 in rooms.items():
        poly1 = Polygon([p for w in walls1 for p in w])
        for r2, walls2 in rooms.items():
            if r1 >= r2: continue
            poly2 = Polygon([p for w in walls2 for p in w])
            if poly1.intersects(poly2):
                overlaps[(r1, r2)] = poly1.intersection(poly2).area
    return overlaps

def solving_overlap_problem(overlaps, updated_rooms, original_rooms, new_room):
    for (r1, r2), area in overlaps.items():
        if r1 == new_room or r2 == new_room:
            main_room = r1 if r1 != new_room else r2
            # Get edge of the new room
            new_edges = [seg for seg in updated_rooms[new_room]]
            main_edges = [seg for seg in updated_rooms[main_room]]

            # Try to align left or right edges
            new_right = max(p[0] for wall in new_edges for p in wall)
            new_left = min(p[0] for wall in new_edges for p in wall)
            main_right = max(p[0] for wall in main_edges for p in wall)
            main_left = min(p[0] for wall in main_edges for p in wall)

            dx = 0
            if new_left < main_right:  # Overlap or gap
                dx = main_right - new_left

            # Apply shift to new room
            for i in range(len(updated_rooms[new_room])):
                for j in range(2):
                    updated_rooms[new_room][i][j][0] += dx

    return updated_rooms


# ===================== CORE LOGIC =====================

def add_new_room_flow(rooms, new_room_name, width, height, existing_room, direction):
    rooms = replace_near_values(rooms, threshold=0.2)
    is_valid, msg = validate_existing_rooms(rooms)
    if not is_valid:
        print(f"🚫 Cannot proceed: {msg}")
        return {}

    rooms_backup = copy.deepcopy(rooms)
    metadata = make_roomdata(rooms)

    if new_room_name in constraints:
        min_w = constraints[new_room_name]['min_width']
        min_h = constraints[new_room_name]['min_height']
        if width < min_w or height < min_h:
            print(f"🚫 Cannot add {new_room_name}. Minimum {min_w}x{min_h}, got {width}x{height}.")
            return {}

    print(f"✅ Adding {new_room_name} to {existing_room} ({direction})")

    existing_coords = rooms[existing_room]
    x_vals = [p[0] for wall in existing_coords for p in wall]
    y_vals = [p[1] for wall in existing_coords for p in wall]
    min_x, max_x = min(x_vals), max(x_vals)
    min_y, max_y = min(y_vals), max(y_vals)

    # Identify the shift axis and calculate potential conflict zone
    conflict_zone = None
    shift_axis = None

    if direction.lower() == 'right':
        new_room_box = (max_x, max_x + width)
        shift_axis = 'x'
        shift_direction = 1
    elif direction.lower() == 'left':
        new_room_box = (min_x - width, min_x)
        shift_axis = 'x'
        shift_direction = -1
    elif direction.lower() == 'top':
        new_room_box = (max_y, max_y + height)
        shift_axis = 'y'
        shift_direction = 1
    elif direction.lower() == 'bottom':
        new_room_box = (min_y - height, min_y)
        shift_axis = 'y'
        shift_direction = -1
    else:
        raise ValueError("Direction must be one of: right, left, top, bottom")

    # Shift any rooms that overlap with the target insertion space
    for room, coords in rooms.items():
        if room == existing_room:
            continue
        room_vals = [p[0] if shift_axis == 'x' else p[1] for wall in coords for p in wall]
        min_val, max_val = min(room_vals), max(room_vals)
        if max(new_room_box[0], min_val) < min(new_room_box[1], max_val):  # overlap
            current_size = max_val - min_val
            allowed = constraints.get(room, {}).get(f'min_{shift_axis}', 0)
            delta = (new_room_box[1] - min_val) if shift_direction > 0 else (new_room_box[0] - max_val)
            if current_size + delta * shift_direction < allowed:
                print(f"❌ Cannot shift '{room}'; would violate min {shift_axis}-size {allowed}.")
                return {}

            for wall in coords:
                for pt in wall:
                    pt[0 if shift_axis == 'x' else 1] += delta
            rooms[room] = coords

    # Add the new room now
    rooms = add_new_room(rooms, new_room_name, width, height, existing_room, direction, metadata)
    rooms = replace_near_values(rooms, threshold=0.2)
    metadata = make_roomdata(rooms)

    overlaps = find_and_calculate_overlaps(rooms)
    if overlaps:
        print("🔧 Solving Overlaps...")
        final_rooms = solving_overlap_problem(overlaps, rooms, rooms_backup, new_room_name)
    else:
        final_rooms = rooms

    return convert_all_rooms_to_walls(final_rooms)



def add_new_room(rooms, new_room_name, width, height, existing_room, direction, metadata):
    existing_coords = rooms[existing_room]
    x_vals = [p[0] for wall in existing_coords for p in wall]
    y_vals = [p[1] for wall in existing_coords for p in wall]

    direction = direction.lower()

    if direction == 'left':
        x0 = min(x_vals) - width
        y0 = min(y_vals)
    elif direction == 'right':
        x0 = max(x_vals)
        y0 = min(y_vals)
    elif direction == 'top':
        x0 = min(x_vals)
        y0 = max(y_vals)
    elif direction == 'bottom':
        x0 = min(x_vals)
        y0 = min(y_vals) - height
    else:
        raise ValueError("Direction must be one of 'left', 'right', 'top', 'bottom'.")

    if direction in ['left', 'right']:
        new_coords = [
            [[x0, y0], [x0 + width, y0]],
            [[x0 + width, y0], [x0 + width, y0 + height]],
            [[x0 + width, y0 + height], [x0, y0 + height]],
            [[x0, y0 + height], [x0, y0]]
        ]
    else:
        new_coords = [
            [[x0, y0], [x0 + width, y0]],
            [[x0 + width, y0], [x0 + width, y0 + height]],
            [[x0 + width, y0 + height], [x0, y0 + height]],
            [[x0, y0 + height], [x0, y0]]
        ]

    rooms[new_room_name] = new_coords
    return rooms


# ===================== PLOTTER =====================
def plot_floor_plan(rooms, title='Floor Plan'):
    fig, ax = plt.subplots(figsize=(10, 8))
    colors = {room: [random.random() for _ in range(3)] for room in rooms.keys()}
    for room, walls in rooms.items():
        color = colors[room]
        for wall in walls:
            (x1, y1), (x2, y2) = wall
            ax.plot([x1, x2], [y1, y2], color=color, linewidth=2)
        cx = sum([p[0] for w in walls for p in w]) / (2 * len(walls))
        cy = sum([p[1] for w in walls for p in w]) / (2 * len(walls))
        ax.text(cx, cy, room, ha='center', va='center', fontsize=10, weight='bold')
    ax.set_aspect('equal')
    plt.grid(True)
    plt.title(title, fontsize=14, weight='bold')
    plt.xlabel('X')
    plt.ylabel('Y')
    plt.show()

# ===================== MAIN =====================
def main():
    rooms = {
'Master Bedroom': [[[30, 30], [39.04, 30]],
  [[39.04, 30], [39.04, 17.61]],
  [[39.04, 17.61], [30, 17.61]],
  [[30, 17.61], [30, 30]]],
 'En suite Washroom': [[[34.97, 36.99], [39.26, 36.99]],
  [[39.26, 36.99], [39.26, 30.0]],
  [[39.26, 30.0], [34.97, 30.0]],
  [[34.97, 30.0], [34.97, 36.99]]],
 'Kitchen': [[[39.04, 25.07], [45.9, 25.07]],
  [[45.9, 25.07], [45.9, 16.68]],
  [[45.9, 16.68], [39.04, 16.68]],
  [[39.04, 16.68], [39.04, 25.07]]],
 'Common Washroom': [[[39.26, 34.52], [45.9, 34.52]],
  [[45.9, 34.52], [45.9, 30.0]],
  [[45.9, 30.0], [39.26, 30.0]],
  [[39.26, 30.0], [39.26, 34.52]]],
 'Living Room': [[[45.9, 34.52], [54.98, 34.52]],
  [[54.98, 34.52], [54.98, 19.47]],
  [[54.98, 19.47], [45.9, 19.47]],
  [[45.9, 19.47], [45.9, 34.52]]],
 'Passage': [[[39.04, 30], [45.9, 30]],
  [[45.9, 30], [45.9, 25.07]],
  [[45.9, 25.07], [39.04, 25.07]],
  [[39.04, 25.07], [39.04, 30]]]
    }

    new_room_name = "Study"
    width = 6
    height = 6
    existing_room = "Living Room"
    direction = "Left"

    wall_data = add_new_room_flow(
        rooms,
        new_room_name=new_room_name,
        width=width,
        height=height,
        existing_room=existing_room,
        direction=direction
    )

    print("\n🧱 Final Wall Segments:")
    from pprint import pprint
    pprint(wall_data)

    plot_floor_plan(wall_segments_to_rooms(wall_data), title="Final Floor Plan")

if __name__ == "__main__":
    main()
