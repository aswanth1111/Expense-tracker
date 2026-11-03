import React from 'react';
import {
  Smartphone,
  Banknote,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { PaymentMethod } from '../types/expense';

interface PaymentIconProps extends LucideProps {
  method: PaymentMethod;
}

export const PaymentIcon: React.FC<PaymentIconProps> = ({ method, ...props }) => {
  switch (method) {
    case 'cash':
      return <Banknote {...props} />;
    case 'upi_kotak':
    case 'upi_union':
    default:
      return <Smartphone {...props} />;
  }
};
