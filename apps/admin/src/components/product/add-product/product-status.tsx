import { Card, CardContent, CardHeader, CardTitle } from "@vapestation/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@vapestation/ui/form";
import { type CreateProductFormValues } from "common/schema/product";
import { UseFormReturn } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vapestation/ui/select";
import { $Enums } from "@vapestation/database";

type Props = {
  addProductForm: UseFormReturn<CreateProductFormValues>;
};

function ProductStatus({ addProductForm }: Props) {
  console.log(addProductForm.getValues("status"));
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Status</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={addProductForm.control}
          name="status"
          render={({ field }) => (
            <FormItem className="grid gap-3">
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={(value) => {
                  value && field.onChange(value);
                }}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={$Enums.ProductStatus.DRAFT}>
                    Draft
                  </SelectItem>
                  <SelectItem value={$Enums.ProductStatus.PUBLISHED}>
                    Published
                  </SelectItem>
                  <SelectItem value={$Enums.ProductStatus.ARCHIVED}>
                    Archived
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

export default ProductStatus;
