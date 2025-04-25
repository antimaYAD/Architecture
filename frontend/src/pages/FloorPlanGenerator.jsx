// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { Stage, Layer, Line, Group, Text, Circle } from "react-konva";

// // Components and utils imports
// import StatusBar from "../components/StatusBar";
// import ToolControls from "../components/ToolControls";
// import WallTool from "../components/WallTool";
// import { getOptimalPixelRatio } from "../utils/renderUtils";
// import {
//   canvasToScreenCoordinates,
//   screenToCanvasCoordinates,
// } from "../utils/coordinateUtils";

// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// const FloorPlanGenerator = () => {
//   const navigate = useNavigate();

//   // State for template selection and parameters
//   const [template, setTemplate] = useState("1BHK_template5");
//   const [flatArea, setFlatArea] = useState(450);
//   const [flatType, setFlatType] = useState("1BHK");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [generatedFloorPlan, setGeneratedFloorPlan] = useState(null);

//   // Canvas state
//   const [zoom, setZoom] = useState(1);
//   const [pan, setPan] = useState({ x: 0, y: 0 });
//   const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
//   const [hoveredPosition, setHoveredPosition] = useState(null);
//   const [isPanMode, setIsPanMode] = useState(false);
//   const [snapEnabled, setSnapEnabled] = useState(true);

//   // Room adjustment state
//   const [adjustingRoom, setAdjustingRoom] = useState(null);
//   const [roomDimensions, setRoomDimensions] = useState({});

//   // Available templates
//   const templates = [
//     { id: "1BHK_template1", name: "Template 1", type: "1BHK" },
//     { id: "1BHK_template2", name: "Template 2", type: "1BHK" },
//     { id: "1BHK_template3", name: "Template 3", type: "1BHK" },
//     { id: "1BHK_template4", name: "Template 4", type: "1BHK" },
//     { id: "1BHK_template5", name: "Template 5", type: "1BHK" },
//     { id: "1BHK_template6", name: "Template 6", type: "1BHK" },
//     { id: "1BHK_template7", name: "Template 7", type: "1BHK" },
//     { id: "1BHK_template8", name: "Template 8", type: "1BHK" },
//     { id: "1BHK_template9", name: "Template 9", type: "1BHK" },
//     { id: "1BHK_template10", name: "Template 10", type: "1BHK" },
//     { id: "2BHK_template1", name: "Template 1", type: "2BHK" },
//     { id: "2BHK_template2", name: "Template 2", type: "2BHK" },
//     { id: "2BHK_template3", name: "Template 3", type: "2BHK" },
//     { id: "2BHK_template4", name: "Template 4", type: "2BHK" },
//     { id: "2BHK_template5", name: "Template 5", type: "2BHK" },
//     { id: "2BHK_template6", name: "Template 6", type: "2BHK" },
//     { id: "2BHK_template7", name: "Template 7", type: "2BHK" },
//     { id: "2BHK_template8", name: "Template 8", type: "2BHK" },
//     { id: "2BHK_template9", name: "Template 9", type: "2BHK" },
//     { id: "2BHK_template10", name: "Template 10", type: "2BHK" },
//   ];

//   // Filtered templates based on selected flat type
//   const filteredTemplates = templates.filter((t) => t.type === flatType);

//   // Handle flat type change
//   const handleFlatTypeChange = (e) => {
//     const newType = e.target.value;
//     setFlatType(newType);

//     // Select the first template of the new type
//     const firstTemplateOfType = templates.find((t) => t.type === newType);
//     if (firstTemplateOfType) {
//       setTemplate(firstTemplateOfType.id);
//     }
//   };

//   // Generate floor plan
//   const generateFloorPlan = async () => {
//     setLoading(true);
//     setError("");

//     try {
//       const response = await axios.post(`${API_URL}/generate_floorplan/`, {
//         template,
//         flatArea,
//         type: flatType,
//       });

//       if (response.data) {
//         console.log("Generated floor plan:", response.data);
//         setGeneratedFloorPlan(response.data);

//         // Center the view on the generated plan
//         setTimeout(() => {
//           setPan({
//             x: stageSize.width / 2,
//             y: stageSize.height / 2,
//           });
//         }, 100);
//       }
//     } catch (err) {
//       console.error("Error generating floor plan:", err);
//       setError(err.response?.data?.error || "Failed to generate floor plan");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Adjust room dimensions
//   const handleRoomClick = (roomName) => {
//     if (!generatedFloorPlan) return;

//     setAdjustingRoom(roomName);

