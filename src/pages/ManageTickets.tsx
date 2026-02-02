import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  name: string;
  type: string;
  price: number;
  quantity: number | null;
  sold: number;
  description: string | null;
}

export default function ManageTickets() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'paid',
    price: '0',
    quantity: '',
    description: '',
  });

  useEffect(() => {
    loadTickets();
  }, [id]);

  const loadTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('app_92ee3_tickets')
        .select('*')
        .eq('event_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTicket) {
        const { error } = await supabase
          .from('app_92ee3_tickets')
          .update({
            name: formData.name,
            type: formData.type,
            price: parseFloat(formData.price),
            quantity: formData.quantity ? parseInt(formData.quantity) : null,
            description: formData.description,
          })
          .eq('id', editingTicket.id);

        if (error) throw error;
        toast.success('Ticket updated successfully!');
      } else {
        const { error } = await supabase.from('app_92ee3_tickets').insert([
          {
            event_id: id,
            name: formData.name,
            type: formData.type,
            price: parseFloat(formData.price),
            quantity: formData.quantity ? parseInt(formData.quantity) : null,
            description: formData.description,
          },
        ]);

        if (error) throw error;
        toast.success('Ticket created successfully!');
      }

      setDialogOpen(false);
      resetForm();
      loadTickets();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save ticket';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setFormData({
      name: ticket.name,
      type: ticket.type,
      price: ticket.price.toString(),
      quantity: ticket.quantity?.toString() || '',
      description: ticket.description || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;

    try {
      const { error } = await supabase.from('app_92ee3_tickets').delete().eq('id', ticketId);

      if (error) throw error;
      toast.success('Ticket deleted successfully!');
      loadTickets();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete ticket';
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'paid',
      price: '0',
      quantity: '',
      description: '',
    });
    setEditingTicket(null);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(`/events/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Event
          </Button>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Ticket
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTicket ? 'Edit Ticket' : 'Create New Ticket'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ticket Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., General Admission"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Ticket Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="donation">Donation</SelectItem>
                      <SelectItem value="tiered">Tiered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="Unlimited"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ticket description"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">{editingTicket ? 'Update' : 'Create'} Ticket</Button>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Types</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 text-center py-8">Loading tickets...</p>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No tickets created yet</p>
                <Button onClick={() => setDialogOpen(true)}>Create Your First Ticket</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{ticket.name}</h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            ticket.type === 'free'
                              ? 'bg-green-100 text-green-700'
                              : ticket.type === 'paid'
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {ticket.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span className="font-medium">${ticket.price}</span>
                        <span>
                          {ticket.sold} / {ticket.quantity || '∞'} sold
                        </span>
                      </div>
                      {ticket.description && <p className="text-sm text-gray-600 mt-2">{ticket.description}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(ticket)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(ticket.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}