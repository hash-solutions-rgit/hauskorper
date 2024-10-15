"use client";

import React, { useState } from "react";
import { api } from "~admin/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@vapestation/ui/card";
import { Toggle } from "@vapestation/ui/toggle";
import { Eye, EyeOff } from "lucide-react";

type Props = { id: string };

function ProductSchema({ id }: Props) {
  // local state
  const [showSchema, setShowSchema] = useState<boolean>(false);

  // server interaction
  const { data: productSchema } = api.product.getProductSchemaCode.useQuery(id);

  const Icon = showSchema ? Eye : EyeOff;

  return (
    <Card className="">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          Product Schema
          <Toggle
            aria-label="Toggle show schema"
            pressed={showSchema}
            onPressedChange={setShowSchema}
          >
            <Icon className="h-4 w-4" />
          </Toggle>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-prose">
          {showSchema && <pre>{JSON.stringify(productSchema, null, 2)}</pre>}
        </div>
      </CardContent>
    </Card>
  );
}
export default ProductSchema;
