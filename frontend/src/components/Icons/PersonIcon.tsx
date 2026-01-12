const PersonIcon = ({
  color = "white",
  width = "1em",
  height = "1em",
  className = "",
}) => {
  return (
    <svg
      className={className}
      viewBox="0 0 20 26"
      fill={color}
      height={height}
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 10.5C12.7614 10.5 15 8.26142 15 5.5C15 2.73858 12.7614 0.5 10 0.5C7.23858 0.5 5 2.73858 5 5.5C5 8.26142 7.23858 10.5 10 10.5Z"
        fill="url(#paint0_linear_136_566)"
      />
      <path
        d="M20 19.875C20 22.9812 20 25.5 10 25.5C0 25.5 0 22.9812 0 19.875C0 16.7688 4.4775 14.25 10 14.25C15.5225 14.25 20 16.7688 20 19.875Z"
        fill="white"
      />
      <defs>
        <linearGradient
          id="paint0_linear_136_566"
          x1="5"
          y1="4.46836"
          x2="12.6577"
          y2="10.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFE4" />
          <stop offset="1" stopColor="#0661A9" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default PersonIcon;
