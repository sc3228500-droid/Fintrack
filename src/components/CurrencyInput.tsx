import React from 'react';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string | number;
  onChangeValue: (value: string) => void;
}

export default function CurrencyInput({ value, onChangeValue, ...props }: CurrencyInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    
    // Remove all dots (thousands separators)
    val = val.replace(/\./g, '');
    
    // Replace comma with dot for standard parsing (decimals)
    val = val.replace(',', '.');
    
    // Allow only digits and one dot
    val = val.replace(/[^0-9.]/g, '');
    
    // Prevent multiple dots
    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit decimal places to 2
    if (parts.length > 1 && parts[1].length > 2) {
      val = parts[0] + '.' + parts[1].slice(0, 2);
    }
    
    onChangeValue(val);
  };

  const formatDisplayValue = (val: string | number) => {
    if (val === '' || val === null || val === undefined) return '';
    
    const strVal = val.toString();
    const parts = strVal.split('.');
    const integerPart = parts[0];
    const decimalPart = parts.length > 1 ? ',' + parts[1] : ''; // Display comma for decimals in Spanish locale
    
    // Format integer part with dots
    const formattedInteger = integerPart 
      ? new Intl.NumberFormat('es-CO').format(parseInt(integerPart, 10)) 
      : '';
      
    // If the original string ended with a dot/comma, keep it in the display
    if (strVal.endsWith('.')) {
      return formattedInteger + ',';
    }
      
    return formattedInteger + decimalPart;
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={formatDisplayValue(value)}
      onChange={handleChange}
      {...props}
    />
  );
}
