import React, { useEffect, useState } from "react";

/**
 * Modal component for importing walls from localStorage
 * Used when navigating from FloorPlanGenerator to Canvas
 */
const ImportModal = ({ onImport, onCancel }) => {
  const [importedWalls, setImportedWalls] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we have any imported walls in localStorage
    const wallsData = localStorage.getItem("importedWalls");
    if (wallsData) {
      try {
        const walls = JSON.parse(wallsData);
        setImportedWalls(walls);
      } catch (error) {
        console.error("Error parsing imported walls:", error);
      }
    }
    setLoading(false);
  }, []);

  const handleImport = () => {
    if (importedWalls) {
      onImport(importedWalls);
      // Clear the localStorage after import
      localStorage.removeItem("importedWalls");
    }
  };

  const handleCancel = () => {
    // Clear the localStorage when canceled
    localStorage.removeItem("importedWalls");
    onCancel();
  };

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (!importedWalls) {
    return null; // Don't show if no imported walls
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Import Floor Plan</h3>

        <p className="mb-4">
          You have a floor plan ready to be imported. Would you like to add it
          to your canvas?
        </p>

        <div className="text-sm text-gray-700 mb-4">
          <div>Total walls: {importedWalls.length}</div>
          <div>
            Rooms:{" "}
            {Array.from(new Set(importedWalls.map((w) => w.roomName))).join(
              ", "
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
            onClick={handleCancel}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            onClick={handleImport}
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
