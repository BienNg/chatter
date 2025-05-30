import React from 'react';
import { Mail, Phone } from 'lucide-react';
import FirebaseCollectionSelector from '../../shared/FirebaseCollectionSelector';
import { FirebaseMultiSelectSelector } from '../../shared/index';
import { useFieldEdit } from '../../../hooks/useFieldEdit';

const StudentInfoTab = ({ 
  student, 
  updateStudent,
  countries,
  addCountry,
  cities,
  addCity,
  platforms,
  addPlatform,
  categories,
  addCategory
}) => {
  const {
    editField,
    editValue,
    handleEditStart,
    handleEditCancel,
    handleEditSave,
    setEditValue
  } = useFieldEdit(updateStudent);

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-500">Basic Information</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-gray-500">Name</label>
              {!editField && (
                <button 
                  onClick={() => handleEditStart('name', student.name)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"/>
                  </svg>
                </button>
              )}
            </div>
            {editField === 'name' ? (
              <div className="mt-1 flex items-center space-x-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  autoFocus
                />
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleEditSave(student.id)}
                    className="p-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                  >
                    Save
                  </button>
                  <button 
                    onClick={handleEditCancel}
                    className="p-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-1 text-sm font-medium text-gray-900">{student.name}</p>
            )}
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500">Student ID</label>
            <p className="mt-1 text-sm font-medium text-gray-900">{student.studentId}</p>
          </div>
        </div>
      </div>
      
      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-gray-500">Email</label>
              {!editField && (
                <button 
                  onClick={() => handleEditStart('email', student.email)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"/>
                  </svg>
                </button>
              )}
            </div>
            {editField === 'email' ? (
              <div className="mt-1 flex items-center space-x-2">
                <input
                  type="email"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  autoFocus
                />
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleEditSave(student.id)}
                    className="p-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                  >
                    Save
                  </button>
                  <button 
                    onClick={handleEditCancel}
                    className="p-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-1 flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <p className="text-sm text-gray-900">{student.email || 'No email provided'}</p>
              </div>
            )}
          </div>
          
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-gray-500">Phone</label>
              {!editField && (
                <button 
                  onClick={() => handleEditStart('phone', student.phone)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"/>
                  </svg>
                </button>
              )}
            </div>
            {editField === 'phone' ? (
              <div className="mt-1 flex items-center space-x-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  autoFocus
                />
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleEditSave(student.id)}
                    className="p-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                  >
                    Save
                  </button>
                  <button 
                    onClick={handleEditCancel}
                    className="p-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-1 flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <p className="text-sm text-gray-900">{student.phone || 'No phone provided'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Location */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-500">Location</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-500">Country</label>
            <div className="mt-1">
              <FirebaseCollectionSelector
                collectionName="countries"
                record={student}
                updateRecord={updateStudent}
                fieldName="location"
                fieldDisplayName="Country"
                options={countries}
                addOption={addCountry}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500">City</label>
            <div className="mt-1">
              <FirebaseCollectionSelector
                collectionName="cities"
                record={student}
                updateRecord={updateStudent}
                fieldName="city"
                fieldDisplayName="City"
                options={cities}
                addOption={addCity}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Platform & Categories */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-500">Additional Information</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-500">Platform</label>
            <div className="mt-1">
              <FirebaseCollectionSelector
                collectionName="platforms"
                record={student}
                updateRecord={updateStudent}
                fieldName="platform"
                fieldDisplayName="Platform"
                options={platforms}
                addOption={addPlatform}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500">Categories</label>
            <div className="mt-1">
              <FirebaseMultiSelectSelector
                collectionName="categories"
                record={student}
                updateRecord={updateStudent}
                fieldName="categories"
                fieldDisplayName="Category"
                options={categories}
                addOption={addCategory}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Notes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500">Notes</h3>
          {!editField && (
            <button 
              onClick={() => handleEditStart('notes', student.notes)}
              className="text-indigo-600 hover:text-indigo-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"/>
              </svg>
            </button>
          )}
        </div>
        
        {editField === 'notes' ? (
          <div className="mt-1 flex flex-col space-y-2">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows="4"
              autoFocus
            />
            <div className="flex space-x-2 justify-end">
              <button 
                onClick={() => handleEditSave(student.id)}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 text-sm"
              >
                Save
              </button>
              <button 
                onClick={handleEditCancel}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {student.notes || 'No notes available for this student.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentInfoTab; 