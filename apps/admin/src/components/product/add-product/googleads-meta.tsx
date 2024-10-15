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

type Props = {
  addProductForm: UseFormReturn<CreateProductFormValues>;
};

function GoogleadsMeta({ addProductForm }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Ads Meta</CardTitle>
        <CardDescription>This is required for the google ads</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <FormField
            control={addProductForm.control}
            name="googleAdsMeta.brand"
            render={({ field }) => (
              <FormItem className="grid gap-3">
                <FormLabel>Brand *</FormLabel>
                <FormControl>
                  <Input {...field} type="text" className="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={addProductForm.control}
            name="googleAdsMeta.gtin"
            render={({ field }) => (
              <FormItem className="grid gap-3">
                <FormLabel>GTIN *</FormLabel>
                <FormControl>
                  <Input {...field} type="text" className="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={addProductForm.control}
            name="googleAdsMeta.pipCode"
            render={({ field }) => (
              <FormItem className="grid gap-3">
                <FormLabel>PipCode</FormLabel>
                <FormControl>
                  <Input {...field} type="text" className="w-full" />
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

export default GoogleadsMeta;
