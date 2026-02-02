import { useState } from "react";
import { Wallet, Plus, Receipt, TrendingDown } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInvoices, useExpenses } from "@/hooks/useFinance";
import { InvoiceList } from "@/components/finance/InvoiceList";
import { InvoiceDialog } from "@/components/finance/InvoiceDialog";
import { ExpenseList } from "@/components/finance/ExpenseList";
import { ExpenseDialog } from "@/components/finance/ExpenseDialog";

export default function Finance() {
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("invoices");
  const { invoices, isLoading: invoicesLoading } = useInvoices();
  const { expenses, isLoading: expensesLoading } = useExpenses();

  return (
    <div>
      <PageHeader
        title="Finance & Settlements"
        description="Manage billing, invoicing, and financial reports."
        icon={Wallet}
        action={{
          label: activeTab === "invoices" ? "New Invoice" : "New Expense",
          onClick: () => activeTab === "invoices" ? setShowInvoiceDialog(true) : setShowExpenseDialog(true),
        }}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Expenses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <InvoiceList invoices={invoices} isLoading={invoicesLoading} />
        </TabsContent>

        <TabsContent value="expenses">
          <ExpenseList expenses={expenses} isLoading={expensesLoading} />
        </TabsContent>
      </Tabs>

      <InvoiceDialog
        open={showInvoiceDialog}
        onOpenChange={setShowInvoiceDialog}
      />
      <ExpenseDialog
        open={showExpenseDialog}
        onOpenChange={setShowExpenseDialog}
      />
    </div>
  );
}