//     // Get current dimensions from the floor plan
//     const roomCoords = generatedFloorPlan[roomName];
//     if (roomCoords) {
//       // Calculate width and height
//       const minX = Math.min(
//         ...roomCoords.flatMap((line) => [line[0][0], line[1][0]])
//       );
//       const maxX = Math.max(
//         ...roomCoords.flatMap((line) => [line[0][0], line[1][0]])
//       );
//       const minY = Math.min(
//         ...roomCoords.flatMap((line) => [line[0][1], line[1][1]])
//       );
//       const maxY = Math.max(
//         ...roomCoords.flatMap((line) => [line[0][1], line[1][1]])
//       );

//       setRoomDimensions({
//         ...roomDimensions,
//         [roomName]: {
//           width: maxX - minX,
//           height: maxY - minY,
//         },
//       });
//     }
//   };

//   // Save adjusted room dimensions
//   const saveRoomDimensions = async () => {
//     if (!adjustingRoom || !generatedFloorPlan) return;

//     setLoading(true);
//     setError("");

//     try {
//       const response = await axios.post(`${API_URL}/adjust_dimension/`, {
//         roomDimensions: {
//           [adjustingRoom]: roomDimensions[adjustingRoom],
//         },
//         data: generatedFloorPlan,
//         freeze: "Yes", // Keep total area constant
//       });

//       if (response.data) {
//         console.log("Adjusted floor plan:", response.data);
//         setGeneratedFloorPlan(response.data);
//         setAdjustingRoom(null);
//       }
//     } catch (err) {
//       console.error("Error adjusting room:", err);
//       setError(err.response?.data?.error || "Failed to adjust room dimensions");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Add new room
//   const [addingRoom, setAddingRoom] = useState(false);
//   const [newRoomData, setNewRoomData] = useState({
//     roomName: "",
//     adjacentRoom: "",
//     direction: "Top",
//     area: 100,
//     roomWidth: 10,
//     roomHeight: 10,
//   });

//   const handleAddRoom = async () => {
//     if (!generatedFloorPlan) return;

//     setLoading(true);
//     setError("");

//     try {
//       const response = await axios.post(`${API_URL}/add_new_room/`, {
//         ...newRoomData,
//         coordinates: generatedFloorPlan,
//       });

//       if (response.data) {
//         console.log("Updated floor plan with new room:", response.data);
//         setGeneratedFloorPlan(response.data);
//         setAddingRoom(false);
//         // Reset new room data
//         setNewRoomData({
//           roomName: "",
//           adjacentRoom: "",
//           direction: "Top",
//           area: 100,
//           roomWidth: 10,
//           roomHeight: 10,
//         });
//       }
//     } catch (err) {
//       console.error("Error adding room:", err);
//       setError(err.response?.data?.error || "Failed to add new room");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Convert wall segments to Konva lines for rendering
//   // Fix for the convertToWalls function
//   const convertToWalls = (floorPlan) => {
//     if (!floorPlan) return [];

//     const walls = [];

//     // Create walls from each room's lines
//     Object.entries(floorPlan).forEach(([roomName, roomLines]) => {
//       // Make sure roomLines is an array before iterating
//       if (Array.isArray(roomLines)) {
//         roomLines.forEach((line, lineIndex) => {
//           // Make sure line is an array with at least 2 items before destructuring
//           if (Array.isArray(line) && line.length >= 2) {
//             const [start, end] = line;
//             // Make sure start and end are arrays with at least 2 items
//             if (
//               Array.isArray(start) &&
//               start.length >= 2 &&
//               Array.isArray(end) &&
//               end.length >= 2
//             ) {
//               walls.push({
//                 id: `${roomName}-${lineIndex}`,
//                 roomName,
//                 start: { x: start[0], y: start[1] },
//                 end: { x: end[0], y: end[1] },
//                 thickness: 30, // Default thickness in mm
//               });
//             }
//           }
//         });
//       }
//     });

//     return walls;
//   };

//   // Transform walls to screen coordinates
//   const transformWalls = (walls) => {
//     return walls.map((wall) => ({
//       ...wall,
//       start: canvasToScreenCoordinates(wall.start, pan, zoom),
//       end: canvasToScreenCoordinates(wall.end, pan, zoom),
//     }));
//   };

//   // Toggle pan mode
//   const toggleMode = () => {
//     setIsPanMode(!isPanMode);
//   };

//   // Toggle snap
//   const toggleSnap = () => {
//     setSnapEnabled(!snapEnabled);
//   };

//   // Handle mouse move for status bar
//   const handleMouseMove = (e) => {
//     const stage = e.target.getStage();
//     const pointerPosition = stage.getPointerPosition();
//     const canvasPoint = screenToCanvasCoordinates(pointerPosition, pan, zoom);
//     setHoveredPosition(canvasPoint);
//   };

//   // Handle canvas export
//   const exportToCanvas = () => {
//     if (!generatedFloorPlan) return;

