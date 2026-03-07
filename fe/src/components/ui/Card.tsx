import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className = "" }: CardProps) => {
  return (
    <div className={`bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
};
