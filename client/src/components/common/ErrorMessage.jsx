const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return (
    <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
      {message}
    </p>
  );
};

export default ErrorMessage;