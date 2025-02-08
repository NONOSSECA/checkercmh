import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, AlertTriangle, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

interface ReputationData {
  score: number;
  risk: 'low' | 'medium' | 'high';
  blacklisted: boolean;
  lastChecked: string;
}

async function checkDomainReputation(domain: string): Promise<ReputationData> {
  // Simulated API call - in production, you would call a real reputation API
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // For demo purposes, generate a random score
  const score = Math.floor(Math.random() * 100);
  const risk = score > 70 ? 'low' : score > 40 ? 'medium' : 'high';
  const blacklisted = score < 30;
  
  return {
    score,
    risk,
    blacklisted,
    lastChecked: new Date().toISOString()
  };
}

function DomainReputation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [reputationData, setReputationData] = useState<ReputationData | null>(null);
  
  const domain = new URLSearchParams(location.search).get('domain') || '';

  const handleCheck = async () => {
    setLoading(true);
    try {
      const data = await checkDomainReputation(domain);
      setReputationData(data);
    } catch (error) {
      console.error('Failed to check reputation:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 70) return 'text-green-500';
    if (score > 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'medium':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'high':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Domain Extractor
        </button>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">Domain Reputation Checker</h1>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-700">Domain: </h2>
              <span className="font-mono text-lg">{domain}</span>
            </div>
            
            <button
              onClick={handleCheck}
              disabled={loading}
              className={`mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Checking...' : 'Check Reputation'}
            </button>
          </div>

          {loading && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
            </div>
          )}

          {reputationData && !loading && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">Reputation Score</h3>
                    <span className={`text-3xl font-bold ${getScoreColor(reputationData.score)}`}>
                      {reputationData.score}/100
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        reputationData.score > 70 ? 'bg-green-500' :
                        reputationData.score > 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${reputationData.score}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">Risk Level</h3>
                    <div className="flex items-center gap-2">
                      {getRiskIcon(reputationData.risk)}
                      <span className="text-lg font-semibold capitalize">
                        {reputationData.risk}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-700">Blacklist Status</h3>
                  <div className="flex items-center gap-2">
                    {reputationData.blacklisted ? (
                      <XCircle className="w-6 h-6 text-red-500" />
                    ) : (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                    <span className="text-lg font-semibold">
                      {reputationData.blacklisted ? 'Blacklisted' : 'Not Blacklisted'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-500 text-right">
                Last checked: {new Date(reputationData.lastChecked).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DomainReputation;