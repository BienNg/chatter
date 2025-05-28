import React from 'react';
import { Upload, FileText, Database, ArrowRight } from 'lucide-react';

/**
 * ImportTab - Import functionality tab component
 * Displays import features and coming soon message
 */
export const ImportTab = ({ channelId }) => {
  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <Upload className="w-5 h-5 text-indigo-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Import Data</h2>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Import and manage data from external sources
        </p>
      </div>

      {/* Coming Soon Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          {/* Icon */}
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-indigo-600" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Import Features Coming Soon
          </h3>

          {/* Description */}
          <p className="text-gray-500 mb-6">
            We're building powerful import capabilities to help you bring data from various sources into your channels.
          </p>

          {/* Feature Preview */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Planned Features:</h4>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <FileText className="w-4 h-4 mr-2 text-gray-400" />
                <span>CSV and Excel file imports</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Database className="w-4 h-4 mr-2 text-gray-400" />
                <span>Database connections</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <ArrowRight className="w-4 h-4 mr-2 text-gray-400" />
                <span>API integrations</span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            In Development
          </div>
        </div>
      </div>
    </div>
  );
}; 