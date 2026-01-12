const SendIcon = ({
  color = "white",
  width = "1em",
  height = "1em",
  className = "",
}) => {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill={color}
      height={height}
      width={width}
    >
      <path d="M0 0l20 10L0 20V0zm0 8v4l10-2L0 8z" />
    </svg>
  );
};

export default SendIcon;
