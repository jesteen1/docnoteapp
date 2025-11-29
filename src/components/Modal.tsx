import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Content */}
            <div className="relative z-50 w-full max-w-lg mx-auto my-6 bg-white rounded-lg shadow-xl">
                <div className="flex items-start justify-between p-5 border-b border-solid border-gray-200 rounded-t">
                    <h3 className="text-xl font-semibold text-gray-900">
                        {title}
                    </h3>
                    <button
                        className="p-1 ml-auto bg-transparent border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                        onClick={onClose}
                    >
                        <span className="bg-transparent text-gray-500 h-6 w-6 text-2xl block outline-none focus:outline-none">
                            <X size={20} />
                        </span>
                    </button>
                </div>
                <div className="relative p-6 flex-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
