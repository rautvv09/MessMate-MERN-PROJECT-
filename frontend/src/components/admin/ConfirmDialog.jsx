import { FaExclamationTriangle, FaTimes, FaSpinner } from 'react-icons/fa';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = true,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-surface rounded-2xl w-full max-w-md shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-background">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isDanger ? 'bg-status-danger/10 text-status-danger' : 'bg-amber-500/10 text-amber-500'
              }`}
            >
              <FaExclamationTriangle size={14} />
            </div>
            <h3 className="text-base font-extrabold font-heading text-text-primary">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg transition-colors"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 bg-background">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-surface rounded-xl transition-all border border-border"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all flex items-center gap-2 ${
              isDanger
                ? 'bg-status-danger hover:bg-status-danger/90'
                : 'bg-primary hover:bg-primary-dark'
            } disabled:opacity-50`}
          >
            {isLoading && <FaSpinner className="animate-spin" size={12} />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
