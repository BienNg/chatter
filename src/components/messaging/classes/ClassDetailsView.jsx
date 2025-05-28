import React, { useState, useEffect } from 'react';
import { 
  Edit, 
  Calendar, 
  Users, 
  Globe, 
  FileText, 
  ExternalLink, 
  Clock,
  MapPin,
  GraduationCap,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  ChevronRight,
  BookOpen,
  Award,
  TrendingUp
} from 'lucide-react';
import { useClasses } from '../../../hooks/useClasses';
import { useClassStudents } from '../../../hooks/useClassStudents';
import CreateCourseModal from './CreateCourseModal';
import AddStudentToClassModal from './AddStudentToClassModal';

const ClassDetailsView = ({ channelId, channelName }) => {
  const { getClassByChannelId } = useClasses();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Use the class students hook
  const {
    classStudents,
    loading: studentsLoading,
    error: studentsError,
    enrollStudent,
    getClassStats
  } = useClassStudents(classData?.id);

  // Mock student data for the class
  const mockClassStudents = [
    {
      id: 'stu1',
      name: 'Anh Kiệt',
      email: 'kietbui1612@gmail.com',
      avatar: 'AK',
      avatarColor: 'bg-blue-500',
      amount: 5900000,
      currency: 'VND',
      enrollmentDate: '2025-03-05',
      status: 'active',
      progress: 85,
      attendance: 92,
      lastActivity: '2 hours ago'
    },
    {
      id: 'stu2', 
      name: 'Minh Thư',
      email: 'thunguyen98@gmail.com',
      avatar: 'MT',
      avatarColor: 'bg-purple-500',
      amount: 5900000,
      currency: 'VND',
      enrollmentDate: '2025-03-04',
      status: 'active',
      progress: 78,
      attendance: 88,
      lastActivity: '1 day ago'
    },
    {
      id: 'stu3',
      name: 'Hoàng Long',
      email: 'longhoang2000@gmail.com', 
      avatar: 'HL',
      avatarColor: 'bg-green-500',
      amount: 5900000,
      currency: 'VND',
      enrollmentDate: '2025-03-04',
      status: 'active',
      progress: 92,
      attendance: 95,
      lastActivity: '3 hours ago'
    },
    {
      id: 'stu4',
      name: 'Thanh Hà',
      email: 'hale123@gmail.com',
      avatar: 'TH',
      avatarColor: 'bg-emerald-500',
      amount: 5900000,
      currency: 'VND',
      enrollmentDate: '2025-03-03',
      status: 'active',
      progress: 67,
      attendance: 82,
      lastActivity: '5 hours ago'
    },
    {
      id: 'stu5',
      name: 'Đức Anh',
      email: 'anhdo555@gmail.com',
      avatar: 'DA',
      avatarColor: 'bg-blue-600',
      amount: 5900000,
      currency: 'VND',
      enrollmentDate: '2025-03-03',
      status: 'active',
      progress: 73,
      attendance: 90,
      lastActivity: '1 day ago'
    },
    {
      id: 'stu6',
      name: 'Mai Linh',
      email: 'linhmai2002@gmail.com',
      avatar: 'ML',
      avatarColor: 'bg-pink-500',
      amount: 5900000,
      currency: 'VND',
      enrollmentDate: '2025-03-02',
      status: 'active',
      progress: 89,
      attendance: 94,
      lastActivity: '4 hours ago'
    },
    {
      id: 'stu7',
      name: 'Quang Minh',
      email: 'minhquang99@gmail.com',
      avatar: 'QM',
      avatarColor: 'bg-yellow-500',
      amount: 5900000,
      currency: 'VND',
      enrollmentDate: '2025-03-02',
      status: 'active',
      progress: 81,
      attendance: 87,
      lastActivity: '6 hours ago'
    },
    {
      id: 'stu8',
      name: 'Thu Trang',
      email: 'trangnt24@gmail.com',
      avatar: 'TT',
      avatarColor: 'bg-red-500',
      amount: 5900000,
      currency: 'VND',
      enrollmentDate: '2025-03-01',
      status: 'active',
      progress: 76,
      attendance: 85,
      lastActivity: '2 days ago'
    },
    {
      id: 'stu9',
      name: 'Văn Nam',
      email: 'namvan2001@gmail.com',
      avatar: 'VN',
      avatarColor: 'bg-orange-500',
      amount: 5900000,
      currency: 'VND',
      enrollmentDate: '2025-03-01',
      status: 'active',
      progress: 84,
      attendance: 91,
      lastActivity: '8 hours ago'
    }
  ];

  // Use real students if available, otherwise use mock data for demo
  const displayStudents = classStudents.length > 0 ? classStudents : mockClassStudents;

  useEffect(() => {
    const loadClassData = async () => {
      if (channelId) {
        try {
          setLoading(true);
          const classInfo = await getClassByChannelId(channelId);
          setClassData(classInfo);
        } catch (error) {
          console.error('Error loading class data:', error);
          setClassData(null);
        } finally {
          setLoading(false);
        }
      } else {
        // If no channelId, stop loading immediately
        setLoading(false);
        setClassData(null);
      }
    };
    
    loadClassData();
  }, [channelId, getClassByChannelId]);

  const handleClassUpdated = (updatedClass) => {
    setClassData(updatedClass);
    setShowEditModal(false);
  };

  const handleAddStudent = async (studentData) => {
    try {
      await enrollStudent(studentData);
      setShowAddStudentModal(false);
    } catch (error) {
      console.error('Error adding student:', error);
      throw error; // Re-throw to let the modal handle the error display
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount, currency) => {
    if (currency === 'VND') {
      return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  const filteredStudents = mockClassStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProgressColor = (progress) => {
    if (progress >= 90) return 'bg-emerald-500';
    if (progress >= 80) return 'bg-blue-500';
    if (progress >= 70) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Active' },
      pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Pending' },
      inactive: { bg: 'bg-gray-50', text: 'text-gray-700', label: 'Inactive' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <GraduationCap className="h-12 w-12" />
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No class information</h3>
        <p className="mt-1 text-sm text-gray-500">
          This channel is set as a class type but no class details have been configured yet.
        </p>
        <div className="mt-6">
          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Class
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col bg-gray-50">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 px-6 py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{classData.className}</h1>
                  <p className="text-sm text-gray-500">Course Overview & Student Management</p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="flex items-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">{displayStudents.length} Students</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{formatDate(classData.beginDate)} - {formatDate(classData.endDate)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{classData.days?.join(', ') || 'No schedule'}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Course
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* Left Panel - Course Details */}
            <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Course Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500">Level</span>
                        <Award className="w-4 h-4 text-gray-400" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{classData.level || 'Not specified'}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500">Format</span>
                        <Globe className="w-4 h-4 text-gray-400" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{classData.format}</p>
                      <p className="text-xs text-gray-600 mt-1">{classData.formatOption}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500">Type</span>
                        <BookOpen className="w-4 h-4 text-gray-400" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{classData.classType || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Teachers */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructors</h3>
                  {classData.teachers && classData.teachers.length > 0 ? (
                    <div className="space-y-3">
                      {classData.teachers.map((teacher, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-indigo-600">
                              {teacher.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{teacher}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">No instructors assigned</p>
                  )}
                </div>

                {/* Resources */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
                  {classData.googleDriveUrl ? (
                    <a
                      href={classData.googleDriveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">Course Materials</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                    </a>
                  ) : (
                    <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">No resources linked</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {getStatusBadge(classData.status || 'active')}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Student List */}
            <div className="flex-1 flex flex-col">
              {/* Student List Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Student List</h2>
                    <p className="text-sm text-gray-500">{filteredStudents.length} students enrolled</p>
                  </div>
                  <button 
                    onClick={() => setShowAddStudentModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Student
                  </button>
                </div>
                
                {/* Search and Filters */}
                <div className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </button>
                </div>
              </div>

              {/* Student List */}
              <div className="flex-1 overflow-y-auto bg-white">
                {studentsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <div key={student.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-10 h-10 ${student.avatarColor} rounded-full flex items-center justify-center`}>
                                <span className="text-sm font-medium text-white">{student.avatar}</span>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3">
                                  <h4 className="text-sm font-semibold text-gray-900">{student.name}</h4>
                                  {getStatusBadge(student.status)}
                                </div>
                                <div className="flex items-center space-x-4 mt-1">
                                  <div className="flex items-center space-x-1">
                                    <Mail className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-600">{student.email}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-600">Enrolled {formatDate(student.enrollmentDate)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-6">
                              {/* Progress */}
                              <div className="text-right">
                                <div className="flex items-center space-x-2">
                                  <TrendingUp className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm font-medium text-gray-900">{student.progress}%</span>
                                </div>
                                <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                                  <div 
                                    className={`h-1.5 rounded-full ${getProgressColor(student.progress)}`}
                                    style={{ width: `${student.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              {/* Amount */}
                              <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900">
                                  {formatCurrency(student.amount, student.currency)}
                                </p>
                                <p className="text-xs text-gray-500">Attendance: {student.attendance}%</p>
                              </div>
                              
                              {/* Actions */}
                              <div className="flex items-center space-x-2">
                                <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Users className="w-12 h-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Enrolled</h3>
                        <p className="text-gray-500 text-center mb-6 max-w-sm">
                          This class doesn't have any students yet. Add your first student to get started.
                        </p>
                        <button 
                          onClick={() => setShowAddStudentModal(true)}
                          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Student
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <CreateCourseModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onCreate={handleClassUpdated}
        channelName={channelName}
        channelId={channelId}
        initialData={classData}
        isEditing={true}
      />

      {/* Add Student Modal */}
      <AddStudentToClassModal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        onAddStudent={handleAddStudent}
        className={classData?.className}
      />
    </>
  );
};

export default ClassDetailsView; 