const DotSpinner: React.FC<{ color?: string; height?: string; width?: string }> = ({
  color = "bg-white",
  height = "h-2",
  width = "w-2",
}) => {
  return (
    <div className="flex justify-center items-center space-x-1 h-10">
      <div
        className={`${width} ${height} ${color} rounded-full animate-bounce`}
        style={{ animationDelay: "-0.20s" }}
      ></div>
      <div
        className={`${width} ${height} ${color} rounded-full animate-bounce`}
        style={{ animationDelay: "-0.10s" }}
      ></div>
      <div className={`${width} ${height} ${color} rounded-full animate-bounce`}></div>
    </div>
  );
};

export default DotSpinner;
