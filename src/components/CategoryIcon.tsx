import React from 'react';
import {
  Utensils,
  ShoppingCart,
  Car,
  Home,
  Zap,
  Film,
  ShoppingBag,
  HeartPulse,
  GraduationCap,
  Plane,
  Receipt,
  MoreHorizontal,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { CategoryId } from '../types/expense';

interface CategoryIconProps extends LucideProps {
  category: CategoryId;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, ...props }) => {
  switch (category) {
    case 'food':
      return <Utensils {...props} />;
    case 'groceries':
      return <ShoppingCart {...props} />;
    case 'transport':
      return <Car {...props} />;
    case 'housing':
      return <Home {...props} />;
    case 'utilities':
      return <Zap {...props} />;
    case 'entertainment':
      return <Film {...props} />;
    case 'shopping':
      return <ShoppingBag {...props} />;
    case 'health':
      return <HeartPulse {...props} />;
    case 'education':
      return <GraduationCap {...props} />;
    case 'travel':
      return <Plane {...props} />;
    case 'bills':
      return <Receipt {...props} />;
    case 'other':
    default:
      return <MoreHorizontal {...props} />;
  }
};
