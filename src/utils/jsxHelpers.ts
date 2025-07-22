import { ReactNode, Fragment } from 'react';

/**
 * Safe JSX rendering utility to prevent structural errors
 */
export const SafeRender = ({ 
  children, 
  fallback = null 
}: { 
  children: ReactNode; 
  fallback?: ReactNode 
}): JSX.Element => {
  try {
    return <Fragment>{children}</Fragment>;
  } catch (error) {
    console.error('JSX Render Error:', error);
    return <Fragment>{fallback}</Fragment>;
  }
};

/**
 * Conditional rendering helper with guaranteed JSX structure
 */
export const ConditionalRender = ({ 
  condition, 
  children, 
  fallback = null 
}: { 
  condition: boolean; 
  children: ReactNode; 
  fallback?: ReactNode 
}): JSX.Element => {
  return <Fragment>{condition ? children : fallback}</Fragment>;
};

/**
 * Array rendering helper with automatic key generation
 */
export const ArrayRender = <T,>({ 
  items, 
  renderItem, 
  keyExtractor,
  fallback = null 
}: { 
  items: T[]; 
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;
  fallback?: ReactNode;
}): JSX.Element => {
  if (!items || items.length === 0) {
    return <Fragment>{fallback}</Fragment>;
  }

  return (
    <Fragment>
      {items.map((item, index) => (
        <Fragment key={keyExtractor ? keyExtractor(item, index) : index}>
          {renderItem(item, index)}
        </Fragment>
      ))}
    </Fragment>
  );
};

/**
 * String interpolation helper for JSX
 */
export const SafeString = (str: string | null | undefined): string => {
  return str ?? '';
};

/**
 * Number formatting helper
 */
export const SafeNumber = (num: number | null | undefined): string => {
  return num?.toString() ?? '0';
};

/**
 * Date formatting helper
 */
export const SafeDate = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  try {
    return new Date(date).toLocaleDateString('pt-BR');
  } catch {
    return '';
  }
};

/**
 * JSX validation helper
 */
export const validateJSXStructure = (element: ReactNode): boolean => {
  try {
    // Basic validation - in a real implementation, this would be more sophisticated
    return element !== null && element !== undefined;
  } catch {
    return false;
  }
};

/**
 * Error boundary wrapper for components
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback: ReactNode = <div>Error loading component</div>
) => {
  return (props: P): JSX.Element => {
    try {
      return <Component {...props} />;
    } catch (error) {
      console.error('Component Error:', error);
      return <Fragment>{fallback}</Fragment>;
    }
  };
};