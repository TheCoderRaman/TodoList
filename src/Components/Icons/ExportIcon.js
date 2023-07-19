import * as React from "react";

export const ExportIcon = ({
  fill,
  size,
  width = 24,
  height = 24,
  className,
  ...props
}) => {
  return (
    <svg
      className={className}
      fill="currentColor"
      height={size || height}
      viewBox="0 0 24 24"
      width={size || width}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M11 16h2V7h3l-4-5-4 5h3z"></path>
      <path d="M5 22h14c1.103 0 2-.897 2-2v-9c0-1.103-.897-2-2-2h-4v2h4v9H5v-9h4V9H5c-1.103 0-2 .897-2 2v9c0 1.103.897 2 2 2z"></path>
    </svg>
  );
};