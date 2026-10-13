import { useEffect, useRef } from 'react';

export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  const inputRef = useRef(null);

  // useRef: put the cursor in the search box as soon as the page opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <input
      ref={inputRef}
      type="search"
      className="input search"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
