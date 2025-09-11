import React from 'react';

export function Logo() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      <path
        d="M49 10H15C12.2386 10 10 12.2386 10 15V37C10 39.7614 12.2386 42 15 42H24V51.9143C24 53.4796 25.8021 54.425 27.0496 53.483L38.2929 45H49C51.7614 45 54 42.7614 54 40V15C54 12.2386 51.7614 10 49 10Z"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path
        d="M26 22V34"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="3"
        strokeLinecap="round"
        className="group-data-[dark]:stroke-primary"
      />
      <path
        d="M22 28H30"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="3"
        strokeLinecap="round"
        className="group-data-[dark]:stroke-primary"
      />
      <path
        d="M49 10H15C12.2386 10 10 12.2386 10 15V37C10 39.7614 12.2386 42 15 42H24V51.9143C24 53.4796 25.8021 54.425 27.0496 53.483L38.2929 45H49C51.7614 45 54 42.7614 54 40V15C54 12.2386 51.7614 10 49 10Z"
        stroke="currentColor"
        strokeWidth="3"
      />
    </svg>
  );
}
