export const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
    </div>
  );
};

interface IErrorModalProps{
    error: Error
    onClose: any
}
export const ErrorModal: React.FC<IErrorModalProps> = ({ error, onClose }) => {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-md w-80">
          <h2 className="text-xl font-semibold mb-4">Error</h2>
          <p className="text-red-600">{error.message}</p>
          <div className="mt-6 flex justify-end">
            <button
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };
