import React, { type ChangeEvent, useState } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@vapestation/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@vapestation/ui/card";
import { Input } from "@vapestation/ui/input";
import { Button } from "@vapestation/ui/button";
import { Label } from "@vapestation/ui/label";
import { Progress } from "@vapestation/ui/progress";
import { type UseFormReturn } from "react-hook-form";
import { type CreateBrandFormValues } from "common/schema/brand";
import { imageFullPath } from "common";

type Props = {
  addBrandForm: UseFormReturn<CreateBrandFormValues, any, undefined>;
};

function BrandImage({ addBrandForm }: Props) {
  // local state

  // image progress bar
  const [imageProgress, setImageProgress] = useState(0);

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
    formData.append("folder", "brands");
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
      addBrandForm.setValue("image", result.fileUrl);
      setImageProgress(100);
    } else {
      setImageProgressError(new Error("Failed to upload image"));
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Brand Images</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={addBrandForm.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormControl className="grid gap-2">
                <>
                  {addBrandForm.getValues("image") ? (
                    <div className="flex flex-col gap-y-2">
                      <img
                        alt="Product image"
                        src={`${imageFullPath(addBrandForm.getValues("image"))}`}
                        className="h-60 w-full rounded-lg object-contain"
                        loading="lazy"
                      />
                      <Button
                        size="sm"
                        variant={"destructive"}
                        onClick={() => {
                          addBrandForm.setValue("image", "");
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

export default BrandImage;
