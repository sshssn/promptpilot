import React from 'react';

export function Logo() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      <path
        d="M24 16C24 12.6863 26.6863 10 30 10H42C47.5228 10 52 14.4772 52 20V44C52 49.5228 47.5228 54 42 54H30C26.6863 54 24 51.3137 24 48V16Z"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path
        d="M24 16C24 12.6863 26.6863 10 30 10H36V54H30C26.6863 54 24 51.3137 24 48V16Z"
        fill="currentColor"
      />
      <path
        d="M12 32L28 24V40L12 32Z"
        fill="currentColor"
        fillOpacity="0.6"
      />
    </svg>
  );
}
