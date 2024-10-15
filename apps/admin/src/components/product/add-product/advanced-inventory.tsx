import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@vapestation/ui/card";
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
import { Checkbox } from "@vapestation/ui/checkbox";

type Props = {
  addProductForm: UseFormReturn<CreateProductFormValues>;
};

function AdvancedInventory({ addProductForm }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <FormField
            control={addProductForm.control}
            name="blockGuest"
            render={({ field }) => (
              <FormItem className="grid gap-3">
                <div className="flex items-center gap-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer">
                    Block Guest purchase *
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={addProductForm.control}
            name="limitPerUser"
            render={({ field }) => (
              <FormItem className="grid gap-3">
                <FormLabel>Limit per user *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    className="w-full"
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
      </CardContent>
    </Card>
  );
}

export default AdvancedInventory;
