import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bug, ChevronDown, Trash2, Copy, Eye, EyeOff, Download, Activity, Network, Clock } from 'lucide-react';
import { useDebug } from '@/hooks/useDebug';

export function DebugPanel() {
  const { logs, isDebugMode, performanceMetrics, clearLogs, toggleDebugMode, exportLogs } = useDebug();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<string>('all');

  const toggleLogExpansion = (logId: string) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Erro ao copiar para clipboard:', err);
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'default';
      case 'network': return 'outline';
      case 'performance': return 'default';
      case 'component': return 'secondary';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'network': return <Network className="h-3 w-3" />;
      case 'performance': return <Activity className="h-3 w-3" />;
      case 'component': return <Bug className="h-3 w-3" />;
      default: return null;
    }
  };

  const filteredLogs = logs.filter(log => 
    filterType === 'all' || log.type === filterType
  );

  const errorCount = logs.filter(log => log.type === 'error').length;
  const warningCount = logs.filter(log => log.type === 'warning').length;

  if (!isDebugMode) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={toggleDebugMode}
          variant="outline"
          size="sm"
          className="bg-background/80 backdrop-blur-sm"
        >
          <Bug className="h-4 w-4 mr-2" />
          Debug
          {errorCount > 0 && (
            <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
              {errorCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[28rem]">
      <Card className="bg-background/95 backdrop-blur-sm border-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Debug Panel
              <div className="flex gap-1">
                {errorCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {errorCount} erros
                  </Badge>
                )}
                {warningCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {warningCount} avisos
                  </Badge>
                )}
              </div>
            </CardTitle>
            <div className="flex gap-1">
              <Button
                onClick={() => setIsOpen(!isOpen)}
                variant="ghost"
                size="sm"
              >
                {isOpen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                onClick={exportLogs}
                variant="ghost"
                size="sm"
                title="Exportar logs"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                onClick={clearLogs}
                variant="ghost"
                size="sm"
                title="Limpar logs"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                onClick={toggleDebugMode}
                variant="ghost"
                size="sm"
              >
                ✕
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {isOpen && (
          <CardContent className="pt-0">
            <Tabs defaultValue="logs" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="logs">Logs ({logs.length})</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="logs" className="mt-4">
                {/* Filtros */}
                <div className="flex gap-1 mb-3 flex-wrap">
                  <Button
                    variant={filterType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('all')}
                    className="text-xs h-7"
                  >
                    Todos
                  </Button>
                  <Button
                    variant={filterType === 'error' ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('error')}
                    className="text-xs h-7"
                  >
                    Erros ({logs.filter(l => l.type === 'error').length})
                  </Button>
                  <Button
                    variant={filterType === 'warning' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('warning')}
                    className="text-xs h-7"
                  >
                    Avisos ({logs.filter(l => l.type === 'warning').length})
                  </Button>
                  <Button
                    variant={filterType === 'network' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('network')}
                    className="text-xs h-7"
                  >
                    Rede ({logs.filter(l => l.type === 'network').length})
                  </Button>
                </div>

                <ScrollArea className="h-80">
                  <div className="space-y-2">
                    {filteredLogs.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        {filterType === 'all' ? 'Nenhum log ainda' : `Nenhum log do tipo "${filterType}"`}
                      </p>
                    ) : (
                      filteredLogs.map((log) => (
                        <Collapsible key={log.id}>
                          <div className="border rounded-lg p-2 hover:bg-muted/50 transition-colors">
                            <CollapsibleTrigger
                              onClick={() => toggleLogExpansion(log.id)}
                              className="w-full text-left"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant={getTypeColor(log.type) as any} className="text-xs">
                                    {getTypeIcon(log.type)}
                                    {log.type}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                  </span>
                                  {log.source && (
                                    <span className="text-xs text-muted-foreground bg-muted px-1 rounded">
                                      {log.source}
                                    </span>
                                  )}
                                </div>
                                <ChevronDown className="h-4 w-4" />
                              </div>
                              <p className="text-sm mt-1 text-left line-clamp-2">{log.message}</p>
                            </CollapsibleTrigger>
                            
                            <CollapsibleContent>
                              <div className="mt-2 pt-2 border-t space-y-2">
                                {log.url && (
                                  <div>
                                    <p className="text-xs font-medium mb-1">URL:</p>
                                    <p className="text-xs bg-muted p-1 rounded font-mono break-all">
                                      {log.url}
                                    </p>
                                  </div>
                                )}
                                
                                {log.details && (
                                  <div>
                                    <p className="text-xs font-medium mb-1">Detalhes:</p>
                                    <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                                      {JSON.stringify(log.details, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                
                                {log.stack && (
                                  <div>
                                    <p className="text-xs font-medium mb-1">Stack Trace:</p>
                                    <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-20">
                                      {log.stack}
                                    </pre>
                                  </div>
                                )}
                                
                                <Button
                                  onClick={() => copyToClipboard(JSON.stringify(log, null, 2))}
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs"
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copiar Log
                                </Button>
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="performance" className="mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Tempo de Carregamento</span>
                      </div>
                      <p className="text-lg font-bold">
                        {performanceMetrics.loadTime}ms
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Tempo de Render</span>
                      </div>
                      <p className="text-lg font-bold">
                        {performanceMetrics.renderTime}ms
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Network className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">Requisições</span>
                      </div>
                      <p className="text-lg font-bold">
                        {performanceMetrics.networkRequests}
                      </p>
                    </div>
                    
                    {performanceMetrics.memoryUsage && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Bug className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium">Memória (MB)</span>
                        </div>
                        <p className="text-lg font-bold">
                          {performanceMetrics.memoryUsage}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Carregamento &gt; 3s será marcado como lento</p>
                    <p>• Logs de rede incluem tempo de resposta</p>
                    <p>• Métricas coletadas em tempo real</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        )}
      </Card>
    </div>
  );
}