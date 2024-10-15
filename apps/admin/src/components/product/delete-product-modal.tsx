"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@vapestation/ui/alert-dialog";
import React from "react";
import { buttonVariants } from "@vapestation/ui/button";
import { useProductStore } from "~admin/store";
import { api } from "~admin/trpc/react";

function DeleteProductModal() {
  // hooks
  const { deleteProductModal, setDeleteProductModal, selectedProductId } =
    useProductStore();

  // server utils
  const utils = api.useUtils();

  // server interaction
  const { mutateAsync: deleteProduct, isPending } =
    api.product.deleteProduct.useMutation({
      onSuccess() {
        setDeleteProductModal(false);
        utils.product.getAllProducts.invalidate();
      },
    });

  const handleDeleteProduct = async () => {
    await deleteProduct(selectedProductId);
  };

  return (
    <AlertDialog open={deleteProductModal} onOpenChange={setDeleteProductModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete product
            and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({
              variant: "destructive",
            })}
            disabled={isPending}
            onClick={handleDeleteProduct}
          >
            {isPending ? <>"Deleting..."</> : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteProductModal;
