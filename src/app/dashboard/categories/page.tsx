"use client";

import Link from "next/link";
import { ArrowLeft, Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Category } from "@/lib/types";

// Sample categories data
const initialExpenseCategories: Category[] = [
  { id: 1, name: "Food & Dining", color: "#FF6B6B" },
  { id: 2, name: "Transportation", color: "#4ECDC4" },
  { id: 3, name: "Shopping", color: "#45B7D1" },
  { id: 4, name: "Entertainment", color: "#96CEB4" },
  { id: 5, name: "Bills & Utilities", color: "#FFEAA7" },
  { id: 6, name: "Healthcare", color: "#DDA0DD" },
];

const initialIncomeCategories: Category[] = [
  { id: 1, name: "Salary", color: "#00B894" },
  { id: 2, name: "Freelance", color: "#6C5CE7" },
  { id: 3, name: "Investments", color: "#A29BFE" },
  { id: 4, name: "Business", color: "#FD79A8" },
];

export default function CategoriesPage() {
  const isMobile = useIsMobile();
  const [expenseCategories, setExpenseCategories] = useState<Category[]>(initialExpenseCategories);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>(initialIncomeCategories);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedType, setSelectedType] = useState<"expense" | "income">("expense");
  const [activeTab, setActiveTab] = useState("expenses");

  const getRandomColor = (): string => {
    const colors = [
      "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", 
      "#DDA0DD", "#00B894", "#6C5CE7", "#A29BFE", "#FD79A8"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;

    const newCategory: Category = {
      id: Date.now(),
      name: newCategoryName.trim(),
      color: getRandomColor(),
    };

    if (selectedType === "expense") {
      setExpenseCategories(prev => [...prev, newCategory]);
    } else {
      setIncomeCategories(prev => [...prev, newCategory]);
    }

    // Reset form
    setNewCategoryName("");
    setIsAddModalOpen(false);
  };

  const openAddModal = (type: "expense" | "income") => {
    setSelectedType(type);
    setIsAddModalOpen(true);
  };

  const CategoryCard = ({ category }: { category: any }) => (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <Tag className="w-4 h-4 text-primary flex-shrink-0" />
        <span className="font-medium">{category.name}</span>
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
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="categoryType">Category Type</Label>
        <Select value={selectedType} onValueChange={(value: "expense" | "income") => setSelectedType(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select category type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="income">Income</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleAddCategory} className="w-full" disabled={!newCategoryName.trim()}>
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
              {expenseCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
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
              {incomeCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Mobile Floating Action Button */}
      {isMobile && (
        <Button
          onClick={() => openAddModal(activeTab === "expenses" ? "expense" : "income")}
          size="icon"
          className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {/* Add Category Modal/Drawer */}
      {isMobile ? (
        <Drawer open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Add New Category</DrawerTitle>
            </DrawerHeader>
            <div className="p-4">
              <AddCategoryModal />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
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
      )}
    </div>
  );
}
