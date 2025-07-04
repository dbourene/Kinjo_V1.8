import React from "react";
import { Card, CardContent } from "../../components/ui/card";

export const KinjoLogo = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-[500px] aspect-square">
        <Card className="relative w-full h-full bg-[#92c55e] rounded-[43px] border-[0.5px] border-solid border-black shadow-[7px_6px_18.1px_3px_#00000040]">
          <CardContent className="p-0 flex items-center justify-center h-full">
            <img
              className="w-[85%] h-auto"
              alt="Kinjo Logo"
              src={import.meta.env.BASE_URL + "mask-group.png"}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};