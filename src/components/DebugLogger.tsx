"use client";

import { useState, useEffect } from "react";

// 全局日志存储
const logMessages: string[] = [];

// 添加日志的函数，可以在任何地方调用
export function addLog(message: string): void {
  const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  logMessages.unshift(logMessage);

  // 保持日志不超过100条
  if (logMessages.length > 100) {
    logMessages.pop();
  }
}

// 清除所有日志
export function clearLogs(): void {
  logMessages.length = 0;
}

// 日志显示组件
export default function DebugLogger() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 每秒更新一次日志显示
    const interval = setInterval(() => {
      setLogs([...logMessages]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <button
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-md z-50"
        onClick={() => setIsVisible(true)}
      >
        显示日志
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 w-full md:w-1/2 lg:w-1/3 h-64 bg-gray-900 text-green-400 p-2 overflow-auto z-50 opacity-90 text-xs font-mono">
      <div className="flex justify-between mb-2">
        <h3 className="font-bold">调试日志</h3>
        <div>
          <button
            className="bg-red-500 text-white px-2 py-1 rounded-md mr-2"
            onClick={clearLogs}
          >
            清除
          </button>
          <button
            className="bg-gray-500 text-white px-2 py-1 rounded-md"
            onClick={() => setIsVisible(false)}
          >
            隐藏
          </button>
        </div>
      </div>
      <div className="border-t border-gray-700 pt-2">
        {logs.map((log, index) => (
          <div key={index} className="mb-1">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
