import React from 'react';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card'
function TCard({title, children}: {title: string, children: React.ReactNode}) {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
      </Card>
    </div>
  );
}

export default TCard;