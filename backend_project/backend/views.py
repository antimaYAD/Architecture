from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from src.test_area import generate_floorplan_main
from src.adjust_dimension import adjust_dimension_main
# from src.new_room_placement import add_new_room_main
import json
import traceback

@api_view(['POST'])
def generate_floorplan_func(request):
    try:
        data = request.data

        # Required fields
        template = data.get('template')  # e.g., "1BHK_template5"
        flat_area = data.get('flatArea')
        flat_type = data.get('type')

        if not template:
            return Response({'error': 'Template is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if flat_area is None:
            return Response({'error': 'Flat area is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not flat_type:
            return Response({'error': 'Flat type is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            flat_area = float(flat_area)
        except (ValueError, TypeError):
            return Response({'error': 'Flat area must be a number.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            type_key, template_number = template.split('_')
        except ValueError:
            return Response({'error': 'Invalid template format.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with open('src/converted_coordinates.json') as f:
                coordinates_data = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return Response({'error': 'Unable to load template coordinates.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            template_coords = coordinates_data[type_key][template_number]
        except KeyError:
            return Response({'error': 'Template not found in coordinate file.'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate floorplan
        try:
            walls, doors, windows, ducts = generate_floorplan_main(template_coords, flat_type, flat_area)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': f'Error generating floorplan: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            'walls': walls,
            'doors': doors,
            'windows': windows,
            'ducts': ducts
        }, status=status.HTTP_200_OK)

    except Exception as e:
        traceback.print_exc()
        return Response({'error': f'Unexpected server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    except Exception as e:
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# @api_view(['POST'])
# def adjust_dimension_func(request):
#     try:
#         # Access the entire JSON data
#         data = request.data
 
#         # Extract required fields
#         fixed_dimension = data.get('roomDimensions')  # For example: "1BHK_template5"
#         canvas_coords = data.get('data')
#         freeze = data.get('freeze')
 
#         # Ensure required fields are provided
#         if not fixed_dimension:
#             return Response({'error': 'roomDimensions is required.'}, status=status.HTTP_400_BAD_REQUEST)
#         if not canvas_coords:
#             return Response({'error': 'data is required.'}, status=status.HTTP_400_BAD_REQUEST)
#         if not freeze:
#             return Response({'error': 'freeze is required.'}, status=status.HTTP_400_BAD_REQUEST)
       
       
#         # Include the coordinates in the response data
#         response_data = adjust_dimension_main(canvas_coords,fixed_dimension,freeze)
 
#         return Response(response_data, status=status.HTTP_200_OK)
#     except Exception as e:
#         return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
 
 
# @api_view(['POST'])
# def add_new_room_func(request):
#     try:
#         # Access the entire JSON data
#         data = request.data
 
#         # Extract required fields
#         roomName = data.get('roomName')  # For example: "1BHK_template5"
#         adjacentRoom = data.get('adjacentRoom')
#         direction = data.get('direction')
#         area = data.get('area')
#         roomWidth = data.get('roomWidth')
#         roomHeight = data.get('roomHeight')
#         coordinates = data.get('coordinates')
#         # freeze = data.get('coordinates')
#         # Ensure required fields are provided
#         if not roomName:
#             return Response({'error': 'roomName is required.'}, status=status.HTTP_400_BAD_REQUEST)
#         if not adjacentRoom:
#             return Response({'error': 'adjacentRoom is required.'}, status=status.HTTP_400_BAD_REQUEST)
#         if not direction:
#             return Response({'error': 'direction is required.'}, status=status.HTTP_400_BAD_REQUEST)
#         if not area:
#             return Response({'error': 'area is required.'}, status=status.HTTP_400_BAD_REQUEST)
#         if not roomWidth:
#             return Response({'error': 'roomWidth is required.'}, status=status.HTTP_400_BAD_REQUEST)
#         if not roomHeight:
#             return Response({'error': 'roomHeight is required.'}, status=status.HTTP_400_BAD_REQUEST)
#         if not coordinates:
#             return Response({'error': 'coordinates is required.'}, status=status.HTTP_400_BAD_REQUEST)        
#         # if not freeze:
#         #     return Response({'error': 'freeze is required.'}, status=status.HTTP_400_BAD_REQUEST)
               
#         # Include the coordinates in the response data
#         response_data = add_new_room_main(coordinates, roomName, roomWidth, roomHeight, adjacentRoom, direction)
 
#         return Response(response_data, status=status.HTTP_200_OK)
#     except Exception as e:
#         return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)