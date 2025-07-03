'use client';

import React, { useState, useEffect } from 'react';
import { Copy, X, ChevronDown, Home, Building, Package } from 'lucide-react';
import { PhaseVariant } from '@/types/phase';
import { VariantRoom } from '@/types/room';
import { variantsApi } from '@/services/variantsApi';
import { phasesApi, ProjectPhase } from '@/services/phasesApi';
import { roomsApi } from '@/services/roomsApi';

interface VariantCloneModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant: PhaseVariant;
  currentPhaseId: string;
  projectId: string;
  onCloned: () => void;
}

interface CloneOptions {
  targetPhaseId: string;
  isCurrentPhase: boolean;
  cloneType: 'all' | 'selected';
  selectedRoomIds: string[];
  includeProducts: boolean;
  newName: string;
}

export default function VariantCloneModal({
  isOpen,
  onClose,
  variant,
  currentPhaseId,
  projectId,
  onCloned
}: VariantCloneModalProps) {
  const [loading, setLoading] = useState(false);
  const [phases, setPhases] = useState<ProjectPhase[]>([]);
  const [rooms, setRooms] = useState<VariantRoom[]>([]);
  const [showPhaseDropdown, setShowPhaseDropdown] = useState(false);
  
  const [options, setOptions] = useState<CloneOptions>({
    targetPhaseId: currentPhaseId,
    isCurrentPhase: true,
    cloneType: 'all',
    selectedRoomIds: [],
    includeProducts: true,
    newName: `${variant.name} (копие)`
  });

  // Load phases and rooms
  useEffect(() => {
    if (isOpen) {
      loadPhases();
      loadRooms();
    }
  }, [isOpen, projectId, variant.id]);

  const loadPhases = async () => {
    try {
      const phasesResponse = await phasesApi.getPhasesByProject(projectId);
      setPhases(phasesResponse.data);
    } catch (error) {
      console.error('Error loading phases:', error);
    }
  };

  const loadRooms = async () => {
    try {
      const roomsData = await roomsApi.getRoomsByVariant(variant.id);
      setRooms(roomsData);
      // Select all rooms by default
      setOptions(prev => ({
        ...prev,
        selectedRoomIds: roomsData.map(r => r.id)
      }));
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  const handlePhaseChange = (phaseId: string) => {
    const isCurrentPhase = phaseId === currentPhaseId;
    setOptions(prev => ({
      ...prev,
      targetPhaseId: phaseId,
      isCurrentPhase
    }));
    setShowPhaseDropdown(false);
  };

  const handleRoomToggle = (roomId: string) => {
    setOptions(prev => ({
      ...prev,
      selectedRoomIds: prev.selectedRoomIds.includes(roomId)
        ? prev.selectedRoomIds.filter(id => id !== roomId)
        : [...prev.selectedRoomIds, roomId]
    }));
  };

  const handleClone = async () => {
    if (!options.newName.trim()) {
      alert('Моля въведете име за новия вариант');
      return;
    }

    if (options.cloneType === 'selected' && options.selectedRoomIds.length === 0) {
      alert('Моля изберете поне една стая за клониране');
      return;
    }

    setLoading(true);
    try {
      await variantsApi.duplicateVariant(variant.id, {
        name: options.newName,
        targetPhaseId: options.targetPhaseId,
        cloneType: options.cloneType,
        selectedRoomIds: options.cloneType === 'selected' ? options.selectedRoomIds : undefined,
        includeProducts: options.includeProducts
      });
      
      onCloned();
      onClose();
    } catch (error) {
      console.error('Error cloning variant:', error);
      alert('Грешка при клониране на варианта');
    } finally {
      setLoading(false);
    }
  };

  const selectedPhase = Array.isArray(phases) ? phases.find(p => p.id === options.targetPhaseId) : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Copy className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Клониране на вариант</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current variant info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Клониране на:</h3>
            <p className="text-blue-700">📋 {variant.name}</p>
            <p className="text-sm text-blue-600 mt-1">
              {rooms.length} стаи
            </p>
          </div>

          {/* New name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Име на новия вариант
            </label>
            <input
              type="text"
              value={options.newName}
              onChange={(e) => setOptions(prev => ({ ...prev, newName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Въведете име за новия вариант"
            />
          </div>

          {/* Target phase */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Целева фаза
            </label>
            <div className="relative">
              <button
                onClick={() => setShowPhaseDropdown(!showPhaseDropdown)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-center space-x-2">
                  <Home className="w-4 h-4 text-gray-500" />
                  <span>{selectedPhase?.name || 'Избери фаза'}</span>
                  {options.isCurrentPhase && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      настояща
                    </span>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              
              {showPhaseDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                  {phases.map((phase) => (
                    <button
                      key={phase.id}
                      onClick={() => handlePhaseChange(phase.id)}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 ${
                        options.targetPhaseId === phase.id ? 'bg-blue-50 text-blue-700' : ''
                      }`}
                    >
                      <Home className="w-4 h-4" />
                      <span>{phase.name}</span>
                      {phase.id === currentPhaseId && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded ml-auto">
                          настояща
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Clone type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Какво да се клонира
            </label>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  value="all"
                  checked={options.cloneType === 'all'}
                  onChange={(e) => setOptions(prev => ({ 
                    ...prev, 
                    cloneType: e.target.value as 'all' | 'selected',
                    selectedRoomIds: e.target.value === 'all' ? rooms.map(r => r.id) : []
                  }))}
                  className="w-4 h-4 text-blue-600"
                />
                <Building className="w-4 h-4 text-gray-500" />
                <span>Всички стаи ({rooms.length})</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  value="selected"
                  checked={options.cloneType === 'selected'}
                  onChange={(e) => setOptions(prev => ({ 
                    ...prev, 
                    cloneType: e.target.value as 'all' | 'selected'
                  }))}
                  className="w-4 h-4 text-blue-600"
                />
                <Building className="w-4 h-4 text-gray-500" />
                <span>Избрани стаи</span>
              </label>
            </div>
          </div>

          {/* Room selection */}
          {options.cloneType === 'selected' && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Избор на стаи</h4>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {rooms.map((room) => (
                  <label key={room.id} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={options.selectedRoomIds.includes(room.id)}
                      onChange={() => handleRoomToggle(room.id)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <Building className="w-4 h-4 text-gray-500" />
                    <span className="flex-1">{room.name}</span>
                    <span className="text-sm text-gray-500">
                      {room.area}м²
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Избрани: {options.selectedRoomIds.length} от {rooms.length} стаи
              </p>
            </div>
          )}

          {/* Include products */}
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={options.includeProducts}
                onChange={(e) => setOptions(prev => ({ 
                  ...prev, 
                  includeProducts: e.target.checked 
                }))}
                className="w-4 h-4 text-blue-600"
              />
              <Package className="w-4 h-4 text-gray-500" />
              <div className="flex-1">
                <span className="font-medium">Клониране на продукти</span>
                <p className="text-sm text-gray-600">
                  Включва всички продукти от избраните стаи
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Отказ
          </button>
          <button
            onClick={handleClone}
            disabled={loading || !options.newName.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Клониране...</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Клонирай вариант</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 