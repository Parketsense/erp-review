'use client';

import React, { useState, useEffect } from 'react';
import { PhaseVariant } from '../../types/variant';
import { Phase } from '../../types/phase';
import { phasesApi } from '../../services/phasesApi';

interface VariantCloneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClone: (targetPhaseId: string, includeRooms: boolean, includeProducts: boolean) => Promise<void>;
  variant: PhaseVariant;
  projectId: string;
}

export default function VariantCloneModal({
  isOpen,
  onClose,
  onClone,
  variant,
  projectId,
}: VariantCloneModalProps) {
  const [targetPhaseId, setTargetPhaseId] = useState('');
  const [includeRooms, setIncludeRooms] = useState(true);
  const [includeProducts, setIncludeProducts] = useState(true);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPhases, setLoadingPhases] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPhases();
    }
  }, [isOpen, projectId]);

  const fetchPhases = async () => {
    setLoadingPhases(true);
    try {
      const phasesData = await phasesApi.getPhasesByProject(projectId);
      setPhases(phasesData);
      // По подразбиране избираме текущата фаза
      if (variant.phaseId) {
        setTargetPhaseId(variant.phaseId);
      }
    } catch (error) {
      console.error('Грешка при зареждане на фазите:', error);
    } finally {
      setLoadingPhases(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPhaseId) return;

    setLoading(true);
    try {
      await onClone(targetPhaseId, includeRooms, includeProducts);
    } catch (error) {
      console.error('Грешка при клониране:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Клониране на вариант
                  </h3>
                  
                  <div className="bg-gray-50 p-4 rounded-md mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Вариант за клониране:</h4>
                    <p className="text-sm text-gray-600">{variant.name}</p>
                    {variant.description && (
                      <p className="text-xs text-gray-500 mt-1">{variant.description}</p>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="targetPhase" className="block text-sm font-medium text-gray-700 mb-1">
                        Целева фаза *
                      </label>
                      <select
                        id="targetPhase"
                        value={targetPhaseId}
                        onChange={(e) => setTargetPhaseId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        disabled={loadingPhases}
                      >
                        <option value="">Изберете фаза</option>
                        {phases.map((phase) => (
                          <option key={phase.id} value={phase.id}>
                            {phase.name}
                            {phase.id === variant.phaseId ? ' (текуща фаза)' : ''}
                          </option>
                        ))}
                      </select>
                      {loadingPhases && (
                        <p className="text-xs text-gray-500 mt-1">Зареждане на фази...</p>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Какво да се клонира:</h4>
                      
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="includeRooms"
                            checked={includeRooms}
                            onChange={(e) => {
                              setIncludeRooms(e.target.checked);
                              if (!e.target.checked) {
                                setIncludeProducts(false);
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="includeRooms" className="ml-2 block text-sm text-gray-900">
                            Включи стаи
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="includeProducts"
                            checked={includeProducts}
                            onChange={(e) => setIncludeProducts(e.target.checked)}
                            disabled={!includeRooms}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                          />
                          <label htmlFor="includeProducts" className="ml-2 block text-sm text-gray-900">
                            Включи продукти в стаите
                            {!includeRooms && (
                              <span className="text-xs text-gray-500 block">
                                (налично само ако са включени стаите)
                              </span>
                            )}
                          </label>
                        </div>
                      </div>
                      
                      <div className="mt-3 p-3 bg-blue-50 rounded-md">
                        <p className="text-xs text-blue-700">
                          <strong>Забележка:</strong> Клонираният вариант ще бъде създаден с име "{variant.name} (копие)" 
                          {targetPhaseId === variant.phaseId 
                            ? ' в същата фаза.' 
                            : ' в избраната фаза.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading || !targetPhaseId}
                className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
              >
                {loading ? 'Клониране...' : 'Клонирай'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                Отказ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 