//     // Convert the floor plan to a format compatible with the Canvas page
//     const walls = convertToWalls(generatedFloorPlan);

//     // Store walls in localStorage to pass to Canvas page
//     localStorage.setItem("importedWalls", JSON.stringify(walls));

//     // Navigate to canvas page
//     navigate("/canvas");
//   };

//   return (
//     <div className="p-4 relative">
//       <h2 className="text-xl font-bold mb-2">Floor Plan Generator</h2>

//       <div className="flex flex-wrap mb-6 gap-4">
//         <div className="w-full md:w-80 bg-white p-4 rounded-md shadow">
//           <h3 className="text-lg font-semibold mb-4">Generator Settings</h3>

//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Flat Type
//             </label>
//             <select
//               value={flatType}
//               onChange={handleFlatTypeChange}
//               className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//             >
//               <option value="1BHK">1 BHK</option>
//               <option value="2BHK">2 BHK</option>
//             </select>
//           </div>

//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Template
//             </label>
//             <select
//               value={template}
//               onChange={(e) => setTemplate(e.target.value)}
//               className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//             >
//               {filteredTemplates.map((t) => (
//                 <option key={t.id} value={t.id}>
//                   {t.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Flat Area (sq. ft)
//             </label>
//             <input
//               type="number"
//               value={flatArea}
//               onChange={(e) => setFlatArea(Number(e.target.value))}
//               min="300"
//               step="10"
//               className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//             />
//             <p className="text-xs text-gray-500 mt-1">
//               Minimum area: 300 sq. ft for 1BHK, 525 sq. ft for 2BHK
//             </p>
//           </div>

//           <button
//             onClick={generateFloorPlan}
//             disabled={loading}
//             className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {loading ? "Generating..." : "Generate Floor Plan"}
//           </button>

//           {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}

//           {generatedFloorPlan && (
//             <div className="mt-4">
//               <button
//                 onClick={exportToCanvas}
//                 className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md shadow-sm"
//               >
//                 Edit in Canvas
//               </button>
//             </div>
//           )}
//         </div>

//         {generatedFloorPlan && (
//           <div className="w-full md:w-80 bg-white p-4 rounded-md shadow">
//             <h3 className="text-lg font-semibold mb-4">Room Adjustments</h3>

//             {adjustingRoom ? (
//               <div>
//                 <h4 className="font-medium text-gray-800 mb-2">
//                   Adjusting: {adjustingRoom}
//                 </h4>

//                 <div className="mb-3">
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Width (mm)
//                   </label>
//                   <input
//                     type="number"
//                     value={roomDimensions[adjustingRoom]?.width || 0}
//                     onChange={(e) =>
//                       setRoomDimensions({
//                         ...roomDimensions,
//                         [adjustingRoom]: {
//                           ...roomDimensions[adjustingRoom],
//                           width: Number(e.target.value),
//                         },
//                       })
//                     }
//                     min="0"
//                     step="1"
//                     className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                   />
//                 </div>

//                 <div className="mb-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Height (mm)
//                   </label>
//                   <input
//                     type="number"
//                     value={roomDimensions[adjustingRoom]?.height || 0}
//                     onChange={(e) =>
//                       setRoomDimensions({
//                         ...roomDimensions,
//                         [adjustingRoom]: {
//                           ...roomDimensions[adjustingRoom],
//                           height: Number(e.target.value),
//                         },
//                       })
//                     }
//                     min="0"
//                     step="1"
//                     className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                   />
//                 </div>

//                 <div className="flex space-x-2">
//                   <button
//                     onClick={saveRoomDimensions}
//                     disabled={loading}
//                     className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {loading ? "Saving..." : "Save Changes"}
//                   </button>

//                   <button
//                     onClick={() => setAdjustingRoom(null)}
//                     className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md shadow-sm"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             ) : addingRoom ? (
//               <div>
//                 <h4 className="font-medium text-gray-800 mb-2">Add New Room</h4>

//                 <div className="mb-3">
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Room Name
//                   </label>
//                   <input
//                     type="text"
//                     value={newRoomData.roomName}
//                     onChange={(e) =>
//                       setNewRoomData({
//                         ...newRoomData,
//                         roomName: e.target.value,
//                       })
//                     }
//                     className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                     placeholder="Balcony, Study, etc."
//                   />
//                 </div>

