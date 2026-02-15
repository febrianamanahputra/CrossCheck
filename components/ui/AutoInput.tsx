import React from 'react';

interface AutoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Add any custom props if needed
}

export const AutoInput: React.FC<AutoInputProps> = (props) => {
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
    if (props.onFocus) props.onFocus(e);
  };

  return (
    <input
      {...props}
      onFocus={handleFocus}
      className={`focus:outline-none focus:ring-1 focus:ring-primary/50 transition-shadow ${props.className || ''}`}
    />
  );
};