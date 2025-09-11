import React from 'react';

export function Logo() {
  return (
    <svg
      width="42"
      height="42"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary dark:text-[#6d28d9]"
    >
      <path
        d="M49 10H15C12.2386 10 10 12.2386 10 15V37C10 39.7614 12.2386 42 15 42H24V51.9143C24 53.4796 25.8021 54.425 27.0496 53.483L38.2929 45H49C51.7614 45 54 42.7614 54 40V15C54 12.2386 51.7614 10 49 10Z"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <g className="stroke-primary-foreground dark:stroke-primary-foreground">
        <path
            d="M29.5 24.5L34.5 29.5L29.5 34.5"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M39.5 24.5L44.5 29.5L39.5 34.5"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
      </g>
      <path
        d="M49 10H15C12.2386 10 10 12.2386 10 15V37C10 39.7614 12.2386 42 15 42H24V51.9143C24 53.4796 25.8021 54.425 27.0496 53.483L38.2929 45H49C51.7614 45 54 42.7614 54 40V15C54 12.2386 51.7614 10 49 10Z"
        stroke="currentColor"
        strokeWidth="3"
      />
    </svg>
  );
}
