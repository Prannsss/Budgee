"use client";

import Link from "next/link";
import { ArrowLeft, Plus, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Category } from "@/lib/types";
import { useAuth } from "@/contexts/auth-context";
import { TransactionService } from "@/lib/storage-service";

// Sample categories data - now empty, users will create their own
const initialExpenseCategories: Category[] = [];

const initialIncomeCategories: Category[] = [];

export default function CategoriesPage() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedType, setSelectedType] = useState<"expense" | "income">(
    "expense"
  );
  const [activeTab, setActiveTab] = useState("expenses");

  // Prevent background scroll when the drawer is open on mobile
  useEffect(() => {
    if (!isMobile) return;
    if (isAddModalOpen) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }
  }, [isMobile, isAddModalOpen]);

  // Load user categories
  useEffect(() => {
    if (!user?.id) return;

    const loadCategories = async () => {
      try {
        console.log('[Categories Page] Loading categories for user:', user.id);
        
        // Ensure default categories are initialized
        await TransactionService.initializeDefaultCategories(user.id);

        const userCategories = await TransactionService.getCategories(user.id);
        console.log('[Categories Page] Fetched categories:', userCategories);
        
        if (!Array.isArray(userCategories)) {
          console.warn('[Categories Page] Categories is not an array:', userCategories);
          setExpenseCategories([]);
          setIncomeCategories([]);
          return;
        }
        
        const expenseCategories = userCategories.filter(
          (cat) => cat.type === "Expense"
        );
        const incomeCategories = userCategories.filter(
          (cat) => cat.type === "Income"
        );

        console.log('[Categories Page] Expense categories:', expenseCategories);
        console.log('[Categories Page] Income categories:', incomeCategories);

        setExpenseCategories(expenseCategories);
        setIncomeCategories(incomeCategories);
      } catch (error) {
        console.error('[Categories Page] Error loading categories:', error);
        setExpenseCategories([]);
        setIncomeCategories([]);
      }
    };

    loadCategories();
  }, [user?.id]);

  const handleAddCategory = useCallback(async () => {
    if (!newCategoryName.trim() || !user?.id) return;

    // Add category using storage service
    const newCategory = await TransactionService.addCategory(
      user.id,
      newCategoryName.trim(),
      selectedType === "expense" ? "Expense" : "Income"
    );

    // Update local state only if category was created successfully
    if (newCategory) {
      if (selectedType === "expense") {
        setExpenseCategories((prev) => [...prev, newCategory]);
      } else {
        setIncomeCategories((prev) => [...prev, newCategory]);
      }
    }

    // Reset form
    setNewCategoryName("");
    setIsAddModalOpen(false);
  }, [newCategoryName, user?.id, selectedType]);

  const handleDeleteCategory = async (
    categoryId: string,
    type: "expense" | "income"
  ) => {
    if (!user?.id) return;

    // Delete category using storage service
    const success = await TransactionService.deleteCategory(user.id, categoryId);

    // Update local state only if deletion was successful
    if (success) {
      if (type === "expense") {
        setExpenseCategories((prev) =>
          prev.filter((cat) => cat.id !== categoryId)
        );
      } else {
        setIncomeCategories((prev) =>
          prev.filter((cat) => cat.id !== categoryId)
        );
      }
    }
  };

  const openAddModal = (type: "expense" | "income") => {
    setSelectedType(type);
    setIsAddModalOpen(true);
  };

  const CategoryCard = ({
    category,
    onDelete,
  }: {
    category: Category;
    onDelete: () => void;
  }) => (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tag className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="font-medium">{category.name}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );

  const AddCategoryModal = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="categoryName">Category Name</Label>
        <Input
          id="categoryName"
          placeholder="Enter category name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          autoFocus={!isMobile}
          autoComplete="off"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="categoryType">Category Type</Label>
        <Select
          value={selectedType}
          onValueChange={(value: "expense" | "income") =>
            setSelectedType(value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="income">Income</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={handleAddCategory}
        className="w-full"
        disabled={!newCategoryName.trim()}
      >
        Save Category
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 flex items-center gap-4 px-4 py-4 border-b bg-background/95 backdrop-blur-sm">
        <Link href="/dashboard/profile">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold">Categories</h1>
      </header>

      {/* Main Content */}
      <div className="pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Sticky Tabs */}
          <div className="sticky top-16 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="expenses" className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Expense Categories</h2>
              {!isMobile && (
                <Button
                  onClick={() => openAddModal("expense")}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Category
                </Button>
              )}
            </div>
            <div className="grid gap-3">
              {expenseCategories.length > 0 ? (
                expenseCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onDelete={() =>
                      handleDeleteCategory(category.id, "expense")
                    }
                  />
                ))
              ) : (
                <Card className="p-8 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <Tag className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">No expense categories</h3>
                      <p className="text-sm text-muted-foreground">
                        Create your first expense category to start organizing
                        your spending.
                      </p>
                    </div>
                    <Button
                      onClick={() => openAddModal("expense")}
                      size="sm"
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Category
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="income" className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Income Categories</h2>
              {!isMobile && (
                <Button
                  onClick={() => openAddModal("income")}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Category
                </Button>
              )}
            </div>
            <div className="grid gap-3">
              {incomeCategories.length > 0 ? (
                incomeCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onDelete={() => handleDeleteCategory(category.id, "income")}
                  />
                ))
              ) : (
                <Card className="p-8 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <Tag className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">No income categories</h3>
                      <p className="text-sm text-muted-foreground">
                        Create your first income category to start tracking your
                        earnings.
                      </p>
                    </div>
                    <Button
                      onClick={() => openAddModal("income")}
                      size="sm"
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Category
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Mobile Floating Action Button */}
      {isMobile && (
        <Button
          onClick={() =>
            openAddModal(activeTab === "expenses" ? "expense" : "income")
          }
          size="icon"
          className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {/* Add Category Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="pt-4">
            <AddCategoryModal />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
