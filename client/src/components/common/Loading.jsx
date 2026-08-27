const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">{message}</p>
      <p className="text-gray-500">{message}</p>
    </div>
  );
};

export default Loading;