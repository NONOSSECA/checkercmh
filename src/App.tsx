import React, { useState, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Globe2, Shield, AlertCircle, ExternalLink } from 'lucide-react';
import DomainReputation from './pages/DomainReputation';

interface DomainInfo {
  domain: string;
  dmarc: boolean | null;
  spf: boolean | null;
  rdns: boolean | null;
  loading: boolean;
  error?: string;
}

function extractDomains(text: string): string[] {
  const domainRegex = /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/gi;
  const domains = [...new Set(text.match(domainRegex) || [])];
  return domains.sort();
}

async function checkDomainRecords(domain: string): Promise<Partial<DomainInfo>> {
  try {
    const response = await fetch(`https://dns.google/resolve?name=_dmarc.${domain}&type=TXT`);
    const dmarcData = await response.json();
    
    const spfResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=TXT`);
    const spfData = await response.json();
    
    const ptrResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=PTR`);
    const ptrData = await response.json();

    return {
      dmarc: dmarcData.Answer?.length > 0,
      spf: spfData.Answer?.some((record: any) => record.data.includes('v=spf1')),
      rdns: ptrData.Answer?.length > 0,
      loading: false
    };
  } catch (error) {
    return {
      error: 'Failed to check domain records',
      loading: false
    };
  }
}

function DomainExtractor() {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [domains, setDomains] = useState<DomainInfo[]>([]);

  const handleExtract = useCallback(() => {
    const extractedDomains = extractDomains(inputText);
    setDomains(extractedDomains.map(domain => ({
      domain,
      dmarc: null,
      spf: null,
      rdns: null,
      loading: false
    })));
  }, [inputText]);

  const handleCheck = async (domain: string) => {
    setDomains(prev => prev.map(d => 
      d.domain === domain ? { ...d, loading: true } : d
    ));

    const results = await checkDomainRecords(domain);
    
    setDomains(prev => prev.map(d => 
      d.domain === domain ? { ...d, ...results } : d
    ));
  };

  const handleCopy = async (domain: string) => {
    await navigator.clipboard.writeText(domain);
  };

  const handleCheckReputation = (domain: string) => {
    navigate(`/reputation?domain=${encodeURIComponent(domain)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Globe2 className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-800">Domain Extractor & Checker</h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <textarea
            className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            placeholder="Paste your text here... (e.g., Check out example.com and test.org)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            onClick={handleExtract}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Extract Domains
          </button>
        </div>

        {domains.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Found {domains.length} domain{domains.length !== 1 ? 's' : ''}
            </h2>
            <div className="space-y-2">
              {domains.map((domainInfo, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <span className="font-mono text-gray-700">{domainInfo.domain}</span>
                  <div className="flex items-center gap-2">
                    {domainInfo.loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent"></div>
                    ) : domainInfo.error ? (
                      <AlertCircle className="w-4 h-4 text-red-500" title={domainInfo.error} />
                    ) : (
                      <>
                        {domainInfo.dmarc !== null && (
                          <Shield className={`w-4 h-4 ${domainInfo.dmarc ? 'text-green-500' : 'text-red-500'}`} 
                                 title={`DMARC: ${domainInfo.dmarc ? 'Found' : 'Not Found'}`} />
                        )}
                        {domainInfo.spf !== null && (
                          <Shield className={`w-4 h-4 ${domainInfo.spf ? 'text-green-500' : 'text-red-500'}`}
                                 title={`SPF: ${domainInfo.spf ? 'Found' : 'Not Found'}`} />
                        )}
                        {domainInfo.rdns !== null && (
                          <Shield className={`w-4 h-4 ${domainInfo.rdns ? 'text-green-500' : 'text-red-500'}`}
                                 title={`rDNS: ${domainInfo.rdns ? 'Found' : 'Not Found'}`} />
                        )}
                      </>
                    )}
                    <button
                      onClick={() => handleCheck(domainInfo.domain)}
                      className="px-3 py-1 text-sm bg-indigo-100 text-indigo-600 hover:bg-indigo-200 rounded transition-colors"
                    >
                      Check
                    </button>
                    <button
                      onClick={() => handleCheckReputation(domainInfo.domain)}
                      className="px-3 py-1 text-sm bg-green-100 text-green-600 hover:bg-green-200 rounded transition-colors flex items-center gap-1"
                    >
                      Reputation <ExternalLink className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleCopy(domainInfo.domain)}
                      className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<DomainExtractor />} />
      <Route path="/reputation" element={<DomainReputation />} />
    </Routes>
  );
}

export default App;