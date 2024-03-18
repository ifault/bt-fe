import React from 'react';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card'
function TCard({title, children, loading}: {title: string, children: React.ReactNode, loading: boolean}) {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
          {loading && <CardFooter className="flex justify-center">
           加载中。。。
          </CardFooter>}
      </Card>
    </div>
  );
}

export default TCard;