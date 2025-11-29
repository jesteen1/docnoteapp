import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className={`fixed bottom-4 right-4 z-50 flex items-center p-4 mb-4 w-full max-w-xs text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800 border-l-4 ${type === 'success' ? 'border-green-500' : 'border-red-500'}`} role="alert">
            <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${type === 'success' ? 'text-green-500 bg-green-100' : 'text-red-500 bg-red-100'} rounded-lg`}>
                {type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            </div>
            <div className="ml-3 text-sm font-normal">{message}</div>
            <button type="button" onClick={onClose} className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" aria-label="Close">
                <X size={16} />
            </button>
        </div>
    );
}
