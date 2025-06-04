import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, AlertTriangle, TrendingUp, TrendingDown, DollarSign, 
  Clock, Database, Users, MessageCircle, Eye, EyeOff, RefreshCw,
  CheckCircle, AlertCircle, Info, Download, BarChart3, Zap,
  Monitor, Calendar, Radio, MapPin, Trash2, BookOpen, FileText
} from 'lucide-react';
import { getRecentOperations, getStats, syncWithFirebaseConsole, importTrackedListeners } from '../../utils/comprehensiveFirebaseTracker';
import { getActiveListeners, getAllListeners, clearInactiveListeners, getListenerReadStats } from '../../utils/listenerTrackingUtils';

const ManagerFirebaseDashboard = ({ stats, recentOperations, isVisible, onToggle, channels = [], users = [] }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [trackedListeners, setTrackedListeners] = useState([]);
  const [listenerHistory, setListenerHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      setLastUpdate(Date.now());
      
      // Update tracked listeners
      setTrackedListeners(getActiveListeners());
      setListenerHistory(getAllListeners());
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);
  
  // Initial load of listeners
  useEffect(() => {
    setTrackedListeners(getActiveListeners());
    setListenerHistory(getAllListeners());
  }, []);

  // Memoized calculations for performance
  const dashboardData = useMemo(() => {
    if (!stats) return null;

    const session = stats.session;
    const last5min = stats.last5min;
    const alerts = stats.alerts || [];

    // Calculate session duration in readable format
    const sessionDuration = formatDuration(session.duration);
    
    // Calculate efficiency metrics
    const readWriteRatio = session.totalWrites > 0 ? 
      Math.round(session.totalReads / session.totalWrites) : session.totalReads;
    
    // Cost per minute
    const costPerMinute = session.duration > 0 ? 
      (session.totalCost / (session.duration / 60000)).toFixed(6) : 0;

    // Performance status
    const performanceStatus = getPerformanceStatus(last5min.readsPerMinute, alerts);
    
    return {
      session,
      last5min,
      alerts,
      sessionDuration,
      readWriteRatio,
      costPerMinute,
      performanceStatus,
      collections: stats.collections || [],
      realtimeListeners: stats.realtimeListeners || { active: 0, list: [] },
      trackedListeners: trackedListeners || []
    };
  }, [stats, lastUpdate, trackedListeners]);

  // Function to force sync tracked listeners
  const handleForceSync = () => {
    const activeTrackedListeners = getActiveListeners();
    if (activeTrackedListeners.length > 0) {
      importTrackedListeners(activeTrackedListeners);
      setLastUpdate(Date.now()); // Force refresh
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-all z-50"
        title="Show Database Monitor"
      >
        <Activity size={24} />
      </button>
    );
  }

  if (!dashboardData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md mx-4">
          <div className="text-center">
            <Database className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Starting Database Monitor...
            </h3>
            <p className="text-gray-600">
              Collecting database usage information for analysis.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">Database Performance Monitor</h1>
                <p className="text-indigo-100">
                  Real-time analysis of app database usage and costs
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleForceSync}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition-all flex items-center space-x-1"
                title="Force sync tracked listeners"
              >
                <RefreshCw size={16} />
                <span className="text-sm">Sync</span>
              </button>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                  autoRefresh 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                <RefreshCw size={16} className={autoRefresh ? 'animate-spin' : ''} />
                <span className="text-sm">
                  {autoRefresh ? 'Live' : 'Paused'}
                </span>
              </button>
              <button
                onClick={onToggle}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition-all"
              >
                <EyeOff size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-50 border-b border-gray-200 px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'activity', name: 'Live Activity', icon: Zap },
              { id: 'costs', name: 'Costs & Usage', icon: DollarSign },
              { id: 'details', name: 'Technical Details', icon: Database },
              { id: 'listeners', name: 'Snapshot Listeners', icon: Activity },
              { id: 'listener-tracking', name: 'Listener Tracking', icon: Radio }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && (
            <OverviewTab data={dashboardData} />
          )}
          {activeTab === 'activity' && (
            <ActivityTab data={dashboardData} recentOperations={recentOperations} />
          )}
          {activeTab === 'costs' && (
            <CostsTab data={dashboardData} />
          )}
          {activeTab === 'details' && (
            <DetailsTab data={dashboardData} />
          )}
          {activeTab === 'listeners' && (
            <SnapshotListenersTab data={dashboardData} users={users} channels={channels} />
          )}
          {activeTab === 'listener-tracking' && (
            <ListenerTab realtimeListeners={dashboardData.realtimeListeners} channels={channels} users={users} />
          )}
        </div>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ data }) => {
  const alerts = data.alerts || [];
  const criticalAlerts = alerts.filter(a => a.type === 'warning');

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {criticalAlerts.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            <div>
              <h3 className="font-semibold text-orange-800">Attention Required</h3>
              <p className="text-orange-700">
                {criticalAlerts[0].message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard
          icon={Activity}
          title="System Status"
          value={data.performanceStatus.label}
          subtitle={`${data.last5min.readsPerMinute}/min database requests`}
          color={data.performanceStatus.color}
          trend={data.last5min.operations > data.session.totalOperations / 10 ? 'up' : 'down'}
        />
        
        <StatusCard
          icon={DollarSign}
          title="Session Cost"
          value={`$${data.session.totalCost.toFixed(4)}`}
          subtitle={`$${data.costPerMinute}/minute rate`}
          color="green"
          trend={parseFloat(data.costPerMinute) > 0.001 ? 'up' : 'neutral'}
        />
        
        <StatusCard
          icon={Clock}
          title="Session Time"
          value={data.sessionDuration}
          subtitle={`${data.session.totalOperations} total operations`}
          color="blue"
          trend="neutral"
        />
        
        <StatusCard
          icon={Database}
          title="Data Efficiency"
          value={`${data.readWriteRatio}:1`}
          subtitle="Read to write ratio"
          color={data.readWriteRatio > 100 ? 'orange' : 'green'}
          trend={data.readWriteRatio > 100 ? 'up' : 'neutral'}
        />
      </div>

      {/* App Feature Usage */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MessageCircle className="h-5 w-5 mr-2 text-indigo-600" />
          App Feature Usage
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.collections.slice(0, 6).map((collection) => (
            <FeatureCard
              key={collection.name}
              category={collection.category}
              operations={collection.operations}
              cost={collection.cost}
            />
          ))}
        </div>
      </div>

      {/* Real-time Connections */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-green-600" />
          Live Connections ({data.realtimeListeners.active})
        </h3>
        {data.realtimeListeners.active === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No active real-time connections
          </p>
        ) : (
          <div className="space-y-3">
            {data.realtimeListeners.list.slice(0, 5).map((listener, index) => (
              <div key={listener.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {getCollectionDisplayName(listener.collection)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Active for {formatDuration(listener.duration)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-indigo-600">{listener.readCount}</p>
                  <p className="text-xs text-gray-500">updates</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Activity Tab Component
const ActivityTab = ({ data, recentOperations }) => {
  const [filter, setFilter] = useState('all');
  
  const filteredOperations = useMemo(() => {
    if (!recentOperations) return [];
    
    let filtered = recentOperations;
    if (filter !== 'all') {
      filtered = recentOperations.filter(op => op.type.toLowerCase().includes(filter));
    }
    
    return filtered.slice(0, 50);
  }, [recentOperations, filter]);

  return (
    <div className="space-y-6">
      {/* Activity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Last 5 Minutes</h3>
              <p className="text-3xl font-bold text-blue-600">{data.last5min.operations}</p>
              <p className="text-blue-700">database operations</p>
            </div>
            <Activity className="h-12 w-12 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-900">Read Operations</h3>
              <p className="text-3xl font-bold text-green-600">{data.last5min.reads}</p>
              <p className="text-green-700">{data.last5min.readsPerMinute}/min average</p>
            </div>
            <Eye className="h-12 w-12 text-green-500" />
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-purple-900">Write Operations</h3>
              <p className="text-3xl font-bold text-purple-600">{data.last5min.writes}</p>
              <p className="text-purple-700">data modifications</p>
            </div>
            <Database className="h-12 w-12 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Activity Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Operations</option>
            <option value="read">Read Operations</option>
            <option value="write">Write Operations</option>
            <option value="realtime">Real-time Updates</option>
          </select>
        </div>
        
        <div className="max-h-96 overflow-y-auto space-y-2">
          {filteredOperations.map((operation) => (
            <ActivityRow key={operation.id} operation={operation} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Activity Row Component
const ActivityRow = ({ operation }) => {
  const timeAgo = formatTimeAgo(operation.timestamp);
  const icon = getOperationIcon(operation.type);
  const color = getOperationColor(operation.type);
  
  return (
    <div className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className={`p-2 rounded-full ${color.bg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className="font-medium text-gray-900">
            {operation.category.name}
          </p>
          <span className="text-xs text-gray-500">
            {operation.category.icon}
          </span>
        </div>
        <p className="text-sm text-gray-600 truncate">
          {operation.details || getOperationDescription(operation.type)}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">
          {operation.resultCount > 0 && `${operation.resultCount} docs`}
        </p>
        <p className="text-xs text-gray-500">{timeAgo}</p>
      </div>
    </div>
  );
};

// Costs Tab Component
const CostsTab = ({ data }) => {
  const projectedMonthlyCost = (data.costPerMinute * 60 * 24 * 30).toFixed(2);
  const projectedDailyCost = (data.costPerMinute * 60 * 24).toFixed(4);

  return (
    <div className="space-y-6">
      {/* Cost Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-2">Current Session</h3>
          <p className="text-3xl font-bold text-green-600">${data.session.totalCost.toFixed(4)}</p>
          <p className="text-green-700">actual cost so far</p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Daily Projection</h3>
          <p className="text-3xl font-bold text-blue-600">${projectedDailyCost}</p>
          <p className="text-blue-700">at current usage rate</p>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">Monthly Projection</h3>
          <p className="text-3xl font-bold text-purple-600">${projectedMonthlyCost}</p>
          <p className="text-purple-700">at current usage rate</p>
        </div>
      </div>

      {/* Cost Breakdown by Feature */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost by App Feature</h3>
        <div className="space-y-4">
          {data.collections.map((collection) => (
            <div key={collection.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{collection.category.icon}</span>
                <div>
                  <p className="font-medium text-gray-900">{collection.category.name}</p>
                  <p className="text-sm text-gray-600">{collection.operations} operations</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-indigo-600">${collection.cost.toFixed(4)}</p>
                <p className="text-xs text-gray-500">
                  {((collection.cost / data.session.totalCost) * 100).toFixed(1)}% of total
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Insights */}
      <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-3">💡 Cost Insights</h3>
        <div className="space-y-2 text-yellow-800">
          <p>• Firebase charges per database operation (read/write)</p>
          <p>• Real-time features generate more reads but provide better user experience</p>
          <p>• Current usage is {data.readWriteRatio > 50 ? 'read-heavy' : 'balanced'} 
             ({data.readWriteRatio}:1 read-to-write ratio)</p>
          <p>• {data.realtimeListeners.active} active real-time connections are generating live updates</p>
        </div>
      </div>
    </div>
  );
};

// Details Tab Component
const DetailsTab = ({ data }) => {
  // Export session data as JSON
  const exportSessionData = () => {
    try {
      // Get all operations from the tracker
      const allOperations = getRecentOperations(1000); // Get up to 1000 recent operations
      const fullStats = getStats();
      
      // Create comprehensive export data
      const exportData = {
        exportInfo: {
          timestamp: new Date().toISOString(),
          sessionDuration: data.sessionDuration,
          totalOperations: data.session.totalOperations,
          exportedOperations: allOperations.length
        },
        summary: {
          session: data.session,
          last5min: data.last5min,
          collections: data.collections,
          realtimeListeners: data.realtimeListeners,
          alerts: data.alerts,
          performanceStatus: data.performanceStatus
        },
        detailedOperations: allOperations.map(op => ({
          id: op.id,
          timestamp: new Date(op.timestamp).toISOString(),
          type: op.type,
          collection: op.collection,
          resultCount: op.resultCount,
          details: op.details,
          category: op.category,
          cost: op.cost,
          sessionTime: op.sessionTime,
          timeAgo: formatTimeAgo(op.timestamp)
        })),
        analytics: {
          operationsByType: {},
          operationsByCollection: {},
          operationsByMinute: {},
          costBreakdown: {}
        }
      };
      
      // Calculate analytics
      allOperations.forEach(op => {
        // By type
        exportData.analytics.operationsByType[op.type] = 
          (exportData.analytics.operationsByType[op.type] || 0) + 1;
        
        // By collection
        exportData.analytics.operationsByCollection[op.collection] = 
          (exportData.analytics.operationsByCollection[op.collection] || 0) + 1;
        
        // By minute (for trend analysis)
        const minute = new Date(op.timestamp).toISOString().substring(0, 16); // YYYY-MM-DDTHH:MM
        exportData.analytics.operationsByMinute[minute] = 
          (exportData.analytics.operationsByMinute[minute] || 0) + 1;
        
        // Cost breakdown
        if (op.cost > 0) {
          exportData.analytics.costBreakdown[op.collection] = 
            (exportData.analytics.costBreakdown[op.collection] || 0) + op.cost;
        }
      });
      
      // Create and download file as TXT with JSON content
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `firebase-session-data-${new Date().toISOString().split('T')[0]}-${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      console.log('📥 Session data exported successfully as TXT:', {
        totalOperations: allOperations.length,
        timeRange: allOperations.length > 0 ? {
          start: new Date(allOperations[allOperations.length - 1].timestamp).toISOString(),
          end: new Date(allOperations[0].timestamp).toISOString()
        } : null
      });
      
    } catch (error) {
      console.error('Error exporting session data:', error);
      alert('Error exporting data. Please check the console for details.');
    }
  };

  // Export as actual JSON file
  const exportAsJSON = () => {
    try {
      // Get all operations from the tracker
      const allOperations = getRecentOperations(1000);
      const fullStats = getStats();
      
      // Create comprehensive export data
      const exportData = {
        exportInfo: {
          timestamp: new Date().toISOString(),
          sessionDuration: data.sessionDuration,
          totalOperations: data.session.totalOperations,
          exportedOperations: allOperations.length
        },
        summary: {
          session: data.session,
          last5min: data.last5min,
          collections: data.collections,
          realtimeListeners: data.realtimeListeners,
          alerts: data.alerts,
          performanceStatus: data.performanceStatus
        },
        detailedOperations: allOperations.map(op => ({
          id: op.id,
          timestamp: new Date(op.timestamp).toISOString(),
          type: op.type,
          collection: op.collection,
          resultCount: op.resultCount,
          details: op.details,
          category: op.category,
          cost: op.cost,
          sessionTime: op.sessionTime,
          timeAgo: formatTimeAgo(op.timestamp)
        })),
        analytics: {
          operationsByType: {},
          operationsByCollection: {},
          operationsByMinute: {},
          costBreakdown: {}
        }
      };
      
      // Calculate analytics
      allOperations.forEach(op => {
        // By type
        exportData.analytics.operationsByType[op.type] = 
          (exportData.analytics.operationsByType[op.type] || 0) + 1;
        
        // By collection
        exportData.analytics.operationsByCollection[op.collection] = 
          (exportData.analytics.operationsByCollection[op.collection] || 0) + 1;
        
        // By minute (for trend analysis)
        const minute = new Date(op.timestamp).toISOString().substring(0, 16);
        exportData.analytics.operationsByMinute[minute] = 
          (exportData.analytics.operationsByMinute[minute] || 0) + 1;
        
        // Cost breakdown
        if (op.cost > 0) {
          exportData.analytics.costBreakdown[op.collection] = 
            (exportData.analytics.costBreakdown[op.collection] || 0) + op.cost;
        }
      });
      
      // Create and download file as JSON
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `firebase-session-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      console.log('📥 Session data exported successfully as JSON:', {
        totalOperations: allOperations.length
      });
      
    } catch (error) {
      console.error('Error exporting JSON data:', error);
      alert('Error exporting JSON data. Please check the console for details.');
    }
  };

  // Generate detailed report
  const generateReport = () => {
    try {
      const allOperations = getRecentOperations(1000);
      
      // Create a human-readable report
      const report = `
FIREBASE DATABASE USAGE REPORT
Generated: ${new Date().toLocaleString()}
Session Duration: ${data.sessionDuration}

=== SUMMARY ===
Total Operations: ${data.session.totalOperations}
Read Operations: ${data.session.totalReads}
Write Operations: ${data.session.totalWrites}
Total Cost: $${data.session.totalCost.toFixed(6)}
Read/Write Ratio: ${data.readWriteRatio}:1

=== RECENT ACTIVITY (Last 5 minutes) ===
Operations: ${data.last5min.operations}
Reads per minute: ${data.last5min.readsPerMinute}
Cost: $${data.last5min.cost.toFixed(6)}

=== TOP COLLECTIONS ===
${data.collections.slice(0, 5).map(col => 
  `${col.name}: ${col.operations} operations, $${col.cost.toFixed(6)}`
).join('\n')}

=== ACTIVE REAL-TIME LISTENERS ===
${data.realtimeListeners.list.map(listener => 
  `${listener.collection}: ${listener.readCount} reads, ${formatDuration(listener.duration)} active`
).join('\n')}

=== ALERTS ===
${data.alerts.map(alert => `${alert.type.toUpperCase()}: ${alert.title} - ${alert.message}`).join('\n')}

=== DETAILED OPERATIONS (Last 50) ===
${allOperations.slice(0, 50).map(op => 
  `${new Date(op.timestamp).toLocaleTimeString()} | ${op.type} | ${op.collection} | ${op.resultCount} docs | ${op.details}`
).join('\n')}
      `;
      
      // Download as text file
      const blob = new Blob([report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `firebase-report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please check the console for details.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Technical Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-3">
            <MetricRow label="Operations/minute" value={data.last5min.operations / 5} />
            <MetricRow label="Read operations" value={data.session.totalReads} />
            <MetricRow label="Write operations" value={data.session.totalWrites} />
            <MetricRow label="Active listeners" value={data.realtimeListeners.active} />
            <MetricRow label="Session duration" value={data.sessionDuration} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Collections</h3>
          <div className="space-y-3">
            {data.collections.slice(0, 8).map((collection) => (
              <div key={collection.name} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{collection.name}</span>
                <span className="text-sm font-medium text-gray-900">
                  {collection.operations} ops
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts and Warnings */}
      {data.alerts.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h3>
          <div className="space-y-3">
            {data.alerts.map((alert, index) => (
              <div key={index} className={`p-4 rounded-lg ${getAlertStyle(alert.type)}`}>
                <div className="flex items-center space-x-3">
                  {getAlertIcon(alert.type)}
                  <div>
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-sm">{alert.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Data */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export & Reports</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={exportSessionData}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Download size={16} />
              <span>JSON as TXT</span>
            </button>
            <button 
              onClick={exportAsJSON}
              className="flex items-center space-x-2 px-4 py-2 border border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <BarChart3 size={16} />
              <span>JSON File</span>
            </button>
            <button 
              onClick={generateReport}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BarChart3 size={16} />
              <span>Text Report</span>
            </button>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>JSON as TXT:</strong> Complete session data in JSON format saved as .txt file (easy to view in any text editor)</p>
            <p><strong>JSON File:</strong> Complete session data as proper .json file for technical analysis and programming</p>
            <p><strong>Text Report:</strong> Human-readable summary report for management review and documentation</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Snapshot Listeners Tab Component
const SnapshotListenersTab = ({ data, users = [], channels = [] }) => {
  const { realtimeListeners } = data;
  const listenerList = realtimeListeners.list || [];
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Function to refresh listener data
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };
  
  // Group listeners by collection
  const listenersByCollection = listenerList.reduce((groups, listener) => {
    const collection = listener.collection;
    if (!groups[collection]) {
      groups[collection] = [];
    }
    groups[collection].push(listener);
    return groups;
  }, {});

  // Sort collections by number of listeners
  const sortedCollections = Object.keys(listenersByCollection).sort((a, b) => 
    listenersByCollection[b].length - listenersByCollection[a].length
  );
  
  // Get source badge style
  const getSourceBadgeStyle = (source) => {
    const styles = {
      'network_detection': 'bg-green-100 text-green-800',
      'hook_detection': 'bg-blue-100 text-blue-800',
      'path_detection': 'bg-purple-100 text-purple-800',
      'auto_detection': 'bg-indigo-100 text-indigo-800',
      'console_sync': 'bg-yellow-100 text-yellow-800'
    };
    return styles[source] || 'bg-gray-100 text-gray-800';
  };
  
  // Get friendly source name
  const getSourceDisplayName = (source) => {
    const names = {
      'network_detection': 'Network Traffic',
      'hook_detection': 'React Hook',
      'path_detection': 'Page Route',
      'auto_detection': 'Auto Detection',
      'console_sync': 'Manual Sync'
    };
    return names[source] || source || 'Unknown';
  };

  // Get collection icon based on name
  const getCollectionIcon = (collection) => {
    const icons = {
      'messages': MessageCircle,
      'channels': Users,
      'tasks': CheckCircle,
      'users': Users,
      'accounts': DollarSign,
      'classes': BookOpen,
      'enrollments': Calendar
    };
    
    const IconComponent = icons[collection] || Database;
    return <IconComponent size={16} />;
  };

  // Format description to be more readable
  const formatDescription = (description, collection, users = [], channels = []) => {
    if (!description) return '-';
    
    // For channels collection
    if (collection === 'channels' && description.includes('User channels for')) {
      const userId = description.split('User channels for ')[1];
      const user = users.find(u => u.id === userId);
      return user ? `${user.displayName || user.email}'s Channels` : 'User Channels';
    }
    
    // For messages collection
    if (collection === 'messages' && description.includes('Channel messages for')) {
      const channelId = description.split('Channel messages for ')[1];
      const channel = channels.find(ch => ch.id === channelId);
      return channel ? `Messages in #${channel.name}` : 'Channel Messages';
    }
    
    return description;
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Activity className="h-10 w-10 text-indigo-600" />
            <div>
              <h3 className="text-lg font-semibold text-indigo-900">Active Snapshot Listeners</h3>
              <p className="text-indigo-700">
                {realtimeListeners.active === 0 
                  ? 'No active listeners detected' 
                  : `${realtimeListeners.active} active real-time listeners consuming data updates`}
              </p>
            </div>
          </div>
          
          {/* Refresh button */}
          <div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 ${
                isRefreshing 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
        
        {/* Detection types info */}
        <div className="mt-4 text-xs text-indigo-800 grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
            <span>Network Detection: Captures network requests</span>
          </div>
          <div className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
            <span>Hook Detection: Scans React component hooks</span>
          </div>
          <div className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-purple-500 mr-2"></span>
            <span>Page Detection: Based on current route</span>
          </div>
        </div>
      </div>

      {/* No Listeners Message */}
      {listenerList.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <EyeOff className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Listeners</h3>
          <p className="text-gray-600 mb-4">
            There are currently no active Firestore snapshot listeners tracked in this session.
          </p>
          <p className="text-sm text-gray-500">
            The system is actively scanning for listeners - they'll appear here once detected.
          </p>
          <div className="mt-6 flex justify-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-lg">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-left">
                  <h4 className="font-medium text-blue-800">Automatic Detection Active</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    The system uses multiple methods to detect active listeners including network monitoring,
                    React hook scanning, and page route analysis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Listeners By Collection */}
      {sortedCollections.map(collection => (
        <div key={collection} className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Database className="h-5 w-5 mr-2 text-indigo-600" />
            {getCollectionDisplayName(collection)} Collection
            <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded-full">
              {listenersByCollection[collection].length} listeners
            </span>
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Listener ID
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Read Count
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reads/Minute
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detection Source
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {listenersByCollection[collection].map(listener => {
                  const durationMinutes = listener.duration / 60000;
                  const readsPerMinute = durationMinutes > 0 
                    ? (listener.readCount / durationMinutes).toFixed(1) 
                    : listener.readCount;
                    
                  return (
                    <tr key={listener.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {listener.id.split('_')[0]}_{listener.id.split('_')[2] || ''}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {formatDuration(listener.duration)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {listener.readCount}
                      </td>
                      <td className={`px-4 py-2 whitespace-nowrap text-sm ${
                        readsPerMinute > 10 
                          ? 'text-orange-600 font-medium' 
                          : 'text-gray-500'
                      }`}>
                        {readsPerMinute}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getSourceBadgeStyle(listener.source)}`}>
                          {getSourceDisplayName(listener.source)}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {formatDescription(listener.details, listener.collection, users, channels)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Performance Impact */}
      {listenerList.length > 0 && (
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">⚠️ Performance Impact</h3>
          <div className="space-y-2 text-yellow-800">
            <p>• Each snapshot listener consumes bandwidth by receiving real-time updates</p>
            <p>• High read counts may indicate inefficient queries or excessive update frequency</p>
            <p>• Consider detaching listeners when components unmount or views change</p>
            <p>• Use compound queries to minimize the number of listeners needed</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Listener Tab Component
const ListenerTab = ({ realtimeListeners, channels, users }) => {
  const [trackedListeners, setTrackedListeners] = useState([]);
  const [listenerHistory, setListenerHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [readStats, setReadStats] = useState({
    totalReads: 0,
    totalDocuments: 0,
    listenerStats: []
  });
  
  // Effect to get listeners on mount and refresh
  useEffect(() => {
    refreshListeners();
  }, []);
  
  // Handle refresh button click
  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshListeners();
    setTimeout(() => setIsRefreshing(false), 500);
  };
  
  // Refresh listeners data
  const refreshListeners = () => {
    setTrackedListeners(getActiveListeners());
    setListenerHistory(getAllListeners());
    setReadStats(getListenerReadStats());
  };
  
  // Clear inactive listeners
  const handleClearInactive = () => {
    clearInactiveListeners();
    setListenerHistory(getAllListeners());
  };
  
  // Group listeners by collection
  const listenersByCollection = useMemo(() => {
    const grouped = {};
    
    trackedListeners.forEach(listener => {
      if (!grouped[listener.collection]) {
        grouped[listener.collection] = [];
      }
      grouped[listener.collection].push(listener);
    });
    
    return grouped;
  }, [trackedListeners]);
  
  // Get sorted collection names
  const sortedCollections = useMemo(() => {
    return Object.keys(listenersByCollection).sort();
  }, [listenersByCollection]);
  
  // Format duration
  const formatDuration = (milliseconds) => {
    if (!milliseconds) return 'Just started';
    
    const seconds = Math.floor(milliseconds / 1000);
    if (seconds < 60) return `${seconds}s`;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  // Format time for display
  const formatTime = (date) => {
    if (!date) return 'N/A';
    
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  
  // Get collection icon based on name
  const getCollectionIcon = (collection) => {
    const icons = {
      'messages': MessageCircle,
      'channels': Users,
      'tasks': CheckCircle,
      'users': Users,
      'accounts': DollarSign,
      'classes': BookOpen,
      'enrollments': Calendar
    };
    
    const IconComponent = icons[collection] || Database;
    return <IconComponent size={16} />;
  };

  // Format description to be more readable
  const formatDescription = (description, collection, users = [], channels = []) => {
    if (!description) return '-';
    
    // For channels collection
    if (collection === 'channels' && description.includes('User channels for')) {
      const userId = description.split('User channels for ')[1];
      const user = users.find(u => u.id === userId);
      return user ? `${user.displayName || user.email}'s Channels` : 'User Channels';
    }
    
    // For messages collection
    if (collection === 'messages' && description.includes('Channel messages for')) {
      const channelId = description.split('Channel messages for ')[1];
      const channel = channels.find(ch => ch.id === channelId);
      return channel ? `Messages in #${channel.name}` : 'Channel Messages';
    }
    
    return description;
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Radio className="h-10 w-10 text-purple-600" />
            <div>
              <h3 className="text-lg font-semibold text-purple-900">Firestore Listener Tracking</h3>
              <p className="text-purple-700">
                {trackedListeners.length === 0 
                  ? 'No active listeners have been tracked yet' 
                  : `${trackedListeners.length} active listeners are being tracked in real-time`}
              </p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 bg-purple-100 text-purple-700 hover:bg-purple-200"
            >
              {showHistory ? <Eye size={16} /> : <EyeOff size={16} />}
              <span>{showHistory ? 'Hide History' : 'Show History'}</span>
            </button>
            
            {showHistory && (
              <button
                onClick={handleClearInactive}
                className="px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 bg-red-100 text-red-700 hover:bg-red-200"
              >
                <Trash2 size={16} />
                <span>Clear Inactive</span>
              </button>
            )}
            
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 ${
                isRefreshing 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
        
        {/* Reads Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white rounded-lg p-4 border border-purple-200 flex items-center justify-between">
            <div className="flex items-center">
              <Eye className="h-5 w-5 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Total Reads</span>
            </div>
            <span className="text-lg font-semibold text-purple-900">{readStats.totalReads.toLocaleString()}</span>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-purple-200 flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Total Documents</span>
            </div>
            <span className="text-lg font-semibold text-purple-900">{readStats.totalDocuments.toLocaleString()}</span>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-purple-200 flex items-center justify-between">
            <div className="flex items-center">
              <Radio className="h-5 w-5 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Active Listeners</span>
            </div>
            <span className="text-lg font-semibold text-purple-900">{trackedListeners.length}</span>
          </div>
        </div>
      </div>
      
      {/* High-Activity Listeners */}
      {readStats.listenerStats.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-orange-600" />
            High-Activity Listeners
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Collection
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reads
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documents
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reads/Min
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Docs/Read
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Read
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {readStats.listenerStats.slice(0, 5).map((listener, idx) => (
                  <tr key={listener.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        {getCollectionIcon(listener.collection)}
                        <span className="ml-2 text-sm font-medium text-gray-900">
                          {getCollectionDisplayName(listener.collection)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatDescription(listener.description, listener.collection, users, channels)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {listener.readCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {listener.documentCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${listener.readsPerMinute > 10 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                        {listener.readsPerMinute}/min
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {listener.avgDocsPerRead}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {listener.lastRead ? formatTime(listener.lastRead) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Listeners by Collection */}
      {sortedCollections.map(collection => (
        <div key={collection} className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Database className="h-5 w-5 mr-2 text-indigo-600" />
            {getCollectionDisplayName(collection)} Collection
            <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded-full">
              {listenersByCollection[collection].length} listeners
            </span>
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Listener ID
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Read Count
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documents Read
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reads/Minute
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detection Source
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {listenersByCollection[collection].map((listener, idx) => {
                  // Find matching read stats for this listener
                  const readStat = readStats.listenerStats.find(stat => stat.id === listener.id) || {
                    readCount: 0,
                    documentCount: 0,
                    readsPerMinute: 0,
                    avgDocsPerRead: 0
                  };
                  
                  return (
                    <tr key={listener.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                        {listener.id.split('_')[1]}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatDuration(listener.active ? (Date.now() - listener.createdAt) : listener.duration)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {readStat.readCount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {readStat.documentCount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${readStat.readsPerMinute > 10 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                          {readStat.readsPerMinute}/min
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {listener.createdBy.file}:{listener.createdBy.line}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatDescription(listener.description, listener.collection, users, channels)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      
      {/* Show listener history if enabled */}
      {showHistory && listenerHistory.length > 0 && !trackedListeners.length && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-gray-600" />
            Listener History
            <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">
              {listenerHistory.filter(l => !l.active).length} closed listeners
            </span>
          </h3>
          
          {/* Closed listeners table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Collection
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reads
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Closed At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {listenerHistory
                  .filter(l => !l.active)
                  .sort((a, b) => b.closedAt - a.closedAt)
                  .slice(0, 10)
                  .map((listener, idx) => (
                    <tr key={listener.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          {getCollectionIcon(listener.collection)}
                          <span className="ml-2 text-sm font-medium text-gray-900">
                            {getCollectionDisplayName(listener.collection)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatDescription(listener.description, listener.collection, users, channels)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatDuration(listener.duration)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {listener.readCount || 0}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {listener.createdBy.file}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(listener.createdAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(listener.closedAt)}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
const StatusCard = ({ icon: Icon, title, value, subtitle, color, trend }) => {
  const colorClasses = {
    green: 'bg-green-50 text-green-900 border-green-200',
    blue: 'bg-blue-50 text-blue-900 border-blue-200',
    orange: 'bg-orange-50 text-orange-900 border-orange-200',
    red: 'bg-red-50 text-red-900 border-red-200',
    gray: 'bg-gray-50 text-gray-900 border-gray-200'
  };

  const trendIcons = {
    up: <TrendingUp className="h-4 w-4 text-red-500" />,
    down: <TrendingDown className="h-4 w-4 text-green-500" />,
    neutral: null
  };

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color] || colorClasses.gray}`}>
      <div className="flex items-center justify-between">
        <Icon className="h-8 w-8" />
        {trendIcons[trend]}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className="text-sm mt-1 opacity-75">{subtitle}</p>
    </div>
  );
};

const FeatureCard = ({ category, operations, cost }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3 mb-2">
        <span className="text-2xl">{category.icon}</span>
        <h4 className="font-medium text-gray-900">{category.name}</h4>
      </div>
      <p className="text-sm text-gray-600 mb-3">{category.description}</p>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">{operations} operations</span>
        <span className="font-medium text-indigo-600">${cost.toFixed(4)}</span>
      </div>
    </div>
  );
};

const MetricRow = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="text-sm font-medium text-gray-900">{value}</span>
  </div>
);

// Helper Functions
const formatDuration = (ms) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

const formatTimeAgo = (timestamp) => {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
};

const getPerformanceStatus = (readsPerMinute, alerts) => {
  const hasWarnings = alerts.some(a => a.type === 'warning');
  
  if (hasWarnings || readsPerMinute > 50) {
    return { label: 'High Activity', color: 'orange' };
  } else if (readsPerMinute > 20) {
    return { label: 'Moderate Activity', color: 'blue' };
  } else {
    return { label: 'Normal Activity', color: 'green' };
  }
};

const getCollectionDisplayName = (collection) => {
  const categories = {
    'messages': 'Chat Messages',
    'channels': 'Chat Rooms',
    'users': 'User Profiles',
    'classes': 'Class Management',
    'tasks': 'Task System',
    'enrollments': 'Student Records'
  };
  return categories[collection] || collection;
};

const getOperationIcon = (type) => {
  if (type.includes('READ')) return <Eye className="h-4 w-4" />;
  if (type.includes('WRITE')) return <Database className="h-4 w-4" />;
  if (type.includes('REALTIME')) return <Activity className="h-4 w-4" />;
  return <Database className="h-4 w-4" />;
};

const getOperationColor = (type) => {
  if (type.includes('READ')) return { bg: 'bg-blue-100', text: 'text-blue-600' };
  if (type.includes('WRITE')) return { bg: 'bg-green-100', text: 'text-green-600' };
  if (type.includes('REALTIME')) return { bg: 'bg-purple-100', text: 'text-purple-600' };
  return { bg: 'bg-gray-100', text: 'text-gray-600' };
};

const getOperationDescription = (type) => {
  const descriptions = {
    'READ': 'Retrieved data from database',
    'WRITE': 'Saved data to database',
    'REALTIME_READ': 'Live update received',
    'NETWORK_READ': 'Network data request',
    'NETWORK_WRITE': 'Network data save'
  };
  return descriptions[type] || 'Database operation';
};

const getAlertIcon = (type) => {
  const icons = {
    warning: <AlertTriangle className="h-5 w-5 text-orange-600" />,
    error: <AlertCircle className="h-5 w-5 text-red-600" />,
    info: <Info className="h-5 w-5 text-blue-600" />,
    success: <CheckCircle className="h-5 w-5 text-green-600" />
  };
  return icons[type] || icons.info;
};

const getAlertStyle = (type) => {
  const styles = {
    warning: 'bg-orange-50 border border-orange-200',
    error: 'bg-red-50 border border-red-200',
    info: 'bg-blue-50 border border-blue-200',
    success: 'bg-green-50 border border-green-200'
  };
  return styles[type] || styles.info;
};

export default ManagerFirebaseDashboard; 