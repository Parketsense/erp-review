              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип оферта
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="MATERIALS">Материали</option>
                  <option value="INSTALLATION">Монтаж</option>
                  <option value="COMPLETE">Комплексна</option>
                  <option value="LUXURY">Луксозна</option>
                  <option value="CUSTOM">Персонализирана</option>
                </select>
              </div> 