//                 <div className="mb-3">
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Adjacent Room
//                   </label>
//                   <select
//                     value={newRoomData.adjacentRoom}
//                     onChange={(e) =>
//                       setNewRoomData({
//                         ...newRoomData,
//                         adjacentRoom: e.target.value,
//                       })
//                     }
//                     className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                   >
//                     <option value="">Select a room</option>
//                     {Object.keys(generatedFloorPlan).map((room) => (
//                       <option key={room} value={room}>
//                         {room}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="mb-3">
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Direction
//                   </label>
//                   <select
//                     value={newRoomData.direction}
//                     onChange={(e) =>
//                       setNewRoomData({
//                         ...newRoomData,
//                         direction: e.target.value,
//                       })
//                     }
//                     className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                   >
//                     <option value="Top">Top</option>
//                     <option value="Bottom">Bottom</option>
//                     <option value="Left">Left</option>
//                     <option value="Right">Right</option>
//                   </select>
//                 </div>

//                 <div className="mb-3">
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Width (mm)
//                   </label>
//                   <input
//                     type="number"
//                     value={newRoomData.roomWidth}
//                     onChange={(e) =>
//                       setNewRoomData({
//                         ...newRoomData,
//                         roomWidth: Number(e.target.value),
//                       })
//                     }
//                     min="3"
//                     step="0.1"
//                     className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                   />
//                 </div>

//                 <div className="mb-3">
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Height (mm)
//                   </label>
//                   <input
//                     type="number"
//                     value={newRoomData.roomHeight}
//                     onChange={(e) =>
//                       setNewRoomData({
//                         ...newRoomData,
//                         roomHeight: Number(e.target.value),
//                       })
//                     }
//                     min="3"
//                     step="0.1"
//                     className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                   />
//                 </div>

//                 <div className="mb-3">
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Area (sq. ft)
//                   </label>
//                   <input
//                     type="number"
//                     value={newRoomData.area}
//                     onChange={(e) =>
//                       setNewRoomData({
//                         ...newRoomData,
//                         area: Number(e.target.value),
//                       })
//                     }
//                     min="10"
//                     step="1"
//                     className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                   />
//                 </div>

//                 <div className="flex space-x-2">
//                   <button
//                     onClick={handleAddRoom}
//                     disabled={
//                       loading ||
//                       !newRoomData.roomName ||
//                       !newRoomData.adjacentRoom
//                     }
//                     className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {loading ? "Adding..." : "Add Room"}
//                   </button>

//                   <button
//                     onClick={() => setAddingRoom(false)}
//                     className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md shadow-sm"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div>
//                 <p className="text-sm text-gray-600 mb-4">
//                   Click on a room in the floor plan to adjust its dimensions
//                 </p>

//                 <button
//                   onClick={() => setAddingRoom(true)}
//                   className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm"
//                 >
//                   Add New Room
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       <StatusBar
//         canvasMode="infinite"
//         zoom={zoom}
//         isPanMode={isPanMode}
//         hoveredPosition={hoveredPosition}
//         isDrawingChain={false}
//         snapEnabled={snapEnabled}
//       />

//       <div
//         className="relative bg-gray-100 overflow-hidden"
//         style={{ height: "600px" }}
//       >
//         {generatedFloorPlan ? (
//           <Stage
//             width={stageSize.width}
//             height={stageSize.height}
//             onMouseMove={handleMouseMove}
//             pixelRatio={getOptimalPixelRatio()}
//           >
//             <Layer>
//               <WallTool
//                 walls={transformWalls(convertToWalls(generatedFloorPlan))}
//                 preview={null}
//                 onWallClick={(index) => {
//                   const wall = convertToWalls(generatedFloorPlan)[index];
//                   if (wall) handleRoomClick(wall.roomName);
//                 }}
//                 onEndpointHover={() => {}}
//                 onEndpointLeave={() => {}}
//                 hoveredEndpoint={null}
//                 selectedWallIndex={-1}
//                 zoom={zoom}
//                 showMeasurements={true}
//               />

//               {/* Room Labels */}
//               {Object.entries(generatedFloorPlan).map(
//                 ([roomName, roomLines]) => {
//                   // Calculate room center
//                   const allPoints = roomLines.flatMap((line) => [
//                     line[0],
//                     line[1],
//                   ]);
//                   const sumX = allPoints.reduce(
//                     (sum, point) => sum + point[0],
//                     0
//                   );
//                   const sumY = allPoints.reduce(
//                     (sum, point) => sum + point[1],
//                     0
//                   );
//                   const centerX = sumX / allPoints.length;
//                   const centerY = sumY / allPoints.length;

//                   const screenPoint = canvasToScreenCoordinates(
//                     { x: centerX, y: centerY },
//                     pan,
//                     zoom
//                   );

