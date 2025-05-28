import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, Plus, MessageSquare } from 'lucide-react';
import AddStudentModal from './AddStudentModal';
import { useStudents } from '../../../hooks/useStudents';
import { useFunnelSteps } from '../../../hooks/useFunnelSteps';
import { useCourseInterests } from '../../../hooks/useCourseInterests';
import { usePlatforms } from '../../../hooks/usePlatforms';
import { useCountries } from '../../../hooks/useCountries';
import { useEnrollments } from '../../../hooks/useEnrollments';

const StudentsInterface = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    funnelStep: 'All Steps',
    courseInterest: 'All Courses',
    platform: 'All Platforms',
    location: 'All Countries'
  });

  // Database hooks
  const { students, loading, error, addStudent } = useStudents();
  const { funnelSteps } = useFunnelSteps();
  const { courseInterests } = useCourseInterests();
  const { platforms } = usePlatforms();
  const { countries } = useCountries();
  const { getStudentEnrollments } = useEnrollments();

  // Filter options
  const filterOptions = {
    funnelStep: ['All Steps', ...funnelSteps],
    courseInterest: ['All Courses', ...courseInterests],
    platform: ['All Platforms', ...platforms],
    location: ['All Countries', ...countries]
  };

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFunnelStep = filters.funnelStep === 'All Steps' || student.funnelStep === filters.funnelStep;
      const matchesCourse = filters.courseInterest === 'All Courses' || 
                           student.interest?.includes(filters.courseInterest);
      const matchesPlatform = filters.platform === 'All Platforms' || 
                             student.platform?.includes(filters.platform);
      const matchesLocation = filters.location === 'All Countries' || student.location === filters.location;

      return matchesSearch && matchesFunnelStep && matchesCourse && matchesPlatform && matchesLocation;
    });
  }, [students, searchTerm, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleAddStudent = async (newStudent) => {
    try {
      await addStudent(newStudent);
      console.log('Student added successfully');
    } catch (error) {
      console.error('Error adding student:', error);
      // You might want to show an error toast here
    }
  };

  const getFunnelStepStyle = (step) => {
    const styles = {
      'ENROLLED': 'bg-green-100 text-green-800',
      'INTERESTED': 'bg-blue-100 text-blue-800',
      'PAID': 'bg-green-100 text-green-800',
      'CONTACTED': 'bg-yellow-100 text-yellow-800',
      'LEAD': 'bg-blue-100 text-blue-800'
    };
    return styles[step] || 'bg-gray-100 text-gray-800';
  };

  const getPlatformStyle = (platform) => {
    const styles = {
      'Facebook': 'bg-blue-50 text-blue-700',
      'Zalo': 'bg-blue-50 text-blue-700',
      'WhatsApp': 'bg-green-50 text-green-700',
      'Instagram': 'bg-pink-50 text-pink-700'
    };
    return styles[platform] || 'bg-gray-50 text-gray-700';
  };

  const renderCourses = (student) => {
    // Get enrollments for this student using the new enrollment system
    const enrollments = getStudentEnrollments(student.studentId || student.id);
    
    if (!enrollments || enrollments.length === 0) {
      return <span className="text-gray-400 text-sm">No enrollments</span>;
    }

    if (enrollments.length === 1) {
      const enrollment = enrollments[0];
      return (
        <div className="flex flex-col space-y-1">
          <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-indigo-50 text-indigo-700 w-fit">
            {enrollment.courseName || enrollment.className || 'Course'}
          </span>
          <span className="text-xs text-gray-500">
            {enrollment.status === 'active' ? 'Active' : enrollment.status}
            {enrollment.progress && ` • ${enrollment.progress}%`}
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-col space-y-1">
        <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-indigo-50 text-indigo-700 w-fit">
          {enrollments[0].courseName || enrollments[0].className || 'Course'}
        </span>
        <span className="text-xs text-gray-500">
          +{enrollments.length - 1} more courses
        </span>
        <span className="text-xs text-gray-500">
          {enrollments.filter(e => e.status === 'active').length} active
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold text-gray-900">Students</h1>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64"
              />
            </div>
            
            {/* Export Button */}
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center space-x-4">
          <Filter className="w-4 h-4 text-gray-500" />
          
          {/* Funnel Step Filter */}
          <select
            value={filters.funnelStep}
            onChange={(e) => handleFilterChange('funnelStep', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {filterOptions.funnelStep.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>

          {/* Course Interest Filter */}
          <select
            value={filters.courseInterest}
            onChange={(e) => handleFilterChange('courseInterest', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {filterOptions.courseInterest.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>

          {/* Platform Filter */}
          <select
            value={filters.platform}
            onChange={(e) => handleFilterChange('platform', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {filterOptions.platform.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>

          {/* Location Filter */}
          <select
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {filterOptions.location.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funnel Step</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollments</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm"
                      style={{ 
                        backgroundColor: typeof student.avatarColor === 'object' 
                          ? undefined 
                          : student.avatarColor,
                        background: typeof student.avatarColor === 'object' 
                          ? student.avatarColor.background 
                          : undefined
                      }}
                    >
                      {student.avatar}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.studentId}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{student.email}</div>
                  <div className="text-sm text-gray-500">{student.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{student.location}</div>
                  {student.city && <div className="text-sm text-gray-500">{student.city}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getFunnelStepStyle(student.funnelStep)}`}>
                    {student.funnelStep}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{student.interest}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getPlatformStyle(student.platform)}`}>
                    {student.platform}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderCourses(student)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm || Object.values(filters).some(f => f !== 'All Steps' && f !== 'All Courses' && f !== 'All Platforms' && f !== 'All Countries') 
                ? 'No students match your search criteria.' 
                : 'No students found. Add your first student to get started.'}
            </div>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredStudents.length}</span> of{' '}
            <span className="font-medium">{students.length}</span> students
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
              Previous
            </button>
            <span className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">1</span>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddStudent}
      />
    </div>
  );
};

export default StudentsInterface; 