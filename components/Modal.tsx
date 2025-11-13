"use client";
import { ModalProps } from "@/lib/types";

export default function Modal({ isOpen, title, message, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
        {title && <h2 className="text-xl font-semibold mb-2">{title}</h2>}
        {message && <p className="text-gray-700 mb-4">{message}</p>}
        {children}
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
