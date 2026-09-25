import { Children, Suspense } from 'react';

export default function HydrationSplit({ children }) {
  return Children.map(children, (child) => <Suspense>{child}</Suspense>);
}
