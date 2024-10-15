"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@vapestation/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@vapestation/ui/form";
import { type CreateProductFormValues } from "common/schema/product";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@vapestation/ui/input";
import { Label } from "@vapestation/ui/label";
import { Button } from "@vapestation/ui/button";
import { Progress } from "@vapestation/ui/progress";
import { imageFullPath } from "common";
import { ChangeEvent, useState } from "react";

type Props = {
  addProductForm: UseFormReturn<CreateProductFormValues>;
};

function ProductImage({ addProductForm }: Props) {
  // image progress bar
  const [imageProgress, setImageProgress] = useState<number>(0);
  const [imageProgressError, setImageProgressError] = useState<Error | null>(
    null,
  );

  // file upload handler
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    setImageProgress(10);
    if (!event?.target.files || !event?.target?.files.length) {
      setImageProgress(0);
      return;
    }
    const selectedFile = event.target.files[0];
    setImageProgress(20);
    if (!selectedFile) {
      setImageProgress(0);
      return;
    }

    const formData = new FormData();
    setImageProgress(30);
    formData.append("file", selectedFile);
    formData.append("folder", "products");
    setImageProgress(50);
    const response = await fetch("/api/upload/image", {
      method: "POST",
      body: formData,
    });
    setImageProgress(90);

    const result: {
      fileUrl: string;
    } = await response.json();

    if (response.ok) {
      addProductForm.setValue("image", result.fileUrl);
      setImageProgress(100);
    } else {
      setImageProgressError(new Error("Failed to upload image"));
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Product Images</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={addProductForm.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormControl className="grid gap-2">
                <>
                  {addProductForm.getValues("image") ? (
                    <div className="flex flex-col gap-y-2">
                      <img
                        alt="Product image"
                        src={`${imageFullPath(addProductForm.getValues("image"))}`}
                        className="h-60 w-full rounded-lg object-contain"
                        loading="lazy"
                      />
                      <Button
                        size="sm"
                        variant={"destructive"}
                        onClick={() => {
                          addProductForm.setValue("image", "");
                          setImageProgress(0);
                        }}
                      >
                        change image
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      {!!imageProgress && !imageProgressError && (
                        <div className="flex flex-col gap-y-2">
                          <Progress value={imageProgress} className="w-full" />

                          <Label>Uploading...</Label>
                        </div>
                      )}
                    </>
                  )}

                  {imageProgressError && (
                    <Label>Error uploading, Please Try again</Label>
                  )}
                  <Input className="hidden" {...field} />
                </>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

export default ProductImage;
