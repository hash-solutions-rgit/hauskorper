"use client";

import React from "react";
import { Button } from "~ui/ui/button";
import type { Order, OrderStatus } from "@vapestation/database";
import { api } from "~admin/trpc/react";

type Props = { order: Order };
type Include<T, U> = T extends U ? T : never;

function ApprovalButtons({ order }: Props) {
  const utils = api.useUtils();
  const { mutateAsync: orderApproval, isPending } =
    api.order.updateOrder.useMutation({
      onSuccess() {
        utils.order.getOrder.invalidate(order.id);
      },
    });

  // handler
  const handleOrderApproval = async (
    status: Include<OrderStatus, "APPROVED" | "REJECT">,
  ) => {
    orderApproval({
      id: order.id,
      status,
    });
  };

  return (
    <div className="mr-3 flex items-center justify-end gap-4">
      <Button
        className="bg-green-500 hover:bg-green-700"
        onClick={() => {
          handleOrderApproval("APPROVED");
        }}
        size={"sm"}
        disabled={isPending}
        loading={isPending}
      >
        Approved
      </Button>
      <Button
        className="bg-red-500 hover:bg-red-700"
        onClick={() => {
          handleOrderApproval("REJECT");
        }}
        size={"sm"}
        disabled={isPending}
        loading={isPending}
      >
        Reject
      </Button>
    </div>
  );
}

export default ApprovalButtons;
