import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** 헤더 우측 닫기 버튼 왼쪽에 추가로 렌더링할 액션 */
  headerActions?: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children, headerActions }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        <div className="relative bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold">{title}</h2>
            <div className="flex items-center gap-2">
              {headerActions}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};
