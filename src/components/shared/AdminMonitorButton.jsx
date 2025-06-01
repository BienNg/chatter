import React, { useState, useRef, useEffect } from 'react';
import { Activity, X, Download, Trash2, Eye, EyeOff } from 'lucide-react';
import { useFirebaseLogger } from '../../contexts/FirebaseLoggerContext';

const AdminMonitorButton = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [showDashboard, setShowDashboard] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);
  const { isAdmin, logs, getStats, clearLogs, exportLogs } = useFirebaseLogger();

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Keep button within viewport
    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 60;
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = (e) => {
    if (!isDragging) {
      setShowDashboard(true);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const stats = getStats();

  // Don't render if not admin - moved after all hooks
  if (!isAdmin) return null;

  return (
    <>
      {/* Draggable Button */}
      <div
        ref={buttonRef}
        className={`fixed z-50 bg-red-600 hover:bg-red-700 text-white rounded-full w-12 h-12 flex items-center justify-center cursor-move shadow-lg transition-all duration-200 ${
          isDragging ? 'scale-110 shadow-xl' : ''
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          userSelect: 'none'
        }}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        title="Admin Performance Monitor (Drag to move)"
      >
        <Activity className="w-5 h-5" />
        {stats.readsInLastMinute > 0 && (
          <div className="absolute -top-1 -right-1 bg-yellow-500 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {stats.readsInLastMinute > 9 ? '9+' : stats.readsInLastMinute}
          </div>
        )}
      </div>

      {/* Dashboard Modal */}
      {showDashboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-semibold">Performance Monitor</h2>
                <div className="text-xs text-gray-500">
                  Live tracking of app usage
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={exportLogs}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center space-x-1"
                  title="Download logs as TXT file"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
                <button
                  onClick={clearLogs}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 flex items-center space-x-1"
                  title="Clear all logs"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear</span>
                </button>
                <button
                  onClick={() => setShowDashboard(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="p-4 border-b bg-gray-50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.reads}</div>
                  <div className="text-sm text-gray-600">Database Reads</div>
                  <div className="text-xs text-gray-500">{stats.readsInLastHour}/hour</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.writes}</div>
                  <div className="text-sm text-gray-600">Database Writes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.clicks}</div>
                  <div className="text-sm text-gray-600">User Clicks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.pageViews}</div>
                  <div className="text-sm text-gray-600">Page Views</div>
                </div>
              </div>
            </div>

            {/* Top Collections */}
            {Object.keys(stats.topCollections).length > 0 && (
              <div className="p-4 border-b">
                <h3 className="font-medium mb-2">Most Read Collections</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.topCollections)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([collection, count]) => (
                      <span key={collection} className="px-2 py-1 bg-gray-100 rounded text-sm">
                        {collection}: {count} reads
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Logs List */}
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="font-medium mb-2">Recent Activity ({logs.length} total)</h3>
              {logs.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No activity logged yet. Start using the app to see Firebase operations.
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {logs.slice(0, 100).map((log) => (
                    <div
                      key={log.id}
                      className={`p-3 rounded border-l-4 text-sm ${
                        log.type === 'firebase_read'
                          ? log.impact === 'high'
                            ? 'border-red-500 bg-red-50'
                            : log.impact === 'medium'
                            ? 'border-yellow-500 bg-yellow-50'
                            : 'border-blue-500 bg-blue-50'
                          : log.type === 'firebase_write'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-500 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            log.type === 'firebase_read'
                              ? 'bg-red-100 text-red-800'
                              : log.type === 'firebase_write'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {log.operation}
                          </span>
                          <span className="font-medium">{log.description}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {log.timeFormatted}
                        </span>
                      </div>
                      {log.collection && (
                        <div className="mt-1 text-xs text-gray-600">
                          Collection: {log.collection}
                          {log.resultCount !== undefined && ` (${log.resultCount} results)`}
                          {log.impact && log.impact !== 'low' && (
                            <span className={`ml-2 px-1 py-0.5 rounded text-xs ${
                              log.impact === 'high' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                            }`}>
                              {log.impact} impact
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminMonitorButton; 