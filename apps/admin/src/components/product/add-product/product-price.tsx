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
import { Input } from "@vapestation/ui/input";

type Props = {
  addProductForm: UseFormReturn<CreateProductFormValues>;
};

function ProductPrice({ addProductForm }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Price</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-x-4">
          <div className="flex grow flex-col gap-y-4">
            <FormField
              control={addProductForm.control}
              name="costPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost Price</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      onChange={(event) => {
                        field.onChange(event.target.valueAsNumber);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={addProductForm.control}
              name="sellingPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selling Price</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      onChange={(event) => {
                        field.onChange(event.target.valueAsNumber);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={addProductForm.control}
              name="discountPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount Price</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      onChange={(event) => {
                        field.onChange(event.target.valueAsNumber);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProductPrice;