//                   return (
//                     <Group key={roomName}>
//                       <Text
//                         x={screenPoint.x}
//                         y={screenPoint.y}
//                         text={roomName}
//                         fontSize={16 * zoom}
//                         fill="#333"
//                         align="center"
//                         verticalAlign="middle"
//                         offsetX={50 * zoom}
//                         offsetY={8 * zoom}
//                         fontStyle="bold"
//                         onClick={() => handleRoomClick(roomName)}
//                       />
//                     </Group>
//                   );
//                 }
//               )}
//             </Layer>
//           </Stage>
//         ) : (
//           <div className="flex items-center justify-center h-full bg-gray-100">
//             <p className="text-gray-500">
//               Generate a floor plan to view it here
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default FloorPlanGenerator;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Stage, Layer, Line, Group, Text, Circle } from "react-konva";

// Components and utils imports
import StatusBar from "../components/StatusBar";
import ToolControls from "../components/ToolControls";
import WallTool from "../components/WallTool";
import { getOptimalPixelRatio } from "../utils/renderUtils";
import {
  canvasToScreenCoordinates,
  screenToCanvasCoordinates,
} from "../utils/coordinateUtils";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const FloorPlanGenerator = () => {
  const navigate = useNavigate();

  // State for template selection and parameters
  const [template, setTemplate] = useState("1BHK_template5");
  const [flatArea, setFlatArea] = useState(450);
  const [flatType, setFlatType] = useState("1BHK");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedFloorPlan, setGeneratedFloorPlan] = useState(null);

  // Canvas state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [hoveredPosition, setHoveredPosition] = useState(null);
  const [isPanMode, setIsPanMode] = useState(false);
  const [snapEnabled, setSnapEnabled] = useState(true);

  // Room adjustment state
  const [adjustingRoom, setAdjustingRoom] = useState(null);
  const [roomDimensions, setRoomDimensions] = useState({});

  // Available templates
  const templates = [
    { id: "1BHK_template1", name: "Template 1", type: "1BHK" },
    { id: "1BHK_template2", name: "Template 2", type: "1BHK" },
    { id: "1BHK_template3", name: "Template 3", type: "1BHK" },
    { id: "1BHK_template4", name: "Template 4", type: "1BHK" },
    { id: "1BHK_template5", name: "Template 5", type: "1BHK" },
    { id: "1BHK_template6", name: "Template 6", type: "1BHK" },
    { id: "1BHK_template7", name: "Template 7", type: "1BHK" },
    { id: "1BHK_template8", name: "Template 8", type: "1BHK" },
    { id: "1BHK_template9", name: "Template 9", type: "1BHK" },
    { id: "1BHK_template10", name: "Template 10", type: "1BHK" },
    { id: "2BHK_template1", name: "Template 1", type: "2BHK" },
    { id: "2BHK_template2", name: "Template 2", type: "2BHK" },
    { id: "2BHK_template3", name: "Template 3", type: "2BHK" },
    { id: "2BHK_template4", name: "Template 4", type: "2BHK" },
    { id: "2BHK_template5", name: "Template 5", type: "2BHK" },
    { id: "2BHK_template6", name: "Template 6", type: "2BHK" },
    { id: "2BHK_template7", name: "Template 7", type: "2BHK" },
    { id: "2BHK_template8", name: "Template 8", type: "2BHK" },
    { id: "2BHK_template9", name: "Template 9", type: "2BHK" },
    { id: "2BHK_template10", name: "Template 10", type: "2BHK" },
  ];

  // Update stage size on window resize
  useEffect(() => {
    const handleResize = () => {
      // Set stage to fit container with some padding
      const containerWidth = window.innerWidth - 40;
      const containerHeight = window.innerHeight - 400; // Adjust based on UI elements
      setStageSize({ width: containerWidth, height: containerHeight });
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial size

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filtered templates based on selected flat type
  const filteredTemplates = templates.filter((t) => t.type === flatType);

  // Handle flat type change
  const handleFlatTypeChange = (e) => {
    const newType = e.target.value;
    setFlatType(newType);

    // Select the first template of the new type
    const firstTemplateOfType = templates.find((t) => t.type === newType);
    if (firstTemplateOfType) {
      setTemplate(firstTemplateOfType.id);
    }
  };

  // Generate floor plan
  const generateFloorPlan = async () => {
    setLoading(true);
    setError("");

    try {
      console.log("Sending request with:", {
        template,
        flatArea,
        type: flatType,
      });

      const response = await axios.post(`${API_URL}/generate_floorplan/`, {
        template,
        flatArea,
        type: flatType,
      });

      if (response.data) {
        console.log("Response received successfully");
        console.log("Generated floor plan data:", response.data);

        // Check the structure of the data
        if (typeof response.data === "object") {
          console.log("Root data type: Object");

          // Check each room
          Object.entries(response.data).forEach(([roomName, roomData]) => {
            console.log(
              `Room: ${roomName}, Data type: ${typeof roomData}, Is Array: ${Array.isArray(
                roomData
              )}`
            );

            if (Array.isArray(roomData)) {
              console.log(
                `  Room ${roomName} has ${roomData.length} line segments`
              );

              // Check first line sample
              if (roomData.length > 0) {
                const sampleLine = roomData[0];
                console.log(
                  `  Sample line type: ${typeof sampleLine}, Is Array: ${Array.isArray(
                    sampleLine
                  )}`
                );

                if (Array.isArray(sampleLine) && sampleLine.length >= 2) {
                  const [start, end] = sampleLine;
                  console.log(
                    `    Start point type: ${typeof start}, Is Array: ${Array.isArray(
                      start
                    )}`
                  );
                  console.log(
                    `    End point type: ${typeof end}, Is Array: ${Array.isArray(
                      end
                    )}`
                  );

                  if (Array.isArray(start) && start.length >= 2) {
                    console.log(
                      `    Start coordinates: [${start[0]}, ${start[1]}]`
                    );
                  }

                  if (Array.isArray(end) && end.length >= 2) {
                    console.log(`    End coordinates: [${end[0]}, ${end[1]}]`);
                  }
                }
              }
            }
          });
        }

        setGeneratedFloorPlan(response.data);

        // Center the view on the generated plan
        setTimeout(() => {
          setPan({
            x: stageSize.width / 2,
            y: stageSize.height / 2,
          });
        }, 100);
      } else {
        console.error("Response data is empty or undefined");
        setError("Received empty response from server");
      }
    } catch (err) {
      console.error("Error generating floor plan:", err);
      console.error("Error details:", err.response?.data);
      setError(err.response?.data?.error || "Failed to generate floor plan");
    } finally {
      setLoading(false);
    }
  };

  // Adjust room dimensions
  const handleRoomClick = (roomName) => {
    if (!generatedFloorPlan) return;

    setAdjustingRoom(roomName);

    // Get current dimensions from the floor plan
    const roomCoords = generatedFloorPlan[roomName];
    if (roomCoords && Array.isArray(roomCoords) && roomCoords.length > 0) {
      try {
        // Collect all points to find min/max values
        const allXValues = [];
        const allYValues = [];

        roomCoords.forEach((line) => {
          if (Array.isArray(line) && line.length >= 2) {
            const [start, end] = line;
            if (Array.isArray(start) && start.length >= 2) {
              allXValues.push(start[0]);
              allYValues.push(start[1]);
            }
            if (Array.isArray(end) && end.length >= 2) {
              allXValues.push(end[0]);
              allYValues.push(end[1]);
            }
          }
        });

        if (allXValues.length === 0 || allYValues.length === 0) {
          console.error("Not enough valid points to calculate dimensions");
          return;
        }

        // Calculate width and height
        const minX = Math.min(...allXValues);
        const maxX = Math.max(...allXValues);
        const minY = Math.min(...allYValues);
        const maxY = Math.max(...allYValues);

        setRoomDimensions({
          ...roomDimensions,
          [roomName]: {
            width: maxX - minX,
            height: maxY - minY,
          },
        });
      } catch (error) {
        console.error("Error calculating room dimensions:", error);
      }
    }
  };

  // Save adjusted room dimensions
  const saveRoomDimensions = async () => {
    if (!adjustingRoom || !generatedFloorPlan) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_URL}/adjust_dimension/`, {
        roomDimensions: {
          [adjustingRoom]: roomDimensions[adjustingRoom],
        },
        data: generatedFloorPlan,
        freeze: "Yes", // Keep total area constant
      });

      if (response.data) {
        console.log("Adjusted floor plan:", response.data);
        setGeneratedFloorPlan(response.data);
        setAdjustingRoom(null);
      }
    } catch (err) {
      console.error("Error adjusting room:", err);
      setError(err.response?.data?.error || "Failed to adjust room dimensions");
    } finally {
      setLoading(false);
    }
  };

  // Add new room
  const [addingRoom, setAddingRoom] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    roomName: "",
    adjacentRoom: "",
    direction: "Top",
    area: 100,
    roomWidth: 10,
    roomHeight: 10,
  });

  const handleAddRoom = async () => {
    if (!generatedFloorPlan) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_URL}/add_new_room/`, {
        ...newRoomData,
        coordinates: generatedFloorPlan,
      });

      if (response.data) {
        console.log("Updated floor plan with new room:", response.data);
        setGeneratedFloorPlan(response.data);
        setAddingRoom(false);
        // Reset new room data
        setNewRoomData({
          roomName: "",
          adjacentRoom: "",
          direction: "Top",
          area: 100,
          roomWidth: 10,
          roomHeight: 10,
        });
      }
    } catch (err) {
      console.error("Error adding room:", err);
      setError(err.response?.data?.error || "Failed to add new room");
    } finally {
      setLoading(false);
    }
  };

  // Convert wall segments to Konva lines for rendering
  const convertToWalls = (floorPlan) => {
    if (!floorPlan) return [];

    const walls = [];

    // Create walls from each room's lines
    Object.entries(floorPlan).forEach(([roomName, roomLines]) => {
      // Make sure roomLines is an array before iterating
      if (Array.isArray(roomLines)) {
        roomLines.forEach((line, lineIndex) => {
          // Make sure line is an array with at least 2 items before destructuring
          if (Array.isArray(line) && line.length >= 2) {
            const [start, end] = line;
            // Make sure start and end are arrays with at least 2 items
            if (
              Array.isArray(start) &&
              start.length >= 2 &&
              Array.isArray(end) &&
              end.length >= 2
            ) {
              walls.push({
                id: `${roomName}-${lineIndex}`,
                roomName,
                start: { x: start[0], y: start[1] },
                end: { x: end[0], y: end[1] },
                thickness: 30, // Default thickness in mm
              });
            }
          }
        });
      }
    });

    return walls;
  };

  // Transform walls to screen coordinates
  const transformWalls = (walls) => {
    return walls.map((wall) => ({
      ...wall,
      start: canvasToScreenCoordinates(wall.start, pan, zoom),
      end: canvasToScreenCoordinates(wall.end, pan, zoom),
    }));
  };

  // Toggle pan mode
  const toggleMode = () => {
    setIsPanMode(!isPanMode);
  };

  // Toggle snap
  const toggleSnap = () => {
    setSnapEnabled(!snapEnabled);
  };

  // Handle mouse move for status bar
  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    const canvasPoint = screenToCanvasCoordinates(pointerPosition, pan, zoom);
    setHoveredPosition(canvasPoint);
  };

  // Handle canvas export
  const exportToCanvas = () => {
    if (!generatedFloorPlan) return;

    // Convert the floor plan to a format compatible with the Canvas page
    const walls = convertToWalls(generatedFloorPlan);

    // Store walls in localStorage to pass to Canvas page
    localStorage.setItem("importedWalls", JSON.stringify(walls));

    // Navigate to canvas page
    navigate("/canvas");
  };

  return (
    <div className="p-4 relative">
      <h2 className="text-xl font-bold mb-2">Floor Plan Generator</h2>

      <div className="flex flex-wrap mb-6 gap-4">
        <div className="w-full md:w-80 bg-white p-4 rounded-md shadow">
          <h3 className="text-lg font-semibold mb-4">Generator Settings</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Flat Type
            </label>
            <select
              value={flatType}
              onChange={handleFlatTypeChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="1BHK">1 BHK</option>
              <option value="2BHK">2 BHK</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template
            </label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {filteredTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Flat Area (sq. ft)
            </label>
            <input
              type="number"
              value={flatArea}
              onChange={(e) => setFlatArea(Number(e.target.value))}
              min="300"
              step="10"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum area: 300 sq. ft for 1BHK, 525 sq. ft for 2BHK
            </p>
          </div>

          <button
            onClick={generateFloorPlan}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Generating..." : "Generate Floor Plan"}
          </button>

          {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}

          {generatedFloorPlan && (
            <div className="mt-4">
              <button
                onClick={exportToCanvas}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md shadow-sm"
              >
                Edit in Canvas
              </button>
            </div>
          )}
        </div>

        {generatedFloorPlan && (
          <div className="w-full md:w-80 bg-white p-4 rounded-md shadow">
            <h3 className="text-lg font-semibold mb-4">Room Adjustments</h3>

            {adjustingRoom ? (
              <div>
                <h4 className="font-medium text-gray-800 mb-2">
                  Adjusting: {adjustingRoom}
                </h4>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Width (mm)
                  </label>
                  <input
                    type="number"
                    value={roomDimensions[adjustingRoom]?.width || 0}
                    onChange={(e) =>
                      setRoomDimensions({
                        ...roomDimensions,
                        [adjustingRoom]: {
                          ...roomDimensions[adjustingRoom],
                          width: Number(e.target.value),
                        },
                      })
                    }
                    min="0"
                    step="1"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height (mm)
                  </label>
                  <input
                    type="number"
                    value={roomDimensions[adjustingRoom]?.height || 0}
                    onChange={(e) =>
                      setRoomDimensions({
                        ...roomDimensions,
                        [adjustingRoom]: {
                          ...roomDimensions[adjustingRoom],
                          height: Number(e.target.value),
                        },
                      })
                    }
                    min="0"
                    step="1"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={saveRoomDimensions}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    onClick={() => setAdjustingRoom(null)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md shadow-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : addingRoom ? (
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Add New Room</h4>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Name
                  </label>
                  <input
                    type="text"
                    value={newRoomData.roomName}
                    onChange={(e) =>
                      setNewRoomData({
                        ...newRoomData,
                        roomName: e.target.value,
                      })
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Balcony, Study, etc."
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adjacent Room
                  </label>
                  <select
                    value={newRoomData.adjacentRoom}
                    onChange={(e) =>
                      setNewRoomData({
                        ...newRoomData,
                        adjacentRoom: e.target.value,
                      })
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a room</option>
                    {Object.keys(generatedFloorPlan).map((room) => (
                      <option key={room} value={room}>
                        {room}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Direction
                  </label>
                  <select
                    value={newRoomData.direction}
                    onChange={(e) =>
                      setNewRoomData({
                        ...newRoomData,
                        direction: e.target.value,
                      })
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="Top">Top</option>
                    <option value="Bottom">Bottom</option>
                    <option value="Left">Left</option>
                    <option value="Right">Right</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Width (mm)
                  </label>
                  <input
                    type="number"
                    value={newRoomData.roomWidth}
                    onChange={(e) =>
                      setNewRoomData({
                        ...newRoomData,
                        roomWidth: Number(e.target.value),
                      })
                    }
                    min="3"
                    step="0.1"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height (mm)
                  </label>
                  <input
                    type="number"
                    value={newRoomData.roomHeight}
                    onChange={(e) =>
                      setNewRoomData({
                        ...newRoomData,
                        roomHeight: Number(e.target.value),
                      })
                    }
                    min="3"
                    step="0.1"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area (sq. ft)
                  </label>
                  <input
                    type="number"
                    value={newRoomData.area}
                    onChange={(e) =>
                      setNewRoomData({
                        ...newRoomData,
                        area: Number(e.target.value),
                      })
                    }
                    min="10"
                    step="1"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handleAddRoom}
                    disabled={
                      loading ||
                      !newRoomData.roomName ||
                      !newRoomData.adjacentRoom
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Adding..." : "Add Room"}
                  </button>

                  <button
                    onClick={() => setAddingRoom(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md shadow-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Click on a room in the floor plan to adjust its dimensions
                </p>

                <button
                  onClick={() => setAddingRoom(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm"
                >
                  Add New Room
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <StatusBar
        canvasMode="infinite"
        zoom={zoom}
        isPanMode={isPanMode}
        hoveredPosition={hoveredPosition}
        isDrawingChain={false}
        snapEnabled={snapEnabled}
      />

      <div
        className="relative bg-gray-100 overflow-hidden"
        style={{ height: "600px" }}
      >
        {generatedFloorPlan ? (
          <Stage
            width={stageSize.width}
            height={stageSize.height}
            onMouseMove={handleMouseMove}
            pixelRatio={getOptimalPixelRatio()}
          >
            <Layer>
              <WallTool
                walls={transformWalls(convertToWalls(generatedFloorPlan))}
                preview={null}
                onWallClick={(index) => {
                  const wall = convertToWalls(generatedFloorPlan)[index];
                  if (wall) handleRoomClick(wall.roomName);
                }}
                onEndpointHover={() => {}}
                onEndpointLeave={() => {}}
                hoveredEndpoint={null}
                selectedWallIndex={-1}
                zoom={zoom}
                showMeasurements={true}
              />

              {/* Room Labels */}
              {Object.entries(generatedFloorPlan).map(
                ([roomName, roomLines]) => {
                  // Calculate room center
                  const allPoints = roomLines.flatMap((line) => [
                    line[0],
                    line[1],
                  ]);
                  const sumX = allPoints.reduce(
                    (sum, point) => sum + point[0],
                    0
                  );
                  const sumY = allPoints.reduce(
                    (sum, point) => sum + point[1],
                    0
                  );
                  const centerX = sumX / allPoints.length;
                  const centerY = sumY / allPoints.length;

                  const screenPoint = canvasToScreenCoordinates(
                    { x: centerX, y: centerY },
                    pan,
                    zoom
                  );

                  return (
                    <Group key={roomName}>
                      <Text
                        x={screenPoint.x}
                        y={screenPoint.y}
                        text={roomName}
                        fontSize={16 * zoom}
                        fill="#333"
                        align="center"
                        verticalAlign="middle"
                        offsetX={50 * zoom}
                        offsetY={8 * zoom}
                        fontStyle="bold"
                        onClick={() => handleRoomClick(roomName)}
                      />
                    </Group>
                  );
                }
              )}
            </Layer>
          </Stage>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <p className="text-gray-500">
              Generate a floor plan to view it here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloorPlanGenerator;
