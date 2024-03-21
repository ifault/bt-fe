import React from 'react';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card'
import {BeatLoader} from "react-spinners";
function TCard({title, children, loading}: {title: string, children: React.ReactNode, loading: boolean}) {
  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
          {loading && <CardFooter className="flex justify-center">
            <BeatLoader color="#36d7b7" />
          </CardFooter>}
      </Card>
    </div>
  );
}

export default TCard;