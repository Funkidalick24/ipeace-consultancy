import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, HelpCircle, ChevronUp, ChevronDown } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface FAQManagerProps {
  faq: FAQItem[];
  onCreate: (item: Omit<FAQItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdate: (id: string, item: Partial<FAQItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function FAQManager({
  faq,
  onCreate,
  onUpdate,
  onDelete
}: FAQManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FAQItem | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    published: false,
    order: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: '',
      published: false,
      order: 0
    });
    setEditingItem(null);
  };

  const handleOpenDialog = (item?: FAQItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        question: item.question,
        answer: item.answer,
        category: item.category || '',
        published: item.published,
        order: item.order
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.question.trim() || !formData.answer.trim()) {
      alert('Please fill in question and answer');
      return;
    }

    setIsLoading(true);
    try {
      const itemData = {
        question: formData.question,
        answer: formData.answer,
        category: formData.category || undefined,
        published: formData.published,
        order: formData.order
      };

      if (editingItem) {
        await onUpdate(editingItem.id, itemData);
      } else {
        await onCreate(itemData);
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save FAQ item:', error);
      alert('Failed to save FAQ item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this FAQ item?')) {
      try {
        await onDelete(id);
      } catch (error) {
        console.error('Failed to delete FAQ item:', error);
        alert('Failed to delete FAQ item. Please try again.');
      }
    }
  };

  const handleMoveUp = async (item: FAQItem) => {
    if (item.order > 0) {
      await onUpdate(item.id, { order: item.order - 1 });
    }
  };

  const handleMoveDown = async (item: FAQItem) => {
    await onUpdate(item.id, { order: item.order + 1 });
  };

  const sortedFaq = [...faq].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">FAQ Management</h2>
          <p className="text-muted-foreground">Manage frequently asked questions and answers</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add FAQ Item
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Answer</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedFaq.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No FAQ items yet. Click "Add FAQ Item" to create your first question.
                  </TableCell>
                </TableRow>
              ) : (
                sortedFaq.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">{item.order}</span>
                        <div className="flex flex-col ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveUp(item)}
                            disabled={item.order === 0}
                            className="h-4 w-4 p-0"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveDown(item)}
                            className="h-4 w-4 p-0"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate font-medium">
                        {item.question}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-sm text-muted-foreground">
                        {item.answer}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.category ? (
                        <Badge variant="outline">{item.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.published ? 'default' : 'secondary'}>
                        {item.published ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit FAQ Item' : 'Add New FAQ Item'}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the FAQ question and answer' : 'Create a new frequently asked question'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="question">Question *</Label>
              <Input
                id="question"
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                placeholder="What is your question?"
                required
              />
            </div>

            <div>
              <Label htmlFor="answer">Answer *</Label>
              <Textarea
                id="answer"
                value={formData.answer}
                onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                placeholder="Provide a detailed answer"
                rows={6}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., General, Pricing, Support"
                />
              </div>
              <div>
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  min="0"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Lower numbers appear first
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
              />
              <Label htmlFor="published">Publish FAQ item</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}