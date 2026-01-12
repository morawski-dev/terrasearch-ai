const CrossIcon = ({
  color = "white",
  width = "1em",
  height = "1em",
  className = "",
}) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={color}
      height={height}
      width={width}
    >
      <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
    </svg>
  );
};

export default CrossIcon;
