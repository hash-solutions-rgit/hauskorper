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
import { Checkbox } from "@vapestation/ui/checkbox";
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

function Inventory({ addProductForm }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <FormField
            control={addProductForm.control}
            name="inventory.quantity"
            render={({ field }) => (
              <FormItem className="grid gap-3">
                <FormLabel>Quantity *</FormLabel>
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
          <FormField
            control={addProductForm.control}
            name="inventory.lowStockAlert"
            render={({ field }) => (
              <FormItem className="grid gap-3">
                <FormLabel>Low stock alert *</FormLabel>
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
          <FormField
            control={addProductForm.control}
            name="inventory.limitOneItemPerOrder"
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
                    Limit one item per order
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={addProductForm.control}
            name="inventory.allowBackOrder"
            render={({ field }) => (
              <FormItem className="grid gap-3">
                <FormLabel>Allow Backorder *</FormLabel>
                <Select
                  onValueChange={(value) => {
                    value && field.onChange(value);
                  }}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={$Enums.BackOrder.ALLOW}>
                      Allow
                    </SelectItem>
                    <SelectItem value={$Enums.BackOrder.DENY}>Deny</SelectItem>
                    <SelectItem value={$Enums.BackOrder.NOTIFY}>
                      Allow, but notify Customer
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default Inventory;
