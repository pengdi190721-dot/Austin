import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Card } from './ui/Components';
import { WorkflowNode, WorkflowEdge } from '../types';
import { Play, Plus, X, Move, FileImage, Type } from 'lucide-react';
import { generateImageFromText, generateImageFromImage } from '../services/geminiService';

// --- Custom Node Components ---

const NodeView = ({ 
  node, 
  onDelete, 
  onUpdate,
  isSelected,
  onSelect
}: { 
  node: WorkflowNode; 
  onDelete: () => void;
  onUpdate: (data: any) => void;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const isInput = node.type === 'input';
  const isProcess = node.type === 'process';

  const typeMap = {
    input: '输入',
    process: '处理',
    output: '输出'
  };
  
  return (
    <div 
      className={`
        w-64 bg-surface border rounded-xl shadow-lg flex flex-col overflow-hidden transition-all
        ${isSelected ? 'border-banana-400 ring-2 ring-banana-400/20' : 'border-zinc-700'}
      `}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
    >
      <div className={`p-2 flex justify-between items-center ${isInput ? 'bg-zinc-800' : isProcess ? 'bg-purple-900/30' : 'bg-banana-900/30'}`}>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-300">
           {isInput ? <Type size={14} /> : isProcess ? <Move size={14} /> : <FileImage size={14} />}
           {typeMap[node.type] || node.type}
        </div>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-zinc-500 hover:text-red-400"><X size={14} /></button>
      </div>

      <div className="p-3 space-y-2 bg-black/40 h-full">
        {isInput && (
           <textarea 
            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-zinc-300 resize-none h-20 focus:outline-none focus:border-banana-400"
            placeholder="输入提示词..."
            value={node.data.value || ''}
            onChange={(e) => onUpdate({ ...node.data, value: e.target.value })}
            onMouseDown={(e) => e.stopPropagation()} // Allow text selection without dragging
           />
        )}
        {isProcess && (
          <div className="text-center py-4 text-xs text-zinc-500">
            将输入传递给 Gemini Flash Image
          </div>
        )}
        {node.type === 'output' && (
          <div className="min-h-[100px] bg-zinc-900/50 rounded flex items-center justify-center overflow-hidden">
            {node.data.image ? (
              <img src={node.data.image} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-zinc-600">等待运行...</span>
            )}
          </div>
        )}
      </div>

      {/* Handles */}
      <div className="flex justify-between px-2 pb-1 relative h-2">
         {node.type !== 'input' && <div className="w-3 h-3 rounded-full bg-zinc-500 absolute -top-16 -left-1.5 border-2 border-surface" />}
         {node.type !== 'output' && <div className="w-3 h-3 rounded-full bg-banana-400 absolute -top-16 -right-1.5 border-2 border-surface shadow-[0_0_10px_rgba(250,204,21,0.8)]" />}
      </div>
    </div>
  );
};

// --- Main Canvas ---

export const WorkflowEditor: React.FC = () => {
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    { id: '1', type: 'input', position: { x: 50, y: 100 }, data: { label: '提示词', value: '一只可爱的机器香蕉正在吃像素苹果' } },
    { id: '2', type: 'process', position: { x: 350, y: 100 }, data: { label: 'Gemini 生成器' } },
    { id: '3', type: 'output', position: { x: 650, y: 100 }, data: { label: '结果' } }
  ]);
  
  const [edges, setEdges] = useState<WorkflowEdge[]>([
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' }
  ]);

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  
  // Dragging logic
  const dragItem = useRef<{id: string, startX: number, startY: number, initialX: number, initialY: number} | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === id);
    if (node) {
      dragItem.current = {
        id,
        startX: e.clientX,
        startY: e.clientY,
        initialX: node.position.x,
        initialY: node.position.y
      };
      setSelectedNode(id);
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragItem.current) {
      const dx = e.clientX - dragItem.current.startX;
      const dy = e.clientY - dragItem.current.startY;
      
      setNodes(prev => prev.map(n => {
        if (n.id === dragItem.current?.id) {
          return {
            ...n,
            position: {
              x: dragItem.current.initialX + dx,
              y: dragItem.current.initialY + dy
            }
          };
        }
        return n;
      }));
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    dragItem.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);


  // --- Execution Logic ---
  const runWorkflow = async () => {
    setIsRunning(true);
    
    // Simple linear Execution for Demo: Input -> Process -> Output
    // In a real app, this would traverse the graph using topological sort.
    
    try {
      // 1. Find Input
      const inputNode = nodes.find(n => n.type === 'input');
      const processNode = nodes.find(n => n.type === 'process');
      const outputNode = nodes.find(n => n.type === 'output');

      if (!inputNode || !processNode || !outputNode) {
        alert("工作流不完整。需要 输入 -> 处理 -> 输出");
        setIsRunning(false);
        return;
      }

      // 2. Execute
      const prompt = inputNode.data.value || '';
      const result = await generateImageFromText(prompt);

      if (result.image) {
        // 3. Update Output Node
        setNodes(prev => prev.map(n => {
          if (n.id === outputNode.id) {
            return { ...n, data: { ...n.data, image: result.image } };
          }
          return n;
        }));
      }

    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  // --- Render Lines ---
  const renderConnections = () => {
    return edges.map(edge => {
      const source = nodes.find(n => n.id === edge.source);
      const target = nodes.find(n => n.id === edge.target);
      if (!source || !target) return null;

      // Calculate anchor points (roughly center right to center left)
      const x1 = source.position.x + 256; // width of node
      const y1 = source.position.y + 70; // rough vertical center
      const x2 = target.position.x;
      const y2 = target.position.y + 70;

      // Bezier curve
      const path = `M ${x1} ${y1} C ${x1 + 50} ${y1}, ${x2 - 50} ${y2}, ${x2} ${y2}`;

      return (
        <svg key={edge.id} className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          <path d={path} stroke="#52525b" strokeWidth="2" fill="none" />
          <path d={path} stroke="#facc15" strokeWidth="2" fill="none" strokeDasharray="5,5" className="animate-[dash_1s_linear_infinite] opacity-30" />
        </svg>
      );
    });
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden animate-in fade-in duration-700">
      {/* Toolbar */}
      <div className="h-14 border-b border-white/10 bg-surface/50 backdrop-blur flex items-center px-4 justify-between z-10">
        <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-sm font-mono">流程: 默认链</span>
        </div>
        <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setNodes([])}><X className="w-4 h-4 mr-1"/> 清空</Button>
            <Button size="sm" onClick={runWorkflow} isLoading={isRunning} className="bg-green-600 hover:bg-green-500 text-white border-none">
                <Play className="w-4 h-4 mr-2 fill-current" /> 运行流程
            </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        ref={canvasRef}
        className="flex-grow bg-[#0c0c0e] relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
        onClick={() => setSelectedNode(null)}
        style={{
            backgroundImage: 'radial-gradient(#27272a 1px, transparent 1px)',
            backgroundSize: '20px 20px'
        }}
      >
        {renderConnections()}

        {nodes.map(node => (
          <div 
            key={node.id} 
            className="absolute"
            style={{ transform: `translate(${node.position.x}px, ${node.position.y}px)` }}
            onMouseDown={(e) => handleMouseDown(e, node.id)}
          >
            <NodeView 
                node={node} 
                isSelected={selectedNode === node.id}
                onSelect={() => setSelectedNode(node.id)}
                onDelete={() => {
                    setNodes(prev => prev.filter(n => n.id !== node.id));
                    setEdges(prev => prev.filter(e => e.source !== node.id && e.target !== node.id));
                }}
                onUpdate={(data) => {
                    setNodes(prev => prev.map(n => n.id === node.id ? { ...n, data } : n));
                }}
            />
          </div>
        ))}

        <div className="absolute bottom-4 left-4 p-4 bg-surface/80 backdrop-blur rounded-lg border border-white/10 text-xs text-zinc-400 max-w-xs pointer-events-none">
            <p className="font-bold text-white mb-1">交互式画布</p>
            <p>拖动节点进行重新排列。这是一个线性演示流程：输入 -> 处理 -> 输出。在输入节点编辑提示词并点击“运行流程”。</p>
        </div>
      </div>
    </div>
  );
};