import React from 'react';
import { PromoVideoPlayer } from './PromoVideoPlayer';
import { X, Play } from 'lucide-react';

interface PromoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContractClick: () => void;
  onScheduleClick: () => void;
}

export const PromoVideoModal: React.FC<PromoVideoModalProps> = ({
  isOpen,
  onClose,
  onContractClick,
  onScheduleClick,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-4xl relative my-auto animate-scale-up">
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer border border-slate-700"
        >
          <X className="w-4 h-4" />
          <span>Fechar Vídeo</span>
        </button>

        <PromoVideoPlayer
          isModal={true}
          onClose={onClose}
          onContractClick={() => {
            onClose();
            onContractClick();
          }}
          onScheduleClick={() => {
            onClose();
            onScheduleClick();
          }}
        />
      </div>
    </div>
  );
};
